# Sheet Content Format

This is the authoritative specification for `sheet.md` files. Every `content/<topic>/<subtopic>/sheet.md` must conform to this format. The parser in `web/src/lib/parseCheatsheet.js` implements this spec.

If you need to extend the format (new section type, new attribute, new callout), amend this document *first*, then update the parser to match. Content files should never drive parser changes — the parser exists to serve this spec.

## Frontmatter

```yaml
---
title: Python                   # Topic display name
subtitle: "language reference + 3.14 features"
---
```

The SubTopic name is taken from the parent folder name; it is not part of the frontmatter.

## Section headers

Sections are `H2` headers (`##`) with an optional type tag in brackets:

```markdown
## [card 2xx] 2xx — Success {accent: status-2xx}
## [pills methods] Methods
## [diagram] Request lifecycle
## [card stdlib] Standard library highlights
```

Format: `## [TYPE ID] Display Title {key: value, key: value}`

- `TYPE` — section renderer. See types below.
- `ID` — optional, used as stable DOM id and for search indexing. Defaults to slugified title.
- `Display Title` — the text shown on the card header.
- `{...}` — optional attribute block. Common attrs: `accent`, `span`, `cols`.

If no type tag is given, defaults to `card`.

## Chapters

Sections can be grouped into ordered **Chapters**. A chapter is declared with the `[chapter]` type tag; it is a structural marker, not a renderable card. Every section that follows attaches to the most-recent `[chapter]` until the next one.

```markdown
## [chapter] Introduction

## [text purpose] Purpose & shape
...

## [card artifacts] Three Artifacts, Three Jobs
...

## [chapter] Deep-Dive

## [card building-blocks] Building Blocks
...
```

- Chapter id is auto-slugged from the title (e.g. `Deep-Dive` → `deep-dive`); explicit ids are allowed via `[chapter <id>]` mirroring card id syntax.
- Chapters render with a horizontal rule above and the chapter title set vertically on the left rail of the chapter content. A small gear icon on the rail opens that chapter's settings popover.
- **Layout (vertical vs columns), font sizes, and column count are not part of `sheet.md`** — they are user-side **Sheet settings** edited in the UI. The default chapter layout is `columns` (responsive masonry); flip individual chapters to `vertical` (one card per row, full width) via the chapter rail's gear, or change the Sheet-wide default in the top-right Settings panel. See "Sheet settings" below.

**Implicit chapter:** Sheets that declare no `[chapter]` headers fall into a single implicit chapter with no title — divider and rail are not rendered, and the page looks identical to a chapter-free sheet. Settings for that implicit chapter are tunable through the top-right Settings panel only (no rail = no per-chapter gear).

## Sheet settings

Settings live in the browser's `localStorage` per Sheet (key `cheatsheet:settings:<topic>/<subtopic>`); they are **not** part of `sheet.md`. There are two scopes:

| Scope | Where edited | Keys |
|-------|--------------|------|
| Page  | top-right Settings panel | `maxWidth` |
| Per-Chapter | gear on each chapter rail | `bodySize`, `cardTitleSize`, `chapterTitleSize`, `cols`, `type` |

Resolution at render time: per-Chapter override → hard-coded default. A "reset to defaults" affordance in the chapter popover clears that chapter's overrides. The top-right Settings panel only controls page `maxWidth`; chapter-scoped values are tuned per-chapter via each chapter's rail gear.

**Migration note (one-time).** Earlier versions of this format authored chapter layout in `sheet.md` headers as `## [chapter] Title {type: vertical | columns}`. That syntax was removed and stripped from existing sheets. Chapters previously marked `{type: vertical}` now render as `columns` (the default) until re-flipped through the chapter rail's gear popover. Affected at the time of migration: chapters in `content/django/basics`, `content/git/worktrees-agents`, `content/specification/acceptance-criteria`, `content/specification/context-anchored-specifications`, and `content/specification/user-stories`.

## Section types

### `card` — titled box with a table of rows

Primary format. Table columns map to properties on each row:

```markdown
## [card 2xx] 2xx — Success {accent: status-2xx}

| code | name         | desc                         | detail                                    |
|------|--------------|------------------------------|-------------------------------------------|
| 200  | OK           | standard success             | Returns the resource in the body.         |
| 201  | Created      | resource created             | Location header should point to it.       |

> [tip] 201 with Location header is the REST-correct response to POST.
> [warn] 301 and 302 rewrite to GET on redirect.
```

Columns: `code` (mono, bold), `name` (semibold), `desc` (muted), `detail` (chapter-dependent — see below). All columns optional except at least one content column. Non-standard column names are rendered as extra muted text.

The `detail` column behaves differently depending on the chapter's currently-effective layout type (a Sheet setting — see above):

- When the chapter's effective `type` is `columns` (the default), `detail` is **hidden** in the grid; rows with a non-empty `detail` value become **clickable** and open the value in a modal.
- When the chapter's effective `type` is `vertical`, `detail` is rendered **inline** as another column; the row is **not** clickable. Vertical chapters have full horizontal width per card, so showing `detail` directly is preferred over the click-to-open interaction.

Because layout type is now a Sheet setting, this behavior responds live to flipping the chapter's type from the rail's gear popover. Rows without a `detail` value are plain rows in either layout.

### `pills` — label pills with descriptions

Use for methods, headers, keywords:

```markdown
## [pills methods] Methods

| pill    | desc                           |
|---------|--------------------------------|
| GET     | retrieve — safe, idempotent    |
| POST    | create — not idempotent        |
```

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
- Long code lines scroll horizontally inside the card, so annotated `code` cards work fine alongside reference cards. If a code-heavy chapter feels cramped, tune that chapter's column count (or flip it to `vertical`) from its rail gear popover — chapter layout is a per-Sheet user setting, not a content choice.

Use language-specific fences. Rendered as plain monospaced blocks in v1 (syntax highlighting deferred).

### `diagram` — card containing inline SVG

Used when content has inherent spatial structure (e.g., request/response flow):

````markdown
## [diagram] Request / Response Lifecycle

```svg
<svg viewBox="0 0 300 110">...</svg>
```
````

The SVG string is rendered inline. Keep it trusted — this content is not sanitized.

### `text` — card with short formatted prose

Supports Markdown inline formatting: `**bold**`, `*em*`, `` `code` ``, `[links](url)`, and bullet lists.

```markdown
## [text mental-model] Mental model

- **1xx** — "hold on"
- **2xx** — "here you go"
- **3xx** — "look over there"
- **4xx** — "you messed up"
- **5xx** — "I messed up"
```

## Callouts

Use blockquote syntax with a prefix tag:

```markdown
> [tip] Use idempotency keys for POST retries.
> [warn] 502/504 almost always mean a proxy/LB issue, not your app.
```

Callouts attach to the preceding section and render below its body.

## Inline formatting in table cells

Within table cells, support minimal Markdown:

- `` `backticks` `` → inline code
- `**bold**` → bold
- `*em*` → italic
- `[text](url)` → link

Nothing else. Tables are for structured data, not prose.

## Escaping pipes in table cells

A literal `|` inside a cell must be escaped as `\|`. The parser strips the backslash and keeps the pipe. Without the escape, the pipe is treated as a column separator and the cell will be split.

```markdown
| idiom      | example                        |
|------------|--------------------------------|
| dict merge | `{**a, **b}` or `a \| b`       |
```

## Accent values

In `{accent: ...}`:

- `status-2xx`, `status-3xx`, `status-4xx`, `status-5xx` — semantic, resolved to the palette.
- `neutral` — no top border (default).
- Hex value (e.g. `#3776ab`) — custom. Either unquoted (`{accent: #3776ab}`) or quoted (`{accent: "#3776ab"}`) is accepted; quotes are stripped on parse.

### Span attribute

To make a card span every column of its parent chapter when that chapter renders as `columns`, set `{span: full}`:

```markdown
## [card overview] Overview {span: full}
```

When the chapter is rendering as `vertical` (the user's setting, not a content choice), every card already takes the full horizontal width, so `{span: full}` is a no-op there.

## Minimal working example

```markdown
---
title: Example
subtitle: demonstration
---

## [card basics] Basics

| keyword | desc                    |
|---------|-------------------------|
| `let`   | block-scoped binding    |
| `const` | immutable binding       |

> [tip] Prefer `const` by default.

## [pills types] Primitives

| pill   | desc                |
|--------|---------------------|
| number | IEEE 754 float      |
| string | UTF-16 code units   |

## [text notes] Notes

- Numbers and strings are **immutable**.
- Arrays and objects are **reference types**.
```

## How to extend this format

1. **Edit this document** with the new section type, attribute, or callout — including an example.
2. **Update `web/src/lib/parseCheatsheet.js`** to recognize it.
3. **Add or update the renderer** in `web/src/pages/Sheet.vue` (or in a component under `web/src/components/`).

The spec leads; the parser and the renderer follow. Never the other way around.
