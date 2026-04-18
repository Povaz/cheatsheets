# Claude Code Handoff: Personal Cheatsheets Web App

## Your role

You're implementing a personal cheatsheet web app from an empty repo. Requirements and architecture have been worked out in a prior conversation — execute the plan, don't re-derive it. Ask clarifying questions only if something is genuinely ambiguous.

**Work in phases** (defined at the bottom). Stop at each checkpoint and confirm the app runs before moving on. Do not try to do everything in one shot.

---

## Context: what this is and who operates it

The user has a photographic memory. He studies best from single-page, information-dense reference sheets with a strong spatial structure. He wants this for IT/CS topics.

The critical thing to understand: **the user will not be editing the code.** He is a backend developer, not a frontend developer. He expects to interact with this project exclusively through:

1. Writing prompts to Claude Code asking for new cheatsheets or edits to existing ones.
2. Occasionally editing the Markdown content files directly, if he sees something wrong.
3. `git commit && git push` to trigger deploys.

That means **the content format is the stable contract between the user and Claude**, not the code. The code should be simple enough that Claude Code can always re-derive it if needed. The content format should be rich enough to capture what cheatsheets need, and documented thoroughly so future Claude sessions can author new cheatsheets without needing to read the source code.

Optimize accordingly:
- **Keep the architecture minimal.** If you're reaching for a `composables/` folder for a personal SPA with ~2 cheatsheets at launch, you're over-engineering. Flat structure, small files, minimum viable abstraction.
- **Invest in the author-facing documentation** — `CLAUDE.md`, `docs/CONTENT_FORMAT.md`, and the slash commands under `.claude/commands/`. These are more important than the code. They're the interface the user operates through.

---

## Decision summary (what was chosen and why)

- **Static Vue 3 + Vite SPA.** Personal tool, small scale, GitHub Pages hosting. No server.
- **Plain Vue 3 + Tailwind.** Rejected Vuetify — MD3 aesthetic fights the minimalist direction, and we'd pull in ~300KB for 2 components.
- **No Pinia, no composables folder.** State is simple: a search query ref, a marks object keyed by slug, a collapsed object keyed by slug. All lives in a single `store.js` that exports refs. Done.
- **Hash routing.** Simplest for GitHub Pages, no server rewrites needed.
- **Markdown content files with YAML frontmatter.** Parsed into a structured object at build time via `import.meta.glob`. Human-writable, diff-friendly, portable.
- **Hierarchical slugs**: `topic/variant` (e.g., `python/3.14`, `python/3.13`). Flat topics use just the topic slug (e.g., `http`).
- **Every topic is a folder.** Even flat topics. Keeps the loader uniform and gives research notes a home.
- **Research-driven authoring workflow.** Three slash commands (`/new-cheatsheet`, `/refresh-cheatsheet`, `/review-cheatsheet`) formalize a three-phase pipeline: research → distill → render, with approval gates between phases. Research notes are committed alongside content.
- **Format spec is extracted into its own file** (`docs/CONTENT_FORMAT.md`), not embedded in `CLAUDE.md`. Single source of truth, precise named dependency for the slash commands.
- **PDF export is explicitly deferred.** An `@media print` stylesheet can be added later. For v1, the app is web-only.
- **No TypeScript, no tests.** JSDoc on the parser. Vitest can come later if the parser grows teeth.

---

## Aesthetic direction (do not default to generic styling)

The aesthetic is **refined technical minimalism**. Think: developer documentation that's been sweated over. Match it precisely.

- **Warm off-white background** `#faf8f5`. Not white, not dark mode.
- **Single burnt-orange accent** `#c1440e`. Used sparingly.
- **Typography**: `JetBrains Mono` for everything body/UI. `Fraunces` (serif, 800 weight, variable) only for the big cheatsheet title. No Inter, no Roboto, no system sans.
- **Hairline borders** `#e4e0d9`. Minimal shadow `0 1px 2px rgba(0,0,0,0.04)`.
- **Density over whitespace.** Font sizes 10–13px. Line-height 1.4–1.45. Card padding 8–12px. This is a reference sheet, not a landing page.
- **Uppercase section labels** with wide letter-spacing (`tracking: 0.12em`).
- **No emoji, no illustrations, no decorative SVG blobs.** Functional SVG diagrams only, when content demands them.
- **Status/category accents** (for categorized cards): `#2d5016` green, `#8b4513` brown, `#7f1d1d` red, `#4b3680` indigo. Applied as a top border on the card, not a full fill.

A reference HTML prototype will be placed at `/reference/prototype.html` (user will drop it in). Treat it as the visual spec — match it.

---

## Hierarchical cheatsheet model

Cheatsheets form a two-level hierarchy: **topic → variant**.

- Some topics have multiple variants: `python/3.14`, `python/3.13`, `python/3.12`.
- Some topics are flat: `http` (no variants).

### Folder structure

Every topic is a folder, regardless of whether it has variants. This keeps the content loader uniform and gives research notes a home.

```
content/
├── python/
│   ├── _topic.yml             # topic-level metadata (optional)
│   ├── _research-3.14.md      # research note for 3.14 variant
│   ├── _research-3.13.md      # research note for 3.13 variant
│   ├── 3.14.md                # variant → slug "python/3.14"
│   └── 3.13.md                # variant → slug "python/3.13"
└── http/
    ├── _research.md           # research note (no variant suffix for flat topics)
    └── http.md                # flat topic → slug "http"
```

**Folder conventions:**
- A folder with **multiple non-underscore `.md` files** is a multi-variant topic. Each `.md` is one variant.
- A folder with **exactly one non-underscore `.md` file** is a flat topic. Its slug is just the folder name.
- Files beginning with `_` are metadata/research notes and are ignored by the content loader.
- Research notes: `_research.md` for flat topics, `_research-<variant>.md` for multi-variant topics.

The content loader in `src/lib/content.js` should iterate directories under `content/`, ignore `_`-prefixed files inside each, and classify as flat or multi-variant based on the count of remaining `.md` files.

### Routing

- `#/` → home page, lists topics.
- `#/python` → topic page (auto-redirects to default variant, or lists variants if no default set).
- `#/python/3.14` → specific variant cheatsheet.
- `#/http` → flat-topic cheatsheet (skips the topic page).

### Header variant switcher

When viewing a variant cheatsheet, render a compact variant switcher in the header:

```
  [Python 3.14 ▼]   [3.14] [3.13] [3.12]
```

Click-to-switch. Current variant gets the accent treatment. Keyboard: `Cmd/Ctrl + [` and `Cmd/Ctrl + ]` cycle variants.

---

## Initial content

Ship the repo with one complete cheatsheet and two stubs:

### 1. `content/python/3.14.md` — **full content, this is the hero cheatsheet**

Must include:

**Python basics (all versions)**:
- Data types: `int`, `float`, `str`, `bool`, `list`, `tuple`, `dict`, `set`, `frozenset`, `bytes`, `None`. Short inline examples.
- Control flow: `if/elif/else`, `match/case` (structural pattern matching), `for`, `while`, `break/continue`, `try/except/else/finally`, `with`.
- Functions: `def`, default args, `*args`/`**kwargs`, keyword-only, positional-only (`/`), type hints basics, `lambda`.
- Comprehensions: list/dict/set/generator comprehensions with filter clauses.
- Classes: `class`, `__init__`, inheritance, `@dataclass`, `@property`, `@classmethod`/`@staticmethod`, dunder methods reference table.
- Standard library highlights: `pathlib`, `itertools`, `functools` (lru_cache, partial), `collections` (Counter, defaultdict, deque), `typing`, `dataclasses`, `contextlib`.
- Async: `async def`, `await`, `asyncio.run`, `async for`, `async with`.
- Common idioms: f-strings (with formatting spec + `=` debug syntax), unpacking (`*`, `**`, star-expressions), walrus operator `:=`, ternary, `enumerate`/`zip`.

**Python 3.14-specific (changes from 3.13)** — verify each against the primary source:
- PEP 779 — free-threaded Python (no-GIL) officially supported (still opt-in build).
- PEP 750 — t-strings (template strings), syntax and rationale.
- PEP 649 — deferred evaluation of annotations becomes the default behavior.
- PEP 758 — `except` / `except*` without parentheses when catching multiple exceptions.
- PEP 784 — Zstandard compression in the stdlib (`compression.zstd`).
- PEP 765 — disallow `return`/`break`/`continue` in `finally` blocks (now a SyntaxWarning).
- Incremental garbage collector changes.
- Interpreter improvements: tail-call dispatching, color tracebacks on by default.
- REPL improvements (multi-line editing, syntax highlighting carried forward from 3.13).

**IMPORTANT: verify these with the Python 3.14 release notes before finalizing.** The What's New document for Python 3.14 is the authoritative source. Use WebFetch to pull https://docs.python.org/3/whatsnew/3.14.html and cross-reference. If any PEP number or feature is wrong or omitted, correct it from the primary source. Do not invent features that aren't in the actual release.

Structure the Python cheatsheet with a layout that plays to the memory-palace use case:
- Top strip: title + variant switcher + "What's new in 3.14" callout card with 5–6 one-line highlights.
- Main body: ~6 cards arranged in a 3×2 grid covering basics + stdlib + async + idioms + 3.14 features + common traps.
- Use the `detail:` field on rows for expanded explanations (shown in modal on click).

### 2. `content/python/3.13.md` — **stub**

Frontmatter + one section card describing "3.13-specific features vs 3.12" briefly (free-threaded Python experimental, new REPL, `dbm.sqlite3`, etc.). Doesn't need to be comprehensive — its job is to prove the variant switcher works and give the user a second variant to compare against.

### 3. `content/http/http.md` — **stub**

Minimal flat-topic cheatsheet (HTTP methods + 2xx/4xx status codes, two cards total). Its job is to prove the flat-topic routing works and demonstrate a second content style.

### Important note on initial build workflow

**Do NOT invoke `/new-cheatsheet` to create these initial content files.** The slash command depends on the app being functional enough to verify rendering in its Phase 3. During the initial build, create content files directly as part of Phase 2 scaffolding (below).

The slash commands become the standard workflow *after* the initial project is shipped and running. The first time `/new-cheatsheet` is invoked should be for content added *after* the initial repo is complete.

That said, *do* create `_research-3.14.md` as part of scaffolding the Python 3.14 cheatsheet. Follow the format the slash command will later use (see the command spec in the Appendix). The 3.13 and HTTP stubs don't need research notes — a comment in the file noting they're stubs is fine.

---

## Content format

Content format rules are **the stable contract** between the user, Claude Code, and the application. They are authoritative and live in `docs/CONTENT_FORMAT.md`, which is the single source of truth.

The full spec below must be copied verbatim into `docs/CONTENT_FORMAT.md` during Phase 5. `CLAUDE.md` gets only a summary paragraph and a pointer to the spec.

---

### [Begin `docs/CONTENT_FORMAT.md` content]

# Cheatsheet Content Format

This is the authoritative specification for cheatsheet source files. All content in `content/` must conform to this format. The parser in `src/lib/parseCheatsheet.js` implements this spec.

If you need to extend the format (new section type, new attribute, new callout), amend this document *first*, then update the parser to match. Content files should never drive parser changes — the parser exists to serve this spec.

## Frontmatter

```yaml
---
title: Python                   # display name (topic)
variant: "3.14"                 # optional — omit for flat topics
subtitle: "language reference + 3.14 features"
accent: '#3776ab'               # hex color for this sheet's accent (overrides default orange)
layout: grid                    # 'grid' (default) | 'columns'
---
```

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
- `{...}` — optional attribute block. Common attrs: `accent`, `cols`.

If no type tag is given, defaults to `card`.

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

Columns: `code` (mono, bold), `name` (semibold), `desc` (muted), `detail` (hidden, shown in modal on row click). All columns optional except at least one content column. Non-standard column names are rendered as extra muted text.

### `pills` — label pills with descriptions

Use for methods, headers, keywords:

```markdown
## [pills methods] Methods

| pill    | desc                           |
|---------|--------------------------------|
| GET     | retrieve — safe, idempotent    |
| POST    | create — not idempotent        |
```

### `code` — card containing code blocks

Use for idiom references:

````markdown
## [code idioms] Idioms

```python
# walrus operator
if (n := len(data)) > 10:
    print(f"{n=}")

# match / case
match point:
    case (0, 0): "origin"
    case (x, 0): f"on x-axis at {x}"
```
````

Use language-specific fences. Rendered as a plain monospaced block in v1 (syntax highlighting deferred).

### `diagram` — card containing inline SVG

Used when content has inherent spatial structure (e.g., request/response flow):

````markdown
## [diagram] Request / Response Lifecycle

```svg
<svg viewBox="0 0 300 110">...</svg>
```
````

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

Callouts attach to the preceding section.

## Inline formatting in table cells

Within table cells, support minimal Markdown:
- `` `backticks` `` → inline code
- `**bold**` → bold
- `*em*` → italic

Nothing else. Tables are for structured data, not prose.

## Accent values

In `{accent: ...}`:
- `status-2xx`, `status-3xx`, `status-4xx`, `status-5xx` — semantic
- `neutral` — no top border (default)
- Hex value (`#3776ab`) — custom
- Any of the aesthetic-direction status colors

## Minimal working example

```markdown
---
title: Example
variant: "1.0"
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

### [End `docs/CONTENT_FORMAT.md` content]

---

## Tech stack (exact)

```
vue@^3.4
vue-router@^4.3           (hash mode)
vite@^5
@vitejs/plugin-vue
tailwindcss@^3            (NOT v4)
postcss
autoprefixer
gray-matter               (frontmatter)
```

No other runtime deps. If a feature seems to need a library, ask before adding it.

---

## Target file structure (final, do not expand)

```
cheatsheets/
├── content/
│   ├── python/
│   │   ├── _topic.yml
│   │   ├── _research-3.14.md
│   │   ├── 3.14.md
│   │   └── 3.13.md
│   └── http/
│       └── http.md
├── docs/
│   └── CONTENT_FORMAT.md          # authoritative content format specification
├── src/
│   ├── components/
│   │   ├── Card.vue
│   │   ├── CodeRow.vue
│   │   ├── PillRow.vue
│   │   ├── Callout.vue
│   │   ├── DetailModal.vue
│   │   ├── SearchBar.vue
│   │   ├── VariantSwitcher.vue
│   │   └── Toast.vue
│   ├── pages/
│   │   ├── Home.vue
│   │   ├── Topic.vue
│   │   └── Cheatsheet.vue
│   ├── lib/
│   │   ├── parseCheatsheet.js
│   │   └── content.js             # discovery + lookup via import.meta.glob
│   ├── store.js                   # shared refs for search, marks, collapse
│   ├── router.js
│   ├── App.vue
│   ├── main.js
│   └── index.css
├── public/
│   └── favicon.svg
├── reference/                     # user drops the HTML prototype here
├── .claude/
│   └── commands/
│       ├── new-cheatsheet.md      # see Appendix
│       ├── refresh-cheatsheet.md
│       └── review-cheatsheet.md
├── .github/workflows/pages.yml
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .gitignore
├── CLAUDE.md
└── README.md
```

That's ~25 source files. If you find yourself creating more, push back — probably a sign of over-abstraction.

### Notes on the structure

- `store.js` — single file, ~30–50 lines. Exports refs for `searchQuery`, `marksBySlug`, `collapsedBySlug`, and a couple of helpers. No Pinia. No composables folder. The whole state fits on one screen.
- `pages/` not `views/` — shorter, same meaning, standard in many Vue projects.
- Components in a flat folder — 8 components total, no nesting needed.
- No separate `TheHeader.vue` — the header is inline in `App.vue` since it's simple and shared across all pages. If it grows, split it later.
- `docs/` is for developer/author-facing documentation. Today it contains only `CONTENT_FORMAT.md`. If the user later wants an architecture note or a changelog, they go here too.

---

## Interactive features

**v1 must have**:

1. **Live search** — filters rows across all cards. Non-matching rows dim to 25% opacity (preserves spatial layout, which is the whole point for memory). Matches against all string fields in each row.
2. **Keyboard shortcut**: `/` focuses search (unless already in an input). `Esc` clears search or closes modal.
3. **Mark rows as known/learning** — click a dot to cycle: unmarked → known (green) → learning (amber) → unmarked. Persist to `localStorage`, keyed by `cheatsheet:marks:{slug}` where slug is the full `topic/variant` path.
4. **Progress indicator** `X/N known` in header for current sheet.
5. **Collapse card sections** — click card header to fold. Persist to localStorage.
6. **Copy-to-clipboard** — hover row, click icon, toast confirms.
7. **Detail modal** — click a row, modal shows the `detail` field + any extra metadata. Esc or backdrop closes.
8. **Responsive**:
   - `>1100px`: up to 3 cards per row
   - `700–1100px`: 2 cards per row
   - `<700px`: single column
9. **Hash routing** with topic / variant paths as described above.
10. **Variant switcher** when viewing a multi-variant topic.

**v1 explicitly not included** (can be added later):
- PDF export (`@media print`)
- Dark mode
- Cross-cheatsheet search
- Syntax highlighting for code blocks (plain monospace is fine for v1)
- Any kind of sync / auth / editing-in-browser

---

## Authoring pipeline (slash commands)

The user authors cheatsheets through three Claude Code slash commands, not by hand. The commands formalize a three-phase pipeline with approval gates between phases.

### Design decisions

1. **Three phases produce three artifacts.** Each phase outputs a durable file: Phase 1 produces `_research.md`, Phase 2 produces the content `.md`, Phase 3 produces a rendered page in the running dev server. This means any phase can be redone without losing prior work.

2. **Approval gates between every phase.** Source approval before content writing, content approval before rendering. Phases must STOP and wait for confirmation — they must not auto-continue.

3. **`_research.md` is committed** alongside content. It's an audit trail (why does the cheatsheet look the way it does), a basis for refreshes (diff against old sources), and a target for `/review-cheatsheet` accuracy checks.

4. **Section IDs and ordering are preserved during refresh.** The user's photographic memory is keyed to spatial layout. Refreshes edit in place, they don't reshuffle.

5. **`/review-cheatsheet` is read-only.** It produces a `_review-<date>.md` note but does not edit content. The user decides what to act on.

6. **Slash commands reference `docs/CONTENT_FORMAT.md` for format rules** and `CLAUDE.md` for editorial guidance. The two roles are distinct: `CONTENT_FORMAT.md` is syntax, `CLAUDE.md` is judgment.

### Command files to create

Create these three files in `.claude/commands/` during Phase 5 (Polish). Exact contents provided in the Appendix at the end of this handoff.

- `.claude/commands/new-cheatsheet.md`
- `.claude/commands/refresh-cheatsheet.md`
- `.claude/commands/review-cheatsheet.md`

### Ongoing rule

When the user asks for a format change ("let me add a `glossary` section type"), the amendment order is:

1. Edit `docs/CONTENT_FORMAT.md` to document the new type.
2. Update `src/lib/parseCheatsheet.js` to parse it.
3. Add/update the component that renders it.

Never implement a format change without first updating `docs/CONTENT_FORMAT.md`. The spec leads; the code follows.

Similarly, when the user asks for a pipeline change ("I want Phase 1 to also survey existing public cheatsheets on the topic"), edit the relevant `.claude/commands/*.md` file and commit the change. The pipeline evolves with experience.

---

## GitHub Pages deploy

`vite.config.js`:
```js
base: mode === 'production' ? `/${process.env.REPO_NAME || 'cheatsheets'}/` : '/'
```

`.github/workflows/pages.yml`: on push to `main`, checkout → setup-node → npm ci → npm run build → upload artifact → deploy-pages. Standard template from the official GitHub Pages docs.

Hash routing means no 404.html redirect needed.

---

## What goes in `CLAUDE.md`

`CLAUDE.md` is read automatically by Claude Code at session start. It orients the session. It is **not** the format spec — that's in `docs/CONTENT_FORMAT.md`.

Structure:

1. **Project context** — one paragraph. "Personal cheatsheet web app. The user is a backend developer, not a frontend developer. He interacts with this project by asking Claude Code to add or edit cheatsheets. Do not expect him to edit code."

2. **The ONE rule** — "To add a cheatsheet, create a `.md` file in `content/<topic>/`. That's it. Do not touch the Vue app."

3. **Authoring workflow** — point to the slash commands:
   ```markdown
   ## Authoring workflow

   To create, update, or review cheatsheets, use the slash commands in `.claude/commands/`:

   - `/new-cheatsheet <topic>` — create a new cheatsheet (3-phase pipeline with approval gates)
   - `/refresh-cheatsheet <topic>` — update an existing cheatsheet against current primary sources
   - `/review-cheatsheet <topic>` — read-only quality review

   These commands define the authoritative procedure. The workflow has approval gates — do not skip them, do not auto-continue between phases.

   Research notes (`_research.md`) are committed alongside content. They are the audit trail and the basis for refreshes.
   ```

4. **Content format summary** — one paragraph describing the format shape and a pointer:
   ```markdown
   ## Content format

   Each cheatsheet is a Markdown file with YAML frontmatter plus `H2` section headers with type tags (`## [card id] Title`). Section bodies are typically tables. Callouts use `> [tip]` / `> [warn]` blockquote syntax.

   The full format specification lives in **`docs/CONTENT_FORMAT.md`**. Any session authoring content must read it before writing. The summary above is orientation only; the spec is authoritative.
   ```

5. **File placement rules** — flat vs. multi-variant topics with concrete examples. This is project convention, not format syntax, so it stays in `CLAUDE.md`.

6. **Authoring guidance** — editorial, not technical. Density targets (40–80 entries, 5–8 cards), when to pick each section type, how to use `detail` fields, when to split into variants. Judgment advice.

7. **Research and refresh guidance** — WebFetch primary sources, verify against authoritative docs, keep `_research.md` committed, update it during refreshes rather than overwriting.

8. **Iteration patterns** — how to respond to common user feedback:
   - "Sparse" → add rows to existing cards or add a card for an adjacent topic.
   - "Dense" → split into variants or move low-priority rows to `detail` fields.
   - "Wrong structure" → try a different `layout`, reorder sections, change section types.
   - "Hard to remember" → the spatial layout matters. Rearrange so related topics are adjacent; pick memorable section IDs as memory anchors.

9. **Do-not list** — things to avoid:
   - Do not add new dependencies without asking.
   - Do not add section types that aren't in `docs/CONTENT_FORMAT.md`. Amend the spec first.
   - Do not rewrite the parser or components to accommodate one-off content needs. Change the content, not the code.
   - Do not add tests unless asked.
   - Do not auto-format existing Markdown content. Leave it alone.
   - Do not duplicate format rules between `CLAUDE.md` and `docs/CONTENT_FORMAT.md`. The spec is the single source of truth.

---

## What goes in `README.md`

Short and user-facing. Structure:

1. **One-line description** — "My personal cheatsheet collection. Built with Vue + Vite."
2. **Live link** — placeholder for GitHub Pages URL; user will fill in.
3. **Available cheatsheets** — list with links, grouped by topic:
   ```
   - **Python** — 3.14, 3.13
   - **HTTP** — status codes, methods, headers
   ```
4. **Adding or updating cheatsheets** — point to slash commands:
   ```
   Use Claude Code slash commands:
   - `/new-cheatsheet <topic>` — create a new one
   - `/refresh-cheatsheet <topic>` — update against current sources
   - `/review-cheatsheet <topic>` — get improvement suggestions

   See `.claude/commands/` for the detailed pipelines and `docs/CONTENT_FORMAT.md` for the content syntax.
   ```
5. **Running locally** — `npm install`, `npm run dev`.
6. **Deploying** — "Push to main. GitHub Actions deploys to Pages automatically. Enable Pages in repo settings with source = GitHub Actions."

Don't include a tech-stack listicle, a table of contents, a contributing section, or badges. It's a personal project.

---

## Phased execution plan

**Phase 1 — Scaffold**
- `npm create vite` with vue template
- Install deps
- Configure Tailwind with the theme
- Write `index.css` with `@layer base` (fonts, body) and `@layer components` (section-label, pill, kbd, tool-btn, callout-tip, callout-warn)
- Configure `vite.config.js` base path
- Google Fonts link in `index.html`
- **Checkpoint: `npm run dev` serves a blank paper-colored page with JetBrains Mono loaded.**

**Phase 2 — Content pipeline**
- `src/lib/parseCheatsheet.js` — parses one Markdown file into the structured section object. Cover all section types (`card`, `pills`, `code`, `diagram`, `text`), callouts, and inline cell formatting.
- `src/lib/content.js` — uses `import.meta.glob('../../content/**/*.md', { query: '?raw', eager: true })` to discover all content. Iterates topic folders, ignores `_`-prefixed files, classifies flat vs. multi-variant. Exports `topics` (array) and `getCheatsheet(topic, variant?)`.
- Parse `_topic.yml` files if present for topic-level metadata.
- **For `python/3.14.md`, WebFetch the official 3.14 What's New document and verify every version-specific feature before committing.** Also write `content/python/_research-3.14.md` capturing the sources and findings (use the format the `/new-cheatsheet` command will later use — see Appendix).
- Write the 3.13 and HTTP stubs. Research notes not required for stubs.
- Add `console.log(topics)` in `main.js` temporarily — confirm the parsed structure matches expectation.
- **Checkpoint: content parses correctly. Remove the debug console.log. Pause here and show the parsed output to the user for format confirmation before continuing.**

**Phase 3 — Components**
- `Card.vue` — colored top border, header with title / count / collapse chevron, slot for body content
- `CodeRow.vue` — grid row for `card` sections; mark dot, code (mono bold), name, desc, copy button on hover; row click opens detail modal
- `PillRow.vue` — pill + description row for `pills` sections
- `Callout.vue` — tip / warn variants
- `DetailModal.vue` — teleport, backdrop, Esc
- `SearchBar.vue` — `/` shortcut, clear on Esc
- `VariantSwitcher.vue` — pills showing sibling variants, clickable, keyboard nav
- `Toast.vue` — fixed bottom-center, auto-dismiss

**Phase 4 — Pages, routing, store**
- `src/store.js` — exports `searchQuery`, `marksFor(slug)`, `toggleMark(slug, id)`, `collapsedFor(slug)`, `toggleCollapsed(slug, sectionId)`. All backed by localStorage. ~40 lines total.
- `router.js` — hash history. Routes: `/`, `/:topic`, `/:topic/:variant`, catch-all to `/`.
- `pages/Home.vue` — list of topics with variant counts, links to topic pages or flat cheatsheets.
- `pages/Topic.vue` — rendered for multi-variant topics without a specific variant. Shows variants as cards with brief descriptions, redirects to default if set.
- `pages/Cheatsheet.vue` — loads cheatsheet by slug, renders sections based on `section.type`, includes variant switcher if multi-variant.
- `App.vue` — header (title + search + progress + variant switcher), `<RouterView />`, toast mount point.

**Phase 5 — Polish, docs, deploy**
- Simple favicon (burnt-orange letter mark SVG)
- **Create `docs/CONTENT_FORMAT.md`** with the full spec from this handoff (the [Begin/End `docs/CONTENT_FORMAT.md` content] block above).
- **Write `CLAUDE.md`** per the spec in this handoff. Format summary + pointer to `docs/CONTENT_FORMAT.md`, not the full spec.
- **Write `README.md`** per the spec in this handoff.
- **Create the three slash command files** in `.claude/commands/` using the verbatim contents in the Appendix.
- `.github/workflows/pages.yml` — standard Vite-on-Pages workflow
- `npm run build && npm run preview` — verify prod build works with correct base path
- **Final checkpoint: production build serves correctly, routing works with hash paths, content renders matching the prototype aesthetic.**

---

## Definition of done

- [ ] `npm run dev` serves a working app
- [ ] Home page lists Python (with variant count) and HTTP as separate topic entries
- [ ] `/python` shows variant selector, links to 3.14 and 3.13
- [ ] `/python/3.14` renders the full Python cheatsheet with verified-correct 3.14 features
- [ ] `/python/3.13` renders the stub cheatsheet
- [ ] `/http` renders the flat HTTP cheatsheet directly (no topic page)
- [ ] Variant switcher appears on variant pages and works (click + keyboard)
- [ ] Search dims non-matching rows, preserves layout
- [ ] `/` focuses search, `Esc` clears / closes
- [ ] Marks cycle and persist per slug
- [ ] Collapse state persists per slug
- [ ] Row click opens detail modal with `detail` field content
- [ ] Copy-to-clipboard works with toast
- [ ] Responsive at 1200 / 900 / 600px
- [ ] `npm run build && npm run preview` serves correctly
- [ ] `.github/workflows/pages.yml` is present and correct
- [ ] `docs/CONTENT_FORMAT.md` exists and contains the full format spec as a self-contained reference
- [ ] `CLAUDE.md` contains a brief format summary and explicit pointer to `docs/CONTENT_FORMAT.md` (not the full spec)
- [ ] `README.md` lists available cheatsheets with hierarchical structure
- [ ] `.claude/commands/new-cheatsheet.md` is present and valid
- [ ] `.claude/commands/refresh-cheatsheet.md` is present and valid
- [ ] `.claude/commands/review-cheatsheet.md` is present and valid
- [ ] The three slash command files reference `docs/CONTENT_FORMAT.md` for format rules and `CLAUDE.md` only for editorial/workflow guidance
- [ ] No duplication of format rules between `CLAUDE.md` and `docs/CONTENT_FORMAT.md`
- [ ] `content/python/_research-3.14.md` exists with sources and findings matching the `/new-cheatsheet` format

---

## One final instruction

Do not skip the WebFetch research step for Python 3.14. The user will notice if a PEP number is wrong or a feature is missing. Training data on Python 3.14 may be incomplete or outdated depending on session timing. Primary sources are authoritative.

---

# Appendix: Slash command file contents

Create each of these verbatim. The triple-backtick fences in this appendix delimit the file content — strip them when writing the actual files.

---

## `.claude/commands/new-cheatsheet.md`

````markdown
---
description: Create a new cheatsheet following the research → distill → render pipeline
argument-hint: <topic> [version/variant]
---

# New Cheatsheet Authoring Pipeline

You are creating a new cheatsheet for this project. Follow the three phases below in order. **Do not skip phases. Do not combine phases.** Stop at each approval gate and wait for explicit user confirmation before proceeding.

The topic requested: **$ARGUMENTS**

---

## Before you begin

1. Read `CLAUDE.md` for project orientation and editorial guidance (density targets, when to use each section type).
2. Determine whether this is a **flat topic** (e.g., `http`, `regex`) or a **multi-variant topic** (e.g., `python 3.14`, `postgres 16`). Multi-variant topics are ones where the technology has meaningful versions the user would want to compare. If it's ambiguous, ask the user.
3. Derive the slug:
   - Flat topic → `<topic>` (e.g., `regex`), content at `content/<topic>/<topic>.md`, research at `content/<topic>/_research.md`
   - Multi-variant → `<topic>/<variant>` (e.g., `python/3.14`), content at `content/<topic>/<variant>.md`, research at `content/<topic>/_research-<variant>.md`
4. Check whether content already exists at the target path. If so, redirect to `/refresh-cheatsheet`.

---

## Phase 1 — Research

**Goal:** compile a curated, verified knowledge base before writing any content.

**Do:**

1. Identify 3–7 high-quality primary and secondary sources. Prioritize:
   - Official documentation (release notes, language spec, RFC, vendor docs)
   - Authoritative secondary sources (PEPs, W3C specs, well-known reference sites)
   - Respected community resources (only if primary sources are thin)
   - Avoid: random blog posts, outdated tutorials, marketing pages, AI-generated content

2. Use `WebFetch` to retrieve each source. Read, don't skim — extract concrete facts, not summaries.

3. For version-specific cheatsheets, fetch the **official "what's new" / changelog / release notes** document for that version. Non-negotiable. Training data on specific versions is often incomplete; primary sources are authoritative.

4. Write a research note at the path derived above. Format:

   ```markdown
   # Research: <Topic> [<variant if any>]

   Last updated: <ISO date>
   Pipeline phase: research (approved: <pending | yyyy-mm-dd>)

   ## Sources

   | Source | URL | Accessed | Notes |
   |--------|-----|----------|-------|
   | ... | ... | ... | why this is authoritative |

   ## Key findings

   Bullet list of ~15–40 concrete facts extracted from the sources.
   Include PEP numbers, RFC numbers, version numbers, exact syntax,
   behavioral details. No prose summaries — facts only.

   ## Open questions

   Things that were ambiguous, contradictory across sources, or that
   you think the user should make a call on (scope, depth, inclusion).

   ## Proposed scope

   Which topics/subtopics this cheatsheet will cover, grouped roughly
   as they might become cards.
   ```

**⏸ APPROVAL GATE 1 — SOURCES**

After writing the research note, STOP. Present to the user:

1. The path where you wrote the research note.
2. A bulleted list of the sources you chose, with a one-line justification for each.
3. The "Proposed scope" section — what cards you're planning.
4. Any open questions that need user input.

Wait for explicit approval. Loop on Phase 1 until approved. When approved, update the research note header: `Pipeline phase: research (approved: <today's date>)`. Then proceed.

---

## Phase 2 — Distill into Markdown

**Goal:** turn the approved research into a complete cheatsheet source file.

**Do:**

1. **Read `docs/CONTENT_FORMAT.md` in full before writing any content.** This is the authoritative specification for section types, frontmatter, callouts, and inline formatting. Do not improvise; do not rely on memory from a prior session. The format may have been updated.

2. **Write the cheatsheet content** to the path derived at the start. Follow the authoring guidance in `CLAUDE.md` (editorial direction — density targets, when to use each section type) together with the strict format rules from `docs/CONTENT_FORMAT.md` (syntax):
   - 5–8 cards for a well-filled sheet
   - Each card densely populated; use `detail` columns for expanded info
   - Pick section IDs that are memorable and make sense as spatial anchors (the user's photographic memory uses them as landmarks)
   - Add `tip` and `warn` callouts where they earn their place — don't pad

3. **Do not modify the Vue code** to accommodate content that doesn't fit. If content needs a section type that doesn't exist in `docs/CONTENT_FORMAT.md`, stop and raise it as an open question. The content format is stable; the code follows it, not vice versa. Format changes happen by amending `docs/CONTENT_FORMAT.md` first, then updating the parser to match.

4. Set frontmatter carefully:
   - `title` — the topic display name
   - `variant` — set for multi-variant, omit for flat
   - `subtitle` — one short line, information-first, not marketing
   - `accent` — pick a color that matches the technology's conventional identity (Python blue, Rust orange, Go cyan) if it has one; otherwise omit and inherit the default
   - `layout` — `grid` (default) or `columns`

5. Cross-reference against the research note. Every non-obvious claim should be traceable to a source. If something is in the content but not the research, either add it to research with a source, or remove it from the content.

6. Update the research note header: `Pipeline phase: content (drafted: <date>)`.

**⏸ APPROVAL GATE 2 — CONTENT**

After writing the `.md` file, STOP. Present to the user:

1. The path to the new `.md` file.
2. A summary of the sections you created (titles + row counts + any callouts).
3. Any decisions you made that weren't explicitly spec'd.
4. Any content you considered but cut, with reasoning.

Wait for explicit approval. Loop on Phase 2 until approved. Update the research note header: `Pipeline phase: content (approved: <date>)`. Then proceed.

---

## Phase 3 — Render & verify

**Goal:** confirm the new cheatsheet loads correctly in the app.

**Do:**

1. Run the dev server if not already running: `npm run dev`.

2. Verify the cheatsheet appears:
   - Flat topic: `/#/<topic>` renders directly
   - New multi-variant first variant: `/#/<topic>` lists variants, `/#/<topic>/<variant>` renders
   - Added variant of existing topic: variant switcher includes the new variant

3. Visually confirm:
   - Rows render with correct columns
   - Callouts display with correct tip/warn styling
   - Variant switcher works (for multi-variant)
   - Detail modal works on rows with `detail` fields
   - Search matches rows from the new cheatsheet
   - Responsive layout holds at 1200 / 900 / 600 px

4. Run `npm run build` to confirm production build succeeds.

5. If anything fails:
   - **Parser errors** → fix the Markdown, not the parser. If the content format genuinely needs extension, stop and ask — don't silently change `parseCheatsheet.js`.
   - **Rendering errors** → check browser console, report to user, do NOT modify component code without asking.
   - **Build errors** → same — report, don't silently fix by rewriting code.

6. Update the research note header: `Pipeline phase: complete (shipped: <date>)`.

**✅ DONE**

Report to the user:
1. Paths to `_research.md` and the new content file.
2. URL to view the cheatsheet in the dev server.
3. Suggestion: `git add content/<topic>/ && git commit -m "Add <topic> cheatsheet"`.

---

## Rules that apply across all phases

- **Never skip research.** The research note is the memory of why content looks the way it does; it's not optional.
- **Never edit the Vue components or parser** to accommodate content. Change the content, or propose a `docs/CONTENT_FORMAT.md` amendment.
- **Commit the `_research.md` file.** It's a repo artifact, not scratch work.
- **Date everything in ISO format** (`2026-04-17`).
- **If you're uncertain, ask.** A 10-second clarification saves a 10-minute rewrite.
````

---

## `.claude/commands/refresh-cheatsheet.md`

````markdown
---
description: Update an existing cheatsheet with new/changed information
argument-hint: <topic> [version/variant]
---

# Refresh Cheatsheet Pipeline

Updating an existing cheatsheet. Same three-phase structure as `/new-cheatsheet` but starts from existing artifacts.

Target: **$ARGUMENTS**

---

## Before you begin

1. Read `CLAUDE.md` for editorial guidance.
2. Resolve the slug and locate the existing files (content + research note).
3. If the content file doesn't exist, redirect to `/new-cheatsheet`.
4. If the research file is missing, note it — you'll need to reconstruct one as part of this refresh.

---

## Phase 1 — Delta research

**Goal:** identify what has changed since the cheatsheet was last written.

**Do:**

1. Read the existing `_research.md` in full. Note previous sources, scope, open questions.

2. Re-fetch the same primary sources with `WebFetch`. Compare against previous findings:
   - New sections or features added to the docs
   - Existing behaviors that have changed
   - Deprecations or removals
   - Errata or corrections

3. Identify any *new* authoritative sources that have emerged.

4. Write a new section at the top of `_research.md`:

   ```markdown
   ## Refresh: <ISO date>

   ### Scope of this refresh
   What prompted it (user request, version bump, doc update noticed).

   ### Source re-check
   | Source | Status | What changed |
   |--------|--------|--------------|
   | ... | re-fetched / unchanged / deprecated / replaced | ... |

   ### New findings
   - Concrete facts added since last research.

   ### Content-facing impact
   Which sections of the current `.md` are affected.
   Which are unaffected and should remain unchanged.
   ```

   Keep the original research content below — don't delete history.

5. Update the file header: `Pipeline phase: research (approved: pending)`.

**⏸ APPROVAL GATE 1 — REFRESH SCOPE**

Present to the user:
1. Summary of what changed since the last version.
2. Which parts of existing content will need edits, which stay as-is.
3. Any judgment calls.

Wait for approval. Loop until scope is agreed. Update header on approval.

---

## Phase 2 — Apply delta to content

**Goal:** surgically edit the existing `.md`, preserving what still works.

**Do:**

1. **Read `docs/CONTENT_FORMAT.md` in full before editing.** Even though you're editing existing content, the format may have changed since the sheet was originally written. Do not assume familiarity carries over between sessions.

2. **Do not rewrite the cheatsheet from scratch.** Edit in place. Preserve section IDs, ordering, and any content that didn't change. The user's photographic memory is keyed to the existing spatial layout — stability matters.

3. For each affected section:
   - Update rows that changed
   - Add new rows with a comment in the commit message noting them
   - Remove rows no longer accurate (move them to the research note's "Removed in refresh <date>" section for posterity)

4. Update frontmatter `subtitle` if the refresh substantially changes what the sheet covers.

5. Update the research note header: `Pipeline phase: content (drafted: <date>)`.

**⏸ APPROVAL GATE 2 — CONTENT DIFF**

Present a diff-style summary:
1. Path to the edited file.
2. Sections added / modified / removed with counts.
3. Anything you were tempted to change but didn't, in case the user wants you to push further.

Wait for approval. Loop on edits. Update header on approval.

---

## Phase 3 — Render & verify

Same as `/new-cheatsheet` Phase 3. Run dev server, load the sheet, verify rendering, run `npm run build`.

Confirm marks and collapsed state still work (section IDs should be unchanged, so localStorage state from prior study sessions should survive). If any section IDs *did* change, warn the user: "Marks and collapsed state for sections X, Y will be reset in localStorage."

Update research note header: `Pipeline phase: complete (shipped: <date>)`.

---

## Rules

- **Preserve section IDs** unless there's a strong reason to change them. IDs are memory anchors.
- **Preserve section order** for the same reason. Only reorder if the user explicitly asks.
- **Keep full research history** in `_research.md`. Refreshes append, they don't overwrite.
- **Date every refresh block** in ISO format.
````

---

## `.claude/commands/review-cheatsheet.md`

````markdown
---
description: Review an existing cheatsheet and propose improvements without making changes
argument-hint: <topic> [version/variant] [--focus density|layout|accuracy|all]
---

# Review Cheatsheet Pipeline

Performing a **read-only review** of an existing cheatsheet and producing prioritized suggestions. Do not edit any files — the user decides what to act on.

Target: **$ARGUMENTS**

---

## Before you begin

1. Read `CLAUDE.md`.
2. Locate the cheatsheet and its research note.
3. Parse `--focus` if provided:
   - `density` — too sparse or too dense?
   - `layout` — spatial arrangement serving the memory-palace use case?
   - `accuracy` — content still correct vs. current primary sources?
   - `all` (default) — everything plus general quality

---

## Review dimensions

For each dimension, produce **concrete observations with row/section references**, not vague feelings.

### 1. Density

- Count cards and rows per card. Flag cards with <3 rows (sparse) or >15 rows (overflowing).
- Check whether the sheet feels undersized (<30 rows total) or oversized (>100). Oversized sheets may need splitting into variants.
- Identify rows that feel like padding. Identify gaps where a high-value adjacent topic isn't covered.
- Identify rows that might belong in `detail` fields rather than visible rows.

### 2. Layout

- Are related topics spatially adjacent?
- Do section IDs feel like memorable anchors, or generic (`section-1`, `misc`)?
- Is the accent color system used consistently? Semantic accents should mean what they're documented to mean.
- Is there a clear entry point and flow?

### 3. Accuracy

- Spot-check a sample of rows against primary sources in `_research.md`.
- If research is >6 months old, suggest a `/refresh-cheatsheet`.
- For version-specific sheets, check whether newer versions have superseded features listed.
- Flag any claim not traceable to a cited source.

### 4. Format compliance

- Does the file follow the content format specified in `docs/CONTENT_FORMAT.md`?
- Any malformed tables, invalid section types, missing frontmatter fields?

### 5. Cross-sheet consistency

- If the user has multiple cheatsheets, is the tone / style / density / use of callouts similar?
- Are conventions consistent?
- Flag outliers — either style drift or an intentional exception.

---

## Output format

Produce a single review note at `content/<topic>/_review-<ISO-date>.md` (do NOT commit — it's scratch; the user decides what to do). Structure:

```markdown
# Review: <Topic> [<variant>] — <date>

Scope: <focus areas reviewed>

## Summary

Two to four sentences. Overall health, top priority suggestions.

## High-priority suggestions

Numbered list. Each: what to change, why (tie to review dimension), rough cost (trivial / medium / large).

## Lower-priority suggestions

Same format for nice-to-haves.

## Leave-alone confirmations

Things you looked at and concluded are fine — explicitly naming them.

## Questions for the user

Places where you don't have enough context to judge.
```

Do not phrase suggestions as commands. Use "consider", "could", "worth exploring" — the user is the decision-maker.

---

## ⏸ HANDOFF

Present:

1. Path to the review file.
2. Tight summary (3–5 bullets) of top suggestions.
3. Offer paths forward:
   - "Run `/refresh-cheatsheet <topic>` to act on the accuracy items"
   - "Tell me which specific suggestions to implement and I'll open each edit for approval"
   - "I'll leave this for you to read through"

Do not start editing unless explicitly told to.

---

## Rules

- **Read-only by default.** This workflow should never silently modify content.
- **Be specific.** "Card X feels thin" is not useful. "Card X has 2 rows while peers have 7–9; consider adding rows Y, Z" is useful.
- **Respect the user's choices.** If sparsity or unusual layout is justified in `_research.md`, don't flag it.
- **Don't review your own output.** If the cheatsheet was written in the same session, your review inherits your biases. Note this; suggest a fresh session.
````

---

# Handoff complete

When you start, your first message to the user should be a brief restatement: "I've read the handoff. Starting with Phase 1: scaffolding Vite + Vue + Tailwind with the minimalist theme. Will stop at the checkpoint when `npm run dev` serves the paper-colored page."

Then proceed. Stop at each checkpoint. Ask before improvising.