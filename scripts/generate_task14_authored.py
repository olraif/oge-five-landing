"""Generate the authored task 14 progression bank with verified answers."""
from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
D = Decimal
COUNTS = [10, 10, 10, 10, 10, 10, 20, 7, 10, 10, 10]
TITLES = [
    "Арифметическая прогрессия: нахождение члена",
    "Арифметическая прогрессия: восстановление последовательности",
    "Арифметическая прогрессия: сумма членов",
    "Равномерное изменение величины",
    "Сумма убывающей прогрессии",
    "Сумма до остановки",
    "Сумма возрастающей прогрессии",
    "Сумма членов прогрессии",
    "Геометрическая прогрессия: уменьшение",
    "Геометрическая прогрессия: увеличение",
    "Геометрическая прогрессия: достижение порога",
]


def number(value: Decimal | int | str) -> str:
    text = format(D(value).normalize(), "f")
    return "0" if text in ("", "-0") else text


def russian(value: Decimal | int | str) -> str:
    return number(value).replace(".", ",")


def authored(kind: int, values: dict[str, Decimal | int | str], text: str) -> str:
    attributes = " ".join(
        [f'data-kind="{kind}"']
        + [f'data-{name}="{number(value)}"' for name, value in values.items()]
    )
    return f'<span class="task14-authored" {attributes}></span>{text}'


def arithmetic_term(first: Decimal, difference: Decimal, position: int) -> Decimal:
    return first + D(position - 1) * difference


def arithmetic_sum(first: Decimal, difference: Decimal, count: int) -> Decimal:
    return D(count) * (D(2) * first + D(count - 1) * difference) / D(2)


def item(kind: int, index: int, text: str, values: dict[str, Decimal | int | str], answer: Decimal | int) -> dict[str, str]:
    return {
        "id": f"14.{kind}.{index}",
        "taskHtml": authored(kind, values, text),
        "answer": number(answer),
        "format": "number",
    }


def type_1() -> list[dict[str, str]]:
    rows = [
        (12, 18, 4, 9), (15, 27, 3, 12), (14, 16, 5, 10), (13, 22, 2, 11), (16, 15, 4, 13),
        (12, 31, 3, 8), (18, 20, 2, 15), (11, 24, 5, 7), (17, 19, 3, 14), (14, 28, 4, 12),
    ]
    result = []
    for index, (total, first, difference, position) in enumerate(rows, 1):
        text = (
            f"На выставочном стенде расположено ${total}$ горизонтальных полос. На первой полосе число значков равно ${first}$, "
            f"а на каждой следующей оно на ${difference}$ больше. Сколько значков находится на полосе номер ${position}$?"
        )
        result.append(item(1, index, text, {"a1": first, "d": difference, "n": position}, arithmetic_term(D(first), D(difference), position)))
    return result


def type_2() -> list[dict[str, str]]:
    rows = [
        (14, 4, 16, 3, 7), (25, 3, 15, 4, 9), (11, 5, 14, 2, 6), (30, 2, 18, 5, 11), (9, 6, 12, 3, 8),
        (18, 4, 17, 6, 10), (22, 3, 14, 2, 12), (16, 5, 13, 4, 7), (27, 2, 20, 8, 13), (12, 4, 15, 5, 10),
    ]
    result = []
    for index, (first, difference, total, left_position, right_position) in enumerate(rows, 1):
        left = arithmetic_term(D(first), D(difference), left_position)
        right = arithmetic_term(D(first), D(difference), right_position)
        answer = arithmetic_term(D(first), D(difference), total)
        text = (
            f"На многоярусном складе ${total}$ полок. Количество контейнеров на соседних полках увеличивается на одно и то же число. "
            f"На полке номер ${left_position}$ количество контейнеров равно ${russian(left)}$, а на полке номер ${right_position}$ — ${russian(right)}$. "
            f"Сколько контейнеров находится на полке номер ${total}$?"
        )
        result.append(item(2, index, text, {"a1": first, "d": difference, "n": total, "i": left_position, "j": right_position}, answer))
    return result


def type_3() -> list[dict[str, str]]:
    rows = [(12, 14, 3), (15, 20, 2), (10, 17, 4), (14, 11, 5), (16, 23, 2), (13, 18, 3), (11, 25, 4), (18, 10, 2), (12, 21, 5), (15, 16, 3)]
    result = []
    for index, (count, first, difference) in enumerate(rows, 1):
        text = (
            f"Для городского праздника фонари установили в ${count}$ рядов. В первом ряду число фонарей равно ${first}$, "
            f"а в каждом следующем оно на ${difference}$ больше. Сколько всего фонарей установили?"
        )
        result.append(item(3, index, text, {"a1": first, "d": difference, "n": count}, arithmetic_sum(D(first), D(difference), count)))
    return result


def type_4() -> list[dict[str, str]]:
    rows = [(18, -4, 5), (12, -3, 7), (-5, -2, 6), (24, -5, 8), (7, -4, 4), (15, -6, 5), (-2, -3, 7), (20, -7, 4), (9, -5, 6), (30, -8, 5)]
    result = []
    for index, (initial, change, minutes) in enumerate(rows, 1):
        answer = D(initial) + D(change) * D(minutes)
        text = (
            f"В испытательной камере температура в начальный момент была равна ${initial}^\\circ C$. После включения охлаждения "
            f"она каждую минуту уменьшалась на ${abs(change)}^\\circ C$. Какую температуру показал датчик через ${minutes}$ минут?"
        )
        result.append(item(4, index, text, {"a0": initial, "d": change, "t": minutes}, answer))
    return result


def type_5() -> list[dict[str, str]]:
    rows = [(32, -3, 6), (28, -2, 7), (40, -4, 6), (25, -3, 5), (36, -5, 6), (30, -2, 8), (27, -4, 5), (45, -5, 7), (34, -3, 7), (24, -2, 6)]
    result = []
    for index, (first, difference, count) in enumerate(rows, 1):
        text = (
            f"Робот очищал дорожку отдельными проходами. За первый проход он очистил ${first}$ м, а за каждый следующий — "
            f"на ${abs(difference)}$ м меньше. Сколько метров дорожки робот очистил за первые ${count}$ проходов?"
        )
        result.append(item(5, index, text, {"a1": first, "d": difference, "n": count}, arithmetic_sum(D(first), D(difference), count)))
    return result


def type_6() -> list[dict[str, str]]:
    rows = [(24, -4), (30, -5), (28, -4), (36, -6), (32, -4), (42, -6), (35, -5), (40, -5), (27, -3), (48, -6)]
    result = []
    for index, (first, difference) in enumerate(rows, 1):
        count = first // abs(difference)
        assert arithmetic_term(D(first), D(difference), count) > 0
        assert arithmetic_term(D(first), D(difference), count + 1) == 0
        text = (
            f"Самоходная тележка двигалась до полной остановки. За первую минуту она прошла ${first}$ м, а за каждую следующую — "
            f"на ${abs(difference)}$ м меньше. Какой путь прошла тележка до остановки?"
        )
        result.append(item(6, index, text, {"a1": first, "d": difference, "n": count}, arithmetic_sum(D(first), D(difference), count)))
    return result


def type_7() -> list[dict[str, str]]:
    rows = [
        ("0.8", "0.2", 8), ("1.2", "0.3", 7), ("0.5", "0.4", 9), ("1.5", "0.2", 10), ("0.7", "0.5", 6),
        ("2.0", "0.3", 8), ("0.9", "0.4", 7), ("1.1", "0.2", 9), ("0.6", "0.3", 10), ("1.4", "0.4", 6),
        ("0.4", "0.2", 12), ("1.3", "0.5", 7), ("0.3", "0.4", 8), ("1.6", "0.2", 11), ("0.9", "0.5", 9),
        ("1.8", "0.3", 6), ("0.7", "0.2", 10), ("1.2", "0.4", 8), ("0.5", "0.3", 11), ("1.0", "0.6", 7),
    ]
    result = []
    for index, (first_text, difference_text, count) in enumerate(rows, 1):
        first, difference = D(first_text), D(difference_text)
        text = (
            f"Туристическая группа прошла на первом этапе ${russian(first)}$ км. Каждый следующий этап был на ${russian(difference)}$ км длиннее предыдущего. "
            f"Какое расстояние группа прошла за первые ${count}$ этапов? Ответ дайте в километрах."
        )
        result.append(item(7, index, text, {"a1": first, "d": difference, "n": count}, arithmetic_sum(first, difference, count)))
    return result


def type_8() -> list[dict[str, str]]:
    rows = [(8, 9, 5), (6, 11, 6), (10, 8, 7), (7, 12, 5), (9, 10, 6), (5, 13, 7), (11, 9, 8)]
    result = []
    for index, (first, difference, count) in enumerate(rows, 1):
        text = (
            f"Автоматическая буровая установка за первый рабочий цикл углубила скважину на ${first}$ см. За каждый следующий цикл установка углубляла её "
            f"на ${difference}$ см больше, чем за предыдущий. На сколько сантиметров углубилась скважина за первые ${count}$ циклов?"
        )
        result.append(item(8, index, text, {"a1": first, "d": difference, "n": count}, arithmetic_sum(D(first), D(difference), count)))
    return result


def type_9() -> list[dict[str, str]]:
    rows = [(768, 4, 6), (640, 5, 5), (960, 6, 6), (400, 8, 4), (512, 7, 7), (800, 10, 5), (320, 6, 6), (1024, 5, 8), (600, 9, 4), (720, 8, 5)]
    result = []
    for index, (initial, duration, steps) in enumerate(rows, 1):
        answer = D(initial) * D("0.5") ** steps
        text = (
            f"После каждого этапа фильтрации масса растворённого красителя уменьшается вдвое. Вначале в растворе было ${initial}$ мг красителя, "
            f"продолжительность одного этапа — ${duration}$ мин. Сколько миллиграммов красителя останется через ${duration * steps}$ мин?"
        )
        result.append(item(9, index, text, {"a0": initial, "q": "0.5", "steps": steps}, answer))
    return result


def type_10() -> list[dict[str, str]]:
    rows = [(2, 3, 5, 8), (5, 2, 6, 10), (4, 3, 4, 12), (3, 4, 4, 6), (6, 2, 5, 9), (2, 5, 4, 7), (7, 2, 4, 11), (3, 3, 6, 5), (8, 2, 5, 8), (5, 4, 3, 15)]
    result = []
    for index, (initial, ratio, steps, duration) in enumerate(rows, 1):
        answer = D(initial) * D(ratio) ** steps
        text = (
            f"В компьютерной модели начальное число светящихся объектов равно ${initial}$. Через каждые ${duration}$ секунд их число увеличивалось "
            f"в ${ratio}$ раза. Сколько объектов будет отображаться через ${duration * steps}$ секунд?"
        )
        result.append(item(10, index, text, {"a0": initial, "q": ratio, "steps": steps}, answer))
    return result


def type_11() -> list[dict[str, str]]:
    rows = [(96, 4), (80, 3), (72, 5), (64, "1.5"), (100, 4), (48, 2), (56, 4), (120, 5), (90, 3), (75, 5)]
    result = []
    for index, (first_value, threshold_value) in enumerate(rows, 1):
        first, threshold, ratio = D(first_value), D(threshold_value), D("0.5")
        value, position = first, 1
        while value >= threshold:
            value *= ratio
            position += 1
        text = (
            f"Амплитуда первого колебания измерительного маятника равна ${russian(first)}$ см. Амплитуда каждого следующего колебания вдвое меньше предыдущей. "
            f"При каком по счёту колебании амплитуда впервые станет меньше ${russian(threshold)}$ см?"
        )
        result.append(item(11, index, text, {"a1": first, "q": ratio, "threshold": threshold}, position))
    return result


def main() -> None:
    builders = [type_1, type_2, type_3, type_4, type_5, type_6, type_7, type_8, type_9, type_10, type_11]
    for kind, (count, title, builder) in enumerate(zip(COUNTS, TITLES, builders), 1):
        items = builder()
        if len(items) != count:
            raise ValueError(f"14.{kind}: expected {count} items, got {len(items)}")
        prototype = {"id": f"14.{kind}", "title": title, "items": items}
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target = ROOT / f"task14-data-{kind:02}.js"
        target.write_text(
            "window.OgeTask14DataPrototypes = window.OgeTask14DataPrototypes || [];\n"
            f"window.OgeTask14DataPrototypes.push({payload});\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
