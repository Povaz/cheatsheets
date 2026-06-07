## [code cascade-needs-a-real-fk] CASCADE needs a real FK

```python
# EngineFileAttachment.object_id is a plain UUIDField — no FK constraint.
# Deleting the parent does NOT cascade to attachment rows.
# → Must delete attachments explicitly in code.

with transaction.atomic():
    EngineFileAttachment.objects.filter(
        content_type=stop_sale_ct, object_id=ss.id,
    ).delete()
    ss.delete()    # StopSaleDay rows cascade (real FK)
```

`on_delete=CASCADE` only fires through an actual `ForeignKey` constraint. A plain id column (typical with `GenericForeignKey` — `object_id` has no FK because it can point at any table) won't cascade on parent delete. The database doesn't know the link exists, so you handle it in application code or via a `pre_delete` signal.
