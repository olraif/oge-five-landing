import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"


class Task8PageContractTests(unittest.TestCase):
    def test_task8_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task8.html").read_text(encoding="utf-8")
        self.assertEqual(35, html.count('src="task8-data-'))
        for marker in (
            'data-task8-prototypes',
            'data-task8-quiz',
            'data-task8-score',
            'data-task8-current-total',
            'href="../../index.html#progress"',
            'src="task8.js"',
            'href="task8.css"',
            'mathjax@3',
        ):
            self.assertIn(marker, html)

    def test_task8_is_linked_from_existing_trainer_navigation(self):
        task6 = (PART_ONE / "index.html").read_text(encoding="utf-8")
        task7 = (PART_ONE / "task7.html").read_text(encoding="utf-8")
        self.assertIn('href="task8.html#trainer">8</a>', task6)
        self.assertIn('href="task8.html#trainer">8</a>', task7)

    def test_student_dashboard_renders_task8_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task8-stack", "data-task8-percent", "renderTask8Progress", "math?.task8"):
            self.assertIn(marker, html)
        for marker in (".bar--task8", ".task8-progress-stack", ".task8-progress-cell--green"):
            self.assertIn(marker, css)
    def test_task8_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task8.js").read_text(encoding="utf-8")
        for marker in (
            "event.key !== 'Enter'",
            "ogeTrainer:v3:math:task8:",
            "task8:",
            "correctIds",
            "answeredIds",
            "MATH_TASK8_TEST",
        ):
            self.assertIn(marker, script)


if __name__ == "__main__":
    unittest.main()
