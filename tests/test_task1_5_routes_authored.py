import json
import re
import subprocess
import unittest
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE_FILE = ROOT / "study" / "math" / "part-one" / "task1-5.html"


def load_routes():
    script = (
        "const data=require('./study/math/part-one/task1-5-routes-data.js');"
        "process.stdout.write(JSON.stringify(data));"
    )
    result = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return json.loads(result.stdout)


def plain_text(markup):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", markup)).strip()


class AuthoredRouteBankTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.prototypes = load_routes()
        cls.analogs = [analog for prototype in cls.prototypes for analog in prototype["analogs"]]

    def test_complete_bank_keeps_all_sets_questions_and_diagrams(self):
        self.assertEqual(len(self.prototypes), 2)
        self.assertEqual(len(self.analogs), 24)
        self.assertEqual(sum(len(item["questions"]) for item in self.analogs), 120)
        expected_images = {
            **{
                f"routes-1.1.{number}": f"/drawings/FIPI_OGE_MATH/real_math/trips-{(number + 1) // 2 + 1}.svg"
                for number in range(1, 21)
            },
            **{
                f"routes-1.2.{number}": "/drawings/FIPI_OGE_MATH/real_math/trips-1.svg"
                for number in range(1, 5)
            },
        }
        self.assertEqual(
            {item["id"]: item["imagePath"] for item in self.analogs},
            expected_images,
        )
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual([q["number"] for q in item["questions"]], [1, 2, 3, 4, 5])
                self.assertEqual(
                    {str(q["number"]): str(q["answer"]) for q in item["questions"]},
                    {str(key): str(value) for key, value in item["answers"].items()},
                )

    def test_page_requests_the_versioned_authored_route_bank(self):
        html = PAGE_FILE.read_text(encoding="utf-8")
        self.assertIn('src="task1-5-routes-data.js?v=20260930-authored"', html)

    def test_authored_copy_replaces_source_names_and_metadata(self):
        old_names = {
            "Саша", "Гриша", "Володя", "Полина", "Ваня", "Дима", "Никита", "Серёжа", "Таня", "Таню",
            "Масловка", "Захарово", "Вёсенка", "Полянка", "Осиновка", "Николаево", "Зябликово",
            "Грушёвка", "Абрамово", "Таловка", "Кленовое", "Сосенки", "Камышёвка", "Хомяково",
            "Васильково", "Камышино", "Журавушка", "Дивная", "Ольгино", "Калиновка",
            "Васильевка", "Плодородное", "Шарковка", "Лягушкино", "Вятское", "Куровка", "Марусино",
            "Пирожки", "Княжеское", "Рябиновка", "Антоновка", "Богданово", "Ванютино",
            "Горюново", "Доломино", "Егорка", "Егорки", "Жилино", "Антоновки",
        }
        corpus = " ".join(
            [prototype["title"] for prototype in self.prototypes]
            + [item["taskHtml"] for item in self.analogs]
            + [question["html"] for item in self.analogs for question in item["questions"]]
        )
        for name in old_names:
            with self.subTest(name=name):
                self.assertNotRegex(corpus, rf"(?<![А-Яа-яЁё]){re.escape(name)}(?![А-Яа-яЁё])")
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertNotIn("sourceId", item)
                self.assertNotIn("sourceAnalog", item)

    def test_second_route_type_uses_consistent_indeclinable_place_names(self):
        corpus = " ".join(
            [item["taskHtml"] for item in self.analogs[20:]]
            + [question["html"] for item in self.analogs[20:] for question in item["questions"]]
        )
        for name in {
            "Снегирёво", "Полянцево", "Дорожкино", "Крапивино",
            "Бережково", "Сосновино", "Углово",
        }:
            with self.subTest(name=name):
                self.assertIn(name, corpus)
        for rejected in {"Полянское", "Дорожное", "Бережки", "Сосновка", "Угловое"}:
            with self.subTest(rejected=rejected):
                self.assertNotIn(rejected, corpus)

    def test_shop_baskets_have_recalculated_minimum_costs(self):
        item_words = {
            "молок": "Молоко",
            "хлеб": "Хлеб",
            "сыр": "Сыр",
            "говядин": "Говядина",
            "картофел": "Картофель",
        }
        for analog in self.analogs[:20]:
            question = analog["questions"][4]
            rows = re.findall(r"<tr>(.*?)</tr>", question["html"], flags=re.S)
            price_rows = {}
            for row in rows:
                cells = [plain_text(cell) for cell in re.findall(r"<td>(.*?)</td>", row, flags=re.S)]
                if len(cells) != 5:
                    continue
                values = [Decimal(value.replace(",", ".")) for value in re.findall(r"\$([\d,]+)\$", row)]
                if len(values) == 4:
                    price_rows[cells[0].split()[0]] = values
            basket_text = plain_text(question["html"].rsplit("</table>", 1)[-1])
            basket = {}
            for quantity, description in re.findall(
                r"\$([\d,]+)\$\s+([^,.]+?)(?=,|\s+и\s+|\.)",
                basket_text,
            ):
                for root, product in item_words.items():
                    if root in description.lower():
                        basket[product] = Decimal(quantity.replace(",", "."))
                        break
            if "батон хлеба" in basket_text.lower() and "Хлеб" not in basket:
                basket["Хлеб"] = Decimal("1")
            with self.subTest(item=analog["id"]):
                self.assertEqual(len(price_rows), 5)
                self.assertEqual(len(basket), 3)
                totals = [
                    sum(price_rows[product][shop] * quantity for product, quantity in basket.items())
                    for shop in range(4)
                ]
                self.assertEqual(min(totals), Decimal(str(question["answer"])))

    def test_fuel_tasks_use_recalculated_authored_values(self):
        expected = {
            "routes-1.2.1": ("13,6", "18,4"),
            "routes-1.2.2": ("11,6", "16,4"),
            "routes-1.2.3": ("13", "18,2"),
            "routes-1.2.4": ("11", "15,4"),
        }
        for analog in self.analogs[20:]:
            highway, answer = expected[analog["id"]]
            question = analog["questions"][4]
            with self.subTest(item=analog["id"]):
                self.assertIn(f"${highway}$ литра", question["html"])
                self.assertEqual(question["answer"], answer)
                self.assertEqual(analog["answers"]["5"], answer)


if __name__ == "__main__":
    unittest.main()
