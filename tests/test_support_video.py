import unittest
from pathlib import Path


ROOT = Path(__file__).absolute().parents[1]


class SupportContractTests(unittest.TestCase):
    def test_support_section_uses_faq_without_video(self):
        pages = [
            (ROOT / "study" / "index.html").read_text(encoding="utf-8"),
            (ROOT / "study" / "informatics" / "index.html").read_text(encoding="utf-8"),
        ]
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")

        for html in pages:
            self.assertNotIn('class="support-video-wrap"', html)
            self.assertNotIn('class="support-video"', html)
            self.assertGreaterEqual(html.count("<details"), 11)
            self.assertIn("Как часто обновляются задания?", html)
            self.assertIn("Как купить доступ к тренажёру?", html)
            self.assertIn("Где посмотреть свой прогресс?", html)
            self.assertIn("Можно ли приобрести доступ для группы или класса?", html)
            self.assertIn("возможная скидка рассматриваются индивидуально", html)
            self.assertIn('href="https://vk.com/olraif"', html)
            self.assertIn('href="https://t.me/olraif"', html)

        self.assertIn(".support-faq", css)
        self.assertIn(".support-question", css)

    def test_student_cabinet_has_no_extra_site_or_footer_labels(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")

        self.assertNotIn("Основной сайт", html)
        self.assertNotIn("Олеся Сайфуллина", html)
        self.assertNotIn("Индивидуальная подготовка к ОГЭ", html)


if __name__ == "__main__":
    unittest.main()
