import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class TrainerEntryContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.study_html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        cls.informatics_html = (ROOT / "study" / "informatics" / "index.html").read_text(encoding="utf-8")
        cls.part_one_html = (ROOT / "study" / "math" / "part-one" / "index.html").read_text(encoding="utf-8")
        cls.part_one_js = (ROOT / "study" / "math" / "part-one" / "part-one.js").read_text(encoding="utf-8")
        cls.auth_js = (ROOT / "study" / "auth-session.js").read_text(encoding="utf-8")

    def test_root_opens_trainer_without_landing_content(self):
        self.assertIn('content="0;url=/study/"', self.root_html)
        self.assertIn('window.location.replace("/study/")', self.root_html)
        self.assertIn('href="/study/"', self.root_html)
        self.assertIn('rel="canonical" href="https://oge-na-5.ru/study/"', self.root_html)
        self.assertNotIn("Набор на индивидуальные занятия", self.root_html)
        self.assertNotIn("Сайфуллина Олеся Раифовна", self.root_html)

    def test_sitemap_points_to_trainer_not_old_landing(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        self.assertIn("Sitemap: https://oge-na-5.ru/sitemap.xml", robots)
        self.assertNotIn("<loc>https://oge-na-5.ru/</loc>", sitemap)
        self.assertIn("<loc>https://oge-na-5.ru/study/</loc>", sitemap)
        self.assertIn("<loc>https://oge-na-5.ru/study/math/part-one/</loc>", sitemap)
        self.assertEqual((ROOT / "CNAME").read_text(encoding="utf-8").strip(), "oge-na-5.ru")

    def test_trainer_home_and_progress_remain_available(self):
        for text in ("ОГЭ-тренажёр — математика", "Кабинет ученика",
                     "Мои тренажёры", "Мой прогресс", "Бонусы"):
            self.assertIn(text, self.study_html)
        self.assertIn('href="math/part-one/index.html#trainer"', self.study_html)
        self.assertIn('id="buy-part-one"', self.study_html)
        self.assertIn('href="#purchase-offer" data-purchase-open', self.study_html)

    def test_individual_lesson_goes_to_separate_domain(self):
        for page in (self.study_html, self.informatics_html):
            card = page.split('<article class="course-card is-mentor">', 1)[1].split("</article>", 1)[0]
            self.assertIn('href="https://repiq.ru/oge/"', card)
            self.assertNotIn('href="https://oge-na-5.ru/"', card)

    def test_math_first_part_and_login_guard_remain(self):
        self.assertIn("Первая часть ОГЭ по математике", self.part_one_html)
        self.assertIn("fractionQuiz", self.part_one_html)
        self.assertIn("MATH_PART_ONE_TEST", self.part_one_js)
        self.assertIn('ogeHasCourseAccess("math-first")', self.part_one_js)
        self.assertIn('window.location.replace("../../login.html")', self.part_one_js)
        self.assertIn(".from('enrollments')", self.auth_js)

    def test_guest_does_not_inherit_browser_progress(self):
        self.assertNotIn("localStorage.getItem(" + chr(96) + "ogeStudioCourse:", self.study_html)
        self.assertIn("resetTask6Progress", self.study_html)


if __name__ == "__main__":
    unittest.main()
