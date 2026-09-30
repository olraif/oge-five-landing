import json
import re
import subprocess
import unittest
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE_FILE = ROOT / "study" / "math" / "part-one" / "task1-5.html"


def load_plots():
    script = (
        "const data=require('./study/math/part-one/task1-5-plots-data.js');"
        "process.stdout.write(JSON.stringify(data));"
    )
    result = subprocess.run(
        ["node", "-e", script], cwd=ROOT, check=True, capture_output=True,
        text=True, encoding="utf-8",
    )
    return json.loads(result.stdout)


class AuthoredPlotBankTests(unittest.TestCase):
    EXPECTED = {
        "plots-3.1.1": {"1": "7425", "2": "8", "3": "36", "4": "29", "5": "400"},
        "plots-3.1.2": {"1": "3517", "2": "10", "3": "6", "4": "10", "5": "520"},
        "plots-3.1.3": {"1": "7352", "2": "6", "3": "36", "4": "75", "5": "450"},
        "plots-3.1.4": {"1": "2473", "2": "4", "3": "108", "4": "300", "5": "480"},
        "plots-3.1.5": {"1": "3461", "2": "16", "3": "68", "4": "10", "5": "600"},
        "plots-3.1.6": {"1": "5136", "2": "4", "3": "72", "4": "10", "5": "620"},
        "plots-3.1.7": {"1": "4235", "2": "32", "3": "22", "4": "4", "5": "360"},
        "plots-3.1.8": {"1": "5723", "2": "88", "3": "15", "4": "10", "5": "250"},
    }

    @classmethod
    def setUpClass(cls):
        cls.prototypes = load_plots()
        cls.analogs = [item for prototype in cls.prototypes for item in prototype["analogs"]]

    def test_complete_bank_keeps_eight_sets_forty_questions_and_three_plans(self):
        self.assertEqual(len(self.prototypes), 1)
        self.assertEqual(len(self.analogs), 8)
        self.assertEqual(sum(len(item["questions"]) for item in self.analogs), 40)
        self.assertEqual(
            [item["imagePath"] for item in self.analogs],
            [
                "/drawings/FIPI_OGE_MATH/real_math/homesteads-1.svg",
                "/drawings/FIPI_OGE_MATH/real_math/homesteads-1.svg",
                "/drawings/FIPI_OGE_MATH/real_math/homesteads-1.svg",
                "/drawings/FIPI_OGE_MATH/real_math/homesteads-1.svg",
                "/drawings/FIPI_OGE_MATH/real_math/homesteads-2.svg",
                "/drawings/FIPI_OGE_MATH/real_math/homesteads-2.svg",
                "/drawings/FIPI_OGE_MATH/real_math/homesteads-3.svg",
                "/drawings/FIPI_OGE_MATH/real_math/homesteads-3.svg",
            ],
        )

    def test_authored_answers_match_the_hand_checked_geometry_and_packages(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual(item["answers"], self.EXPECTED[item["id"]])
                self.assertEqual(
                    {str(q["number"]): str(q["answer"]) for q in item["questions"]},
                    self.EXPECTED[item["id"]],
                )

    def test_every_heating_answer_matches_its_new_cost_table(self):
        for item in self.analogs:
            html = item["questions"][4]["html"]
            rows = re.findall(r"<tr>(.*?)</tr>", html, flags=re.S)
            values = []
            for row in rows[1:]:
                cells = re.findall(r"<td>(.*?)</td>", row, flags=re.S)
                if len(cells) != 5:
                    continue
                numbers = []
                for cell in cells[1:]:
                    math = re.search(r"\$(.*?)\$", cell, flags=re.S).group(1)
                    number = re.match(r"[\d,\s\\]+", math).group(0)
                    numbers.append(Decimal(number.replace("\\", "").replace(" ", "").replace(",", ".")))
                values.append(numbers)
            self.assertEqual(len(values), 2, item["id"])
            gas, electric = values
            extra_cost = gas[0] + gas[1] - electric[0] - electric[1]
            hourly_saving = electric[2] * electric[3] - gas[2] * gas[3]
            expected = extra_cost / hourly_saving
            with self.subTest(item=item["id"]):
                self.assertEqual(expected, expected.to_integral_value())
                self.assertEqual(item["answers"]["5"], str(int(expected)))

    def test_authored_bank_has_no_import_provenance(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertNotIn("sourceId", item)
                self.assertNotIn("sourceAnalog", item)

    def test_page_requests_versioned_authored_plot_bank(self):
        html = PAGE_FILE.read_text(encoding="utf-8")
        self.assertIn('src="task1-5-plots-data.js?v=20260930-authored"', html)


if __name__ == "__main__":
    unittest.main()
