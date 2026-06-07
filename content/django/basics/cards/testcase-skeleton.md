## [code testcase-skeleton] `TestCase` skeleton

Each test runs inside a transaction that rolls back at teardown — no leaked state.

```python
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
import datetime
from .models import Question

class QuestionIndexViewTests(TestCase):
    def setUp(self):
        Question.objects.create(
            question_text="Past question.",
            pub_date=timezone.now() - datetime.timedelta(days=30),
        )

    def test_past_question_appears(self):
        response = self.client.get(reverse("polls:index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Past question.")
```

### Test Client

`self.client` is a fake browser auto-attached to every `TestCase`. The response gives you `.status_code`, `.context`, `.content`, `.redirect_chain`.

```python
self.client.get(reverse("polls:index"))
self.client.post(url, data={"choice": 1})
self.client.login(username="admin", password="secret")
self.client.logout()
```

### Running tests

```shell
python manage.py test                                            # full suite
python manage.py test polls                                      # one app
python manage.py test polls.tests.QuestionIndexViewTests         # one class
python manage.py test polls.tests.QuestionIndexViewTests.test_past_question  # one method
```

The runner creates a temp DB, runs migrations, executes the tests, then drops the DB.
