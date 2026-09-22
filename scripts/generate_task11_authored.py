"""Build the authored task 11 bank while preserving every graph."""
from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = [14, 13, 10, 13, 14, 12, 6, 2, 15, 4]
TITLES = [
    "Знаки коэффициентов линейной функции",
    "Линейная функция: график и коэффициенты",
    "Линейная функция: график и формула",
    "Линейная функция: формула и график",
    "Знаки коэффициентов квадратичной функции",
    "Квадратичная функция: график и коэффициенты",
    "Основные графики функций",
    "Графики степенной и обратной пропорциональности",
    "Смешанное сопоставление функций",
    "Линейная, квадратичная и корневая функции",
]
PROMPTS = {
    1: "Для каждой пары знаков коэффициентов линейной функции выберите подходящий график.",
    2: "Определите знаки коэффициентов каждой линейной функции, изображённой на графиках.",
    3: "Подберите формулу для каждого графика линейной функции.",
    4: "Сопоставьте каждую формулу линейной функции с её графиком.",
    5: "Для каждой пары знаков коэффициентов квадратичной функции выберите подходящий график.",
    6: "Определите знаки коэффициентов каждой квадратичной функции, изображённой на графиках.",
    7: "Подберите формулу для каждого из трёх графиков.",
    8: "Подберите формулу для каждого из трёх графиков.",
    9: "Сопоставьте каждую формулу с соответствующим графиком.",
    10: "Подберите формулу для каждого из трёх графиков.",
}
OPTIONS_TO_GRAPHS = {1, 4, 5, 9}
PERMUTATIONS = [
    (1, 2, 0),
    (2, 0, 1),
    (2, 1, 0),
    (1, 0, 2),
    (0, 2, 1),
]
PUSH_RE = re.compile(r"\.push\((\{.*\})\);\s*$", re.DOTALL)
TH_RE = re.compile(r"<th[^>]*>(.*?)</th>", re.DOTALL | re.IGNORECASE)
IMG_RE = re.compile(r'<img[^>]+src="([^"]+)"', re.IGNORECASE)
AUTHORED_OPTION_RE = re.compile(r'<th data-target-graph="([123])">(.*?)</th>', re.DOTALL)
SOURCE_INDEX_RE = re.compile(r"<!--source-index:([123])-->")


def load_prototype(kind: int) -> dict:
    path = ROOT / f"task11-data-{kind:02}.js"
    match = PUSH_RE.search(path.read_text(encoding="utf-8-sig"))
    if not match:
        raise ValueError(f"Cannot parse {path.name}")
    return json.loads(match.group(1))


def clean_option(value: str) -> str:
    value = SOURCE_INDEX_RE.sub("", value)
    value = re.sub(r"</?span[^>]*>", "", value, flags=re.IGNORECASE)
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"\s+", " ", html.unescape(value)).strip()
    value = re.sub(r"^(?:(?:[АБВABC]|[123])\)\s*)+", "", value, flags=re.IGNORECASE)
    return html.escape(value, quote=False)


def old_targets(answer: str, direction: str) -> list[int]:
    digits = [int(value) for value in str(answer)]
    if sorted(digits) != [1, 2, 3]:
        raise ValueError(f"Unexpected answer {answer!r}")
    if direction == "options-to-graphs":
        return digits
    targets = [0, 0, 0]
    for graph, option in enumerate(digits, 1):
        targets[option - 1] = graph
    return targets


def extract_options(item: dict, direction: str) -> list[dict]:
    task_html = item["taskHtml"]
    authored = AUTHORED_OPTION_RE.findall(task_html)
    if authored:
        entries = []
        for target, content in authored:
            source_match = SOURCE_INDEX_RE.search(content)
            if not source_match:
                raise ValueError(f"Missing source index in {item['id']}")
            entries.append({
                "source": int(source_match.group(1)),
                "target": int(target),
                "content": clean_option(content),
            })
        return sorted(entries, key=lambda entry: entry["source"])

    option_cells = [cell for cell in TH_RE.findall(task_html) if "<img" not in cell.lower()]
    if len(option_cells) != 3:
        raise ValueError(f"Expected three options in {item['id']}, got {len(option_cells)}")
    targets = old_targets(item["answer"], direction)
    return [
        {"source": index + 1, "target": targets[index], "content": clean_option(content)}
        for index, content in enumerate(option_cells)
    ]


def unique_images(item: dict, kind: int, index: int, seen: set[str]) -> list[str]:
    sources = IMG_RE.findall(item["taskHtml"])
    if len(sources) != 3:
        raise ValueError(f"Expected three drawings in {item['id']}, got {len(sources)}")
    result = []
    for position, source in enumerate(sources, 1):
        if source not in seen:
            result.append(source)
            seen.add(source)
            continue
        suffix = Path(source).suffix or ".svg"
        alias = f"task11-drawings/graphs-authored-{kind}-{index + 1}-{position}{suffix}"
        shutil.copyfile(ROOT / source, ROOT / alias)
        result.append(alias)
        seen.add(alias)
    return result


def build_html(kind: int, item_id: str, entries: list[dict], images: list[str]) -> tuple[str, str]:
    direction = "options-to-graphs" if kind in OPTIONS_TO_GRAPHS else "graphs-to-options"
    option_labels = ("А", "Б", "В") if direction == "options-to-graphs" else ("1", "2", "3")
    graph_labels = ("1", "2", "3") if direction == "options-to-graphs" else ("А", "Б", "В")
    option_cells = "".join(
        f'<th data-target-graph="{entry["target"]}"><!--source-index:{entry["source"]}-->'
        f'<b>{option_labels[position]})</b> {entry["content"]}</th>'
        for position, entry in enumerate(entries)
    )
    graph_cells = "".join(
        f'<th><b>{graph_labels[position]})</b><img src="{source}" alt="График {graph_labels[position]} к заданию {item_id}"></th>'
        for position, source in enumerate(images)
    )
    if direction == "options-to-graphs":
        first_title, first_cells = "Условия", option_cells
        second_title, second_cells = "Графики", graph_cells
        answer = "".join(str(entry["target"]) for entry in entries)
        closing = "В ответе запишите номера графиков в порядке условий А, Б, В."
    else:
        first_title, first_cells = "Графики", graph_cells
        second_title, second_cells = "Варианты", option_cells
        answer = "".join(str(next(i for i, entry in enumerate(entries, 1) if entry["target"] == graph)) for graph in (1, 2, 3))
        closing = "В ответе запишите номера вариантов в порядке графиков А, Б, В."
    task_html = (
        f'<div class="task11-match" data-direction="{direction}">'
        f'<p class="task11-match-prompt">{PROMPTS[kind]}</p>'
        f'<p class="task11-match-title">{first_title}</p>'
        f'<div class="table-wrapper"><table class="latex-table task11-match-table"><tr>{first_cells}</tr></table></div>'
        f'<p class="task11-match-title">{second_title}</p>'
        f'<div class="table-wrapper"><table class="latex-table task11-match-table task11-graph-table"><tr>{second_cells}</tr></table></div>'
        f'<p class="task11-match-help">{closing}</p>'
        "</div>"
    )
    return task_html, answer


def main() -> None:
    seen_images: set[str] = set()
    for kind, count in enumerate(COUNTS, 1):
        original = load_prototype(kind)
        if len(original["items"]) != count:
            raise ValueError(f"Unexpected item count in type {kind}")
        items = []
        direction = "options-to-graphs" if kind in OPTIONS_TO_GRAPHS else "graphs-to-options"
        for index, item in enumerate(original["items"]):
            source_entries = extract_options(item, direction)
            permutation = PERMUTATIONS[(kind + index) % len(PERMUTATIONS)]
            entries = [source_entries[position] for position in permutation]
            images = unique_images(item, kind, index, seen_images)
            task_html, answer = build_html(kind, item["id"], entries, images)
            items.append({"id": item["id"], "taskHtml": task_html, "answer": answer, "format": "number"})
        prototype = {"id": f"11.{kind}", "title": TITLES[kind - 1], "items": items}
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target = ROOT / f"task11-data-{kind:02}.js"
        target.write_text(
            "window.OgeTask11DataPrototypes = window.OgeTask11DataPrototypes || [];\n"
            f"window.OgeTask11DataPrototypes.push({payload});\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
