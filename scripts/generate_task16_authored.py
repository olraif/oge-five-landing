"""Generate an authored task 16 circle-geometry bank with verifiable answers."""
from __future__ import annotations

import json
import math
import re
from decimal import Decimal
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = [10, 10, 10, 10, 10, 5, 5, 10, 10, 10, 10, 10, 10, 12, 10, 10, 10, 10, 10, 10, 12, 5, 10, 10, 10, 10, 10, 10, 10, 11, 10, 10, 10, 10]
TITLES = [
    "Центральный и вписанный углы", "Центральный угол по вписанному",
    "Углы по разные стороны диаметра", "Треугольник на диаметре",
    "Вписанный угол и центральный угол", "Катет треугольника на диаметре",
    "Второй катет треугольника на диаметре", "Описанная окружность прямоугольного треугольника",
    "Описанная окружность равностороннего треугольника", "Сторона равностороннего треугольника",
    "Описанная окружность и угол 30°", "Равносторонний треугольник по радиусу вписанной окружности",
    "Прямоугольник в окружности", "Вписанная трапеция: соседние углы",
    "Вписанная трапеция: противоположные углы", "Углы вписанного четырёхугольника: разность",
    "Углы вписанного четырёхугольника: сумма", "Противоположные углы вписанного четырёхугольника",
    "Описанная окружность квадрата", "Сторона квадрата по радиусу описанной окружности",
    "Квадрат и окружность с центром на стороне", "Угол между касательными",
    "Равносторонний треугольник по радиусу вписанной окружности",
    "Радиус вписанной окружности равностороннего треугольника",
    "Площадь треугольника по периметру и радиусу", "Вписанная окружность квадрата",
    "Площадь квадрата около окружности", "Диагональ квадрата по радиусу вписанной окружности",
    "Ромб и вписанная окружность", "Высота равнобедренной трапеции",
    "Высота прямоугольной трапеции", "Высота трапеции с вписанной окружностью",
    "Сторона описанного четырёхугольника", "Основание описанной трапеции",
]


def load_images() -> list[list[str]]:
    all_images = []
    for number, count in enumerate(COUNTS, 1):
        path = ROOT / f"task16-data-{number:02}.js"
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
        all_images.append(images)
    return all_images


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


def card(condition: str, image: str) -> str:
    return (
        '<div class="table-wrapper">\n<table class="latex-table table-with-image">\n<tr>\n'
        f"<th>{condition}</th>\n"
        f'<th><div class="center">{image}</div></th>\n'
        "</tr>\n</table>\n</div>"
    )


def make_item(number: int, index: int, condition: str, value: Fraction | int, kind: str, params: dict, image: str) -> dict:
    return {
        "id": f"16.{number}.{index}",
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
            (angle,) = row
            text = rf"В окружности с центром \(O\) отрезки \(AC\) и \(BD\) являются диаметрами. Центральный угол \(AOD\) равен \({angle}^\circ\). Найдите вписанный угол \(ACB\)."
            items.append(make_item(number, index, text, Fraction(180 - angle, 2), "inscribed-from-central", {"central_angle": angle}, image))
        elif number == 2:
            (angle,) = row
            text = rf"Отрезки \(AC\) и \(BD\) — диаметры окружности с центром \(O\). Вписанный угол \(ACB\) равен \({angle}^\circ\). Вычислите центральный угол \(AOD\)."
            items.append(make_item(number, index, text, 180 - 2 * angle, "central-from-inscribed", {"inscribed_angle": angle}, image))
        elif number == 3:
            (angle,) = row
            text = rf"Точки \(M\) и \(N\) расположены по разные стороны от диаметра \(AB\). Если \(\angle NBA={angle}^\circ\), найдите \(\angle NMB\)."
            items.append(make_item(number, index, text, 90 - angle, "semicircle-opposite-angle", {"known_angle": angle}, image))
        elif number == 4:
            (angle,) = row
            text = rf"Центр окружности, описанной около треугольника \(ABC\), находится на стороне \(AB\). Угол \(BAC\) равен \({angle}^\circ\). Определите угол \(ABC\)."
            items.append(make_item(number, index, text, 90 - angle, "diameter-right-triangle-angle", {"known_angle": angle}, image))
        elif number == 5:
            (angle,) = row
            text = rf"Треугольник \(ABC\) вписан в окружность с центром \(O\); точки \(O\) и \(C\) лежат по одну сторону от \(AB\). Если \(\angle AOB={angle}^\circ\), найдите \(\angle ACB\)."
            items.append(make_item(number, index, text, Fraction(angle, 2), "inscribed-from-central-direct", {"central_angle": angle}, image))
        elif number in (6, 7):
            radius, known_leg = row
            square = (2 * radius) ** 2 - known_leg ** 2
            missing = math.isqrt(square)
            if missing * missing != square:
                raise ValueError((number, row))
            if number == 6:
                text = rf"Центр описанной около \(ABC\) окружности лежит на \(AB\). Радиус равен \({radius}\), а \(BC={known_leg}\). Найдите \(AC\)."
                kind = "diameter-right-triangle-leg"
            else:
                text = rf"Сторона \(AB\) треугольника \(ABC\) проходит через центр описанной окружности. Радиус равен \({radius}\), а \(AC={known_leg}\). Найдите \(BC\)."
                kind = "diameter-right-triangle-other-leg"
            items.append(make_item(number, index, text, missing, kind, {"radius": radius, "known_leg": known_leg}, image))
        elif number == 8:
            a, b = row
            hypotenuse = math.isqrt(a * a + b * b)
            text = rf"Катеты прямоугольного треугольника равны \({a}\) и \({b}\). Найдите радиус окружности, описанной около этого треугольника."
            items.append(make_item(number, index, text, Fraction(hypotenuse, 2), "right-triangle-circumradius", {"leg_a": a, "leg_b": b}, image))
        elif number == 9:
            (coefficient,) = row
            text = rf"Сторона равностороннего треугольника равна \({coefficient}\sqrt{{3}}\). Вычислите радиус описанной около него окружности."
            items.append(make_item(number, index, text, coefficient, "equilateral-circumradius-from-side", {"sqrt3_coefficient": coefficient}, image))
        elif number == 10:
            (coefficient,) = row
            text = rf"Радиус окружности, описанной около равностороннего треугольника, равен \({coefficient}\sqrt{{3}}\). Найдите сторону треугольника."
            items.append(make_item(number, index, text, 3 * coefficient, "equilateral-side-from-circumradius", {"sqrt3_coefficient": coefficient}, image))
        elif number == 11:
            (side,) = row
            text = rf"В треугольнике \(ABC\) угол \(C\) равен \(30^\circ\), а противолежащая сторона \(AB={side}\). Найдите радиус описанной окружности."
            items.append(make_item(number, index, text, side, "circumradius-from-thirty-degree-side", {"opposite_side": side}, image))
        elif number == 12:
            (side,) = row
            text = rf"Расстояние от центра окружности, вписанной в равносторонний треугольник, до его стороны равно \(\dfrac{{{side}\sqrt{{3}}}}{{6}}\). Найдите сторону треугольника."
            items.append(make_item(number, index, text, side, "equilateral-side-from-inradius", {"side": side}, image))
        elif number == 13:
            diameter, sin_num, sin_den, cos_num, cos_den = row
            text = rf"Диагональ прямоугольника равна \({diameter}\), а синус угла между диагональю и стороной равен \(\dfrac{{{sin_num}}}{{{sin_den}}}\). Найдите площадь прямоугольника."
            value = Fraction(diameter * diameter * sin_num * cos_num, sin_den * cos_den)
            params = {"diameter": diameter, "sin_num": sin_num, "sin_den": sin_den, "cos_num": cos_num, "cos_den": cos_den}
            items.append(make_item(number, index, text, value, "rectangle-area-from-diagonal", params, image))
        elif number in (14, 15):
            (angle,) = row
            target = r"угол \(B\)" if number == 14 else r"угол \(C\)"
            relation = "соседний" if number == 14 else "противоположный"
            text = rf"Трапеция \(ABCD\) с основаниями \(AD\) и \(BC\) вписана в окружность. Если \(\angle A={angle}^\circ\), найдите {relation} {target}."
            kind = "cyclic-trapezoid-adjacent-angle" if number == 14 else "cyclic-trapezoid-opposite-angle"
            items.append(make_item(number, index, text, 180 - angle, kind, {"known_angle": angle}, image))
        elif number == 16:
            whole, part = row
            text = rf"Четырёхугольник \(ABCD\) вписан в окружность. Известно, что \(\angle ABC={whole}^\circ\), а \(\angle CAD={part}^\circ\). Найдите \(\angle ABD\)."
            items.append(make_item(number, index, text, whole - part, "cyclic-quadrilateral-angle-difference", {"whole_angle": whole, "part_angle": part}, image))
        elif number == 17:
            angle_a, angle_b = row
            text = rf"Четырёхугольник \(ABCD\) вписан в окружность. Углы \(ABD\) и \(CAD\) равны \({angle_a}^\circ\) и \({angle_b}^\circ\). Найдите \(\angle ABC\)."
            items.append(make_item(number, index, text, angle_a + angle_b, "cyclic-quadrilateral-angle-sum", {"angle_a": angle_a, "angle_b": angle_b}, image))
        elif number == 18:
            (angle,) = row
            text = rf"Вписанный в окружность четырёхугольник \(ABCD\) имеет угол \(A={angle}^\circ\). Найдите противоположный угол \(C\)."
            items.append(make_item(number, index, text, 180 - angle, "cyclic-quadrilateral-opposite-angle", {"known_angle": angle}, image))
        elif number == 19:
            (coefficient,) = row
            text = rf"Сторона квадрата равна \({coefficient}\sqrt{{2}}\). Найдите радиус окружности, описанной около квадрата."
            items.append(make_item(number, index, text, coefficient, "square-circumradius-from-side", {"sqrt2_coefficient": coefficient}, image))
        elif number == 20:
            (coefficient,) = row
            text = rf"Радиус окружности, описанной около квадрата, равен \({coefficient}\sqrt{{2}}\). Вычислите длину стороны квадрата."
            items.append(make_item(number, index, text, 2 * coefficient, "square-side-from-circumradius", {"sqrt2_coefficient": coefficient}, image))
        elif number == 21:
            (radius,) = row
            text = rf"Точка \(O\) — середина стороны \(CD\) квадрата \(ABCD\). Окружность с центром \(O\), проходящая через \(A\), имеет радиус \({radius}\). Найдите площадь квадрата."
            items.append(make_item(number, index, text, Fraction(4 * radius * radius, 5), "square-area-from-midpoint-circle", {"radius": radius}, image))
        elif number == 22:
            (angle,) = row
            text = rf"Касательные в точках \(A\) и \(B\) к окружности с центром \(O\) образуют угол \({angle}^\circ\). Найдите \(\angle ABO\)."
            items.append(make_item(number, index, text, Fraction(angle, 2), "tangent-angle-base", {"tangent_angle": angle}, image))
        elif number == 23:
            (coefficient,) = row
            text = rf"Радиус окружности, вписанной в равносторонний треугольник, равен \({coefficient}\sqrt{{3}}\). Найдите сторону треугольника."
            items.append(make_item(number, index, text, 6 * coefficient, "equilateral-side-from-inradius-sqrt3", {"sqrt3_coefficient": coefficient}, image))
        elif number == 24:
            (coefficient,) = row
            text = rf"Сторона равностороннего треугольника равна \({coefficient}\sqrt{{3}}\). Найдите радиус вписанной окружности."
            items.append(make_item(number, index, text, Fraction(coefficient, 2), "equilateral-inradius-from-side", {"sqrt3_coefficient": coefficient}, image))
        elif number == 25:
            perimeter, given_side, inradius = row
            text = rf"Периметр треугольника равен \({perimeter}\), одна сторона равна \({given_side}\), а радиус вписанной окружности равен \({inradius}\). Найдите площадь треугольника."
            params = {"perimeter": perimeter, "given_side": given_side, "inradius": inradius}
            items.append(make_item(number, index, text, Fraction(perimeter * inradius, 2), "triangle-area-from-perimeter-inradius", params, image))
        elif number == 26:
            (side,) = row
            text = rf"Сторона квадрата равна \({side}\). Вычислите радиус окружности, вписанной в квадрат."
            items.append(make_item(number, index, text, Fraction(side, 2), "square-inradius", {"side": side}, image))
        elif number == 27:
            (radius,) = row
            text = rf"Квадрат описан около окружности радиуса \({radius}\). Найдите площадь квадрата."
            items.append(make_item(number, index, text, 4 * radius * radius, "circumscribed-square-area", {"radius": radius}, image))
        elif number == 28:
            (coefficient,) = row
            text = rf"Радиус окружности, вписанной в квадрат, равен \({coefficient}\sqrt{{2}}\). Найдите диагональ квадрата."
            items.append(make_item(number, index, text, 4 * coefficient, "square-diagonal-from-inradius", {"sqrt2_coefficient": coefficient}, image))
        elif number == 29:
            diagonal, tan_num, tan_den, ratio_hyp = row
            text = rf"Диагональ \(AC\) ромба \(ABCD\) равна \({diagonal}\), а \(\operatorname{{tg}}\angle BCA=\dfrac{{{tan_num}}}{{{tan_den}}}\). Найдите радиус вписанной окружности."
            params = {"diagonal": diagonal, "tan_num": tan_num, "tan_den": tan_den, "ratio_hyp": ratio_hyp}
            items.append(make_item(number, index, text, Fraction(diagonal * tan_num, 2 * ratio_hyp), "rhombus-inradius", params, image))
        elif number in (30, 31, 32):
            (radius,) = row
            names = {30: "равнобедренную", 31: "прямоугольную", 32: ""}
            adjective = f"{names[number]} " if names[number] else ""
            text = rf"В {adjective}трапецию вписана окружность радиуса \({radius}\). Найдите высоту трапеции."
            kinds = {30: "isosceles-trapezoid-height", 31: "right-trapezoid-height", 32: "tangential-trapezoid-height"}
            items.append(make_item(number, index, text, 2 * radius, kinds[number], {"radius": radius}, image))
        elif number in (33, 34):
            side_a, side_b, side_c = row
            if number == 33:
                text = rf"Четырёхугольник \(ABCD\) описан около окружности. Известно, что \(AB={side_a}\), \(BC={side_b}\), \(CD={side_c}\). Найдите \(AD\)."
                kind = "tangential-quadrilateral-side"
            else:
                text = rf"Трапеция \(ABCD\) с основаниями \(AD\) и \(BC\) описана около окружности. Если \(AB={side_a}\), \(BC={side_b}\), \(CD={side_c}\), найдите \(AD\)."
                kind = "tangential-trapezoid-base"
            params = {"side_a": side_a, "side_b": side_b, "side_c": side_c}
            items.append(make_item(number, index, text, side_a + side_c - side_b, kind, params, image))
        else:
            raise ValueError(number)
    return items


ROWS = [
    [(38,), (46,), (58,), (66,), (78,), (94,), (102,), (116,), (132,), (154,)],
    [(13,), (21,), (27,), (34,), (39,), (43,), (51,), (57,), (64,), (73,)],
    [(18,), (24,), (29,), (35,), (41,), (47,), (53,), (61,), (68,), (74,)],
    [(12,), (17,), (23,), (28,), (34,), (39,), (46,), (52,), (61,), (67,)],
    [(48,), (64,), (76,), (88,), (104,), (118,), (132,), (146,), (158,), (166,)],
    [(13, 24), (17, 30), (25, 48), (29, 42), (37, 70)],
    [(13, 10), (17, 16), (25, 14), (29, 40), (37, 24)],
    [(5, 12), (8, 15), (7, 24), (20, 21), (12, 35), (9, 40), (28, 45), (11, 60), (33, 56), (48, 55)],
    [(4,), (5,), (7,), (8,), (10,), (11,), (13,), (14,), (16,), (17,)],
    [(3,), (4,), (6,), (7,), (9,), (10,), (12,), (13,), (15,), (18,)],
    [(7,), (9,), (11,), (13,), (15,), (17,), (19,), (21,), (23,), (25,)],
    [(2,), (3,), (4,), (5,), (7,), (8,), (9,), (10,), (11,), (13,)],
    [(10, 3, 5, 4, 5), (15, 3, 5, 4, 5), (20, 3, 5, 4, 5), (25, 3, 5, 4, 5), (26, 5, 13, 12, 13), (34, 8, 17, 15, 17), (39, 5, 13, 12, 13), (50, 7, 25, 24, 25), (51, 8, 17, 15, 17), (65, 5, 13, 12, 13)],
    [(28,), (36,), (43,), (51,), (59,), (67,), (74,), (82,), (96,), (107,), (119,), (133,)],
    [(31,), (39,), (47,), (56,), (64,), (73,), (81,), (94,), (108,), (127,)],
    [(101, 34), (108, 41), (116, 53), (123, 57), (131, 64), (139, 72), (146, 79), (154, 86), (162, 91), (169, 98)],
    [(17, 28), (22, 31), (26, 37), (31, 43), (35, 49), (39, 52), (44, 57), (48, 63), (53, 68), (59, 74)],
    [(27,), (38,), (49,), (57,), (66,), (75,), (84,), (96,), (113,), (129,)],
    [(3,), (5,), (6,), (8,), (9,), (11,), (12,), (14,), (15,), (17,)],
    [(3,), (5,), (7,), (8,), (10,), (12,), (13,), (15,), (16,), (18,)],
    [(5,), (10,), (15,), (20,), (25,), (30,), (35,), (40,), (45,), (50,), (55,), (60,)],
    [(38,), (52,), (66,), (74,), (88,)],
    [(1,), (2,), (3,), (4,), (5,), (6,), (7,), (8,), (9,), (10,)],
    [(4,), (6,), (8,), (10,), (12,), (14,), (16,), (18,), (20,), (22,)],
    [(28, 7, 2), (32, 9, 3), (36, 11, 2), (40, 13, 4), (44, 15, 3), (48, 17, 2), (52, 19, 4), (56, 21, 3), (60, 23, 2), (64, 25, 4)],
    [(8,), (10,), (12,), (14,), (16,), (18,), (20,), (22,), (24,), (26,)],
    [(3,), (4,), (5,), (6,), (7,), (8,), (9,), (10,), (11,), (12,)],
    [(1,), (2,), (3,), (4,), (5,), (6,), (7,), (8,), (9,), (10,)],
    [(10, 3, 4, 5), (10, 4, 3, 5), (26, 5, 12, 13), (26, 12, 5, 13), (34, 8, 15, 17), (34, 15, 8, 17), (50, 7, 24, 25), (50, 24, 7, 25), (58, 20, 21, 29), (58, 21, 20, 29)],
    [(7,), (9,), (11,), (13,), (15,), (17,), (19,), (21,), (23,), (25,), (27,)],
    [(6,), (8,), (10,), (12,), (14,), (16,), (18,), (20,), (22,), (24,)],
    [(5,), (7,), (9,), (11,), (13,), (15,), (17,), (19,), (21,), (23,)],
    [(8, 7, 12), (9, 6, 14), (11, 9, 15), (13, 8, 17), (14, 11, 19), (16, 10, 21), (17, 13, 22), (19, 12, 25), (21, 16, 27), (23, 18, 29)],
    [(9, 6, 14), (11, 7, 16), (13, 8, 18), (15, 9, 21), (17, 10, 23), (19, 12, 26), (21, 14, 28), (23, 15, 31), (25, 18, 34), (27, 20, 36)],
]


def main() -> None:
    images = load_images()
    for number, (count, title, rows, type_images) in enumerate(zip(COUNTS, TITLES, ROWS, images), 1):
        items = build(number, rows, type_images)
        if len(items) != count:
            raise ValueError(f"16.{number}: expected {count} items, got {len(items)}")
        prototype = {"id": f"16.{number}", "title": title, "items": items}
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target = ROOT / f"task16-data-{number:02}.js"
        target.write_text(
            "window.OgeTask16DataPrototypes = window.OgeTask16DataPrototypes || [];\n"
            f"window.OgeTask16DataPrototypes.push({payload});\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
