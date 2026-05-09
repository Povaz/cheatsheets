## [card templates] DTL syntax

| code | desc | detail |
|------|------|--------|
| `{{ var }}` | variable — substitute a context value, HTML-escaped | Lookup order: dict key → attribute → list index. In `{% for %}` loops, methods are *called automatically* with no args (`q.choice_set.all` → runs `.all()`). |
| `{{ var\|filter:"arg" }}` | filter — transform the value (escape `\|` inside cells) | Useful filters: `default`, `length`, `upper`, `truncatechars`, `date:"Y-m-d"`, `safe`. Chain with multiple `\|`s. |
| `{% if %} … {% else %} … {% endif %}` | conditional — branch on truthiness | Combine with `and`, `or`, `not`, `in`. Comparison ops `==`, `!=`, `<`, etc. work. |
| `{% for x in xs %} … {% empty %} … {% endfor %}` | loop — iterate, with optional `empty` block when the iterable is falsy | Inside the loop you also get `forloop.counter`, `forloop.first`, `forloop.last`. |
| `{% url 'app:name' arg %}` | reverse URL — build a URL by name — never hardcode | Same lookup as Python's `reverse()`. Saves you from breaking templates when URL patterns change. |
| `{% csrf_token %}` | CSRF input — required inside every internal `<form method="post">` | Renders a hidden input with a per-session token. Django's CSRF middleware rejects POSTs without a valid token. |
| `{% extends "base.html" %}` / `{% block %}` | inheritance — child templates override named blocks of a parent | Parent declares `{% block content %}{% endblock %}`; child opens with `{% extends %}` then redefines blocks. |

> [warn] DTL auto-escapes by default. `{{ html\|safe }}` disables escaping for that variable — only use it on content you trust.