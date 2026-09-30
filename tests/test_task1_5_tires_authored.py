import json
import re
import subprocess
import unittest
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE_FILE = ROOT / "study" / "math" / "part-one" / "task1-5.html"


def load_tires():
    script = (
        "const data=require('./study/math/part-one/task1-5-tires-data.js');"
        "process.stdout.write(JSON.stringify(data));"
    )
    result = subprocess.run(
        ["node", "-e", script], cwd=ROOT, check=True, capture_output=True,
        text=True, encoding="utf-8",
    )
    return json.loads(result.stdout)


def decimal_answer(value):
    text = format(value, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text.replace(".", ",")


def wheel_diameter(marking):
    width, profile, rim = map(Decimal, marking)
    return rim * Decimal("25.4") + Decimal("2") * width * profile / Decimal("100")


class AuthoredTireBankTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.prototypes = load_tires()
        cls.analogs = [item for prototype in cls.prototypes for item in prototype["analogs"]]

    def test_complete_bank_keeps_twenty_one_sets_and_shared_diagram(self):
        self.assertEqual(len(self.prototypes), 1)
        self.assertEqual(len(self.analogs), 21)
        self.assertEqual(sum(len(item["questions"]) for item in self.analogs), 105)
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual(item["imagePath"], "/drawings/FIPI_OGE_MATH/real_math/tires-1.svg")
                self.assertEqual([q["number"] for q in item["questions"]], [1, 2, 3, 4, 5])
                self.assertEqual(
                    {str(q["number"]): str(q["answer"]) for q in item["questions"]},
                    {str(key): str(value) for key, value in item["answers"].items()},
                )

    def test_authored_bank_has_no_source_provenance_fields(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertNotIn("sourceId", item)
                self.assertNotIn("sourceAnalog", item)

    def test_every_calculated_answer_matches_the_markings_in_its_condition(self):
        marking_pattern = r"\$(\d+)/(\d+)\\ R(\d+)\$"
        for item in self.analogs:
            factory_matches = re.findall(marking_pattern, item["taskHtml"])
            self.assertGreaterEqual(len(factory_matches), 2, item["id"])
            factory = factory_matches[-1]
            factory_diameter = wheel_diameter(factory)
            questions = item["questions"]

            sidewall_marking = re.findall(marking_pattern, questions[1]["html"])[-1]
            sidewall = Decimal(sidewall_marking[0]) * Decimal(sidewall_marking[1]) / Decimal("100")
            self.assertEqual(questions[1]["answer"], decimal_answer(sidewall.normalize()))

            self.assertEqual(questions[2]["answer"], decimal_answer(factory_diameter.normalize()))

            replacement = re.findall(marking_pattern, questions[3]["html"])[-1]
            replacement_diameter = wheel_diameter(replacement)
            diameter_change = abs(replacement_diameter - factory_diameter)
            self.assertEqual(questions[3]["answer"], decimal_answer(diameter_change.normalize()))
            expected_direction = "увеличится" if replacement_diameter > factory_diameter else "уменьшится"
            self.assertIn(expected_direction, questions[3]["html"])

            percent_replacement = re.findall(marking_pattern, questions[4]["html"])[-1]
            percent_diameter = wheel_diameter(percent_replacement)
            percent_change = (
                abs(percent_diameter - factory_diameter) / factory_diameter * Decimal("100")
            ).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
            self.assertEqual(questions[4]["answer"], decimal_answer(percent_change))
            expected_percent_direction = "увеличится" if percent_diameter > factory_diameter else "уменьшится"
            self.assertIn(expected_percent_direction, questions[4]["html"])

    def test_every_table_answer_matches_the_available_widths(self):
        for item in self.analogs:
            question = item["questions"][0]
            rows = re.findall(r"<tr>(.*?)</tr>", question["html"], flags=re.S)
            rims = [int(value) for value in re.findall(r"\$(\d+)\$", rows[1])]
            target_rim = int(re.search(r"диаметром \$(\d+)\$ дюймов", question["html"]).group(1))
            target_column = rims.index(target_rim) + 1
            available_widths = []
            for row in rows[2:]:
                cells = re.findall(r"<td>(.*?)</td>", row, flags=re.S)
                width = int(re.search(r"\$(\d+)\$", cells[0]).group(1))
                if "mdash" not in cells[target_column]:
                    available_widths.append(width)
            expected = min(available_widths) if "наименьшей" in question["html"] else max(available_widths)
            with self.subTest(item=item["id"]):
                self.assertEqual(question["answer"], str(expected))

    def test_page_requests_versioned_authored_tire_bank(self):
        html = PAGE_FILE.read_text(encoding="utf-8")
        self.assertIn('src="task1-5-tires-data.js?v=20260930-authored"', html)


if __name__ == "__main__":
    unittest.main()
