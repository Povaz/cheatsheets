## [card admin] Admin customization

| code | name | desc | detail |
|------|------|------|--------|
| `python manage.py createsuperuser` | first user | create the admin account | Prompts for username, email, password. Visit `/admin/` to log in. |
| `admin.site.register(Question)` | minimal registration | one line in `polls/admin.py` and you have CRUD | Default views give a change-list, change form, history, save/delete. Edit-form widgets pick themselves based on field type. |
| `@admin.register(Question)` | decorator form | apply to a `ModelAdmin` class to register it | Cleaner when you have a `ModelAdmin` to declare. Equivalent to `admin.site.register(Question, QuestionAdmin)`. |
| `list_display`, `list_filter`, `search_fields`, `date_hierarchy`, `ordering` | change-list knobs | columns, sidebar filters, search bar, date drilldown, default sort | All are tuples/lists of field names (or callables). `search_fields` uses `LIKE`. |
| `fields = [...]` / `fieldsets = [...]` | edit form layout | flat list, or grouped sections | Use `fieldsets = [(None, {"fields": ["title"]}), ("Meta", {"fields": ["pub_date"], "classes": ["collapse"]})]` to group + collapse. |
| `class ChoiceInline(admin.TabularInline)` | inline editing | edit related rows on the parent's page | `model = Choice`, `extra = 3`. Add to parent via `inlines = [ChoiceInline]`. `StackedInline` is the vertical alternative. |
| `@admin.display(boolean=True, ordering="pub_date", description="…")` | column annotation | turn a method into a sortable, labelled, icon-rendered column | `boolean=True` → tick/cross icons. `ordering="field"` makes it sortable by that DB field. `description` sets the column header. |
| `admin.site.site_header / site_title / index_title` | branding | override the default "Django administration" texts | Set in `urls.py` or any module loaded at startup. Templates can also be overridden under `templates/admin/`. |