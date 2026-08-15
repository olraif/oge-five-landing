import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"


class Task13DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task13-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_10_prototypes_and_131_unique_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(10, len(files))
        self.assertEqual([f"13.{index}" for index in range(1, 11)], [p["id"] for p in prototypes])
        self.assertEqual([10, 20, 20, 10, 11, 10, 10, 10, 10, 20], [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(131, len(items))
        self.assertEqual(131, len({item["internalId"] for item in items}))

    def test_russian_text_is_valid_utf8_without_mojibake(self):
        _, prototypes = self.load_prototypes()
        broken = ("Р В РІР‚С”", "Р В РЎвЂ", "Р В Р’В°", "Р РЋРІР‚в„–", "Р РЋР РЏ", "РїС—Р…", "пїЅ")
        for prototype in prototypes:
            for text in [prototype["title"], *(item["taskHtml"] for item in prototype["items"])]:
                self.assertFalse(any(marker in text for marker in broken), text)

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
