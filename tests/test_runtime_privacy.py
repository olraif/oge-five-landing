import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]


class ResourceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'img', 'iframe', 'audio', 'video', 'source') and attrs.get('src'):
            self.resources.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') in ('stylesheet', 'preload', 'modulepreload', 'preconnect', 'dns-prefetch'):
            self.resources.append(attrs.get('href', ''))


class RuntimePrivacyTests(unittest.TestCase):
    def test_pages_do_not_automatically_load_third_party_resources(self):
        problems = []
        for page in [ROOT / 'index.html', *(ROOT / 'study').rglob('*.html')]:
            parser = ResourceParser()
            parser.feed(page.read_text(encoding='utf-8'))
            for src in parser.resources:
                url = urlsplit(src)
                if url.scheme in ('data', 'blob'):
                    continue
                if url.netloc and url.hostname != 'oge-na-5.ru':
                    problems.append(f'{page.relative_to(ROOT)}: external resource {src}')
                elif not url.netloc:
                    target = ROOT / unquote(url.path).lstrip('/') if url.path.startswith('/') else page.parent / unquote(url.path)
                    if not target.is_file():
                        problems.append(f'{page.relative_to(ROOT)}: missing resource {src}')
        self.assertEqual(problems, [])


if __name__ == '__main__':
    unittest.main()
