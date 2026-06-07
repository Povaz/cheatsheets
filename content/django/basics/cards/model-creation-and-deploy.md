## [code model-creation-and-deploy] Model Creation & Deploy

Define a model class, generate a migration, apply it: `makemigrations` diffs your models against the last migration and writes a new one; `sqlmigrate` previews the SQL; `migrate` applies it.

```python apps/polls/models.py
from django.db import models

class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published")

    def __str__(self):  # without this: <Question: Question object (1)>
        return self.question_text
```

```shell /bin/bash
python manage.py makemigrations polls   
python manage.py sqlmigrate polls 0001 
python manage.py migrate
```
