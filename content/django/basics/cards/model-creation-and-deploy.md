## [code model-creation-and-deploy] Model Creation & Deploy

### Model Definition

```python apps/polls/models.py
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

### Model Migration

Everytime models changes:
```shell apps/polls/models.py
python manage.py makemigrations polls   # Generate migration file in apps/polls/migrations/
python manage.py sqlmigrate polls 0001  # Show SQL to create the table (output depends on SQL dialect)
python manage.py migrate                # Apply the migration
```
