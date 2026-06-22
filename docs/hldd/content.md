# Content

> The Content Context covers the structure of subject matter the User has studied and the source material from which `Sheet[View]`s are built — `Topic`s, `SubTopic`s, and `Source`s. It also defines the User in their role as builder of `CheatSheet[View]`s.

## §1 Relationships

Pairs with the View Context. Each `Topic` in Content corresponds to one `CheatSheet[View]` in View — same underlying thing, different aspect (information vs rendered view). Each `SubTopic` corresponds 1:1 to a `Sheet[View]`. An `Artifact SubTopic` — a `SubTopic` whose `Sheet[View]` is an embedded artifact rather than authored cards — corresponds 1:1 to an `Embedded Sheet[View]` the same way. `Source`s are inputs to the pipeline; they are not directly visible through the View Context. The `Consolidation User` defined here is the same human as the `Reference User[View]` defined in View; the two roles capture different activities (building vs consuming) and may be carried out at different times by the same person.

## §2 Dictionary

| Term               | Definition                                                                                                                                                                                                                                                |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Topic              | A broad subject area the User has studied, considered as information (e.g., "Python", "HTTP", "Claude Code"). Same underlying thing as a CheatSheet, viewed from the information aspect.                                                                  |
| SubTopic           | A specific area or aspect within a Topic. The Topic→SubTopic split is intentionally flexible: SubTopics may be versions (Python 3.13, 3.14), facets (Commands, Agents, Skills), or any other partition chosen per Topic. Maps 1:1 to a Sheet. A SubTopic's Sheet is either authored from cards (the default) or embedded as a pre-built artifact (an Artifact SubTopic).              |
| Artifact SubTopic  | A SubTopic whose Sheet is a single pre-built, self-contained HTML artifact (its own markup, CSS, and optional JS) embedded as-is, rather than a Sheet authored from cards. Produced outside the Source-driven Generation pipeline (e.g. a Claude Code artifact) and dropped in unchanged. Maps 1:1 to an Embedded Sheet in the View Context.            |
| Source             | An external resource consulted when producing a Sheet for a SubTopic — book/PDF, article/URL, video, or any other document. Sources are inputs to consolidation; they are not directly visible to the User through Sheets.                                |
| Generation         | An iterative process between the Consolidation User and the Agent that follows given specifications to produce or update a Sheet. Each Generation may span multiple rounds of review and revision until the Consolidation User accepts the result.         |
| Consolidation User | The User acting to build or extend a CheatSheet: selecting Topics and SubTopics, gathering Sources, and producing the Sheet. This act is itself an instance of Learning Consolidation. Same human as the Reference User defined in View; the role differs. |

## §3 User Stories

### US-1 — Generate a new CheatSheet

[Contexts: Content]

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

---

### US-embed-artifact — Embed a pre-built Artifact as a Sheet

[Contexts: Content]

**As a** `Consolidation User`, \
**I can** add an `Artifact SubTopic` — a self-contained HTML artifact dropped in as the `Sheet` body — for a `SubTopic` slot, \
**so that** I can include an already-good pre-built artifact in my `CheatSheet` without converting it into cards.

#### AC-embed-artifact.1 — Embed an artifact as a new `Sheet` — Happy Path

```gherkin
Given a `CheatSheet` exists for a `Topic`,
    And the `Consolidation User` has a self-contained HTML artifact for a new `SubTopic`,
When the `Consolidation User` adds it as an `Artifact SubTopic` per the schema in §4,
Then a `Sheet` that renders the artifact appears in the `Topic`'s `CheatSheet`
```

## §4 Data Model

| Spec entity | File system artifact                                               | Notes                                                                   |
|-------------|--------------------------------------------------------------------|-------------------------------------------------------------------------|
| Topic       | `content/<topic>/`                                                 | Slug = folder name.                                                     |
| SubTopic    | `content/<topic>/<subtopic>/`                                      | Slug = `<topic>/<subtopic>`.                                            |
| Source      | An entry in `content/<topic>/<subtopic>/sources.yml`               | URL / PDF path / video link, type, title, fetched-at.                   |
| Sheet       | `content/<topic>/<subtopic>/sheet.yml` + `cards/*.md`              | Manifest + per-card Markdown files (schema below); rendered by the app. |
| Artifact SubTopic | `content/<topic>/<subtopic>/sheet.yml` (`kind: embed`) + `artifact.html`              | Embedded Sheet variant — a self-contained HTML page rendered as-is; no `cards/` (schema below). |
| CheatSheet  | The set of `sheet.yml` + `cards/` directories under one `<topic>/` | Synthesised at load time; not stored as a separate artifact.            |

### Topic: `topic.yml`

```yaml
title: Python                       # display name
subtitle: language reference across versions
default: "3.14"                     # SubTopic slug rendered when /<topic> is opened
```

All keys are optional. With no `default`, the loader picks the lexicographically last `SubTopic` (so version-named `SubTopic`s open on the newest).

### SubTopic: `sheet.yml`

```
content/<topic>/<subtopic>/
├── sources.yml          # Source list
├── sheet.yml            # Manifest: title, subtitle, ordered chapters → ordered cards
└── cards/
    ├── <card-id>.md     # One section per file
    └── …
```

The `SubTopic` name is the parent folder name; it is not part of any file. The loader in `web/src/lib/content.js` reads the manifest, looks up each card body, and reassembles them; the parser in `web/src/lib/parseCheatsheet.js` then converts the assembled string into the renderer's data structure.

Each SubTopic folder contains a `sheet.yml` manifest and a `cards/` subfolder with one Markdown file per card. The manifest lists the cards in order; the loader reads each card's Markdown file and rewrites its section header to match the filename if necessary.

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
- The section id inside a card file (`## [table foo] …`) must match the filename. If it doesn't, the loader rewrites the header to use the filename and emits a warning.
- A card id used twice in the same Sheet (whether via filename collision or via a manifest mistake) yields a console warning.

Indents in `sheet.yml` are fixed at 0 / 2 / 4 / 6 spaces — the in-repo YAML helper does not support arbitrary indentation.

### Artifact SubTopic: embedded Sheet (`kind: embed`)

An `Artifact SubTopic` replaces the `cards/` directory with a single self-contained HTML artifact. Its `sheet.yml` carries `kind: embed` and the display metadata only — no `chapters`:

```
content/<topic>/<subtopic>/
├── sources.yml          # optional — same Sources footer as a card-authored Sheet
├── sheet.yml            # title, subtitle, kind: embed   (no chapters)
└── artifact.html        # complete self-contained HTML page (own markup, CSS, optional JS)
```

```yaml
title: Some Artifact
subtitle: "as built"
kind: embed
```

Rules:

- `kind: embed` marks the `SubTopic` as an `Artifact SubTopic`. Absence of `kind` (with a `chapters:` manifest and a `cards/` directory) is the default card-authored Sheet.
- `title` and `subtitle` are scalar strings, exactly as for a card-authored Sheet.
- An `Artifact SubTopic` has no `chapters:` key and no `cards/` directory; an `artifact.html` must sit alongside `sheet.yml`.
- `artifact.html` is rendered as-is in an isolated style scope (see `view.md`); its styling is independent of the app theme.
- `sources.yml` is optional and, when present, renders the same Sources footer as a card-authored Sheet.

### Sources: `sources.yml`

Each `SubTopic` folder contains one `sources.yml` listing the `Source`s consulted to produce its `Sheet`. The deployed app surfaces them as a footer on each rendered `Sheet[View]` so the `Reference User` can jump to the original material.

```yaml
sources:
  - title: <human-readable title>
    url: <absolute URL or repo-relative path>
    type: doc | article | rfc | pep | video | pdf | other
    fetched: <ISO date YYYY-MM-DD>
    read_as: <one-line consolidation directive, optional>
```

| Field     | Required | Notes                                                                                                                                                  |
|-----------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `title`   | yes      | Display name of the Source.                                                                                                                            |
| `url`     | yes      | An absolute URL, or a repo-relative path for local files (e.g. PDFs in `content/<topic>/<subtopic>/`).                                                 |
| `type`    | yes      | One of: `doc` (official docs), `article` (blog / write-up), `rfc`, `pep`, `video`, `pdf`, `other`.                                                     |
| `fetched` | yes      | The date the Source was last consulted. ISO format, no time.                                                                                           |
| `read_as` | no       | One short line telling the `Consolidation User` *how* to read this Source when producing the Sheet: what to extract, what to skip, what role it plays. |

Example:

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

### Card file syntax

Each card file (`cards/<id>.md`) holds **exactly one section** — no frontmatter. All metadata lives in the section header and in `sheet.yml`.

#### Section header

An `H2` line, optionally tagged with a type and trailing attributes:

```
## [TYPE ID] Display Title {key: value, key: value}
```

- `TYPE` — the renderer: `table`, `code`, or `text` (see the per-type sections below). Omitted ⇒ `table`.
- `ID` — optional; the stable DOM id and search anchor. Defaults to the slugified title.
- `Display Title` — text shown on the card header.
- `{...}` — optional attributes (`accent`, `span`).

```markdown
## [table 2xx] 2xx — Success {accent: status-2xx}
## [code idioms] Idioms
## [text mental-model] Mental model
```

#### Attributes

- `{accent: …}` — card top-border colour: `status-2xx` / `status-3xx` / `status-4xx` / `status-5xx` (semantic), `neutral` (no border, the default), or a hex value (`{accent: #3776ab}`; quotes optional).
- `{span: full}` — span every column when the parent chapter renders as `columns`. No-op when the chapter is `vertical` (cards are already full-width there).

#### Callouts

Blockquotes with a prefix tag, attached to the preceding section and rendered below its body:

```markdown
> [tip] Use idempotency keys for POST retries.
> [warn] 502/504 almost always mean a proxy/LB issue, not your app.
```

#### Table cells

Within `table` cells, only inline Markdown is supported — `` `code` ``, `**bold**`, `*em*`, `[text](url)`, nothing else. Escape a literal pipe as `\|` (the backslash is stripped, the pipe kept); an unescaped `|` splits the cell.

#### Chapters

Cards are grouped into ordered **chapters**, declared in `sheet.yml` (`chapters:` — `title`, optional `id`, ordered `cards`; see *SubTopic: `sheet.yml`* above). A titled chapter renders with a rule above it and its title on a vertical left rail; a Sheet whose chapters carry no title renders as a single implicit chapter, with no rail or divider.

Chapter layout (`columns` masonry vs `vertical`), font sizes, and column count are **user-side Sheet settings** — not authored in `sheet.yml` or the card files.

### Card type: `table`

Primary format — a titled box with a table of rows.

**`cards/basics.md`:**

```markdown
## [table basics] Basics {accent: #3776ab}

| code | name    | desc                    | detail                              |
|------|---------|-------------------------|-------------------------------------|
| 200  | OK      | standard success        | Returns the resource in the body.   |
| 201  | Created | resource created        | Location header should point to it. |

> [tip] 201 with Location header is the REST-correct response to POST.
```

Columns: `code` (mono, bold), `name` (semibold), `desc` (muted), `detail` (muted prose sub-row beneath the row's cells, spanning full width). All columns optional except at least one content column. Non-standard column names are rendered as extra muted text.

### Card type: `code`

Code snippets where the *shape* of the code is the memory anchor — idiom references, file trees, settings excerpts, model definitions.

A `code` section's body is a sequence of **blocks**. Each block is:

- An optional `### sub-heading` — renders as a small uppercase label above the block. Skip for single-block cards where the card title names the snippet.
- An optional **preface** — prose before the opening fence. Renders as plain text above the code.
- A required fenced code block, optionally with a **filename** token (`` ```python settings.py ``). The filename renders as a file-tab header above the code box. Omit when the snippet doesn't represent a single named file (e.g. a tree, a shell session, a multi-file excerpt).
- An optional **caption** — prose after the closing fence. Renders in a left-bordered callout with a `why` chip.

All four are independently optional. A bare `[code]` card with one fence and no annotations parses to a single un-decorated block.

**Bare form — `cards/idioms.md`:**

````markdown
## [code idioms] Idioms

```python
# walrus operator
if (n := len(data)) > 10:
    print(f"{n=}")
```
````

**Single-block with preface and caption — `cards/project.md`:**

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

**Multi-block annotated form — `cards/project.md` (alternative):**

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

The first fence has no filename token (a tree spans multiple files), so no file-tab renders. The second fence's `settings.py` token renders as a file-tab header.

**Block-order rules:**

- **Golden rule — preface before code:** each block follows **preface → code snippet → caption**. The preface tells the reader what the snippet shows; inline comments carry per-line explanations; the caption is reserved for gotchas or non-obvious details that don't fit as comments. If preface + comments cover everything, drop the caption. Never put a code snippet first with the explanation after it.
- Inline Markdown only: `**bold**`, `*em*`, `` `code` ``, `[links](url)`. No bullets, no headings.
- Multi-paragraph allowed; blank lines separate paragraphs.
- A caption attaches to the **preceding** fence; a preface attaches to the **following** fence. A `### heading` not followed by a fence is dropped (parser emits a `console.warn`).

### Card type: `text`

Short formatted prose. Supports `**bold**`, `*em*`, `` `code` ``, `[links](url)`, and bullet lists.

**`cards/mental-model.md`:**

```markdown
## [text mental-model] Mental model

- **1xx** — "hold on"
- **2xx** — "here you go"
- **3xx** — "look over there"
- **4xx** — "you messed up"
- **5xx** — "I messed up"
```

## §5 API

> _Not applicable — the Content Context has no API surface. Authoring is file-based._

## §6 Procedures & Workflows

> _To be defined._

## §7 Frontend

> _Not applicable — the Content Context has no frontend surface. Rendering lives in [`view.md` §7](view.md#7-frontend)._
