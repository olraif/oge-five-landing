"""Generate an authored task 19 bank of independently classified statements."""
from __future__ import annotations

import hashlib
import itertools
import json
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = {1: 88, 2: 63}


@dataclass(frozen=True)
class Statement:
    id: str
    text: str
    truth: bool


TRUE_STATEMENTS = [
    Statement("T01", "Сумма углов любого треугольника равна 180°.", True),
    Statement("T02", "Внешний угол треугольника равен сумме двух внутренних углов, не смежных с ним.", True),
    Statement("T03", "Каждая сторона треугольника меньше суммы двух других его сторон.", True),
    Statement("T04", "В прямоугольном треугольнике гипотенуза длиннее каждого катета.", True),
    Statement("T05", "В равнобедренном треугольнике углы при основании равны.", True),
    Statement("T06", "Три медианы треугольника пересекаются в одной точке.", True),
    Statement("T07", "Средняя линия треугольника параллельна одной из его сторон.", True),
    Statement("T08", "Противоположные стороны параллелограмма попарно равны.", True),
    Statement("T09", "Диагонали параллелограмма точкой пересечения делятся пополам.", True),
    Statement("T10", "Диагонали прямоугольника равны.", True),
    Statement("T11", "Диагонали ромба перпендикулярны.", True),
    Statement("T12", "Диагонали квадрата равны и перпендикулярны.", True),
    Statement("T13", "Средняя линия трапеции параллельна её основаниям.", True),
    Statement("T14", "Любой прямоугольник можно вписать в окружность.", True),
    Statement("T15", "Радиус, проведённый в точку касания, перпендикулярен касательной.", True),
    Statement("T16", "Вписанный угол, опирающийся на диаметр окружности, равен 90°.", True),
    Statement("T17", "Равные хорды одной окружности стягивают равные центральные углы.", True),
    Statement("T18", "Все радиусы одной окружности равны.", True),
    Statement("T19", "Вертикальные углы равны.", True),
    Statement("T20", "Сумма смежных углов равна 180°.", True),
    Statement("T21", "Две различные прямые, перпендикулярные одной прямой, параллельны.", True),
    Statement("T22", "Если две параллельные прямые пересечены секущей, то соответственные углы равны.", True),
    Statement("T23", "Площадь треугольника равна половине произведения основания на проведённую к нему высоту.", True),
    Statement("T24", "Площадь параллелограмма равна произведению основания на проведённую к нему высоту.", True),
]

FALSE_STATEMENTS = [
    Statement("F01", "Сумма углов любого треугольника равна 360°.", False),
    Statement("F02", "Внешний угол треугольника всегда равен смежному с ним внутреннему углу.", False),
    Statement("F03", "Если у двух треугольников равны две стороны, то такие треугольники обязательно равны.", False),
    Statement("F04", "Любая медиана треугольника перпендикулярна стороне, к которой она проведена.", False),
    Statement("F05", "Любая биссектриса треугольника делит противоположную сторону пополам.", False),
    Statement("F06", "В прямоугольном треугольнике гипотенуза равна сумме катетов.", False),
    Statement("F07", "В каждом остроугольном треугольнике есть прямой угол.", False),
    Statement("F08", "Диагонали любого параллелограмма равны.", False),
    Statement("F09", "Диагонали любого ромба равны.", False),
    Statement("F10", "Диагонали любого прямоугольника перпендикулярны.", False),
    Statement("F11", "Диагонали любой трапеции точкой пересечения делятся пополам.", False),
    Statement("F12", "Любой четырёхугольник можно вписать в окружность.", False),
    Statement("F13", "Любая хорда окружности проходит через её центр.", False),
    Statement("F14", "Касательная к окружности проходит через центр окружности.", False),
    Statement("F15", "Центральный угол вдвое меньше вписанного угла, опирающегося на ту же дугу.", False),
    Statement("F16", "У окружности существует только один диаметр.", False),
    Statement("F17", "Сумма любых двух вертикальных углов равна 180°.", False),
    Statement("F18", "Любые два смежных угла равны.", False),
    Statement("F19", "Две различные параллельные прямые пересекаются в одной точке.", False),
    Statement("F20", "Две перпендикулярные прямые не имеют общих точек.", False),
    Statement("F21", "Площадь квадрата равна удвоенной длине его стороны.", False),
    Statement("F22", "Площадь треугольника равна произведению основания на высоту.", False),
    Statement("F23", "Площадь параллелограмма равна половине произведения основания на высоту.", False),
    Statement("F24", "Длина окружности радиуса r равна πr.", False),
    Statement("F25", "Площадь круга радиуса r равна 2πr².", False),
]


def stable_order(combinations):
    return sorted(
        combinations,
        key=lambda combination: hashlib.sha256("|".join(statement.id for statement in combination).encode()).hexdigest(),
    )


def ordered_statements(kind: int, index: int, combination: tuple[Statement, Statement, Statement]) -> list[Statement]:
    true_statements = [statement for statement in combination if statement.truth]
    false_statements = [statement for statement in combination if not statement.truth]
    result: list[Statement | None] = [None, None, None]
    if kind == 1:
        true_position = index % 3
        result[true_position] = true_statements[0]
        remaining = iter(false_statements)
    else:
        false_position = index % 3
        result[false_position] = false_statements[0]
        remaining = iter(true_statements)
    for position in range(3):
        if result[position] is None:
            result[position] = next(remaining)
    return [statement for statement in result if statement is not None]


def task_html(kind: int, statements: list[Statement]) -> str:
    intro = "Какое из следующих утверждений является верным?" if kind == 1 else "Какие из следующих утверждений являются верными?"
    instruction = (
        "В ответ запишите номер верного утверждения."
        if kind == 1
        else "В ответ запишите номера верных утверждений без пробелов, запятых и других символов."
    )
    options = "".join(f'<li data-statement-id="{statement.id}">{statement.text}</li>' for statement in statements)
    return f"{intro}<ol>{options}</ol>{instruction}"


def build_items(kind: int) -> list[dict]:
    if kind == 1:
        combinations = itertools.product(TRUE_STATEMENTS, itertools.combinations(FALSE_STATEMENTS, 2))
        flattened = ((true_statement, *false_pair) for true_statement, false_pair in combinations)
    else:
        combinations = itertools.product(itertools.combinations(TRUE_STATEMENTS, 2), FALSE_STATEMENTS)
        flattened = ((*true_pair, false_statement) for true_pair, false_statement in combinations)
    selected = stable_order(flattened)[:COUNTS[kind]]
    items = []
    for zero_index, combination in enumerate(selected):
        statements = ordered_statements(kind, zero_index, combination)
        truth_mask = [statement.truth for statement in statements]
        answer = "".join(str(position) for position, truth in enumerate(truth_mask, 1) if truth)
        items.append({
            "id": f"19.{kind}.{zero_index + 1}",
            "taskHtml": task_html(kind, statements),
            "answer": answer,
            "format": "number" if kind == 1 else "unordered_digits",
            "authored": {
                "statement_ids": [statement.id for statement in statements],
                "truth_mask": truth_mask,
            },
        })
    return items


def main() -> None:
    prototypes = [
        {"id": "19.1", "title": "Выбор одного верного утверждения", "items": build_items(1)},
        {"id": "19.2", "title": "Выбор двух верных утверждений", "items": build_items(2)},
    ]
    used_ids = {
        statement_id
        for prototype in prototypes
        for item in prototype["items"]
        for statement_id in item["authored"]["statement_ids"]
    }
    expected_ids = {statement.id for statement in TRUE_STATEMENTS + FALSE_STATEMENTS}
    if used_ids != expected_ids:
        raise ValueError(f"Statement bank coverage mismatch: {sorted(expected_ids - used_ids)}")
    for kind, prototype in enumerate(prototypes, 1):
        target = ROOT / f"task19-data-{kind:02}.js"
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target.write_text(
            "window.OgeTask19DataPrototypes = window.OgeTask19DataPrototypes || [];\n"
            f"window.OgeTask19DataPrototypes.push({payload});\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()