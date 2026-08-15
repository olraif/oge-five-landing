import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
EXPECTED_TOTALS = [5, 6, 11, 6, 4, 10, 8, 7, 3, 10, 5, 5, 11, 10, 11, 10, 10, 10, 10, 10, 11, 5, 5, 5, 5, 5, 5, 10, 13, 9, 10, 10, 3, 2, 10, 11, 10, 6, 10, 13]

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

    def test_full_dataset_has_40_prototypes_and_320_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(40, len(files))
        self.assertEqual([f"17.{index}" for index in range(1, 41)], [p["id"] for p in prototypes])
        self.assertEqual(EXPECTED_TOTALS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(320, len(items))
        self.assertEqual(320, len({item["internalId"] for item in items}))

    def test_every_item_has_answer_and_only_local_drawings(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertIn("MathStart", prototype["source"])
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])
                self.assertNotIn('/drawings/FIPI_OGE_MATH/poligons/', item["taskHtml"])
                for source in re.findall(r'src="([^"]+)"', item["taskHtml"]):
                    self.assertTrue((DATA_DIR / source).is_file(), f"{item['id']}: {source}")

if __name__ == "__main__":
    unittest.main()