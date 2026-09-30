import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE_FILE = ROOT / "study" / "math" / "part-one" / "task1-5.html"


def load_apartments():
    script = (
        "const data=require('./study/math/part-one/task1-5-apartments-data.js');"
        "process.stdout.write(JSON.stringify(data));"
    )
    result = subprocess.run(
        ["node", "-e", script], cwd=ROOT, check=True, capture_output=True,
        text=True, encoding="utf-8",
    )
    return json.loads(result.stdout)


class AuthoredApartmentBankTests(unittest.TestCase):
    EXPECTED = {
        "apartments-6.1.1": {"1": "6723", "2": "14.4", "3": "12", "4": "525", "5": "28700"},
        "apartments-6.1.2": {"1": "1467", "2": "20", "3": "8", "4": "200", "5": "27300"},
        "apartments-6.1.3": {"1": "3274", "2": "7.04", "3": "4", "4": "125", "5": "730"},
        "apartments-6.1.4": {"1": "4316", "2": "3.2", "3": "12", "4": "25", "5": "25000"},
        "apartments-6.1.5": {"1": "7261", "2": "24.96", "3": "9", "4": "50", "5": "27700"},
        "apartments-6.1.6": {"1": "2637", "2": "4.8", "3": "10", "4": "350", "5": "630"},
        "apartments-6.1.7": {"1": "1743", "2": "15.84", "3": "4", "4": "39", "5": "750"},
        "apartments-6.1.8": {"1": "6124", "2": "4.8", "3": "22", "4": "58", "5": "820"},
    }

    @classmethod
    def setUpClass(cls):
        cls.prototypes = load_apartments()
        cls.analogs = [item for prototype in cls.prototypes for item in prototype["analogs"]]

    def test_complete_bank_keeps_eight_sets_forty_questions_and_the_apartment_plan(self):
        self.assertEqual(len(self.prototypes), 1)
        self.assertEqual(len(self.analogs), 8)
        self.assertEqual(sum(len(item["questions"]) for item in self.analogs), 40)
        self.assertEqual(
            {item["imagePath"] for item in self.analogs},
            {"/drawings/FIPI_OGE_MATH/real_math/flats-1.svg"},
        )

    def test_authored_answers_match_the_hand_checked_areas_packages_percentages_and_prices(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual(item["answers"], self.EXPECTED[item["id"]])
                self.assertEqual(
                    {str(q["number"]): str(q["answer"]) for q in item["questions"]},
                    self.EXPECTED[item["id"]],
                )

    def test_every_set_has_five_number_questions_and_renderable_tables(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual([q["number"] for q in item["questions"]], [1, 2, 3, 4, 5])
                self.assertTrue(all(q["format"] == "number" for q in item["questions"]))
                self.assertIn("Помещения", item["questions"][0]["html"])
                self.assertIn("latex-table", item["questions"][4]["html"])

    def test_authored_bank_has_no_import_provenance(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertNotIn("sourceId", item)
                self.assertNotIn("sourceAnalog", item)

    def test_page_requests_versioned_authored_apartment_bank(self):
        html = PAGE_FILE.read_text(encoding="utf-8")
        self.assertIn('src="task1-5-apartments-data.js?v=20260930-authored"', html)


if __name__ == "__main__":
    unittest.main()
