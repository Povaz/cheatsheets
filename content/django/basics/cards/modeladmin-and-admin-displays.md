## [code modeladmin-and-admin-displays] ModelAdmin & @admin.display

`@admin.register` binds a `ModelAdmin` to a model. `fieldsets` groups the edit form; `inlines` lets you edit child rows on the parent's page; `list_display`, `list_filter`, `search_fields` shape the change-list.

```python apps/polls/admin.py
from django.contrib import admin
from .models import Question, Choice

class ChoiceInline(admin.TabularInline):   # StackedInline for vertical layout
    model = Choice
    extra = 3

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    fieldsets = [
        (None,               {"fields": ["question_text"]}),
        ("Date information", {"fields": ["pub_date"], "classes": ["collapse"]}),
    ]
    inlines        = [ChoiceInline]
    list_display   = ["question_text", "pub_date", "was_published_recently"]
    list_filter    = ["pub_date"]
    search_fields  = ["question_text"]     # LIKE lookup
    date_hierarchy = "pub_date"            # date drilldown nav above the list
    ordering       = ["-pub_date"]         # default sort
```

### @admin.display

Turn a model method into a sortable, labelled change-list column. `boolean=True` renders tick/cross icons; `ordering` makes it sortable by a DB field; `description` overrides the header.

```python apps/polls/models.py
class Question(models.Model):
    # ... fields ...

    @admin.display(boolean=True, ordering="pub_date", description="Published recently?")
    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)
```
