import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"

class Task9PageContractTests(unittest.TestCase):
    def test_task9_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task9.html").read_text(encoding="utf-8")
        self.assertEqual(14, html.count('src="task9-data-'))
        for marker in ('data-task9-prototypes','data-task9-quiz','data-task9-score','data-task9-current-total','href="../../index.html#progress"','src="task9.js"','href="task9.css"','mathjax@3'):
            self.assertIn(marker, html)

    def test_task9_is_linked_from_existing_trainer_navigation(self):
        task8 = (PART_ONE / "task8.html").read_text(encoding="utf-8")
        self.assertIn('href="task9.html#trainer">9</a>', task8)

    def test_student_dashboard_renders_task9_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task9-stack", "data-task9-percent", "renderTask9Progress", "math?.task9"):
            self.assertIn(marker, html)
        for marker in (".bar--task9", ".task9-progress-stack", ".task9-progress-cell--green"):
            self.assertIn(marker, css)

    def test_task9_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task9.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'","ogeTrainer:v3:math:task9:","task9:","correctIds","answeredIds","MATH_TASK9_TEST"):
            self.assertIn(marker, script)

if __name__ == "__main__":
    unittest.main()