"""Generate the authored task 10 probability bank with stable public ids."""
from __future__ import annotations

import json
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = [10, 16, 16, 16, 8, 17, 10, 16, 10, 6, 10, 16, 16, 10, 10, 10, 10, 10]
TITLES = [
    "Вероятность по числу исходов",
    "Случайный выбор жетона",
    "Выбор предмета из нескольких групп",
    "Равновозможное распределение подарков",
    "Случайный порядок участников",
    "Выбор подготовленного вопроса",
    "Выбор предмета по цвету",
    "Объединение двух групп",
    "Последовательный выбор без возвращения",
    "Два независимых вращения",
    "Относительная частота события",
    "Оценка доли исправных изделий",
    "Вероятность противоположного события",
    "Диаграмма с вероятностями областей",
    "Диаграмма с равновозможными исходами",
    "Диаграмма с вероятностями исходов",
    "Диаграмма с числом исходов",
    "Дерево случайного опыта",
]


def answer(favorable: int, total: int) -> str:
    value = Fraction(favorable, total)
    denominator = value.denominator
    while denominator % 2 == 0:
        denominator //= 2
    while denominator % 5 == 0:
        denominator //= 5
    if denominator != 1:
        raise ValueError(f"Non-terminating probability: {favorable}/{total}")
    return f"{float(value):.8f}".rstrip("0").rstrip(".")


def wrapped(text: str, total: int, favorable: int) -> str:
    return f'<span data-total="{total}" data-favorable="{favorable}">{text}</span>'


def simple_values(kind: int, index: int) -> tuple[int, int]:
    totals = (20, 25, 40, 50, 100)
    total = totals[(index + kind) % len(totals)]
    tenths = (2, 3, 4, 5, 6, 7, 8, 9)
    favorable = total * tenths[(index * 3 + kind) % len(tenths)] // 10
    return total, favorable


def build_text(kind: int, index: int) -> tuple[str, int, int]:
    total, favorable = simple_values(kind, index)
    number = index + 1
    if kind == 1:
        return (
            f"В учебной игре предусмотрено ${total}$ равновозможных карточек. На ${favorable}$ карточках есть звезда. "
            "Найдите вероятность получить карточку со звездой.", total, favorable
        )
    if kind == 2:
        return (
            f"В непрозрачном мешке лежат ${total}$ одинаковых жетонов, из них ${favorable}$ серебристых. "
            "Один жетон выбирают наугад. Найдите вероятность выбрать серебристый жетон.", total, favorable
        )
    if kind == 3:
        other = max(1, (total - favorable) // 3)
        return (
            f"На стойке размещено ${total}$ одинаковых конвертов: ${favorable}$ с синей меткой, ${other}$ с зелёной, "
            "остальные с белой. Один конверт выбирают случайно. Найдите вероятность синей метки.", total, favorable
        )
    if kind == 4:
        return (
            f"Для класса подготовили ${total}$ одинаково упакованных сувениров. На ${favorable}$ из них внутри блокнот, "
            "на остальных — значок. Сувениры распределяют случайно. Найдите вероятность получить блокнот.", total, favorable
        )
    if kind == 5:
        return (
            f"В жеребьёвке участвуют ${total}$ команд, в том числе ${favorable}$ команд из северной группы. "
            "Порядок выступлений случаен. Найдите вероятность, что первой окажется команда северной группы.", total, favorable
        )
    if kind == 6:
        learned = favorable
        return (
            f"Для устного зачёта составили ${total}$ карточек. Ученик подготовил ответы к ${learned}$ карточкам. "
            "Карточка выбирается случайно. Найдите вероятность получить подготовленный вопрос.", total, learned
        )
    if kind == 7:
        return (
            f"В коробке находится ${total}$ одинаковых маркеров, из них ${favorable}$ фиолетовых. "
            "Маркер достают не глядя. Найдите вероятность достать фиолетовый маркер.", total, favorable
        )
    if kind == 8:
        first = favorable // 2
        second = favorable - first
        return (
            f"На складе лежит ${total}$ наборов: ${first}$ учебных, ${second}$ творческих и остальные спортивные. "
            f"Учебных и творческих наборов вместе ${favorable}$. Найдите вероятность случайно выбрать набор одного из этих двух видов.",
            total, favorable
        )
    if kind == 9:
        return (
            f"После первого извлечения без возвращения в коробке осталось ${total}$ жетонов, среди них ${favorable}$ синих. "
            "Второй жетон выбирают наугад. Найдите вероятность того, что он окажется синим.", total, favorable
        )
    if kind == 10:
        events = [
            (2, "сумма чисел равна 3"),
            (4, "на обоих волчках выпали одинаковые числа"),
            (6, "число на первом волчке больше числа на втором"),
            (8, "сумма выпавших чисел чётная"),
            (10, "число на первом волчке не меньше числа на втором"),
            (12, "на волчках выпали разные числа"),
        ]
        favorable, event = events[index]
        total = 16
        return (
            f"Два волчка независимо вращают один раз. Каждый равновероятно показывает 1, 2, 3 или 4, поэтому всего ${total}$ "
            f"упорядоченных исходов. Условию «{event}» отвечают ${favorable}$ исходов. Найдите вероятность этого события.",
            total, favorable
        )
    if kind == 11:
        return (
            f"Датчик проверили в ${total}$ независимых испытаниях. Сигнал появился ${favorable}$ раз. "
            "Найдите относительную частоту появления сигнала.", total, favorable
        )
    if kind == 12:
        return (
            f"При контрольной проверке осмотрели ${total}$ изделий; ${favorable}$ из них оказались исправными. "
            "По результатам проверки оцените вероятность выбрать исправное изделие.", total, favorable
        )
    if kind == 13:
        return (
            f"Из ${total}$ выполненных рейсов ${favorable}$ завершились без задержки. "
            "Используя эти данные, оцените вероятность события, противоположного задержке рейса.", total, favorable
        )
    raise ValueError(kind)


DIAGRAM_EVENTS = {
    14: [
        ("A \\cup \\overline{B}", 0.8), ("A \\cap B", 0.1), ("\\overline{A} \\cap B", 0.2),
        ("B", 0.3), ("A \\cap \\overline{B}", 0.3), ("A", 0.4),
        ("\\overline{A \\cup B}", 0.4), ("A \\cup B", 0.6), ("\\overline{A} \\cup B", 0.7),
        ("\\overline{A \\cap B}", 0.9),
    ],
    15: [
        ("A \\cup \\overline{B}", 0.6), ("\\overline{A \\cup B}", 0.1), ("A \\cap B", 0.2),
        ("A \\cap \\overline{B}", 0.3), ("\\overline{A} \\cap B", 0.4), ("A", 0.5),
        ("B", 0.6), ("\\overline{A} \\cup B", 0.7), ("\\overline{A \\cap B}", 0.8),
        ("A \\cup B", 0.9),
    ],
    16: [
        ("A", 0.7), ("\\overline{A} \\cap B", 0.15), ("\\overline{A \\cup B}", 0.15),
        ("A \\cap \\overline{B}", 0.3), ("A \\cap B", 0.4), ("B", 0.55),
        ("\\overline{A \\cap B}", 0.6), ("\\overline{A} \\cup B", 0.7), ("A \\cup B", 0.85),
        ("A \\cup \\overline{B}", 0.85),
    ],
    17: [
        ("A \\cup B", 0.6), ("A \\cap B", 0.1), ("\\overline{A} \\cap B", 0.2),
        ("B", 0.3), ("A \\cap \\overline{B}", 0.3), ("A", 0.4),
        ("\\overline{A \\cup B}", 0.4), ("\\overline{A} \\cup B", 0.7),
        ("A \\cup \\overline{B}", 0.8), ("\\overline{A \\cap B}", 0.9),
    ],
}
DIAGRAM_IMAGES = {14: "probabilities-4.svg", 15: "probabilities-1.svg", 16: "probabilities-2.svg", 17: "probabilities-3.svg"}
TREE_IMAGES = [
    "probabilities-5.svg", "probabilities-13.svg", "probabilities-8.svg", "probabilities-10.svg",
    "probabilities-6.svg", "probabilities-7.svg", "probabilities-12.svg", "probabilities-14.svg",
    "probabilities-9.svg", "probabilities-11.svg",
]
TREE_B = [0.75, 0.25, 0.3, 0.3, 0.5, 0.5, 0.5, 0.5, 0.75, 0.75]


def build_diagram(kind: int, index: int) -> tuple[str, int, int]:
    if kind == 18:
        source_probability = TREE_B[index]
        event = r"\overline{B}"
        image = TREE_IMAGES[index]
        description = "На дереве показаны вероятности переходов. Найдите вероятность события, противоположного событию"
    else:
        source_event, source_probability = DIAGRAM_EVENTS[kind][index]
        event = rf"\overline{{({source_event})}}"
        image = DIAGRAM_IMAGES[kind]
        if kind == 14:
            description = "В областях диаграммы указаны их вероятности. Найдите вероятность события, противоположного событию"
        elif kind == 15:
            description = "Точки на диаграмме обозначают равновозможные исходы. Найдите вероятность события, противоположного событию"
        elif kind == 16:
            description = "Около каждого исхода указана его вероятность. Найдите вероятность события, противоположного событию"
        else:
            description = "В областях диаграммы указано число равновозможных исходов. Найдите вероятность события, противоположного событию"
    favorable = round((1 - source_probability) * 100)
    text = (
        f'<span data-total="100" data-favorable="{favorable}">{description} ${event}$.</span>'
        f'<img src="task10-drawings/{image}" alt="Схема к заданию {kind}.{index + 1}">'
    )
    return text, 100, favorable


def main() -> None:
    for kind, count in enumerate(COUNTS, 1):
        items = []
        for index in range(count):
            if kind <= 13:
                text, total, favorable = build_text(kind, index)
                task_html = wrapped(text, total, favorable)
            else:
                task_html, total, favorable = build_diagram(kind, index)
            items.append({
                "id": f"10.{kind}.{index + 1}",
                "taskHtml": task_html,
                "answer": answer(favorable, total),
                "format": "number",
            })
        prototype = {"id": f"10.{kind}", "title": TITLES[kind - 1], "items": items}
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target = ROOT / f"task10-data-{kind:02}.js"
        target.write_text(
            "window.OgeTask10DataPrototypes = window.OgeTask10DataPrototypes || [];\n"
            f"window.OgeTask10DataPrototypes.push({payload});\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
