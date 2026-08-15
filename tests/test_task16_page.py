import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"

class Task16PageContractTests(unittest.TestCase):
    def test_task16_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task16.html").read_text(encoding="utf-8")
        self.assertEqual(34, html.count('src="task16-data-'))
        for marker in ("data-task16-prototypes", "data-task16-quiz", "data-task16-score", "data-task16-current-total", 'href="../../index.html#progress"', 'src="task16.js"', 'href="task16.css"', "mathjax@3"):
            self.assertIn(marker, html)

    def test_task16_is_linked_from_shared_navigation(self):
        navigation = (PART_ONE / "trainer-navigation.js").read_text(encoding="utf-8")
        self.assertIn("16: 'task16.html#trainer'", navigation)

    def test_task16_marks_only_task16_as_current_in_sidebar(self):
        html = (PART_ONE / "task16.html").read_text(encoding="utf-8")
        self.assertIn('<a class="is-current" href="#trainer">16</a>', html)
        self.assertIn('<a href="task15.html#trainer">15</a>', html)
        self.assertNotIn('<a class="is-current" href="#trainer">15</a>', html)

    def test_student_dashboard_renders_task16_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task16-stack", "data-task16-percent", "renderTask16Progress", "math?.task16"):
            self.assertIn(marker, html)
        for marker in (".bar--task16", ".task16-progress-stack", ".task16-progress-cell--green"):
            self.assertIn(marker, css)

    def test_task16_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task16.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task16:", "task16:", "correctIds", "answeredIds", "MATH_TASK16_TEST"):
            self.assertIn(marker, script)

if __name__ == "__main__":
    unittest.main()
