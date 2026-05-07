# Reference: Django Basics

Consolidated from the official Django 6.0 tutorial, parts 1–8 (`https://docs.djangoproject.com/en/6.0/intro/tutorial01/` … `tutorial08/`). The tutorial is organized as a polls walkthrough; this Reference is reorganized by *concept* — what a new Django developer needs to retain to be productive — and the polls examples are kept only where they make a signature concrete. The audience is a developer adopting Django for the first time.

## Project anatomy

A **project** is the configuration and collection of apps that make up one website. An **app** is a self-contained module that does one thing (a blog, a poll, a payments integration). One project can contain many apps; one app can be reused across projects.

A fresh project is created with:

```
django-admin startproject mysite [target_dir]
```

This produces:

```
mysite/
├── manage.py              # CLI entrypoint — every command goes through this
└── mysite/                # the project's Python package
    ├── __init__.py        # marks the directory as a Python package
    ├── settings.py        # all configuration (database, apps, middleware, templates, …)
    ├── urls.py            # root URL dispatcher — the "table of contents"
    ├── asgi.py            # ASGI entry point for async-capable servers
    └── wsgi.py            # WSGI entry point for traditional servers
```

`manage.py` is `django-admin` aware of `DJANGO_SETTINGS_MODULE` for this project. **Always use `python manage.py …` once the project exists**; reserve bare `django-admin` for `startproject`.

A new app inside a project:

```
python manage.py startapp polls
```

App skeleton:

```
polls/
├── __init__.py
├── admin.py              # admin registrations and ModelAdmin classes
├── apps.py               # app config (e.g. PollsConfig)
├── migrations/           # auto-generated schema diffs
├── models.py             # ORM models
├── tests.py              # tests for this app
└── views.py              # request handlers
```

You typically add `urls.py` and a `templates/<app>/` directory by hand.

The development server:

```
python manage.py runserver           # default 127.0.0.1:8000
python manage.py runserver 8080      # alternate port
python manage.py runserver 0:8000    # bind all interfaces
```

The dev server **auto-reloads** on Python source changes. It is **not for production**.

## settings.py essentials

`mysite/settings.py` is the single source of truth for project configuration. Key settings a new developer touches:

- **`INSTALLED_APPS`** — list of active Django apps. Defaults bundle `django.contrib.admin`, `django.contrib.auth`, `django.contrib.contenttypes`, `django.contrib.sessions`, `django.contrib.messages`, `django.contrib.staticfiles`. Add your own apps (`'polls.apps.PollsConfig'` or just `'polls'`) **and** any third-party apps here.
- **`DATABASES`** — the default backend is SQLite:

  ```python
  DATABASES = {
      "default": {
          "ENGINE": "django.db.backends.sqlite3",
          "NAME": BASE_DIR / "db.sqlite3",
      }
  }
  ```

  `ENGINE` options: `django.db.backends.sqlite3`, `django.db.backends.postgresql`, `django.db.backends.mysql`, `django.db.backends.oracle`.
- **`MIDDLEWARE`** — ordered list of request/response processors. Order matters.
- **`TEMPLATES`** — backend config; `APP_DIRS: True` makes Django auto-discover templates under each app's `templates/<app>/` directory.
- **`STATIC_URL`** — base URL prefix for static asset URLs (e.g. `"static/"`).
- **`TIME_ZONE`** — IANA timezone string. Defaults to `"America/Chicago"` historically; set to your zone.
- **`DEBUG`** — `True` in dev, **must** be `False` in production.
- **`ALLOWED_HOSTS`** — required when `DEBUG=False`; list of hostnames the site will serve.
- **`INTERNAL_IPS`** — IPs treated as "internal"; consulted by debug-only middleware (e.g. Debug Toolbar).

## URL routing

URLconfs are Python modules listing `urlpatterns`, a list of `path()` (and optional `re_path()`) entries. The root URLconf is `mysite/urls.py`; per-app URLconfs are conventionally `polls/urls.py`.

`path()` signature:

```python
path(route, view, kwargs=None, name=None)
```

- **`route`** — string pattern, possibly containing `<converter:name>` capture groups.
- **`view`** — view callable (function, or `View.as_view()` for class-based).
- **`kwargs`** — extra keyword args injected into the view.
- **`name`** — symbolic name used by `reverse()` and `{% url %}`.

Built-in path converters:

| Converter | Matches |
|-----------|---------|
| `str`     | any non-empty string excluding `/` (default) |
| `int`     | zero or positive integer, captured as `int` |
| `slug`    | ASCII letters/digits/hyphens/underscores |
| `uuid`    | UUID, captured as `uuid.UUID` |
| `path`    | any non-empty string including `/` |

For complex patterns use `re_path()` with a regex:

```python
re_path(r"^articles/(?P<year>[0-9]{4})/$", views.year_archive)
```

### `include()` and namespacing

Mount a per-app URLconf under a prefix:

```python
# mysite/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("polls/", include("polls.urls")),
    path("admin/", admin.site.urls),
]
```

Per-app URLconf with a namespace:

```python
# polls/urls.py
from django.urls import path
from . import views

app_name = "polls"
urlpatterns = [
    path("", views.index, name="index"),
    path("<int:question_id>/", views.detail, name="detail"),
    path("<int:question_id>/results/", views.results, name="results"),
    path("<int:question_id>/vote/", views.vote, name="vote"),
]
```

`app_name = "polls"` makes URL names addressable as `polls:index`, `polls:detail`, etc. Without a namespace, two apps that both define `name="index"` collide.

### Reversing URLs

Never hardcode URLs. Use:

- In templates: `{% url 'polls:detail' question.id %}`
- In Python: `from django.urls import reverse; reverse("polls:detail", args=(q.id,))`

This way, changing a URL pattern only requires touching `urls.py`.

## Views

A view is a callable taking `HttpRequest` and returning `HttpResponse` (or raising `Http404`).

### Function-based views

Minimal view:

```python
from django.http import HttpResponse

def index(request):
    return HttpResponse("Hello, world.")
```

Idiomatic view using the `render()` shortcut:

```python
from django.shortcuts import render
from .models import Question

def index(request):
    latest_question_list = Question.objects.order_by("-pub_date")[:5]
    context = {"latest_question_list": latest_question_list}
    return render(request, "polls/index.html", context)
```

`render()` signature:

```python
render(request, template_name, context=None, content_type=None, status=None, charset=None, using=None)
```

It loads the template, renders it with the context (and the request, so context processors run), and wraps the result in `HttpResponse`.

### 404s

Raise `Http404` for missing objects, or use shortcuts:

```python
from django.shortcuts import get_object_or_404, get_list_or_404

question = get_object_or_404(Question, pk=question_id)        # raises Http404 if missing
questions = get_list_or_404(Question, pub_date__year=2026)    # raises Http404 if empty
```

### Class-based generic views

Replace boilerplate-heavy function views. The two most-used:

```python
from django.views import generic
from .models import Question

class IndexView(generic.ListView):
    template_name = "polls/index.html"
    context_object_name = "latest_question_list"

    def get_queryset(self):
        return Question.objects.order_by("-pub_date")[:5]

class DetailView(generic.DetailView):
    model = Question
    template_name = "polls/detail.html"
```

Wired in `urls.py` via `.as_view()`:

```python
path("", views.IndexView.as_view(), name="index"),
path("<int:pk>/", views.DetailView.as_view(), name="detail"),
```

`DetailView` expects the URL to capture `pk` by default; override with `pk_url_kwarg = "question_id"` if your URL uses a different name.

`ListView`'s default context variable is `<modelname>_list`; override with `context_object_name`.
`DetailView`'s default context variable is the lowercase model name (e.g. `question`).

Both auto-discover templates at `<app>/<modelname>_list.html` and `<app>/<modelname>_detail.html` when `template_name` is omitted.

Override `get_queryset()` to filter, slice, or sort what the view shows.

## Models and the ORM

A model is a subclass of `django.db.models.Model`. Each class attribute that's a `Field` becomes a column.

```python
from django.db import models

class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published")

    def __str__(self):
        return self.question_text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)

    def __str__(self):
        return self.choice_text
```

`__str__()` is what the admin and `repr` use — always define it.

### Common field types

| Field           | Notes |
|-----------------|-------|
| `CharField`     | requires `max_length` |
| `TextField`     | unlimited length |
| `IntegerField`  | int |
| `FloatField`    | float |
| `BooleanField`  | bool |
| `DateField` / `DateTimeField` / `TimeField` | dates and times (timezone-aware when `USE_TZ=True`) |
| `EmailField`, `URLField`, `SlugField` | `CharField` with format validation |
| `FileField`, `ImageField` | uploads (require `MEDIA_ROOT`/`MEDIA_URL`) |
| `ForeignKey`    | many-to-one; **requires** `on_delete=…` |
| `ManyToManyField` | many-to-many |
| `OneToOneField` | one-to-one |

### Field options

- The first positional string is the *verbose name* (human-readable label, used in admin and forms): `pub_date = models.DateTimeField("date published")`.
- `max_length=N` — required for `CharField`.
- `default=value` — default at the Python level.
- `null=True` — allow `NULL` in the DB.
- `blank=True` — allow empty in forms (separate from `null`).
- `choices=…` — a sequence of `(stored_value, display_label)` tuples, surfaces as a `<select>` in forms and admin.
- `unique=True` — enforce DB-level uniqueness.

### `ForeignKey` and `on_delete`

`on_delete` is required and controls cascade behavior:

| Policy             | Effect when the parent is deleted |
|--------------------|-----------------------------------|
| `models.CASCADE`   | delete the child too |
| `models.PROTECT`   | raise `ProtectedError` |
| `models.SET_NULL`  | set FK to `NULL` (requires `null=True`) |
| `models.SET_DEFAULT` | set FK to its default |
| `models.SET(...)`  | set FK to value/callable |
| `models.DO_NOTHING` | skip — DB integrity becomes your problem |

### The Model API (QuerySets)

Access via the default manager `.objects`:

```python
Question.objects.all()                              # QuerySet of every Question
Question.objects.get(pk=1)                          # single object; DoesNotExist if missing
Question.objects.filter(question_text__startswith="What")
Question.objects.exclude(pub_date__year=2020)
Question.objects.order_by("-pub_date")[:5]
Question.objects.create(question_text="Q?", pub_date=timezone.now())
```

Save / update / delete via instance methods:

```python
q = Question(question_text="Q?", pub_date=timezone.now())
q.save()
q.question_text = "Q??"
q.save()
q.delete()
```

QuerySets are **lazy** — they don't hit the database until iterated, sliced with a step, or evaluated by `len()`, `bool()`, etc.

### Field lookups

Filter operators use `field__lookup` syntax:

| Lookup | Meaning |
|--------|---------|
| `exact` (default), `iexact` | equality (case-sensitive / -insensitive) |
| `contains`, `icontains` | substring |
| `startswith`, `endswith` (and `i*`) | prefix/suffix |
| `in` | membership: `pk__in=[1,2,3]` |
| `gt`, `gte`, `lt`, `lte` | numeric/date comparisons |
| `range` | between two values |
| `year`, `month`, `day`, `week_day` | date components |
| `isnull` | `True`/`False` |

Traverse relationships with `__`:

```python
Choice.objects.filter(question__pub_date__year=2026)
```

### Reverse relations

A `ForeignKey` from `Choice` to `Question` gives `Question` a reverse manager named `choice_set` (lowercase model + `_set`):

```python
q = Question.objects.get(pk=1)
q.choice_set.all()
q.choice_set.create(choice_text="Yes", votes=0)
q.choice_set.count()
```

Customize the name with `related_name="choices"` on the FK.

### `F()` expressions for atomic updates

To increment a counter atomically (no read-modify-write race):

```python
from django.db.models import F

choice.votes = F("votes") + 1
choice.save()
```

The `+ 1` happens at the database, not in Python.

## Migrations

Migrations are versioned schema diffs Django generates from your models.

```
python manage.py makemigrations [app]    # generate migration files from model changes
python manage.py sqlmigrate app 0001     # show the SQL the migration will run (read-only)
python manage.py migrate                 # apply unapplied migrations
python manage.py migrate app 0001        # roll forward/back to a specific migration
python manage.py check                   # static project sanity checks
```

Workflow loop: change models → `makemigrations` → review (`sqlmigrate`) → `migrate`. Migration files are committed to source control and travel with the app; Django records applied migrations in the `django_migrations` table.

The first migrate after `startproject` creates tables for the bundled apps (admin, auth, contenttypes, sessions, …).

## Templates

The Django Template Language (DTL) is plain text with three special constructs:

```
{{ variable }}                  variable substitution
{{ var|filter:"arg" }}          filter pipeline
{% tag %} … {% endtag %}        tag (control flow, includes, etc.)
```

### Variables and lookups

`{{ question.choice_set.all }}` resolves by trying, in order: dictionary key, attribute, list index. Method calls take **no arguments** in templates and happen automatically (`question.choice_set.all` runs `.all()`).

### Built-in tags

```django
{% if latest_question_list %} … {% else %} … {% endif %}
{% for choice in question.choice_set.all %} … {% empty %} … {% endfor %}
{% url 'polls:detail' question.id %}
{% csrf_token %}
{% include "polls/_card.html" %}
{% extends "base.html" %}
{% block content %} … {% endblock %}
{% load static %}
```

### Built-in filters

`{{ value|default:"—" }}`, `{{ name|upper }}`, `{{ when|date:"Y-m-d" }}`, `{{ text|truncatechars:80 }}`, `{{ value|length }}`, `{{ html|safe }}`, etc.

### Where templates live

With `APP_DIRS: True` (the default), Django auto-discovers templates under each app's `templates/` directory. Always **namespace** with a per-app subdirectory to avoid collisions:

```
polls/
└── templates/
    └── polls/
        ├── index.html
        └── detail.html
```

Reference from views as `"polls/index.html"`. Project-wide templates can live in a `templates/` directory listed in the `DIRS` of `TEMPLATES`.

### Auto-escaping and CSRF

DTL HTML-escapes variables by default. Disable per-variable with `|safe` (only for content you trust). Every internal POST form **must** include `{% csrf_token %}` inside the `<form>`; Django's CSRF middleware rejects POSTs without a valid token, defending against cross-site request forgery.

## Forms and POST handling

A function view that handles both GET and POST:

```python
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.db.models import F
from .models import Choice, Question

def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    if request.method == "POST":
        try:
            selected = question.choice_set.get(pk=request.POST["choice"])
        except (KeyError, Choice.DoesNotExist):
            return render(request, "polls/detail.html", {
                "question": question,
                "error_message": "You didn't select a choice.",
            })
        selected.votes = F("votes") + 1
        selected.save()
        return HttpResponseRedirect(reverse("polls:results", args=(question.id,)))
    return render(request, "polls/detail.html", {"question": question})
```

Key points:

- **`request.POST`** is a dict-like of submitted form values; values are always strings.
- Use `request.POST.get("key")` to avoid `KeyError` for optional fields.
- **Always redirect after a successful POST** (POST/Redirect/GET) so the back button doesn't resubmit.
- `reverse(name, args=(...,))` builds the redirect URL from the URL name.
- **Use `F()`** for counters/aggregates to avoid lost-update races.
- The matching template's `<form method="post">` must contain `{% csrf_token %}`.

## Static files

`django.contrib.staticfiles` (in `INSTALLED_APPS` by default) collects static assets from each app and serves them in development.

Layout, parallel to templates — namespaced per app:

```
polls/
└── static/
    └── polls/
        ├── style.css
        └── images/
            └── background.png
```

In templates:

```django
{% load static %}
<link rel="stylesheet" href="{% static 'polls/style.css' %}">
<img src="{% static 'polls/images/background.png' %}">
```

Never concatenate `STATIC_URL` by hand; the `{% static %}` tag does it correctly and stays right when `STATIC_URL` changes. **Inside a static file** (e.g. CSS), use *relative* paths: `background: url("images/background.png");` — no Django context inside CSS.

For production, run:

```
python manage.py collectstatic
```

This gathers files from every app's `static/` into `STATIC_ROOT` for a real web server (nginx, S3, CDN) to serve.

## The admin site

Django's admin auto-generates a CRUD UI for any registered model.

### Setup

1. `django.contrib.admin` is in `INSTALLED_APPS` by default.
2. Create a superuser:

   ```
   python manage.py createsuperuser
   ```

   Prompts for username, email, password.
3. Visit `/admin/`.

### Registering a model

Either of:

```python
# polls/admin.py
from django.contrib import admin
from .models import Question

admin.site.register(Question)
```

```python
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    pass
```

### `ModelAdmin` options

```python
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["question_text", "pub_date", "was_published_recently"]
    list_filter = ["pub_date"]
    search_fields = ["question_text"]
    date_hierarchy = "pub_date"
    ordering = ["-pub_date"]

    fieldsets = [
        (None, {"fields": ["question_text"]}),
        ("Date information", {"fields": ["pub_date"], "classes": ["collapse"]}),
    ]
```

| Option              | Purpose |
|---------------------|---------|
| `list_display`      | columns on the change-list page (field names, callables, or admin methods) |
| `list_filter`       | sidebar filters |
| `search_fields`     | search bar (uses `LIKE`) |
| `date_hierarchy`    | date drilldown bar |
| `ordering`          | default sort |
| `fields`            | flat list of fields on the edit form |
| `fieldsets`         | grouped sections; `"classes": ["collapse"]` makes a section collapsible |
| `prepopulated_fields` | auto-fill (e.g. slug from title) |
| `readonly_fields`   | display-only |

### Inlines

Edit related objects on the parent's edit page:

```python
class ChoiceInline(admin.TabularInline):   # or admin.StackedInline
    model = Choice
    extra = 3

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    inlines = [ChoiceInline]
```

`TabularInline` is a compact table; `StackedInline` is a stacked form. `extra` is the number of empty rows shown.

### `@admin.display` decorator

Annotate a model method or admin callable so it works as a column:

```python
@admin.display(
    boolean=True,
    ordering="pub_date",
    description="Published recently?",
)
def was_published_recently(self):
    now = timezone.now()
    return now - datetime.timedelta(days=1) <= self.pub_date <= now
```

- `boolean=True` — render as a tick/cross icon.
- `ordering="field"` — make the column sortable by that DB field.
- `description="…"` — column header label.

### Branding

```python
admin.site.site_header = "My Site Administration"
admin.site.site_title = "My Admin"
admin.site.index_title = "Dashboard"
```

## Testing

Django's testing framework wraps `unittest` with database isolation. Each `TestCase` runs in a transaction that's rolled back at the end of the test, so tests don't leak state.

### Where tests live

Each app's `tests.py` (or any `tests/` package with files starting `test_`). Discovery is automatic.

### Writing tests

```python
import datetime
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from .models import Question

def create_question(text, days):
    return Question.objects.create(
        question_text=text,
        pub_date=timezone.now() + datetime.timedelta(days=days),
    )

class QuestionModelTests(TestCase):
    def test_was_published_recently_with_future_question(self):
        future = Question(pub_date=timezone.now() + datetime.timedelta(days=30))
        self.assertIs(future.was_published_recently(), False)

class QuestionIndexViewTests(TestCase):
    def test_no_questions(self):
        response = self.client.get(reverse("polls:index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No polls are available.")
        self.assertQuerySetEqual(response.context["latest_question_list"], [])

    def test_past_question(self):
        q = create_question("Past.", days=-1)
        response = self.client.get(reverse("polls:index"))
        self.assertQuerySetEqual(response.context["latest_question_list"], [q])
```

### Common assertions

| Assertion | Checks |
|-----------|--------|
| `assertEqual(a, b)` | `a == b` |
| `assertIs(a, b)` | `a is b` |
| `assertTrue(x)` / `assertFalse(x)` | truthiness |
| `assertContains(response, text)` | response body contains `text` and status is 200 |
| `assertNotContains(response, text)` | inverse |
| `assertRedirects(response, url)` | response is a 30x to `url` |
| `assertQuerySetEqual(qs, values)` | QuerySet matches expected list |
| `assertTemplateUsed(response, name)` | template was rendered |

### The test Client

`self.client` (auto-attached on `TestCase`) is a fake browser:

```python
response = self.client.get(reverse("polls:index"))
response = self.client.post(reverse("polls:vote", args=(q.id,)), {"choice": choice.id})
self.client.login(username="u", password="p")
```

`response.status_code`, `response.context`, `response.content`, `response.redirect_chain` — the usual handles.

### Fixtures

Build test data programmatically in `setUp()` or per-test, using `Model.objects.create(...)`. Each test starts with a clean DB, so creation is cheap.

### Running tests

```
python manage.py test                # whole project
python manage.py test polls          # one app
python manage.py test polls.tests.QuestionIndexViewTests.test_past_question
```

Test runs create a temporary database (e.g. `test_db.sqlite3`) and tear it down afterward.

## Third-party packages

Django's ecosystem is large; reusable apps cover admin themes, REST/GraphQL, auth, debugging, forms, and more.

- **Discovery:** [djangopackages.org](https://djangopackages.org/) (curated metadata) and PyPI.
- **General install pattern**, applies to most third-party Django apps:

  1. `python -m pip install <package>`
  2. Add the package's app to `INSTALLED_APPS`.
  3. Adjust `settings.py` (middleware, configuration keys).
  4. Wire URLs in `urls.py` if needed.
  5. `python manage.py migrate` if the package ships models.

### Canonical example: `django-debug-toolbar`

```
python -m pip install django-debug-toolbar
```

```python
# settings.py
INSTALLED_APPS = [
    ...,
    "debug_toolbar",
]

MIDDLEWARE = [
    ...,
    "debug_toolbar.middleware.DebugToolbarMiddleware",
]

INTERNAL_IPS = ["127.0.0.1"]
```

```python
# urls.py
urlpatterns = [
    path("__debug__/", include("debug_toolbar.urls")),
    ...,
]
```

The toolbar appears only when `DEBUG=True` and the request comes from an `INTERNAL_IPS` address.

## `manage.py` command reference

The most-used commands a new developer runs daily:

| Command                                | Purpose |
|----------------------------------------|---------|
| `runserver [addr:port]`                | dev server with auto-reload |
| `startapp <name>`                      | create a new app skeleton |
| `makemigrations [app]`                 | generate migration files from model changes |
| `migrate [app [migration]]`            | apply (or roll back to) migrations |
| `sqlmigrate app migration`             | print the SQL a migration would run |
| `showmigrations`                       | list migration status |
| `shell`                                | Python REPL with Django settings loaded |
| `dbshell`                              | DB-native shell for the configured DB |
| `createsuperuser`                      | create an admin user |
| `changepassword <user>`                | reset a user's password |
| `collectstatic`                        | gather static files for production |
| `test [path]`                          | run the test suite |
| `check`                                | run static project checks |
| `loaddata <fixture>` / `dumpdata`      | load/dump data fixtures (JSON/YAML) |

`django-admin` and `python manage.py` accept the same commands; inside a project, prefer `manage.py` so the right settings are used.
