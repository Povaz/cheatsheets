## [code queryset-none] `QuerySet.none()`

```python
payment_atts = EngineFileAttachment.objects.filter(
    content_type=payment_ct, object_id__in=payment_ids,
) if payment_ids else EngineFileAttachment.objects.none()
```

When a list for an `__in` lookup is empty, guard with `.none()` instead of issuing a `WHERE id IN ()` query. Returns an empty queryset that never hits the database, chains normally with `.filter()` / `.union()` / `|`, and serves as a sentinel in conditional query-building.
