import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
EXPECTED_TOTALS = [12, 13, 12, 12, 23, 10, 12, 12, 13, 12, 12, 10, 5]


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

    def test_full_dataset_has_13_prototypes_and_158_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(13, len(files))
        self.assertEqual([f"18.{index}" for index in range(1, 14)], [p["id"] for p in prototypes])
        self.assertEqual(EXPECTED_TOTALS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(158, len(items))
        self.assertEqual(158, len({item["internalId"] for item in items}))

    def test_every_item_has_answer_and_only_local_drawings(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertIn("MathStart", prototype["source"])
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])
                self.assertNotIn("/drawings/FIPI_OGE_MATH/checkered_paper/", item["taskHtml"])
                for source in re.findall(r'src="([^"]+)"', item["taskHtml"]):
                    self.assertTrue((DATA_DIR / source).is_file(), f"{item['id']}: {source}")


if __name__ == "__main__":
    unittest.main()
