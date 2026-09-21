import json
import re
import unittest
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"

class Task9DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task9-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_14_prototypes_and_124_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(14, len(files))
        self.assertEqual([f"9.{index}" for index in range(1, 15)], [p["id"] for p in prototypes])
        self.assertTrue([len(prototype["items"]) for prototype in prototypes] == [10] * 10 + [7, 5, 6, 6])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(124, len(items))
        self.assertEqual(124, len({item["id"] for item in items}))

    def test_russian_text_is_valid_utf8_without_mojibake(self):
        _, prototypes = self.load_prototypes()
        broken_markers = ("Р›", "Рё", "Р°", "С‹", "СЏ", "�")
        for prototype in prototypes:
            texts = [prototype["title"], *(item["taskHtml"] for item in prototype["items"])]
            for text in texts:
                self.assertFalse(any(marker in text for marker in broken_markers), text)

    def test_every_item_is_authored_and_self_contained(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertNotIn("internalId", item, item["id"])
                self.assertNotIn("analogNumber", item, item["id"])
                self.assertNotIn("answerHtml", item, item["id"])
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertIn("answer", item, item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])

    def test_all_authored_equations_are_unique_and_have_clear_root_instruction(self):
        _, prototypes = self.load_prototypes()
        items = [item for prototype in prototypes for item in prototype["items"]]
        equations = [item["taskHtml"] for item in items]
        self.assertEqual(len(equations), len(set(equations)))
        for prototype in prototypes[7:]:
            for item in prototype["items"]:
                self.assertIn("меньший корень" if prototype["id"] in {"9.8", "9.10", "9.11", "9.13"} else "больший корень", item["taskHtml"], item["id"])

    def test_every_stored_answer_solves_its_equation_and_uses_requested_root(self):
        _, prototypes = self.load_prototypes()

        def evaluate(expression, x):
            normalized = expression.replace("^", "**")
            normalized = re.sub(r"(?<=\d)x", "*x", normalized)
            normalized = re.sub(r"(?<=\d)\(", "*(", normalized)
            return Fraction(eval(normalized, {"__builtins__": {}}, {"x": x}))

        for prototype in prototypes:
            for item in prototype["items"]:
                equation = re.search(r"\$([^$]+)\$", item["taskHtml"]).group(1)
                left, right = equation.split("=")
                answer = Fraction(str(item["answer"]))
                self.assertEqual(evaluate(left, answer), evaluate(right, answer), item["id"])
                if int(prototype["id"].split(".")[1]) < 8:
                    continue
                values = [evaluate(left, Fraction(x)) - evaluate(right, Fraction(x)) for x in (0, 1, 2)]
                c = values[0]
                a = (values[2] - 2 * values[1] + c) / 2
                b = values[1] - c - a
                discriminant = b * b - 4 * a * c
                numerator_root = int(discriminant.numerator ** 0.5)
                denominator_root = int(discriminant.denominator ** 0.5)
                sqrt_d = Fraction(numerator_root, denominator_root)
                roots = sorted(((-b - sqrt_d) / (2 * a), (-b + sqrt_d) / (2 * a)))
                expected = roots[0] if prototype["id"] in {"9.8", "9.10", "9.11", "9.13"} else roots[-1]
                self.assertEqual(expected, answer, item["id"])

if __name__ == "__main__":
    unittest.main()
