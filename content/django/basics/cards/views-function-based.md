## [code views-function-based] Views — function-based

### GET / POST dispatch + POST/Redirect/GET

```python apps/polls/views.py
def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    if request.method != "POST":
        return HttpResponse(f"Question: {question.question_text}")

    try:
        selected = question.choices.get(pk=request.POST["choice"])
    except (KeyError, Choice.DoesNotExist):
        return HttpResponse("You didn't select a choice.", status=400)

    selected.votes = F("votes") + 1
    selected.save()
    return HttpResponseRedirect(reverse("polls:results", args=(question.id,)))
```

Branch on `request.method`. After a successful POST, **always** redirect — otherwise the back button resubmits. Use `F()` so concurrent voters don't lose increments to a read-modify-write race.

### urlconf

```python apps/polls/urls.py
from django.urls import path
from . import views

app_name = "polls"
urlpatterns = [
    path("", views.index, name="index"),
    path("<int:pk>/", views.detail, name="detail"),
    path("<int:question_id>/vote/", views.vote, name="vote"),
]
```
