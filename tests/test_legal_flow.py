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
        self.assertNotRegex(html, r'href="\./legal/privacy\.html"')
        self.assertNotRegex(html, r'href="\./legal/offer\.html"')
        self.assertIn("consent_version: '1.1'", html)
        self.assertIn("terms_version: '1.1'", html)

    def test_registration_failure_does_not_blame_the_password_for_server_errors(self):
        html = (STUDY / "login.html").read_text(encoding="utf-8")
        self.assertIn("Регистрация не выполнена. Попробуйте ещё раз позднее.", html)
        self.assertNotIn("Не удалось зарегистрироваться. Проверьте email и пароль.", html)

    def test_legal_footer_is_loaded_by_login_cabinet_admin_and_every_trainer_page(self):
        pages = [STUDY / "login.html", STUDY / "admin.html", STUDY / "index.html", STUDY / "informatics" / "index.html"]
        pages += sorted((STUDY / "math" / "part-one").glob("*.html"))
        for path in pages:
            with self.subTest(page=path.relative_to(ROOT).as_posix()):
                page = parse(path)
                scripts = [item for item in page.scripts if "data-legal-footer" in item]
                self.assertEqual(len(scripts), 1)

    def test_purchase_and_activation_keep_legal_copy_in_documents(self):
        for relative in ("index.html", "informatics/index.html"):
            with self.subTest(page=relative):
                html = (STUDY / relative).read_text(encoding="utf-8")
                self.assertNotIn('class="course-legal-link"', html)
                self.assertNotIn('class="access-legal-note"', html)
                self.assertIn('data-code-form', html)
                self.assertIn('data-legal-footer', html)

    def test_footer_links_directly_to_policy_and_offer_without_catalog(self):
        footer = (LEGAL / "legal-footer.js").read_text(encoding="utf-8")
        self.assertIn("legal/privacy.html", footer)
        self.assertIn("legal/offer.html", footer)
        self.assertNotIn("legal/index.html", footer)
        self.assertNotIn(">Документы<", footer)
        index = (LEGAL / "index.html").read_text(encoding="utf-8")
        self.assertIn('http-equiv="refresh" content="0; url=./privacy.html"', index)
        self.assertNotIn("legal-index-grid", index)

    def test_schema_records_acceptances_with_server_time(self):
        schema = (ROOT / "supabase" / "schema.sql").read_text(encoding="utf-8")
        for column in ("consent_accepted_at", "consent_version", "terms_accepted_at", "terms_version"):
            self.assertIn(column, schema)
        self.assertRegex(schema, r"(?is)handle_new_user.*consent_accepted_at.*now\(\)")
        self.assertRegex(schema, r"(?is)handle_new_user.*raw_user_meta_data.*consent_version")

    def test_acceptance_evidence_cannot_be_changed_through_the_student_profile(self):
        migration = (ROOT / "supabase" / "migrations" / "20260905_legal_acceptances.sql").read_text(encoding="utf-8")
        self.assertRegex(migration, r"(?is)revoke\s+insert\s*,\s*delete\s*,\s*update\s+on\s+public\.profiles\s+from\s+authenticated")
        self.assertRegex(migration, r"(?is)grant\s+update\s*\(\s*display_name\s*,\s*subject\s*,\s*avatar\s*\)\s+on\s+public\.profiles\s+to\s+authenticated")

    def test_coupon_activation_uses_the_enrollment_primary_key_constraint(self):
        schema = (ROOT / "supabase" / "schema.sql").read_text(encoding="utf-8")
        self.assertIn("on conflict on constraint enrollments_pkey do nothing", schema)
        self.assertNotIn("on conflict (user_id, course_id) do nothing", schema)

    def test_yandex_metrika_is_not_loaded_by_published_html(self):
        offenders = []
        for path in ROOT.rglob("*.html"):
            html = path.read_text(encoding="utf-8")
            if re.search(r"mc\.yandex\.ru|METRIKA_COUNTER_ID|webvisor\s*:", html, re.I):
                offenders.append(path.relative_to(ROOT).as_posix())
        self.assertEqual(offenders, [])


if __name__ == "__main__":
    unittest.main()
