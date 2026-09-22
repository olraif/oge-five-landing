import json
import re
import unittest
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"
COUNTS = [8, 4, 20, 20, 18, 20, 20, 20, 22, 23, 7]


class Task12DataContractTests(unittest.TestCase):
    def load_prototypes(self):
        files = sorted(DATA_DIR.glob("task12-data-*.js"))
        prototypes = []
        for path in files:
            text = path.read_text(encoding="utf-8-sig")
            match = re.search(r"\.push\((\{.*\})\);\s*$", text, re.DOTALL)
            self.assertIsNotNone(match, path.name)
            prototypes.append(json.loads(match.group(1)))
        return files, prototypes

    def authored_values(self, item):
        opening = re.search(r'<span class="task12-authored"([^>]*)>', item["taskHtml"])
        self.assertIsNotNone(opening, item["id"])
        attrs = dict(re.findall(r'data-([a-z0-9-]+)="([^"]+)"', opening.group(1)))
        return attrs

    def test_full_dataset_has_11_prototypes_and_182_stable_public_ids(self):
        files, prototypes = self.load_prototypes()
        self.assertEqual(11, len(files))
        self.assertEqual([f"12.{index}" for index in range(1, 12)], [p["id"] for p in prototypes])
        self.assertEqual(COUNTS, [len(p["items"]) for p in prototypes])
        items = [item for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(182, len(items))
        self.assertEqual(182, len({item["id"] for item in items}))
        self.assertEqual(
            [f"12.{kind}.{index}" for kind, count in enumerate(COUNTS, 1) for index in range(1, count + 1)],
            [item["id"] for item in items],
        )

    def test_every_item_is_authored_self_contained_and_valid_utf8(self):
        _, prototypes = self.load_prototypes()
        broken = ("Р вЂє", "Р С‘", "Р В°", "РЎвЂ№", "РЎРЏ", "пїЅ", "�")
        for prototype in prototypes:
            self.assertNotIn("source", prototype)
            self.assertTrue(prototype["title"].strip())
            for item in prototype["items"]:
                self.assertNotIn("internalId", item, item["id"])
                self.assertNotIn("analogNumber", item, item["id"])
                self.assertNotIn("answerHtml", item, item["id"])
                self.assertFalse(any(marker in item["taskHtml"] for marker in broken), item["id"])
                self.assertRegex(str(item["answer"]), r"^-?\d+(?:\.\d+)?$", item["id"])

    def test_every_answer_is_recomputed_from_the_formula_values(self):
        _, prototypes = self.load_prototypes()
        for kind, prototype in enumerate(prototypes, 1):
            for item in prototype["items"]:
                attrs = self.authored_values(item)
                self.assertEqual(str(kind), attrs.get("formula-type"), item["id"])
                value = {name: Decimal(raw) for name, raw in attrs.items() if name != "formula-type"}
                if kind in (1, 2):
                    expected = value["base"] + value["unit"] * value["count"]
                elif kind == 3:
                    expected = (value["fahrenheit"] - Decimal(32)) * Decimal(5) / Decimal(9)
                elif kind == 4:
                    expected = Decimal("1.8") * value["celsius"] + Decimal(32)
                elif kind == 5:
                    expected = value["density"] * value["gravity"] * value["volume"]
                elif kind == 6:
                    expected = (Decimal(2) * value["energy"] / value["mass"]).sqrt()
                elif kind == 7:
                    expected = value["energy"] / (value["gravity"] * value["height"])
                elif kind == 8:
                    expected = Decimal(2) * value["area"] / (value["diagonal"] * value["sine"])
                elif kind == 9:
                    expected = value["power"] / (value["current"] ** 2)
                elif kind == 10:
                    expected = value["acceleration"] / (value["omega"] ** 2)
                else:
                    expected = value["capacitance"] * (value["voltage"] ** 2) / Decimal(2)
                self.assertEqual(expected, Decimal(str(item["answer"])), item["id"])

    def test_first_item_of_each_type_has_hand_checked_answer(self):
        _, prototypes = self.load_prototypes()
        self.assertEqual(
            ["7900", "3060", "-40", "-31", "196", "5", "6", "4", "3", "4", "0.0032"],
            [str(prototype["items"][0]["answer"]) for prototype in prototypes],
        )

    def test_authored_conditions_are_unique(self):
        _, prototypes = self.load_prototypes()
        conditions = [item["taskHtml"] for prototype in prototypes for item in prototype["items"]]
        self.assertEqual(len(conditions), len(set(conditions)))


if __name__ == "__main__":
    unittest.main()
