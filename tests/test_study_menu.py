import re
import unittest
from pathlib import Path


STUDY_HTML = Path(__file__).resolve().parents[1] / "study" / "index.html"


class StudentCabinetMenuTests(unittest.TestCase):
    def test_inline_script_has_no_duplicate_progress_bar_declarations(self):
        html = STUDY_HTML.read_text(encoding="utf-8")
        declarations = re.findall(r"const (progressBar\d+)\s*=", html)
        self.assertEqual(len(declarations), len(set(declarations)), declarations)

    def test_each_loaded_task_uses_its_own_progress_bar_selector(self):
        html = STUDY_HTML.read_text(encoding="utf-8")
        self.assertIn("const progressBar6 = () => document.querySelector('.progress-bars .bar:nth-child(6)')", html)
        self.assertIn("const bar = progressBar6();", html)
        for task in range(7, 16):
            with self.subTest(task=task):
                self.assertIn(
                    f"const progressBar{task} = () => document.querySelector('.progress-bars .bar--task{task}')",
                    html,
                )
                self.assertIn(f"const bar = progressBar{task}();", html)


if __name__ == "__main__":
    unittest.main()
