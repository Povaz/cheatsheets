## [code admin-skeleton] `ModelAdmin` & `@admin.display`

### `ModelAdmin` with inlines

```python
from django.contrib import admin
from .models import Question, Choice

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 3

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    fieldsets = [
        (None,               {"fields": ["question_text"]}),
        ("Date information", {"fields": ["pub_date"], "classes": ["collapse"]}),
    ]
    inlines       = [ChoiceInline]
    list_display  = ["question_text", "pub_date", "was_published_recently"]
    list_filter   = ["pub_date"]
    search_fields = ["question_text"]
```

`fieldsets` groups (and optionally collapses) edit-form sections. `inlines` lets you edit related rows on the parent's page — invaluable for parent/child models. `list_display`, `list_filter`, `search_fields` shape the change-list. `@admin.register` is the decorator-form equivalent of `admin.site.register(Question, QuestionAdmin)`.

### `@admin.display` annotation

```python
class Question(models.Model):
    # ... fields ...

    @admin.display(boolean=True, ordering="pub_date", description="Published recently?")
    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)
```

Turn a method into a sortable, labelled change-list column. `boolean=True` renders tick/cross icons; `ordering="field"` makes the column sortable by that DB field; `description` overrides the column header text.