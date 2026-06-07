## [code url-converters] Path converters

The captured segment is type-checked and passed as a kwarg to the view.

```python apps/polls/urls.py
urlpatterns = [
    path("<int:pk>/", views.detail),        # /42/     → pk=42
    path("<slug:tag>/", views.by_tag),      # /my-tag/ → tag="my-tag"
    path("<uuid:token>/", views.confirm),   # /a1b2…/  → token=UUID("a1…")
    path("<path:rest>/", views.catch_all),  # /a/b/c   → rest="a/b/c"
]
```

```python apps/polls/views.py
def detail(request, pk):                       # pk arrives as int, not str
    question = get_object_or_404(Question, pk=pk)
    return HttpResponse(f"Question: {question.question_text}")
```

`str` is the default (no slashes). `int`, `slug`, `uuid`, `path` cover ~all common cases — `re_path(r"^…$", view)` is the escape hatch when they don't.
