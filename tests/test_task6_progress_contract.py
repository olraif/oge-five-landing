import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class Task6ProgressContractTests(unittest.TestCase):
    def test_student_progress_uses_grouped_task6_model(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")

        self.assertIn('<script src="./progress-model.js"></script>', html)
        self.assertIn("data-task6-stack", html)
        self.assertIn("data-task6-percent", html)
        self.assertIn("buildTask6Summary", html)
        self.assertIn(".task6-progress-prototype{display:contents}", css)
        self.assertIn(".task6-progress-cell--green{order:1", css)
        self.assertIn(".task6-progress-cell--yellow{order:2", css)
        self.assertIn(".task6-progress-cell--pink{order:3", css)


if __name__ == "__main__":
    unittest.main()
