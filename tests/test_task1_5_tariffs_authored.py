import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE_FILE = ROOT / "study" / "math" / "part-one" / "task1-5.html"


def load_tariffs():
    script = (
        "const data=require('./study/math/part-one/task1-5-tariffs-data.js');"
        "process.stdout.write(JSON.stringify(data));"
    )
    result = subprocess.run(
        ["node", "-e", script], cwd=ROOT, check=True, capture_output=True,
        text=True, encoding="utf-8",
    )
    return json.loads(result.stdout)


class AuthoredTariffBankTests(unittest.TestCase):
    EXPECTED = {
        "tariffs-7.1.1": {"1": "10724", "2": "680", "3": "4", "4": "50", "5": "480"},
        "tariffs-7.1.2": {"1": "81136", "2": "600", "3": "2", "4": "30", "5": "430"},
        "tariffs-7.1.3": {"1": "7351", "2": "660", "3": "5", "4": "300", "5": "450"},
        "tariffs-7.1.4": {"1": "5173", "2": "540", "3": "150", "4": "600", "5": "595"},
        "tariffs-7.1.5": {"1": "3715", "2": "500", "3": "1", "4": "20", "5": "740"},
    }

    @classmethod
    def setUpClass(cls):
        cls.prototypes = load_tariffs()
        cls.analogs = [item for prototype in cls.prototypes for item in prototype["analogs"]]

    def test_complete_bank_keeps_five_sets_twenty_five_questions_and_the_tariff_graph(self):
        self.assertEqual(len(self.prototypes), 1)
        self.assertEqual(len(self.analogs), 5)
        self.assertEqual(sum(len(item["questions"]) for item in self.analogs), 25)
        self.assertEqual(
            {item["imagePath"] for item in self.analogs},
            {"/drawings/FIPI_OGE_MATH/real_math/tariffs-1.svg"},
        )

    def test_authored_answers_match_the_hand_checked_graph_cost_count_and_percentage_results(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual(item["answers"], self.EXPECTED[item["id"]])
                self.assertEqual(
                    {str(question["number"]): str(question["answer"]) for question in item["questions"]},
                    self.EXPECTED[item["id"]],
                )

    def test_every_set_has_five_number_questions_a_graph_and_offer_table(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual([question["number"] for question in item["questions"]], [1, 2, 3, 4, 5])
                self.assertTrue(all(question["format"] == "number" for question in item["questions"]))
                self.assertIn("latex-table", item["questions"][0]["html"])
                self.assertIn("latex-table", item["questions"][4]["html"])
                self.assertIn("tariffs-1.svg", item["taskHtml"])

    def test_authored_bank_has_new_scenarios_and_no_import_provenance(self):
        task_text = " ".join(item["taskHtml"] for item in self.analogs)
        for name in ["Марина", "Илья", "София", "Артём", "Елена"]:
            self.assertIn(name, task_text)
        for old_marker in ["sourceId", "sourceAnalog"]:
            for item in self.analogs:
                self.assertNotIn(old_marker, item)
        self.assertNotIn("2019", task_text)
        self.assertNotIn("Стандартный", task_text)

    def test_page_requests_versioned_authored_tariff_bank(self):
        html = PAGE_FILE.read_text(encoding="utf-8")
        self.assertIn('src="task1-5-tariffs-data.js?v=20260930-authored"', html)


if __name__ == "__main__":
    unittest.main()
