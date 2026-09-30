import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STUDY = ROOT / "study" / "index.html"


class SiteRegressionTests(unittest.TestCase):
    def test_every_public_page_declares_the_shared_favicon(self):
        self.assertTrue((ROOT / "favicon.svg").is_file())
        pages = [ROOT / "index.html", *sorted((ROOT / "study").rglob("*.html"))]
        for page in pages:
            html = page.read_text(encoding="utf-8")
            self.assertIn('rel="icon" href="/favicon.svg"', html, str(page.relative_to(ROOT)))

    def test_bank_table_uses_actual_published_task_counts(self):
        html = STUDY.read_text(encoding="utf-8")
        expected = {
            "1–5": 360, "6": 85, "7": 81, "8": 143, "9": 124,
            "10": 217, "11": 103, "12": 182, "13": 131, "14": 117,
            "15": 258, "16": 330, "17": 320, "18": 158, "19": 151,
        }
        rows = dict(re.findall(r"<tr><td>(1–5|(?:[6-9]|1[0-9]))</td><td>[^<]+</td><td>(\d+)</td></tr>", html))
        self.assertEqual(rows, {task: str(total) for task, total in expected.items()})

    def test_task12_progress_tooltips_are_readable_russian(self):
        html = STUDY.read_text(encoding="utf-8")
        self.assertIn("' правильно, '", html)
        self.assertIn("bar.title = 'Задание 12: '", html)
        self.assertNotIn("РїСЂР°РІРёР»СЊРЅРѕ", html)
        self.assertNotIn("Р—Р°РґР°РЅРёРµ 12", html)


if __name__ == "__main__":
    unittest.main()
