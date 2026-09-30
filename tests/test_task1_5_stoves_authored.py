import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE_FILE = ROOT / "study" / "math" / "part-one" / "task1-5.html"


def load_stoves():
    script = (
        "const data=require('./study/math/part-one/task1-5-stoves-data.js');"
        "process.stdout.write(JSON.stringify(data));"
    )
    result = subprocess.run(
        ["node", "-e", script], cwd=ROOT, check=True, capture_output=True,
        text=True, encoding="utf-8",
    )
    return json.loads(result.stdout)


class AuthoredStoveBankTests(unittest.TestCase):
    EXPECTED = {
        "stoves-5.1.1": {"1": "321", "2": "16.8", "3": "4100", "4": "21930", "5": "130"},
        "stoves-5.1.2": {"1": "231", "2": "7.2", "3": "2900", "4": "21648", "5": "100"},
    }

    @classmethod
    def setUpClass(cls):
        cls.prototypes = load_stoves()
        cls.analogs = [item for prototype in cls.prototypes for item in prototype["analogs"]]

    def test_complete_bank_keeps_two_sets_ten_questions_and_three_drawings(self):
        self.assertEqual(len(self.prototypes), 1)
        self.assertEqual(len(self.analogs), 2)
        self.assertEqual(sum(len(item["questions"]) for item in self.analogs), 10)
        markup = "".join(
            item["taskHtml"] + "".join(q["html"] for q in item["questions"])
            for item in self.analogs
        )
        self.assertEqual(
            {name for name in ("stoves-1.svg", "stoves-2.svg", "stoves-3.svg") if name in markup},
            {"stoves-1.svg", "stoves-2.svg", "stoves-3.svg"},
        )

    def test_authored_answers_match_the_hand_checked_room_cost_and_geometry_results(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual(item["answers"], self.EXPECTED[item["id"]])
                self.assertEqual(
                    {str(q["number"]): str(q["answer"]) for q in item["questions"]},
                    self.EXPECTED[item["id"]],
                )

    def test_every_set_has_five_number_questions_and_a_stove_table(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertEqual([q["number"] for q in item["questions"]], [1, 2, 3, 4, 5])
                self.assertTrue(all(q["format"] == "number" for q in item["questions"]))
                self.assertIn("Рекомендуемый объём", item["taskHtml"])
                self.assertIn("Номер модели", item["questions"][0]["html"])
                self.assertIn("диаметр", item["questions"][4]["html"].lower())

    def test_authored_bank_has_no_import_provenance(self):
        for item in self.analogs:
            with self.subTest(item=item["id"]):
                self.assertNotIn("sourceId", item)
                self.assertNotIn("sourceAnalog", item)

    def test_discount_percentages_are_visible_text_not_latex_comments(self):
        self.assertIn("15 процентов", self.analogs[0]["questions"][3]["html"])
        self.assertIn("12 процентов", self.analogs[1]["questions"][3]["html"])

    def test_page_requests_versioned_authored_stove_bank(self):
        html = PAGE_FILE.read_text(encoding="utf-8")
        self.assertIn('src="task1-5-stoves-data.js?v=20260930-authored"', html)


if __name__ == "__main__":
    unittest.main()
