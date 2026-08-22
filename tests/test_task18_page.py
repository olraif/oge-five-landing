import unittest
from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"


class Task18PageContractTests(unittest.TestCase):
    def test_task18_page_loads_full_dataset_and_marks_task18_current(self):
        html = (PART_ONE / "task18.html").read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        scripts = [node.get("src") for node in soup.select("script[src]")]
        self.assertEqual(13, len([src for src in scripts if src and src.startswith("task18-data-")]))
        current = soup.select_one(".task-nav .is-current")
        self.assertIsNotNone(current)
        self.assertEqual("18", current.get_text(strip=True))
        self.assertIsNotNone(soup.select_one("[data-task18-prototypes]"))
        self.assertIsNotNone(soup.select_one("[data-task18-quiz]"))

    def test_task18_is_connected_to_navigation_and_student_progress(self):
        navigation = (PART_ONE / "trainer-navigation.js").read_text(encoding="utf-8")
        dashboard = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        self.assertIn("18: 'task18.html#trainer'", navigation)
        for marker in ("data-task18-stack", "data-task18-percent", "renderTask18Progress", "math?.task18"):
            self.assertIn(marker, dashboard)

    def test_task18_script_supports_enter_and_account_progress(self):
        script = (PART_ONE / "task18.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task18:", "task18:", "correctIds", "answeredIds", "MATH_TASK18_TEST"):
            self.assertIn(marker, script)


if __name__ == "__main__":
    unittest.main()
