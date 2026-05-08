# Annotated `[code]` cards — design spec

**Date**: 2026-05-08
**Branch**: `worktree-django-code-cards-brainstorm`
**Motivation**: The Django Basics Sheet is a strict-coding topic. Several cards (notably `[card project] Project, app, settings`) describe content whose real mental model is structural code — a project tree, a `settings.py` excerpt — but currently render as flat tables of paths. A captioned-code section type makes the *shape* the memory anchor.

## Decisions locked in during brainstorming

| Decision | Choice |
|---|---|
| Coupling model | Snippet + caption blocks (heading → fence → caption) |
| Section type | **Extend** the existing `[code]` type — no new type identifier |
| Scope | Format + parser + renderer + convert ONE card (`[card project]`) |
| Backward compatibility | A `[code]` section with zero `###` headings parses and renders identically to today |
| Syntax highlighting | Out of scope (already deferred by `CONTENT_FORMAT.md`) |
| Search | Captions are not searchable in v1 — `[code]` is not searchable today either |
| Dependencies | None added |

## 1. Format extension (`docs/CONTENT_FORMAT.md`)

The existing `[code]` section grows two **optional** enhancements. Inside a `[code]` section, the body is parsed as a sequence of **blocks**. Each block is:

- An optional `### sub-heading` (Markdown H3) — the block's title.
- A required fenced code block (` ```lang … ``` `).
- An optional **caption** — paragraphs of prose immediately after the closing fence, ending at the next `###` or end of section.

**Backward compat (load-bearing)**: if a `[code]` section contains zero `###` headings, parsing falls through to today's behaviour — each fence is one un-titled block, no captions. Every existing `[code]` section keeps rendering identically. New annotated sections opt in by introducing the first `###`.

**Caption rules**:
- Same inline Markdown as `text` items / table cells: `**bold**`, `*em*`, `` `code` ``, `[links](url)`. Nothing else — no bullets, no headings.
- Multi-paragraph captions allowed; blank lines separate paragraphs.
- A caption attaches to the **preceding** fence. A `### heading` not followed by a fence is malformed; the parser warns (`console.warn`) and drops the heading.

**Callouts** (`> [tip]`, `> [warn]`) keep attaching at section level, not per-block. They render below all blocks, same position as today.

**Author guidance** added to the spec:
- Aim for **2–3 captioned blocks per annotated `[code]` card**, snippets ≤ ~10 lines each.
- Captioned-code cards belong in `{type: vertical}` chapters — code does not wrap inside masonry columns.

**Spec example added** to the `code` subsection of `CONTENT_FORMAT.md`:

```markdown
## [code project] Project anatomy

### project tree

​```text
mysite/
├── manage.py    # CLI wrapper that knows DJANGO_SETTINGS_MODULE
└── polls/       # an app
​```

Always prefer `python manage.py …` over `django-admin …`
once the project exists.

### settings.py essentials

​```python
INSTALLED_APPS = [...]
DATABASES = {...}
​```

Single source of truth — anything env-varying lives here.
```

## 2. Parser change (`web/src/lib/parseCheatsheet.js`)

`parseCodeBlocks(lines)` is replaced by `parseCodeAnnotated(lines)`.

**New `CodeBlock` shape**:

```js
/** @typedef {{lang: string, code: string, heading?: string, caption?: string}} CodeBlock */
```

`heading` and `caption` are present **only when supplied** by the markdown — undefined otherwise. The renderer's `v-if` checks rely on this.

**Algorithm**:

1. First pass: scan the body for any `^### ` line outside a fence. If none, fall through to legacy `parseCodeBlocks` — guarantees byte-identical output for un-annotated sections.
2. Second pass (only if at least one `###` found): walk lines, tracking `pending` (a heading captured but not yet attached to a fence) and `currentBlock` (the most-recent emitted block, target for caption lines).
3. `^### (.+)$` outside a fence → set `pending = {heading}`; close any active caption.
4. Opening fence → start collecting code; carry `pending.heading` if present, then clear `pending`.
5. Closing fence → emit `{lang, code, heading?}`; switch to caption-collection mode targeted at this block.
6. Non-blank prose lines after the closing fence accumulate into the most-recent block's `caption`. Blank lines become paragraph separators (`\n\n`). The next `###` or fence-open ends caption collection.
7. End of section: if `pending.heading` exists with no following fence, emit a single `console.warn` and discard the orphan heading.
8. Callout lines (`^>\s*\[`) are siphoned out before this walk by the existing `finalizeSection` split — no change there.

**JSDoc** for `CodeBlock` updated.

## 3. Renderer change (`web/src/pages/Sheet.vue`)

The `[code]` template branch grows from a `<pre>`-only output to: optional heading → `<pre>` → optional caption.

```vue
<template v-else-if="section.type === 'code'">
  <div v-for="(block, i) in section.blocks" :key="i" class="px-3 py-2 space-y-1">
    <div v-if="block.heading" class="code-heading">{{ block.heading }}</div>
    <pre class="overflow-x-auto text-xs leading-relaxed"><code>{{ block.code }}</code></pre>
    <p
      v-if="block.caption"
      class="text-muted text-xs leading-snug"
      v-html="formatCaption(block.caption)"
    />
  </div>
</template>
```

**`formatCaption(s)`**: a thin helper added to `web/src/lib/format.js`. Splits the caption on `\n\n`, runs `formatInline` on each paragraph, joins with `</p><p>`-equivalent separation (a `<br><br>` is acceptable for v1 — captions are short).

**`code-heading` style**: small caps + muted, mirroring the existing `section-label` used for card row headers. The user already recognises this as a sub-label cue.

**No layout change** to `Card.vue` or chapter handling. Annotated `[code]` cards just emit taller content; in `vertical` chapters they have full width so wrapping is not an issue.

**Search behaviour**: unchanged.

## 4. Content edit (`content/django/basics/sheet.md`)

Replace the current `## [card project] Project, app, settings` (10-row path table) with:

```markdown
## [code project] Project anatomy

### project tree

​```text
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
​```

Always prefer `python manage.py …` over `django-admin …` once the project exists.
The inner `<app>/` directory under `templates/` and `static/` is mandatory — without
it, two apps with `index.html` collide.

### settings.py essentials

​```python
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
​```

Single source of truth — anything that varies between environments lives here.
Leaving `DEBUG=True` in prod leaks tracebacks and settings; `ALLOWED_HOSTS` is
checked against the `Host` header to block host-header attacks.
```

The card sits inside the existing `## [chapter] Project {type: vertical}`, so it has full horizontal width alongside the unchanged `## [card cli] manage.py daily commands`. Chapter row-count stays at 2 cards.

## Out of scope

- Other Django cards that could become annotated `[code]` (URL routing, models, views) — follow-up sessions.
- Syntax highlighting.
- Searchable captions.
- Per-line annotation (numbered markers → callouts) — explicitly rejected during brainstorming as too complex for the value.
- Changes to non-Django sheets.

## File touch list

| File | Change |
|---|---|
| `docs/CONTENT_FORMAT.md` | Amend the `code` subsection: add sub-heading + caption rules, density guidance, example. |
| `web/src/lib/parseCheatsheet.js` | Replace `parseCodeBlocks` with `parseCodeAnnotated`; update `CodeBlock` JSDoc. |
| `web/src/lib/format.js` | Add `formatCaption(s)`. |
| `web/src/pages/Sheet.vue` | Expand the `[code]` template branch. |
| `web/src/style.css` (or wherever `section-label` is defined) | Add `.code-heading` class if not reusable as-is. |
| `content/django/basics/sheet.md` | Replace `[card project]` with `[code project]`. |

## Acceptance signals

- Existing un-annotated `[code]` sections (none currently in `content/`, but check `content/python/3.14/sheet.md` if any get added) render identically before and after.
- The new Django `[code project]` card renders with two labelled snippets, each followed by its caption.
- No new dependencies in `web/package.json`.
- No console errors on a healthy parse; one `console.warn` if an orphan `###` is fed in (verify with a manual malformed fixture, do not ship the fixture).
