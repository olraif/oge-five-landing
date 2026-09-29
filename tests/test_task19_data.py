import json
import re
import unittest
from collections import Counter
from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
EXPECTED_TOTALS = [88, 63]
TRUE_IDS = {f"T{index:02}" for index in range(1, 25)}
FALSE_IDS = {f"F{index:02}" for index in range(1, 26)}


class Task19DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task19-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def test_full_dataset_has_2_prototypes_and_151_stable_public_ids(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(2, len(files))
        self.assertEqual(["19.1", "19.2"], [prototype["id"] for prototype in prototypes])
        self.assertEqual(EXPECTED_TOTALS, [len(prototype["items"]) for prototype in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(151, len(items))
        self.assertEqual(
            [f"19.{kind}.{index}" for kind, count in enumerate(EXPECTED_TOTALS, 1) for index in range(1, count + 1)],
            [item["id"] for item in items],
        )

    def test_every_item_is_authored_without_import_provenance(self):
        _, prototypes = self.load_prototypes()
        for prototype in prototypes:
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertEqual({"id", "taskHtml", "answer", "format", "authored"}, set(item), item["id"])
                self.assertNotIn("�", item["taskHtml"], item["id"])

    def test_each_answer_matches_the_independently_classified_statements(self):
        _, prototypes = self.load_prototypes()
        for kind, prototype in enumerate(prototypes, 1):
            for item in prototype["items"]:
                soup = BeautifulSoup(item["taskHtml"], "html.parser")
                statements = soup.select("ol > li[data-statement-id]")
                self.assertEqual(3, len(statements), item["id"])
                statement_ids = [statement["data-statement-id"] for statement in statements]
                self.assertEqual(3, len(set(statement_ids)), item["id"])
                self.assertTrue(set(statement_ids) <= TRUE_IDS | FALSE_IDS, item["id"])
                truth_mask = [statement_id in TRUE_IDS for statement_id in statement_ids]
                self.assertEqual(1 if kind == 1 else 2, sum(truth_mask), item["id"])
                self.assertEqual(statement_ids, item["authored"]["statement_ids"], item["id"])
                self.assertEqual(truth_mask, item["authored"]["truth_mask"], item["id"])
                expected = "".join(str(index) for index, is_true in enumerate(truth_mask, 1) if is_true)
                self.assertEqual(expected, str(item["answer"]), item["id"])
                self.assertEqual("number" if kind == 1 else "unordered_digits", item["format"], item["id"])

    def test_all_conditions_are_unique_and_answer_positions_are_balanced(self):
        _, prototypes = self.load_prototypes()
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(151, len({item["taskHtml"] for item in items}))
        for prototype in prototypes:
            positions = Counter(str(item["answer"]) if prototype["id"] == "19.1" else str(6 - sum(map(int, str(item["answer"])))) for item in prototype["items"])
            self.assertLessEqual(max(positions.values()) - min(positions.values()), 1)

    def test_statement_ids_always_keep_one_text_and_the_whole_bank_is_used(self):
        _, prototypes = self.load_prototypes()
        texts_by_id = {}
        used_ids = set()
        for prototype in prototypes:
            for item in prototype["items"]:
                for statement in BeautifulSoup(item["taskHtml"], "html.parser").select("ol > li[data-statement-id]"):
                    statement_id = statement["data-statement-id"]
                    text = " ".join(statement.get_text(" ", strip=True).split())
                    self.assertTrue(text, item["id"])
                    if statement_id in texts_by_id:
                        self.assertEqual(texts_by_id[statement_id], text, statement_id)
                    texts_by_id[statement_id] = text
                    used_ids.add(statement_id)
        self.assertEqual(TRUE_IDS | FALSE_IDS, used_ids)


if __name__ == "__main__":
    unittest.main()