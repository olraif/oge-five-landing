import json
import math
import re
import unittest
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
EXPECTED_TOTALS = [12, 10, 12, 12, 5, 12, 10, 10, 10, 12, 4, 4, 4, 4, 4, 4, 12, 12, 10, 10, 12, 12, 10, 11, 10, 10, 10, 10]


def as_fraction(value):
    return Fraction(str(value).replace(",", "."))


def expected_answer(authored):
    kind = authored["kind"]
    p = authored["params"]
    if kind == "third-angle":
        return Fraction(180 - p["angle_a"] - p["angle_b"])
    if kind == "exterior-supplement":
        return Fraction(180 - p["interior_angle"])
    if kind in {"right-complement", "altitude-complement", "median-right-angle"}:
        return Fraction(90 - p["known_angle"])
    if kind == "isosceles-base-angle":
        return Fraction(180 - p["apex_angle"], 2)
    if kind == "isosceles-apex-from-exterior":
        return Fraction(2 * p["exterior_angle"] - 180)
    if kind == "angle-bisector-half":
        return Fraction(p["whole_angle"], 2)
    if kind == "bisector-equal-segment":
        return Fraction(180 - 3 * p["base_angle"])
    if kind in {"median-midpoint", "triangle-midline"}:
        return Fraction(p["whole_side"], 2)
    if kind in {
        "equilateral-side-from-median",
        "equilateral-side-from-bisector",
        "equilateral-side-from-height",
    }:
        return Fraction(2 * p["sqrt3_coefficient"])
    if kind in {
        "equilateral-bisector-from-side",
        "equilateral-median-from-side",
        "equilateral-height-from-side",
    }:
        return Fraction(3 * p["sqrt3_coefficient"], 2)
    if kind == "right-triangle-area":
        return Fraction(p["leg_a"] * p["leg_b"], 2)
    if kind == "sine-triangle-area":
        return Fraction(p["side_a"] * p["side_b"] * p["sin_num"], 2 * p["sin_den"])
    if kind == "base-height-area":
        return Fraction(p["base"] * p["height"], 2)
    if kind == "pythagorean-hypotenuse":
        square = p["leg_a"] ** 2 + p["leg_b"] ** 2
        root = math.isqrt(square)
        if root * root != square:
            raise AssertionError(f"Non-integer hypotenuse: {p}")
        return Fraction(root)
    if kind == "pythagorean-leg":
        square = p["hypotenuse"] ** 2 - p["known_leg"] ** 2
        root = math.isqrt(square)
        if root * root != square:
            raise AssertionError(f"Non-integer leg: {p}")
        return Fraction(root)
    if kind in {"sine-ratio", "cosine-ratio", "tangent-ratio"}:
        return Fraction(p["numerator"], p["denominator"])
    if kind in {"side-from-sine", "side-from-cosine", "side-from-tangent"}:
        return Fraction(p["known_length"] * p["ratio_num"], p["ratio_den"])
    raise AssertionError(f"Unknown authored model: {kind}")


class Task15DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task15-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            self.assertIn("window.OgeTask15DataPrototypes", text, path.name)
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_28_prototypes_and_258_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(28, len(files))
        self.assertEqual([f"15.{index}" for index in range(1, 29)], [p["id"] for p in prototypes])
        self.assertEqual(EXPECTED_TOTALS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(258, len(items))
        self.assertEqual(258, len({item["id"] for item in items}))

    def test_authored_dataset_has_no_external_provenance_fields(self):
        _, prototypes = self.load_prototypes()
        forbidden = {"source", "internalId", "analogNumber", "answerHtml"}
        for prototype in prototypes:
            self.assertTrue(forbidden.isdisjoint(prototype), prototype["id"])
            for item in prototype["items"]:
                self.assertTrue(forbidden.isdisjoint(item), item["id"])
                self.assertIn("authored", item, item["id"])

    def test_every_saved_answer_matches_its_authored_geometry_model(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            for item in prototype["items"]:
                self.assertIn("authored", item, item["id"])
                expected = expected_answer(item["authored"])
                answers = item["answer"] if isinstance(item["answer"], list) else [item["answer"]]
                self.assertIn(expected, [as_fraction(answer) for answer in answers], item["id"])

    def test_russian_text_is_valid_utf8_without_mojibake(self):
        _, prototypes = self.load_prototypes()
        broken = ("Р ", "РЎ", "вЂ", "Рџ", "Р°Р")
        for prototype in prototypes:
            for text in [prototype["title"], *(item["taskHtml"] for item in prototype["items"])]:
                self.assertFalse(any(marker in text for marker in broken), text)

    def test_every_item_has_condition_answer_and_existing_drawing(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])
                match = re.search(r'src="([^"]+)"', item["taskHtml"])
                self.assertIsNotNone(match, item["id"])
                self.assertTrue((DATA_DIR / match.group(1)).is_file(), item["id"])

    def test_tangent_uses_supported_math_notation(self):
        data = "".join(path.read_text(encoding="utf-8") for path in sorted(DATA_DIR.glob("task15-data-*.js")))
        self.assertNotIn(r"\\tg", data)
        self.assertIn(r"\\operatorname{tg}", data)


if __name__ == "__main__":
    unittest.main()
