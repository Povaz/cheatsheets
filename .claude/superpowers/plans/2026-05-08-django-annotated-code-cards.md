# Annotated `[code]` Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the `[code]` section type with optional `### sub-headings` and prose captions per fenced block, then convert the Django Basics "Project, app, settings" card to an annotated `[code]` card.

**Architecture:** Spec amendment first (project rule: "amend the spec, then update the parser, then the renderer"). Parser detects whether a `[code]` section uses sub-headings; if not, falls through to existing legacy walker (byte-identical output for un-annotated sections). Renderer's `[code]` template branch grows from `<pre>`-only to `optional-heading → <pre> → optional-caption`. `[diagram]` keeps using the legacy walker untouched.

**Tech Stack:** Vue 3 + Vite + Tailwind. No new dependencies. No tests (project policy: "Do not add tests unless asked"). Validation is manual: `npm run dev` and visual inspection of the Django sheet.

**Spec:** `.claude/superpowers/specs/2026-05-08-django-annotated-code-cards-design.md`.

---

## File touch list

| File | Change |
|---|---|
| `docs/CONTENT_FORMAT.md` | Amend the `code` subsection. |
| `web/src/lib/parseCheatsheet.js` | Add `parseCodeAnnotated()`; wire `code` to it (leave `diagram` on legacy `parseCodeBlocks`); update `CodeBlock` JSDoc. |
| `web/src/lib/format.js` | Add `formatCaption()`. |
| `web/src/pages/Sheet.vue` | Expand the `[code]` template branch; import `formatCaption`. |
| `content/django/basics/sheet.md` | Replace `## [card project] Project, app, settings` with `## [code project] Project anatomy`. |

No CSS changes — `section-label` (uppercase, tracking-label, text-2xs, font-semibold, text-muted; defined at `web/src/index.css:35`) is the per-block heading style.

---

## Task 1: Amend the format spec

**Files:**
- Modify: `docs/CONTENT_FORMAT.md` — the `### code` subsection (around lines 103–122) and add a brief author-guidance note.

The format doc is the source of truth; it gets updated first.

- [ ] **Step 1: Replace the `### code` section body**

Find the existing `### code — card containing code blocks` subsection (the example with `## [code idioms] Idioms`). Replace its body with:

````markdown
### `code` — card containing code blocks (optionally annotated)

Use for idiom references and for snippets where the *shape* of the code is the memory anchor (file trees, settings excerpts, model definitions).

A `code` section's body is a sequence of **blocks**. Each block is:

- An optional `### sub-heading` — the block's title.
- A required fenced code block.
- An optional **caption** — paragraphs of prose immediately after the closing fence, ending at the next `### sub-heading` or end of section.

If a `code` section contains **no** `### sub-headings`, it parses exactly as it always did: each fence becomes one un-titled block, no captions. Existing un-annotated `code` sections render identically.

**Bare (legacy) form:**

````markdown
## [code idioms] Idioms

```python
# walrus operator
if (n := len(data)) > 10:
    print(f"{n=}")
```
````

**Annotated form (sub-heading + caption per block):**

````markdown
## [code project] Project anatomy

### project tree

```text
mysite/
├── manage.py    # CLI wrapper that knows DJANGO_SETTINGS_MODULE
└── polls/       # an app
```

Always prefer `python manage.py …` over `django-admin …`
once the project exists.

### settings.py essentials

```python
INSTALLED_APPS = [...]
DATABASES = {...}
```

Single source of truth — anything env-varying lives here.
````

**Caption rules:**

- Inline Markdown only: `**bold**`, `*em*`, `` `code` ``, `[links](url)`. No bullets, no headings.
- Multi-paragraph allowed; blank lines separate paragraphs.
- A caption attaches to the **preceding** fence. A `### heading` not followed by a fence is dropped (parser emits a `console.warn`).

**Author guidance:**

- Aim for **2–3 captioned blocks per annotated `code` card**, snippets ≤ ~10 lines each.
- Captioned-code cards belong in `{type: vertical}` chapters — code does not wrap inside masonry columns.

Use language-specific fences. Rendered as plain monospaced blocks in v1 (syntax highlighting deferred).
````

- [ ] **Step 2: Commit**

```bash
git add docs/CONTENT_FORMAT.md
git commit -m "Amend CONTENT_FORMAT: [code] sections support ### sub-headings and prose captions per block"
```

---

## Task 2: Parser — annotated `[code]` walker

**Files:**
- Modify: `web/src/lib/parseCheatsheet.js`

Add a new `parseCodeAnnotated()` function that handles the annotated form, keep `parseCodeBlocks()` unchanged for `[diagram]`, and route `[code]` through the new function.

- [ ] **Step 1: Update the `CodeBlock` JSDoc**

In `web/src/lib/parseCheatsheet.js`, replace the existing `CodeBlock` typedef (currently around line 33) with:

```js
/**
 * @typedef {Object} CodeBlock
 * @property {string} lang
 * @property {string} code
 * @property {string} [heading]   present only when the markdown supplied a ### sub-heading
 * @property {string} [caption]   present only when prose followed the closing fence; paragraphs joined with \n\n
 */
```

- [ ] **Step 2: Add `parseCodeAnnotated()` next to `parseCodeBlocks()`**

Insert this function immediately after the existing `parseCodeBlocks()` (around line 159):

```js
function parseCodeAnnotated(lines) {
  // Fast path: if no ### outside a fence, fall through to the legacy walker.
  // This guarantees byte-identical output for un-annotated [code] sections.
  let scanInFence = false
  let hasHeading = false
  for (const line of lines) {
    if (/^```/.test(line)) { scanInFence = !scanInFence; continue }
    if (!scanInFence && /^###\s+/.test(line)) { hasHeading = true; break }
  }
  if (!hasHeading) return parseCodeBlocks(lines)

  const blocks = []
  let pendingHeading = null
  let inFence = false
  let current = null
  /** @type {string[] | null} */
  let captionLines = null   // null = not collecting; [] = collecting after a closing fence
  let warnedOrphan = false

  const flushCaption = () => {
    if (captionLines && blocks.length > 0) {
      while (captionLines.length && captionLines[0].trim() === '') captionLines.shift()
      while (captionLines.length && captionLines[captionLines.length - 1].trim() === '') captionLines.pop()
      if (captionLines.length) {
        blocks[blocks.length - 1].caption = captionLines.join('\n')
      }
    }
    captionLines = null
  }

  for (const line of lines) {
    const fence = line.match(/^```(.*)$/)
    if (fence) {
      if (!inFence) {
        flushCaption()
        current = { lang: fence[1].trim(), code: '' }
        if (pendingHeading) {
          current.heading = pendingHeading
          pendingHeading = null
        }
        inFence = true
      } else {
        blocks.push(current)
        current = null
        inFence = false
        captionLines = []
      }
      continue
    }
    if (inFence) {
      current.code += (current.code ? '\n' : '') + line
      continue
    }
    const headingMatch = line.match(/^###\s+(.+)$/)
    if (headingMatch) {
      flushCaption()
      if (pendingHeading && !warnedOrphan) {
        // eslint-disable-next-line no-console
        console.warn('parseCheatsheet: orphan ### heading dropped (no fence followed):', pendingHeading)
        warnedOrphan = true
      }
      pendingHeading = headingMatch[1].trim()
      continue
    }
    if (captionLines !== null) {
      captionLines.push(line)
    }
  }
  flushCaption()
  if (pendingHeading && !warnedOrphan) {
    // eslint-disable-next-line no-console
    console.warn('parseCheatsheet: orphan ### heading dropped (no fence followed):', pendingHeading)
  }
  return blocks
}
```

- [ ] **Step 3: Wire `[code]` to the new walker (and only `[code]`)**

In `finalizeSection()` (around lines 182–189), change:

```js
} else if (header.type === 'code' || header.type === 'diagram') {
  section.blocks = parseCodeBlocks(other)
}
```

to:

```js
} else if (header.type === 'code') {
  section.blocks = parseCodeAnnotated(other)
} else if (header.type === 'diagram') {
  section.blocks = parseCodeBlocks(other)
}
```

This isolates the new logic to `[code]`. `[diagram]` keeps its existing behaviour exactly.

- [ ] **Step 4: Manual sanity check — open the file and re-read your changes**

Open `web/src/lib/parseCheatsheet.js`. Confirm:
- `parseCodeBlocks` is unchanged.
- `parseCodeAnnotated` is added.
- `finalizeSection` routes `code` to `parseCodeAnnotated` and `diagram` to `parseCodeBlocks`.
- `CodeBlock` JSDoc has the new optional `heading` and `caption` properties.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/parseCheatsheet.js
git commit -m "parseCheatsheet: add parseCodeAnnotated for [code] sub-headings + captions, leave [diagram] untouched"
```

---

## Task 3: Renderer — caption helper + Sheet.vue template

**Files:**
- Modify: `web/src/lib/format.js`
- Modify: `web/src/pages/Sheet.vue`

- [ ] **Step 1: Add `formatCaption()` to `format.js`**

Append to `web/src/lib/format.js` (after the existing `rowMatches` export):

```js
/**
 * Render a caption: paragraphs (separated by blank lines) of inline-formatted
 * Markdown. Soft line breaks within a paragraph collapse to spaces. Paragraphs
 * are joined with `<br><br>` so the result fits inside a single host element
 * (the renderer uses a `<p v-html=...>`, which can't legally contain `<p>`).
 */
export function formatCaption(text) {
  if (!text) return ''
  return String(text)
    .split(/\n\s*\n/)
    .map((para) => formatInline(para.replace(/\n/g, ' ').trim()))
    .filter(Boolean)
    .join('<br><br>')
}
```

- [ ] **Step 2: Import `formatCaption` in `Sheet.vue`**

In `web/src/pages/Sheet.vue` line 5, change:

```js
import { rowMatches, formatInline, visibleColumns } from '../lib/format.js'
```

to:

```js
import { rowMatches, formatInline, formatCaption, visibleColumns } from '../lib/format.js'
```

- [ ] **Step 3: Expand the `[code]` template branch**

In `web/src/pages/Sheet.vue` (lines 168–172), replace:

```vue
<template v-else-if="section.type === 'code'">
  <div v-for="(block, i) in section.blocks" :key="i" class="px-3 py-2">
    <pre class="overflow-x-auto text-xs leading-relaxed"><code>{{ block.code }}</code></pre>
  </div>
</template>
```

with:

```vue
<template v-else-if="section.type === 'code'">
  <div v-for="(block, i) in section.blocks" :key="i" class="px-3 py-2 space-y-1">
    <div v-if="block.heading" class="section-label">{{ block.heading }}</div>
    <pre class="overflow-x-auto text-xs leading-relaxed"><code>{{ block.code }}</code></pre>
    <p
      v-if="block.caption"
      class="text-muted text-xs leading-snug"
      v-html="formatCaption(block.caption)"
    />
  </div>
</template>
```

The `[diagram]` template branch immediately below it stays unchanged.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/format.js web/src/pages/Sheet.vue
git commit -m "Sheet: render optional heading + caption around each [code] block"
```

---

## Task 4: Convert the Django "Project, app, settings" card

**Files:**
- Modify: `content/django/basics/sheet.md` (the section currently spanning roughly lines 23–36).

- [ ] **Step 1: Replace the card**

Find this block in `content/django/basics/sheet.md`:

```markdown
## [card project] Project, app, settings

| code | name | desc | detail |
|------|------|------|--------|
| `manage.py` | CLI entrypoint | thin wrapper that knows your `DJANGO_SETTINGS_MODULE` | Always prefer `python manage.py …` over `django-admin …` once the project exists. |
... (the full 10-row table) ...
| `DEBUG`, `ALLOWED_HOSTS` | env-sensitive | `DEBUG=True` in dev only; `ALLOWED_HOSTS` required when `DEBUG=False` | Leaving `DEBUG=True` in prod leaks tracebacks and settings. `ALLOWED_HOSTS` is checked against the `Host` header to block host-header attacks. |
```

Replace it with:

````markdown
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
````

The card sits inside the existing `## [chapter] Project {type: vertical}` so it gets full horizontal width alongside `## [card cli] manage.py daily commands`. Don't change the chapter header or the `cli` card. Don't change anything else in the sheet.

- [ ] **Step 2: Commit**

```bash
git add content/django/basics/sheet.md
git commit -m "Django: convert [card project] to annotated [code project] (project tree + settings.py essentials)"
```

---

## Task 5: Build sanity check + browser verification

This is the actual deliverable check — the user explicitly said "I'll review the final results on the website."

**Files:** none modified.

- [ ] **Step 1: Production build sanity check**

Run from the worktree root:

```bash
cd web && npm install && npm run build
```

Expected: `npm run build` exits 0. Any parse error in the new annotated content surfaces here.

- [ ] **Step 2: Start the dev server**

```bash
cd web && npm run dev
```

Expected: dev server starts at `http://localhost:5173/`.

- [ ] **Step 3: Manual visual checks**

In a browser at `http://localhost:5173/django/basics`:

1. **The new card renders.** "Project anatomy" appears in the Project chapter (after `manage.py daily commands`).
2. **Two snippets, each with its sub-heading.** "project tree" and "settings.py essentials" appear as small uppercase labels above their respective code blocks (visually matching the existing `section-label` style — same as the row pseudo-headers elsewhere on the sheet).
3. **Captions render under each code block.** Muted, small, with inline `code` chips and `**bold**` formatting working (e.g., the word "mandatory" in the first caption is bold; `manage.py` is in an inline-code chip).
4. **No console errors or warnings.** Open DevTools console — must be clean. (An orphan-`###` warning would only fire on malformed input; we have none.)
5. **Other cards are unaffected.** The `cli` card above and every card in the Request cycle / ORM / Batteries chapters renders identically to before.
6. **Other sheets are unaffected.** Click into the Python `3.14` sheet (and any other) — `[code]` sections render exactly as they did before (no headings, no captions emitted).

- [ ] **Step 4: Stop the dev server**

`Ctrl-C` in the terminal running `npm run dev`.

- [ ] **Step 5 (no commit needed)**

This task touches no files. If everything looked right, the implementation is complete and ready for the merge-back step.

---

## Out of scope (do not do)

- Tests of any kind (project policy: "Do not add tests unless asked").
- Syntax highlighting for code blocks (deferred by `CONTENT_FORMAT.md`).
- Searchable captions (`[code]` sections are not searchable today; not changing that).
- Per-line annotations / numbered markers — explicitly rejected during brainstorming.
- Converting other Django cards (URL routing, models, views, etc.) — follow-up.
- Editing non-Django sheets.
- Changes to `Card.vue`, chapter rendering, `DetailModal`, or any unrelated component.
