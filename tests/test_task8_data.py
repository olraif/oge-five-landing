import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"


class Task8DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task8-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_35_prototypes_and_143_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(35, len(files))
        self.assertEqual([f"8.{index}" for index in range(1, 36)], [p["id"] for p in prototypes])

        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(143, len(items))
        self.assertEqual(143, len({item["id"] for item in items}))

    def test_every_item_is_self_contained_without_import_provenance(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            self.assertGreaterEqual(len(prototype["items"]), 2)
            for item in prototype["items"]:
                self.assertNotIn("internalId", item, item["id"])
                self.assertNotIn("analogNumber", item, item["id"])
                self.assertNotIn("answerHtml", item, item["id"])
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertIn("answer", item, item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])

    def test_all_authored_task_texts_are_unique_and_clean(self):
        _, prototypes = self.load_prototypes()
        tasks = [item["taskHtml"] for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(len(tasks), len(set(tasks)))
        joined = "\n".join(tasks)
        self.assertNotIn("FIPI", joined)
        self.assertNotIn("MathStart", joined)
        self.assertNotRegex(joined, r"Р[\u0080-\u00ff]")


if __name__ == "__main__":
    unittest.main()
