import unittest
from pathlib import Path


ROOT = Path(__file__).absolute().parents[1]


class SupportVideoContractTests(unittest.TestCase):
    def test_support_section_contains_responsive_student_cabinet_video(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        video = ROOT / "assets" / "videos" / "student-cabinet-2.mp4"

        self.assertTrue(video.is_file())
        self.assertIn('class="support-video-wrap"', html)
        self.assertIn('class="support-video"', html)
        self.assertIn('src="../assets/videos/student-cabinet-2.mp4"', html)
        self.assertIn("controls", html)
        self.assertIn("playsinline", html)
        self.assertIn("preload=\"metadata\"", html)
        self.assertIn(".support-video-wrap", css)
        self.assertIn(".support-video", css)
        self.assertIn("object-fit:contain", css)

    def test_student_cabinet_has_no_extra_site_or_footer_labels(self):
        html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")

        self.assertNotIn("Основной сайт", html)
        self.assertNotIn("Олеся Сайфуллина", html)
        self.assertNotIn("Индивидуальная подготовка к ОГЭ", html)


if __name__ == "__main__":
    unittest.main()
