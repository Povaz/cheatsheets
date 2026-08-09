---
name: explain
description: guidelines to author a Sheet Fragment (sheet.html) in the site's fixed vocabulary
---

Produce the result as a Sheet Fragment: `content/<topic>/<subtopic>/sheet.html`. The Fragment first introduces the topic to the reader and then dives deeper into a comprehensive explanation, with the scope bounded by the user (ask if unbounded or ambiguous).

## Method
- Progressive disclosure. Order concepts so each is introduced only after everything it depends on. The reader must be able to go top-to-bottom once, never needing to jump ahead for a term used earlier — if concept B relies on concept A, A comes first. State this promise and honor it.
- Verified official sources. Ground every claim in primary/official documentation; prefer it over blogs unless the community canonically relies on an unofficial source. Before citing any URL, confirm it actually resolves and says what you claim — never cite from memory. Do not embed source links or an "All sources"list in the page — attribution lives outside it (`sources.yml` for CheatSheet artifacts).
- Voice. Direct, crisp, schematic: short paragraphs, lists over prose, concrete examples (use my stack/context when I give it). No change-history, no filler.

## Page structure
- Output is `content/<topic>/<subtopic>/sheet.html` — body markup only, in the Fragment vocabulary below. No `<html>`/`<head>`/`<body>` skeleton, no `<title>`.
- No table of contents — the site derives it from the Fragment's `<section>`s.
- No in-page title or hero — the host page provides the title from `sheet.yml`. The Fragment starts directly at the first `<section>`.
- Numbered or slugged `<section id="…">` elements, one `<h2>` each; `<h3>` for sub-headings within a section.
- No tip/warning/gotcha callouts — if a fact is essential to the concept, it belongs in the body text; if it isn't, omit it. A small flow diagram or table wherever it clarifies more than prose.

## Fragment constraints
- No styling and no scripts: no `<style>`, no `<script>`, no `style` attribute, no `on*` event attributes anywhere (including inside `<svg>`).
- No colours: no literal colours anywhere, including SVG `fill`/`stroke` — only `none` and `currentColor` are allowed there. The site's stylesheet supplies every colour through the theme.
- No external resources: no external URLs. `<a href>` may only point to an in-fragment anchor (`#id`).
- Body markup only in the vocabulary below — nothing outside it.
- `npm run validate --prefix web` must pass. Before reporting the Sheet as done, run `npm run validate --prefix web` and confirm it passes.

### Vocabulary — allowed elements, classes, attributes

| Element | Purpose |
|---------|---------|
| `<section id="…">` with one `<h2>` | One titled section — the unit of the Table of Contents, anchor navigation, and spatial recall. Ids unique within the Fragment. |
| `<h3>` | Sub-heading within a section. |
| `<p>`, `<ul>`, `<ol>` | Prose and lists; inline `<strong>`, `<em>`, `<code>`, `<a>` allowed. |
| `<div class="tbl">` + `<table>` | A data table inside its horizontal-scroll wrapper. |
| `<div class="code">` + `<pre><code>` | A code block; optional `<span class="label">` file-tab label. |
| `<figure class="diagram">` + inline `<svg>` | A diagram; shapes use the vocabulary's theme classes, never literal colours. |
| `<div class="flow">` | A horizontal step-flow of boxed items. |
| `<div class="note">` | A neutral emphasis box for a load-bearing remark that must stand apart from the body flow; optional `<span class="label">` lead. |
| `<div class="cols">` | A multi-column group of blocks; stacks to a single column on small screens. |

The exhaustive, code-enforced allow-list (matches `web/scripts/validate-fragments.mjs`):

- Elements and their allowed attributes: `section` (`id`), `h2`, `h3`, `p`, `ul`, `ol`, `li`, `strong`, `em`, `code`, `a` (`href` — in-fragment `#id` only), `br`, `div` (`class`: `tbl`|`code`|`flow`|`note`|`cols`|`step`), `span` (`class`: `label`), `table`, `thead`, `tbody`, `tr`, `th` (`colspan`, `rowspan`), `td` (`colspan`, `rowspan`), `pre`, `figure` (`class`: `diagram`), `figcaption`, `svg` (and any element nested inside it).
- SVG classes: `dg-box`, `dg-hot`, `dg-txt`, `dg-txt-inv`, `dg-lbl`, `dg-line`, `dg-flow`.
- No literal colours anywhere, including SVG `fill`/`stroke` — only `none` and `currentColor` allowed.
- No `id` duplicates within a Fragment; no element outside this list; no attribute outside this list.
