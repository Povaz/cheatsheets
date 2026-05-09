## [code views] Views — function & class-based

### Function - GET / POST dispatch + POST/Redirect/GET

```python apps/polls/views.py
def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    if request.method != "POST":
        return render(request, "polls/detail.html", {"question": question})

    try:
        selected = question.choices.get(pk=request.POST["choice"])
    except (KeyError, Choice.DoesNotExist):
        return render(request, "polls/detail.html", {
            "question": question,
            "error_message": "You didn't select a choice.",
        })

    selected.votes = F("votes") + 1
    selected.save()
    return HttpResponseRedirect(reverse("polls:results", args=(question.id,)))
```

Branch on `request.method`. After a successful POST, **always** redirect — otherwise the back button resubmits. Use `F()` so concurrent voters don't lose increments to a read-modify-write race.

### Class-Based — `ListView` & `DetailView`

```python apps/polls/views.py
from django.views import generic

class IndexView(generic.ListView):
    template_name = "polls/index.html"
    context_object_name = "latest_question_list"

    def get_queryset(self):
        return Question.objects.order_by("-pub_date")[:5]

class DetailView(generic.DetailView):
    model = Question
```

CBVs eliminate boilerplate when the pattern is "list this model" or "show one by pk". Override only what differs. Forgetting `.as_view()` in `urls.py` is the #1 CBV gotcha — Django registers the *class* and request handling fails.

### urlconf

Use `as_view()` to register the class-based view.

```python apps/polls/urls.py
from django.urls import path
from . import views

app_name = "polls"
urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("<int:pk>/", views.DetailView.as_view(), name="detail"),
    path("<int:question_id>/vote/", views.vote, name="vote"),
]
```