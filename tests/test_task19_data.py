import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
EXPECTED_TOTALS = [88, 63]


class Task19DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task19-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_2_prototypes_and_151_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(2, len(files))
        self.assertEqual(["19.1", "19.2"], [p["id"] for p in prototypes])
        self.assertEqual(EXPECTED_TOTALS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(151, len(items))
        self.assertEqual(151, len({item["internalId"] for item in items}))

    def test_every_item_has_answer_and_clean_utf8_text(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertIn("MathStart", prototype["source"])
            self.assertTrue(prototype["title"].strip())
            self.assertNotIn("�", prototype["title"])
            for item in prototype["items"]:
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])
                self.assertNotIn("�", item["taskHtml"], item["id"])


if __name__ == "__main__":
    unittest.main()
