## [code first-steps-with-djangos-admin] First steps with Django's admin

Create a superuser, start the dev server, then register a model to get full CRUD in the admin.

### Create a superuser

```shell
python manage.py createsuperuser          # prompts for username, email, password
python manage.py runserver
```

### Register a model

```python apps/polls/admin.py
from django.contrib import admin
from .models import Question

# one line → change-list, change form, history, save/delete
# edit-form widgets pick themselves based on field type
admin.site.register(Question)
```

### Branding

```python
admin.site.site_header = "Polls Admin"    # replaces "Django administration"
admin.site.site_title  = "Polls"          # browser tab suffix
admin.site.index_title = "Dashboard"      # index page heading
```
