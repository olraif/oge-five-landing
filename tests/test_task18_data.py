import json
import re
import unittest
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
EXPECTED_TOTALS = [12, 13, 12, 12, 23, 10, 12, 12, 13, 12, 12, 10, 5]
EXPECTED_MODELS = [
    "scaled_rhombus_diagonal",
    "scaled_triangle_cathetus",
    "scaled_triangle_midline",
    "scaled_trapezoid_midline",
    "scaled_segment_length",
    "combined_segment_ratio",
    "scaled_point_distance",
    "scaled_triangle_area",
    "scaled_parallelogram_area",
    "scaled_rhombus_area",
    "scaled_trapezoid_area",
    "combined_circle_area_ratio",
    "combined_circle_area_ratio",
]
LENGTH_MODELS = set(EXPECTED_MODELS[:5] + [EXPECTED_MODELS[6]])
AREA_MODELS = set(EXPECTED_MODELS[7:11])


class Task18DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task18-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def expected_answer(self, model, params):
        base = Fraction(str(params["base_value"]))
        if model in LENGTH_MODELS:
            scale = Fraction(params["scale_num"], params["scale_den"])
            return base * scale
        if model in AREA_MODELS:
            scale = Fraction(params["scale_num"], params["scale_den"])
            return base * scale * scale
        return base + 1

    def test_full_dataset_has_13_prototypes_and_158_stable_public_ids(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(13, len(files))
        self.assertEqual([f"18.{index}" for index in range(1, 14)], [p["id"] for p in prototypes])
        self.assertEqual(EXPECTED_TOTALS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(158, len(items))
        self.assertEqual(158, len({item["id"] for item in items}))
        self.assertEqual(
            [f"18.{kind}.{index}" for kind, count in enumerate(EXPECTED_TOTALS, 1) for index in range(1, count + 1)],
            [item["id"] for item in items],
        )

    def test_every_item_is_authored_without_provenance_and_keeps_one_local_drawing(self):
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
                self.assertTrue(sources[0].startswith("task18-drawings/"), item["id"])
                self.assertTrue((DATA_DIR / sources[0]).is_file(), f'{item["id"]}: {sources[0]}')

    def test_all_authored_answers_match_independent_scaling_formulas(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            for item in prototype["items"]:
                authored = item["authored"]
                expected = self.expected_answer(authored["kind"], authored["params"])
                actual = Fraction(str(item["answer"]).replace(",", "."))
                self.assertEqual(expected, actual, item["id"])

    def test_all_158_authored_conditions_are_unique(self):
        _, prototypes = self.load_prototypes()
        task_html = [item["taskHtml"] for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(158, len(set(task_html)))


if __name__ == "__main__":
    unittest.main()
