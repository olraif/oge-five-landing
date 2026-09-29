import json
import re
import unittest
from fractions import Fraction
from pathlib import Path
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
EXPECTED_TOTALS = [5, 6, 11, 6, 4, 10, 8, 7, 3, 10, 5, 5, 11, 10, 11, 10, 10, 10, 10, 10, 11, 5, 5, 5, 5, 5, 5, 10, 13, 9, 10, 10, 3, 2, 10, 11, 10, 6, 10, 13]
EXPECTED_MODELS = [
    "parallelogram_larger_angle", "parallelogram_smaller_angle", "parallelogram_bisector_angle",
    "parallelogram_diagonal_larger", "parallelogram_diagonal_smaller", "parallelogram_half_diagonal",
    "parallelogram_area", "parallelogram_larger_height", "parallelogram_smaller_height",
    "rhombus_diagonal_half_angle", "rhombus_larger_angle", "rhombus_smaller_angle",
    "rhombus_smaller_diagonal_angle", "rhombus_perpendicular_angle", "rhombus_height_diagonal_angle",
    "rhombus_height", "rhombus_area_from_perimeter", "rhombus_area_from_diagonal_tangent",
    "rectangle_diagonal_angle", "rectangle_diagonal", "square_diagonal",
    "right_trapezoid_larger_angle", "right_trapezoid_smaller_angle", "isosceles_trapezoid_smaller_angle",
    "isosceles_trapezoid_larger_angle", "isosceles_trapezoid_smaller_from_sum",
    "isosceles_trapezoid_larger_from_sum", "trapezoid_bisector_angle", "trapezoid_diagonal_small_base_one",
    "trapezoid_diagonal_small_base_two", "trapezoid_midline_segment", "trapezoid_midline",
    "trapezoid_greater_base", "trapezoid_smaller_base", "trapezoid_base_from_projection_one",
    "trapezoid_base_from_projection_two", "trapezoid_area", "trapezoid_area_45",
    "trapezoid_base_angle", "trapezoid_height_45",
]


class Task17DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task17-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def expected_answer(self, model, p):
        formulas = {
            "parallelogram_larger_angle": lambda: 180 - p["angle"],
            "parallelogram_smaller_angle": lambda: 180 - p["angle"],
            "parallelogram_bisector_angle": lambda: 2 * p["angle"],
            "parallelogram_diagonal_larger": lambda: 180 - p["first"] - p["second"],
            "parallelogram_diagonal_smaller": lambda: 180 - p["first"] - p["second"],
            "parallelogram_half_diagonal": lambda: Fraction(p["diagonal"], 2),
            "parallelogram_area": lambda: p["base"] * p["height"],
            "parallelogram_larger_height": lambda: Fraction(p["area"], min(p["side_a"], p["side_b"])),
            "parallelogram_smaller_height": lambda: Fraction(p["area"], max(p["side_a"], p["side_b"])),
            "rhombus_diagonal_half_angle": lambda: Fraction(180 - p["angle"], 2),
            "rhombus_larger_angle": lambda: 180 - p["angle"],
            "rhombus_smaller_angle": lambda: 180 - p["angle"],
            "rhombus_smaller_diagonal_angle": lambda: Fraction(180 - p["angle"], 2),
            "rhombus_perpendicular_angle": lambda: 2 * p["angle"],
            "rhombus_height_diagonal_angle": lambda: Fraction(p["angle"], 2),
            "rhombus_height": lambda: Fraction(p["side"], 2),
            "rhombus_area_from_perimeter": lambda: Fraction(p["perimeter"] ** 2, 32),
            "rhombus_area_from_diagonal_tangent": lambda: Fraction(p["diagonal"] ** 2 * p["tan_num"], 2 * p["tan_den"]),
            "rectangle_diagonal_angle": lambda: 2 * min(p["angle"], 90 - p["angle"]),
            "rectangle_diagonal": lambda: 2 * p["half_diagonal"],
            "square_diagonal": lambda: 2 * p["coefficient"],
            "right_trapezoid_larger_angle": lambda: 180 - p["angle"],
            "right_trapezoid_smaller_angle": lambda: 180 - p["angle"],
            "isosceles_trapezoid_smaller_angle": lambda: 180 - p["angle"],
            "isosceles_trapezoid_larger_angle": lambda: 180 - p["angle"],
            "isosceles_trapezoid_smaller_from_sum": lambda: 180 - Fraction(p["sum"], 2),
            "isosceles_trapezoid_larger_from_sum": lambda: 180 - Fraction(p["sum"], 2),
            "trapezoid_bisector_angle": lambda: 180 - Fraction(3 * p["angle"], 2),
            "trapezoid_diagonal_small_base_one": lambda: p["base_angle"] - p["side_angle"],
            "trapezoid_diagonal_small_base_two": lambda: 180 - p["base_angle"] - p["side_angle"],
            "trapezoid_midline_segment": lambda: Fraction(p["greater_base"], 2),
            "trapezoid_midline": lambda: Fraction(p["base_a"] + p["base_b"], 2),
            "trapezoid_greater_base": lambda: p["smaller_base"] + 2 * p["projection"],
            "trapezoid_smaller_base": lambda: p["greater_base"] - 2 * p["projection"],
            "trapezoid_base_from_projection_one": lambda: p["right_segment"] - p["left_segment"],
            "trapezoid_base_from_projection_two": lambda: p["right_segment"] - p["left_segment"],
            "trapezoid_area": lambda: Fraction((p["base_a"] + p["base_b"]) * p["height"], 2),
            "trapezoid_area_45": lambda: Fraction(p["greater_base"] ** 2 - p["smaller_base"] ** 2, 4),
            "trapezoid_base_angle": lambda: Fraction(180 + p["first_angle"] - p["second_angle"], 2),
            "trapezoid_height_45": lambda: Fraction(p["base_a"] + p["base_b"], 2),
        }
        return Fraction(formulas[model]())

    def test_full_dataset_has_40_prototypes_and_320_stable_public_ids(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(40, len(files))
        self.assertEqual([f"17.{index}" for index in range(1, 41)], [p["id"] for p in prototypes])
        self.assertEqual(EXPECTED_TOTALS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(320, len(items))
        self.assertEqual(320, len({item["id"] for item in items}))
        self.assertEqual(
            [f"17.{kind}.{index}" for kind, count in enumerate(EXPECTED_TOTALS, 1) for index in range(1, count + 1)],
            [item["id"] for item in items],
        )

    def test_every_item_is_authored_without_provenance_and_keeps_a_local_drawing(self):
        _, prototypes = self.load_prototypes()
        for kind, prototype in enumerate(prototypes, 1):
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                for field in ("internalId", "analogNumber", "answerHtml", "source"):
                    self.assertNotIn(field, item, item["id"])
                self.assertEqual(EXPECTED_MODELS[kind - 1], item["authored"]["kind"], item["id"])
                sources = re.findall(r'<img[^>]+src="([^"]+)"', item["taskHtml"])
                self.assertEqual(1, len(sources), item["id"])
                self.assertTrue(sources[0].startswith("task17-drawings/"), item["id"])
                self.assertTrue((DATA_DIR / sources[0]).is_file(), f'{item["id"]}: {sources[0]}')

    def test_all_authored_answers_match_independent_geometry_formulas(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            for item in prototype["items"]:
                authored = item["authored"]
                expected = self.expected_answer(authored["kind"], authored["params"])
                actual = Fraction(str(item["answer"]).replace(",", "."))
                self.assertEqual(expected, actual, item["id"])

    def test_all_320_authored_conditions_are_unique(self):
        _, prototypes = self.load_prototypes()
        task_html = [item["taskHtml"] for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(320, len(set(task_html)))

    def test_type_38_cards_request_the_large_diagram_layout(self):
        _, prototypes = self.load_prototypes()
        for item in prototypes[37]["items"]:
            soup = BeautifulSoup(item["taskHtml"], "html.parser")
            self.assertIsNotNone(soup.select_one(".task17-diagram-large"), item["id"])


if __name__ == "__main__":
    unittest.main()
