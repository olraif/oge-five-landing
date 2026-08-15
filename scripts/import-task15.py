#!/usr/bin/env python3
import html
import json
import re
import time
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup


BASE = "https://mathstart.ru"
PAGE = BASE + "/sources/FIPI_OGE_MATH/triangles"
API = BASE + "/api/analog/FIPI_OGE_MATH/triangles"
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "study" / "math" / "part-one"
DRAWINGS_OUT = OUT / "task15-drawings"
EXPECTED_TOTALS = [12, 10, 12, 12, 5, 12, 10, 10, 10, 12, 4, 4, 4, 4, 4, 4, 12, 12, 10, 10, 12, 12, 10, 11, 10, 10, 10, 10]


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
        relative = source.split("/triangles/", 1)[-1]
        safe_name = relative.replace("/", "-")
        target = DRAWINGS_OUT / safe_name
        if not target.exists():
            target.write_bytes(fetch_bytes(BASE + source))
        return f'src="task15-drawings/{safe_name}"'

    return re.sub(r'src="(/drawings/FIPI_OGE_MATH/triangles/[^"]+)"', replace_source, task_html)


def decode_answer(raw):
    raw = html.unescape(raw or '""')
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw.strip('"')


def make_item(prototype_id, number, internal_id, task_html, answer, answer_html="", answer_format="number"):
    task_html = task_html.replace(r"\tg", r"\operatorname{tg}")
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
    if len(bases) != 28:
        raise RuntimeError(f"Expected 28 prototypes, found {len(bases)}")

    result = []
    global_ids = set()
    for index, article in enumerate(bases, 1):
        prototype_id = f"15.{index}"
        base_id = article["data-internal-id"]
        parent_id = article["data-parent-id"]
        task = article.select_one(".problem-text")
        status = article.select_one(".answer-status")
        title_node = article.find_previous("h2", class_="subtopic-heading")
        title = title_node.get_text(" ", strip=True) if title_node else f"Прототип {prototype_id}"
        items = [make_item(
            prototype_id,
            1,
            base_id,
            task.decode_contents(),
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
                prototype_id,
                len(items) + 1,
                next_id,
                payload["task_html"],
                payload["answer_value"],
                payload.get("answer_html", ""),
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
            "source": "MathStart / FIPI_OGE_MATH / triangles",
            "items": items,
        })
        print(f"{prototype_id}: {len(items)}")

    total = sum(len(row["items"]) for row in result)
    if total != 258:
        raise RuntimeError(f"Expected 258 tasks, collected {total}")
    return result


def write_data(rows):
    for path in OUT.glob("task15-data-*.js"):
        path.unlink()
    for index, row in enumerate(rows, 1):
        payload = json.dumps(row, ensure_ascii=False, separators=(",", ":"))
        text = "window.OgeTask15DataPrototypes = window.OgeTask15DataPrototypes || [];\n"
        text += f"window.OgeTask15DataPrototypes.push({payload});\n"
        (OUT / f"task15-data-{index:02d}.js").write_text(text, encoding="utf-8")


def scaffold_trainer():
    html_text = (OUT / "task14.html").read_text(encoding="utf-8")
    html_text = html_text.replace("task14", "task15").replace("Task14", "Task15").replace("TASK14", "TASK15")
    html_text = html_text.replace("&#1079;&#1072;&#1076;&#1072;&#1085;&#1080;&#1103; 14", "&#1079;&#1072;&#1076;&#1072;&#1085;&#1080;&#1103; 15")
    html_text = html_text.replace("&#1047;&#1072;&#1076;&#1072;&#1085;&#1080;&#1077; 14", "&#1047;&#1072;&#1076;&#1072;&#1085;&#1080;&#1077; 15")
    html_text = re.sub(
        r'<p class="task15-lead">.*?</p>',
        '<p class="task15-lead">&#1058;&#1088;&#1077;&#1091;&#1075;&#1086;&#1083;&#1100;&#1085;&#1080;&#1082;&#1080;. 28 &#1087;&#1088;&#1086;&#1090;&#1086;&#1090;&#1080;&#1087;&#1086;&#1074; &#1080; 258 &#1079;&#1072;&#1076;&#1072;&#1085;&#1080;&#1081;.</p>',
        html_text,
        flags=re.DOTALL,
    )
    html_text = html_text.replace('<a class="is-current" href="#trainer">14</a><a href="index.html#trainer">15</a>', '<a href="task14.html#trainer">14</a><a class="is-current" href="#trainer">15</a>')
    scripts = "\n".join(f'  <script src="task15-data-{index:02d}.js" defer></script>' for index in range(1, 29))
    html_text = re.sub(r'  <script src="task15-data-01\.js" defer></script>.*?  <script src="task15-data-11\.js" defer></script>', scripts, html_text, flags=re.DOTALL)
    (OUT / "task15.html").write_text(html_text, encoding="utf-8")

    script_text = (OUT / "task14.js").read_text(encoding="utf-8")
    script_text = script_text.replace("task14", "task15").replace("Task14", "Task15").replace("TASK14", "TASK15")
    (OUT / "task15.js").write_text(script_text, encoding="utf-8")

    css_text = (OUT / "task14.css").read_text(encoding="utf-8")
    css_text = css_text.replace("task14", "task15")
    (OUT / "task15.css").write_text(css_text, encoding="utf-8")


if __name__ == "__main__":
    rows = collect()
    write_data(rows)
    scaffold_trainer()
    print(f"Collected {sum(len(row['items']) for row in rows)} tasks in {len(rows)} prototypes.")
