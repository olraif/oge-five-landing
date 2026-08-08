#!/usr/bin/env python3
import html, json, re, time, urllib.request
from pathlib import Path
from bs4 import BeautifulSoup

BASE = "https://mathstart.ru"
PAGE = BASE + "/sources/FIPI_OGE_MATH/plots_1"
API = BASE + "/api/analog/FIPI_OGE_MATH/plots_1"
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "study" / "math" / "part-one"
DRAWINGS_OUT = OUT / "task11-drawings"
EXPECTED_TOTALS = [14, 13, 10, 13, 14, 12, 6, 2, 15, 4]

def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": "OGE-Studio-Importer/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()

def fetch(url):
    return fetch_bytes(url).decode("utf-8")

def localize_drawings(task_html):
    DRAWINGS_OUT.mkdir(parents=True, exist_ok=True)
    def replace_source(match):
        source = match.group(1)
        relative = source.split("/plots_1/", 1)[-1]
        safe_name = relative.replace("/", "-")
        target = DRAWINGS_OUT / safe_name
        if not target.exists():
            target.write_bytes(fetch_bytes(BASE + source))
        return f'src="task11-drawings/{safe_name}"'
    return re.sub(r'src="(/drawings/FIPI_OGE_MATH/plots_1/[^"]+)"', replace_source, task_html)

def decode_answer(raw):
    raw = html.unescape(raw or '""')
    try: return json.loads(raw)
    except json.JSONDecodeError: return raw.strip('"')

def make_item(pid, number, internal, task, answer, answer_html="", fmt="number"):
    return {
        "id": f"{pid}.{number}", "internalId": internal,
        "taskHtml": localize_drawings(task.strip()), "answer": answer,
        "answerHtml": answer_html or "", "format": fmt or "number", "analogNumber": number,
    }

def collect():
    soup = BeautifulSoup(fetch(PAGE), "html.parser")
    bases = soup.select("article.problem")
    if len(bases) != 10:
        raise RuntimeError(f"Expected 10 prototypes, found {len(bases)}")
    result, global_ids = [], set()
    for index, article in enumerate(bases, 1):
        pid = f"11.{index}"
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
        result.append({"id": pid, "title": title, "source": "MathStart / FIPI_OGE_MATH / plots_1", "items": items})
        print(f"{pid}: {len(items)}")
    total = sum(len(row["items"]) for row in result)
    if total != 103: raise RuntimeError(f"Expected 103 tasks, collected {total}")
    return result

def write_data(rows):
    for path in OUT.glob("task11-data-*.js"): path.unlink()
    for index, row in enumerate(rows, 1):
        payload = json.dumps(row, ensure_ascii=False, separators=(",", ":"))
        text = "window.OgeTask11DataPrototypes = window.OgeTask11DataPrototypes || [];\n" + f"window.OgeTask11DataPrototypes.push({payload});\n"
        (OUT / f"task11-data-{index:02d}.js").write_text(text, encoding="utf-8")

if __name__ == "__main__":
    rows = collect(); write_data(rows)
    print(f"Collected {sum(len(row['items']) for row in rows)} tasks in {len(rows)} prototypes.")