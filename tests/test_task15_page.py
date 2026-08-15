import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"


class Task15PageContractTests(unittest.TestCase):
    def test_task15_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task15.html").read_text(encoding="utf-8")
        self.assertEqual(28, html.count('src="task15-data-'))
        for marker in ("data-task15-prototypes", "data-task15-quiz", "data-task15-score", "data-task15-current-total", 'href="../../index.html#progress"', 'src="task15.js"', 'href="task15.css"', "mathjax@3"):
            self.assertIn(marker, html)

    def test_task15_is_linked_from_existing_trainer_navigation(self):
        navigation = (PART_ONE / "trainer-navigation.js").read_text(encoding="utf-8")
        self.assertIn("15: 'task15.html#trainer'", navigation)
        task14 = (PART_ONE / "task14.html").read_text(encoding="utf-8")
        self.assertIn('href="task15.html#trainer">15</a>', task14)

    def test_student_dashboard_renders_task15_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task15-stack", "data-task15-percent", "renderTask15Progress", "math?.task15"):
            self.assertIn(marker, html)
        for marker in (".bar--task15", ".task15-progress-stack", ".task15-progress-cell--green"):
            self.assertIn(marker, css)

    def test_task15_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task15.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task15:", "task15:", "correctIds", "answeredIds", "MATH_TASK15_TEST"):
            self.assertIn(marker, script)


if __name__ == "__main__":
    unittest.main()
