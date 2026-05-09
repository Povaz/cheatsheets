# Cheatsheets — Claude orientation

Personal CheatSheet web application. The user is a backend developer, not a frontend developer. He interacts with this project by asking Claude Code to add or edit Sheets, edits Markdown content files directly when he spots something wrong, and `git push`es to deploy. **Do not expect him to edit the Vue code.**

The user has a photographic memory and studies best from single-page, information-dense reference Sheets with strong spatial structure. Density, stable layout, and memorable section IDs matter more than generic UI polish.

## Authoritative documents

- **`docs/anchored-specs.md`** — the project's specification: Contexts, Dictionary, User Stories, Acceptance Criteria. The vocabulary defined there is the vocabulary used everywhere else.
- **`docs/design.md`** — how the system is built: file tree, Vue + Tailwind setup, deployment.
- **`docs/CONTENT_FORMAT.md`** — `sheet.yml` manifest schema and `cards/*.md` syntax (the cheatsheet rendering format).
- **`docs/SOURCES_FORMAT.md`** — `sources.yml` schema.
- **`docs/REFERENCE_FORMAT.md`** — `reference.md` guidance.

## Vocabulary (use these terms, not synonyms)

| Term         | Meaning |
|--------------|---------|
| Topic        | A broad subject area, e.g. "Python". One folder under `content/`. |
| SubTopic     | A specific area or version within a Topic, e.g. "3.14" or "Commands". One folder under `content/<topic>/`. |
| Source       | An external resource consulted to build the Reference. One entry in `sources.yml`. |
| Reference    | A consolidated Markdown document built from Sources. `reference.md`. |
| Sheet        | The rendered single-page view of a SubTopic. Source files: `sheet.yml` (manifest) + `cards/*.md` (one per card). |
| CheatSheet   | The collection of all Sheets under one Topic. |

The historical terms "variant" and "flat topic" are no longer used. Every Topic has SubTopics; a Topic with one SubTopic is just a Topic with one folder under it.

## The one rule

**To add a Sheet, create the SubTopic folder under `content/<topic>/` with `sources.yml`, `reference.md`, `sheet.yml`, and a `cards/` directory containing one `.md` per card. Do not touch the Vue app.** The content format is the stable contract; the code exists to render it.

## Spec codes (Stories & ACs)

**Use slug-style codes, not auto-incremented integers**, for new User Stories and their ACs in `docs/anchored-specs.md` — e.g. `US-sheet-search` and `AC-sheet-search.1`, not `US-6` / `AC-6.1`. Multiple agents draft specs in parallel and integer codes collide. Existing US-1…US-5 are kept as-is.

## File placement

Every Topic is a folder under `content/`. Every SubTopic is a folder under that.

```
content/python/
├── topic.yml                      # Topic metadata (title, subtitle, default SubTopic, optional accent)
└── 3.14/                          # SubTopic
    ├── sources.yml                # Source list
    ├── reference.md               # consolidated study text
    ├── sheet.yml                  # Manifest: title, subtitle, ordered chapters → ordered card ids
    └── cards/                     # One .md file per card; filename == card id
        ├── <card-id>.md
        └── …
```

Rules:

- One folder per Topic. One folder per SubTopic.
- `topic.yml` may set `title`, `subtitle`, and `default` (default SubTopic name).
- Files starting with `_` are editorial scratch and ignored by the loader.
- `reference.md` is part of the Content Context — it lives in the repo for the `Consolidation User` and for git history. It is **not** loaded by the deployed app.
- `sources.yml` is loaded by the deployed app and rendered as a "Sources" footer on each Sheet (remote URLs open in a new tab; relative paths under `content/local_sources/` or files alongside `sources.yml` are bundled and downloaded).

## Building & verifying (rare)

The deployed app is in `web/` (Vite + Vue 3 + Tailwind). You will not normally run it — the user pushes to `main` and GitHub Actions deploys. Only when extending the content format (spec → parser → renderer, in that order) verify locally:

```
cd web && npm install && npm run dev   # http://localhost:5173/
cd web && npm run build                # production build sanity check
```

When running web/ scripts as a background task, prefer the `--prefix` form so the working dir survives the relaunch. Run `npm --prefix web …` **from the repo root** — invoking it inside `web/` resolves to `web/web/` and fails.

```
npm --prefix web run dev
npm --prefix web run build
```

**Worktrees branch from `dev`, not `main`.** Active development lives on `dev`; `main` is only the GitHub Pages deploy target. The native `EnterWorktree` tool defaults to `origin/main` and will silently miss the latest features. To base a worktree on `dev`, run `git worktree add .claude/worktrees/<name> dev` (the project's worktree directory is `.claude/worktrees/`, gitignored under `.claude/`), then enter it with `EnterWorktree path: .claude/worktrees/<name>`.

**Adding a new persisted per-Chapter setting** is a one-liner: append `key: default` to `CHAPTER_DEFAULTS` in `web/src/store.js`. `CHAPTER_DEFAULT_KEYS`, `pickChapterFields`, `effectiveChapterSetting`, and `setChapterOverride` all derive from it — no other plumbing needed. The shape is also documented in `docs/design.md` §3.5 (`type ChapterSettings`); update both when adding a field.

**Small-screen render primitive.** A reactive `isSmallScreen` ref in `web/src/store.js` tracks `matchMedia('(max-width: 767.98px)')`; App.vue toggles a `.is-small-screen` class on the root. Components import the ref for v-if/template branches; CSS overrides live in `web/src/index.css` under `.is-small-screen …`. Reuse this rather than adding a parallel viewport listener.

## Authoring guidance for `sheet.yml` + `cards/`

**Density targets** — a well-filled Sheet has **5–8 cards** and **40–80 rows total**. Sparse Sheets feel pointless; bloated Sheets defeat the single-page premise.

**Which section type to pick**:

- `card` — structured rows with 2–5 columns. Default. Use for reference tables.
- `pills` — label + description. Use when the "thing" is a short name (HTTP methods, Python keywords, shell flags).
- `code` — when the reference is *how* to write something, not *what* it is.
- `diagram` — when content has inherent spatial structure (request/response flow, state machines).
- `text` — short prose bullets. Rare — usually a card or pills is better.
- `chapter` — structural marker, not a renderable card. Groups the cards that follow until the next chapter; see "Group cards into Chapters" below.

**Group cards into Chapters**. A Sheet can be split into ordered Chapters, each with its own layout type:

- `## [chapter] <Title> {type: vertical}` — cards stack one per row at full width. Best for long-form prose, intro/outro material, or cards whose `detail` text deserves to be visible inline.
- `## [chapter] <Title> {type: columns}` — masonry layout, the default if `type` is omitted. Best for dense reference tables.

Chapters render a horizontal divider above and the chapter title vertically on a left rail. A Sheet without explicit `[chapter]` headers behaves exactly as before (one implicit `columns` chapter, no divider/rail). When a Sheet has chapters, density targets apply roughly *per chapter* — a 2-card vertical "Introduction" + an 8-card "Deep-Dive" + a 2-card "Further Info" is normal. The full-Sheet 5–8 cards / 40–80 rows guidance still applies as a rough total.

**Use `detail` fields aggressively**. In `columns` chapters the `detail` column is hidden and shown in a modal on row click — keeps rows tight while still carrying full explanation. In `vertical` chapters `detail` renders inline as another column, since the card already has full horizontal width. Either way, fill it.

**Pick memorable section IDs**. The user's photographic memory uses section IDs as spatial landmarks. `[card stdlib]` is better than `[card section-5]`.

**Splitting into SubTopics**. If a Topic has meaningful versions or facets that diverge (Python 3.13 vs 3.14, Postgres 15 vs 16, Claude Code Commands vs Agents vs Skills), make them separate SubTopic folders so the user can compare.

## Iteration patterns

Common feedback → common response:

- **"Sparse"** → add rows to existing cards, or add a card for an adjacent topic (not a new Sheet).
- **"Dense" / "too much"** → split into SubTopics, or move low-priority rows into `detail` fields.
- **"Wrong structure"** → try a different layout (reorder sections, merge/split cards, change section types). Don't rebuild from scratch.
- **"Hard to remember"** → the spatial layout matters. Rearrange so related topics are adjacent; pick section IDs that work as memory anchors.

## Do not

- **Do not add new dependencies** without asking. The runtime deps are fixed (Vue, vue-router). Frontmatter is parsed by a tiny in-repo YAML helper in `web/src/lib/yaml.js` — do not replace it with `gray-matter` or similar (gray-matter throws `Buffer is not defined` in the browser). If a feature seems to need a library, raise it first.
- **Do not add section types that aren't in `docs/CONTENT_FORMAT.md`.** Amend the spec first, then update the parser, then the renderer.
- **Do not add fields to `sheet.yml` that aren't in `docs/CONTENT_FORMAT.md`.** Same rule: amend the spec, then `web/src/lib/yaml.js` (`parseSheetManifest`) and `web/src/lib/assembleSheet.js`, then any renderer changes.
- **Do not rewrite the parser or components to accommodate one-off content needs.** Change the content, not the code. If the format genuinely needs extension, that goes through `docs/CONTENT_FORMAT.md` first.
- **Do not add tests unless asked.** The parser has JSDoc.
- **Do not auto-format existing Markdown content.** Leave it alone unless the user asks.
- **Do not duplicate format rules between this file and the format docs.** The format docs are the single source of truth.
