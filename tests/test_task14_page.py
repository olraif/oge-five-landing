import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"


class Task14PageContractTests(unittest.TestCase):
    def test_task14_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task14.html").read_text(encoding="utf-8")
        self.assertEqual(11, html.count('src="task14-data-'))
        for marker in ("data-task14-prototypes", "data-task14-quiz", "data-task14-score", "data-task14-current-total", 'href="../../index.html#progress"', 'src="task14.js"', 'href="task14.css"', "mathjax@3"):
            self.assertIn(marker, html)

    def test_task14_is_linked_from_existing_trainer_navigation(self):
        task13 = (PART_ONE / "task13.html").read_text(encoding="utf-8")
        self.assertIn('href="task14.html#trainer">14</a>', task13)

    def test_student_dashboard_renders_task14_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task14-stack", "data-task14-percent", "renderTask14Progress", "math?.task14"):
            self.assertIn(marker, html)
        for marker in (".bar--task14", ".task14-progress-stack", ".task14-progress-cell--green"):
            self.assertIn(marker, css)

    def test_task14_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task14.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task14:", "task14:", "correctIds", "answeredIds", "MATH_TASK14_TEST"):
            self.assertIn(marker, script)


if __name__ == "__main__":
    unittest.main()
