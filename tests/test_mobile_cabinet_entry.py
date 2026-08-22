import re
import unittest
from pathlib import Path


ROOT = Path(__file__).absolute().parents[1]


class MobileCabinetEntryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (
            (ROOT / "styles.css").read_text(encoding="utf-8")
            + (ROOT / "theme.css").read_text(encoding="utf-8")
        )

    def test_mobile_cabinet_link_is_outside_hidden_navigation(self):
        header = re.search(
            r'<header class="site-header">(.*?)</header>',
            self.html,
            re.S,
        ).group(1)
        navigation = re.search(r'<nav\b[^>]*>(.*?)</nav>', header, re.S).group(0)
        mobile_link = re.search(
            r'<a class="header-cabinet"[^>]*href="study/index\.html"[^>]*>'
            r'Кабинет ученика</a>',
            header,
        )

        self.assertIsNotNone(mobile_link)
        self.assertNotIn('class="header-cabinet"', navigation)

    def test_mobile_breakpoint_displays_cabinet_link(self):
        self.assertIn('.header-cabinet{display:none}', self.css)
        self.assertRegex(
            self.css,
            r'@media \(max-width:1000px\)\{[^}]*'
            r'\.site-header nav\{display:none\}[^}]*'
            r'\.header-cabinet\{display:inline-flex',
        )

    def test_fixed_mobile_panel_is_removed(self):
        self.assertNotIn('class="mobile-contact"', self.html)
        self.assertNotIn('class="mobile-cabinet"', self.html)

if __name__ == "__main__":
    unittest.main()
