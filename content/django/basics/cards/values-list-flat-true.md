## [code values-list-flat-true] `values_list(flat=True)`

```python
cc_ids = list(
    CompetenceCost.objects.filter(**cc_filter)
    .values_list('id', flat=True)
)
```

`.values_list('field')` returns a queryset of 1-tuples. Adding `flat=True` collapses it to a flat Python list — useful when you need a list of PKs for an `__in` lookup or a membership check. Only valid for a single field; passing two fields with `flat=True` raises `TypeError`.
