# Content

> The Content Context covers the structure of subject matter the User has studied and the source material from which `Sheet[View]`s are built — `Topic`s, `SubTopic`s, and `Source`s. It also defines the User in their role as builder of `CheatSheet[View]`s.

## §1 Relationships

Pairs with the View Context. Each `Topic` in Content corresponds to one `CheatSheet[View]` in View — same underlying thing, different aspect (information vs rendered view). Each `SubTopic` corresponds 1:1 to a `Sheet[View]`. `Source`s are inputs to the pipeline; they are not directly visible through the View Context. The `Consolidation User` defined here is the same human as the `Reference User[View]` defined in View; the two roles capture different activities (building vs consuming) and may be carried out at different times by the same person.

## §2 Dictionary

| Term               | Definition                                                                                                                                                                                                                                                                                     |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Topic              | A broad subject area the User has studied, considered as information (e.g., "Python", "HTTP", "Claude Code"). Same underlying thing as a CheatSheet, viewed from the information aspect.                                                                                                       |
| SubTopic           | A specific area or aspect within a Topic. The Topic→SubTopic split is intentionally flexible: SubTopics may be versions (Python 3.13, 3.14), facets (Commands, Agents, Skills), or any other partition chosen per Topic. Maps 1:1 to a Sheet.                                                  |
| Source             | An external resource consulted when producing a Sheet for a SubTopic — book/PDF, article/URL, video, or any other document. Sources are inputs to consolidation; they are not directly visible to the User through Sheets. |
| Consolidation User | The User acting to build or extend a CheatSheet: selecting Topics and SubTopics, gathering Sources, and producing the Sheet. This act is itself an instance of Learning Consolidation. Same human as the Reference User defined in View; the role differs. |

## §3 User Stories

### US-1 — Generate a new CheatSheet for a Topic I have studied

[Contexts: Content]

**Title:** US-1 — Generate a new CheatSheet for a Topic I have studied

**As a** `Consolidation User`, \
**I can** generate a new empty `CheatSheet` for a `Topic` I have studied, \
**so that** I have a container ready to receive `Sheet`s as I study the `Topic`'s `SubTopic`s.

#### AC-1.1 — Generate an empty `CheatSheet` for a new `Topic` — Happy Path

```gherkin
Given no `CheatSheet` exists for the chosen `Topic`,
When the `Consolidation User` generates a `CheatSheet` for that `Topic`,
Then a new `CheatSheet` for the `Topic` is created,
    And it contains no `Sheet`s
```

---

### US-2 — Generate a Sheet for a SubTopic from its Sources

[Contexts: Content]

**Title:** US-2 — Generate a Sheet for a SubTopic from its Sources

**As a** `Consolidation User`, \
**I can** assemble a list of `Source`s for a `SubTopic` and generate a `Sheet` from them, \
**so that** my `CheatSheet` grows as I study more aspects of the same `Topic`.

#### AC-2.1 — Generate a `Sheet` for a new `SubTopic` — Happy Path

```gherkin
Given a `CheatSheet` exists for a `Topic`,
    And no `Sheet` exists for the chosen `SubTopic`,
    And the `Consolidation User` has assembled a list of `Source`s for the `SubTopic` per the `sources.yml` schema (§4),
When the `Consolidation User` generates the `Sheet`,
Then a `Sheet` conforming to the Sheet content schema (§4) is generated from the provided `Source`s,
    And the `Sheet` appears in the `Topic`'s `CheatSheet`
```

---

### US-3 — Refresh a Sheet when its Sources change

[Contexts: Content]

**Title:** US-3 — Refresh a Sheet when its Sources change

**As a** `Consolidation User`, \
**I can** update the list of `Source`s for an existing `SubTopic` and regenerate its `Sheet` from the updated set, \
**so that** my study material stays current as I add, replace, or remove what I read.

#### AC-3.1 — Refresh a `Sheet` after updating its `Source`s — Happy Path

```gherkin
Given a `Sheet` exists for a `SubTopic` within a `CheatSheet`,
    And the `Consolidation User` has updated the `SubTopic`'s list of `Source`s per the `sources.yml` schema (§4),
When the `Consolidation User` regenerates the `Sheet`,
Then the `Sheet` is regenerated from the updated `Source`s conforming to the Sheet content schema (§4),
    And the `CheatSheet` continues to contain the `SubTopic`'s `Sheet` with its updated content
```

---

### US-5 — Remove a CheatSheet or a single Sheet

[Contexts: Content]

**Title:** US-5 — Remove a CheatSheet or a single Sheet

**As a** `Consolidation User`, \
**I can** remove a `CheatSheet` along with its `Topic` and every related `SubTopic` and `Source`, or remove a single `Sheet` along with its underlying `SubTopic` and `Source`s, \
**so that** I can prune material I no longer need to keep.

#### Background

```gherkin
Given a `CheatSheet` exists for a `Topic` with multiple `Sheet`s,
    And every underlying `SubTopic` and `Source` is in place
```

#### AC-5.1 — Remove an entire `CheatSheet` — Happy Path

```gherkin
Given the `Consolidation User` has initiated removal of a `CheatSheet`,
When the `Consolidation User` confirms the removal,
Then the `CheatSheet` no longer appears in the User's list,
    And every related `Sheet`, `SubTopic`, and `Source` is discarded,
    And the `Topic` is no longer tracked
```

#### AC-5.2 — Remove a single `Sheet` from a `CheatSheet` — Happy Path

```gherkin
Given the `Consolidation User` has initiated removal of a `Sheet` from a `CheatSheet`,
When the `Consolidation User` confirms the removal,
Then the `Sheet` no longer appears in the `CheatSheet`,
    And the `SubTopic` and `Source`s for that `Sheet` are discarded,
    And the remaining `Sheet`s in the `CheatSheet` are preserved
```

#### AC-5.3 — Cancel removal of a `CheatSheet` — Sad Path

```gherkin
Given the `Consolidation User` has initiated removal of a `CheatSheet`,
When the `Consolidation User` cancels the removal,
Then the `CheatSheet` remains in the User's list,
    And every `Sheet`, `SubTopic`, and `Source` is preserved unchanged
```

## §4 Data Model

### Spec-to-file-system mapping

| Spec entity | File system artifact                                               | Notes                                                                                                                 |
|-------------|--------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Topic       | `content/<topic>/`                                                 | Slug = folder name.                                                                                                   |
| SubTopic    | `content/<topic>/<subtopic>/`                                      | Slug = `<topic>/<subtopic>`.                                                                                          |
| Source      | An entry in `content/<topic>/<subtopic>/sources.yml`               | URL / PDF path / video link, type, title, fetched-at. Surfaced by the deployed app as a footer on each `Sheet[View]`. |
| Sheet       | `content/<topic>/<subtopic>/sheet.yml` + `cards/*.md`              | Manifest + per-card Markdown files (schema below); rendered by the app.                                               |
| CheatSheet  | The set of `sheet.yml` + `cards/` directories under one `<topic>/` | Synthesised at load time; not stored as a separate artifact.                                                          |

### `topic.yml`

```yaml
title: Python                       # display name
subtitle: language reference across versions
default: "3.14"                     # SubTopic slug rendered when /<topic> is opened
```

All keys are optional. With no `default`, the loader picks the lexicographically last `SubTopic` (so version-named `SubTopic`s open on the newest).

### `sources.yml`

Each `SubTopic` folder contains one `sources.yml` listing the `Source`s consulted to produce its `Sheet`. The deployed app surfaces them as a footer on each rendered `Sheet[View]` so the `Reference User` can jump to the original material.

```yaml
sources:
  - title: <human-readable title>
    url: <absolute URL or repo-relative path>
    type: doc | article | rfc | pep | video | pdf | other
    fetched: <ISO date YYYY-MM-DD>
    read_as: <one-line consolidation directive, optional>
```

| Field     | Required | Notes |
|-----------|----------|-------|
| `title`   | yes      | Display name of the Source. |
| `url`     | yes      | An absolute URL, or a repo-relative path for local files (e.g. PDFs in `content/<topic>/<subtopic>/`). |
| `type`    | yes      | One of: `doc` (official docs), `article` (blog / write-up), `rfc`, `pep`, `video`, `pdf`, `other`. |
| `fetched` | yes      | The date the Source was last consulted. ISO format, no time. |
| `read_as` | no       | One short line telling the `Consolidation User` *how* to read this Source when producing the Sheet: what to extract, what to skip, what role it plays. Examples: `concepts only — skip the step-by-step walkthrough`, `authoritative — quote API signatures verbatim`, `secondary — only fill gaps left by the official docs`. Omit when the default (read in full, weigh by `type`) is fine. |

#### Example

```yaml
sources:
  - title: What's New In Python 3.14
    url: https://docs.python.org/3/whatsnew/3.14.html
    type: doc
    fetched: 2026-04-18
    read_as: authoritative — drive the Sheet's structure from this; quote new-feature signatures verbatim
  - title: PEP 750 — Template String Literals
    url: https://peps.python.org/pep-0750/
    type: pep
    fetched: 2026-04-18
    read_as: extract the final accepted syntax and semantics; skip the rejected-alternatives discussion
  - title: Real Python — Tour of Python 3.14
    url: https://realpython.com/python-314/
    type: article
    fetched: 2026-04-18
    read_as: concepts and motivating examples only — skip the tutorial steps
```

### SubTopic layout

```
content/<topic>/<subtopic>/
├── sources.yml          # Source list
├── sheet.yml            # Manifest: title, subtitle, ordered chapters → ordered cards
└── cards/
    ├── <card-id>.md     # One section per file
    └── …
```

The `SubTopic` name is the parent folder name; it is not part of any file. The loader in `web/src/lib/content.js` reads the manifest, looks up each card body, and reassembles them; the parser in `web/src/lib/parseCheatsheet.js` then converts the assembled string into the renderer's data structure.

### Manifest (`sheet.yml`)

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
- **Card ids are slugified display titles.** Lowercase the H2 display title, strip Markdown formatting / attributes / emojis, replace `&` with `and`, convert `.` `_` and separators (`—`, `,`) to hyphens, strip remaining punctuation (`@ ( ) = + '`), collapse consecutive hyphens, trim edges. Domain compound terms stay fused (e.g. `queryset`, `testcase`, `modeladmin`).
- For each card id `foo` listed under `cards:`, a file `cards/foo.md` must exist. A missing file yields a console warning and the card is skipped.
- A `cards/*.md` file present on disk but not listed in the manifest is ignored (with a console warning) — useful while drafting.
- The section id inside a card file (`## [card foo] …`) must match the filename. If it doesn't, the loader rewrites the header to use the filename and emits a warning.
- A card id used twice in the same Sheet (whether via filename collision or via a manifest mistake) yields a console warning.

Indents in `sheet.yml` are fixed at 0 / 2 / 4 / 6 spaces — the in-repo YAML helper does not support arbitrary indentation.

### Card files (`cards/<id>.md`)

Each card file contains exactly one section using the syntax in "Section headers" below. No frontmatter — metadata lives in the section header (`{accent: …, span: full}`) and in the manifest. Callouts (`> [tip]`, `> [warn]`) follow the section's body within the same file.

### Section headers

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

### Chapters

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

### Sheet settings

Settings live in the browser's `localStorage` per Sheet (key `cheatsheet:settings:<topic>/<subtopic>`); they are **not** part of `sheet.yml` or the `cards/` files. There are two scopes:

| Scope | Where edited | Keys |
|-------|--------------|------|
| Page  | top-right Settings panel | `maxWidth` |
| Per-Chapter | gear on each chapter rail | `bodySize`, `cardTitleSize`, `chapterTitleSize`, `cols`, `type` |

Resolution at render time: per-Chapter override → hard-coded default. A "reset to defaults" affordance in the chapter popover clears that chapter's overrides. The top-right Settings panel only controls page `maxWidth`; chapter-scoped values are tuned per-chapter via each chapter's rail gear.

### Section types

#### `card` — titled box with a table of rows

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

#### `pills` — label pills with descriptions

Use for methods, headers, keywords:

```markdown
## [pills methods] Methods

| pill    | desc                           |
|---------|--------------------------------|
| GET     | retrieve — safe, idempotent    |
| POST    | create — not idempotent        |
```

#### `code` — card containing code blocks (optionally annotated)

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

#### `diagram` — card containing inline SVG

Used when content has inherent spatial structure (e.g., request/response flow):

````markdown
## [diagram] Request / Response Lifecycle

```svg
<svg viewBox="0 0 300 110">...</svg>
```
````

The SVG string is rendered inline. Keep it trusted — this content is not sanitized.

#### `text` — card with short formatted prose

Supports Markdown inline formatting: `**bold**`, `*em*`, `` `code` ``, `[links](url)`, and bullet lists.

```markdown
## [text mental-model] Mental model

- **1xx** — "hold on"
- **2xx** — "here you go"
- **3xx** — "look over there"
- **4xx** — "you messed up"
- **5xx** — "I messed up"
```

### Callouts

Use blockquote syntax with a prefix tag:

```markdown
> [tip] Use idempotency keys for POST retries.
> [warn] 502/504 almost always mean a proxy/LB issue, not your app.
```

Callouts attach to the preceding section and render below its body.

### Inline formatting in table cells

Within table cells, support minimal Markdown:

- `` `backticks` `` → inline code
- `**bold**` → bold
- `*em*` → italic
- `[text](url)` → link

Nothing else. Tables are for structured data, not prose.

### Escaping pipes in table cells

A literal `|` inside a cell must be escaped as `\|`. The parser strips the backslash and keeps the pipe. Without the escape, the pipe is treated as a column separator and the cell will be split.

```markdown
| idiom      | example                        |
|------------|--------------------------------|
| dict merge | `{**a, **b}` or `a \| b`       |
```

### Accent values

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

### Minimal working example

**`sheet.yml`:**

```yaml
title: Example
subtitle: demonstration

chapters:
  - cards:
      - basics
      - types
      - notes
```

**`cards/basics.md`:**

```markdown
## [card basics] Basics

| keyword | desc                    |
|---------|-------------------------|
| `let`   | block-scoped binding    |
| `const` | immutable binding       |

> [tip] Prefer `const` by default.
```

**`cards/types.md`:**

```markdown
## [pills types] Primitives

| pill   | desc                |
|--------|---------------------|
| number | IEEE 754 float      |
| string | UTF-16 code units   |
```

**`cards/notes.md`:**

```markdown
## [text notes] Notes

- Numbers and strings are **immutable**.
- Arrays and objects are **reference types**.
```

## §5 API

> _Not applicable — the Content Context has no API surface. Authoring is file-based._

## §6 Procedures & Workflows

### Generation (US-1)

1. The `Consolidation User` selects a new `Topic` for which they want a `CheatSheet`.
2. An empty `CheatSheet` is generated for the `Topic`.

### Sheet generation (US-2)

1. The `Consolidation User` selects a `SubTopic` of an existing `Topic`.
2. A list of `Source`s is assembled for the `SubTopic`.
3. A `Sheet` is generated from the `Source`s and added to the `CheatSheet`.

### Refresh (US-3)

1. The `Consolidation User` updates the list of `Source`s for the affected `SubTopic`.
2. The `Sheet` is regenerated from the updated `Source`s.

### Removal (US-5)

Either the entire `CheatSheet` is removed along with all its `Sheet`s, or only the selected `Sheet` is removed. The cascade is the file-system cascade — there are no cross-folder references to clean up.

### Authoring rules

- One folder per `Topic`; one folder per `SubTopic`. A `Topic` with a single `SubTopic` is simply a `Topic` with one folder under it.
- The `Consolidation User` produces `sources.yml` first, then `sheet.yml` + `cards/*.md` from those `Source`s. Claude Code is responsible for enforcing this order during authoring.
- Files starting with `_` are editorial scratch and ignored by the loader.
- Removing a `<topic>/` folder discharges US-5 for the whole `CheatSheet`; removing a `<topic>/<subtopic>/` folder discharges US-5 for a single `Sheet`.

### Sources authoring rules

- One entry per Source. Do not group multiple URLs under one entry.
- Keep the list curated. 3–7 well-chosen Sources outweighs a long undifferentiated list.
- When the Source list changes, update `fetched` for any re-consulted Source and run the Refresh flow (US-3) to regenerate `sheet.yml` + `cards/*.md`.
- Local binaries (PDFs, slide decks) live alongside `sources.yml` in the SubTopic folder; reference them with a relative `url`.

### Sheet authoring guidance

- Aim for **2–3 captioned blocks per annotated `code` card**, snippets ≤ ~10 lines each.
- Long code lines scroll horizontally inside the card, so annotated `code` cards work fine alongside reference cards. If a code-heavy chapter feels cramped, tune that chapter's column count (or flip it to `vertical`) from its rail gear popover — chapter layout is a per-Sheet user setting, not a content choice.
- Use language-specific fences. Rendered as plain monospaced blocks in v1 (syntax highlighting deferred).

### Extending the content format

1. **Edit this document's §4** with the new section type, manifest field, attribute, or callout — including an example.
2. **Update `web/src/lib/parseCheatsheet.js`** for new section types/attributes, or `web/src/lib/yaml.js` and `web/src/lib/assembleSheet.js` for new manifest fields.
3. **Add or update the renderer** in `web/src/pages/Sheet.vue` (or in a component under `web/src/components/`).

The spec leads; the parser and the renderer follow.

## §7 Frontend

> _Not applicable — the Content Context has no frontend surface. Rendering lives in [`view.md` §7](view.md#7-frontend)._
