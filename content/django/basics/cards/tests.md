## [card tests] Tests

| code | name | desc | detail |
|------|------|------|--------|
| `from django.test import TestCase` | base class | `unittest.TestCase` with DB isolation per test | Each test runs inside a transaction that's rolled back at teardown — tests can't leak state. |
| `def test_xxx(self)` | test method | name starts with `test_`; auto-discovered by the runner | One `TestCase` subclass per model/view; one method per condition. Descriptive names — when they fail, the name is the bug report. |
| `self.client.get(reverse("polls:index"))` | test Client | a fake browser bound to your URLconf | `self.client` auto-attached to `TestCase`. `.post(url, data)`, `.login(username=…, password=…)`, `.logout()`. |
| `response.status_code`, `.context`, `.content`, `.redirect_chain` | response handles | what the Client gives you back | `.context` exposes template context vars — assert against them, not the rendered HTML, when possible. |
| `assertEqual`, `assertIs`, `assertTrue`, `assertFalse` | unittest | basic equality / identity / truthiness | `assertIs` checks `is` (identity), not `==`. Useful for booleans and singletons. |
| `assertContains(response, text)` | response body contains | also asserts `status_code == 200` unless you pass `status_code=` | Inverse: `assertNotContains`. For exact 200 + body text, this is the one. |
| `assertRedirects(response, url)` / `assertTemplateUsed(response, "name.html")` | redirects + templates | response was a 30x to `url` / template was rendered | `assertRedirects` follows the redirect by default and checks the final response too. |
| `assertQuerySetEqual(qs, values)` | compare QuerySets | order-sensitive by default; pass `ordered=False` for set-equal | Useful for view tests that put a QuerySet in `response.context`. |
| `Model.objects.create(...)` in `setUp` or per test | fixtures | build test data programmatically; cheap because of rollback | Prefer this over JSON/YAML fixture files for unit-test data — easier to read, fewer moving parts. |
| `python manage.py test polls.tests.QuestionIndexViewTests.test_past_question` | targeted run | full test suite, one app, one class, one method | Test runner creates a temp DB (`test_<name>`), runs migrations, runs the tests, drops the DB. |