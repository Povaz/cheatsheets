---
title: Django
subtitle: project anatomy, the request cycle, the ORM, and the batteries
---

## [chapter] Project

## [card cli] `manage.py` daily commands

| code | name | desc | detail |
|------|------|------|--------|
| `django-admin startproject mysite` | bootstrap | create the project skeleton | One-time. Produces `manage.py` and the `mysite/` package containing `settings.py`, `urls.py`, `asgi.py`, `wsgi.py`. Bare `django-admin` is for `startproject` only — everything afterwards goes through `manage.py`. |
| `python manage.py startapp polls` | new app | scaffold an app under the project root | Creates `polls/` with `models.py`, `views.py`, `admin.py`, `apps.py`, `tests.py`, `migrations/`. Then add `'polls'` (or `'polls.apps.PollsConfig'`) to `INSTALLED_APPS`. |
| `python manage.py runserver` | dev server | start the auto-reloading dev server on `127.0.0.1:8000` | `runserver 8080` for a different port; `runserver 0:8000` to bind all interfaces. Auto-reloads on Python source changes. **Not** for production. |
| `python manage.py makemigrations [app]` | diff models | generate migration files from model changes | Inspects each app's models against the last migration and writes a new `polls/migrations/000N_*.py`. Commit migration files to git — they travel with the code. |
| `python manage.py migrate [app [N]]` | apply schema | apply unapplied migrations to the DB | First run creates tables for the bundled apps (admin, auth, contenttypes, sessions, …). Pass `app 0001` to roll forward/back to a specific migration. |
| `python manage.py sqlmigrate app N` | preview SQL | print the SQL a migration would run, without running it | Read-only. Useful before applying a migration in production or when reviewing a teammate's migration. |
| `python manage.py shell` | REPL | Python REPL with `DJANGO_SETTINGS_MODULE` loaded | Lets you `from polls.models import Question` and exercise the ORM interactively. `dbshell` instead opens the DB-native shell (`psql`, `sqlite3`, …). |
| `python manage.py createsuperuser` | admin user | create a user with `is_superuser=True` | Prompts for username, email, password. Required to log into `/admin/`. `changepassword <user>` resets a password later. |
| `python manage.py collectstatic` | gather assets | copy every app's `static/` into `STATIC_ROOT` | Production-only step; the dev server serves static files automatically. Run before deploying so nginx/S3/CDN can serve them. |
| `python manage.py test [path]` | run tests | discover and run tests, creating a temporary DB | `test polls` runs one app; `test polls.tests.QuestionIndexViewTests.test_past_question` runs one method. The test DB is auto-created and torn down. |

## [code project] Project anatomy

### project tree

```text
mysite/
├── manage.py            # CLI wrapper — knows DJANGO_SETTINGS_MODULE
├── mysite/
│   ├── settings.py      # all knobs — DB, apps, middleware, templates, static
│   ├── urls.py          # root URLconf — site's table of contents
│   ├── asgi.py          # async production entrypoint
│   └── wsgi.py          # sync production entrypoint
└── polls/                       # an app — `python manage.py startapp polls`
    ├── models.py                # ORM classes — one class = one table
    ├── views.py                 # request handlers
    ├── urls.py                  # per-app URLconf, included from mysite/urls.py
    ├── admin.py                 # admin registrations
    ├── apps.py, tests.py
    ├── migrations/              # generated, committed to git
    ├── templates/polls/         # inner `polls/` is **mandatory** namespace
    └── static/polls/            # same — collision-avoidance
```

Always prefer `python manage.py …` over `django-admin …` once the project exists. The inner `<app>/` directory under `templates/` and `static/` is **mandatory** — without it, two apps with `index.html` collide.

### settings.py essentials

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'polls.apps.PollsConfig',         # your apps go here
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',   # or postgresql / mysql / oracle
        'NAME': BASE_DIR / 'db.sqlite3',
    },
}

DEBUG = True                          # never True in production
ALLOWED_HOSTS = []                    # required when DEBUG = False
```

Single source of truth — anything that varies between environments lives here. Leaving `DEBUG=True` in prod leaks tracebacks and settings; `ALLOWED_HOSTS` is checked against the `Host` header to block host-header attacks.

## [chapter] Request cycle

## [card urls] URL routing keywords

| code | name | desc | detail |
|------|------|------|--------|
| `path(route, view, kwargs=None, name=None)` | dispatch entry | map a URL pattern to a view callable | `name=` is the symbolic name used by `reverse()` and `{% url %}`. Always set it; never hardcode URLs anywhere else. |
| `<int:question_id>` | converter capture | type-checked path segment, passed as a kwarg to the view | Built-ins: `str` (default, no slashes), `int`, `slug`, `uuid`, `path` (slashes allowed). Custom converters are possible but rarely needed. |
| `re_path(r"^…$", view)` | regex fallback | for patterns `path()` can't express | Reach for it only when you need a regex; `path()` covers ~all common cases more readably. |
| `include("polls.urls")` | mount sub-URLconf | delegate everything matching the prefix to another URLconf | `path("polls/", include("polls.urls"))` makes `polls.urls` handle everything starting with `/polls/`. |
| `app_name = "polls"` | namespace | declared at the top of an app's `urls.py` | Lets two apps both use `name="index"` without colliding. Address as `polls:index`, `polls:detail`, etc. |

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

## [card templates] DTL syntax

| code | name | desc | detail |
|------|------|------|--------|
| `{{ var }}` | variable | substitute a context value, HTML-escaped | Lookup order: dict key → attribute → list index. In `{% for %}` loops, methods are *called automatically* with no args (`q.choice_set.all` → runs `.all()`). |
| `{{ var\|filter:"arg" }}` | filter | transform the value (escape `\|` inside cells) | Useful filters: `default`, `length`, `upper`, `truncatechars`, `date:"Y-m-d"`, `safe`. Chain with multiple `\|`s. |
| `{% if %} … {% else %} … {% endif %}` | conditional | branch on truthiness | Combine with `and`, `or`, `not`, `in`. Comparison ops `==`, `!=`, `<`, etc. work. |
| `{% for x in xs %} … {% empty %} … {% endfor %}` | loop | iterate, with optional `empty` block when the iterable is falsy | Inside the loop you also get `forloop.counter`, `forloop.first`, `forloop.last`. |
| `{% url 'app:name' arg %}` | reverse URL | build a URL by name — never hardcode | Same lookup as Python's `reverse()`. Saves you from breaking templates when URL patterns change. |
| `{% csrf_token %}` | CSRF input | required inside every internal `<form method="post">` | Renders a hidden input with a per-session token. Django's CSRF middleware rejects POSTs without a valid token. |
| `{% extends "base.html" %}` / `{% block %}` | inheritance | child templates override named blocks of a parent | Parent declares `{% block content %}{% endblock %}`; child opens with `{% extends %}` then redefines blocks. |

> [warn] DTL auto-escapes by default. `{{ html\|safe }}` disables escaping for that variable — only use it on content you trust.

## [code templates-pattern] Inheritance & static assets

### template inheritance

```html
{# base.html — parent #}
<!DOCTYPE html>
<html>
  <head><title>{% block title %}Polls{% endblock %}</title></head>
  <body><main>{% block content %}{% endblock %}</main></body>
</html>

{# polls/index.html — child overrides blocks #}
{% extends "polls/base.html" %}
{% block title %}All questions{% endblock %}
{% block content %}
  <ul>{% for q in latest_question_list %}<li>{{ q }}</li>{% endfor %}</ul>
{% endblock %}
```

Parents define named blocks; children opt into the layout by extending. Single source of truth for `<head>`, navigation, footer.

### static assets & namespacing

```text
# polls/templates/polls/index.html — load + reference static
{% load static %}
<link rel="stylesheet" href="{% static 'polls/style.css' %}">

# directory layout — the inner polls/ is mandatory
polls/
├── templates/polls/index.html
└── static/polls/style.css
```

The inner `polls/` namespace folder is **mandatory** — without it, two apps with `index.html` or `style.css` collide. Inside CSS files, use *relative* paths (`url("images/bg.png")`) — there's no Django context inside CSS to resolve `{% static %}`.

## [chapter] ORM

## [card models] Fields & options

| code | name | desc | detail |
|------|------|------|--------|
| `CharField(max_length=200)` | text col | bounded string; `max_length` is required | Pair with `blank=True` for "empty allowed in forms" — distinct from `null=True` which is "allowed in DB". |
| `TextField`, `IntegerField`, `BooleanField`, `FloatField` | scalars | unbounded text / int / bool / float | `EmailField`, `URLField`, `SlugField` are `CharField` with format validation. |
| `DateField`, `DateTimeField`, `TimeField` | temporal | timezone-aware when `USE_TZ=True` (the default) | Pair with `default=timezone.now` (callable, no parens) or `auto_now`/`auto_now_add` for set-on-save behavior. |
| `FileField`, `ImageField` | uploads | needs `MEDIA_ROOT` + `MEDIA_URL` settings | `ImageField` requires Pillow. `upload_to=` controls the on-disk subpath. |
| `ForeignKey`, `ManyToManyField`, `OneToOneField` | relations | the three relationship field types | `ForeignKey` is many-to-one; `ManyToManyField` creates an implicit through-table; `OneToOneField` is a unique FK. M2M uses `add()`, `remove()`, `set()`, `clear()` on the manager. |
| `default=`, `null=`, `blank=`, `choices=`, `unique=` | options | per-field knobs | `default` is Python-side; `null` is DB-level; `blank` is form-level. `choices=[(stored, label), …]` renders a `<select>`. |

## [code models-skeleton] Model skeleton & `on_delete`

### `Question` / `Choice` with FK

```python
from django.db import models

class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published")

    def __str__(self):
        return self.question_text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)

    def __str__(self):
        return self.choice_text
```

Each subclass becomes one DB table; each `Field` attribute becomes a column. Always define `__str__` — `<Question: Question object (1)>` is rarely useful in the admin. `related_name="choices"` swaps the default `choice_set` reverse manager for the friendlier `question.choices`.

### `on_delete` policies

```python
on_delete=models.CASCADE       # delete the child rows when parent is deleted
on_delete=models.PROTECT       # raise ProtectedError — block the parent delete
on_delete=models.SET_NULL      # set the FK to NULL — requires null=True
on_delete=models.SET_DEFAULT   # set the FK to the field's default
on_delete=models.SET(get_user) # set to a callable's return value
on_delete=models.DO_NOTHING    # leave dangling FKs (you handle integrity)
```

`on_delete` is **required** on every `ForeignKey`. Picking carelessly leaves dangling rows or unwanted cascades. Default to `CASCADE` for "child cannot exist without parent"; `PROTECT` for "deleting the parent is a data-integrity error"; `SET_NULL` only when the relationship is genuinely optional.

## [code orm] Queries, lookups, atomic updates

### CRUD + chaining

```python
Question.objects.all()                                 # every row, lazily
Question.objects.get(pk=1)                             # exactly one or raises
Question.objects.filter(pub_date__year=2026)           # subset
Question.objects.filter(...).exclude(...).order_by("-pub_date")[:5]   # chain
Question.objects.create(question_text="…", pub_date=timezone.now())   # insert
q = Question.objects.get(pk=1); q.delete()             # delete
```

QuerySets are lazy — they don't hit the DB until iterated, sliced with a step, or coerced via `len()` / `bool()` / `list()`. Chain freely; the database query is built up and sent only when results are needed.

### lookups & relation traversal

```python
Question.objects.filter(pk=1)                                 # __exact (default)
Question.objects.filter(question_text__startswith="What")     # __startswith
Question.objects.filter(pub_date__year=2026)                  # __year
Choice.objects.filter(question__pub_date__year=2026)          # FK traversal
question.choices.all()                                        # reverse manager
```

`field__lookup` is the filter operator syntax — `__exact`, `__contains`, `__icontains`, `__startswith`, `__in`, `__gt`, `__gte`, `__year`, `__isnull`, etc. `field__related__field` walks foreign keys with the same dotted-double-underscore. The reverse manager (`choice_set` by default, or whatever `related_name` you set) gives you the same `.filter()` / `.create()` API on the parent.

### `F()` — atomic updates

```python
from django.db.models import F

selected.votes = F("votes") + 1
selected.save()
# emits: UPDATE polls_choice SET votes = votes + 1 WHERE id = …
```

Without `F()`, two concurrent voters both read `votes=0`, both write `votes=1`, and one increment is lost. With `F()`, Django emits `UPDATE … SET votes = votes + 1` and the database does the math atomically.

## [chapter] Batteries

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

## [card tests] Tests

| code | name | desc | detail |
|------|------|------|--------|
| `from django.test import TestCase` | base class | `unittest.TestCase` with DB isolation per test | Each test runs inside a transaction that's rolled back at teardown — tests can't leak state. |
| `def test_xxx(self)` | test method | name starts with `test_`; auto-discovered by the runner | One `TestCase` subclass per model/view; one method per condition. Descriptive names — when they fail, the name is the bug report. |
| `self.client.get(reverse("polls:index"))` | test Client | a fake browser bound to your URLconf | `self.client` auto-attached to `TestCase`. `.post(url, data)`, `.login(username=…, password=…)`, `.logout()`. |
| `response.status_code`, `.context`, `.content`, `.redirect_chain` | response handles | what the Client gives you back | `.context` exposes template context vars — assert against them, not the rendered HTML, when possible. |
| `assertEqual`, `assertIs`, `assertTrue`, `assertFalse` | unittest | basic equality / identity / truthiness | `assertIs` checks `is` (identity), not `==`. Useful for booleans and singletons. |
| `assertContains(response, text)` | response body contains | also asserts `status_code == 200` unless you pass `status_code=` | Inverse: `assertNotContains`. For exact 200 + body text, this is the one. |
| `assertRedirects(response, url)` / `assertTemplateUsed(response, "name.html")` | redirects + templates | response was a 30x to `url` / template was rendered | `assertRedirects` follows the redirect by default and checks the final response too. |
| `assertQuerySetEqual(qs, values)` | compare QuerySets | order-sensitive by default; pass `ordered=False` for set-equal | Useful for view tests that put a QuerySet in `response.context`. |
| `Model.objects.create(...)` in `setUp` or per test | fixtures | build test data programmatically; cheap because of rollback | Prefer this over JSON/YAML fixture files for unit-test data — easier to read, fewer moving parts. |
| `python manage.py test polls.tests.QuestionIndexViewTests.test_past_question` | targeted run | full test suite, one app, one class, one method | Test runner creates a temp DB (`test_<name>`), runs migrations, runs the tests, drops the DB. |

## [code tests-skeleton] `TestCase` skeleton

### a realistic test

```python
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
import datetime
from .models import Question

class QuestionIndexViewTests(TestCase):
    def setUp(self):
        Question.objects.create(
            question_text="Past question.",
            pub_date=timezone.now() - datetime.timedelta(days=30),
        )

    def test_past_question_appears(self):
        response = self.client.get(reverse("polls:index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Past question.")
```

Each test runs inside a transaction that rolls back at teardown — no fixture cleanup, no leaked state. `self.client` is a fake browser bound to your URLconf; it gives you `.status_code`, `.context`, `.content`, `.redirect_chain`. Build test data programmatically in `setUp` rather than YAML/JSON fixtures — easier to read, fewer moving parts.
