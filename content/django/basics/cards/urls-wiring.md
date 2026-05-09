## [code urls-wiring] URL wiring & `reverse()`

### root URLconf + per-app URLconf + views

```python mysite/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("polls/", include("polls.urls")),
]
```

```python apps/polls/urls.py
from django.urls import path
from . import views

app_name = "polls"
urlpatterns = [
    path("", views.index, name="index"),
]
```

Apps declare an `app_name` namespace; the root URLconf includes them under a prefix. This prevents `name="index"` collisions across apps and lets `reverse("polls:index")` resolve unambiguously. Always set `name=` on every `path()` — never hardcode URLs anywhere else.

```python apps/polls/views.py
# minimal — return any HttpResponse
def index(request):
    return HttpResponse("Hello, world!")

# idiomatic — render() loads template, runs context processors, wraps in HttpResponse
def index(request):
    latest = Question.objects.order_by("-pub_date")[:5]
    return render(request, "polls/index.html", {"latest_question_list": latest})
```

Function-based views are plain Python that returns an `HttpResponse`. The `render()` shortcut replaces the verbose `loader.get_template(...).render(...)` + `HttpResponse(...)` dance — pass `request` so context processors run.

### `reverse()` — template & Python

```text
# in a template
<a href="{% url 'polls:detail' question.id %}">{{ question.question_text }}</a>

# in a view, after a successful POST
return HttpResponseRedirect(reverse("polls:detail", args=(question.id,)))
```

Resolving URLs by name decouples templates and views from the URL layout. Change the route in `urls.py` and every reverse stays correct.