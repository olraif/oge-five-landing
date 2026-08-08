import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"

class Task11DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task11-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_10_prototypes_and_103_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(10, len(files))
        self.assertEqual([f"11.{index}" for index in range(1, 11)], [p["id"] for p in prototypes])
        self.assertEqual([14, 13, 10, 13, 14, 12, 6, 2, 15, 4], [len(prototype["items"]) for prototype in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(103, len(items))
        self.assertEqual(103, len({item["internalId"] for item in items}))

    def test_russian_text_is_valid_utf8_without_mojibake(self):
        _, prototypes = self.load_prototypes()
        broken_markers = ("Р›", "Рё", "Р°", "С‹", "СЏ", "�")
        for prototype in prototypes:
            texts = [prototype["title"], *(item["taskHtml"] for item in prototype["items"])]
            for text in texts:
                self.assertFalse(any(marker in text for marker in broken_markers), text)

    def test_every_item_contains_source_task_and_answer(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertIn("MathStart", prototype["source"])
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                self.assertIn("answer", item, item["id"])
                self.assertNotEqual("", str(item["answer"]).strip(), item["id"])


    def test_every_drawing_is_stored_locally_and_exists(self):
        _, prototypes = self.load_prototypes()
        image_sources = []
        for prototype in prototypes:
            for item in prototype["items"]:
                image_sources.extend(re.findall(r'<img[^>]+src="([^"]+)"', item["taskHtml"]))

        self.assertGreater(len(image_sources), 0)
        for source in image_sources:
            self.assertTrue(source.startswith("task11-drawings/"), source)
            self.assertTrue((DATA_DIR / source).is_file(), source)
if __name__ == "__main__":
    unittest.main()