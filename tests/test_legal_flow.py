import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STUDY = ROOT / "study"
LEGAL = STUDY / "legal"


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.inputs = []
        self.scripts = []
        self.headings = []
        self._heading = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self.links.append(attrs)
        elif tag == "input":
            self.inputs.append(attrs)
        elif tag == "script":
            self.scripts.append(attrs)
        elif tag in {"h1", "h2"}:
            self._heading = []

    def handle_data(self, data):
        if self._heading is not None:
            self._heading.append(data)

    def handle_endtag(self, tag):
        if tag in {"h1", "h2"} and self._heading is not None:
            self.headings.append("".join(self._heading).strip())
            self._heading = None


def parse(path):
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


class LegalFlowTests(unittest.TestCase):
    def test_public_legal_pages_are_complete_and_do_not_require_auth(self):
        expected = {
            "index.html": "Документы тренажёра",
            "privacy.html": "Политика в отношении обработки персональных данных",
            "consent.html": "Согласие на обработку персональных данных",
            "offer.html": "Публичная оферта о предоставлении доступа к онлайн-тренажёру",
            "terms.html": "Правила использования онлайн-тренажёра",
        }
        for filename, heading in expected.items():
            with self.subTest(filename=filename):
                path = LEGAL / filename
                self.assertTrue(path.exists())
                page = parse(path)
                self.assertIn(heading, page.headings)
                self.assertFalse(any("supabase" in item.get("src", "") for item in page.scripts))
                hrefs = {item.get("href") for item in page.links}
                self.assertIn("../login.html", hrefs)
                self.assertIn("mailto:olesy.raif@mail.ru", hrefs)

    def test_registration_requires_two_separate_unchecked_acceptances(self):
        page = parse(STUDY / "login.html")
        inputs = {item.get("name"): item for item in page.inputs}
        for name in ("personal-data-consent", "trainer-terms"):
            with self.subTest(name=name):
                self.assertIn(name, inputs)
                if name not in inputs:
                    continue
                self.assertEqual(inputs[name].get("type"), "checkbox")
                self.assertIn("required", inputs[name])
                self.assertNotIn("checked", inputs[name])
        html = (STUDY / "login.html").read_text(encoding="utf-8")
        self.assertRegex(html, r'href="\./legal/consent\.html"')
        self.assertRegex(html, r'href="\./legal/terms\.html"')
        self.assertRegex(html, r'href="\./legal/privacy\.html"')
        self.assertRegex(html, r'href="\./legal/offer\.html"')
        self.assertIn("consent_version: '1.0'", html)
        self.assertIn("terms_version: '1.0'", html)

    def test_legal_footer_is_loaded_by_login_cabinet_admin_and_every_trainer_page(self):
        pages = [STUDY / "login.html", STUDY / "admin.html", STUDY / "index.html", STUDY / "informatics" / "index.html"]
        pages += sorted((STUDY / "math" / "part-one").glob("*.html"))
        for path in pages:
            with self.subTest(page=path.relative_to(ROOT).as_posix()):
                page = parse(path)
                scripts = [item for item in page.scripts if "data-legal-footer" in item]
                self.assertEqual(len(scripts), 1)

    def test_purchase_and_activation_show_applicable_documents_and_actual_terms(self):
        for relative in ("index.html", "informatics/index.html"):
            with self.subTest(page=relative):
                html = (STUDY / relative).read_text(encoding="utf-8")
                self.assertIn("Условия покупки — в публичной оферте", html)
                self.assertIn("Промокод активируется один раз", html)
                self.assertIn("24 месяца", html)
                self.assertIn("несовершеннолетнего пользователя", html)
                self.assertRegex(html, r'href="[^\"]*legal/terms\.html"')
                self.assertRegex(html, r'href="[^\"]*legal/offer\.html"')

    def test_schema_records_acceptances_with_server_time(self):
        schema = (ROOT / "supabase" / "schema.sql").read_text(encoding="utf-8")
        for column in ("consent_accepted_at", "consent_version", "terms_accepted_at", "terms_version"):
            self.assertIn(column, schema)
        self.assertRegex(schema, r"(?is)handle_new_user.*consent_accepted_at.*now\(\)")
        self.assertRegex(schema, r"(?is)handle_new_user.*raw_user_meta_data.*consent_version")

    def test_yandex_metrika_is_not_loaded_by_published_html(self):
        offenders = []
        for path in ROOT.rglob("*.html"):
            html = path.read_text(encoding="utf-8")
            if re.search(r"mc\.yandex\.ru|METRIKA_COUNTER_ID|webvisor\s*:", html, re.I):
                offenders.append(path.relative_to(ROOT).as_posix())
        self.assertEqual(offenders, [])


if __name__ == "__main__":
    unittest.main()
