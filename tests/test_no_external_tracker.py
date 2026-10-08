import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ElementByIdParser(HTMLParser):
    def __init__(self, wanted_id):
        super().__init__()
        self.wanted_id = wanted_id
        self.matches = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id") == self.wanted_id:
            self.matches.append((tag, attributes))


class NoExternalTrackerTests(unittest.TestCase):
    def source_pages(self):
        return [ROOT / "index.html", *sorted((ROOT / "study").rglob("*.html"))]

    def test_no_page_contains_top_mail_counter(self):
        pages = self.source_pages()
        self.assertGreater(len(pages), 1)
        markers = ("Top.Mail.Ru", "top-fwz1.mail.ru", "_tmr.push(", '"tmr-code"', "3796192")
        for page in pages:
            with self.subTest(page=page.relative_to(ROOT)):
                html = page.read_text(encoding="utf-8")
                for marker in markers:
                    self.assertNotIn(marker, html)

    def test_part_one_purchase_button_has_the_only_buy_part_one_id(self):
        all_html = "\n".join(page.read_text(encoding="utf-8") for page in self.source_pages())
        self.assertEqual(1, all_html.count('id="buy-part-one"'))
        parser = ElementByIdParser("buy-part-one")
        parser.feed((ROOT / "study" / "index.html").read_text(encoding="utf-8"))
        self.assertEqual(1, len(parser.matches))
        tag, attrs = parser.matches[0]
        self.assertEqual("a", tag)
        self.assertEqual("#purchase-offer", attrs.get("href"))
        self.assertIn("data-purchase-open", attrs)


if __name__ == "__main__":
    unittest.main()
