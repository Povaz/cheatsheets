## [code queries-lookups-atomic-updates] Queries, lookups, atomic updates

### CRUD + chaining

```python
Question.objects.all()                                 # every row, lazily
Question.objects.get(pk=1)                             # exactly one or raises
Question.objects.filter(pub_date__year=2026)           # subset
Question.objects.filter(...).exclude(...).order_by("-pub_date")[:5]   # chain
Question.objects.create(question_text="…", pub_date=timezone.now())   # insert
q = Question.objects.get(pk=1); q.delete()             # delete
```

QuerySets are lazy — they don't hit the DB until iterated, sliced with a step, or coerced via `len()` / `bool()` / `list()`. Chain freely; the database query is built up and sent only when results are needed.

### lookups & relation traversal

```python
Question.objects.filter(pk=1)                                 # __exact (default)
Question.objects.filter(question_text__startswith="What")     # __startswith
Question.objects.filter(pub_date__year=2026)                  # __year
Choice.objects.filter(question__pub_date__year=2026)          # FK traversal
question.choices.all()                                        # reverse manager
```

`field__lookup` is the filter operator syntax — `__exact`, `__contains`, `__icontains`, `__startswith`, `__in`, `__gt`, `__gte`, `__year`, `__isnull`, etc. `field__related__field` walks foreign keys with the same dotted-double-underscore. The reverse manager (`choice_set` by default, or whatever `related_name` you set) gives you the same `.filter()` / `.create()` API on the parent.

### `F()` — atomic updates

```python
from django.db.models import F

selected.votes = F("votes") + 1
selected.save()
# emits: UPDATE polls_choice SET votes = votes + 1 WHERE id = …
```

Without `F()`, two concurrent voters both read `votes=0`, both write `votes=1`, and one increment is lost. With `F()`, Django emits `UPDATE … SET votes = votes + 1` and the database does the math atomically.