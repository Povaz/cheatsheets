# Cheatsheets — Claude orientation

Personal cheatsheet web app. The user is a backend developer, not a frontend developer. He interacts with this project by asking Claude Code to add or edit cheatsheets, edits Markdown content files directly when he spots something wrong, and `git push`es to deploy. **Do not expect him to edit the Vue code.**

The user has a photographic memory and studies best from single-page, information-dense reference sheets with strong spatial structure. Density, stable layout, and memorable section IDs matter more than generic UI polish.

## The one rule

**To add a cheatsheet, create a `.md` file in `content/<topic>/`. That's it. Do not touch the Vue app.** The content format is the stable contract; the code exists to render it.

## Authoring workflow

To create, update, or review cheatsheets, use the slash commands in `.claude/commands/`:

- `/new-cheatsheet <topic>` — create a new cheatsheet (3-phase pipeline with approval gates)
- `/refresh-cheatsheet <topic>` — update an existing cheatsheet against current primary sources
- `/review-cheatsheet <topic>` — read-only quality review

These commands define the authoritative procedure. The workflow has **approval gates** — do not skip them, do not auto-continue between phases.

Research notes (`_research.md` or `_research-<variant>.md`) are committed alongside content. They are the audit trail and the basis for refreshes.

## Content format

Each cheatsheet is a Markdown file with YAML frontmatter plus `H2` section headers with type tags (`## [card id] Title`). Section bodies are typically tables. Callouts use `> [tip]` / `> [warn]` blockquote syntax.

The full format specification lives in **`docs/CONTENT_FORMAT.md`**. Any session authoring content must read it before writing. The summary above is orientation only; the spec is authoritative.

## File placement

Every topic is a folder under `content/`, regardless of whether it has variants.

**Flat topic** — single cheatsheet, no versions:

```
content/http/
├── _research.md           # research note (optional; commit it for major sheets)
└── http.md                # slug: "http"
```

**Multi-variant topic** — multiple versions:

```
content/python/
├── _topic.yml             # topic-level metadata (optional; sets default variant)
├── _research-3.14.md      # research note for 3.14
├── _research-3.13.md      # research note for 3.13
├── 3.14.md                # slug: "python/3.14"
└── 3.13.md                # slug: "python/3.13"
```

Rules:

- A folder with **one non-underscore `.md` file** → flat topic; its slug is the folder name.
- A folder with **multiple non-underscore `.md` files** → multi-variant; each `.md` is one variant; slug is `<topic>/<variant-without-.md>`.
- Files beginning with `_` are metadata/research/review notes and are ignored by the content loader.
- `_topic.yml` may set `title`, `subtitle`, `default` (default variant slug).

## Authoring guidance

**Density targets** — a well-filled sheet has **5–8 cards** and **40–80 rows total**. Sparse sheets feel pointless; bloated sheets defeat the single-page premise.

**Which section type to pick**:

- `card` — structured rows with 2–5 columns. Default. Use for reference tables.
- `pills` — label + description. Use when the "thing" is a short name (HTTP methods, Python keywords, shell flags).
- `code` — when the reference is *how* to write something, not *what* it is.
- `diagram` — when content has inherent spatial structure (request/response flow, state machines).
- `text` — short prose bullets. Rare — usually a card or pills is better.

**Use `detail` fields aggressively**. The `detail` column is hidden by default and shown in a modal on row click. This lets each visible row stay tight while still carrying full explanation for when the user needs it.

**Pick memorable section IDs**. The user's photographic memory uses section IDs as spatial landmarks. `[card stdlib]` is better than `[card section-5]`. `[card 2xx]` is better than `[card successes]`.

**Splitting into variants**. If a topic has meaningful versions that diverge (Python 3.13 vs 3.14, Postgres 15 vs 16, HTTP/1.1 vs HTTP/2), make them variants so the user can compare. Flat topics are for things without versions (HTTP status codes as a whole, regex syntax, shell idioms).

## Research & refresh

Every non-trivial sheet gets a `_research.md` (flat) or `_research-<variant>.md` (multi-variant) with sources, findings, and scope decisions. The slash commands enforce this.

**Always WebFetch primary sources** for version-specific sheets — training data on specific versions is often incomplete. The official "what's new" / release notes / RFC is authoritative.

On refresh, **append** a new dated block to `_research.md` (don't overwrite). History is valuable.

## Iteration patterns

Common feedback → common response:

- **"Sparse"** → add rows to existing cards, or add a card for an adjacent topic (not a new sheet).
- **"Dense" / "too much"** → split into variants, or move low-priority rows into `detail` fields.
- **"Wrong structure"** → try a different layout (reorder sections, merge/split cards, change section types). Don't rebuild from scratch.
- **"Hard to remember"** → the spatial layout matters. Rearrange so related topics are adjacent; pick section IDs that work as memory anchors.

## Do not

- **Do not add new dependencies** without asking. The runtime deps are fixed (Vue, vue-router). Frontmatter is parsed by a tiny in-repo YAML helper in `src/lib/yaml.js` — do not replace it with `gray-matter` or similar (gray-matter throws `Buffer is not defined` in the browser). If a feature seems to need a library, raise it first.
- **Do not add section types that aren't in `docs/CONTENT_FORMAT.md`.** Amend the spec first, then update the parser, then the renderer.
- **Do not rewrite the parser or components to accommodate one-off content needs.** Change the content, not the code. If the format genuinely needs extension, that goes through `docs/CONTENT_FORMAT.md` first.
- **Do not add tests unless asked.** The parser has JSDoc; Vitest can come later.
- **Do not auto-format existing Markdown content.** Leave it alone unless the user asks.
- **Do not duplicate format rules between this file and `docs/CONTENT_FORMAT.md`.** The spec is the single source of truth.
- **Do not skip the slash-command approval gates.** Research → approve → content → approve → render. Each gate exists because skipping it has cost.
