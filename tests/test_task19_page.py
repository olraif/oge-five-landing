import unittest
from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"


class Task19PageContractTests(unittest.TestCase):
    def test_task19_page_loads_full_dataset_and_marks_task19_current(self):
        html = (PART_ONE / "task19.html").read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        scripts = [node.get("src") for node in soup.select("script[src]")]
        self.assertEqual(2, len([src for src in scripts if src and src.startswith("task19-data-")]))
        current = soup.select_one(".task-nav .is-current")
        self.assertIsNotNone(current)
        self.assertEqual("19", current.get_text(strip=True))
        self.assertIsNotNone(soup.select_one("[data-task19-prototypes]"))
        self.assertIsNotNone(soup.select_one("[data-task19-quiz]"))

    def test_task19_is_connected_to_navigation_and_student_progress(self):
        navigation = (PART_ONE / "trainer-navigation.js").read_text(encoding="utf-8")
        dashboard = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        self.assertIn("19: 'task19.html#trainer'", navigation)
        for marker in ("data-task19-stack", "data-task19-percent", "renderTask19Progress", "math?.task19"):
            self.assertIn(marker, dashboard)

    def test_task19_script_supports_enter_and_account_progress(self):
        script = (PART_ONE / "task19.js").read_text(encoding="utf-8")
        self.assertIn("window.OgeTask19DataPrototypes", script)
        self.assertNotIn("window.OgeTask18DataPrototypes", script)
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task19:", "task19:", "correctIds", "answeredIds", "MATH_TASK19_TEST"):
            self.assertIn(marker, script)

    def test_task19_uses_the_shared_per_type_reset_contract(self):
        html = (PART_ONE / "task19.html").read_text(encoding="utf-8")
        css = (PART_ONE / "task19.css").read_text(encoding="utf-8")
        script = (PART_ONE / "task19.js").read_text(encoding="utf-8")
        self.assertIn("data-task19-reset", html)
        self.assertIn("Сбросить ответы", html)
        for marker in (".task19-actions", ".task19-reset", ".task19-submit:disabled"):
            self.assertIn(marker, css)
        for marker in (
            "ogeTrainer:v3:math:task19Reset:",
            "buildProgressResetKey(progressPath, id)",
            "isAttemptVisibleAfterReset",
            "Сбросить ответы типа",
            "accountStorage?.remove(storagePrefix",
            "updateUser({ data: { [resetKey]: token } })",
            "reset.addEventListener('click', resetPrototype)",
        ):
            self.assertIn(marker, script)

    def test_task19_assets_use_a_cache_busting_version(self):
        html = (PART_ONE / "task19.html").read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        assets = [node.get("href") for node in soup.select('link[href^="task19.css"]')]
        assets += [node.get("src") for node in soup.select('script[src^="task19"]')]
        self.assertEqual(4, len(assets))
        self.assertTrue(all(asset and "?v=20260929-authored" in asset for asset in assets))


if __name__ == "__main__":
    unittest.main()