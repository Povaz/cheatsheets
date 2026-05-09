# Card detail wraps below — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render each card row's `detail` value as a muted, indented prose sub-row beneath the row's tabular cells, so verbose detail no longer stretches the row's first three cells.

**Architecture:** Two paired changes keep the subgrid invariant: the parent grid in `Sheet.vue` defines tracks for non-detail columns only, and `CodeRow.vue` renders cells over those tracks then emits an additional full-width child for the detail prose when present. CSS handles the muted/indented styling. No JS helpers added — column filtering is a one-line `cols.filter(c => c !== 'detail')` at each site.

**Tech Stack:** Vue 3 SFC + Tailwind utility classes. CSS Grid `subgrid` with `grid-column: 1 / -1` for the full-width child.

**Project conventions (from CLAUDE.md):**
- Do **not** add tests. JSDoc on parser/format functions only.
- Do **not** add new dependencies.
- Frontmatter is parsed by the in-repo helper; do not introduce gray-matter or similar.
- Surgical edits only — touch only what the task requires.

**Spec:** `docs/superpowers/specs/2026-05-09-detail-wraps-below-design.md`

---

## File Structure

| File | Responsibility | Change kind |
|---|---|---|
| `web/src/pages/Sheet.vue` | Owns the per-card grid container; computes track count | Modify `cardGridColumns(section)` |
| `web/src/components/CodeRow.vue` | Renders one row: top-line cells + optional detail sub-row | Add detail sub-row child |
| `web/src/index.css` | Card-row styling | Add `.card-detail-row` rule |
| `docs/CONTENT_FORMAT.md` | Authoring contract for `card` sections | Update `detail` description |
| `docs/anchored-specs.md` | User Stories and Acceptance Criteria | Add `US-card-detail-wrap` + `AC-card-detail-wrap.1` |

---

## Task 1: Filter `detail` from grid track count in `Sheet.vue`

**Files:**
- Modify: `web/src/pages/Sheet.vue` (function `cardGridColumns`)

**Why first:** The grid container's track count drives subgrid alignment in CodeRow. If CodeRow drops the detail cell from its top-line iteration before the parent drops the track, the trailing track sits empty and search highlight cells widen by one slot; if the parent drops it first, the child's last cell overflows. Both files must change together; this task does the parent half.

- [ ] **Step 1: Replace `cardGridColumns` to count non-detail columns only**

Current implementation in `web/src/pages/Sheet.vue`:

```js
function cardGridColumns(section) {
  const n = section.columns.length
  const first = 'var(--row-first-col, max-content)'
  if (n === 0) return ''
  if (n === 1) return first
  if (n === 2) return `${first} minmax(0, 1fr)`
  const extras = Array(n - 2).fill('minmax(0, 1.5fr)').join(' ')
  return `${first} minmax(0, 1fr) ${extras}`
}
```

Replace with:

```js
function cardGridColumns(section) {
  const n = section.columns.filter((c) => c !== 'detail').length
  const first = 'var(--row-first-col, max-content)'
  if (n === 0) return ''
  if (n === 1) return first
  if (n === 2) return `${first} minmax(0, 1fr)`
  const extras = Array(n - 2).fill('minmax(0, 1.5fr)').join(' ')
  return `${first} minmax(0, 1fr) ${extras}`
}
```

Note: a card whose only column is `detail` returns `''` (no top-line tracks). That's intended — every row is then a sub-row only.

- [ ] **Step 2: Run the dev server briefly to confirm no parse error**

The dev server is already running on port 5174. After saving the file Vite hot-reloads. If a syntax error fires, fix it before moving on. (Visual breakage is expected at this point — CodeRow still tries to render the detail cell into a non-existent track. Task 2 fixes it.)

---

## Task 2: Render detail sub-row in `CodeRow.vue`

**Files:**
- Modify: `web/src/components/CodeRow.vue`

- [ ] **Step 1: Replace the component**

Current file:

```vue
<script setup>
import { formatInline, highlight } from '../lib/format.js'
import { searchQuery } from '../store.js'

defineProps({
  row: { type: Object, required: true },
  columns: { type: Array, required: true },
  dimmed: { type: Boolean, default: false },
})

function cellClass(_col, index) {
  if (index === 0) return 'font-semibold text-ink'
  return 'text-muted'
}
</script>

<template>
  <div
    class="grid col-span-full px-3 py-1 border-b border-hairline/60 last:border-b-0 items-baseline transition-colors hover:bg-paper-warm"
    :class="dimmed ? 'opacity-60' : ''"
    style="grid-template-columns: subgrid;"
  >
    <span
      v-for="(col, i) in columns"
      :key="col"
      :class="cellClass(col, i)"
      v-html="highlight(formatInline(row[col], { plainCode: i === 0 }), searchQuery)"
    />
  </div>
</template>
```

Replace with:

```vue
<script setup>
import { computed } from 'vue'
import { formatInline, highlight } from '../lib/format.js'
import { searchQuery } from '../store.js'

const props = defineProps({
  row: { type: Object, required: true },
  columns: { type: Array, required: true },
  dimmed: { type: Boolean, default: false },
})

const topColumns = computed(() => props.columns.filter((c) => c !== 'detail'))

const hasDetail = computed(
  () => props.columns.includes('detail') && !!props.row.detail,
)

function cellClass(_col, index) {
  if (index === 0) return 'font-semibold text-ink'
  return 'text-muted'
}
</script>

<template>
  <div
    class="grid col-span-full px-3 py-1 border-b border-hairline/60 last:border-b-0 items-baseline transition-colors hover:bg-paper-warm"
    :class="dimmed ? 'opacity-60' : ''"
    style="grid-template-columns: subgrid;"
  >
    <span
      v-for="(col, i) in topColumns"
      :key="col"
      :class="cellClass(col, i)"
      v-html="highlight(formatInline(row[col], { plainCode: i === 0 }), searchQuery)"
    />
    <div
      v-if="hasDetail"
      class="card-detail-row"
      v-html="highlight(formatInline(row.detail), searchQuery)"
    />
  </div>
</template>
```

Notes:
- `topColumns` mirrors the parent's track filter exactly. Subgrid invariant holds.
- `hasDetail` requires both that `detail` is in the section's column list AND that the row's `detail` field is truthy. This handles cards that don't have a `detail` column at all (no sub-row ever) and rows that simply omit `detail` (no sub-row for that row).
- The detail sub-row uses `class="card-detail-row"` — defined in Task 3. Inside the subgrid container it spans every track via the CSS rule (`grid-column: 1 / -1`).
- `formatInline(row.detail)` (no `plainCode` flag) gives detail prose the inline-code chip styling, matching how `desc` and other non-first cells render today.

- [ ] **Step 2: Browser-check on a content sheet with detail rows**

Open http://localhost:5174/ and navigate to a Sheet whose cards have `detail` rows — `content/django/basics/` is the canonical example. Visually confirm:
- Top-line cells (code | name | desc) align across rows.
- Detail wraps beneath the cells when present.
- Rows without `detail` (if any) render as a single tabular line.
- Inline code chips inside detail render as gray pills.
- Search (top bar) — typing a substring still dims non-matching rows and highlights matches inside detail.

Visual is expected to be unstyled/unindented at this point. Task 3 adds the styling.

---

## Task 3: Style the detail sub-row in `index.css`

**Files:**
- Modify: `web/src/index.css`

- [ ] **Step 1: Locate the existing card-row CSS block**

Run: `grep -n "card-body--blank\|cards-vertical\|cards-masonry" web/src/index.css | head -10`

Place the new rule near these existing card-related selectors (a few lines below them is fine — keep the file's visual grouping).

- [ ] **Step 2: Add the rule**

```css
.card-detail-row {
  grid-column: 1 / -1;
  padding-left: 0.75rem;        /* 1× pl-3, indent under the row's left edge */
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  color: rgb(var(--c-muted) / 1);
  line-height: 1.625;            /* leading-relaxed */
}
```

The `grid-column: 1 / -1` makes the sub-row span every track of the parent's subgrid.

`var(--c-muted)` is the same token used by Tailwind's `text-muted` utility in this project — confirm by grepping `--c-muted` in `web/src/index.css` if uncertain. It must already exist.

- [ ] **Step 3: Browser-check the styled result**

Reload http://localhost:5174/django/basics. Confirm:
- Detail sub-row text is muted and indented.
- The row's `border-b` hairline sits below the detail prose, not between the cells and the prose.
- In a `vertical` chapter (use the rail gear popover to switch one chapter to vertical), the layout is identical — detail still wraps below.
- In a 2-column or 3-column masonry chapter, detail prose wraps inside the narrower card width without overflowing.

---

## Task 4: Update doc files (`CONTENT_FORMAT.md`, `CLAUDE.md`)

**Files:**
- Modify: `docs/CONTENT_FORMAT.md` (the `### card` section, around line 136)
- Modify: `CLAUDE.md` (the "Use `detail` fields aggressively" paragraph, around line 102)

- [ ] **Step 1: Update the `detail` column description in `CONTENT_FORMAT.md`**

Find this paragraph in `docs/CONTENT_FORMAT.md`:

```markdown
The `detail` column always renders inline alongside the other columns, regardless of the chapter's layout type.
```

Replace with:

```markdown
The `detail` column renders as a muted prose sub-row beneath the row's tabular cells, indented from the row's left edge and spanning the row's full width. Rows whose `detail` value is empty or absent render as a single tabular line. This applies in both `columns` and `vertical` chapter layouts.
```

Also, immediately above this paragraph, the column descriptor line reads:

```markdown
Columns: `code` (mono, bold), `name` (semibold), `desc` (muted), `detail` (rendered inline). All columns optional except at least one content column. Non-standard column names are rendered as extra muted text.
```

Update `detail (rendered inline)` to `detail (muted prose sub-row)`.

- [ ] **Step 2: Refresh stale authoring guidance in `CLAUDE.md`**

`CLAUDE.md` line 102 currently reads:

```markdown
**Use `detail` fields aggressively**. In `columns` chapters the `detail` column is hidden and shown in a modal on row click — keeps rows tight while still carrying full explanation. In `vertical` chapters `detail` renders inline as another column, since the card already has full horizontal width. Either way, fill it.
```

This text was added by dev's CLAUDE.md restructure after the prior change to remove the modal pathway, so it didn't get updated then. With the new sub-row layout, replace with:

```markdown
**Use `detail` fields aggressively**. The `detail` column renders as a muted prose sub-row beneath the tabular cells in every chapter type, so authors can fill it without worrying about widening or stretching the row. Keeps the top-line tabular cells tight and the full explanation always visible.
```

---

## Task 5: Add User Story + Acceptance Criterion in `docs/anchored-specs.md`

**Files:**
- Modify: `docs/anchored-specs.md`

The project uses slug-style codes for new stories (per CLAUDE.md). Place the new story near other render-related stories — the existing story closest in topic is `US-mobile-readonly` (small-screen rendering). Insert `US-card-detail-wrap` immediately after that story's NFR block, or wherever fits the file's existing flow when you read it.

- [ ] **Step 1: Read the file's current structure to find the right insertion point**

Run: `grep -n "^## \|^### \|^#### US-\|^#### AC-" docs/anchored-specs.md | tail -30`

This shows the document's heading skeleton. Pick the most natural insertion point — either at the end of the User Stories section or alongside other Sheet-rendering stories.

- [ ] **Step 2: Add the User Story envelope**

Insert this block (heading levels match the file's existing User Story headings — usually `### US-…` or `#### US-…`; copy the level from a neighboring story):

```markdown
### US-card-detail-wrap — Detail field renders as a sub-row beneath card cells

As a `Reference User`, when I view a `Sheet`,
I want each card row's `detail` content to render as a muted prose line beneath the row's tabular cells (rather than as a fourth cell in the same line),
So that verbose detail does not stretch the row's first three cells, leaving wasted vertical space alongside short `code` / `name` / `desc` values.

**INVEST notes:**
- **I**ndependent — pass: scoped to `card` row rendering; no dependency on other stories.
- **N**egotiable — pass: the styling specifics (indent depth, vertical padding) are tunable.
- **V**aluable — pass: directly serves Learning Retention by improving the spatial density of card-style references.
- **E**stimable — pass: a small grid + CSS change in two files plus one CSS rule.
- **S**mall — pass: under 1 day of work.
- **T**estable — pass: visually verified per the AC below; no parser or content-format changes are required.

_Anchoring note: single Context (`View`). Dictionary terms (`Reference User`, `Sheet`) are backticked in their dictionary sense._
```

- [ ] **Step 3: Add the Acceptance Criterion**

Below the INVEST block:

```markdown
#### AC-card-detail-wrap.1 — Detail wraps as a muted sub-row beneath card cells — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` whose cards include rows with a non-empty detail value,
When the `Sheet` is rendered,
Then each such row's tabular cells render in a single grid line aligned across the card,
    And the detail content for that row renders as a muted prose sub-row directly beneath the cells, indented from the row's left edge and spanning the row's full row width,
    And rows whose detail value is empty or absent render as a single tabular line with no sub-row
```
```

(Note: the inner code fence is `` ```gherkin ``; the outer code fence in this plan is just for plan-doc readability.)

---

## Task 6: Final verification

- [ ] **Step 1: Production build sanity check**

Run from the worktree root: `npm --prefix web run build`

Expected: `vite v5.4.21 building for production... ✓ built in <1s`. No errors. If it fails, address the error and retry.

- [ ] **Step 2: Grep for stale artifacts**

Run: `grep -rn "card-detail-row\|hasDetail\|topColumns" web/src/`

Expected hits:
- `card-detail-row` — once in `web/src/index.css`, once in `web/src/components/CodeRow.vue`.
- `hasDetail` — once in `web/src/components/CodeRow.vue` (the new `computed`).
- `topColumns` — once in `web/src/components/CodeRow.vue`.

Any other hits indicate something accidental.

- [ ] **Step 3: Manual AC walkthrough**

Open http://localhost:5174/ and walk through the AC text:

1. `content/django/basics/` — cards have detail rows. Confirm: cells aligned, detail wraps muted+indented beneath.
2. Use a Sheet with a card whose rows have **mixed** detail (some rows have it, some don't), e.g. inspect `content/python/3.14/` or another sheet — confirm rows without detail are single-line; rows with detail get the sub-row.
3. Switch a chapter to `vertical` via the gear popover. Layout is identical (top-line + sub-row).
4. Switch back to `columns`, set `cols=2` or `cols=3`. Detail still wraps cleanly inside narrower card widths.
5. Type a search query that matches text inside a detail block. Highlight `<mark>` should render inside the sub-row; non-matching rows dim including their sub-rows.
6. Re-confirm small-screen behavior at narrow viewport: cards stack as today, sub-rows render as expected.

- [ ] **Step 4: Commit**

If you're using one logical commit per task per the engineer's preference, this is also fine to roll into a single commit at the end. The user's CLAUDE.md says "Only create commits when requested by the user" — confirm with the user before committing if there's any doubt. Suggested message:

```
Card row: detail wraps below as muted sub-row

Verbose detail no longer stretches code/name/desc cells. Top-line stays
tabular and aligned across the card; detail renders as a muted, indented
prose sub-row beneath when present. Subgrid invariant maintained by
filtering `detail` from both the parent's track count
(`cardGridColumns`) and the child's cell iteration (`topColumns`).
```

---

## Self-Review

- **Spec coverage:** Every section of the spec is addressed:
  - Behavior (top-line + sub-row, no sub-row for empty detail) → Task 2.
  - Visual specification (indent, color, leading, padding) → Task 3.
  - Grid mechanics (parent + child filtering) → Tasks 1 & 2.
  - File table → all five files covered (Tasks 1, 2, 3, 4, 5).
  - Verification steps → Task 6.
  - Acceptance Criteria envelope → Task 5.
- **Placeholder scan:** No "TBD"/"TODO"/vague steps. Every code block is the actual content to write.
- **Type consistency:** `topColumns` (Task 2) and the parent's track-count filter (Task 1) both use `cols.filter((c) => c !== 'detail')`. `hasDetail` (Task 2) gates the sub-row. `card-detail-row` is the single class name shared between Tasks 2 and 3.
- **Scope:** One feature, ~6 tightly-bound tasks. Fits one implementation session.
