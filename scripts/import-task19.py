#!/usr/bin/env python3
import html
import json
import re
import time
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup


BASE = "https://mathstart.ru"
PAGE = BASE + "/sources/FIPI_OGE_MATH/theorems"
API = BASE + "/api/analog/FIPI_OGE_MATH/theorems"
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "study" / "math" / "part-one"
DRAWINGS_OUT = OUT / "task19-drawings"
EXPECTED_TOTALS = [88, 63]


def fetch_bytes(url):
    request = urllib.request.Request(url, headers={"User-Agent": "OGE-Studio-Importer/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def fetch(url):
    return fetch_bytes(url).decode("utf-8")


def repair_text(value):
    if not isinstance(value, str):
        return value
    protected = {}
    chars = []
    for char in value:
        try:
            char.encode("cp1251")
            chars.append(char)
        except UnicodeEncodeError:
            token = f"__UNICODE_{len(protected)}__"
            protected[token] = char
            chars.append(token)
    candidate = "".join(chars)
    try:
        repaired = candidate.encode("cp1251").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return value
    for token, char in protected.items():
        repaired = repaired.replace(token, char)
    return repaired


def localize_drawings(task_html):
    DRAWINGS_OUT.mkdir(parents=True, exist_ok=True)

    def replace_source(match):
        source = match.group(1)
        relative = source.split("/theorems/", 1)[-1]
        safe_name = relative.replace("/", "-")
        target = DRAWINGS_OUT / safe_name
        if not target.exists():
            target.write_bytes(fetch_bytes(BASE + source))
        return f'src="task19-drawings/{safe_name}"'

    return re.sub(r'src="(/drawings/FIPI_OGE_MATH/theorems/[^"]+)"', replace_source, task_html)


def decode_answer(raw):
    raw = html.unescape(raw or '""')
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw.strip('"')


def make_item(prototype_id, number, internal_id, task_html, answer, answer_html="", answer_format="number"):
    return {
        "id": f"{prototype_id}.{number}",
        "internalId": internal_id,
        "taskHtml": localize_drawings(repair_text(task_html.strip())),
        "answer": answer,
        "answerHtml": repair_text(answer_html or ""),
        "format": answer_format or "number",
        "analogNumber": number,
    }


def collect():
    soup = BeautifulSoup(fetch(PAGE), "html.parser")
    bases = soup.select("article.problem")
    if len(bases) != 2:
        raise RuntimeError(f"Expected 2 prototypes, found {len(bases)}")

    result = []
    global_ids = set()
    for index, article in enumerate(bases, 1):
        prototype_id = f"19.{index}"
        base_id = article["data-internal-id"]
        parent_id = article["data-parent-id"]
        task = article.select_one(".problem-text")
        status = article.select_one(".answer-status")
        title_node = article.find_previous("h2", class_="subtopic-heading")
        title = title_node.get_text(" ", strip=True) if title_node else f"Прототип {prototype_id}"
        items = [make_item(
            prototype_id, 1, base_id, task.decode_contents(),
            decode_answer(status.get("data-answer")),
            answer_format=status.get("data-format", "number"),
        )]
        seen = {base_id}
        current = base_id
        while True:
            payload = json.loads(fetch(f"{API}/{parent_id}/{current}"))
            next_id = payload["internal_id"]
            if next_id == base_id or next_id in seen:
                break
            seen.add(next_id)
            items.append(make_item(
                prototype_id, len(items) + 1, next_id, payload["task_html"],
                payload["answer_value"], payload.get("answer_html", ""),
                payload.get("answer_format", "number"),
            ))
            current = next_id
            time.sleep(0.01)

        expected = EXPECTED_TOTALS[index - 1]
        if len(items) != expected:
            raise RuntimeError(f"{prototype_id}: expected {expected}, got {len(items)}")
        overlap = global_ids.intersection(seen)
        if overlap:
            raise RuntimeError(f"Duplicate IDs: {sorted(overlap)}")
        global_ids.update(seen)
        result.append({
            "id": prototype_id,
            "title": repair_text(title),
            "source": "MathStart / FIPI_OGE_MATH / theorems",
            "items": items,
        })
        print(f"{prototype_id}: {len(items)}")

    total = sum(len(row["items"]) for row in result)
    if total != 151:
        raise RuntimeError(f"Expected 151 tasks, collected {total}")
    return result


def write_data(rows):
    for path in OUT.glob("task19-data-*.js"):
        path.unlink()
    for index, row in enumerate(rows, 1):
        payload = json.dumps(row, ensure_ascii=False, separators=(",", ":"))
        text = "window.OgeTask19DataPrototypes = window.OgeTask19DataPrototypes || [];\n"
        text += f"window.OgeTask19DataPrototypes.push({payload});\n"
        (OUT / f"task19-data-{index:02d}.js").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    rows = collect()
    write_data(rows)
    print(f"Collected {sum(len(row['items']) for row in rows)} tasks in {len(rows)} prototypes.")
