import unittest
from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"


class Task18PageContractTests(unittest.TestCase):
    def test_task18_page_loads_full_dataset_and_marks_task18_current(self):
        html = (PART_ONE / "task18.html").read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        scripts = [node.get("src") for node in soup.select("script[src]")]
        self.assertEqual(13, len([src for src in scripts if src and src.startswith("task18-data-")]))
        current = soup.select_one(".task-nav .is-current")
        self.assertIsNotNone(current)
        self.assertEqual("18", current.get_text(strip=True))
        self.assertIsNotNone(soup.select_one("[data-task18-prototypes]"))
        self.assertIsNotNone(soup.select_one("[data-task18-quiz]"))

    def test_task18_is_connected_to_navigation_and_student_progress(self):
        navigation = (PART_ONE / "trainer-navigation.js").read_text(encoding="utf-8")
        dashboard = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        self.assertIn("18: 'task18.html#trainer'", navigation)
        for marker in ("data-task18-stack", "data-task18-percent", "renderTask18Progress", "math?.task18"):
            self.assertIn(marker, dashboard)

    def test_task18_script_supports_enter_and_account_progress(self):
        script = (PART_ONE / "task18.js").read_text(encoding="utf-8")
        self.assertIn("window.OgeTask18DataPrototypes", script)
        self.assertNotIn("window.OgeTask17DataPrototypes", script)
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task18:", "task18:", "correctIds", "answeredIds", "MATH_TASK18_TEST"):
            self.assertIn(marker, script)

    def test_task18_assets_use_a_cache_busting_version(self):
        html = (PART_ONE / "task18.html").read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        assets = [
            node.get("href")
            for node in soup.select('link[href^="task18.css"]')
        ] + [
            node.get("src")
            for node in soup.select('script[src^="task18"]')
        ]
        self.assertEqual(15, len(assets))
        self.assertTrue(all(asset and "?v=20260929-authored" in asset for asset in assets))

    def test_task18_uses_the_shared_per_type_reset_contract(self):
        html = (PART_ONE / "task18.html").read_text(encoding="utf-8")
        css = (PART_ONE / "task18.css").read_text(encoding="utf-8")
        script = (PART_ONE / "task18.js").read_text(encoding="utf-8")
        self.assertIn("data-task18-reset", html)
        self.assertIn("Сбросить ответы", html)
        for marker in (".task18-actions", ".task18-reset", ".task18-submit:disabled"):
            self.assertIn(marker, css)
        for marker in (
            "ogeTrainer:v3:math:task18Reset:",
            "buildProgressResetKey(progressPath, id)",
            "isAttemptVisibleAfterReset",
            "Сбросить ответы типа",
            "accountStorage?.remove(storagePrefix",
            "updateUser({ data: { [resetKey]: token } })",
            "reset.addEventListener('click', resetPrototype)",
        ):
            self.assertIn(marker, script)


if __name__ == "__main__":
    unittest.main()
