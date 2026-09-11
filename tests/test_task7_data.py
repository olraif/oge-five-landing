import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"


class Task7DataContractTests(unittest.TestCase):
    EXPECTED_ITEM_COUNTS = [5, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
    EXPECTED_ANSWERS = {
        "7.1": ["4", "1", "3", "1", "4"],
        "7.2": ["2", "4", "3", "2"],
        "7.3": ["3", "1", "2", "4"],
        "7.4": ["2", "1", "2", "1"],
        "7.5": ["1", "1", "3", "4"],
        "7.6": ["4", "4", "2", "3", "1"],
        "7.7": ["4", "2", "3", "4", "1"],
        "7.8": ["2", "2", "3", "4", "3"],
        "7.9": ["3", "2", "3", "3", "1"],
        "7.10": ["3", "4", "1", "2", "3"],
        "7.11": ["3", "4", "1", "3", "4"],
        "7.12": ["3", "4", "1", "2", "3"],
        "7.13": ["4", "2", "3", "4", "1"],
        "7.14": ["3", "1", "4", "2", "3"],
        "7.15": ["2", "4", "1", "3", "2"],
        "7.16": ["2", "3", "4", "1", "3"],
        "7.17": ["3", "2", "4", "1", "3"],
    }
    EXPECTED_DRAWINGS = {
        "7.1": [2, 3, 4, 5, 6],
        "7.2": [13, 98, 14, 15],
        "7.3": [92, 18, 19, 86],
        "7.4": [22, 95, 23, 93],
        "7.5": [25, 26, 27, 28],
        "7.6": [32, 33, 34, 35, 36],
        "7.7": [80, 81, 91, 89, 42],
        "7.8": [90, 51, 83, 54, 82],
        "7.9": [50, 52, 53, 58, 59],
        "7.16": [110, 105, 109, 107, 102],
        "7.17": [69, 70, 71, 84, 72],
    }

    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task7-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_dataset_keeps_17_prototypes_and_81_items(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(17, len(files))
        self.assertEqual([f"7.{index}" for index in range(1, 18)], [p["id"] for p in prototypes])
        self.assertEqual(self.EXPECTED_ITEM_COUNTS, [len(p["items"]) for p in prototypes])
        self.assertEqual(81, sum(len(p["items"]) for p in prototypes))

    def test_reworked_dataset_has_no_import_provenance_fields(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertNotIn("source", prototype, prototype["id"])
            for item in prototype["items"]:
                self.assertNotIn("internalId", item, item["id"])

    def test_existing_drawings_are_preserved_for_the_same_items(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            drawing_numbers = []
            for item in prototype["items"]:
                matches = re.findall(r"number-line-(\d+)\.svg", item["taskHtml"])
                drawing_numbers.extend(int(number) for number in matches)
            self.assertEqual(self.EXPECTED_DRAWINGS.get(prototype["id"], []), drawing_numbers, prototype["id"])

    def test_every_item_has_one_numbered_answer_from_four_options(self):
        _, prototypes = self.load_prototypes()
        ids = set()
        for prototype in prototypes:
            for item in prototype["items"]:
                self.assertNotIn(item["id"], ids)
                ids.add(item["id"])
                self.assertIn(item["answer"], {"1", "2", "3", "4"}, item["id"])
                self.assertEqual(f"${item['answer']}$", item["answerHtml"], item["id"])
                for option in range(1, 5):
                    self.assertEqual(1, item["taskHtml"].count(f"{option})"), item["id"])

    def test_answers_match_the_independently_checked_reworked_tasks(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            actual = [item["answer"] for item in prototype["items"]]
            self.assertEqual(self.EXPECTED_ANSWERS[prototype["id"]], actual, prototype["id"])

    def test_prototype_7_1_has_no_equivalent_inequality_options(self):
        _, prototypes = self.load_prototypes()
        prototype = next(p for p in prototypes if p["id"] == "7.1")
        for item in prototype["items"]:
            statements = re.findall(r"<th>\d\) <span>\$(.*?)\$</span>[.;]</th>", item["taskHtml"])
            canonical = []
            for statement in statements:
                direct = re.fullmatch(r"a - (\d+) ([<>]) 0", statement)
                reverse = re.fullmatch(r"(\d+) - a ([<>]) 0", statement)
                self.assertTrue(direct or reverse, (item["id"], statement))
                if direct:
                    canonical.append((direct.group(2), int(direct.group(1))))
                else:
                    relation = "<" if reverse.group(2) == ">" else ">"
                    canonical.append((relation, int(reverse.group(1))))
            self.assertEqual(4, len(set(canonical)), item["id"])


if __name__ == "__main__":
    unittest.main()
