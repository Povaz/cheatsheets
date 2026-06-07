## [code storage-isnt-transactional] Storage isn't transactional

```python
# TestCase rolls back DB writes — but filesystem/S3 writes are NOT enrolled.
# The service tracks what it wrote and explicitly deletes on failure:

def create_with_attachments(...):
    try:
        stored_name = storage.save(name, upload)   # S3 PUT — outside the tx
        EngineFile.objects.create(file=stored_name, ...)
    except Exception:
        storage.delete(stored_name)                # explicit cleanup
        raise
```

`TestCase` wraps each test in a rolled-back transaction, so DB rows never leak. But `FileSystemStorage` / `S3Boto3Storage` writes bypass the DB transaction — they persist even after rollback. Pair `@override_settings(MEDIA_ROOT=tmp)` with `addCleanup(shutil.rmtree, tmp)` to clean up, and expect application code (not the test framework) to handle orphaned blobs on failure.
