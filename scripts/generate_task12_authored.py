"""Generate the authored task 12 formula bank with stable public ids."""
from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = [8, 4, 20, 20, 18, 20, 20, 20, 22, 23, 7]
TITLES = [
    "Стоимость партии изделий",
    "Стоимость доставки",
    "Фаренгейт в Цельсий",
    "Цельсий в Фаренгейт",
    "Выталкивающая сила",
    "Кинетическая энергия",
    "Потенциальная энергия",
    "Площадь по диагоналям",
    "Мощность электрического тока",
    "Движение по окружности",
    "Энергия конденсатора",
]
D = Decimal


def number(value: Decimal | int) -> str:
    value = D(value)
    text = format(value.normalize(), "f")
    return "0" if text in ("-0", "") else text


def russian(value: Decimal | int) -> str:
    return number(value).replace(".", ",")


def wrapper(kind: int, values: dict[str, Decimal | int], text: str) -> str:
    attributes = " ".join(
        [f'data-formula-type="{kind}"']
        + [f'data-{name}="{number(value)}"' for name, value in values.items()]
    )
    return f'<span class="task12-authored" {attributes}>{text}</span>'


def build(kind: int, index: int) -> tuple[str, str]:
    if kind == 1:
        base = D(4300 + 250 * index)
        unit = D(1200 + 100 * index)
        count = D(3 + index)
        answer = base + unit * count
        text = (
            f"В мастерской изготовление партии стендов оценивают по формуле $C = A + pn$, где $A = {russian(base)}$ руб. — подготовка оборудования, "
            f"$p = {russian(unit)}$ руб. — цена одного стенда, $n$ — количество стендов. Найдите стоимость партии из ${russian(count)}$ стендов. Ответ дайте в рублях."
        )
        values = {"base": base, "unit": unit, "count": count}
    elif kind == 2:
        base = D(900 + 150 * index)
        unit = D(180 + 20 * index)
        count = D(12 + 3 * index)
        answer = base + unit * count
        text = (
            f"Стоимость курьерской поездки вычисляют по формуле $C = A + pk$. В неё входят фиксированные ${russian(base)}$ руб. "
            f"и ${russian(unit)}$ руб. за каждый километр. Какова стоимость маршрута длиной ${russian(count)}$ км? Ответ дайте в рублях."
        )
        values = {"base": base, "unit": unit, "count": count}
    elif kind == 3:
        celsius = D(-40 + 5 * index)
        fahrenheit = celsius * D(9) / D(5) + D(32)
        answer = celsius
        text = (
            f"Для перевода температуры используют формулу $t_C = \\dfrac{{5}}{{9}}(t_F - 32)$. "
            f"Термометр показывает ${russian(fahrenheit)}^\\circ F$. Найдите температуру по шкале Цельсия."
        )
        values = {"fahrenheit": fahrenheit}
    elif kind == 4:
        celsius = D(-35 + 5 * index)
        answer = D("1.8") * celsius + D(32)
        text = (
            f"Температуры связаны формулой $t_F = 1{{,}}8t_C + 32$. "
            f"Переведите ${russian(celsius)}^\\circ C$ в градусы Фаренгейта."
        )
        values = {"celsius": celsius}
    elif kind == 5:
        density = D(1000)
        gravity = D("9.8")
        volume = D("0.01") * D(index + 2)
        answer = density * gravity * volume
        text = (
            f"Выталкивающая сила в воде вычисляется по формуле $F = \\rho gV$. Примите $\\rho = {russian(density)}$ кг/м³ и "
            f"$g = {russian(gravity)}$ м/с². Найдите силу для образца объёмом ${russian(volume)}$ м³. Ответ дайте в ньютонах."
        )
        values = {"density": density, "gravity": gravity, "volume": volume}
    elif kind == 6:
        mass = D(400 + 40 * index)
        speed = D(5 + index)
        energy = mass * speed * speed / D(2)
        answer = speed
        text = (
            f"Кинетическая энергия тележки определяется формулой $E = \\dfrac{{mv^2}}{{2}}$. "
            f"Масса тележки равна ${russian(mass)}$ кг, а её энергия — ${russian(energy)}$ Дж. Найдите скорость $v$ в м/с."
        )
        values = {"mass": mass, "energy": energy}
    elif kind == 7:
        mass = D(6 + index)
        gravity = D("9.8")
        height = D(3 + index % 5)
        energy = mass * gravity * height
        answer = mass
        text = (
            f"Потенциальную энергию груза находят по формуле $P = mgh$. При $g = {russian(gravity)}$ м/с² груз поднят на высоту "
            f"${russian(height)}$ м и имеет энергию ${russian(energy)}$ Дж. Найдите массу груза в килограммах."
        )
        values = {"energy": energy, "gravity": gravity, "height": height}
    elif kind == 8:
        first = D(4 + index)
        diagonal = D(6 + index % 5)
        sines = (D("0.5"), D("0.6"), D("0.8"))
        sine = sines[index % len(sines)]
        area = first * diagonal * sine / D(2)
        answer = first
        text = (
            f"Площадь четырёхугольника вычисляется по формуле $S = \\dfrac{{d_1d_2\\sin\\alpha}}{{2}}$. "
            f"Известно, что $S = {russian(area)}$, $d_2 = {russian(diagonal)}$, $\\sin\\alpha = {russian(sine)}$. Найдите $d_1$."
        )
        values = {"area": area, "diagonal": diagonal, "sine": sine}
    elif kind == 9:
        resistance = D(3 + index)
        current = D("0.5") + D("0.25") * D(index % 5)
        power = current * current * resistance
        answer = resistance
        text = (
            f"Мощность участка цепи вычисляют по формуле $P = I^2R$. При силе тока $I = {russian(current)}$ А "
            f"мощность равна ${russian(power)}$ Вт. Найдите сопротивление $R$ в омах."
        )
        values = {"power": power, "current": current}
    elif kind == 10:
        radius = D(4 + index)
        omega = D("0.4") + D("0.1") * D(index % 5)
        acceleration = omega * omega * radius
        answer = radius
        text = (
            f"Центростремительное ускорение связано с радиусом формулой $a = \\omega^2R$. "
            f"При $\\omega = {russian(omega)}$ с⁻¹ ускорение равно ${russian(acceleration)}$ м/с². Найдите радиус $R$ в метрах."
        )
        values = {"acceleration": acceleration, "omega": omega}
    else:
        capacitance = D("0.0001") * D(index + 1)
        voltage = D(8 + 2 * index)
        answer = capacitance * voltage * voltage / D(2)
        text = (
            f"Энергия конденсатора определяется формулой $W = \\dfrac{{CU^2}}{{2}}$. "
            f"Ёмкость равна ${russian(capacitance)}$ Ф, напряжение — ${russian(voltage)}$ В. Найдите энергию $W$ в джоулях."
        )
        values = {"capacitance": capacitance, "voltage": voltage}
    return wrapper(kind, values, text), number(answer)


def main() -> None:
    for kind, count in enumerate(COUNTS, 1):
        items = []
        for index in range(count):
            task_html, answer = build(kind, index)
            items.append({
                "id": f"12.{kind}.{index + 1}",
                "taskHtml": task_html,
                "answer": answer,
                "format": "number",
            })
        prototype = {"id": f"12.{kind}", "title": TITLES[kind - 1], "items": items}
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target = ROOT / f"task12-data-{kind:02}.js"
        target.write_text(
            "window.OgeTask12DataPrototypes = window.OgeTask12DataPrototypes || [];\n"
            f"window.OgeTask12DataPrototypes.push({payload});\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
