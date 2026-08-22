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
        self.route_questions = []
        self.route_image_alt = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = set(attributes.get("class", "").split())
        if tag == "a":
            self._link = {"href": attributes.get("href", ""), "text": ""}
        if tag == "h2" and "practical-prototype-title" in classes:
            self._prototype = ""
        if tag == "label" and "route-question" in classes:
            self.route_questions.append(attributes.get("data-question-number"))
        if tag == "img" and "route-map" in classes:
            self.route_image_alt = attributes.get("alt")

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

    def test_routes_prototype_renders_one_shared_map_and_five_answer_fields(self):
        page = parse_page(PART_ONE / "task1-5.html")
        self.assertEqual(page.route_questions, ["1", "2", "3", "4", "5"])
        self.assertEqual(page.route_image_alt, "План маршрутов между населёнными пунктами")
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertIn('class="route-prototype-tabs"', html)
        self.assertIn('class="route-analog-tabs"', html)
        self.assertIn('aria-live="polite"', html)

    def test_student_progress_reads_routes_results(self):
        studio = (PART_ONE.parents[1] / "index.html").read_text(encoding="utf-8")
        self.assertEqual(studio.count('<div class="bar bar--practical"'), 5)
        self.assertIn("renderTask1to5Progress", studio)
        self.assertIn("trainer_progress?.math?.task1to5", studio)
        self.assertGreaterEqual(studio.count("resetTask1to5Progress();"), 2)
    def test_combined_page_does_not_repeat_explanatory_heading_or_note(self):
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertNotIn("Практические задачи", html)
        self.assertNotIn("Выберите прототип", html)
        self.assertNotIn("Ответы на пять вопросов будут учитываться отдельно", html)


if __name__ == "__main__":
    unittest.main()
