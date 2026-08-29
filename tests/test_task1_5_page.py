import unittest
import re
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

    def test_tires_are_enabled_and_loaded_as_a_complete_trainer_type(self):
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertIn('src="task1-5-tires-data.js"', html)
        self.assertIn('data-practical-type="tires"', html)
        self.assertNotIn('data-practical-type="tires" disabled', html)
        script = (PART_ONE / "task1-5.js").read_text(encoding="utf-8")
        self.assertIn("model.PRACTICAL_TYPES", script)
        self.assertIn("tires-[12]", script)

    def test_plots_are_enabled_and_loaded_as_a_complete_trainer_type(self):
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertIn('src="task1-5-plots-data.js"', html)
        self.assertIn('data-practical-type="plots"', html)
        self.assertNotIn('data-practical-type="plots" disabled', html)
        model = (PART_ONE / "task1-5-model.js").read_text(encoding="utf-8")
        self.assertIn("OgeTaskOneToFivePlots", model)
        script = (PART_ONE / "task1-5.js").read_text(encoding="utf-8")
        self.assertIn("homesteads-", script)

    def test_every_plot_drawing_has_a_local_asset(self):
        data_path = PART_ONE / "task1-5-plots-data.js"
        self.assertTrue(data_path.is_file())
        data = data_path.read_text(encoding="utf-8")
        drawings = set(re.findall(r"homesteads-\d+\.svg", data))
        self.assertGreaterEqual(len(drawings), 1)
        for drawing in drawings:
            self.assertTrue((PART_ONE / "assets" / "task1-5" / drawing).is_file(), drawing)

    def test_sheets_are_enabled_and_loaded_as_a_complete_trainer_type(self):
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertIn('src="task1-5-sheets-data.js"', html)
        self.assertIn('data-practical-type="sheets"', html)
        self.assertNotIn('data-practical-type="sheets" disabled', html)
        model = (PART_ONE / "task1-5-model.js").read_text(encoding="utf-8")
        self.assertIn("OgeTaskOneToFiveSheets", model)
        script = (PART_ONE / "task1-5.js").read_text(encoding="utf-8")
        self.assertIn("papers-", script)

    def test_every_sheet_drawing_has_a_local_asset(self):
        data_path = PART_ONE / "task1-5-sheets-data.js"
        self.assertTrue(data_path.is_file())
        data = data_path.read_text(encoding="utf-8")
        drawings = set(re.findall(r"papers-\d+\.svg", data))
        self.assertGreaterEqual(len(drawings), 1)
        for drawing in drawings:
            self.assertTrue((PART_ONE / "assets" / "task1-5" / drawing).is_file(), drawing)

    def test_stoves_are_enabled_and_loaded_as_a_complete_trainer_type(self):
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertIn('src="task1-5-stoves-data.js"', html)
        self.assertIn('data-practical-type="stoves"', html)
        self.assertNotIn('data-practical-type="stoves" disabled', html)
        model = (PART_ONE / "task1-5-model.js").read_text(encoding="utf-8")
        self.assertIn("OgeTaskOneToFiveStoves", model)
        script = (PART_ONE / "task1-5.js").read_text(encoding="utf-8")
        self.assertIn("stoves-", script)

    def test_every_stove_drawing_has_a_local_asset(self):
        data_path = PART_ONE / "task1-5-stoves-data.js"
        self.assertTrue(data_path.is_file())
        data = data_path.read_text(encoding="utf-8")
        drawings = set(re.findall(r"stoves-\d+\.svg", data))
        self.assertEqual(drawings, {"stoves-1.svg", "stoves-2.svg", "stoves-3.svg"})
        for drawing in drawings:
            self.assertTrue((PART_ONE / "assets" / "task1-5" / drawing).is_file(), drawing)

    def test_apartments_are_enabled_and_loaded_as_a_complete_trainer_type(self):
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertIn('src="task1-5-apartments-data.js"', html)
        self.assertIn('data-practical-type="apartments"', html)
        self.assertNotIn('data-practical-type="apartments" disabled', html)
        model = (PART_ONE / "task1-5-model.js").read_text(encoding="utf-8")
        self.assertIn("OgeTaskOneToFiveApartments", model)
        script = (PART_ONE / "task1-5.js").read_text(encoding="utf-8")
        self.assertIn("flats-", script)

    def test_every_apartment_drawing_has_a_local_asset(self):
        data_path = PART_ONE / "task1-5-apartments-data.js"
        self.assertTrue(data_path.is_file())
        data = data_path.read_text(encoding="utf-8")
        drawings = set(re.findall(r"flats-\d+\.svg", data))
        self.assertEqual(drawings, {"flats-1.svg"})
        for drawing in drawings:
            self.assertTrue((PART_ONE / "assets" / "task1-5" / drawing).is_file(), drawing)

    def test_tariffs_are_enabled_and_loaded_without_empty_source_card(self):
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertIn('src="task1-5-tariffs-data.js"', html)
        self.assertIn('data-practical-type="tariffs"', html)
        self.assertNotIn('data-practical-type="tariffs" disabled', html)
        model = (PART_ONE / "task1-5-model.js").read_text(encoding="utf-8")
        self.assertIn("OgeTaskOneToFiveTariffs", model)
        script = (PART_ONE / "task1-5.js").read_text(encoding="utf-8")
        self.assertIn("tariffs-", script)

    def test_every_tariff_drawing_has_a_local_asset(self):
        data_path = PART_ONE / "task1-5-tariffs-data.js"
        self.assertTrue(data_path.is_file())
        data = data_path.read_text(encoding="utf-8")
        drawings = set(re.findall(r"tariffs-\d+\.svg", data))
        self.assertEqual(drawings, {"tariffs-1.svg"})
        for drawing in drawings:
            self.assertTrue((PART_ONE / "assets" / "task1-5" / drawing).is_file(), drawing)

    def test_practical_progress_uses_green_yellow_and_pink_only(self):
        studio = (PART_ONE.parents[1] / "index.html").read_text(encoding="utf-8")
        css = (PART_ONE.parents[1] / "study.css").read_text(encoding="utf-8")
        self.assertIn("total.answered - total.correct", studio)
        self.assertIn("#69d18a 0 var(--ok)", css)
        self.assertIn("#f7d77c var(--ok) calc(var(--ok) + var(--work))", css)
        self.assertNotIn("#4b74ff var(--ok) calc(var(--ok) + var(--work))", css)
    def test_tire_math_markup_is_cleaned_for_students(self):
        script = (PART_ONE / "task1-5.js").read_text(encoding="utf-8")
        self.assertIn(".replace(/\\\\cdot/g, '&middot;')", script)
        self.assertIn(".replace(/\\\\%/g, '%')", script)
        self.assertIn(".replace(/\\\\\\s/g, ' ')", script)
        self.assertIn(".replace(/\\\\text\\{([^{}]*)\\}/g, '$1')", script)
        self.assertIn(".replace(/\\\\times/g, '&times;')", script)
        self.assertIn(".replace(/\\^\\{?(\\d+)\\}?/g, '<sup>$1</sup>')", script)
    def test_student_progress_reads_routes_results(self):
        studio = (PART_ONE.parents[1] / "index.html").read_text(encoding="utf-8")
        self.assertEqual(studio.count('<div class="bar bar--practical"'), 5)
        self.assertIn("renderTask1to5Progress", studio)
        self.assertIn("trainer_progress?.math?.task1to5", studio)
        self.assertGreaterEqual(studio.count("resetTask1to5Progress();"), 2)
    def test_progress_uses_full_fipi_denominator_for_each_subtask(self):
        studio = (PART_ONE.parents[1] / "index.html").read_text(encoding="utf-8")
        self.assertIn("const practicalTaskTotal = 76", studio)
        self.assertIn("total: practicalTaskTotal", studio)
        self.assertNotIn("totals[number].total += Number(value.total)", studio)

    def test_every_route_drawing_has_a_local_asset(self):
        data = (PART_ONE / "task1-5-routes-data.js").read_text(encoding="utf-8")
        drawings = set(re.findall(r"trips-\d+\.svg", data))
        self.assertEqual(drawings, {f"trips-{number}.svg" for number in range(1, 12)})
        for drawing in drawings:
            self.assertTrue((PART_ONE / "assets" / "task1-5" / drawing).is_file(), drawing)

    def test_image_sanitizer_accepts_all_route_drawings(self):
        script = (PART_ONE / "task1-5.js").read_text(encoding="utf-8")
        self.assertIn("trips-(?:[1-9]|1[01])", script)
    def test_combined_page_does_not_repeat_explanatory_heading_or_note(self):
        html = (PART_ONE / "task1-5.html").read_text(encoding="utf-8")
        self.assertNotIn("Практические задачи", html)
        self.assertNotIn("Выберите прототип", html)
        self.assertNotIn("Ответы на пять вопросов будут учитываться отдельно", html)


if __name__ == "__main__":
    unittest.main()
