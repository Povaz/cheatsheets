## [code models-skeleton] Model skeleton & `on_delete`

### `Question` / `Choice` with FK

```python
from django.db import models

class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published")

    def __str__(self):
        return self.question_text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)

    def __str__(self):
        return self.choice_text
```

Each subclass becomes one DB table; each `Field` attribute becomes a column. Always define `__str__` — `<Question: Question object (1)>` is rarely useful in the admin. `related_name="choices"` swaps the default `choice_set` reverse manager for the friendlier `question.choices`.

### `on_delete` policies

```python
on_delete=models.CASCADE       # delete the child rows when parent is deleted
on_delete=models.PROTECT       # raise ProtectedError — block the parent delete
on_delete=models.SET_NULL      # set the FK to NULL — requires null=True
on_delete=models.SET_DEFAULT   # set the FK to the field's default
on_delete=models.SET(get_user) # set to a callable's return value
on_delete=models.DO_NOTHING    # leave dangling FKs (you handle integrity)
```

`on_delete` is **required** on every `ForeignKey`. Picking carelessly leaves dangling rows or unwanted cascades. Default to `CASCADE` for "child cannot exist without parent"; `PROTECT` for "deleting the parent is a data-integrity error"; `SET_NULL` only when the relationship is genuinely optional.