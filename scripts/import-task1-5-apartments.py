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
OUTPUT = PART_ONE / "task1-5-apartments-data.js"


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
        return [str(item) for item in parsed]
    return str(parsed)


def localize_drawings(markup):
    ASSETS.mkdir(parents=True, exist_ok=True)
    for source in sorted(set(re.findall(
        r'/drawings/FIPI_OGE_MATH/real_math/(flats-\d+\.svg)', markup,
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
            "html": localize_drawings(inner_html(subtask.select_one(".subtask-text"))),
            "answer": parse_answer(status.get("data-answer")),
            "format": status.get("data-format", "number"),
        })
    return questions


def questions_from_payload(payload):
    def answer_value(subtask):
        value = subtask["answer_value"]
        return [str(item) for item in value] if isinstance(value, list) else str(value)

    return [{
        "number": index,
        "html": localize_drawings(subtask["task_html"].strip()),
        "answer": answer_value(subtask),
        "format": subtask.get("answer_format", "number"),
    } for index, subtask in enumerate(payload["subtasks"], 1)]


def make_analog(index, source_id, source_analog, task_html, questions):
    task_html = localize_drawings(task_html)
    if len(questions) != 5:
        raise RuntimeError(f"Expected five subtasks for {source_id}, found {len(questions)}")
    all_markup = task_html + "".join(question["html"] for question in questions)
    return {
        "id": f"apartments-6.1.{index}",
        "label": f"6.1.{index}",
        "sourceId": source_id,
        "sourceAnalog": source_analog,
        "taskHtml": task_html,
        "imagePath": next(iter(re.findall(
            r'src=["\']([^"\']*flats-\d+\.svg)', all_markup,
        )), ""),
        "answers": {str(question["number"]): question["answer"] for question in questions},
        "questions": questions,
    }


def collect():
    soup = BeautifulSoup(fetch_text(PAGE), "html.parser")
    heading = soup.find(id="subtopic-1ndash5_kvartiry")
    card = heading.find_next("article", class_="combined-problem-card")
    parent_id = card["data-parent-id"]
    base_id = card["data-internal-id"]
    analogs = [make_analog(
        1,
        base_id,
        0,
        inner_html(card.select_one(".problem-text")),
        questions_from_html(card),
    )]

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
        raise RuntimeError(f"Expected 8 apartment analogs, collected {len(analogs)}")
    return [{
        "id": "apartments-6.1",
        "number": "6.1",
        "title": "Квартиры",
        "analogs": analogs,
    }]


def write_data(prototypes):
    payload = json.dumps(prototypes, ensure_ascii=False, indent=2)
    text = (
        "(function initApartmentsData(root, factory) {\n"
        "  const data = factory();\n"
        "  if (typeof module === 'object' && module.exports) module.exports = data;\n"
        "  if (root) root.OgeTaskOneToFiveApartments = data;\n"
        "})(typeof globalThis !== 'undefined' ? globalThis : this, function createApartmentsData() {\n"
        f"  return {payload};\n"
        "});\n"
    )
    OUTPUT.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    rows = collect()
    write_data(rows)
    print(f"Collected {len(rows[0]['analogs'])} apartment analogs.")
