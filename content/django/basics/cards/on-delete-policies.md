## [code on-delete-policies] `on_delete` policies

```python
on_delete=models.CASCADE       # delete the child rows when parent is deleted
on_delete=models.PROTECT       # raise ProtectedError — block the parent delete
on_delete=models.SET_NULL      # set the FK to NULL — requires null=True
on_delete=models.SET_DEFAULT   # set the FK to the field's default
on_delete=models.SET(get_user) # set to a callable's return value
on_delete=models.DO_NOTHING    # leave dangling FKs (you handle integrity)
```

`on_delete` is **required** on every `ForeignKey`. Picking carelessly leaves dangling rows or unwanted cascades. Default to `CASCADE` for "child cannot exist without parent"; `PROTECT` for "deleting the parent is a data-integrity error"; `SET_NULL` only when the relationship is genuinely optional.
