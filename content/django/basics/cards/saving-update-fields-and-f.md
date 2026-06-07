## [code saving-update-fields-and-f] Saving — `update_fields` & `F()`

### update_fields

Without `update_fields`, `.save()` writes every column — firing every validator and signal. Narrow to only the fields you changed.

```python
contract.contract_pdf_attachment = attachment
contract.save(update_fields=['contract_pdf_attachment', 'updated_at'])
```

`auto_now=True` on `updated_at` only fires when that field is in the list — omit it and the timestamp goes silently stale.

### F() — atomic column math

`F()` pushes arithmetic into the `UPDATE` statement so the database does it atomically. Without it, two concurrent writers both read `votes=0`, both write `votes=1`, and one increment is lost.

```python
from django.db.models import F

selected.votes = F("votes") + 1
selected.save()
# UPDATE polls_choice SET votes = votes + 1 WHERE id = …
```
