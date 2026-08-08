import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"

class Task12PageContractTests(unittest.TestCase):
    def test_task12_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task12.html").read_text(encoding="utf-8")
        self.assertEqual(11, html.count('src="task12-data-'))
        for marker in ("data-task12-prototypes", "data-task12-quiz", "data-task12-score", "data-task12-current-total", 'href="../../index.html#progress"', 'src="task12.js"', 'href="task12.css"', "mathjax@3"):
            self.assertIn(marker, html)

    def test_task12_is_linked_from_existing_trainer_navigation(self):
        task11 = (PART_ONE / "task11.html").read_text(encoding="utf-8")
        self.assertIn('href="task12.html#trainer">12</a>', task11)

    def test_student_dashboard_renders_task12_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task12-stack", "data-task12-percent", "renderTask12Progress", "math?.task12"):
            self.assertIn(marker, html)
        for marker in (".bar--task12", ".task12-progress-stack", ".task12-progress-cell--green"):
            self.assertIn(marker, css)

    def test_task12_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task12.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task12:", "task12:", "correctIds", "answeredIds", "MATH_TASK12_TEST"):
            self.assertIn(marker, script)

if __name__ == "__main__": unittest.main()
