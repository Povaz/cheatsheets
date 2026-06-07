## [code settings-py-essentials] settings.py essentials

```python settings.py
INSTALLED_APPS = [
    'django.contrib.admin',         # admin site
    'django.contrib.auth',          # authentication system
    'django.contrib.contenttypes',  # content type framework
    'django.contrib.sessions',      # session framework
    'django.contrib.messages',      # messaging framework
    'django.contrib.staticfiles',   # static files framework
    'polls.apps.PollsConfig',       # your apps
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    },
    # -------------------------------------------
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mysite',
        'USER': 'mysite',
        'PASSWORD': '…',
        'HOST': 'localhost',   # '' = Unix socket (peer auth)
        'PORT': '5432',        # '' = default
    },
}

DEBUG = True                   # never True in production
ALLOWED_HOSTS = []             # required when DEBUG = False
```

Single source of truth — anything that varies between environments lives here. Leaving `DEBUG=True` in prod leaks tracebacks and settings; `ALLOWED_HOSTS` is checked against the `Host` header to block host-header attacks.