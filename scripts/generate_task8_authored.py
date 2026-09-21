"""Generate the authored task 8 bank while preserving public prototype/item ids."""
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = {1: 5, 14: 5, 34: 5}


def braced(value: int) -> str:
    return str(value) if 0 <= value < 10 else "{" + str(value) + "}"


def build(kind: int, j: int) -> tuple[str, int]:
    b = [2, 3, 4, 5, 6][j]
    if kind == 1:
        q, r, e = 3 + j, 2 + j % 2, 1 + j % 3
        return rf"{b}^{{-{q*r-e}}} \cdot \left({b}^{q}\right)^{r}", b**e
    if kind == 2:
        k, e = 2 + j, 2 + j
        return rf"\dfrac{{{b}^{braced(k+e)}}}{{{b}^{k}}}", b**e
    if kind == 3:
        q, e = 4 + j, 1 + j % 3
        return rf"\dfrac{{1}}{{{b}^{{-{q+e}}}}} \cdot \dfrac{{1}}{{{b}^{q}}}", b**e
    if kind == 4:
        a, c, e = -(2+j), 12+j, 2+j%2
        d = a + c - e
        return rf"\dfrac{{{b}^{{{a}}} \cdot {b}^{braced(c)}}}{{{b}^{braced(d)}}}", b**e
    if kind == 5:
        p, q, e = 3+j%2, 3+j, 1+j%3
        d = p*q + e
        return rf"\dfrac{{\left({b}^{p}\right)^{{-{q}}}}}{{{b}^{{-{d}}}}}", b**e
    if kind == 6:
        p, q, e = [3,5,7,11][j], [5,6,7,8][j], 2+j%3
        return rf"\dfrac{{{b}^{braced(q+e)} \cdot {p}^{q}}}{{({b}\cdot {p})^{q}}}", b**e
    if kind == 7:
        p, q, n, e = [2,2,3,3][j], [3,5,2,5][j], 5+j, 1+j%2
        return rf"\dfrac{{({p}\cdot {q})^{n}}}{{{p}^{braced(n-e)} \cdot {q}^{n}}}", p**e
    if kind == 8:
        p, q, n, e = [2,3,2,5][j], [7,5,9,2][j], 4+j, 1+j%3
        return rf"\dfrac{{\left({p}\cdot {q}\right)^{n}}}{{{p}^{braced(n-e)} \cdot {q}^{n}}}", p**e
    if kind == 9:
        e = 2+j
        return rf"\sqrt{{{b}^{braced(2*e)}}}", b**e
    if kind == 10:
        a, c = [(6,24),(12,3),(18,8),(20,5)][j]
        return rf"\sqrt{{{a}}}\cdot\sqrt{{{c}}}", int((a*c) ** .5)
    if kind == 11:
        c, d, m, n = [(2,3,3,5),(3,4,2,7),(4,2,5,3),(5,3,2,11)][j]
        return rf"{c}\sqrt{{{m}}}\cdot {d}\sqrt{{{n}}}\cdot\sqrt{{{m*n}}}", c*d*m*n
    if kind == 12:
        m, a = [(14,3),(19,2),(23,4),(29,5)][j]
        return rf"(\sqrt{{{m}}}-{a})(\sqrt{{{m}}}+{a})", m-a*a
    if kind == 13:
        m, n = [(11,3),(13,5),(17,7),(19,2)][j]
        return rf"(\sqrt{{{m}}}-\sqrt{{{n}}})(\sqrt{{{m}}}+\sqrt{{{n}}})", m-n
    if kind in (14, 15):
        n, k = [(3,2),(5,3),(2,4),(7,2),(6,3)][j]
        sign = "+" if kind == 14 else "-"
        factor = k+1 if kind == 14 else k-1
        return rf"(\sqrt{{{k*k*n}}}{sign}\sqrt{{{n}}})\cdot\sqrt{{{n}}}", factor*n
    if kind == 16:
        m, a = [(19,2),(23,3),(29,4),(31,5)][j]
        return rf"(\sqrt{{{m}}}-{a})^2+{2*a}\sqrt{{{m}}}", m+a*a
    if kind == 17:
        c, m, answer = [(2,5,3),(3,3,4),(2,7,5),(4,2,6)][j]
        return rf"\dfrac{{{answer*c*c*m}}}{{({c}\sqrt{{{m}}})^2}}", answer
    if kind == 18:
        c, m, answer = [(3,2,3),(2,7,2),(4,3,4),(5,2,5)][j]
        denominator = c*c*m//answer
        return rf"\dfrac{{({c}\sqrt{{{m}}})^2}}{{{denominator}}}", answer
    if kind == 19:
        k, c = [(3,5),(4,7),(5,3),(6,11)][j]
        return rf"\dfrac{{\sqrt{{{c*k}}}\cdot\sqrt{{{k}}}}}{{\sqrt{{{c}}}}}", k
    if kind == 20:
        a = 3+j
        return rf"\dfrac{{1}}{{{a}+\sqrt{{{a*a-1}}}}}+\dfrac{{1}}{{{a}-\sqrt{{{a*a-1}}}}}", 2*a
    if kind == 21:
        a = 2+j
        return rf"\dfrac{{1}}{{\sqrt{{{a*a+1}}}-{a}}}-\dfrac{{1}}{{\sqrt{{{a*a+1}}}+{a}}}", 2*a
    if kind == 22:
        p, q, e = 4+j, 11+j, 2+j%3
        return rf"a^{p}\cdot a^{braced(q)}:a^{braced(p+q-e)}\text{{ при }}a={b}", b**e
    if kind == 23:
        q, r, e = 2+j%2, 3+j, 1+j%3
        return rf"a^{{-{q*r-e}}}\cdot(a^{q})^{r}\text{{ при }}a={b}", b**e
    if kind == 24:
        p, q, e = 2+j%2, 4+j, 1+j%3
        return rf"(a^{p})^{{-{q}}}:a^{{-{p*q+e}}}\text{{ при }}a={b}", b**e
    if kind == 25:
        p, q, e = 7+j, 8+j, 2+j%3
        return rf"\dfrac{{a^{p}\cdot a^{q}}}{{a^{braced(p+q-e)}}}\text{{ при }}a={b}", b**e
    if kind == 26:
        p, q, e = 12+j, 2+j, 2+j%2
        return rf"\dfrac{{a^{p}\cdot a^{{-{q}}}}}{{a^{braced(p-q-e)}}}\text{{ при }}a={b}", b**e
    if kind == 27:
        p, q, e = 2+j, 3+j%2, 2+j%3
        return rf"\dfrac{{(a^{p})^{q}}}{{a^{braced(p*q-e)}}}\text{{ при }}a={b}", b**e
    if kind == 28:
        p, q, s, e = 2+j%2, 4+j, 3+j, 1+j%3
        return rf"\dfrac{{(a^{p})^{q}\cdot a^{s}}}{{a^{braced(p*q+s-e)}}}\text{{ при }}a={b}", b**e
    if kind == 29:
        q, c, e = 2+j%2, [8, 9, 10, 12][j], 1+j%3
        # b=sqrt(a); choose numerator exponents so the expression is a^e.
        ae, be = c+e, c
        return rf"\dfrac{{a^{braced(ae)}\cdot(b^{q})^{braced(be//q)}}}{{(a\cdot b)^{c}}}\text{{ при }}a={b},\ b=\sqrt{{{b}}}", b**e
    if kind == 30:
        a, k = 2+j, 1+j
        return rf"\sqrt{{a^2\cdot(-a)^{braced(2*k)}}}\text{{ при }}a={a}", a**(k+1)
    if kind == 31:
        d, px, py, x, y = [(2,2,6,6,2),(3,4,4,3,6),(2,6,2,2,5),(4,2,8,8,2)][j]
        return rf"\sqrt{{\dfrac{{1}}{{{d*d}}}x^{px}y^{py}}}\text{{ при }}x={x},\ y={y}", x**(px//2)*y**(py//2)//d
    if kind == 32:
        c, p, q, a = [(3,14,10,4),(2,18,12,5),(4,16,10,3),(5,12,8,2)][j]
        return rf"\sqrt{{\dfrac{{{c*c}a^{braced(p)}}}{{a^{braced(q)}}}}}\text{{ при }}a={a}", c*a**((p-q)//2)
    if kind == 33:
        c, px, py, x, y = [(2,2,4,9,3),(3,4,6,4,2),(4,2,2,5,2),(5,4,4,3,3)][j]
        return rf"\sqrt{{\dfrac{{{c*c}x^{px}}}{{y^{py}}}}}\text{{ при }}x={x},\ y={y}", c*x**(px//2)//y**(py//2)
    if kind == 34:
        k, a, bb = [(2,5,-4),(3,7,-2),(4,2,-3),(5,9,2),(6,4,-1)][j]
        return rf"\sqrt{{a^2+{2*k}ab+{k*k}b^2}}\text{{ при }}a={a},\ b={bb}", abs(a+k*bb)
    if kind == 35:
        k, a, bb = [(2,3,5),(3,8,2),(4,5,3),(5,7,2)][j]
        return rf"\sqrt{{a^2-{2*k}ab+{k*k}b^2}}\text{{ при }}a={a},\ b={bb}", abs(a-k*bb)
    raise ValueError(kind)


def main() -> None:
    for kind in range(1, 36):
        count = COUNTS.get(kind, 4)
        title = "Вычисления со степенями" if kind <= 8 else "Вычисления с квадратными корнями" if kind <= 21 else "Выражения со степенями" if kind <= 29 else "Выражения с квадратными корнями"
        items = []
        for j in range(count):
            expression, answer = build(kind, j)
            items.append({
                "id": f"8.{kind}.{j+1}",
                "taskHtml": f"Вычислите значение выражения <span>${expression}$.</span>",
                "answer": str(answer),
                "format": "number",
            })
        prototype = {"id": f"8.{kind}", "title": title, "items": items}
        payload = json.dumps(prototype, ensure_ascii=False, separators=(",", ":"))
        target = ROOT / f"task8-data-{kind:02}.js"
        target.write_text("window.OgeTask8DataPrototypes = window.OgeTask8DataPrototypes || [];\nwindow.OgeTask8DataPrototypes.push(" + payload + ");\n", encoding="utf-8")


if __name__ == "__main__":
    main()
