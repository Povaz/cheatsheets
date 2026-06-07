## [code storage-isnt-transactional] Storage isn't transactional

`TestCase` rolls back DB writes, but `FileSystemStorage` / `S3Boto3Storage` writes bypass the transaction — they persist even after rollback. Application code must handle orphaned blobs explicitly.

```python
def create_with_attachment(instance, upload, storage):
    try:
        stored_name = storage.save(name, upload)   # S3 PUT — outside the tx
        Attachment.objects.create(file=stored_name, ...)
    except Exception:
        storage.delete(stored_name)                # explicit cleanup
        raise
```

Pair `@override_settings(MEDIA_ROOT=tmp)` with `addCleanup(shutil.rmtree, tmp)` in tests to clean up written files.
