import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class MobileCabinetEntryTests(unittest.TestCase):
    def test_mobile_root_has_direct_trainer_fallback(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('name="viewport"', html)
        self.assertIn('href="/study/"', html)
        self.assertIn('window.location.replace("/study/")', html)

    def test_student_cabinet_keeps_login_entry_on_mobile(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        self.assertIn('name="viewport"', html)
        self.assertIn('data-auth-open', html)
        self.assertIn("studio-sidebar", css)


if __name__ == "__main__":
    unittest.main()
