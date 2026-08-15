import unittest
from pathlib import Path


PART_ONE = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
PAGES = ["index.html", *[f"task{number}.html" for number in range(7, 15)]]


class TrainerNavigationTests(unittest.TestCase):
    def test_all_loaded_trainer_pages_use_shared_navigation(self):
        for page_name in PAGES:
            with self.subTest(page=page_name):
                html = (PART_ONE / page_name).read_text(encoding="utf-8")
                self.assertIn('src="trainer-navigation.js"', html)

    def test_shared_navigation_maps_every_loaded_task_directly(self):
        script = (PART_ONE / "trainer-navigation.js").read_text(encoding="utf-8")
        expected_routes = {
            6: "index.html#trainer",
            **{number: f"task{number}.html#trainer" for number in range(7, 15)},
        }
        for number, route in expected_routes.items():
            with self.subTest(task=number):
                self.assertIn(f"{number}: '{route}'", script)

    def test_unloaded_tasks_show_development_message(self):
        script = (PART_ONE / "trainer-navigation.js").read_text(encoding="utf-8")
        self.assertIn("Задание ещё не загружено. Оно находится в разработке.", script)
        self.assertIn("event.preventDefault()", script)


if __name__ == "__main__":
    unittest.main()
