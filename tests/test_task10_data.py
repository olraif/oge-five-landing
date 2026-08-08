import json
import re
import unittest
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

    def test_full_dataset_has_18_prototypes_and_217_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(18, len(files))
        self.assertEqual([f"10.{index}" for index in range(1, 19)], [p["id"] for p in prototypes])
        self.assertEqual([10, 16, 16, 16, 8, 17, 10, 16, 10, 6, 10, 16, 16, 10, 10, 10, 10, 10], [len(prototype["items"]) for prototype in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(217, len(items))
        self.assertEqual(217, len({item["internalId"] for item in items}))

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

        self.assertEqual(50, len(image_sources))
        for source in image_sources:
            self.assertTrue(source.startswith("task10-drawings/"), source)
            self.assertTrue((DATA_DIR / source).is_file(), source)
if __name__ == "__main__":
    unittest.main()