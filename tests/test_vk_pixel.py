import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PIXEL_CODE = '''<!-- Top.Mail.Ru counter -->
<script type="text/javascript">
var _tmr = window._tmr || (window._tmr = []);
_tmr.push({id: "3796192", type: "pageView", start: (new Date()).getTime()});
(function (d, w, id) {
  if (d.getElementById(id)) return;
  var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
  ts.src = "https://top-fwz1.mail.ru/js/code.js";
  var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
  if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
})(document, window, "tmr-code");
</script>
<noscript><div><img src="https://top-fwz1.mail.ru/counter?id=3796192;js=na" style="position:absolute;left:-9999px;" alt="Top.Mail.Ru" /></div></noscript>
<!-- /Top.Mail.Ru counter -->'''


class ElementByIdParser(HTMLParser):
    def __init__(self, wanted_id):
        super().__init__()
        self.wanted_id = wanted_id
        self.matches = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id") == self.wanted_id:
            self.matches.append((tag, attributes))


class VkPixelContractTests(unittest.TestCase):
    def source_pages(self):
        return [ROOT / "index.html", *sorted((ROOT / "study").rglob("*.html"))]

    def test_every_source_page_contains_the_unmodified_pixel_once(self):
        pages = self.source_pages()
        self.assertGreater(len(pages), 1)
        for page in pages:
            html = page.read_text(encoding="utf-8")
            self.assertEqual(1, html.count(PIXEL_CODE), page.relative_to(ROOT))
            self.assertEqual(1, html.count('"tmr-code"'), page.relative_to(ROOT))
            self.assertEqual(1, html.count('_tmr.push('), page.relative_to(ROOT))

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
