import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
RULES = re.findall(r"([^{}]+)\{([^{}]*)\}", CSS)


def has_rule(selector_fragment: str, declaration: str) -> bool:
    expected = declaration.replace(" ", "")
    return any(
        selector_fragment in selectors and expected in declarations.replace(" ", "")
        for selectors, declarations in RULES
    )


class ProgressGroupingStylesTests(unittest.TestCase):
    def test_every_loaded_task_groups_all_prototypes_by_colour(self):
        for task_number in range(6, 15):
            with self.subTest(task=task_number):
                self.assertTrue(
                    has_rule(f".task{task_number}-progress-stack", "gap:0"),
                    f"task {task_number} must remove gaps between prototype groups",
                )
                self.assertTrue(
                    has_rule(f".task{task_number}-progress-prototype", "display:contents"),
                    f"task {task_number} must merge prototype cells into one stack",
                )
                self.assertTrue(
                    has_rule(f".task{task_number}-progress-cell", "border-radius:0"),
                    f"task {task_number} cells must form solid colour blocks",
                )
                for colour, order in (("green", 1), ("yellow", 2), ("pink", 3)):
                    self.assertTrue(
                        has_rule(f".task{task_number}-progress-cell--{colour}", f"order:{order}"),
                        f"task {task_number} {colour} cells must have order {order}",
                    )


if __name__ == "__main__":
    unittest.main()
