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

## [card urls] URL routing

| code | name | desc | detail |
|------|------|------|--------|
| `path(route, view, kwargs=None, name=None)` | dispatch entry | map a URL pattern to a view callable | `name=` is the symbolic name used by `reverse()` and `{% url %}`. Always set it; never hardcode URLs anywhere else. |
| `<int:question_id>` | converter capture | type-checked path segment, passed as a kwarg to the view | Built-ins: `str` (default, no slashes), `int`, `slug`, `uuid`, `path` (slashes allowed). Custom converters are possible but rarely needed. |
| `re_path(r"^…$", view)` | regex fallback | for patterns `path()` can't express | Reach for it only when you need a regex; `path()` covers ~all common cases more readably. |
| `include("polls.urls")` | mount sub-URLconf | delegate everything matching the prefix to another URLconf | `path("polls/", include("polls.urls"))` makes `polls.urls` handle everything starting with `/polls/`. |
| `app_name = "polls"` | namespace | declared at the top of an app's `urls.py` | Lets two apps both use `name="index"` without colliding. Address as `polls:index`, `polls:detail`, etc. |
| `{% url 'polls:detail' question.id %}` | template reverse | resolve a URL name back to a path | Pass positional args matching the captures. With `kwargs`, use `name=value` syntax: `{% url 'polls:detail' question_id=q.id %}`. |
| `reverse("polls:detail", args=(q.id,))` | Python reverse | build URLs in views/forms without hardcoding | Pair with `HttpResponseRedirect(reverse(...))` for the redirect-after-POST pattern. |
| `path("admin/", admin.site.urls)` | admin mount | the admin site's URLs | One of the few times you don't `include()` — `admin.site.urls` is already a URLconf. |

## [card views] Views — function & class-based

| code | name | desc | detail |
|------|------|------|--------|
| `def view(request, **kwargs) -> HttpResponse` | function view | Python callable returning an `HttpResponse` (or raising `Http404`) | URL captures arrive as keyword args. The minimum legal view is `return HttpResponse("hi")`. |
| `render(request, template, context)` | the shortcut | load template, render with context, wrap in `HttpResponse` | Replaces the verbose `loader.get_template(...).render(...)` + `HttpResponse(...)` dance. Pass `request` so context processors run. |
| `get_object_or_404(Model, pk=…)` | lookup or 404 | `Model.objects.get(...)` that raises `Http404` if missing | Sister: `get_list_or_404(Model, **filters)` raises `Http404` when the resulting list is empty. |
| `request.method == "POST"` | dispatch | branch GET vs POST inside one view | Canonical pattern: validate POST → save → `HttpResponseRedirect(reverse(...))`. Never render a template directly after a successful POST — back-button resubmits. |
| `request.POST.get("choice")` | form data | dict-like access to submitted fields, all values are strings | Use `.get()` over `request.POST["choice"]` to avoid `KeyError`. For uploads, use `request.FILES`. |
| `class IndexView(generic.ListView)` | CBV — list | `model = Question`, `template_name`, `context_object_name`, override `get_queryset()` | Wired in `urls.py` via `IndexView.as_view()`. Default context var is `<modelname>_list`; override with `context_object_name`. |
| `class DetailView(generic.DetailView)` | CBV — detail | `model = Question`, expects `<int:pk>` in the URL by default | Customize the URL kwarg with `pk_url_kwarg = "question_id"`. Default context var is the lowercase model name (`question`). |
| `path("<int:pk>/", DetailView.as_view(), name="detail")` | wiring CBVs | always call `.as_view()` when registering a class-based view | Forgetting `.as_view()` is the #1 Django CBV gotcha — Django will register the *class* and request handling will fail. |

> [tip] POST/Redirect/GET — every successful POST returns `HttpResponseRedirect(reverse(...))`. The browser then GETs the new URL, so refresh and back don't resubmit.

## [card templates] Template language & static files

| code | name | desc | detail |
|------|------|------|--------|
| `{{ var }}` | variable | substitute a context value, HTML-escaped | Lookup order: dict key → attribute → list index. In `{% for %}` loops, methods are *called automatically* with no args (`q.choice_set.all` → runs `.all()`). |
| `{{ var\|filter:"arg" }}` | filter | transform the value (escape `\|` inside cells) | Useful filters: `default`, `length`, `upper`, `truncatechars`, `date:"Y-m-d"`, `safe`. Chain with multiple `\|`s. |
| `{% if %} … {% else %} … {% endif %}` | conditional | branch on truthiness | Combine with `and`, `or`, `not`, `in`. Comparison ops `==`, `!=`, `<`, etc. work. |
| `{% for x in xs %} … {% empty %} … {% endfor %}` | loop | iterate, with optional `empty` block when the iterable is falsy | Inside the loop you also get `forloop.counter`, `forloop.first`, `forloop.last`. |
| `{% url 'app:name' arg %}` | reverse URL | build a URL by name — never hardcode | Same lookup as Python's `reverse()`. Saves you from breaking templates when URL patterns change. |
| `{% csrf_token %}` | CSRF input | required inside every internal `<form method="post">` | Renders a hidden input with a per-session token. Django's CSRF middleware rejects POSTs without a valid token. |
| `{% extends "base.html" %}` / `{% block %}` | inheritance | child templates override named blocks of a parent | Parent declares `{% block content %}{% endblock %}`; child opens with `{% extends %}` then redefines blocks. |
| `templates/<app>/<file>.html` | discovery | with `APP_DIRS: True`, Django auto-finds per-app templates | The inner `<app>/` namespace is mandatory — two apps with `index.html` would otherwise collide. Project-wide templates live in a directory listed under `TEMPLATES.DIRS`. |
| `{% load static %}` + `{% static 'app/style.css' %}` | static assets | resolve a static-file URL through `STATIC_URL` | Never concatenate `STATIC_URL` by hand. **Inside** static files (CSS), use *relative* paths (`url("images/bg.png")`) — there's no Django context inside CSS. |
| `staticfiles_dirs` per app | `app/static/<app>/` | parallel to templates, namespaced for the same reason | `runserver` serves them automatically. Production: `collectstatic` into `STATIC_ROOT`, served by nginx/S3/CDN. |

> [warn] DTL auto-escapes by default. `{{ html\|safe }}` disables escaping for that variable — only use it on content you trust.

## [chapter] ORM

## [card models] Models, fields, relations

| code | name | desc | detail |
|------|------|------|--------|
| `class Question(models.Model)` | model class | each subclass = one DB table | `Meta` inner class for table-level options (`ordering`, `verbose_name`, `db_table`, `unique_together`, indexes). |
| `def __str__(self)` | repr | what shows in the admin and `repr()` | Always define it; `<Question: Question object (1)>` is rarely what you want. |
| `CharField(max_length=200)` | text col | bounded string; `max_length` is required | Pair with `blank=True` for "empty allowed in forms" — distinct from `null=True` which is "allowed in DB". |
| `TextField`, `IntegerField`, `BooleanField`, `FloatField` | scalars | unbounded text / int / bool / float | `EmailField`, `URLField`, `SlugField` are `CharField` with format validation. |
| `DateField`, `DateTimeField`, `TimeField` | temporal | timezone-aware when `USE_TZ=True` (the default) | Pair with `default=timezone.now` (callable, no parens) or `auto_now`/`auto_now_add` for set-on-save behavior. |
| `FileField`, `ImageField` | uploads | needs `MEDIA_ROOT` + `MEDIA_URL` settings | `ImageField` requires Pillow. `upload_to=` controls the on-disk subpath. |
| `ForeignKey(Question, on_delete=…)` | many-to-one | foreign-key column; `on_delete` is **required** | Reverse manager `question.choice_set` (lowercase model + `_set`); rename with `related_name="choices"`. |
| `ManyToManyField`, `OneToOneField` | other rels | M2M creates an implicit through-table; O2O is a unique FK | M2M uses `add()`, `remove()`, `set()`, `clear()` on the manager. |
| `on_delete=models.CASCADE` | cascade | delete the child when the parent is deleted | Other policies: `PROTECT` (raise), `SET_NULL` (needs `null=True`), `SET_DEFAULT`, `SET(value)`, `DO_NOTHING`. Picking carelessly leaves dangling rows or unwanted deletions — choose deliberately. |
| `default=`, `null=`, `blank=`, `choices=`, `unique=` | options | per-field knobs | `default` is Python-side; `null` is DB-level; `blank` is form-level. `choices=[(stored, label), …]` renders a `<select>`. |

## [card orm] Queries, lookups, migrations

| code | name | desc | detail |
|------|------|------|--------|
| `Question.objects.all()` | every row | a lazy `QuerySet` | QuerySets don't hit the DB until iterated, sliced with a step, or evaluated with `len()`/`bool()`/`list()`. Chainable. |
| `.get(**lookups)` | exactly one | returns the single row or raises `DoesNotExist` / `MultipleObjectsReturned` | Use `get_object_or_404()` in views to get a clean 404 instead. |
| `.filter(**lookups)` / `.exclude(**lookups)` | subset | narrow / negate | Both return QuerySets; chain freely (`.filter(...).exclude(...).order_by(...)`). |
| `.create(**fields)` | insert | shortcut for `Model(**fields)` then `.save()` | Returns the saved instance. For bulk inserts, use `Model.objects.bulk_create([...])`. |
| `field__lookup` | filter operators | `__exact`, `__iexact`, `__contains`, `__icontains`, `__startswith`, `__in`, `__gt`, `__gte`, `__lt`, `__lte`, `__range`, `__year`, `__isnull` | Default is `exact`, so `filter(pk=1)` and `filter(pk__exact=1)` are equivalent. |
| `field__related__field` | traverse FKs | dotted-with-double-underscore for relation walks | `Choice.objects.filter(question__pub_date__year=2026)` — span any number of FKs. |
| `.order_by("-pub_date")[:5]` | sort + slice | `-` for descending; slicing is implemented as `LIMIT`/`OFFSET` | Slicing forces evaluation of that range, but the result is still a QuerySet you can iterate or further constrain (until you slice with a step). |
| `q.choice_set.all()` / `.create(...)` | reverse manager | the FK's reverse name on the parent | `related_name="choices"` swaps `choice_set` → `choices`. Same API: `.all()`, `.filter()`, `.create()`, `.count()`. |
| `from django.db.models import F; obj.votes = F("votes") + 1; obj.save()` | atomic update | the increment runs at the database, not in Python | Without `F()`, two concurrent requests both read `votes=0`, both write `votes=1`, and one increment is lost. With `F()` the DB does `UPDATE … SET votes = votes + 1`. |
| `makemigrations → sqlmigrate → migrate` | schema workflow | generate diffs → preview SQL → apply | Migration files are committed and travel with the app. Django records applied migrations in the `django_migrations` table; safe to re-run. |

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
