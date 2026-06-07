## [code first-steps-with-djangos-admin] First steps with Django's admin

### Create a superuser

```shell 
> python manage.py createsuperuser
> python manage.py runserver
```

Now you can log in to the admin interface at `http://127.0.0.1:8000/admin/`

### Add a model to the admin

```python apps/polls/admin.py
from django.contrib import admin
from .models import Question

admin.site.register(Question)
```