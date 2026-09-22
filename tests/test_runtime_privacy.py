import unittest
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_EXTERNAL_RESOURCES = {
    'https://top-fwz1.mail.ru/counter?id=3796192;js=na',
}


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
    def test_pages_do_not_automatically_load_unapproved_third_party_resources(self):
        problems = []
        for page in [ROOT / 'index.html', *(ROOT / 'study').rglob('*.html')]:
            parser = ResourceParser()
            parser.feed(page.read_text(encoding='utf-8'))
            for src in parser.resources:
                url = urlsplit(src)
                if url.scheme in ('data', 'blob'):
                    continue
                if src in ALLOWED_EXTERNAL_RESOURCES:
                    continue
                if url.netloc and url.hostname != 'oge-na-5.ru':
                    problems.append(f'{page.relative_to(ROOT)}: external resource {src}')
                elif not url.netloc:
                    target = ROOT / unquote(url.path).lstrip('/') if url.path.startswith('/') else page.parent / unquote(url.path)
                    if not target.is_file():
                        problems.append(f'{page.relative_to(ROOT)}: missing resource {src}')
        self.assertEqual(problems, [])

    def test_local_mathjax_fonts_are_in_the_deployable_repository(self):
        bundle = ROOT / 'study' / 'vendor' / 'mathjax-3.2.2' / 'es5' / 'tex-mml-chtml.js'
        font_names = set(re.findall(r'MathJax_[A-Za-z0-9-]+\.woff', bundle.read_text(encoding='utf-8')))
        self.assertTrue(font_names, 'MathJax bundle must declare its font files')

        font_root = Path('study/vendor/mathjax-3.2.2/es5/output/chtml/fonts/woff-v2')
        tracked = set(subprocess.check_output(
            ['git', 'ls-files', '--', font_root.as_posix()],
            cwd=ROOT,
            text=True,
            encoding='utf-8',
        ).splitlines())
        missing = sorted(
            (font_root / name).as_posix()
            for name in font_names
            if (font_root / name).as_posix() not in tracked
        )
        self.assertEqual(missing, [], 'MathJax fonts missing from deployment: ' + ', '.join(missing))


if __name__ == '__main__':
    unittest.main()
