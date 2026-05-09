# Sheet Content Format

This is the authoritative specification for `sheet.yml` manifests and `cards/*.md` card files. Every `content/<topic>/<subtopic>/` must conform to this format. The loader in `web/src/lib/content.js` reads the manifest, looks up each card body, and reassembles them; the parser in `web/src/lib/parseCheatsheet.js` then converts the assembled string into the renderer's data structure.

If you need to extend the format (new section type, new manifest field, new attribute), amend this document *first*, then update the loader/parser to match.

## SubTopic layout

```
content/<topic>/<subtopic>/
├── sources.yml          # Source list (see SOURCES_FORMAT.md)
├── reference.md         # Consolidated study text (Consolidation User context)
├── sheet.yml            # Manifest: title, subtitle, ordered chapters → ordered cards
└── cards/
    ├── <card-id>.md     # One section, using the syntax in "Section headers" below
    └── …
```

The SubTopic name is the parent folder name; it is not part of any file.

## Manifest (`sheet.yml`)

```yaml
title: Django
subtitle: "basics"

chapters:
  - title: Project
    id: project              # optional; defaults to slug(title) at render time
    cards:
      - project-anatomy      # card id == filename (without .md) under cards/
      - cli
      - project-settings

  - title: Request cycle
    cards:
      - urls
      - urls-wiring
      - views
```

Rules:

- `title` and `subtitle` are scalar strings.
- `chapters` is an ordered list. Each chapter has an optional `title`, an optional `id`, and a required ordered `cards` list of card ids.
- The chapterless case — a Sheet rendered with no rail/divider — is a single chapter with no `title`. In YAML: `- ` followed by `cards:` on the next line.
- For each card id `foo` listed under `cards:`, a file `cards/foo.md` must exist. A missing file yields a console warning and the card is skipped.
- A `cards/*.md` file present on disk but not listed in the manifest is ignored (with a console warning) — useful while drafting.
- The section id inside a card file (`## [card foo] …`) must match the filename. If it doesn't, the loader rewrites the header to use the filename and emits a warning.
- A card id used twice in the same Sheet (whether via filename collision or via a manifest mistake) yields a console warning.

Indents in `sheet.yml` are fixed at 0 / 2 / 4 / 6 spaces — the in-repo YAML helper does not support arbitrary indentation.

## Card files (`cards/<id>.md`)

Each card file contains exactly one section using the syntax in "Section headers" below. No frontmatter — metadata lives in the section header (`{accent: …, span: full}`) and in the manifest. Callouts (`> [tip]`, `> [warn]`) follow the section's body within the same file.

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
- **Layout (vertical vs columns), font sizes, and column count are not part of `sheet.yml` or the `cards/` files** — they are user-side **Sheet settings** edited in the UI. The default chapter layout is `columns` (responsive masonry); flip individual chapters to `vertical` (one card per row, full width) via the chapter rail's gear, or change the Sheet-wide default in the top-right Settings panel. See "Sheet settings" below.

**Implicit chapter:** Sheets that declare no `[chapter]` headers fall into a single implicit chapter with no title — divider and rail are not rendered, and the page looks identical to a chapter-free sheet. Settings for that implicit chapter are tunable through the top-right Settings panel only (no rail = no per-chapter gear).

## Sheet settings

Settings live in the browser's `localStorage` per Sheet (key `cheatsheet:settings:<topic>/<subtopic>`); they are **not** part of `sheet.yml` or the `cards/` files. There are two scopes:

| Scope | Where edited | Keys |
|-------|--------------|------|
| Page  | top-right Settings panel | `maxWidth` |
| Per-Chapter | gear on each chapter rail | `bodySize`, `cardTitleSize`, `chapterTitleSize`, `cols`, `type` |

Resolution at render time: per-Chapter override → hard-coded default. A "reset to defaults" affordance in the chapter popover clears that chapter's overrides. The top-right Settings panel only controls page `maxWidth`; chapter-scoped values are tuned per-chapter via each chapter's rail gear.

**Migration note (one-time).** Earlier versions of this format authored chapter layout in `sheet.md` headers as `## [chapter] Title {type: vertical | columns}`. That syntax was removed and stripped from existing sheets. Chapters previously marked `{type: vertical}` now render as `columns` (the default) until re-flipped through the chapter rail's gear popover. Affected at the time of migration: chapters in `content/django/basics`, `content/git/worktrees-agents`, `content/specification/acceptance-criteria`, `content/specification/context-anchored-specifications`, and `content/specification/user-stories`.

**Migration note (2026-05-09).** This format previously stored the full Sheet (frontmatter + all sections) in a single `sheet.md` per SubTopic. It now stores the spine (title, subtitle, ordered chapters → ordered cards) in `sheet.yml` and one section per file under `cards/`. The previous duplicate-id footgun (e.g. two `[code project]` cards in `content/django/basics/sheet.md`) is now caught by the loader. Earlier `sheet.md` references in this paragraph and the historical migration note above are intentionally preserved as historical context.

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

Columns: `code` (mono, bold), `name` (semibold), `desc` (muted), `detail` (muted prose sub-row). All columns optional except at least one content column. Non-standard column names are rendered as extra muted text.

The `detail` column renders as a muted prose sub-row beneath the row's tabular cells, indented from the row's left edge and spanning the row's full width. Rows whose `detail` value is empty or absent render as a single tabular line. This applies in both `columns` and `vertical` chapter layouts.

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

- An optional `### sub-heading` — the block's logical label (renders as a small uppercase label above the block). Skip it for single-block cards where the card title already names the snippet.
- An optional **preface** — paragraphs of prose between the section header (or `### sub-heading`) and the opening fence. Renders as plain prose above the code, with no `why` chip or callout border.
- A required fenced code block, optionally annotated with a **filename** as the second token of the fence info string: `` ```python settings.py ``. The filename renders as a small file-tab header attached to the top of the rendered code box. Omit when the snippet doesn't represent a single named file (e.g. a tree, a shell session, a multi-file excerpt).
- An optional **caption** — paragraphs of prose immediately after the closing fence, ending at the next `### sub-heading` or end of section. Renders in a left-bordered callout with a `why` chip.

All four (heading, filename, preface, caption) are independently optional. A bare `[code]` card with one fence and no annotations parses to a single un-decorated block — same as before.

**Bare form (single fence, no annotations):**

````markdown
## [code idioms] Idioms

```python
# walrus operator
if (n := len(data)) > 10:
    print(f"{n=}")
```
````

**Single-block with caption (no `### sub-heading` — title is on the card):**

````markdown
## [code project] Project anatomy

Skeleton of a fresh `startproject` site — the layout `manage.py startapp` will extend.

```text
mysite/
├── manage.py    # CLI wrapper that knows DJANGO_SETTINGS_MODULE
└── polls/       # an app
```

Always prefer `python manage.py …` over `django-admin …` once the project exists.
````

**Multi-block annotated form (sub-heading + caption per block):**

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

```python settings.py
INSTALLED_APPS = [...]
DATABASES = {...}
```

Single source of truth — anything env-varying lives here.
````

The first fence has no filename token (a tree spans multiple files), so no file-tab renders. The second fence's `settings.py` token renders as a file-tab header above the Python snippet.

**Caption / preface rules:**

- Inline Markdown only: `**bold**`, `*em*`, `` `code` ``, `[links](url)`. No bullets, no headings.
- Multi-paragraph allowed; blank lines separate paragraphs.
- A caption attaches to the **preceding** fence; a preface attaches to the **following** fence. A `### heading` not followed by a fence is dropped (parser emits a `console.warn`).

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

1. **Edit this document** with the new section type, manifest field, attribute, or callout — including an example.
2. **Update `web/src/lib/parseCheatsheet.js`** for new section types/attributes, or `web/src/lib/yaml.js` and `web/src/lib/assembleSheet.js` for new manifest fields.
3. **Add or update the renderer** in `web/src/pages/Sheet.vue` (or in a component under `web/src/components/`).

The spec leads; the parser and the renderer follow. Never the other way around.
