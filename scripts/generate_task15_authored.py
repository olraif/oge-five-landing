"""Generate an authored task 15 geometry bank with independently verifiable answers."""
from __future__ import annotations

import json
import math
import re
from decimal import Decimal
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = [12, 10, 12, 12, 5, 12, 10, 10, 10, 12, 4, 4, 4, 4, 4, 4, 12, 12, 10, 10, 12, 12, 10, 11, 10, 10, 10, 10]
TITLES = [
    "Сумма углов треугольника", "Внешний угол треугольника",
    "Острые углы прямоугольного треугольника", "Углы равнобедренного треугольника",
    "Внешний угол равнобедренного треугольника", "Биссектриса угла треугольника",
    "Биссектриса и равнобедренный треугольник", "Высота в треугольнике",
    "Медиана к гипотенузе", "Медиана и середина стороны",
    "Медиана равностороннего треугольника", "Биссектриса равностороннего треугольника",
    "Высота равностороннего треугольника", "Биссектриса по стороне равностороннего треугольника",
    "Медиана по стороне равностороннего треугольника", "Высота по стороне равностороннего треугольника",
    "Средняя линия треугольника", "Площадь прямоугольного треугольника",
    "Площадь по двум сторонам и синусу угла", "Площадь по стороне и высоте",
    "Теорема Пифагора: гипотенуза", "Теорема Пифагора: катет",
    "Синус острого угла", "Катет по синусу угла", "Косинус острого угла",
    "Катет по косинусу угла", "Катет по тангенсу угла", "Тангенс острого угла",
]


def load_images() -> list[list[str]]:
    result = []
    for number, count in enumerate(COUNTS, 1):
        path = ROOT / f"task15-data-{number:02}.js"
        text = path.read_text(encoding="utf-8-sig")
        match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
        if not match:
            raise ValueError(f"Cannot read {path.name}")
        prototype = json.loads(match.group(1))
        images = []
        for source_item in prototype["items"]:
            image = re.search(r"<img\b[^>]*?/?>", source_item["taskHtml"], re.IGNORECASE)
            if not image:
                raise ValueError(f"No drawing in {source_item['id']}")
            images.append(image.group(0))
        if len(images) != count:
            raise ValueError(f"{path.name}: expected {count} drawings, got {len(images)}")
        result.append(images)
    return result


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
    return text.rstrip("0").rstrip(".") if "." in text else text


def card(condition: str, image: str) -> str:
    return (
        '<div class="table-wrapper">\n<table class="latex-table table-with-image">\n<tr>\n'
        f"<th>{condition}</th>\n"
        f'<th><div class="center">{image}</div></th>\n'
        "</tr>\n</table>\n</div>"
    )


def make_item(number: int, index: int, condition: str, value: Fraction | int, kind: str, params: dict, image: str) -> dict:
    return {
        "id": f"15.{number}.{index}",
        "taskHtml": card(condition, image),
        "answer": answer(value),
        "format": "number",
        "authored": {"kind": kind, "params": params},
    }


def build(number: int, rows: list[tuple], images: list[str]) -> list[dict]:
    items = []
    for index, row in enumerate(rows, 1):
        image = images[index - 1]
        if number == 1:
            a, b = row
            text = f"Два угла треугольника равны \\({a}^\\circ\\) и \\({b}^\\circ\\). Вычислите градусную меру оставшегося угла."
            items.append(make_item(number, index, text, 180 - a - b, "third-angle", {"angle_a": a, "angle_b": b}, image))
        elif number == 2:
            (angle,) = row
            text = f"Внутренний угол треугольника при вершине \\(C\\) равен \\({angle}^\\circ\\). Найдите смежный с ним внешний угол."
            items.append(make_item(number, index, text, 180 - angle, "exterior-supplement", {"interior_angle": angle}, image))
        elif number == 3:
            (angle,) = row
            text = f"Один острый угол прямоугольного треугольника составляет \\({angle}^\\circ\\). Чему равен второй острый угол?"
            items.append(make_item(number, index, text, 90 - angle, "right-complement", {"known_angle": angle}, image))
        elif number == 4:
            (apex,) = row
            text = f"В равнобедренном треугольнике боковые стороны \\(AB\\) и \\(BC\\) равны, а угол между ними равен \\({apex}^\\circ\\). Найдите угол при основании \\(A\\)."
            items.append(make_item(number, index, text, Fraction(180 - apex, 2), "isosceles-base-angle", {"apex_angle": apex}, image))
        elif number == 5:
            (exterior,) = row
            text = f"У равнобедренного треугольника с основанием \\(AC\\) внешний угол при вершине \\(C\\) равен \\({exterior}^\\circ\\). Определите угол при вершине \\(B\\)."
            items.append(make_item(number, index, text, 2 * exterior - 180, "isosceles-apex-from-exterior", {"exterior_angle": exterior}, image))
        elif number == 6:
            (whole,) = row
            text = f"Луч \\(AD\\) делит угол \\(A\\) треугольника пополам. Если \\(\\angle A={whole}^\\circ\\), найдите \\(\\angle BAD\\)."
            items.append(make_item(number, index, text, Fraction(whole, 2), "angle-bisector-half", {"whole_angle": whole}, image))
        elif number == 7:
            (base,) = row
            text = f"В треугольнике \\(ABC\\) отрезок \\(AK\\) — биссектриса, причём \\(AK=CK\\). Угол \\(C\\) равен \\({base}^\\circ\\). Найдите угол \\(B\\)."
            items.append(make_item(number, index, text, 180 - 3 * base, "bisector-equal-segment", {"base_angle": base}, image))
        elif number == 8:
            (known,) = row
            text = f"Из вершины \\(B\\) остроугольного треугольника \\(ABC\\) опущена высота \\(BH\\). Известно, что \\(\\angle A={known}^\\circ\\). Найдите \\(\\angle ABH\\)."
            items.append(make_item(number, index, text, 90 - known, "altitude-complement", {"known_angle": known}, image))
        elif number == 9:
            (known,) = row
            text = f"Точка \\(M\\) — середина стороны \\(AC\\) треугольника \\(ABC\\), причём \\(MA=MB=MC\\). Если \\(\\angle C={known}^\\circ\\), найдите \\(\\angle A\\)."
            items.append(make_item(number, index, text, 90 - known, "median-right-angle", {"known_angle": known}, image))
        elif number == 10:
            (side,) = row
            text = f"В треугольнике \\(ABC\\) медиана \\(BM\\) проведена к стороне \\(AC={side}\\). Найдите длину отрезка \\(AM\\)."
            items.append(make_item(number, index, text, Fraction(side, 2), "median-midpoint", {"whole_side": side}, image))
        elif number in (11, 12, 13):
            (coefficient,) = row
            names = {11: "медианы", 12: "биссектрисы", 13: "высоты"}
            kinds = {11: "equilateral-side-from-median", 12: "equilateral-side-from-bisector", 13: "equilateral-side-from-height"}
            text = f"Длина {names[number]} равностороннего треугольника равна \\({coefficient}\\sqrt{{3}}\\). Найдите длину его стороны."
            items.append(make_item(number, index, text, 2 * coefficient, kinds[number], {"sqrt3_coefficient": coefficient}, image))
        elif number in (14, 15, 16):
            (coefficient,) = row
            names = {14: "биссектрисы", 15: "медианы", 16: "высоты"}
            kinds = {14: "equilateral-bisector-from-side", 15: "equilateral-median-from-side", 16: "equilateral-height-from-side"}
            text = f"Сторона равностороннего треугольника равна \\({coefficient}\\sqrt{{3}}\\). Вычислите длину его {names[number]}."
            items.append(make_item(number, index, text, Fraction(3 * coefficient, 2), kinds[number], {"sqrt3_coefficient": coefficient}, image))
        elif number == 17:
            (side,) = row
            text = f"Точки \\(M\\) и \\(N\\) — середины сторон \\(AB\\) и \\(BC\\) треугольника \\(ABC\\). Если \\(AC={side}\\), найдите длину средней линии \\(MN\\)."
            items.append(make_item(number, index, text, Fraction(side, 2), "triangle-midline", {"whole_side": side}, image))
        elif number == 18:
            a, b = row
            text = f"Катеты прямоугольного треугольника равны \\({a}\\) и \\({b}\\). Найдите площадь треугольника."
            items.append(make_item(number, index, text, Fraction(a * b, 2), "right-triangle-area", {"leg_a": a, "leg_b": b}, image))
        elif number == 19:
            a, b, numerator, denominator = row
            text = f"Две стороны треугольника равны \\({a}\\) и \\({b}\\), а синус угла между ними равен \\(\\dfrac{{{numerator}}}{{{denominator}}}\\). Найдите площадь треугольника."
            value = Fraction(a * b * numerator, 2 * denominator)
            items.append(make_item(number, index, text, value, "sine-triangle-area", {"side_a": a, "side_b": b, "sin_num": numerator, "sin_den": denominator}, image))
        elif number == 20:
            base, height = row
            text = f"К стороне треугольника длиной \\({base}\\) проведена высота длиной \\({height}\\). Определите площадь треугольника."
            items.append(make_item(number, index, text, Fraction(base * height, 2), "base-height-area", {"base": base, "height": height}, image))
        elif number == 21:
            a, b = row
            hypotenuse = math.isqrt(a * a + b * b)
            text = f"Длины катетов прямоугольного треугольника равны \\({a}\\) и \\({b}\\). Найдите длину гипотенузы."
            items.append(make_item(number, index, text, hypotenuse, "pythagorean-hypotenuse", {"leg_a": a, "leg_b": b}, image))
        elif number == 22:
            known, hypotenuse, missing = row
            text = f"Гипотенуза прямоугольного треугольника равна \\({hypotenuse}\\), а один катет равен \\({known}\\). Найдите второй катет."
            items.append(make_item(number, index, text, missing, "pythagorean-leg", {"known_leg": known, "hypotenuse": hypotenuse}, image))
        elif number in (23, 25, 28):
            numerator, denominator = row
            if number == 23:
                text = f"В прямоугольном треугольнике \\(ABC\\) угол \\(C\\) прямой, \\(AC={numerator}\\) и \\(AB={denominator}\\). Найдите \\(\\sin B\\)."
                kind = "sine-ratio"
            elif number == 25:
                text = f"В прямоугольном треугольнике \\(ABC\\) угол \\(C\\) прямой, \\(BC={numerator}\\) и \\(AB={denominator}\\). Найдите \\(\\cos B\\)."
                kind = "cosine-ratio"
            else:
                text = f"В прямоугольном треугольнике \\(ABC\\) угол \\(C\\) прямой, \\(AC={numerator}\\) и \\(BC={denominator}\\). Найдите \\(\\operatorname{{tg}} B\\)."
                kind = "tangent-ratio"
            items.append(make_item(number, index, text, Fraction(numerator, denominator), kind, {"numerator": numerator, "denominator": denominator}, image))
        elif number in (24, 26, 27):
            numerator, denominator, known = row
            if number == 24:
                text = f"В прямоугольном треугольнике \\(ABC\\) угол \\(C\\) прямой, \\(\\sin B=\\dfrac{{{numerator}}}{{{denominator}}}\\) и \\(AB={known}\\). Найдите \\(AC\\)."
                kind = "side-from-sine"
            elif number == 26:
                text = f"В прямоугольном треугольнике \\(ABC\\) угол \\(C\\) прямой, \\(\\cos B=\\dfrac{{{numerator}}}{{{denominator}}}\\) и \\(AB={known}\\). Найдите \\(BC\\)."
                kind = "side-from-cosine"
            else:
                text = f"В прямоугольном треугольнике \\(ABC\\) угол \\(C\\) прямой, \\(\\operatorname{{tg}} B=\\dfrac{{{numerator}}}{{{denominator}}}\\) и \\(BC={known}\\). Найдите \\(AC\\)."
                kind = "side-from-tangent"
            value = Fraction(known * numerator, denominator)
            items.append(make_item(number, index, text, value, kind, {"known_length": known, "ratio_num": numerator, "ratio_den": denominator}, image))
        else:
            raise ValueError(number)
    return items


ROWS = [
    [(31, 74), (42, 63), (27, 88), (36, 79), (51, 67), (24, 103), (45, 58), (39, 92), (56, 71), (33, 84), (47, 69), (29, 96)],
    [(64,), (71,), (83,), (95,), (108,), (117,), (126,), (139,), (146,), (153,)],
    [(14,), (19,), (23,), (28,), (32,), (37,), (41,), (46,), (53,), (61,), (67,), (76,)],
    [(44,), (52,), (60,), (68,), (76,), (84,), (92,), (100,), (108,), (116,), (124,), (132,)],
    [(112,), (118,), (125,), (131,), (137,)],
    [(34,), (42,), (50,), (58,), (66,), (74,), (82,), (90,), (98,), (106,), (114,), (122,)],
    [(18,), (21,), (24,), (27,), (30,), (33,), (36,), (39,), (42,), (47,)],
    [(13,), (17,), (22,), (26,), (31,), (35,), (43,), (48,), (54,), (62,)],
    [(16,), (22,), (27,), (34,), (38,), (45,), (51,), (57,), (63,), (71,)],
    [(14,), (18,), (22,), (26,), (30,), (34,), (38,), (42,), (46,), (50,), (54,), (58,)],
    [(5,), (7,), (9,), (13,)], [(4,), (8,), (10,), (14,)], [(6,), (11,), (15,), (17,)],
    [(6,), (8,), (12,), (16,)], [(4,), (10,), (14,), (18,)], [(2,), (8,), (16,), (20,)],
    [(18,), (22,), (26,), (30,), (34,), (38,), (42,), (46,), (50,), (54,), (58,), (62,)],
    [(6, 11), (8, 13), (9, 14), (12, 17), (15, 16), (7, 20), (18, 25), (14, 27), (22, 31), (24, 35), (26, 39), (28, 45)],
    [(10, 18, 1, 2), (12, 15, 2, 3), (14, 20, 3, 5), (16, 25, 1, 2), (18, 30, 4, 5), (21, 24, 1, 3), (22, 35, 2, 5), (25, 28, 3, 7), (27, 40, 1, 5), (30, 32, 3, 4)],
    [(9, 14), (12, 17), (15, 22), (18, 25), (21, 28), (24, 31), (27, 34), (30, 37), (33, 40), (36, 43)],
    [(5, 12), (8, 15), (7, 24), (9, 40), (12, 35), (20, 21), (11, 60), (28, 45), (16, 63), (33, 56), (13, 84), (48, 55)],
    [(12, 13, 5), (15, 17, 8), (24, 25, 7), (40, 41, 9), (35, 37, 12), (21, 29, 20), (60, 61, 11), (45, 53, 28), (63, 65, 16), (56, 65, 33), (84, 85, 13), (55, 73, 48)],
    [(3, 5), (7, 10), (9, 10), (11, 20), (13, 20), (1, 2), (3, 4), (7, 8), (4, 5), (9, 20)],
    [(2, 5, 35), (3, 4, 28), (7, 10, 50), (3, 5, 45), (1, 2, 38), (4, 5, 30), (9, 10, 60), (5, 8, 48), (7, 20, 80), (11, 20, 100), (3, 8, 72)],
    [(2, 5), (3, 4), (7, 10), (9, 10), (11, 20), (13, 20), (1, 2), (3, 5), (7, 8), (4, 5)],
    [(2, 5, 45), (3, 4, 36), (7, 10, 60), (9, 10, 50), (11, 20, 80), (13, 20, 100), (1, 2, 42), (3, 5, 55), (7, 8, 64), (4, 5, 70)],
    [(3, 4, 20), (2, 5, 35), (7, 10, 30), (5, 8, 40), (9, 10, 50), (3, 5, 45), (1, 2, 34), (4, 5, 55), (7, 20, 80), (11, 20, 100)],
    [(3, 5), (7, 10), (9, 10), (11, 20), (13, 20), (1, 2), (3, 4), (7, 8), (4, 5), (9, 20)],
]


def main() -> None:
    images = load_images()
    for number, (count, title, rows, type_images) in enumerate(zip(COUNTS, TITLES, ROWS, images), 1):
        items = build(number, rows, type_images)
        if len(items) != count:
            raise ValueError(f"15.{number}: expected {count} items, got {len(items)}")
        prototype = {"id": f"15.{number}", "title": title, "items": items}
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target = ROOT / f"task15-data-{number:02}.js"
        target.write_text(
            "window.OgeTask15DataPrototypes = window.OgeTask15DataPrototypes || [];\n"
            f"window.OgeTask15DataPrototypes.push({payload});\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
