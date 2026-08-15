import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"


class Task13PageContractTests(unittest.TestCase):
    def test_task13_page_loads_full_dataset_and_trainer_hooks(self):
        html = (PART_ONE / "task13.html").read_text(encoding="utf-8")
        self.assertEqual(10, html.count('src="task13-data-'))
        for marker in ("data-task13-prototypes", "data-task13-quiz", "data-task13-score", "data-task13-current-total", 'href="../../index.html#progress"', 'src="task13.js"', 'href="task13.css"', "mathjax@3"):
            self.assertIn(marker, html)

    def test_task13_is_linked_from_existing_trainer_navigation(self):
        task12 = (PART_ONE / "task12.html").read_text(encoding="utf-8")
        self.assertIn('href="task13.html#trainer">13</a>', task12)

    def test_student_dashboard_renders_task13_progress(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        for marker in ("data-task13-stack", "data-task13-percent", "renderTask13Progress", "math?.task13"):
            self.assertIn(marker, html)
        for marker in (".bar--task13", ".task13-progress-stack", ".task13-progress-cell--green"):
            self.assertIn(marker, css)

    def test_task13_formats_math_without_stray_dollars_or_scrollbars(self):
        script = (PART_ONE / "task13.js").read_text(encoding="utf-8")
        css = (PART_ONE / "task13.css").read_text(encoding="utf-8")
        self.assertIn("replace(/\$\$([\s\S]*?)\$\$/g", script)
        self.assertIn("replace(/\$([^$]+)\$/g", script)
        self.assertIn("overflow-wrap:anywhere", css)

    def test_task13_script_has_enter_local_and_cloud_progress(self):
        script = (PART_ONE / "task13.js").read_text(encoding="utf-8")
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task13:", "task13:", "correctIds", "answeredIds", "MATH_TASK13_TEST"):
            self.assertIn(marker, script)


if __name__ == "__main__":
    unittest.main()
