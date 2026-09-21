import json
import re
import unittest
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"


class Task10DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task10-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_18_prototypes_and_217_stable_public_ids(self):
        files, prototypes = self.load_prototypes()
        counts = [10, 16, 16, 16, 8, 17, 10, 16, 10, 6, 10, 16, 16, 10, 10, 10, 10, 10]
        self.assertEqual(18, len(files))
        self.assertEqual([f"10.{index}" for index in range(1, 19)], [p["id"] for p in prototypes])
        self.assertEqual(counts, [len(prototype["items"]) for prototype in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(217, len(items))
        self.assertEqual(217, len({item["id"] for item in items}))
        self.assertEqual(
            [f"10.{kind}.{index}" for kind, count in enumerate(counts, 1) for index in range(1, count + 1)],
            [item["id"] for item in items],
        )

    def test_every_item_is_authored_self_contained_and_valid_utf8(self):
        _, prototypes = self.load_prototypes()
        broken_markers = ("Р›", "Рё", "Р°", "С‹", "СЏ", "�")
        for prototype in prototypes:
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertNotIn("internalId", item, item["id"])
                self.assertNotIn("analogNumber", item, item["id"])
                self.assertNotIn("answerHtml", item, item["id"])
                self.assertFalse(any(marker in item["taskHtml"] for marker in broken_markers), item["id"])
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])

    def test_every_answer_matches_the_probability_encoded_in_its_condition(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            for item in prototype["items"]:
                total = re.search(r'data-total="(\d+)"', item["taskHtml"])
                favorable = re.search(r'data-favorable="(\d+)"', item["taskHtml"])
                self.assertIsNotNone(total, item["id"])
                self.assertIsNotNone(favorable, item["id"])
                expected = Decimal(favorable.group(1)) / Decimal(total.group(1))
                self.assertEqual(expected, Decimal(str(item["answer"])), item["id"])

    def test_authored_conditions_are_unique_and_numbers_are_visible(self):
        _, prototypes = self.load_prototypes()
        items = [item for prototype in prototypes for item in prototype["items"]]
        conditions = [item["taskHtml"] for item in items]
        self.assertEqual(len(conditions), len(set(conditions)))
        for prototype in prototypes[:13]:
            for item in prototype["items"]:
                total_match = re.search(r'data-total="(\d+)"', item["taskHtml"])
                favorable_match = re.search(r'data-favorable="(\d+)"', item["taskHtml"])
                self.assertIsNotNone(total_match, item["id"])
                self.assertIsNotNone(favorable_match, item["id"])
                total = total_match.group(1)
                favorable = favorable_match.group(1)
                self.assertIn(f"${total}$", item["taskHtml"], item["id"])
                self.assertIn(f"${favorable}$", item["taskHtml"], item["id"])

    def test_diagram_and_tree_items_keep_local_drawings(self):
        _, prototypes = self.load_prototypes()
        image_sources = []
        for prototype in prototypes[13:]:
            for item in prototype["items"]:
                image_sources.extend(re.findall(r'<img[^>]+src="([^"]+)"', item["taskHtml"]))
        self.assertEqual(50, len(image_sources))
        for source in image_sources:
            self.assertTrue(source.startswith("task10-drawings/"), source)
            self.assertTrue((DATA_DIR / source).is_file(), source)


if __name__ == "__main__":
    unittest.main()
