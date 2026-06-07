## [code override-settings] `@override_settings`

```python
@override_settings(MEDIA_ROOT='/tmp/test-backfill-contract-pdfs')
class BackfillContractPdfsTestBase(TestCase):
    ...
```

Swaps a Django setting for the test's lifetime — decorator on a class or method, or as a context manager. Essential for storage tests: `FileSystemStorage` writes real bytes rooted at `MEDIA_ROOT`, so overriding it to a tmp dir keeps dev `media/` clean. Works for any setting: `DEFAULT_FILE_STORAGE`, `DEBUG`, feature flags. Restores the original value on exit, even if the test fails.
