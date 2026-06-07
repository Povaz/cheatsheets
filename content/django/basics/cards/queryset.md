## [code queryset] QuerySet

QuerySets are lazy — they don't hit the DB until iterated, sliced, or coerced (`list()`, `bool()`, `len()`). Chain freely; the SQL is built up and sent only when results are needed.

### CRUD

```python
Question.objects.all()                                          
Question.objects.get(pk=1)                                      
Question.objects.filter(pub_date__year=2026)                    
Question.objects.filter(...).exclude(...).order_by("-pub_date")[:5]
Question.objects.create(question_text="…", pub_date=timezone.now())
q = Question.objects.get(pk=1); q.delete()
```

### Relation traversal

`field__related__field` walks FKs with double-underscore. The reverse manager (`related_name` or default `<model>_set`) gives the same `.filter()` / `.create()` API from the parent side.

```python
Choice.objects.filter(question__pub_date__year=2026) # FK traversal
question.choices.all()                               # reverse manager
```

### values_list & none()

`flat=True` collapses 1-tuples to scalars (single field only). `.none()` returns a chainable empty queryset — use it instead of `WHERE id IN ()` when the input list might be empty.

```python
ids = list(Choice.objects.filter(...).values_list('id', flat=True))
qs = Model.objects.none() if not ids else Model.objects.filter(pk__in=ids)
```
