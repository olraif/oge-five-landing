#!/usr/bin/env python3
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
OUTPUT = PART_ONE / "task1-5-tariffs-data.js"


def fetch_bytes(url):
    request = urllib.request.Request(url, headers={"User-Agent": "OGE-Studio-Importer/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def fetch_text(url):
    return fetch_bytes(url).decode("utf-8")


def localize_drawings(markup):
    ASSETS.mkdir(parents=True, exist_ok=True)
    for source in sorted(set(re.findall(
        r'/drawings/FIPI_OGE_MATH/real_math/(tariffs-\d+\.svg)', markup,
    ))):
        target = ASSETS / source
        if not target.exists():
            target.write_bytes(fetch_bytes(f"{BASE}/drawings/FIPI_OGE_MATH/real_math/{source}"))
    return markup


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


def make_analog(index, payload):
    questions = questions_from_payload(payload)
    if len(questions) != 5:
        raise RuntimeError(
            f"Expected five subtasks for {payload['internal_id']}, found {len(questions)}"
        )
    task_html = localize_drawings(payload["task_html"])
    all_markup = task_html + "".join(question["html"] for question in questions)
    return {
        "id": f"tariffs-7.1.{index}",
        "label": f"7.1.{index}",
        "sourceId": payload["internal_id"],
        "sourceAnalog": payload.get("analog_number", index),
        "taskHtml": task_html,
        "imagePath": next(iter(re.findall(
            r'src=["\']([^"\']*tariffs-\d+\.svg)', all_markup,
        )), ""),
        "answers": {str(question["number"]): question["answer"] for question in questions},
        "questions": questions,
    }


def collect():
    soup = BeautifulSoup(fetch_text(PAGE), "html.parser")
    heading = soup.find(id="subtopic-1ndash5_tarify")
    card = heading.find_next("article", class_="combined-problem-card")
    parent_id = card["data-parent-id"]
    base_id = card["data-internal-id"]
    analogs = []
    seen = {base_id}
    current_id = base_id

    while True:
        payload = json.loads(fetch_text(f"{API}/{parent_id}/{current_id}"))
        next_id = payload["internal_id"]
        if next_id in seen:
            break
        seen.add(next_id)
        analogs.append(make_analog(len(analogs) + 1, payload))
        current_id = next_id
        time.sleep(0.02)

    if len(analogs) != 5:
        raise RuntimeError(f"Expected 5 tariff analogs, collected {len(analogs)}")
    return [{
        "id": "tariffs-7.1",
        "number": "7.1",
        "title": "Тарифы",
        "analogs": analogs,
    }]


def write_data(prototypes):
    payload = json.dumps(prototypes, ensure_ascii=False, indent=2)
    text = (
        "(function initTariffsData(root, factory) {\n"
        "  const data = factory();\n"
        "  if (typeof module === 'object' && module.exports) module.exports = data;\n"
        "  if (root) root.OgeTaskOneToFiveTariffs = data;\n"
        "})(typeof globalThis !== 'undefined' ? globalThis : this, function createTariffsData() {\n"
        f"  return {payload};\n"
        "});\n"
    )
    OUTPUT.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    rows = collect()
    write_data(rows)
    print(f"Collected {len(rows[0]['analogs'])} tariff analogs.")
