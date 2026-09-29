import json
import math
import re
import unittest
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
EXPECTED_TOTALS = [10, 10, 10, 10, 10, 5, 5, 10, 10, 10, 10, 10, 10, 12, 10, 10, 10, 10, 10, 10, 12, 5, 10, 10, 10, 10, 10, 10, 10, 11, 10, 10, 10, 10]

class Task16DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task16-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            self.assertIn("window.OgeTask16DataPrototypes", text, path.name)
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_34_prototypes_and_330_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(34, len(files))
        self.assertEqual([f"16.{index}" for index in range(1, 35)], [p["id"] for p in prototypes])
        self.assertEqual(EXPECTED_TOTALS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(330, len(items))
        self.assertEqual(330, len({item["id"] for item in items}))

    def test_every_item_is_authored_and_keeps_its_local_drawing(self):
        _, prototypes = self.load_prototypes()
        conditions = []
        for prototype in prototypes:
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])
                self.assertIn("authored", item, item["id"])
                for provenance_key in ("internalId", "answerHtml", "analogNumber", "source"):
                    self.assertNotIn(provenance_key, item, item["id"])
                self.assertNotIn('/drawings/FIPI_OGE_MATH/circles/', item["taskHtml"])
                for source in re.findall(r'src="([^"]+)"', item["taskHtml"]):
                    self.assertTrue((DATA_DIR / source).is_file(), f"{item['id']}: {source}")
                conditions.append(item["taskHtml"])
        self.assertEqual(330, len(set(conditions)))

    def test_every_answer_matches_the_authored_circle_geometry_model(self):
        _, prototypes = self.load_prototypes()

        def expected(kind, p):
            if kind == "inscribed-from-central":
                return Fraction(180 - p["central_angle"], 2)
            if kind == "central-from-inscribed":
                return 180 - 2 * p["inscribed_angle"]
            if kind in ("semicircle-opposite-angle", "diameter-right-triangle-angle"):
                return 90 - p["known_angle"]
            if kind == "inscribed-from-central-direct":
                return Fraction(p["central_angle"], 2)
            if kind in ("diameter-right-triangle-leg", "diameter-right-triangle-other-leg"):
                square = (2 * p["radius"]) ** 2 - p["known_leg"] ** 2
                root = math.isqrt(square)
                self.assertEqual(square, root * root)
                return root
            if kind == "right-triangle-circumradius":
                square = p["leg_a"] ** 2 + p["leg_b"] ** 2
                root = math.isqrt(square)
                self.assertEqual(square, root * root)
                return Fraction(root, 2)
            if kind == "equilateral-circumradius-from-side":
                return p["sqrt3_coefficient"]
            if kind == "equilateral-side-from-circumradius":
                return 3 * p["sqrt3_coefficient"]
            if kind == "circumradius-from-thirty-degree-side":
                return p["opposite_side"]
            if kind == "equilateral-side-from-inradius":
                return p["side"]
            if kind == "rectangle-area-from-diagonal":
                return Fraction(
                    p["diameter"] ** 2 * p["sin_num"] * p["cos_num"],
                    p["sin_den"] * p["cos_den"],
                )
            if kind in ("cyclic-trapezoid-adjacent-angle", "cyclic-trapezoid-opposite-angle", "cyclic-quadrilateral-opposite-angle"):
                return 180 - p["known_angle"]
            if kind == "cyclic-quadrilateral-angle-difference":
                return p["whole_angle"] - p["part_angle"]
            if kind == "cyclic-quadrilateral-angle-sum":
                return p["angle_a"] + p["angle_b"]
            if kind == "square-circumradius-from-side":
                return p["sqrt2_coefficient"]
            if kind == "square-side-from-circumradius":
                return 2 * p["sqrt2_coefficient"]
            if kind == "square-area-from-midpoint-circle":
                return Fraction(4 * p["radius"] ** 2, 5)
            if kind == "tangent-angle-base":
                return Fraction(p["tangent_angle"], 2)
            if kind == "equilateral-side-from-inradius-sqrt3":
                return 6 * p["sqrt3_coefficient"]
            if kind == "equilateral-inradius-from-side":
                return Fraction(p["sqrt3_coefficient"], 2)
            if kind == "triangle-area-from-perimeter-inradius":
                return Fraction(p["perimeter"] * p["inradius"], 2)
            if kind == "square-inradius":
                return Fraction(p["side"], 2)
            if kind == "circumscribed-square-area":
                return 4 * p["radius"] ** 2
            if kind == "square-diagonal-from-inradius":
                return 4 * p["sqrt2_coefficient"]
            if kind == "rhombus-inradius":
                return Fraction(p["diagonal"] * p["tan_num"], 2 * p["ratio_hyp"])
            if kind in ("isosceles-trapezoid-height", "right-trapezoid-height", "tangential-trapezoid-height"):
                return 2 * p["radius"]
            if kind in ("tangential-quadrilateral-side", "tangential-trapezoid-base"):
                return p["side_a"] + p["side_c"] - p["side_b"]
            self.fail(f"Unknown authored model: {kind}")

        for prototype in prototypes:
            for item in prototype["items"]:
                model = item["authored"]
                self.assertEqual(
                    Fraction(str(item["answer"])),
                    Fraction(expected(model["kind"], model["params"])),
                    item["id"],
                )

    def test_russian_text_is_valid_utf8_without_mojibake(self):
        _, prototypes = self.load_prototypes()
        broken = ("Р В ", "Р РЋ", "РІР‚", "Р Сџ", "Р В°Р ", "����")
        for prototype in prototypes:
            for text in [prototype["title"], *(item["taskHtml"] for item in prototype["items"])]:
                self.assertFalse(any(marker in text for marker in broken), text)

if __name__ == "__main__":
    unittest.main()
