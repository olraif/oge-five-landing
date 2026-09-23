import json
import re
import unittest
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"


class Task14DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task14-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            self.assertIn("window.OgeTask14DataPrototypes", text, path.name)
            self.assertNotIn("window.OgeTask13DataPrototypes", text, path.name)
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_11_prototypes_and_117_stable_public_ids(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(11, len(files))
        self.assertEqual([f"14.{index}" for index in range(1, 12)], [p["id"] for p in prototypes])
        counts = [10, 10, 10, 10, 10, 10, 20, 7, 10, 10, 10]
        self.assertEqual(counts, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(117, len(items))
        self.assertEqual(117, len({item["id"] for item in items}))
        self.assertEqual(
            [f"14.{kind}.{index}" for kind, count in enumerate(counts, 1) for index in range(1, count + 1)],
            [item["id"] for item in items],
        )

    def test_russian_text_is_valid_utf8_without_mojibake(self):
        _, prototypes = self.load_prototypes()
        broken = ("Р В Р’В Р Р†Р вЂљРЎвЂќ", "Р В Р’В Р РЋРІР‚В", "Р В Р’В Р вЂ™Р’В°", "РїС—Р…")
        for prototype in prototypes:
            for text in [prototype["title"], *(item["taskHtml"] for item in prototype["items"])]:
                self.assertFalse(any(marker in text for marker in broken), text)

    def test_every_item_is_self_contained_and_its_answer_matches_authored_parameters(self):
        _, prototypes = self.load_prototypes()
        for kind, prototype in enumerate(prototypes, 1):
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertNotIn("internalId", item, item["id"])
                self.assertNotIn("analogNumber", item, item["id"])
                self.assertNotIn("answerHtml", item, item["id"])
                self.assertTrue(item["taskHtml"].strip(), item["id"])
                marker = re.search(r'<span class="task14-authored"([^>]*)></span>', item["taskHtml"])
                self.assertIsNotNone(marker, item["id"])
                attrs = dict(re.findall(r'data-([a-z0-9-]+)="([^"]+)"', marker.group(1)))
                self.assertEqual(str(kind), attrs.get("kind"), item["id"])
                number = lambda name: Decimal(attrs[name])
                if kind in (1, 2):
                    expected = number("a1") + (number("n") - 1) * number("d")
                elif kind in (3, 5, 6, 7, 8):
                    expected = number("n") * (2 * number("a1") + (number("n") - 1) * number("d")) / 2
                elif kind == 4:
                    expected = number("a0") + number("t") * number("d")
                elif kind in (9, 10):
                    expected = number("a0") * number("q") ** int(number("steps"))
                else:
                    expected = number("a1")
                    position = 1
                    while expected >= number("threshold"):
                        expected *= number("q")
                        position += 1
                    expected = Decimal(position)
                self.assertEqual(expected, Decimal(str(item["answer"])), item["id"])
                self.assertEqual("number", item.get("format"), item["id"])

    def test_authored_conditions_are_unique(self):
        _, prototypes = self.load_prototypes()
        conditions = [item["taskHtml"] for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(len(conditions), len(set(conditions)))


if __name__ == "__main__":
    unittest.main()
