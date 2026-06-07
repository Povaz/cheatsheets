## [code setup-test-data] `setUpTestData`

```python
class BackfillContractPdfsTestBase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.counterparty = Counterparty.objects.create(...)
        cls.partner_property = PartnerProperty.objects.create(...)
        cls.contract_ct = ContentType.objects.get_for_model(Contract)

    def setUp(self):
        self.source_dir = Path(tempfile.mkdtemp(prefix='backfill-src-'))
        self.addCleanup(shutil.rmtree, self.source_dir, ignore_errors=True)
```

`setUpTestData` runs **once per class** and wraps the rows in a transaction savepoint — huge speedup for shared reference data (FK targets, content types). Use `setUp` for state that must be unique per test (temp dirs, mutable objects). Rule of thumb: if the test only reads it, `setUpTestData`; if any test mutates it, `setUp`.
