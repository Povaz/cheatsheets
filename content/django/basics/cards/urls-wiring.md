## [code urls-wiring] URL wiring & `reverse()`

### root + per-app URLconf

```python
# mysite/urls.py — root
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("polls/", include("polls.urls")),
]

# polls/urls.py — per-app
from django.urls import path
from . import views

app_name = "polls"
urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("<int:pk>/", views.DetailView.as_view(), name="detail"),
    path("<int:question_id>/vote/", views.vote, name="vote"),
]
```

Apps declare an `app_name` namespace; the root URLconf includes them under a prefix. This prevents `name="index"` collisions across apps and lets `reverse("polls:index")` resolve unambiguously. Always set `name=` on every `path()` — never hardcode URLs anywhere else.

### `reverse()` — template & Python

```text
# in a template
<a href="{% url 'polls:detail' question.id %}">{{ question.question_text }}</a>

# in a view, after a successful POST
return HttpResponseRedirect(reverse("polls:detail", args=(question.id,)))
```

Resolving URLs by name decouples templates and views from the URL layout. Change the route in `urls.py` and every reverse stays correct.