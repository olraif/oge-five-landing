import unittest
from html.parser import HTMLParser
from pathlib import Path


PART_ONE = Path(__file__).resolve().parents[1] / "study" / "math" / "part-one"
PROTOTYPES = [
    "Маршруты",
    "Шины",
    "Участки",
    "Листы",
    "Печки",
    "Квартиры",
    "Тарифы",
]


class LinkAndPrototypeParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.prototype_titles = []
        self._link = None
        self._prototype = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = set(attributes.get("class", "").split())
        if tag == "a":
            self._link = {"href": attributes.get("href", ""), "text": ""}
        if tag == "h2" and "practical-prototype-title" in classes:
            self._prototype = ""

    def handle_data(self, data):
        if self._link is not None:
            self._link["text"] += data
        if self._prototype is not None:
            self._prototype += data

    def handle_endtag(self, tag):
        if tag == "a" and self._link is not None:
            self.links.append({**self._link, "text": self._link["text"].strip()})
            self._link = None
        if tag == "h2" and self._prototype is not None:
            self.prototype_titles.append(self._prototype.strip())
            self._prototype = None


def parse_page(path):
    parser = LinkAndPrototypeParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


class TaskOneToFivePageTests(unittest.TestCase):
    def test_sidebar_uses_one_combined_link_for_tasks_one_to_five(self):
        for page_name in ["index.html", "task7.html", "task19.html"]:
            with self.subTest(page=page_name):
                page = parse_page(PART_ONE / page_name)
                combined = [link for link in page.links if link["text"] == "1–5"]
                individual = [link for link in page.links if link["text"] in {"1", "2", "3", "4", "5"}]
                self.assertIn({"href": "task1-5.html#trainer", "text": "1–5"}, combined)
                self.assertEqual(individual, [])

    def test_combined_page_lists_prototypes_from_the_collection(self):
        page = parse_page(PART_ONE / "task1-5.html")
        self.assertEqual(page.prototype_titles, PROTOTYPES)


if __name__ == "__main__":
    unittest.main()
