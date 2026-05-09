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