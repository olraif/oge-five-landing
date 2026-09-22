import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
COUNTS = [10, 20, 20, 10, 11, 10, 10, 10, 10, 20]


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

    def test_full_dataset_has_10_prototypes_and_131_stable_public_ids(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(10, len(files))
        self.assertEqual([f"13.{index}" for index in range(1, 11)], [p["id"] for p in prototypes])
        self.assertEqual(COUNTS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(131, len(items))
        self.assertEqual(131, len({item["id"] for item in items}))
        self.assertEqual(
            [f"13.{kind}.{index}" for kind, count in enumerate(COUNTS, 1) for index in range(1, count + 1)],
            [item["id"] for item in items],
        )

    def test_russian_text_is_valid_utf8_without_mojibake(self):
        _, prototypes = self.load_prototypes()
        broken = ("Р В РІР‚С”", "Р В РЎвЂ", "Р В Р’В°", "Р РЋРІР‚в„–", "Р РЋР РЏ", "РїС—Р…", "пїЅ")
        for prototype in prototypes:
            for text in [prototype["title"], *(item["taskHtml"] for item in prototype["items"])]:
                self.assertFalse(any(marker in text for marker in broken), text)

    def test_every_item_is_authored_self_contained_and_has_a_valid_answer(self):
        _, prototypes = self.load_prototypes()
        for kind, prototype in enumerate(prototypes, 1):
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertNotIn("internalId", item, item["id"])
                self.assertNotIn("analogNumber", item, item["id"])
                self.assertNotIn("answerHtml", item, item["id"])
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                marker = re.search(r'<span class="task13-authored"([^>]*)></span>', item["taskHtml"])
                self.assertIsNotNone(marker, item["id"])
                attrs = dict(re.findall(r'data-([a-z0-9-]+)="([^"]+)"', marker.group(1)))
                self.assertEqual(str(kind), attrs.get("kind"), item["id"])
                self.assertIn(int(attrs.get("scale", "0")), range(2, 6), item["id"])
                self.assertIn(int(attrs.get("option-shift", "0")), range(1, 4), item["id"])
                self.assertIn(str(item.get("answer")), {"1", "2", "3", "4"}, item["id"])

    def test_each_item_has_four_answer_choices_and_all_drawings_exist(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            for item in prototype["items"]:
                cells = re.findall(r'<t[hd]>[\s\S]*?</t[hd]>', item["taskHtml"], re.IGNORECASE)
                self.assertEqual(4, len(cells), item["id"])
                for source in re.findall(r'<img[^>]+src="([^"]+)"', item["taskHtml"]):
                    self.assertTrue(source.startswith("task13-drawings/"), item["id"])
                    self.assertTrue((DATA_DIR / source).is_file(), f'{item["id"]}: {source}')

    def test_authored_conditions_are_unique(self):
        _, prototypes = self.load_prototypes()
        conditions = [item["taskHtml"] for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(len(conditions), len(set(conditions)))


if __name__ == "__main__":
    unittest.main()
