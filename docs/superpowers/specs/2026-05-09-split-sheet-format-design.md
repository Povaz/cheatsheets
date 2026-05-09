# Split-sheet content format

**Status:** approved design, pre-implementation
**Date:** 2026-05-09

## Problem

Authoring a Sheet today means editing one long `sheet.md` per SubTopic. Three pain points:

1. **Editing is slow.** Files run 400+ lines; jumping between cards requires scrolling and search.
2. **Reordering is awkward.** Moving a card between chapters or rearranging chapters relies on copy-paste of multi-line section blocks.
3. **No overview.** Reading the spine of a Sheet (which chapters, which cards, in what order) means scanning every `## [...]` header in the file.

The user wants to keep authoring in Markdown — the format must remain easily editable in any text editor, with no new toolchain.

## Solution at a glance

A SubTopic becomes:

```
content/<topic>/<subtopic>/
├── sources.yml          # unchanged
├── reference.md         # unchanged
├── sheet.yml            # NEW — manifest: title, subtitle, ordered chapters → cards
└── cards/               # NEW — one .md per card, filename = card id
    ├── <card-id>.md
    └── …
```

`sheet.md` ceases to exist. The manifest carries the spine; each card file uses today's section syntax verbatim. The parser is unchanged; the loader assembles the manifest + card files into the same in-memory shape the parser already accepts.

## Manifest schema (`sheet.yml`)

```yaml
title: Django                           # was sheet.md frontmatter
subtitle: "basics"

chapters:
  - title: Project                      # chapter title
    id: project                         # optional; auto-slug from title
    cards:
      - project-anatomy                 # card id == filename (without .md) under cards/
      - cli
      - settings

  - title: Request cycle
    cards:
      - urls
      - urls-wiring
      - views
      - templates
      - templates-pattern
```

Rules:

- `title` and `subtitle` mirror today's `sheet.md` frontmatter.
- `chapters` is **required** and is an ordered list. The chapterless case maps to a single chapter with no `title:` — preserves today's chapterless rendering (no rail, no divider).
- Each `chapters[*].cards` is an ordered list of card ids. A card id is a filename-safe slug.
- A card id must exist as `cards/<id>.md`.
- A card file on disk but not listed in the manifest is **ignored** (loader emits `console.warn`). Useful while drafting.
- Optional per-chapter `id:` mirrors today's `[chapter <id>]` syntax.
- Per-card layout/accent/span/type stay in the card file's section header — they are properties of the card, not of the spine.

## Card file shape (`cards/<id>.md`)

Each card file contains one section using **today's exact syntax**, unchanged:

```markdown
## [card cli] `manage.py` daily commands

| cmd       | desc                  |
|-----------|-----------------------|
| runserver | dev server            |
| migrate   | apply migrations      |

> [tip] Use `--no-input` on CI.
```

Rules:

- The first non-blank line is a single section header `## [<type> <id>] <Title> {…}`.
- The section id inside the file **must match the filename** (without `.md`). Loader warns if they differ and uses the filename as the canonical id.
- Card body uses every existing CONTENT_FORMAT primitive: tables (`card`, `pills`), fenced blocks (`code`, optionally annotated with `### sub-heading` + caption), `diagram` SVG, `text` prose, callouts (`> [tip]`, `> [warn]`), inline formatting, escaped pipes.
- No frontmatter inside card files. Metadata lives in the section header (`{accent: …, span: full}`) and in `sheet.yml`.

## Loader & parser changes

### Loader (`web/src/lib/content.js`)

Today's glob:

```js
import.meta.glob('../../../content/*/*/sheet.md', { eager: true, query: '?raw', import: 'default' });
```

becomes three globs:

```js
const manifests = import.meta.glob('../../../content/*/*/sheet.yml', { eager: true, query: '?raw', import: 'default' });
const cards     = import.meta.glob('../../../content/*/*/cards/*.md', { eager: true, query: '?raw', import: 'default' });
const sources   = import.meta.glob('../../../content/*/*/sources.yml', …);  // unchanged
```

For each SubTopic:

1. Parse `sheet.yml` using the existing `web/src/lib/yaml.js` helper — no new deps.
2. For each chapter → for each card id → look up `cards/<id>.md` from the glob map.
3. **Reassemble** an in-memory string:

   ```
   ---
   title: <from manifest>
   subtitle: <from manifest>
   ---

   ## [chapter <id>] <Chapter title>

   <body of cards/<first-card>.md>

   <body of cards/<second-card>.md>

   ## [chapter …] <Next chapter>

   …
   ```

   When a chapter has no `title:` (the chapterless case), no `## [chapter] …` line is emitted — the assembled string is identical to a chapterless sheet today.

4. Hand that string to the existing `parseCheatsheet.js` — unchanged.

### Parser (`web/src/lib/parseCheatsheet.js`)

Untouched. The reassembly path keeps the parser's input contract identical to today.

### Validation (loader-side warnings, not fatal)

- Card id listed in manifest but `cards/<id>.md` missing.
- `cards/*.md` file present on disk but not referenced by the manifest.
- Section id inside a card file ≠ filename. Loader uses the filename and warns.
- Duplicate card id across a single Sheet (today's silent footgun).

### Renderer

Untouched.

## Migration

Five existing sheets to migrate:

- `content/django/basics/`
- `content/git/worktrees-agents/`
- `content/specification/user-stories/`
- `content/specification/acceptance-criteria/`
- `content/specification/context-anchored-specifications/`

Migration is a **one-shot script** (run once, then deleted from the repo):

1. Read each `sheet.md`.
2. Extract frontmatter → `sheet.yml`'s `title`/`subtitle`.
3. Walk sections in order:
   - `## [chapter <id>] Title` → start a new manifest chapter (carry `id` if present, else auto-slug from title).
   - `## [<type> <id>] Title …` and the body up to the next `##` → write to `cards/<id>.md`, append `<id>` to the current chapter's `cards:`.
4. Delete `sheet.md`.

**Edge cases observed in the current corpus:**

- `content/django/basics/sheet.md` has **two cards both named `[code project]`** (lines 8 and 48). Migration must rename one; the second card (settings.py essentials) becomes `project-settings`. This is a real DOM-id duplication bug today — migration fixes it.
- A sheet with no `[chapter]` headers → emit a single manifest chapter with no `title:`.

**Documentation updates in the same change:**

- `docs/CONTENT_FORMAT.md` — replace the "Frontmatter" and lead-in to "Section headers" with the new manifest + per-card-file shape. Section types, callouts, accents, span, escapes, inline formatting sections stay as-is.
- `CLAUDE.md` (project) — update the file-placement tree and the "one rule" paragraph to reference `sheet.yml` + `cards/` instead of `sheet.md`.
- `docs/anchored-specs.md` — update the Sheet entry in the Dictionary (source files: `sheet.yml` + `cards/*.md` instead of `sheet.md`).

No dual-format support. The new format replaces the old in one commit.

## Trade-offs accepted

| ✅ Gain | ⚠️ Cost |
|---------|---------|
| Card files ~10–80 lines each — fast to open and edit. | Adding a card is now two steps: create file, register in manifest. |
| Reorder cards/chapters by moving a line in `sheet.yml`. | Renaming a card id touches two places (filename + manifest entry). Rare. |
| Manifest is the at-a-glance overview. | Parser errors point at synthesized line numbers, not source files. Mitigation deferred. |
| Loader can warn on duplicate ids — fixes the django/basics `[code project]` collision. | None. |
| Parser and renderer untouched — change concentrated in `content.js` and the migration script. | None. |

## Out of scope

- Authoring tools or a UI for editing manifests. The user edits YAML and Markdown by hand.
- Per-card frontmatter. Section-header attributes already cover what's needed.
- Backward compatibility with `sheet.md`. The corpus is 5 sheets; migrate-and-delete is simpler than dual-loader code.
- Source-mapped error messages. Worth doing later if parser errors become a recurring pain point; not blocking.
