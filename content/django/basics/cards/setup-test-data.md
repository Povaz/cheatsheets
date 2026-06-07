## [code setup-test-data] `setUpTestData`

`setUpTestData` runs **once per class** inside a transaction savepoint — huge speedup for shared reference data. Use `setUp` for state that must be fresh per test (temp dirs, mutable objects).

```python
class QuestionViewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.question = Question.objects.create(
            question_text="Test question",
            pub_date=timezone.now(),
        )

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp, ignore_errors=True)
```

Rule of thumb: if the test only reads it, `setUpTestData`; if any test mutates it, `setUp`.
