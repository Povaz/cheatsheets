## [code project-anatomy] Project anatomy
Running `django-admin startproject mysite <folder>` and `python manage.py startapp polls` creates the following directory structure:
```text projects structure
mysite/
├── manage.py       # Command-line utility that lets you interact with this Django project.
├── mysite/         # Project Python package used to import anything inside it.
│   ├── settings.py # Settings/configuration - DB, apps, middleware, templates, static
│   ├── urls.py          # Root URLconf — site's table of contents
│   ├── asgi.py          # Entry-point for ASGI-comp. web servers to serve your project.
│   └── wsgi.py          # Entry-point for WSGI-comp. web servers to serve your project.
└── polls/                       # an app — `python manage.py startapp polls`
    ├── models.py                # ORM classes — one class = one table
    ├── views.py                 # request handlers
    ├── urls.py                  # per-app URLconf, included from mysite/urls.py
    ├── admin.py                 # admin registrations
    ├── apps.py                  # AppConfig — app label, ready() hook
    ├── tests.py                 # test discovery starts here
    ├── migrations/              # generated, committed to git
    ├── templates/polls/         # inner `polls/` is **mandatory** namespace
    └── static/polls/            # same — collision-avoidance
```

`manage.py` wraps `django-admin` with `DJANGO_SETTINGS_MODULE` already set — prefer it for every command after `startproject`. The inner `polls/` under `templates/` and `static/` is a **namespace folder** — without it, identically-named files from different apps shadow each other.