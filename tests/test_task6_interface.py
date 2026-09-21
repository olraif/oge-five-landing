import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PART_ONE = ROOT / "study" / "math" / "part-one"


class Task6InterfaceTests(unittest.TestCase):
    def test_each_card_receives_its_complete_instruction(self):
        source = (PART_ONE / "part-one.js").read_text(encoding="utf-8-sig")
        self.assertIn('class="question-copy"', source)
        self.assertIn("В ответе укажите числитель", source)
        self.assertIn("Вычислите значение выражения.", source)
        self.assertNotIn("единица делится на сумму двух дробей", source)

    def test_selected_prototype_has_reset_control_and_reset_generation(self):
        html = (PART_ONE / "index.html").read_text(encoding="utf-8-sig")
        source = (PART_ONE / "part-one.js").read_text(encoding="utf-8-sig")
        self.assertIn("data-task6-reset", html)
        self.assertIn("ogeTrainer:v3:math:task6Reset:", source)
        self.assertIn("buildProgressResetKey", source)
        self.assertRegex(source, re.compile(r"Сбросить ответы типа.*activePrototype", re.DOTALL))


if __name__ == "__main__":
    unittest.main()
