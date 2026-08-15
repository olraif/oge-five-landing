import json
import re
import unittest
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
        self.assertEqual(330, len({item["internalId"] for item in items}))

    def test_every_item_has_source_answer_and_local_drawing(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertIn("MathStart", prototype["source"])
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])
                self.assertNotIn('/drawings/FIPI_OGE_MATH/circles/', item["taskHtml"])
                for source in re.findall(r'src="([^"]+)"', item["taskHtml"]):
                    self.assertTrue((DATA_DIR / source).is_file(), f"{item['id']}: {source}")

    def test_russian_text_is_valid_utf8_without_mojibake(self):
        _, prototypes = self.load_prototypes()
        broken = ("Р В ", "Р РЋ", "РІР‚", "Р Сџ", "Р В°Р ", "����")
        for prototype in prototypes:
            for text in [prototype["title"], *(item["taskHtml"] for item in prototype["items"])]:
                self.assertFalse(any(marker in text for marker in broken), text)

if __name__ == "__main__":
    unittest.main()
