import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"

class Task11PageContractTests(unittest.TestCase):
    def test_task11_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task11.html").read_text(encoding="utf-8")
        self.assertEqual(10, html.count('src="task11-data-'))
        for marker in ('data-task11-prototypes','data-task11-quiz','data-task11-score','data-task11-current-total','href="../../index.html#progress"','src="task11.js"','href="task11.css"','mathjax@3'):
            self.assertIn(marker, html)

    def test_task11_is_linked_from_existing_trainer_navigation(self):
        task10 = (PART_ONE / "task10.html").read_text(encoding="utf-8")
        self.assertIn('href=\"task11.html#trainer\">11</a>', task10)

    def test_student_dashboard_renders_task11_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task11-stack", "data-task11-percent", "renderTask11Progress", "math?.task11"):
            self.assertIn(marker, html)
        for marker in (".bar--task11", ".task11-progress-stack", ".task11-progress-cell--green"):
            self.assertIn(marker, css)

    def test_task11_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task11.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'","ogeTrainer:v3:math:task11:","task11:","correctIds","answeredIds","MATH_TASK11_TEST"):
            self.assertIn(marker, script)

if __name__ == "__main__":
    unittest.main()