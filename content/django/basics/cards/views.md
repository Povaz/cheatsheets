## [code views] Views — function & class-based

### minimal FBV → `render()` shortcut

```python
# minimal — return any HttpResponse
def index(request):
    return HttpResponse("Hello, world!")

# idiomatic — render() loads template, runs context processors, wraps in HttpResponse
def index(request):
    latest = Question.objects.order_by("-pub_date")[:5]
    return render(request, "polls/index.html", {"latest_question_list": latest})
```

Function-based views are plain Python that returns an `HttpResponse`. The `render()` shortcut replaces the verbose `loader.get_template(...).render(...)` + `HttpResponse(...)` dance — pass `request` so context processors run.

### GET / POST dispatch + POST/Redirect/GET

```python
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

### CBVs — `ListView` & `DetailView`

```python
from django.views import generic

class IndexView(generic.ListView):
    template_name = "polls/index.html"
    context_object_name = "latest_question_list"

    def get_queryset(self):
        return Question.objects.order_by("-pub_date")[:5]

class DetailView(generic.DetailView):
    model = Question

# in urls.py — always call .as_view()
path("<int:pk>/", DetailView.as_view(), name="detail"),
```

CBVs eliminate boilerplate when the pattern is "list this model" or "show one by pk". Override only what differs. Forgetting `.as_view()` in `urls.py` is the #1 CBV gotcha — Django registers the *class* and request handling fails.