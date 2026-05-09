# Split-sheet content format — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single per-SubTopic `sheet.md` file with a `sheet.yml` manifest plus per-card `cards/*.md` files, so card editing is fast, reordering is a one-line change, and the manifest is the at-a-glance overview.

**Architecture:** A new loader path reads `sheet.yml` (ordered chapters → ordered card ids), looks up each card's body from a `cards/*.md` glob, and **reassembles** an in-memory string in the format the existing `parseCheatsheet.js` already understands. Parser and renderer are untouched. Migration is a one-shot script run on the 5 existing sheets, then deleted.

**Tech Stack:** Vue 3 + Vite + Vanilla JS. No new dependencies. The in-repo `web/src/lib/yaml.js` helper is extended with a manifest parser. CLAUDE.md (project) forbids adding tests, so verification in this plan is via `npm --prefix web run build` plus manual dev-server checks.

**Spec:** `docs/superpowers/specs/2026-05-09-split-sheet-format-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `web/src/lib/yaml.js` | Modify | Add `parseSheetManifest(raw)` — third helper alongside `parseSimpleYaml` and `parseListOfObjects`. |
| `web/src/lib/assembleSheet.js` | Create | `assembleSheet(manifest, cardBodyById, subtopicSlug)` — produces the `parseCheatsheet`-shaped string from manifest + card bodies. Centralises all reassembly + id-rewrite logic. |
| `web/src/lib/content.js` | Modify | Add `sheet.yml` and `cards/*.md` globs. For each SubTopic with a manifest, call `assembleSheet` then `parseCheatsheet`. Keep the legacy `sheet.md` branch only until Task 7, then delete. |
| `scripts/migrate-sheet.mjs` | Create then delete | One-shot Node script that converts a `sheet.md` to `sheet.yml` + `cards/*.md`. Used in Tasks 4 and 6, deleted in Task 7. |
| `content/<topic>/<subtopic>/sheet.yml` | Create (×5) | Per-SubTopic manifest. |
| `content/<topic>/<subtopic>/cards/*.md` | Create (~50 files) | One per card. Uses today's section syntax verbatim. |
| `content/<topic>/<subtopic>/sheet.md` | Delete (×5) | Replaced by manifest + cards. |
| `docs/CONTENT_FORMAT.md` | Modify | Replace "Frontmatter" + lead-in to "Section headers" with the new manifest + per-card-file shape. Section types, callouts, accents, span, escapes, inline formatting are unchanged. |
| `CLAUDE.md` (project root) | Modify | Update the "File placement" tree and "the one rule" paragraph to mention `sheet.yml` + `cards/`. |
| `docs/anchored-specs.md` | Modify | Update the Sheet entry in the Dictionary (source files: `sheet.yml` + `cards/*.md`). |

---

## Task 1: Add `parseSheetManifest` helper

**Files:**
- Modify: `web/src/lib/yaml.js` (append a new exported function and JSDoc; do not change existing helpers)

The manifest shape (from the spec) is:

```yaml
title: Django
subtitle: basics

chapters:
  - title: Project
    id: project
    cards:
      - project-anatomy
      - cli
  - title: Request cycle
    cards:
      - urls
      - urls-wiring
```

The existing `parseListOfObjects` only handles a flat list of mappings — it can't represent the nested `cards:` list under each chapter. Add a dedicated parser fixed to indents 0 / 2 / 4 / 6.

- [ ] **Step 1: Append `parseSheetManifest` to `web/src/lib/yaml.js`**

Append at the end of the file (after `splitFrontmatter`):

```javascript
/**
 * Parse a Sheet manifest (`sheet.yml`).
 *
 * Schema (fixed indent: 0 / 2 / 4 / 6 spaces):
 *
 *   title: <string>
 *   subtitle: <string>
 *   chapters:
 *     - title: <string>      # optional; absent ⇒ chapterless render (no rail/divider)
 *       id: <string>         # optional; auto-slug from title at render time
 *       cards:
 *         - <id>             # ordered list of card filenames (without .md)
 *         - <id>
 *
 * Returns: { title, subtitle, chapters: [{ title, id?, cards: [...] }] }
 *
 * Constraints (consistent with the rest of yaml.js): scalar string values
 * only, surrounding single/double quotes are stripped, `#` comments allowed
 * only at the start of a (trimmed) line, no flow style, no anchors.
 *
 * @param {string} raw
 * @returns {{title: string, subtitle: string, chapters: Array<{title: string, id?: string, cards: string[]}>}}
 */
export function parseSheetManifest(raw) {
  const out = { title: '', subtitle: '', chapters: [] }
  if (!raw) return out

  const stripQuotes = (v) => v.replace(/^["']|["']$/g, '')
  const splitKv = (text) => {
    const idx = text.indexOf(':')
    if (idx < 0) return null
    return [text.slice(0, idx).trim(), stripQuotes(text.slice(idx + 1).trim())]
  }

  let inChapters = false
  let inCards = false
  let current = null

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (!line.trim() || line.trim().startsWith('#')) continue
    const indent = line.match(/^\s*/)[0].length
    const trimmed = line.trim()

    if (indent === 0) {
      current = null
      inCards = false
      if (trimmed === 'chapters:') { inChapters = true; continue }
      inChapters = false
      const kv = splitKv(trimmed)
      if (!kv) continue
      const [k, v] = kv
      if (k === 'title') out.title = v
      else if (k === 'subtitle') out.subtitle = v
      continue
    }

    if (!inChapters) continue

    if (indent === 2 && trimmed.startsWith('-')) {
      current = { cards: [] }
      out.chapters.push(current)
      inCards = false
      const after = trimmed.slice(1).trim()
      if (after) {
        const kv = splitKv(after)
        if (kv) current[kv[0]] = kv[1]
      }
      continue
    }

    if (!current) continue

    if (indent === 4) {
      if (trimmed === 'cards:') { inCards = true; continue }
      inCards = false
      const kv = splitKv(trimmed)
      if (kv) current[kv[0]] = kv[1]
      continue
    }

    if (indent === 6 && trimmed.startsWith('-') && inCards) {
      const id = stripQuotes(trimmed.slice(1).trim())
      if (id) current.cards.push(id)
    }
  }

  return out
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm --prefix web run build`
Expected: build succeeds (the function is added but not yet imported anywhere).

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/yaml.js
git commit -m "Add parseSheetManifest helper to yaml.js"
```

---

## Task 2: Add `assembleSheet` reassembly module

**Files:**
- Create: `web/src/lib/assembleSheet.js`

Centralise the manifest → `parseCheatsheet`-input string transformation in its own module. Keeps `content.js` focused on globs and topic/subtopic indexing.

- [ ] **Step 1: Create `web/src/lib/assembleSheet.js`**

```javascript
/**
 * Reassemble a Sheet manifest + per-card files into a single Markdown
 * string in the format `parseCheatsheet` accepts.
 *
 * The output starts with `---`-delimited frontmatter (title, subtitle),
 * then for each chapter:
 *   - A `## [chapter <id>] <Title>` line, omitted entirely when the
 *     chapter has no `title` (the chapterless case — `parseCheatsheet`
 *     already handles "no chapter headers" as a single implicit chapter
 *     with no rail/divider).
 *   - The verbatim body of each card file, in manifest order.
 *
 * Validation warnings (non-fatal, all emitted to console.warn):
 *   - card listed in manifest but its body is missing (skip the card)
 *   - id of section header inside the card file != filename
 *     (rewrite the header line so DOM anchors match the manifest)
 *
 * @param {{title: string, subtitle: string, chapters: Array}} manifest
 * @param {Object<string,string>} cardBodyById  card id -> raw markdown
 * @param {string} subtopicSlug  "topic/subtopic", used in warnings
 * @returns {string}
 */
export function assembleSheet(manifest, cardBodyById, subtopicSlug) {
  const out = ['---']
  if (manifest.title) out.push(`title: ${manifest.title}`)
  if (manifest.subtitle) out.push(`subtitle: ${manifest.subtitle}`)
  out.push('---', '')

  for (const chapter of manifest.chapters || []) {
    if (chapter.title) {
      const idPart = chapter.id ? ` ${chapter.id}` : ''
      out.push(`## [chapter${idPart}] ${chapter.title}`, '')
    }
    for (const cardId of chapter.cards || []) {
      const body = cardBodyById[cardId]
      if (body == null) {
        console.warn(
          `[content] ${subtopicSlug}: card "${cardId}" listed in sheet.yml ` +
          `but cards/${cardId}.md is missing — skipping`,
        )
        continue
      }
      out.push(rewriteSectionId(body, cardId, subtopicSlug).replace(/\s+$/, ''), '')
    }
  }

  return out.join('\n')
}

const SECTION_HEADER_RE = /^(##\s+\[\s*[\w-]+)(?:\s+[\w./-]+)?(\s*\])/m

function rewriteSectionId(body, expectedId, subtopicSlug) {
  const m = body.match(SECTION_HEADER_RE)
  if (!m) return body
  const fullMatch = m[0]
  const before = m[1]   // "## [card"
  const after = m[2]    // "]"
  const idInsideMatch = fullMatch.match(/^##\s+\[\s*[\w-]+\s+([\w./-]+)\s*\]/)
  const idInside = idInsideMatch ? idInsideMatch[1] : null

  if (idInside === expectedId) return body
  if (idInside) {
    console.warn(
      `[content] ${subtopicSlug}: cards/${expectedId}.md has section id ` +
      `"${idInside}" inside but the filename is "${expectedId}" — ` +
      `using the filename as the canonical id`,
    )
  }
  return body.replace(SECTION_HEADER_RE, `${before} ${expectedId}${after}`)
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm --prefix web run build`
Expected: build succeeds (file exists but is not imported).

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/assembleSheet.js
git commit -m "Add assembleSheet module for manifest→parser reassembly"
```

---

## Task 3: Wire loader to load `sheet.yml` + `cards/`

**Files:**
- Modify: `web/src/lib/content.js`

Add new globs alongside the existing `sheetFiles` glob. For each SubTopic that has a `sheet.yml`, build a `cardBodyById` map, call `assembleSheet`, then feed the result to `parseCheatsheet`. SubTopics that still have only `sheet.md` continue through the existing path (this dual-loader behaviour is removed in Task 7 once all sheets are migrated).

Validation warnings (in addition to those emitted by `assembleSheet`):
- `cards/*.md` files present on disk but not referenced by the manifest.
- The same card id used for two cards across the same Sheet (catches today's silent footgun, e.g. `[code project]` appearing twice in `content/django/basics/sheet.md`).

- [ ] **Step 1: Add new globs and the manifest-driven branch**

Open `web/src/lib/content.js`. After the existing `sourcesYmlFiles` declaration (around line 20), add:

```javascript
const sheetYmlFiles = import.meta.glob('../../../content/*/*/sheet.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const cardFiles = import.meta.glob('../../../content/*/*/cards/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
```

Update the imports at the top of the file from:

```javascript
import { parseCheatsheet } from './parseCheatsheet.js'
import { parseSimpleYaml, parseListOfObjects } from './yaml.js'
```

to:

```javascript
import { parseCheatsheet } from './parseCheatsheet.js'
import { parseSimpleYaml, parseListOfObjects, parseSheetManifest } from './yaml.js'
import { assembleSheet } from './assembleSheet.js'
```

- [ ] **Step 2: Add helper to bucket card files by SubTopic**

Just above `function buildTopics()`, add:

```javascript
// Bucket cards/*.md raw bodies by `topic/subtopic`, keyed by card id (filename
// without the .md). Also detect duplicate card ids inside the same SubTopic.
function indexCardsBySubtopic() {
  const bySubtopic = new Map()
  for (const [path, raw] of Object.entries(cardFiles)) {
    // ../../../content/<topic>/<subtopic>/cards/<id>.md
    const parts = path.split('/')
    const filename = parts[parts.length - 1]
    const subtopic = parts[parts.length - 3]
    const topic = parts[parts.length - 4]
    const slug = `${topic}/${subtopic}`
    const id = filename.replace(/\.md$/, '')
    if (!bySubtopic.has(slug)) bySubtopic.set(slug, {})
    const bucket = bySubtopic.get(slug)
    if (Object.prototype.hasOwnProperty.call(bucket, id)) {
      console.warn(`[content] ${slug}: duplicate card id "${id}" — multiple files share the same name`)
    }
    bucket[id] = raw
  }
  return bySubtopic
}
```

- [ ] **Step 3: Add the manifest-driven loop inside `buildTopics`**

Inside `buildTopics()`, just before the existing `for (const [path, raw] of Object.entries(sheetFiles))` loop, add:

```javascript
  const cardsBySubtopic = indexCardsBySubtopic()

  for (const [path, raw] of Object.entries(sheetYmlFiles)) {
    // ../../../content/<topic>/<subtopic>/sheet.yml
    const parts = path.split('/')
    const subtopic = parts[parts.length - 2]
    const topic = parts[parts.length - 3]
    const slug = `${topic}/${subtopic}`

    const manifest = parseSheetManifest(raw)
    const cardBodyById = cardsBySubtopic.get(slug) || {}

    // Warn about cards on disk that the manifest doesn't reference.
    const referenced = new Set()
    for (const ch of manifest.chapters) for (const id of ch.cards) referenced.add(id)
    for (const id of Object.keys(cardBodyById)) {
      if (!referenced.has(id)) {
        console.warn(
          `[content] ${slug}: cards/${id}.md present on disk but not listed in sheet.yml — ignoring`,
        )
      }
    }

    const assembled = assembleSheet(manifest, cardBodyById, slug)

    if (!byTopic.has(topic)) byTopic.set(topic, { meta: {}, subtopics: [] })
    byTopic.get(topic).subtopics.push({
      name: subtopic,
      slug,
      cheatsheet: parseCheatsheet(assembled),
      sources: sourcesBySubtopic.get(slug) || [],
    })
  }
```

The existing `sheet.md` loop directly below stays unchanged — both paths coexist until Task 7. A SubTopic with both files would be loaded twice, so the migration script (Task 5) deletes `sheet.md` as part of conversion; for the manual migration in Task 4 we delete `sheet.md` in the same commit.

- [ ] **Step 4: Verify the build passes and the dev server still renders all 5 existing sheets**

Run from the repo root:

```
npm --prefix web run build
```
Expected: build succeeds. No SubTopics have `sheet.yml` yet, so the new branch is a no-op.

Then:

```
npm --prefix web run dev
```
Open `http://localhost:5173/`. Visit at least:
- `/django/basics`
- `/git/worktrees-agents`
- `/specification/user-stories`

Expected: each sheet renders identically to before. Browser console clean (no `[content] …` warnings, since no manifest exists yet).

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/content.js
git commit -m "Loader: read sheet.yml + cards/ alongside legacy sheet.md path"
```

---

## Task 4: Migrate `content/django/basics` by hand (canary)

**Files:**
- Create: `content/django/basics/sheet.yml`
- Create: `content/django/basics/cards/*.md` (14 files)
- Delete: `content/django/basics/sheet.md`

This is the largest existing sheet (422 lines, 4 chapters, 14 cards) and contains the duplicate-id bug (two `[code project]` cards). Doing it by hand validates the new format end-to-end before automating the remaining four.

- [ ] **Step 1: Create the cards directory and split each section into its own file**

Run:
```
mkdir -p content/django/basics/cards
```

For each of the 14 sections in `content/django/basics/sheet.md`, create a file at `content/django/basics/cards/<id>.md` containing exactly the section header line plus its body (everything from the `## [...]` line up to but not including the next `## [...]` line). Trim trailing blank lines.

Section → filename mapping (carries the existing id, except the second `[code project]` which becomes `project-settings` to fix the duplicate-id bug noted in the spec):

| Source line | Section header in source | New file | Notes |
|-------------|--------------------------|----------|-------|
| 8 | `## [code project] Project anatomy` | `cards/project-anatomy.md` | Rename header to `[code project-anatomy]`. |
| 33 | `## [card cli] \`manage.py\` daily commands` | `cards/cli.md` | header unchanged |
| 48 | `## [code project] settings.py essentials` | `cards/project-settings.md` | **Rename header to `[code project-settings]`** — fixes the duplicate `project` id collision. |
| 77 | `## [card urls] URL routing keywords` | `cards/urls.md` | header unchanged |
| 87 | `## [code urls-wiring] URL wiring & \`reverse()\`` | `cards/urls-wiring.md` | header unchanged |
| 127 | `## [code views] Views — function & class-based` | `cards/views.md` | header unchanged |
| 188 | `## [card templates] DTL syntax` | `cards/templates.md` | header unchanged |
| 202 | `## [code templates-pattern] Inheritance & static assets` | `cards/templates-pattern.md` | header unchanged |
| 241 | `## [card models] Fields & options` | `cards/models.md` | header unchanged |
| 252 | `## [code models-skeleton] Model skeleton & \`on_delete\`` | `cards/models-skeleton.md` | header unchanged |
| 290 | `## [code orm] Queries, lookups, atomic updates` | `cards/orm.md` | header unchanged |
| 331 | `## [card admin] Admin customization` | `cards/admin.md` | header unchanged |
| 344 | `## [code admin-skeleton] \`ModelAdmin\` & \`@admin.display\`` | `cards/admin-skeleton.md` | header unchanged |
| 383 | `## [card tests] Tests` | `cards/tests.md` | header unchanged |
| 398 | `## [code tests-skeleton] \`TestCase\` skeleton` | `cards/tests-skeleton.md` | header unchanged |

Lines 1–4 (frontmatter) and lines containing only `## [chapter] …` headers are NOT card files — they map into `sheet.yml` in Step 2.

Each card file must include any `> [tip]` / `> [warn]` callouts that originally followed the section, since callouts attach to the preceding section in the parser.

- [ ] **Step 2: Create `content/django/basics/sheet.yml`**

```yaml
title: Django
subtitle: project anatomy, the request cycle, the ORM, and the batteries

chapters:
  - title: Project
    cards:
      - project-anatomy
      - cli
      - project-settings

  - title: Request cycle
    cards:
      - urls
      - urls-wiring
      - views
      - templates
      - templates-pattern

  - title: ORM
    cards:
      - models
      - models-skeleton
      - orm

  - title: Batteries
    cards:
      - admin
      - admin-skeleton
      - tests
      - tests-skeleton
```

- [ ] **Step 3: Delete `content/django/basics/sheet.md`**

```
rm content/django/basics/sheet.md
```

- [ ] **Step 4: Build and visually verify**

```
npm --prefix web run build
npm --prefix web run dev
```

Open `http://localhost:5173/django/basics` in a browser. Verify:
- All 4 chapters render in the same order: Project → Request cycle → ORM → Batteries.
- All 14 cards render in the same order within each chapter as they did before.
- Click a `card` row that has a `detail` value — the modal opens with the detail text (in `columns` chapters; the default).
- Browser DevTools console is clean — no `[content] …` warnings.
- Page anchors work: visit `/django/basics#project-settings` and the second project card scrolls into view (proves the rename took effect).

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add content/django/basics
git commit -m "Migrate content/django/basics to sheet.yml + cards/

Fixes pre-existing duplicate-id bug: the second [code project] card
(settings.py essentials) is renamed to project-settings."
```

---

## Task 5: Write the one-shot migration script

**Files:**
- Create: `scripts/migrate-sheet.mjs`

A throw-away Node script (no dependencies, runnable with `node scripts/migrate-sheet.mjs <path-to-sheet.md>`) that converts a single `sheet.md` to the new layout. Used in Task 6 on the remaining 4 sheets, deleted in Task 7.

- [ ] **Step 1: Create the script**

```javascript
#!/usr/bin/env node
// Convert a content/<topic>/<subtopic>/sheet.md into:
//   content/<topic>/<subtopic>/sheet.yml
//   content/<topic>/<subtopic>/cards/<id>.md  (one per non-chapter section)
// Then delete the original sheet.md.
//
// Usage:  node scripts/migrate-sheet.mjs <path/to/sheet.md>
//
// Throw-away: this script is removed from the repo in the same commit
// that drops the legacy sheet.md branch from the loader.

import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'

const path = process.argv[2]
if (!path) {
  console.error('Usage: node scripts/migrate-sheet.mjs <path/to/sheet.md>')
  process.exit(1)
}

const raw = readFileSync(path, 'utf8')
const dir = dirname(path)

// 1. Split frontmatter off.
const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
let frontmatter = {}
let body = raw
if (fmMatch) {
  body = raw.slice(fmMatch[0].length)
  for (const line of fmMatch[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const k = line.slice(0, idx).trim()
    const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (k) frontmatter[k] = v
  }
}

// 2. Walk the body section by section. A section starts at a `## [...]` line
//    and runs until the next `## [...]` line (or EOF).
const HEADER_RE = /^##\s+\[\s*([\w-]+)(?:\s+([\w./-]+))?\s*\]\s*(.*?)(\s*\{[^}]+\})?\s*$/
const lines = body.split('\n')

const sections = []   // { type, id, title, attrs, bodyLines: [...] }
let current = null
for (const line of lines) {
  const m = line.match(HEADER_RE)
  if (m) {
    if (current) sections.push(current)
    current = {
      type: m[1],
      id: m[2] || null,
      title: (m[3] || '').trim(),
      attrs: m[4] ? m[4].trim() : '',
      bodyLines: [line],
    }
  } else if (current) {
    current.bodyLines.push(line)
  }
}
if (current) sections.push(current)

// 3. Build manifest chapters and write card files.
const chapters = []
let chapter = null

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const usedIds = new Set()
const ensureUnique = (id) => {
  if (!usedIds.has(id)) { usedIds.add(id); return id }
  let i = 2
  while (usedIds.has(`${id}-${i}`)) i++
  const fresh = `${id}-${i}`
  console.warn(`migrate: duplicate card id "${id}" → renamed to "${fresh}"`)
  usedIds.add(fresh)
  return fresh
}

mkdirSync(join(dir, 'cards'), { recursive: true })

for (const s of sections) {
  if (s.type === 'chapter') {
    chapter = { title: s.title, cards: [] }
    if (s.id) chapter.id = s.id
    chapters.push(chapter)
    continue
  }
  if (!chapter) {
    chapter = { cards: [] }   // chapterless case
    chapters.push(chapter)
  }
  const baseId = s.id || slug(s.title)
  const id = ensureUnique(baseId)

  // Trim trailing blank lines from the card body.
  while (s.bodyLines.length > 0 && s.bodyLines[s.bodyLines.length - 1].trim() === '') {
    s.bodyLines.pop()
  }

  // Rewrite the header line to use the (possibly renamed) id.
  const header = `## [${s.type} ${id}] ${s.title}${s.attrs ? ' ' + s.attrs : ''}`
  s.bodyLines[0] = header

  writeFileSync(join(dir, 'cards', `${id}.md`), s.bodyLines.join('\n') + '\n')
  chapter.cards.push(id)
}

// 4. Emit sheet.yml.
const yml = []
if (frontmatter.title) yml.push(`title: ${frontmatter.title}`)
if (frontmatter.subtitle) yml.push(`subtitle: ${frontmatter.subtitle}`)
yml.push('', 'chapters:')
for (const ch of chapters) {
  if (ch.title) yml.push(`  - title: ${ch.title}`)
  else yml.push(`  -`)
  if (ch.id) yml.push(`    id: ${ch.id}`)
  yml.push(`    cards:`)
  for (const id of ch.cards) yml.push(`      - ${id}`)
  yml.push('')
}
writeFileSync(join(dir, 'sheet.yml'), yml.join('\n'))

// 5. Drop the original sheet.md.
unlinkSync(path)

console.log(`migrated ${path}: ${sections.filter(s => s.type !== 'chapter').length} cards across ${chapters.length} chapter(s)`)
```

- [ ] **Step 2: Smoke-test on the next sheet**

Run on `content/git/worktrees-agents/sheet.md`:

```
node scripts/migrate-sheet.mjs content/git/worktrees-agents/sheet.md
```

Then verify the output structure exists:
```
ls content/git/worktrees-agents/
ls content/git/worktrees-agents/cards/
```

Expected: `sheet.yml` and `cards/` are present; the original `sheet.md` is gone.

Build + run dev server:
```
npm --prefix web run build
npm --prefix web run dev
```

Open `http://localhost:5173/git/worktrees-agents` and confirm the sheet renders identically to before. Click any `card` row with a detail to confirm the modal still works. Console clean.

If the render is wrong, `git checkout content/git/worktrees-agents/` to restore, fix the script, and rerun.

- [ ] **Step 3: Commit script and the worktrees-agents migration together**

```bash
git add scripts/migrate-sheet.mjs content/git/worktrees-agents
git commit -m "Add one-shot migration script and migrate git/worktrees-agents"
```

---

## Task 6: Migrate the remaining 3 sheets

**Files:**
- Replaces `sheet.md` with `sheet.yml` + `cards/*.md` in:
  - `content/specification/user-stories/`
  - `content/specification/acceptance-criteria/`
  - `content/specification/context-anchored-specifications/`

- [ ] **Step 1: Run the migration script on each**

```bash
node scripts/migrate-sheet.mjs content/specification/user-stories/sheet.md
node scripts/migrate-sheet.mjs content/specification/acceptance-criteria/sheet.md
node scripts/migrate-sheet.mjs content/specification/context-anchored-specifications/sheet.md
```

Each command should print a `migrated …` line. If the script reports `duplicate card id` warnings for any sheet, note which renames it applied — they may need fixing manually.

- [ ] **Step 2: Build and visually verify each migrated sheet**

```
npm --prefix web run build
npm --prefix web run dev
```

Open and spot-check each:
- `http://localhost:5173/specification/user-stories`
- `http://localhost:5173/specification/acceptance-criteria`
- `http://localhost:5173/specification/context-anchored-specifications`

For each: chapters in the original order, cards in the original order, click-to-modal still works, console clean.

Stop the dev server.

- [ ] **Step 3: Commit the three migrations**

```bash
git add content/specification
git commit -m "Migrate the three specification sheets to sheet.yml + cards/"
```

---

## Task 7: Remove the legacy `sheet.md` branch and the migration script

**Files:**
- Modify: `web/src/lib/content.js` (delete the `sheetFiles` glob, the legacy loop, and any imports it solely needed)
- Delete: `scripts/migrate-sheet.mjs`

After Task 6 there are no `sheet.md` files left; the legacy code path is dead.

- [ ] **Step 1: Confirm no `sheet.md` files remain**

Run:
```
find content -name sheet.md
```
Expected output: empty.

If any file is listed, stop and migrate it before proceeding.

- [ ] **Step 2: Remove the legacy glob and loop from `web/src/lib/content.js`**

Delete the existing `sheetFiles` declaration:

```javascript
const sheetFiles = import.meta.glob('../../../content/*/*/sheet.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
```

Inside `buildTopics()`, delete the entire legacy loop:

```javascript
  for (const [path, raw] of Object.entries(sheetFiles)) {
    // ../../../content/<topic>/<subtopic>/sheet.md
    const parts = path.split('/')
    const subtopic = parts[parts.length - 2]
    const topic = parts[parts.length - 3]
    if (!byTopic.has(topic)) byTopic.set(topic, { meta: {}, subtopics: [] })
    byTopic.get(topic).subtopics.push({
      name: subtopic,
      slug: `${topic}/${subtopic}`,
      cheatsheet: parseCheatsheet(raw),
      sources: sourcesBySubtopic.get(`${topic}/${subtopic}`) || [],
    })
  }
```

Leave the manifest-driven loop added in Task 3 intact — it is now the only loader path.

- [ ] **Step 3: Delete the migration script**

```
rm scripts/migrate-sheet.mjs
```

If the `scripts/` directory becomes empty as a result, leave it removed.

- [ ] **Step 4: Build and verify**

```
npm --prefix web run build
npm --prefix web run dev
```

Spot-check at least two migrated sheets to confirm rendering still works:
- `http://localhost:5173/django/basics`
- `http://localhost:5173/specification/user-stories`

Console clean. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/content.js
git rm scripts/migrate-sheet.mjs 2>/dev/null || true
git commit -m "Drop legacy sheet.md loader path and the one-shot migration script"
```

---

## Task 8: Update `docs/CONTENT_FORMAT.md`

**Files:**
- Modify: `docs/CONTENT_FORMAT.md` (replace the "Frontmatter" section and the lead-in to "Section headers"; everything from "Chapters" onward stays the same)

- [ ] **Step 1: Replace the top of `docs/CONTENT_FORMAT.md`**

Open the file. Replace lines 1–17 (everything from the `# Sheet Content Format` heading through the last line of the "Frontmatter" section, ending at "The SubTopic name is taken from the parent folder name; it is not part of the frontmatter.") with:

```markdown
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
```

The existing "Section headers" section, "Chapters" section, "Sheet settings" section, and everything below are unchanged. Leave them as-is.

- [ ] **Step 2: Replace the remaining `sheet.md` mentions inside the Chapters / Sheet settings sections**

The "Chapters" section (line 59 in the original file) currently says:

> **Layout (vertical vs columns), font sizes, and column count are not part of `sheet.md`** — they are user-side **Sheet settings** edited in the UI.

Replace `not part of \`sheet.md\`` with `not part of \`sheet.yml\` or the \`cards/\` files`.

The "Sheet settings" section (line 65 in the original file) currently says:

> Settings live in the browser's `localStorage` per Sheet … they are **not** part of `sheet.md`.

Replace `not part of \`sheet.md\`` with `not part of \`sheet.yml\` or the \`cards/\` files`.

In the "Chapters" section, find the existing "Migration note (one-time)" paragraph (around line 74) and append a second migration note immediately after it:

```markdown
**Migration note (2026-05-09).** This format previously stored the full Sheet (frontmatter + all sections) in a single `sheet.md` per SubTopic. It now stores the spine (title, subtitle, ordered chapters → ordered cards) in `sheet.yml` and one section per file under `cards/`. The previous duplicate-id footgun (e.g. two `[code project]` cards in `content/django/basics/sheet.md`) is now caught by the loader. Earlier `sheet.md` references in this paragraph and the historical migration note above are intentionally preserved as historical context.
```

- [ ] **Step 3: Update "How to extend this format" at the bottom**

Replace the three-step list at the bottom of the file with:

```markdown
1. **Edit this document** with the new section type, manifest field, attribute, or callout — including an example.
2. **Update `web/src/lib/parseCheatsheet.js`** for new section types/attributes, or `web/src/lib/yaml.js` and `web/src/lib/assembleSheet.js` for new manifest fields.
3. **Add or update the renderer** in `web/src/pages/Sheet.vue` (or in a component under `web/src/components/`).
```

- [ ] **Step 4: Commit**

```bash
git add docs/CONTENT_FORMAT.md
git commit -m "CONTENT_FORMAT.md: document sheet.yml manifest + cards/ layout"
```

---

## Task 9: Update `CLAUDE.md` (project root)

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the "Authoritative documents" bullet for CONTENT_FORMAT.md**

Find the line (currently line 11):

> - **`docs/CONTENT_FORMAT.md`** — `sheet.md` syntax (the cheatsheet rendering format).

Replace it with:

> - **`docs/CONTENT_FORMAT.md`** — `sheet.yml` manifest schema and `cards/*.md` syntax (the cheatsheet rendering format).

- [ ] **Step 2: Update the Dictionary's Sheet entry**

Find the line (currently line 23):

> | Sheet        | The rendered single-page view of a SubTopic. Source file: `sheet.md`. |

Replace `Source file: \`sheet.md\`.` with `Source files: \`sheet.yml\` (manifest) + \`cards/*.md\` (one per card).`.

- [ ] **Step 3: Update the "the one rule" paragraph**

Find the line:

> **To add a Sheet, create the SubTopic folder under `content/<topic>/` with `sources.yml`, `reference.md`, and `sheet.md`. Do not touch the Vue app.** The content format is the stable contract; the code exists to render it.

Replace it with:

> **To add a Sheet, create the SubTopic folder under `content/<topic>/` with `sources.yml`, `reference.md`, `sheet.yml`, and a `cards/` directory containing one `.md` per card. Do not touch the Vue app.** The content format is the stable contract; the code exists to render it.

- [ ] **Step 4: Update the "File placement" tree**

Find the existing tree:

```
content/python/
├── topic.yml                      # Topic metadata (title, subtitle, default SubTopic, optional accent)
└── 3.14/                          # SubTopic
    ├── sources.yml                # Source list
    ├── reference.md               # consolidated study text
    └── sheet.md                   # cheatsheet-format Markdown rendered by the app
```

Replace it with:

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

- [ ] **Step 5: Update the "Authoring guidance" intro paragraph**

Find the heading "## Authoring guidance for `sheet.md`" and rename it to:

```markdown
## Authoring guidance for `sheet.yml` + `cards/`
```

The density targets, section-type recommendations, and chapter guidance below it stay as-is — the rules apply per Sheet regardless of whether the cards live in one file or many.

- [ ] **Step 6: Update the "Iteration patterns" and "Do not" sections**

In the "Do not" section, find:

> - **Do not auto-format existing Markdown content.** Leave it alone unless the user asks.

No change needed to that line. But find the parser-extension warning:

> - **Do not add section types that aren't in `docs/CONTENT_FORMAT.md`.** Amend the spec first, then update the parser, then the renderer.

Add a sibling line immediately after it:

> - **Do not add fields to `sheet.yml` that aren't in `docs/CONTENT_FORMAT.md`.** Same rule: amend the spec, then `web/src/lib/yaml.js` (`parseSheetManifest`) and `web/src/lib/assembleSheet.js`, then any renderer changes.

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "CLAUDE.md: document sheet.yml + cards/ layout and authoring rule"
```

---

## Task 10: Update `docs/anchored-specs.md`

**Files:**
- Modify: `docs/anchored-specs.md`

- [ ] **Step 1: Update the Dictionary's Chapter entry and any other `sheet.md` mentions**

`docs/anchored-specs.md` line 56 (the Dictionary's **Chapter** entry) currently includes:

> Authored by the Consolidation User as `## [chapter] <Title>` headers in the SubTopic's `sheet.md`; …

Replace `as \`## [chapter] <Title>\` headers in the SubTopic's \`sheet.md\`` with `as ordered chapter entries under \`chapters:\` in the SubTopic's \`sheet.yml\` (each chapter listing its cards in order)`.

Then run:

```
grep -n "sheet\.md" docs/anchored-specs.md
```

For each remaining hit, decide whether it is a Dictionary/Story/AC reference that should now read `sheet.yml` + `cards/*.md`, or a historical mention worth preserving. Do not invent new User Stories or Acceptance Criteria; only update wording on existing entries.

- [ ] **Step 2: Verify there are no remaining literal `sheet.md` references in `docs/`**

Run from the repo root:

```
grep -rn "sheet\.md" docs/
```

Any remaining hits in `docs/CONTENT_FORMAT.md`, `CLAUDE.md`, or `docs/anchored-specs.md` are leftovers — fix them. References inside `docs/superpowers/specs/2026-05-09-split-sheet-format-design.md` and `docs/superpowers/plans/2026-05-09-split-sheet-format.md` are expected (they describe the migration) and stay.

- [ ] **Step 3: Commit**

```bash
git add docs/anchored-specs.md docs/CONTENT_FORMAT.md CLAUDE.md
git commit -m "Update Dictionary and stray docs references to sheet.yml + cards/"
```

---

## Verification — end of plan

Run from the repo root:

```
npm --prefix web run build
```
Expected: build succeeds.

```
npm --prefix web run dev
```
Visit each of the 5 SubTopics and confirm:
- All chapters render in their original order.
- All cards render in their original order.
- Click-to-detail modals open in `columns` chapters.
- Browser DevTools console is clean (no `[content] …` warnings).

```
find content -name sheet.md
```
Expected output: empty.

```
ls scripts/ 2>/dev/null
```
Expected: directory empty or absent.

```
grep -rn "sheet\.md" web/src/ CLAUDE.md
```
Expected: no hits.

```
grep -rn "sheet\.md" docs/CONTENT_FORMAT.md docs/anchored-specs.md
```
Expected hits are limited to **migration notes** that intentionally preserve historical context (the existing `{type: vertical | columns}` removal note in CONTENT_FORMAT.md, and the new 2026-05-09 migration note added in Task 8). Any other surviving reference is a leftover — fix it.
