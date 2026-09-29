import unittest
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"

class Task17PageContractTests(unittest.TestCase):
    def test_task17_page_loads_full_dataset_and_marks_task17_current(self):
        html = (PART_ONE / "task17.html").read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        scripts = [node.get("src") for node in soup.select("script[src]")]
        self.assertEqual(40, len([src for src in scripts if src and src.startswith("task17-data-")]))
        current = soup.select_one(".task-nav .is-current")
        self.assertIsNotNone(current)
        self.assertEqual("17", current.get_text(strip=True))
        self.assertIsNotNone(soup.select_one("[data-task17-prototypes]"))
        self.assertIsNotNone(soup.select_one("[data-task17-quiz]"))

    def test_task17_is_connected_to_navigation_and_student_progress(self):
        navigation = (PART_ONE / "trainer-navigation.js").read_text(encoding="utf-8")
        dashboard = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        self.assertIn("17: 'task17.html#trainer'", navigation)
        for marker in ("data-task17-stack", "data-task17-percent", "renderTask17Progress", "math?.task17"):
            self.assertIn(marker, dashboard)

    def test_task17_script_supports_enter_and_account_progress(self):
        script = (PART_ONE / "task17.js").read_text(encoding="utf-8")
        self.assertIn("window.OgeTask17DataPrototypes", script)
        self.assertNotIn("window.OgeTask16DataPrototypes", script)
        for marker in ("event.key !== 'Enter'", "ogeTrainer:v3:math:task17:", "task17:", "correctIds", "answeredIds", "MATH_TASK17_TEST"):
            self.assertIn(marker, script)

    def test_task17_uses_the_shared_per_type_reset_contract(self):
        html = (PART_ONE / "task17.html").read_text(encoding="utf-8")
        css = (PART_ONE / "task17.css").read_text(encoding="utf-8")
        script = (PART_ONE / "task17.js").read_text(encoding="utf-8")
        self.assertIn("data-task17-reset", html)
        self.assertIn("Сбросить ответы", html)
        for marker in (".task17-actions", ".task17-reset", ".task17-submit:disabled"):
            self.assertIn(marker, css)
        for marker in (
            "ogeTrainer:v3:math:task17Reset:",
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
