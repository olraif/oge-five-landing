import json
import re
import unittest
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
        self.assertEqual(124, len({item["internalId"] for item in items}))

    def test_every_item_contains_source_task_and_answer(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertIn("MathStart", prototype["source"])
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertIn("answer", item, item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])

if __name__ == "__main__":
    unittest.main()