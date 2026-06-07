## [code single-seam] Single seam

When multiple callers can trigger the same write — API view, admin, management command — route them all through one service function. That function becomes the single seam: validation, atomicity, and cleanup live in one place.

### the seam

```python services/document_service.py
def create_with_attachments(uploaded_file, title, attach_to, user):
    for entry in attach_to:
        _validate_target(entry['entity_type'], entry['entity_id'])
    try:
        with transaction.atomic():
            stored_name = storage.save(title, uploaded_file)
            doc = Document.objects.create(
                file=stored_name, title=title, uploaded_by=user,
            )
            for entry in attach_to:
                Attachment.objects.create(
                    document=doc, content_type=entry['ct'],
                    object_id=entry['entity_id'],
                )
    except Exception:
        storage.delete(stored_name)    # blob is outside the DB tx
        raise
    return doc
```

`_validate_target` checks eligibility once. The `try/except` cleans up the storage blob if the DB step fails — storage writes are not enrolled in `transaction.atomic`. Every caller inherits both behaviours.

### callers

```python
# API view — DRF endpoint
def create(self, request, *args, **kwargs):
    doc = document_service.create_with_attachments(
        uploaded_file=request.FILES['file'], ...
    )
    return Response(DocumentSerializer(doc).data, status=201)

# Management command — one-shot backfill
for pdf_path in source_dir.glob('*.pdf'):
    with open(pdf_path, 'rb') as fh:
        document_service.create_with_attachments(
            uploaded_file=File(fh, name=pdf_path.name), user=None, ...
        )
```

Neither caller duplicates the validation or the cleanup. A future bulk-import endpoint would inherit them too.
