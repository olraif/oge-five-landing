#!/usr/bin/env python3
import html
import json
import re
import time
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup


BASE = "https://mathstart.ru"
PAGE = BASE + "/sources/FIPI_OGE_MATH/real_math"
API = BASE + "/api/analog/FIPI_OGE_MATH/real_math"
ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"
ASSETS = PART_ONE / "assets" / "task1-5"
OUTPUT = PART_ONE / "task1-5-plots-data.js"


def fetch_bytes(url):
    request = urllib.request.Request(url, headers={"User-Agent": "OGE-Studio-Importer/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def fetch_text(url):
    return fetch_bytes(url).decode("utf-8")


def inner_html(node):
    return "".join(str(child) for child in node.contents).strip()


def parse_answer(value):
    raw = html.unescape(value or '""')
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = raw.strip('"')
    if isinstance(parsed, list):
        return str(parsed[0]) if parsed else ""
    return str(parsed)


def localize_drawings(markup):
    ASSETS.mkdir(parents=True, exist_ok=True)
    for source in sorted(set(re.findall(
        r'/drawings/FIPI_OGE_MATH/real_math/(homesteads-\d+\.svg)', markup,
    ))):
        target = ASSETS / source
        if not target.exists():
            target.write_bytes(fetch_bytes(f"{BASE}/drawings/FIPI_OGE_MATH/real_math/{source}"))
    return markup


def questions_from_html(card):
    questions = []
    for index, subtask in enumerate(card.select(".subtask-item"), 1):
        status = subtask.select_one(".answer-status")
        questions.append({
            "number": index,
            "html": inner_html(subtask.select_one(".subtask-text")),
            "answer": parse_answer(status.get("data-answer")),
            "format": status.get("data-format", "number"),
        })
    return questions


def questions_from_payload(payload):
    return [{
        "number": index,
        "html": subtask["task_html"].strip(),
        "answer": str(subtask["answer_value"]),
        "format": subtask.get("answer_format", "number"),
    } for index, subtask in enumerate(payload["subtasks"], 1)]


def make_analog(index, source_id, source_analog, task_html, questions):
    task_html = localize_drawings(task_html)
    if len(questions) != 5:
        raise RuntimeError(f"Expected five subtasks for {source_id}, found {len(questions)}")
    return {
        "id": f"plots-3.1.{index}",
        "label": f"3.1.{index}",
        "sourceId": source_id,
        "sourceAnalog": source_analog,
        "taskHtml": task_html,
        "imagePath": next(iter(re.findall(
            r'src=[\"\']([^\"\']*homesteads-\d+\.svg)', task_html,
        )), ""),
        "answers": {str(question["number"]): question["answer"] for question in questions},
        "questions": questions,
    }


def collect():
    soup = BeautifulSoup(fetch_text(PAGE), "html.parser")
    heading = soup.find(id="subtopic-1ndash5_uchastki")
    card = heading.find_next("article", class_="combined-problem-card")
    parent_id = card["data-parent-id"]
    base_id = card["data-internal-id"]
    base_task = inner_html(card.select_one(".problem-text"))
    analogs = [make_analog(1, base_id, 0, base_task, questions_from_html(card))]

    seen = {base_id}
    current_id = base_id
    while True:
        payload = json.loads(fetch_text(f"{API}/{parent_id}/{current_id}"))
        next_id = payload["internal_id"]
        if next_id in seen:
            break
        seen.add(next_id)
        analogs.append(make_analog(
            len(analogs) + 1,
            next_id,
            payload.get("analog_number", len(analogs)),
            payload["task_html"],
            questions_from_payload(payload),
        ))
        current_id = next_id
        time.sleep(0.02)

    if len(analogs) != 8:
        raise RuntimeError(f"Expected 8 plot analogs, collected {len(analogs)}")
    return [{
        "id": "plots-3.1",
        "number": "3.1",
        "title": "Участки",
        "analogs": analogs,
    }]


def write_data(prototypes):
    payload = json.dumps(prototypes, ensure_ascii=False, indent=2)
    text = (
        "(function initPlotsData(root, factory) {\n"
        "  const data = factory();\n"
        "  if (typeof module === 'object' && module.exports) module.exports = data;\n"
        "  if (root) root.OgeTaskOneToFivePlots = data;\n"
        "})(typeof globalThis !== 'undefined' ? globalThis : this, function createPlotsData() {\n"
        f"  return {payload};\n"
        "});\n"
    )
    OUTPUT.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    rows = collect()
    write_data(rows)
    print(f"Collected {len(rows[0]['analogs'])} plot analogs.")
