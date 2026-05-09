# Card row: detail wraps below as muted sub-row

**Date:** 2026-05-09
**Status:** Design — approved, pending implementation

## Context

After unifying card behavior so the `detail` column always renders inline, the existing four-column tabular row often wastes vertical space: `code`, `name`, and `desc` are usually short (one or two short tokens), while `detail` runs to several lines of prose. Because all four columns share a single grid row whose height is set by the tallest cell, the first three columns sit on top of large vertical gaps.

This spec changes how a row containing a non-empty `detail` value lays itself out: the non-detail columns stay on a tabular top line, and the `detail` text wraps onto a muted sub-row beneath, spanning the full row width.

## Goals

- Reduce visual emptiness on rows whose `detail` column is much taller than the others.
- Keep the spatial-anchoring properties of the tabular layout for `code` / `name` / `desc` (the user reads cards by spatial memory; the top line of every row should stay aligned).
- Preserve the search highlighting, dimming, and inline-markdown behavior already supported on `detail` text.

## Non-goals

- Re-introducing any conditional behavior tied to chapter `type` (the prior `vertical` / `columns` switch is gone and stays gone).
- A toggle for showing / hiding the detail sub-row. Detail is always inline (per the prior spec).
- Generalising the wrap-below treatment to columns other than `detail`. Other verbose columns continue to render as cells in the top line.
- Changes to `pills`, `code`, `diagram`, or `text` section types.

## Behavior

A `card` section's columns are divided into **top-line columns** (every column whose name is not `detail`) and the **detail column** (if present).

Per row:

- The top-line cells render as a single tabular grid row, aligned across the card via subgrid as today. Cell styling (`code` mono+bold, `name` semibold, `desc` muted) is unchanged.
- If `row.detail` is non-empty, a sub-row renders directly beneath the cells: muted prose, indented, spanning every grid track of the parent. Inline code chips, bold/em/links inside detail format as today.
- If `row.detail` is empty or absent, no sub-row renders. The row is a single tabular line.
- The hairline `border-b` between rows sits below the entire row (cells + sub-row when present).

Cards whose column list does not include `detail` are unaffected. Cards whose column list is `[detail]` only — degenerate but allowed — render only sub-rows with no top line.

Search dim and search highlight apply to the detail sub-row exactly as they do to top-line cells. A row that does not match the current search is dimmed in full, including its detail sub-row.

## Visual specification

- **Indent:** 0.75rem (`pl-3`) from the row's left edge. No alignment to the `name` or `desc` column boundary.
- **Color:** `text-muted` (same token as the `desc` cell).
- **Font size:** chapter body-size (no shrink). The reader's photographic memory anchors on body-size text; making detail smaller weakens that.
- **Line height:** `leading-relaxed`.
- **Vertical padding:** `pt-1` between top-line cells and sub-row, `pb-1` below sub-row before the hairline divider. Mirrors the row's existing `py-1`.
- **No left rail, no italic, no border.** The indent + muted color is enough subordination.

## Grid mechanics

The parent `<div class="grid gap-x-3">` in `Sheet.vue` defines tracks via `cardGridColumns(section)`. After this change:

- `cardGridColumns(section)` computes its track count from the **non-detail** columns: `n = section.columns.filter(c => c !== 'detail').length`. Track widths follow the existing rule (`first | minmax(0, 1fr) | 1.5fr extras…`).
- `CodeRow.vue` renders a single child container with `grid-template-columns: subgrid; grid-column: 1 / -1`. Inside that container:
  - Top-line cells render in `v-for` over the row's non-detail columns, taking one subgrid track each.
  - When `row.detail` is non-empty, an additional `<div>` with `grid-column: 1 / -1` follows the cells, carrying the detail prose.

The subgrid invariant (parent track count == child cell count on the top line) holds because both sides derive from the same filtered column list.

## Files to modify

| File | Change |
|---|---|
| `web/src/pages/Sheet.vue` | `cardGridColumns(section)` filters out `detail` before counting; no other change. |
| `web/src/components/CodeRow.vue` | Compute `topColumns` (= `props.columns.filter(c => c !== 'detail')`) for the cell `v-for`. Render the detail sub-row as a sibling element with `grid-column: 1 / -1` when `row.detail` is truthy. |
| `web/src/index.css` | Add one rule for the detail sub-row class (color, indent, padding, leading). Place near existing card-row rules. |
| `docs/CONTENT_FORMAT.md` | Update the `detail` description from "rendered inline alongside the other columns" to "rendered as a muted sub-row beneath the row's other columns." |
| `docs/design.md` | No change expected (file does not describe per-row layout in detail). Re-confirm during implementation. |
| `docs/superpowers/specs/2026-05-09-detail-wraps-below-design.md` | This file. |

No changes to `format.js`, `parseCheatsheet.js`, `store.js`, or any sheet content under `content/`.

## Verification

1. Build passes: `npm --prefix web run build`.
2. Open a Sheet with a card whose rows have `detail` (e.g. `content/django/basics/`). Visually confirm:
   - Top-line cells stay aligned across rows.
   - Detail wraps beneath as muted prose, indented from the left.
   - Rows without `detail` render as a single tabular line.
   - Inline code chips and search highlight render correctly inside detail.
   - Card masonry layout (multi-column chapter) still tiles correctly.
   - The `cards-vertical` chapter layout still produces full-width stacked cards.
3. Toggle the chapter's `type` between `vertical` and `columns` via the rail gear — confirm the per-row layout (top-line + sub-row) is identical in both. Layout class change only affects card-container layout.
4. Apply a search query that hits some rows but not others — confirm dimming and highlight propagate to detail sub-rows.

## Acceptance Criteria (anchored)

A new slug-style User Story `US-card-detail-wrap` is added to `docs/anchored-specs.md` (per the project's convention of slug codes over integers) with one happy-path AC:

> **AC-card-detail-wrap.1** — Given a `Sheet` whose card rows carry a non-empty detail value, when the `Sheet` is rendered, then the detail content renders as a muted prose sub-row beneath the row's tabular cells, indented from the row's left edge and spanning the row's full row width. Rows whose detail value is empty or absent render as a single tabular line.

The implementation plan should write the User Story envelope (purpose, INVEST notes, anchoring footnote) at the same time as the AC.

## Risks

- **Narrow masonry columns:** in a card placed inside a 1-track-wide multi-column chapter, the detail prose may wrap aggressively. Acceptable — the detail block remains readable; it is muted prose, not a code block. Verify visually during implementation.
- **Subgrid drift:** the only failure mode is the parent's track count and the child's cell count diverging. Both derive from the same filter, so this is bounded to a one-line change in either file. Worth a manual eyeball during implementation.
