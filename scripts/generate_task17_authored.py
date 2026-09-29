"""Generate an authored task 17 polygon bank with independently verifiable answers."""
from __future__ import annotations

import json
import re
from decimal import Decimal
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = [5, 6, 11, 6, 4, 10, 8, 7, 3, 10, 5, 5, 11, 10, 11, 10, 10, 10, 10, 10, 11, 5, 5, 5, 5, 5, 5, 10, 13, 9, 10, 10, 3, 2, 10, 11, 10, 6, 10, 13]
MODELS = [
    "parallelogram_larger_angle", "parallelogram_smaller_angle", "parallelogram_bisector_angle",
    "parallelogram_diagonal_larger", "parallelogram_diagonal_smaller", "parallelogram_half_diagonal",
    "parallelogram_area", "parallelogram_larger_height", "parallelogram_smaller_height",
    "rhombus_diagonal_half_angle", "rhombus_larger_angle", "rhombus_smaller_angle",
    "rhombus_smaller_diagonal_angle", "rhombus_perpendicular_angle", "rhombus_height_diagonal_angle",
    "rhombus_height", "rhombus_area_from_perimeter", "rhombus_area_from_diagonal_tangent",
    "rectangle_diagonal_angle", "rectangle_diagonal", "square_diagonal",
    "right_trapezoid_larger_angle", "right_trapezoid_smaller_angle", "isosceles_trapezoid_smaller_angle",
    "isosceles_trapezoid_larger_angle", "isosceles_trapezoid_smaller_from_sum",
    "isosceles_trapezoid_larger_from_sum", "trapezoid_bisector_angle", "trapezoid_diagonal_small_base_one",
    "trapezoid_diagonal_small_base_two", "trapezoid_midline_segment", "trapezoid_midline",
    "trapezoid_greater_base", "trapezoid_smaller_base", "trapezoid_base_from_projection_one",
    "trapezoid_base_from_projection_two", "trapezoid_area", "trapezoid_area_45",
    "trapezoid_base_angle", "trapezoid_height_45",
]


def load_originals() -> tuple[list[str], list[list[str]]]:
    titles: list[str] = []
    all_images: list[list[str]] = []
    for number, count in enumerate(COUNTS, 1):
        path = ROOT / f"task17-data-{number:02}.js"
        text = path.read_text(encoding="utf-8-sig")
        match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
        if not match:
            raise ValueError(f"Cannot read {path.name}")
        source = json.loads(match.group(1))
        images = []
        for item in source["items"]:
            image = re.search(r"<img\b[^>]*?/?>", item["taskHtml"], re.IGNORECASE)
            if not image:
                raise ValueError(f"No drawing in {item['id']}")
            images.append(image.group(0))
        if len(images) != count:
            raise ValueError(f"{path.name}: expected {count} drawings, got {len(images)}")
        titles.append(source["title"])
        all_images.append(images)
    return titles, all_images


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


def card(condition: str, image: str, *, large_diagram: bool = False) -> str:
    wrapper_class = "table-wrapper task17-diagram-large" if large_diagram else "table-wrapper"
    return (
        f'<div class="{wrapper_class}">\n<table class="latex-table table-with-image">\n<tr>\n'
        f"<th>{condition}</th>\n"
        f'<th><div class="center">{image}</div></th>\n'
        "</tr>\n</table>\n</div>"
    )


def authored_item(kind: int, index: int, image: str) -> dict:
    i = index - 1
    model = MODELS[kind - 1]

    if kind == 1:
        p = {"angle": 29 + 7 * i}; result = 180 - p["angle"]
        text = rf"Острый угол параллелограмма равен ${p['angle']}^\circ$. Определите его тупой угол. Ответ дайте в градусах."
    elif kind == 2:
        p = {"angle": 101 + 6 * i}; result = 180 - p["angle"]
        text = rf"Тупой угол параллелограмма равен ${p['angle']}^\circ$. Найдите острый угол. Ответ дайте в градусах."
    elif kind == 3:
        p = {"angle": 7 + i}; result = 2 * p["angle"]
        text = rf"Биссектриса угла параллелограмма образует с параллельной ему стороной угол ${p['angle']}^\circ$. Найдите острый угол параллелограмма."
    elif kind in (4, 5):
        p = {"first": 18 + 2 * i if kind == 4 else 41 + 3 * i, "second": 27 + 3 * i if kind == 4 else 67 - 2 * i}
        result = 180 - p["first"] - p["second"]
        requested = "больший" if kind == 4 else "меньший"
        text = rf"Диагональ параллелограмма образует с двумя его сторонами углы ${p['first']}^\circ$ и ${p['second']}^\circ$. Найдите {requested} угол параллелограмма."
    elif kind == 6:
        p = {"diagonal": 10 + 2 * i}; result = Fraction(p["diagonal"], 2)
        text = rf"Диагонали параллелограмма пересекаются в точке $O$. Длина диагонали $BD$ равна ${p['diagonal']}$. Найдите $DO$."
    elif kind == 7:
        p = {"base": 4 + i, "height": 3 + i % 4}; result = p["base"] * p["height"]
        text = rf"Основание параллелограмма равно ${p['base']}$, а проведённая к нему высота равна ${p['height']}$. Найдите площадь параллелограмма. Рисунок схематичен."
    elif kind == 8:
        smaller = 4 + i; larger = 2 * smaller; large_height = 6 + 2 * i
        p = {"area": smaller * large_height, "side_a": smaller, "side_b": larger}; result = Fraction(p["area"], smaller)
        text = rf"Площадь параллелограмма равна ${p['area']}$, а его стороны — ${smaller}$ и ${larger}$. Найдите большую из двух высот."
    elif kind == 9:
        smaller = 4 + i; larger = 3 * smaller; small_height = 2 + i
        p = {"area": larger * small_height, "side_a": smaller, "side_b": larger}; result = Fraction(p["area"], larger)
        text = rf"Площадь параллелограмма равна ${p['area']}$, а его стороны — ${smaller}$ и ${larger}$. Найдите меньшую из двух высот."
    elif kind == 10:
        p = {"angle": 34 + 4 * i}; result = Fraction(180 - p["angle"], 2)
        text = rf"Угол $ABC$ ромба $ABCD$ равен ${p['angle']}^\circ$. Диагональ $AC$ проведена. Найдите угол $ACD$."
    elif kind == 11:
        p = {"angle": 31 + 8 * i}; result = 180 - p["angle"]
        text = rf"Острый угол ромба равен ${p['angle']}^\circ$. Найдите его тупой угол."
    elif kind == 12:
        p = {"angle": 103 + 9 * i}; result = 180 - p["angle"]
        text = rf"Тупой угол ромба равен ${p['angle']}^\circ$. Найдите его острый угол."
    elif kind == 13:
        p = {"angle": 40 + 4 * i}; result = Fraction(180 - p["angle"], 2)
        text = rf"Острый угол ромба равен ${p['angle']}^\circ$. Найдите угол между стороной ромба и его меньшей диагональю."
    elif kind == 14:
        p = {"angle": 18 + 2 * i}; result = 2 * p["angle"]
        text = rf"Перпендикуляр из точки пересечения диагоналей ромба к стороне образует с диагональю угол ${p['angle']}^\circ$. Найдите острый угол ромба."
    elif kind == 15:
        p = {"angle": 100 + 4 * i}; result = Fraction(p["angle"], 2)
        text = rf"Один из углов ромба равен ${p['angle']}^\circ$. Найдите угол между высотой ромба и его большей диагональю."
    elif kind == 16:
        p = {"side": 6 + 2 * i}; result = Fraction(p["side"], 2)
        text = rf"Сторона ромба равна ${p['side']}$, а его острый угол равен $30^\circ$. Найдите высоту ромба."
    elif kind == 17:
        p = {"perimeter": 12 + 4 * i}; result = Fraction(p["perimeter"] ** 2, 32)
        text = rf"Периметр ромба равен ${p['perimeter']}$, а острый угол — $30^\circ$. Найдите площадь ромба."
    elif kind == 18:
        p = {"diagonal": 6 + 2 * i, "tan_num": 1, "tan_den": 2}; result = Fraction(p["diagonal"] ** 2, 4)
        text = rf"Диагональ $AC$ ромба $ABCD$ равна ${p['diagonal']}$, а $\operatorname{{tg}}\angle BCA=\frac{{1}}{{2}}$. Найдите площадь ромба."
    elif kind == 19:
        p = {"angle": 23 + 3 * i}; result = 2 * min(p["angle"], 90 - p["angle"])
        text = rf"Диагональ прямоугольника образует с одной из сторон угол ${p['angle']}^\circ$. Найдите острый угол между диагоналями."
    elif kind == 20:
        p = {"half_diagonal": 5 + i}; result = 2 * p["half_diagonal"]
        text = rf"Диагонали прямоугольника пересекаются в точке $O$. Отрезок от вершины до точки $O$ равен ${p['half_diagonal']}$. Найдите длину диагонали."
    elif kind == 21:
        p = {"coefficient": 3 + i}; result = 2 * p["coefficient"]
        text = rf"Сторона квадрата равна ${p['coefficient']}\sqrt{{2}}$. Найдите диагональ квадрата."
    elif kind == 22:
        p = {"angle": 37 + 8 * i}; result = 180 - p["angle"]
        text = rf"Острый угол прямоугольной трапеции равен ${p['angle']}^\circ$. Найдите её тупой угол."
    elif kind == 23:
        p = {"angle": 104 + 7 * i}; result = 180 - p["angle"]
        text = rf"Тупой угол прямоугольной трапеции равен ${p['angle']}^\circ$. Найдите её острый угол."
    elif kind == 24:
        p = {"angle": 111 + 8 * i}; result = 180 - p["angle"]
        text = rf"Тупой угол равнобедренной трапеции равен ${p['angle']}^\circ$. Найдите меньший угол."
    elif kind == 25:
        p = {"angle": 28 + 9 * i}; result = 180 - p["angle"]
        text = rf"Острый угол равнобедренной трапеции равен ${p['angle']}^\circ$. Найдите больший угол."
    elif kind == 26:
        p = {"sum": 188 + 10 * i}; result = 180 - Fraction(p["sum"], 2)
        text = rf"Сумма двух равных тупых углов равнобедренной трапеции равна ${p['sum']}^\circ$. Найдите её меньший угол."
    elif kind == 27:
        p = {"sum": 44 + 10 * i}; result = 180 - Fraction(p["sum"], 2)
        text = rf"Сумма двух равных острых углов равнобедренной трапеции равна ${p['sum']}^\circ$. Найдите её больший угол."
    elif kind == 28:
        p = {"angle": 42 + 2 * i}; result = 180 - Fraction(3 * p["angle"], 2)
        text = rf"В равнобедренной трапеции угол $D$ равен ${p['angle']}^\circ$, а диагональ $AC$ делит угол $BAD$ пополам. Найдите угол $ACD$."
    elif kind == 29:
        p = {"base_angle": 58 + i, "side_angle": 19 + i % 7}; result = p["base_angle"] - p["side_angle"]
        text = rf"В равнобедренной трапеции угол при большем основании равен ${p['base_angle']}^\circ$. Диагональ образует с боковой стороной угол ${p['side_angle']}^\circ$. Найдите угол между диагональю и меньшим основанием."
    elif kind == 30:
        p = {"base_angle": 58 + i, "side_angle": 64 - i % 3}; result = 180 - p["base_angle"] - p["side_angle"]
        text = rf"В равнобедренной трапеции угол при большем основании равен ${p['base_angle']}^\circ$, а диагональ образует со второй боковой стороной угол ${p['side_angle']}^\circ$. Найдите угол между диагональю и меньшим основанием."
    elif kind == 31:
        p = {"smaller_base": 3 + i, "greater_base": 8 + 2 * i}; result = Fraction(p["greater_base"], 2)
        text = rf"Основания трапеции равны ${p['smaller_base']}$ и ${p['greater_base']}$. Найдите больший отрезок, на который диагональ делит среднюю линию."
    elif kind == 32:
        p = {"base_a": 3 + i, "base_b": 7 + i}; result = Fraction(p["base_a"] + p["base_b"], 2)
        text = rf"Основания трапеции равны ${p['base_a']}$ и ${p['base_b']}$. Найдите её среднюю линию."
    elif kind == 33:
        p = {"smaller_base": 5 + 2 * i, "projection": 2 + i}; result = p["smaller_base"] + 2 * p["projection"]
        text = rf"В равнобедренной трапеции меньшее основание равно ${p['smaller_base']}$, а горизонтальная проекция каждой боковой стороны на большее основание равна ${p['projection']}$. Найдите большее основание. Рисунок схематичен."
    elif kind == 34:
        p = {"greater_base": 14 + 4 * i, "projection": 3 + i}; result = p["greater_base"] - 2 * p["projection"]
        text = rf"В равнобедренной трапеции большее основание равно ${p['greater_base']}$, а горизонтальная проекция каждой боковой стороны равна ${p['projection']}$. Найдите меньшее основание. Рисунок схематичен."
    elif kind in (35, 36):
        p = {"left_segment": 2 + i if kind == 35 else 1 + i % 4, "right_segment": 9 + 2 * i if kind == 35 else 7 + i}
        result = p["right_segment"] - p["left_segment"]
        text = rf"Высота равнобедренной трапеции, проведённая из конца меньшего основания, делит большее основание на отрезки ${p['left_segment']}$ и ${p['right_segment']}$. Найдите меньшее основание."
    elif kind == 37:
        p = {"base_a": 3 + i, "base_b": 7 + i, "height": 4 + i % 5}; result = Fraction((p["base_a"] + p["base_b"]) * p["height"], 2)
        text = rf"Основания трапеции равны ${p['base_a']}$ и ${p['base_b']}$, высота равна ${p['height']}$. Найдите площадь трапеции."
    elif kind == 38:
        smaller = 3 + i; greater = smaller + 2 * (2 + i)
        p = {"smaller_base": smaller, "greater_base": greater}; result = Fraction(greater ** 2 - smaller ** 2, 4)
        text = rf"Основания равнобедренной трапеции равны ${smaller}$ и ${greater}$, а угол при большем основании равен $45^\circ$. Найдите площадь трапеции."
    elif kind == 39:
        p = {"first_angle": 20 + 2 * i, "second_angle": 60 + 4 * i}; result = Fraction(180 + p["first_angle"] - p["second_angle"], 2)
        text = rf"Диагональ равнобедренной трапеции образует с её боковыми сторонами углы ${p['first_angle']}^\circ$ и ${p['second_angle']}^\circ$. Найдите угол при большем основании."
    elif kind == 40:
        p = {"base_a": 2 + i, "base_b": 6 + i}; result = Fraction(p["base_a"] + p["base_b"], 2)
        text = rf"Диагональ равнобедренной трапеции образует с основанием угол $45^\circ$. Основания равны ${p['base_a']}$ и ${p['base_b']}$. Найдите высоту трапеции."
    else:
        raise AssertionError(kind)

    return {
        "id": f"17.{kind}.{index}",
        "taskHtml": card(text, image, large_diagram=kind == 38),
        "answer": answer(result),
        "format": "number",
        "authored": {"kind": model, "params": p},
    }


def main() -> None:
    titles, images = load_originals()
    for kind, count in enumerate(COUNTS, 1):
        prototype = {
            "id": f"17.{kind}",
            "title": titles[kind - 1],
            "items": [authored_item(kind, index, images[kind - 1][index - 1]) for index in range(1, count + 1)],
        }
        output = "window.OgeTask17DataPrototypes = window.OgeTask17DataPrototypes || [];\n"
        output += "window.OgeTask17DataPrototypes.push(" + json.dumps(prototype, ensure_ascii=False, separators=(",", ":")) + ");\n"
        (ROOT / f"task17-data-{kind:02}.js").write_text(output, encoding="utf-8")


if __name__ == "__main__":
    main()
