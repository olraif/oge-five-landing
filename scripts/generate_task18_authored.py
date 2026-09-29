"""Generate an authored task 18 grid-geometry bank with verifiable answers."""
from __future__ import annotations

import json
import re
from decimal import Decimal
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = [12, 13, 12, 12, 23, 10, 12, 12, 13, 12, 12, 10, 5]
MODELS = [
    "scaled_rhombus_diagonal",
    "scaled_triangle_cathetus",
    "scaled_triangle_midline",
    "scaled_trapezoid_midline",
    "scaled_segment_length",
    "combined_segment_ratio",
    "scaled_point_distance",
    "scaled_triangle_area",
    "scaled_parallelogram_area",
    "scaled_rhombus_area",
    "scaled_trapezoid_area",
    "combined_circle_area_ratio",
    "combined_circle_area_ratio",
]
LENGTH_KINDS = {1, 2, 3, 4, 5, 7}
AREA_KINDS = {8, 9, 10, 11}
SCALES = [(2, 1), (3, 2), (1, 2)]


def load_originals() -> tuple[list[str], list[list[dict]]]:
    titles: list[str] = []
    originals: list[list[dict]] = []
    for number, count in enumerate(COUNTS, 1):
        path = ROOT / f"task18-data-{number:02}.js"
        text = path.read_text(encoding="utf-8-sig")
        match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
        if not match:
            raise ValueError(f"Cannot read {path.name}")
        source = json.loads(match.group(1))
        items = []
        for item in source["items"]:
            image = re.search(r"<img\b[^>]*?/?>", item["taskHtml"], re.IGNORECASE)
            if not image:
                raise ValueError(f"No drawing in {item['id']}")
            authored = item.get("authored") or {}
            params = authored.get("params") or {}
            items.append({
                "image": image.group(0),
                "base_value": str(params.get("base_value", item["answer"])),
            })
        if len(items) != count:
            raise ValueError(f"{path.name}: expected {count} drawings, got {len(items)}")
        titles.append(source["title"])
        originals.append(items)
    return titles, originals


def answer(value: Fraction | int) -> str:
    value = Fraction(value)
    if value.denominator == 1:
        return str(value.numerator)
    remainder = value.denominator
    while remainder % 2 == 0:
        remainder //= 2
    while remainder % 5 == 0:
        remainder //= 5
    if remainder != 1:
        raise ValueError(f"Answer is not a terminating decimal: {value}")
    text = format(Decimal(value.numerator) / Decimal(value.denominator), "f")
    return text.rstrip("0").rstrip(".")


def scale_text(numerator: int, denominator: int) -> str:
    return answer(Fraction(numerator, denominator)).replace(".", "{,}")


def card(condition: str, image: str) -> str:
    return (
        '<div class="table-wrapper">\n<table class="latex-table table-with-image">\n<tr>\n'
        f"<th>{condition}</th>\n"
        f'<th><div class="center">{image}</div></th>\n'
        "</tr>\n</table>\n</div>"
    )


def condition_for(kind: int, cell: str | None) -> str:
    grid = rf"На клетчатой бумаге со стороной клетки ${cell}$"
    conditions = {
        1: f"{grid} изображён ромб. Найдите длину его большей диагонали.",
        2: f"{grid} изображён прямоугольный треугольник. Определите длину его большего катета.",
        3: f"{grid} изображён треугольник $ABC$. Найдите длину средней линии, параллельной стороне $AC$.",
        4: f"{grid} изображена трапеция. Вычислите длину её средней линии.",
        5: f"{grid} изображена фигура. По чертежу определите длину отрезка $AB$.",
        6: "На клетчатой бумаге изображён треугольник $ABC$ с точкой $M$ на стороне $AC$. Во сколько раз сумма длин $AM$ и $CM$ больше длины $AM$?",
        7: f"{grid} отмечены две точки. Найдите расстояние между ними.",
        8: f"{grid} изображён треугольник. Найдите его площадь.",
        9: f"{grid} изображён параллелограмм. Найдите его площадь.",
        10: f"{grid} изображён ромб. Найдите его площадь.",
        11: f"{grid} изображена трапеция. Найдите её площадь.",
        12: "На клетчатой бумаге изображены два круга. Во сколько раз сумма их площадей больше площади меньшего круга?",
        13: "На клетчатой бумаге изображены два круга. Во сколько раз сумма их площадей больше площади меньшего круга?",
    }
    return conditions[kind]


def authored_item(kind: int, index: int, original: dict) -> dict:
    model = MODELS[kind - 1]
    base = Fraction(original["base_value"])
    params: dict[str, str | int] = {"base_value": answer(base)}
    cell = None
    if kind in LENGTH_KINDS or kind in AREA_KINDS:
        scale_num, scale_den = SCALES[(index - 1) % len(SCALES)]
        scale = Fraction(scale_num, scale_den)
        params.update({"scale_num": scale_num, "scale_den": scale_den})
        result = base * scale if kind in LENGTH_KINDS else base * scale * scale
        cell = scale_text(scale_num, scale_den)
    else:
        result = base + 1
    return {
        "id": f"18.{kind}.{index}",
        "taskHtml": card(condition_for(kind, cell), original["image"]),
        "answer": answer(result),
        "format": "number",
        "authored": {"kind": model, "params": params},
    }


def main() -> None:
    titles, originals = load_originals()
    for kind, count in enumerate(COUNTS, 1):
        prototype = {
            "id": f"18.{kind}",
            "title": titles[kind - 1],
            "items": [authored_item(kind, index, originals[kind - 1][index - 1]) for index in range(1, count + 1)],
        }
        target = ROOT / f"task18-data-{kind:02}.js"
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target.write_text(
            "window.OgeTask18DataPrototypes = window.OgeTask18DataPrototypes || [];\n"
            f"window.OgeTask18DataPrototypes.push({payload});\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
