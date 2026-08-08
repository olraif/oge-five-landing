#!/usr/bin/env python3
import html, json, time, urllib.request
from html.parser import HTMLParser
from pathlib import Path

BASE = "https://mathstart.ru"
PAGE = BASE + "/sources/FIPI_OGE_MATH/powers"
API = BASE + "/api/analog/FIPI_OGE_MATH/powers"
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "study" / "math" / "part-one"

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "OGE-Studio-Importer/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8")

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.depth = 0
        self.subtopic = ""
        self.sub_parts = []
        self.take_sub = False
        self.row = None
        self.take_num = False
        self.num_depth = 0
        self.num_parts = []
        self.take_task = False
        self.task_depth = 0
        self.task_parts = []
        self.rows = []

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        classes = set(attr.get("class", "").split())
        if tag == "h2" and "subtopic-heading" in classes:
            self.take_sub, self.sub_parts = True, []
        if tag == "article" and "problem" in classes:
            self.row = {
                "internal_id": attr["data-internal-id"],
                "parent_id": attr["data-parent-id"],
                "title": self.subtopic,
                "answer": None,
                "format": "number",
            }
        if self.row:
            if self.take_task:
                self.task_parts.append(self.get_starttag_text())
            if "prototype-number" in classes:
                self.take_num, self.num_depth, self.num_parts = True, self.depth + 1, []
            if "problem-text" in classes:
                self.take_task, self.task_depth, self.task_parts = True, self.depth + 1, []
            if "answer-status" in classes:
                raw = html.unescape(attr.get("data-answer", '""'))
                try:
                    self.row["answer"] = json.loads(raw)
                except json.JSONDecodeError:
                    self.row["answer"] = raw.strip('"')
                self.row["format"] = attr.get("data-format", "number")
        self.depth += 1

    def handle_startendtag(self, tag, attrs):
        if self.take_task:
            self.task_parts.append(self.get_starttag_text())

    def handle_endtag(self, tag):
        if self.row and self.take_task:
            if tag == "div" and self.depth == self.task_depth:
                self.take_task = False
                self.row["task_html"] = "".join(self.task_parts).strip()
            else:
                self.task_parts.append(f"</{tag}>")
        if self.take_num and tag == "span" and self.depth == self.num_depth:
            self.take_num = False
            self.row["number"] = "".join(self.num_parts).strip()
        if self.take_sub and tag == "h2":
            self.take_sub = False
            self.subtopic = html.unescape("".join(self.sub_parts)).strip()
        self.depth -= 1
        if tag == "article" and self.row:
            if self.row.get("task_html") and self.row.get("number"):
                self.rows.append(self.row)
            self.row = None

    def handle_data(self, data):
        if self.take_sub: self.sub_parts.append(data)
        if self.take_num: self.num_parts.append(data)
        if self.take_task: self.task_parts.append(data)

    def handle_entityref(self, name):
        self._entity(f"&{name};")

    def handle_charref(self, name):
        self._entity(f"&#{name};")

    def _entity(self, value):
        if self.take_sub: self.sub_parts.append(value)
        if self.take_num: self.num_parts.append(value)
        if self.take_task: self.task_parts.append(value)

def make_item(pid, number, internal, task, answer, answer_html="", fmt="number"):
    return {
        "id": f"{pid}.{number}",
        "internalId": internal,
        "taskHtml": task.strip(),
        "answer": answer,
        "answerHtml": answer_html or "",
        "format": fmt or "number",
        "analogNumber": number,
    }

def collect():
    parser = Parser()
    parser.feed(fetch(PAGE))
    bases = sorted(parser.rows, key=lambda row: int(row["number"]))
    if len(bases) != 35:
        raise RuntimeError(f"Expected 35 prototypes, found {len(bases)}")
    result, global_ids = [], set()
    quotas = [5 if index in {1, 14, 34} else 4 for index in range(1, 36)]
    if sum(quotas) != 143:
        raise RuntimeError("Task 8 quota must contain exactly 143 tasks")
    for index, base in enumerate(bases, 1):
        pid, base_id = f"8.{index}", base["internal_id"]
        quota = quotas[index - 1]
        items = [make_item(pid, 1, base_id, base["task_html"], base["answer"], fmt=base["format"])]
        seen, current = {base_id}, base_id
        while len(items) < quota:
            payload = json.loads(fetch(f"{API}/{base['parent_id']}/{current}"))
            next_id = payload["internal_id"]
            if next_id == base_id or next_id in seen:
                raise RuntimeError(f"Not enough unique analogs for {pid}")
            seen.add(next_id)
            items.append(make_item(pid, len(items) + 1, next_id, payload["task_html"],
                                   payload["answer_value"], payload.get("answer_html", ""),
                                   payload.get("answer_format", "number")))
            current = next_id
            time.sleep(0.02)
        overlap = global_ids.intersection(seen)
        if overlap:
            raise RuntimeError(f"Duplicate IDs: {sorted(overlap)}")
        global_ids.update(seen)
        result.append({"id": pid, "title": base["title"],
                       "source": "MathStart / FIPI_OGE_MATH / powers", "items": items})
        print(f"{pid}: {len(items)}")
    total = sum(len(row["items"]) for row in result)
    if total != 143:
        raise RuntimeError(f"Expected 143 tasks, collected {total}")
    return result

def write_data(rows):
    for path in OUT.glob("task8-data-*.js"):
        path.unlink()
    for index, row in enumerate(rows, 1):
        payload = json.dumps(row, ensure_ascii=False, separators=(",", ":"))
        text = ("window.OgeTask8DataPrototypes = window.OgeTask8DataPrototypes || [];\n"
                f"window.OgeTask8DataPrototypes.push({payload});\n")
        (OUT / f"task8-data-{index:02d}.js").write_text(text, encoding="utf-8")

if __name__ == "__main__":
    rows = collect()
    write_data(rows)
    print(f"Collected {sum(len(row['items']) for row in rows)} tasks in {len(rows)} prototypes.")
