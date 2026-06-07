## [code foreign-key] Foreign Key

A `ForeignKey` is a many-to-one link — each `Choice` belongs to exactly one `Question`. `on_delete` is **required** and controls what happens to the child when the parent is deleted.

```python apps/polls/models.py
class Choice(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="choices", # question.choices instead of choice_set
    )
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
```

```python
on_delete=models.CASCADE       # delete child rows when parent is deleted
on_delete=models.PROTECT       # raise ProtectedError, block parent delete
on_delete=models.SET_NULL      # set FK to NULL — requires null=True
on_delete=models.SET_DEFAULT   # set FK to the field's default
on_delete=models.SET(get_user) # set to a callable's return value
on_delete=models.DO_NOTHING    # leave dangling FKs (you handle integrity)
```
