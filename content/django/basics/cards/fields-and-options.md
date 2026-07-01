## [table fields-and-options] Fields & options

| code                                                      | desc | detail |
|-----------------------------------------------------------|------|--------|
| `CharField(max_length=200)`                               | text col — bounded string; `max_length` is required | Pair with `blank=True` for "empty allowed in forms" — distinct from `null=True` which is "allowed in DB". |
| `TextField`, `IntegerField`, `BooleanField`, `FloatField` | scalars — unbounded text / int / bool / float | `EmailField`, `URLField`, `SlugField` are `CharField` with format validation. |
| `DateField`, `DateTimeField`, `TimeField`                 | temporal — timezone-aware when `USE_TZ=True` (the default) | Pair with `default=timezone.now` (callable, no parens) or `auto_now`/`auto_now_add` for set-on-save behavior. |
| `FileField`, `ImageField`                                 | uploads — needs `MEDIA_ROOT` + `MEDIA_URL` settings | `ImageField` requires Pillow. `upload_to=` controls the on-disk subpath. |
| `ForeignKey`, `ManyToManyField`, `OneToOneField`          | relations — the three relationship field types | `ForeignKey` is many-to-one; `ManyToManyField` creates an implicit through-table; `OneToOneField` is a unique FK. M2M uses `add()`, `remove()`, `set()`, `clear()` on the manager. |
| `default=`, `null=`, `blank=`, `choices=`, `unique=`      | options — per-field knobs | `default` is Python-side; `null` is DB-level; `blank` is form-level. `choices=[(stored, label), …]` renders a `<select>`. |
