---
name: authoring-cheatsheets
description: |
  Drive the CheatSheet Consolidation pipeline (Sources → Reference → Sheet) end-to-end.
  Use whenever the User asks to create a new CheatSheet, add a SubTopic to an existing
  CheatSheet, or refresh a Sheet because its Sources have changed — including phrases
  like "new sheet for X", "create a cheatsheet for X", "add a subtopic", "regenerate
  the Python sheet", "I just studied X, let's add it", "the sources for X changed".
  Also applies when the User asks to author/edit any of `sources.yml`, `reference.md`,
  or `sheet.md` for a SubTopic. Maps to anchored-specs US-1, US-2, US-3.
---

# Authoring CheatSheets

This skill is the **official, deterministic procedure** for creating and refreshing
Sheets in this repository. It replaces ad-hoc "emergent documentation discovery" with
one branching pipeline and three review checkpoints.

## Authoritative references — read but do not duplicate

These documents are the source of truth. The skill orchestrates; it does **not**
restate format rules.

| File | What it owns |
|------|--------------|
| `docs/anchored-specs.md` | US-1/2/3 definitions, the 5-step Generation flow, vocabulary |
| `docs/SOURCES_FORMAT.md` | `sources.yml` schema |
| `docs/REFERENCE_FORMAT.md` | `reference.md` guidance |
| `docs/CONTENT_FORMAT.md` | `sheet.md` syntax (section types, chapters, IDs) |
| `CLAUDE.md` | Vocabulary, file placement, density targets, iteration patterns |

Before writing any artifact, **Read** the file that owns its format. Do not rely on
memory; the format docs evolve independently of this skill.

## Vocabulary

Use exactly these terms (no synonyms): **Topic**, **SubTopic**, **Source**,
**Reference**, **Sheet**, **CheatSheet**, **Consolidation User**. Definitions live
in `CLAUDE.md` and `docs/anchored-specs.md`.

## Step 0 — Branch

Pick exactly one flow. If the User's prompt is unambiguous (e.g. "create a new
cheatsheet for Rust"), proceed without asking. Otherwise ask once.

| Branch | Story | Required pre-state |
|---|---|---|
| **new** | US-1 | `content/<topic>/` does **not** exist |
| **add** | US-2 | `content/<topic>/` exists; the proposed `content/<topic>/<subtopic>/` does **not** |
| **refresh** | US-3 | `content/<topic>/<subtopic>/sources.yml` exists |

**Pre-state guards.** Before any write, check the filesystem with Read/Bash. If the
pre-state is wrong, stop and tell the User which branch actually applies — do **not**
silently switch flows.

- `new` against an existing Topic → "Topic `<topic>` already exists; switch to **add**?"
- `add` against a non-existent Topic → "Topic `<topic>` does not exist; switch to **new**?"
- `add` against an existing SubTopic → "SubTopic exists; switch to **refresh**?"
- `refresh` against a missing SubTopic → "Nothing to refresh; switch to **new** or **add**?"

### Slug conventions

Topic and SubTopic folder names are kebab-case ASCII (e.g. `python`, `claude-code`,
`3.14`, `commands`). They are **not** the displayed title — the title goes in
`topic.yml`. When the User gives a title, propose a slug and confirm before creating
the folder.

### `new` first action

Ask the User, in one message:

1. Topic title (display name)
2. Topic subtitle (one-line tagline; optional but encouraged)
3. Topic accent color (hex; optional — omit the field if not provided)
4. First SubTopic name (display name) and proposed slug
5. SubTopic title-as-displayed (often equals the slug, e.g. `3.14`)

Then write `content/<topic-slug>/topic.yml`:

```yaml
title: <Topic title>
subtitle: <subtitle>
default: <subtopic-slug>
accent: "<hex>"   # omit if not provided
```

Create the directory `content/<topic-slug>/<subtopic-slug>/` and proceed to CP1.

### `add` first action

Confirm the existing Topic. Ask the User for the new SubTopic name, propose a slug,
confirm. Create `content/<topic-slug>/<subtopic-slug>/` and proceed to CP1. **Do not
modify `topic.yml`** unless the User explicitly asks to change `default`.

### `refresh` first action

Read the existing `content/<topic-slug>/<subtopic-slug>/sources.yml` and show it to
the User. Ask which Sources to add, remove, or edit. Proceed to CP1 with the existing
file as the seed.

## Checkpoint 1 — `sources.yml`

The User provides Sources. **Never propose Sources unprompted** — only what the User
says they have studied. The User's input is typically a mix of:

- URLs (articles, docs, RFCs, blog posts, videos)
- Local file paths (PDFs, Markdown they've written, downloaded copies)
- Book / paper titles without a fetchable URL

For each Source:

- **URL** → keep as remote `url:`. If the User asks for a snapshot (or the URL is
  flagged as ephemeral), WebFetch it and save under
  `content/local_sources/<slug>.md`, then point `url:` at the relative path.
- **Local file already inside the repo** (typically under `content/local_sources/`
  or alongside an existing SubTopic folder) → reference by **relative path** from
  `sources.yml`, e.g. `../../local_sources/foo.md`.
- **Local file outside the repo** → copy into `content/local_sources/<slug>.<ext>`
  using kebab-case slug derived from the filename. Then reference by relative path.
- **Book / non-fetchable** → record `title:` and `type: book` (or `type: paper`,
  `type: video`, etc., per `docs/SOURCES_FORMAT.md`) **without** a `url:`.

Always read `docs/SOURCES_FORMAT.md` before writing `sources.yml` and follow its
schema exactly. Each entry needs a User-supplied `read_as:` one-liner — ask if the
User did not provide one. Use today's date for `fetched:` on fresh fetches; leave
existing dates alone on `refresh`.

Show the resulting `sources.yml` to the User. **Wait for explicit approval** before
moving to CP2. Iterate until approved.

## Checkpoint 2 — `reference.md`

Read every Source listed in `sources.yml`:

- Remote URL → WebFetch.
- Local Markdown / text → Read.
- Local PDF → Read with the `pages` parameter for any PDF >10 pages; iterate over
  page ranges until the document is covered.
- Book / non-fetchable → use the metadata as context only (`title`, `read_as`); do
  not invent content.

Read `docs/REFERENCE_FORMAT.md` before writing. Then write
`content/<topic-slug>/<subtopic-slug>/reference.md`: one comprehensive consolidation
in prose form, organized for the Consolidation User to study from directly. The
Reference is **not** the Sheet — favor completeness and clarity over compression.

Show `reference.md` to the User. **Wait for explicit approval** before moving to
CP3. Structural iteration is invited:

- "split this section" / "merge sections X and Y"
- "drop this part"
- "go deeper on X"
- "reorder so Y comes before X"

## Checkpoint 3 — `sheet.md`

Read `docs/CONTENT_FORMAT.md` and re-read the `CLAUDE.md` "Authoring guidance for
`sheet.md`" section before writing. Then generate
`content/<topic-slug>/<subtopic-slug>/sheet.md` from `reference.md`.

**Hard constraints carried from `CLAUDE.md`:**

- **Density:** 5–8 cards, 40–80 rows total per Sheet. When using Chapters, this
  applies roughly per Sheet, not per Chapter.
- **Section types:** only those listed in `docs/CONTENT_FORMAT.md` (`card`, `pills`,
  `code`, `diagram`, `text`, `chapter`). Do **not** invent new types — amend the
  format doc first if a real need arises (and surface that to the User instead of
  proceeding).
- **Section IDs are spatial landmarks.** Pick memorable, semantic IDs (`[card stdlib]`,
  `[card hooks]`, `[pills keywords]`) — never `[card section-5]`.
- **Use `detail` aggressively.** In `columns` chapters, `detail` is hidden and
  expanded on row click; in `vertical` chapters, it renders inline.
- **Picking the right type:** `card` for structured rows; `pills` for short
  label+description (HTTP methods, keywords, flags); `code` for *how* to write
  something; `diagram` for inherent spatial structure; `text` rarely; `chapter` to
  group cards.
- **Frontmatter:** `title:` (the SubTopic display title) and `subtitle:` (one line).

Show `sheet.md` to the User. **Wait for explicit approval.** Invite the canonical
iteration patterns from `CLAUDE.md`:

| Feedback | Response |
|---|---|
| **"Sparse"** | Add rows to existing cards, or add a card for an adjacent topic. Do **not** create a new Sheet. |
| **"Dense" / "too much"** | Suggest splitting into a separate SubTopic, or move low-priority rows into `detail`. |
| **"Wrong structure"** | Reorder/merge/split cards or change section types — do not rebuild from scratch. |
| **"Hard to remember"** | Rearrange so related topics are spatially adjacent; rename section IDs as memory anchors. |

When the User approves CP3, the skill is done.

## Anti-scope (do **not** do these)

- Do **not** propose Sources unprompted — User provides them.
- Do **not** add new content section types or extend `docs/CONTENT_FORMAT.md`
  inline. If a real need surfaces, raise it; the spec changes first.
- Do **not** introduce new runtime dependencies. Frontmatter parsing must stay on
  `web/src/lib/yaml.js` (gray-matter and similar break in the browser).
- Do **not** touch the Vue app (`web/`). The skill changes content only.
- Do **not** handle US-4 (browse) or US-5 (remove) — runtime/app concerns.
- Do **not** auto-format pre-existing Markdown.
- Do **not** restructure adjacent SubTopics. One invocation = one SubTopic.
- Do **not** edit `topic.yml` on `add` or `refresh` unless explicitly asked.
- Do **not** skip checkpoints. Each of CP1, CP2, CP3 requires explicit User approval
  before the next begins.

## Final state per branch

- **new** → `content/<topic>/topic.yml` exists; `content/<topic>/<sub>/{sources.yml,reference.md,sheet.md}` exist; any User-supplied local files copied into `content/local_sources/`.
- **add** → `content/<topic>/topic.yml` unchanged; new `content/<topic>/<sub>/{sources.yml,reference.md,sheet.md}` exist.
- **refresh** → `content/<topic>/<sub>/sources.yml` reflects User edits; `reference.md` and `sheet.md` regenerated from the updated set.

After completion, recommend the User start the dev server and open the new/changed
Sheet to verify it parses and renders. The skill itself does not start the server.
