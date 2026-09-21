"""Generate an authored task 9 equation bank with stable public ids."""
from __future__ import annotations

import json
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
COUNTS = [10] * 10 + [7, 5, 6, 6]


def number(value: Fraction | int) -> str:
    value = Fraction(value)
    if value.denominator == 1:
        return str(value.numerator)
    result = f"{float(value):.8f}".rstrip("0").rstrip(".")
    return result


def signed(value: int, suffix: str = "") -> str:
    return (f"+ {value}{suffix}" if value >= 0 else f"- {abs(value)}{suffix}")


def build(kind: int, index: int) -> tuple[str, str]:
    j = index + 1
    if kind == 1:
        roots = [Fraction(-7,2),Fraction(5,2),Fraction(-9,4),Fraction(7,5),Fraction(-3,5),Fraction(11,2),Fraction(-13,5),Fraction(9,4),Fraction(3,2),Fraction(-1,4)]
        root = roots[index]; d = root.denominator; c = 2 + index % 5; a = c + d; b = -root.numerator
        return f"{a}x {signed(b)} = {c}x", number(root)
    if kind == 2:
        roots = [Fraction(-5),Fraction(3,2),Fraction(-7,2),Fraction(4),Fraction(-9,5),Fraction(11,4),Fraction(-3),Fraction(7,5),Fraction(5,2),Fraction(-1,2)]
        root = roots[index]; c = 1 + index % 4; b = c + root.denominator; a = 3 + index; d = a + root.numerator
        return f"{a} + {b}x = {c}x {signed(d)}", number(root)
    if kind == 3:
        roots = [Fraction(8),Fraction(6),Fraction(11),Fraction(7,2),Fraction(9),Fraction(5,2),Fraction(13),Fraction(4),Fraction(15,2),Fraction(10)]
        root=roots[index]; d=1+index%3; a=d+root.denominator; b=2+index; c=root.numerator-b
        return f"{a}x - {b} = {c} + {d}x", number(root)
    if kind == 4:
        roots = [Fraction(-7,2),Fraction(9,4),Fraction(-7,4),Fraction(11,2),Fraction(7,5),Fraction(-9,2),Fraction(13,4),Fraction(-3,5),Fraction(5,2),Fraction(-11,4)]
        root=roots[index]; a=root.denominator; b=2+index%5; c=a*b+root.numerator
        return f"{a}(x + {b}) = {c}", number(root)
    if kind in (5, 6):
        roots = [Fraction(6),Fraction(9),Fraction(-4),Fraction(7,2),Fraction(11),Fraction(-5,2),Fraction(8),Fraction(13,2),Fraction(-3),Fraction(10)]
        root=roots[index]; diff=root.denominator; c=2+index%4; a=c+diff; b=1+index%5; right=root.numerator-a*b
        if kind == 5:
            return f"{a}(x - {b}) - {c}x = {right}", number(root)
        return f"{a}(x - {b}) = {c}x {signed(right)}", number(root)
    if kind == 7:
        roots=[Fraction(-6),Fraction(5),Fraction(-7,2),Fraction(9),Fraction(-4),Fraction(11,2),Fraction(8),Fraction(-3),Fraction(13,2),Fraction(7)]
        root=roots[index]; c=2+index%3; a=c+root.denominator; b=1+index%5; right=root.numerator+b*(a+c)
        return f"{a}(x + {b}) - {c}(x - {b}) = {right}", number(root)
    if kind in (8, 9):
        roots=[2,3,4,5,6,7,8,9,10,11]; s=roots[index]
        choice="меньший" if kind == 8 else "больший"
        return f"x^2 - {s*s} = 0", str(-s if kind == 8 else s)
    if kind == 10:
        a=2+index%4; q=2+index; b=a*q
        return f"{a}x^2 = {b}x", "0"
    if kind in (11, 12):
        pairs=[(1,4),(2,6),(3,7),(4,9),(5,11),(6,10),(7,12)]
        p,q=pairs[index]
        return f"x^2 - {p+q}x + {p*q} = 0", str(p if kind == 11 else q)
    if kind == 13:
        small=[Fraction(1,2),Fraction(3,4),Fraction(-1,2),Fraction(2,5),Fraction(-3,4),Fraction(1,5)][index]
        q=3+index; d=small.denominator; n=small.numerator
        return f"{d}x^2 - {n+d*q}x {signed(n*q)} = 0", number(small)
    if kind == 14:
        large=[Fraction(5,2),Fraction(7,4),Fraction(9,4),Fraction(11,5),Fraction(13,4),Fraction(8,5)][index]
        p=-1-index%3; d=large.denominator; n=large.numerator
        return f"{d}x^2 {signed(-(d*p+n), 'x')} {signed(p*n)} = 0", number(large)
    raise ValueError(kind)


def main() -> None:
    for kind, count in enumerate(COUNTS, 1):
        title = "Линейные уравнения" if kind <= 7 else "Неполные квадратные уравнения" if kind <= 10 else "Квадратные уравнения"
        items=[]
        for index in range(count):
            equation, answer=build(kind,index)
            if kind >= 8:
                choice = "меньший корень" if kind in {8,10,11,13} else "больший корень"
                prompt=f"Решите уравнение. Если корней два, в ответе укажите {choice}."
            else:
                prompt="Решите уравнение."
            items.append({"id":f"9.{kind}.{index+1}","taskHtml":f"{prompt} <span>${equation}$.</span>","answer":answer,"format":"number"})
        prototype={"id":f"9.{kind}","title":title,"items":items}
        payload=json.dumps(prototype,ensure_ascii=False,separators=(",",":"))
        (ROOT/f"task9-data-{kind:02}.js").write_text("window.OgeTask9DataPrototypes = window.OgeTask9DataPrototypes || [];\nwindow.OgeTask9DataPrototypes.push("+payload+");\n",encoding="utf-8")


if __name__ == "__main__":
    main()
