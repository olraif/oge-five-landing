import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE_FILE = ROOT / "study" / "math" / "part-one" / "task1-5.html"


def load_sheets():
    script = (
        "const data=require('./study/math/part-one/task1-5-sheets-data.js');"
        "process.stdout.write(JSON.stringify(data));"
    )
    result = subprocess.run(
        ["node", "-e", script], cwd=ROOT, check=True, capture_output=True,
        text=True, encoding="utf-8",
    )
    return json.loads(result.stdout)


class AuthoredSheetBankTests(unittest.TestCase):
    EXPECTED = {
        "sheets-4.1.1": {"1": "2413", "2": "8", "3": "625", "4": "590", "5": "2250"},
        "sheets-4.1.2": {"1": "3142", "2": "16", "3": "2500", "4": "300", "5": "2500"},
        "sheets-4.1.3": {"1": "3241", "2": "16", "3": "1.4", "4": "0.7", "5": "20"},
        "sheets-4.1.4": {"1": "3241", "2": "16", "3": "590", "4": "4", "5": "9"},
    }

    @classmethod
    def setUpClass(cls):
        cls.prototypes = load_sheets()
        cls.analogs = [item for prototype in cls.prototypes for item in prototype["analogs"]]

    def test_complete_bank_keeps_four_sets_twenty_questions_and_one_diagram(self):
        self.assertEqual(len(self.prototypes), 1)
        self.assertEqual(len(self.analogs), 4)
        self.assertEqual(sum(len(item["questions"]) for item in self.analogs), 20)
        self.assertEqual(
            {item["imagePath"] for item in self.analogs},
            {"/drawings/FIPI_OGE_MATH/real_math/papers-1.svg"},
        )

    def test_authored_answers_match_the_hand_checked_sheet_calculations(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual(item["answers"], self.EXPECTED[item["id"]])
                self.assertEqual(
                    {str(q["number"]): str(q["answer"]) for q in item["questions"]},
                    self.EXPECTED[item["id"]],
                )

    def test_every_set_has_five_number_questions_and_a_correspondence_table(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual([q["number"] for q in item["questions"]], [1, 2, 3, 4, 5])
                self.assertTrue(all(q["format"] == "number" for q in item["questions"]))
                self.assertIn("Номер образца", item["questions"][0]["html"])
                self.assertIn("Формат", item["questions"][0]["html"])

    def test_authored_bank_has_no_import_provenance(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertNotIn("sourceId", item)
                self.assertNotIn("sourceAnalog", item)

    def test_square_root_notation_reaches_the_page_as_valid_latex(self):
        self.assertIn(r"\sqrt{2}", self.analogs[0]["taskHtml"])
        self.assertIn(r"\sqrt{2}", self.analogs[0]["questions"][3]["html"])

    def test_page_requests_versioned_authored_sheet_bank(self):
        html = PAGE_FILE.read_text(encoding="utf-8")
        self.assertIn('src="task1-5-sheets-data.js?v=20260930-authored"', html)


if __name__ == "__main__":
    unittest.main()
