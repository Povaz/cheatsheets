---
name: authoring-cheatsheets
description: |
  Drive the CheatSheet Consolidation pipeline (Sources → Reference → Sheet) end-to-end.
  Use whenever the User asks to create a new CheatSheet, add a SubTopic to an existing
  CheatSheet, or refresh a Sheet because its Sources have changed — including phrases
  like "new sheet for X", "create a cheatsheet for X", "add a subtopic", "regenerate
  the Python sheet", "I just studied X, let's add it", "the sources for X changed".
  Also applies when the User asks to author/edit any of `sources.yml`, `reference.md`,
  or `sheet.yml` + `cards/*.md` for a SubTopic. Maps to anchored-specs US-1, US-2, US-3.
---

# Authoring CheatSheets

This skill is the official, deterministic procedure for creating and refreshing
Sheets in this repository. It replaces ad-hoc "emergent documentation discovery" with
one branching pipeline and three review checkpoints.

The three checkpoints exist because errors compound across the pipeline: a Sheet
generated from a wrong-shape Reference is much more expensive to fix than the
Reference itself, and a Reference built from the wrong Sources is more expensive
than catching the Source list early. Pausing for User approval at each artifact
keeps the cost of mistakes proportional to where they originate.

For a worked example of the final state of all three artifacts together, see
`content/specification/context-anchored-specifications/` in this repo.

## Authoritative references — read but do not duplicate

These documents are the source of truth. The skill orchestrates; it does **not**
restate format rules.

| File | What it owns |
|------|--------------|
| `docs/anchored-specs.md` | US-1/2/3 definitions, the 5-step Generation flow, vocabulary |
| `docs/SOURCES_FORMAT.md` | `sources.yml` schema |
| `docs/REFERENCE_FORMAT.md` | `reference.md` guidance |
| `docs/CONTENT_FORMAT.md` | `sheet.yml` manifest schema and `cards/*.md` syntax (section types, chapters, IDs) |
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

Topic and SubTopic folder names are URL-friendly: lowercase ASCII letters, digits,
dots, and hyphens — no spaces. Examples already in the repo: `python`, `3.14`,
`claude-code`, `commands`, `context-anchored-specifications`. The slug is a stable
path identifier, distinct from the displayed title (which goes in `topic.yml`); they
serve different purposes — humans read the title, the filesystem and URLs read the
slug. When the User gives a title, propose a slug and confirm before creating the
folder, especially when versions or punctuation are involved (e.g. `3.14` stays
`3.14`, not `3-14`).

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
confirm. Create `content/<topic-slug>/<subtopic-slug>/` and proceed to CP1. Leave
`topic.yml` untouched unless the User explicitly asks to change `default` or other
metadata — the existing CheatSheet's Topic-level decisions belong to the User, not
to a SubTopic-scoped operation.

### `refresh` first action

Read the existing `content/<topic-slug>/<subtopic-slug>/sources.yml` and show it to
the User. Ask which Sources to add, remove, or edit. Proceed to CP1 with the existing
file as the seed.

## Checkpoint 1 — `sources.yml`

The User provides Sources. Do not propose Sources unprompted — the project premise
is that CheatSheets cover only material the User has actually studied, so suggesting
sources risks fabricating coverage. Capture exactly what the User names. The User's
input is typically a mix of:

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

Show the resulting `sources.yml` to the User and wait for explicit approval before
moving to CP2. A wrong Source list silently corrupts the Reference and then the
Sheet, so a few seconds of approval here is worth far more than re-running CP2 and
CP3 against the wrong inputs. Iterate until approved.

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

Show `reference.md` to the User and wait for explicit approval before moving to
CP3. The Reference is what the Sheet is condensed from, so structural problems
caught here cost one rewrite; the same problems caught after CP3 cost two.
Structural iteration is invited:

- "split this section" / "merge sections X and Y"
- "drop this part"
- "go deeper on X"
- "reorder so Y comes before X"

## Checkpoint 3 — `sheet.yml` + `cards/`

Read `docs/CONTENT_FORMAT.md` and re-read the `CLAUDE.md` "Authoring guidance for
`sheet.yml` + `cards/`" section before writing. Then generate the Sheet artifacts
from `reference.md` as two layers:

1. **`content/<topic-slug>/<subtopic-slug>/sheet.yml`** — the manifest: `title`,
   `subtitle`, and the ordered chapter → card list that controls render structure.
2. **`content/<topic-slug>/<subtopic-slug>/cards/<id>.md`** — one file per card,
   where the filename matches the card id declared in the manifest. Each card file
   contains the section syntax (`## [card <id>]` header, columns declaration, and
   rows) as defined in `docs/CONTENT_FORMAT.md`.

Write `sheet.yml` first; then write each `cards/<id>.md` file. Create the `cards/`
directory if it does not already exist.

The headline rule, restated here because it is the most-violated one: density of
**5–8 cards and 40–80 rows total per Sheet**, distributed across Chapters when used.
This range is not arbitrary — the User relies on photographic recall, which depends
on a stable spatial layout. Sparse Sheets feel pointless; dense Sheets force the
layout to shift unpredictably, defeating the single-page premise. Stay in band.

For everything else — section-type choice, manifest fields (`title`, `subtitle`),
section-ID conventions (memorable spatial landmarks, not `section-5`), aggressive
use of `detail` fields, Chapter layout types — follow the "Authoring guidance for
`sheet.yml` + `cards/`" section in `CLAUDE.md` together with `docs/CONTENT_FORMAT.md`.
Both are the source of truth; do not paraphrase them here. If a content need seems
to require a new section type, raise it with the User instead of inventing one
inline — the format is the stable contract, and inline extensions create
parser/spec drift.

Show `sheet.yml` plus 1–2 representative `cards/<id>.md` files to the User and wait
for explicit approval before writing the remaining card files. Invite the canonical
iteration patterns from `CLAUDE.md`:

| Feedback | Response |
|---|---|
| **"Sparse"** | Add rows to existing cards, or add a card for an adjacent topic. Do **not** create a new Sheet. |
| **"Dense" / "too much"** | Suggest splitting into a separate SubTopic, or move low-priority rows into `detail`. |
| **"Wrong structure"** | Reorder/merge/split cards or change section types — do not rebuild from scratch. |
| **"Hard to remember"** | Rearrange so related topics are spatially adjacent; rename section IDs as memory anchors. |

When the User approves CP3, the skill is done.

## Anti-scope

Things this skill deliberately does not do, with the reasoning so the boundary holds
under novel pressure:

- **Propose Sources unprompted.** The CheatSheet covers what the User has actually
  studied; suggesting sources fabricates coverage.
- **Add new content section types or extend `docs/CONTENT_FORMAT.md` inline.** The
  format is the stable contract between content and the parser; inline extensions
  drift the spec away from what the deployed app actually renders. Raise it instead.
- **Introduce new runtime dependencies.** Frontmatter parsing stays on
  `web/src/lib/yaml.js`; `gray-matter` and similar throw `Buffer is not defined` in
  the browser, so the constraint is hard.
- **Touch the Vue app (`web/`).** The skill changes content. Code changes go through
  a different conversation, with the format docs as the contract.
- **Handle US-4 (browse) or US-5 (remove).** Those are runtime/app concerns, not
  authoring; mixing them in would couple two unrelated change shapes.
- **Auto-format pre-existing Markdown.** The User edits content directly when
  something looks off; uninvited reformat erases his fingerprints and produces
  diffs that obscure his intentional changes.
- **Restructure adjacent SubTopics.** One invocation handles one SubTopic; reaching
  into siblings without being asked produces surprise diffs.
- **Skip checkpoints.** Each of CP1, CP2, CP3 needs explicit User approval before
  the next begins. The whole point of the pipeline is to keep the cost of fixing
  mistakes proportional to where they originate.

When the skill exits, suggest the User start the dev server and open the
new/changed Sheet to verify it parses and renders. The skill itself does not start
the server.
