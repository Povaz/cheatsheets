## [code urls-wiring] URL wiring & reverse()

A request hits three files: the **root URLconf** strips the prefix and delegates to an **app URLconf**, which dispatches to a **view**.

```python mysite/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # delegates /polls/* to the app URLconf
    path("polls/", include("polls.urls")),   
]
```

```python apps/polls/urls.py
from django.urls import path
from . import views

# namespace — prevents name="index" collisions across apps
app_name = "polls"                           
urlpatterns = [
    # name= lets reverse("polls:index") resolve this URL
    path("", views.index, name="index"),     
]
```

```python apps/polls/views.py
def index(request):
    # resolves to "/polls/" — never hardcode URLs
    url = reverse("polls:index")             
    return HttpResponse(f"You're at {url}")
```
