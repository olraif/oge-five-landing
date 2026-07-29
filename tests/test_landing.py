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

    def test_phone_is_the_only_conversion_mechanism(self):
        self.assertGreaterEqual(self.html.count('href="tel:+79603837857"'), 3)
        self.assertIn("+7 960 383-78-57", self.html)
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
        self.assertIn("всё сохраняется", html)
        self.assertIn("вместе или по отдельности", html)
        self.assertIn("когэ", html)
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

    def test_yandex_metrika_counter_is_installed(self):
        self.assertIn("window.METRIKA_COUNTER_ID = 111088885", self.html)
        self.assertIn("window.METRIKA_COUNTER_ID = 111088885", self.study_html)
        self.assertIn('ym(111088885, "init"', self.html)
        self.assertIn("https://mc.yandex.ru/metrika/tag.js", self.html)
        self.assertIn("https://mc.yandex.ru/watch/111088885", self.html)
        self.assertIn("accurateTrackBounce", self.html)
        self.assertIn("trackLinks", self.html)

    def test_study_studio_entry_and_page_exist(self):
        self.assertIn('href="study/">Кабинет</a>', self.html)
        self.assertIn("Студия ОГЭ на 5", self.study_html)
        self.assertIn("Кабинет ученика", self.study_html)
        self.assertIn("Мои курсы", self.study_html)
        self.assertIn("Мой прогресс", self.study_html)
        self.assertIn("Бонусы", self.study_html)
        self.assertIn("Три тарифа студии", self.study_html)
        self.assertIn("Привёл друга", self.study_html)
        self.assertIn("бонусный индивидуальный урок", self.study_html)
        self.assertIn("study.css", self.study_html)
        self.assertIn(".studio-sidebar", self.study_css)

    def test_local_assets_exist(self):
        self.assertTrue((ROOT / "assets" / "portrait-teal.png").is_file())
        self.assertTrue((ROOT / "assets" / "certificate-insert-real.png").is_file())
        self.assertTrue((ROOT / "assets" / "certificate-math-5-closeup.png").is_file())
        self.assertTrue((ROOT / "assets" / "parent-thinking.png").is_file())

    def test_individual_lesson_call_to_action_is_explicit(self):
        self.assertIn("Звоните прямо сейчас", self.html)
        self.assertIn("индивидуальные занятия", self.html.lower())
        self.assertIn("Количество мест ограничено", self.html)
        self.assertIn("Как эффективно подготовить ребёнка к ОГЭ на 5?", self.html)
        self.assertIn("контролировать подготовку", self.html)


if __name__ == "__main__":
    unittest.main()
