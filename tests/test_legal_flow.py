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
        self.stylesheets = []
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
        elif tag == "link" and "stylesheet" in attrs.get("rel", "").split():
            self.stylesheets.append(attrs)
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

    def test_login_explains_confirmation_and_supports_password_recovery(self):
        html = (STUDY / "login.html").read_text(encoding="utf-8")
        self.assertIn('id="forgot-password"', html)
        self.assertIn('id="resend-confirmation"', html)
        self.assertIn("email_not_confirmed", html)
        self.assertIn("resetPasswordForEmail", html)
        self.assertIn("client.auth.resend", html)
        self.assertIn("./reset-password.html", html)

        reset = (STUDY / "reset-password.html").read_text(encoding="utf-8")
        self.assertIn("PASSWORD_RECOVERY", reset)
        self.assertIn("client.auth.updateUser({ password })", reset)
        self.assertIn('data-legal-footer', reset)

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

    def test_purchase_requires_offer_acceptance_before_contact(self):
        cases = (
            ("index.html", 3, "./legal/offer.html", "study.css?v=20260908-2", "./purchase-offer.js?v=20260909-1"),
            ("informatics/index.html", 2, "../legal/offer.html", "../study.css?v=20260908-2", "../purchase-offer.js?v=20260909-1"),
        )
        for relative, purchase_count, offer_url, stylesheet_url, script_url in cases:
            with self.subTest(page=relative):
                page = parse(STUDY / relative)
                purchase_links = [item for item in page.links if "data-purchase-open" in item]
                self.assertEqual(len(purchase_links), purchase_count)
                self.assertTrue(all(item.get("href") == "#purchase-offer" for item in purchase_links))

                acceptance = [item for item in page.inputs if "data-purchase-accept" in item]
                self.assertEqual(len(acceptance), 1)
                self.assertEqual(acceptance[0].get("type"), "checkbox")
                self.assertNotIn("checked", acceptance[0])

                offer_links = [item for item in page.links if "data-purchase-offer-link" in item]
                self.assertEqual([item.get("href") for item in offer_links], [offer_url])
                contact_links = [item for item in page.links if "data-purchase-contact" in item]
                self.assertEqual({item.get("href") for item in contact_links}, {"https://vk.com/olraif", "https://t.me/olraif"})
                self.assertTrue(all(item.get("aria-disabled") == "true" for item in contact_links))
                self.assertTrue(all(item.get("tabindex") == "-1" for item in contact_links))
                html = (STUDY / relative).read_text(encoding="utf-8")
                self.assertNotIn("data-purchase-selection", html)
                self.assertTrue(any(item.get("href") == stylesheet_url for item in page.stylesheets))
                self.assertTrue(any(item.get("src") == script_url for item in page.scripts))

    def test_purchase_dialog_uses_the_site_controls_instead_of_native_dialog_styling(self):
        css = (STUDY / "study.css").read_text(encoding="utf-8")
        self.assertRegex(css, r"\.purchase-offer-dialog\{[^}]*border:1px solid #d7deea")
        self.assertRegex(css, r"\.purchase-offer-close\{[^}]*position:absolute;[^}]*right:18px")
        self.assertRegex(css, r"\.purchase-offer-actions a\{[^}]*display:flex;[^}]*background:var\(--blue\)")

    def test_tariff_prices_are_separate_from_buttons_that_sell_access(self):
        cases = {
            "index.html": ("4 900 ₽", "6 900 ₽"),
            "informatics/index.html": ("4 900 ₽", "6 900 ₽"),
        }
        for relative, prices in cases.items():
            with self.subTest(page=relative):
                html = (STUDY / relative).read_text(encoding="utf-8")
                purchase_labels = re.findall(r'<a[^>]*data-purchase-open[^>]*>(.*?)</a>', html, re.S)
                self.assertTrue(purchase_labels)
                self.assertTrue(all("Приобрести доступ" in label for label in purchase_labels))
                self.assertTrue(all("₽" not in label for label in purchase_labels))
                self.assertIn("Базовая стоимость доступа", html)
                for price in prices:
                    self.assertIn(price, html)

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

    def test_only_an_admin_can_list_and_delete_accounts(self):
        migration = (ROOT / "supabase" / "migrations" / "20260906_account_management.sql").read_text(encoding="utf-8")
        self.assertIn("admin_list_accounts", migration)
        self.assertIn("admin_delete_account", migration)
        self.assertRegex(migration, r"(?is)auth\.uid\(\).*role\s*=\s*'admin'")
        self.assertRegex(migration, r"(?is)p_user_id\s*=\s*auth\.uid\(\)")
        self.assertRegex(migration, r"(?is)delete\s+from\s+auth\.users")
        self.assertRegex(migration, r"(?is)revoke\s+all\s+on\s+function.*from\s+public")
        self.assertRegex(migration, r"(?is)grant\s+execute\s+on\s+function.*to\s+authenticated")

        admin = (STUDY / "admin.html").read_text(encoding="utf-8")
        self.assertIn("admin_list_accounts", admin)
        self.assertIn("admin_delete_account", admin)
        self.assertNotIn("service_role", admin)

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
