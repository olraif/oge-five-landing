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

    def test_full_dataset_has_10_prototypes_and_103_stable_public_ids(self):
        files, prototypes = self.load_prototypes()
        counts = [14, 13, 10, 13, 14, 12, 6, 2, 15, 4]
        self.assertEqual(10, len(files))
        self.assertEqual([f"11.{index}" for index in range(1, 11)], [p["id"] for p in prototypes])
        self.assertEqual(counts, [len(prototype["items"]) for prototype in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(103, len(items))
        self.assertEqual(103, len({item["id"] for item in items}))
        self.assertEqual(
            [f"11.{kind}.{index}" for kind, count in enumerate(counts, 1) for index in range(1, count + 1)],
            [item["id"] for item in items],
        )

    def test_every_item_is_authored_self_contained_and_valid_utf8(self):
        _, prototypes = self.load_prototypes()
        broken_markers = ("Р›", "Рё", "Р°", "С‹", "СЏ", "�")
        for prototype in prototypes:
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertNotIn("internalId", item, item["id"])
                self.assertNotIn("analogNumber", item, item["id"])
                self.assertNotIn("answerHtml", item, item["id"])
                self.assertFalse(any(marker in item["taskHtml"] for marker in broken_markers), item["id"])
                self.assertRegex(str(item["answer"]), r"^[123]{3}$", item["id"])

    def test_every_answer_matches_the_reordered_options(self):
        _, prototypes = self.load_prototypes()
        option_pattern = re.compile(r'<th data-target-graph="([123])">')
        for prototype in prototypes:
            for item in prototype["items"]:
                targets = [int(value) for value in option_pattern.findall(item["taskHtml"])]
                self.assertEqual(3, len(targets), item["id"])
                self.assertEqual([1, 2, 3], sorted(targets), item["id"])
                direction = re.search(r'data-direction="([^"]+)"', item["taskHtml"])
                self.assertIsNotNone(direction, item["id"])
                if direction.group(1) == "options-to-graphs":
                    expected = "".join(str(target) for target in targets)
                else:
                    expected = "".join(str(targets.index(graph) + 1) for graph in (1, 2, 3))
                self.assertEqual(expected, str(item["answer"]), item["id"])

    def test_first_item_of_each_type_has_hand_checked_reordered_answer(self):
        _, prototypes = self.load_prototypes()
        self.assertEqual(
            ["321", "213", "132", "312", "213", "213", "312", "312", "123", "321"],
            [prototype["items"][0]["answer"] for prototype in prototypes],
        )

    def test_every_item_keeps_three_local_drawings(self):
        _, prototypes = self.load_prototypes()
        sources = []
        for prototype in prototypes:
            for item in prototype["items"]:
                item_sources = re.findall(r'<img[^>]+src="([^"]+)"', item["taskHtml"])
                self.assertEqual(3, len(item_sources), item["id"])
                sources.extend(item_sources)
        self.assertEqual(309, len(sources))
        self.assertEqual(309, len(set(sources)))
        for source in sources:
            self.assertTrue(source.startswith("task11-drawings/"), source)
            self.assertTrue((DATA_DIR / source).is_file(), source)

    def test_authored_conditions_are_unique(self):
        _, prototypes = self.load_prototypes()
        conditions = [item["taskHtml"] for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(len(conditions), len(set(conditions)))


if __name__ == "__main__":
    unittest.main()
