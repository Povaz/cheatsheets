## [card urls] URL routing keywords

| code | name | desc | detail |
|------|------|------|--------|
| `path(route, view, kwargs=None, name=None)` | dispatch entry | map a URL pattern to a view callable | `name=` is the symbolic name used by `reverse()` and `{% url %}`. Always set it; never hardcode URLs anywhere else. |
| `<int:question_id>` | converter capture | type-checked path segment, passed as a kwarg to the view | Built-ins: `str` (default, no slashes), `int`, `slug`, `uuid`, `path` (slashes allowed). Custom converters are possible but rarely needed. |
| `re_path(r"^…$", view)` | regex fallback | for patterns `path()` can't express | Reach for it only when you need a regex; `path()` covers ~all common cases more readably. |
| `include("polls.urls")` | mount sub-URLconf | delegate everything matching the prefix to another URLconf | `path("polls/", include("polls.urls"))` makes `polls.urls` handle everything starting with `/polls/`. |
| `app_name = "polls"` | namespace | declared at the top of an app's `urls.py` | Lets two apps both use `name="index"` without colliding. Address as `polls:index`, `polls:detail`, etc. |