import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"

class Task10PageContractTests(unittest.TestCase):
    def test_task10_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task10.html").read_text(encoding="utf-8")
        self.assertEqual(18, html.count('src="task10-data-'))
        for marker in ('data-task10-prototypes','data-task10-quiz','data-task10-score','data-task10-current-total','href="../../index.html#progress"','src="task10.js"','href="task10.css"','mathjax@3'):
            self.assertIn(marker, html)

    def test_task10_is_linked_from_existing_trainer_navigation(self):
        task9 = (PART_ONE / "task9.html").read_text(encoding="utf-8")
        self.assertIn('href="task10.html#trainer">10</a>', task9)

    def test_student_dashboard_renders_task10_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task10-stack", "data-task10-percent", "renderTask10Progress", "math?.task10"):
            self.assertIn(marker, html)
        for marker in (".bar--task10", ".task10-progress-stack", ".task10-progress-cell--green"):
            self.assertIn(marker, css)

    def test_task10_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task10.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'","ogeTrainer:v3:math:task10:","task10:","correctIds","answeredIds","MATH_TASK10_TEST"):
            self.assertIn(marker, script)

if __name__ == "__main__":
    unittest.main()