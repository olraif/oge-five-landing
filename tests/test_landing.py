import re
import unittest
from pathlib import Path


ROOT = Path(__file__).absolute().parents[1]


class LandingContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.study_html = (ROOT / "study" / "index.html").read_text(encoding="utf-8")
        cls.study_css = (ROOT / "study" / "study.css").read_text(encoding="utf-8")
        cls.part_one_html = (ROOT / "study" / "math" / "part-one" / "index.html").read_text(encoding="utf-8")
        cls.part_one_css = (ROOT / "study" / "math" / "part-one" / "part-one.css").read_text(encoding="utf-8")
        cls.part_one_js = (ROOT / "study" / "math" / "part-one" / "part-one.js").read_text(encoding="utf-8")
        cls.auth_js = (ROOT / "study" / "auth-session.js").read_text(encoding="utf-8")
        cls.css = (ROOT / "theme.css").read_text(encoding="utf-8")
        cls.js = (ROOT / "site.js").read_text(encoding="utf-8")

    def test_page_has_one_specific_h1(self):
        headings = re.findall(r"<h1\b[^>]*>(.*?)</h1>", self.html, re.I | re.S)
        self.assertEqual(len(headings), 1)
        plain_heading = re.sub(r"<[^>]+>", " ", headings[0])
        self.assertIn("ОГЭ", plain_heading)
        self.assertIn("математике", plain_heading)
        self.assertIn("информатике", plain_heading)

    def test_result_and_certificate_claims_are_present(self):
        self.assertIn("90%", self.html)
        self.assertIn('<strong>4</strong><span>за год</span>', self.html)
        self.assertIn('<strong>5</strong><span>за ОГЭ</span>', self.html)
        self.assertIn('<strong>5</strong><span>в аттестате</span>', self.html)
        self.assertIn("математического округления", self.html)

    def test_marketing_page_uses_message_calls_to_action(self):
        self.assertGreaterEqual(self.html.count("Написать в MAX"), 3)
        self.assertNotIn('href="tel:', self.html)
        self.assertNotRegex(self.html.lower(), r"<form\b")

    def test_page_has_mobile_and_accessibility_basics(self):
        self.assertIn('name="viewport"', self.html)
        self.assertIn('href="#main"', self.html)
        self.assertIn(":focus-visible", self.css)
        self.assertRegex(self.css, r"prefers-reduced-motion:\s*reduce")

    def test_seo_publication_basics_are_present(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        self.assertIn('rel="canonical" href="https://oge-na-5.ru/"', self.html)
        self.assertIn('property="og:title"', self.html)
        self.assertIn('"@type": "EducationalService"', self.html)
        self.assertIn("Sitemap: https://oge-na-5.ru/sitemap.xml", robots)
        self.assertIn("<loc>https://oge-na-5.ru/</loc>", sitemap)
        self.assertIn("<loc>https://oge-na-5.ru/study/</loc>", sitemap)
        self.assertIn("<loc>https://oge-na-5.ru/study/math/part-one/</loc>", sitemap)
        self.assertTrue((ROOT / ".nojekyll").is_file())
        self.assertEqual((ROOT / "CNAME").read_text(encoding="utf-8").strip(), "oge-na-5.ru")

    def test_styles_cover_mobile_call_bar(self):
        self.assertRegex(self.css, r"@media \(max-width:\s*720px\)")
        self.assertIn(".mobile-call", self.css)

    def test_visual_system_matches_warm_online_school_direction(self):
        self.assertIn("--violet:#7557e8", self.css)
        self.assertIn("--blue:#4b74ff", self.css)
        self.assertIn("--mint:#bfeec7", self.css)
        self.assertIn("--lavender:#f1edff", self.css)
        self.assertIn("border-radius:60% 40%", self.css)
        self.assertNotIn("--lime:#dfff57", self.css)
        self.assertNotIn("--coral:", self.css)
        self.assertIn("Segoe Print", self.css)

    def test_student_photos_are_integrated(self):
        self.assertIn('src="assets/student-boy.png"', self.html)
        self.assertIn('src="assets/student-girl-v2.png"', self.html)
        self.assertTrue((ROOT / "assets" / "student-boy.png").is_file())
        self.assertTrue((ROOT / "assets" / "student-girl-v2.png").is_file())

    def test_max_is_available_as_secondary_contact(self):
        self.assertGreaterEqual(self.html.count('href="https://max.ru/u/f9LHodD0cOJ-WhJxLmY8QmF0qkpfQyUtIpdxsmy0NXN-tXKcYjrT8ztesFg"'), 3)
        self.assertIn("Написать в MAX", self.html)
        self.assertNotIn("WhatsApp", self.html)

    def test_callback_scenario_is_clear(self):
        self.assertIn("10–15 минут", self.html)
        self.assertIn("подойдёт ли формат занятий", self.html)
        self.assertIn("Если не дозвонились", self.html)
        self.assertIn("у меня идёт урок", self.html)
        self.assertIn("напишите в MAX, и я вам перезвоню", self.html)

    def test_new_stability_and_self_check_cases_are_present(self):
        self.assertIn("То 5, то 3", self.html)
        self.assertIn("10 вариантов", self.html)
        self.assertIn("Научился проверять себя", self.html)
        self.assertIn("Два способа решения", self.html)

    def test_online_format_and_subject_choice_are_clear(self):
        html = self.html.lower()
        self.assertIn("занятия проходят онлайн", html)
        self.assertIn("совместной онлайн-доске", html)
        self.assertIn("вместе или по отдельности", html)
        self.assertIn("информатика за компьютером", html)
        self.assertIn("точный ввод", html)

    def test_strong_student_confidence_hook_is_present(self):
        self.assertIn("В школе 4 или 5, но нет уверенности", self.html)
        self.assertIn("ребёнок с пятёркой по математике", self.html)
        self.assertIn("уверенная пятёрка сейчас", self.html)
        self.assertIn("сильная траектория дальше", self.html)

    def test_goal_oriented_positioning_is_present(self):
        self.assertIn("ЕГЭ 80+", self.html)
        self.assertIn("поступление в вуз", self.html)
        self.assertIn("ОГЭ становится не финишем", self.html)
        self.assertIn("цель ставим отдельно по каждому предмету и блоку заданий", self.html)
        self.assertIn("Формат не «просто сдать»", self.html)

    def test_progressive_enhancement_has_fallback(self):
        self.assertIn("IntersectionObserver", self.js)
        self.assertIn("is-visible", self.js)

    def test_yandex_direct_goals_are_wired(self):
        self.assertIn("CALL_CLICK", self.js)
        self.assertIn("MAX_CLICK", self.js)
        self.assertIn('a[href^="tel:"]', self.js)
        self.assertIn('a[href*="max.ru"]', self.js)
        self.assertIn("window.METRIKA_COUNTER_ID", self.js)

    def test_yandex_metrika_is_temporarily_disabled(self):
        for page in (self.html, self.study_html):
            self.assertNotIn("METRIKA_COUNTER_ID", page)
            self.assertNotIn("mc.yandex.ru", page)
            self.assertNotIn("webvisor:", page)

    def test_study_studio_entry_and_page_exist(self):
        self.assertIn('href="study/index.html">Кабинет ученика</a>', self.html)
        self.assertIn("ОГЭ-студия — математика", self.study_html)
        self.assertIn("Кабинет ученика", self.study_html)
        self.assertIn("Мои тренажёры", self.study_html)
        self.assertIn("Мой прогресс", self.study_html)
        self.assertIn("Бонусы", self.study_html)
        self.assertIn("тарифы", self.study_html)
        self.assertIn("индивидуальное занятие", self.study_html)
        self.assertIn("study.css", self.study_html)
        self.assertIn(".studio-sidebar", self.study_css)
        self.assertIn('href="math/part-one/index.html#trainer"', self.study_html)

    def test_math_part_one_course_shell_exists(self):
        self.assertIn("Первая часть ОГЭ по математике", self.part_one_html)
        self.assertIn("задания по типам банка ФИПИ", self.part_one_html)
        self.assertIn("Первая часть даёт уверенную базу", self.part_one_html)
        self.assertIn("Вторая часть — только с проверкой", self.part_one_html)
        self.assertEqual(self.part_one_html.count("сюда вставим видео"), 10)
        self.assertIn("06.01", self.part_one_html)
        self.assertIn("06.10", self.part_one_html)
        self.assertIn("fractionQuiz", self.part_one_html)
        self.assertIn("MATH_PART_ONE_TEST", self.part_one_js)
        self.assertIn(".prototype-grid", self.part_one_css)

    def test_local_assets_exist(self):
        self.assertTrue((ROOT / "assets" / "portrait-teal.png").is_file())
        self.assertTrue((ROOT / "assets" / "certificate-insert-real.png").is_file())
        self.assertTrue((ROOT / "assets" / "certificate-math-5-closeup.png").is_file())
        self.assertTrue((ROOT / "assets" / "parent-thinking.png").is_file())

    def test_individual_lesson_call_to_action_is_explicit(self):
        self.assertIn("Напишите в MAX", self.html)
        self.assertIn("индивидуальные занятия", self.html.lower())
        self.assertIn("Количество мест ограничено", self.html)
        self.assertIn("Как эффективно подготовить ребёнка к ОГЭ на 5?", self.html)
        self.assertIn("контролировать подготовку", self.html)


    def test_guest_access_does_not_inherit_browser_storage(self):
        self.assertNotIn("localStorage.getItem(`ogeStudioCourse:", self.study_html)
        self.assertIn(".from('enrollments')", self.auth_js)
        self.assertIn("resetTask6Progress", self.study_html)
    def test_direct_trainer_requires_active_enrollment(self):
        self.assertIn("ogeHasCourseAccess(\"math-first\")", self.part_one_js)
        self.assertIn("window.location.replace(\"../../login.html\")", self.part_one_js)


    def test_main_header_does_not_duplicate_tutor_name(self):
        self.assertNotIn("<strong>\u041e\u043b\u0435\u0441\u044f \u0421\u0430\u0439\u0444\u0443\u043b\u043b\u0438\u043d\u0430</strong>", self.html)
        self.assertIn("<strong>\u041e\u0413\u042d \u043d\u0430 5</strong>", self.html)

if __name__ == "__main__":
    unittest.main()
