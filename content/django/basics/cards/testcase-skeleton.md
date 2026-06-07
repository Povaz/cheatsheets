## [code testcase-skeleton] `TestCase` skeleton

### a realistic test

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

Each test runs inside a transaction that rolls back at teardown — no fixture cleanup, no leaked state. `self.client` is a fake browser bound to your URLconf; it gives you `.status_code`, `.context`, `.content`, `.redirect_chain`. Build test data programmatically in `setUp` rather than YAML/JSON fixtures — easier to read, fewer moving parts.