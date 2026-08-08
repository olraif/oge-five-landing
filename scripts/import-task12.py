#!/usr/bin/env python3
import html, json, re, time, urllib.request
from pathlib import Path
from bs4 import BeautifulSoup

BASE = "https://mathstart.ru"
PAGE = BASE + "/sources/FIPI_OGE_MATH/formulas"
API = BASE + "/api/analog/FIPI_OGE_MATH/formulas"
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "study" / "math" / "part-one"
DRAWINGS_OUT = OUT / "task12-drawings"
EXPECTED_TOTALS = [8, 4, 20, 20, 18, 20, 20, 20, 22, 23, 7]

def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": "OGE-Studio-Importer/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()

def fetch(url):
    return fetch_bytes(url).decode("utf-8")

def repair_text(value):
    if not isinstance(value, str):
        return value
    try:
        repaired = value.encode("cp1251").decode("utf-8")
        return repaired
    except (UnicodeEncodeError, UnicodeDecodeError):
        return value
def localize_drawings(task_html):
    DRAWINGS_OUT.mkdir(parents=True, exist_ok=True)
    def replace_source(match):
        source = match.group(1)
        relative = source.split("/formulas/", 1)[-1]
        safe_name = relative.replace("/", "-")
        target = DRAWINGS_OUT / safe_name
        if not target.exists():
            target.write_bytes(fetch_bytes(BASE + source))
        return f'src="task12-drawings/{safe_name}"'
    return re.sub(r'src="(/drawings/FIPI_OGE_MATH/formulas/[^"]+)"', replace_source, task_html)

def decode_answer(raw):
    raw = html.unescape(raw or '""')
    try: return json.loads(raw)
    except json.JSONDecodeError: return raw.strip('"')

def make_item(pid, number, internal, task, answer, answer_html="", fmt="number"):
    return {
        "id": f"{pid}.{number}", "internalId": internal,
        "taskHtml": localize_drawings(repair_text(task.strip())), "answer": answer,
        "answerHtml": repair_text(answer_html or ""), "format": fmt or "number", "analogNumber": number,
    }

def collect():
    soup = BeautifulSoup(fetch(PAGE), "html.parser")
    bases = soup.select("article.problem")
    if len(bases) != 11:
        raise RuntimeError(f"Expected 11 prototypes, found {len(bases)}")
    result, global_ids = [], set()
    for index, article in enumerate(bases, 1):
        pid = f"12.{index}"
        base_id, parent_id = article["data-internal-id"], article["data-parent-id"]
        task = article.select_one(".problem-text")
        status = article.select_one(".answer-status")
        title_node = article.find_previous("h2", class_="subtopic-heading")
        title = title_node.get_text(" ", strip=True) if title_node else f"Прототип {pid}"
        items = [make_item(pid, 1, base_id, task.decode_contents(), decode_answer(status.get("data-answer")), fmt=status.get("data-format", "number"))]
        seen, current = {base_id}, base_id
        while True:
            payload = json.loads(fetch(f"{API}/{parent_id}/{current}"))
            next_id = payload["internal_id"]
            if next_id == base_id or next_id in seen: break
            seen.add(next_id)
            items.append(make_item(pid, len(items)+1, next_id, payload["task_html"], payload["answer_value"], payload.get("answer_html", ""), payload.get("answer_format", "number")))
            current = next_id
            time.sleep(0.01)
        if len(items) != EXPECTED_TOTALS[index-1]:
            raise RuntimeError(f"{pid}: expected {EXPECTED_TOTALS[index-1]}, got {len(items)}")
        overlap = global_ids.intersection(seen)
        if overlap: raise RuntimeError(f"Duplicate IDs: {sorted(overlap)}")
        global_ids.update(seen)
        result.append({"id": pid, "title": repair_text(title), "source": "MathStart / FIPI_OGE_MATH / formulas", "items": items})
        print(f"{pid}: {len(items)}")
    total = sum(len(row["items"]) for row in result)
    if total != 182: raise RuntimeError(f"Expected 182 tasks, collected {total}")
    return result

def write_data(rows):
    for path in OUT.glob("task12-data-*.js"): path.unlink()
    for index, row in enumerate(rows, 1):
        payload = json.dumps(row, ensure_ascii=False, separators=(",", ":"))
        text = "window.OgeTask12DataPrototypes = window.OgeTask12DataPrototypes || [];\n" + f"window.OgeTask12DataPrototypes.push({payload});\n"
        (OUT / f"task12-data-{index:02d}.js").write_text(text, encoding="utf-8")

if __name__ == "__main__":
    rows = collect(); write_data(rows)
    print(f"Collected {sum(len(row['items']) for row in rows)} tasks in {len(rows)} prototypes.")