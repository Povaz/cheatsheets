## [code model-save-update-fields] `Model.save(update_fields=)`

```python
contract.contract_pdf_attachment = attachment
contract.save(update_fields=['contract_pdf_attachment', 'updated_at'])
```

Without `update_fields`, `.save()` writes every column — firing every validator and every `pre_save` signal connected to other fields. `update_fields` narrows the `UPDATE` to exactly the listed columns. Gotcha: `auto_now=True` on `updated_at` only fires when that field is in the list — omit it and the timestamp goes silently stale.
