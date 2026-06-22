# View

> The View Context covers what the User sees and navigates — the single-page, information-dense rendered surfaces optimised for photographic recall. It also defines the User in their role as consumer of CheatSheets.

## §1 Relationships

Pairs with the Content Context. A `CheatSheet` is the rendered view of exactly one `Topic[Content]`; a `Sheet` is the rendered view of exactly one `SubTopic[Content]`, generated from that `SubTopic[Content]`'s `Reference[Content]`. An `Embedded Sheet` is the rendered view of exactly one `Artifact SubTopic[Content]`, the same 1:1 way. The `Reference User` does not edit `Sheet` content directly — content changes flow through Content (`Source[Content]`s → `Reference[Content]` → `Sheet`). The `Reference User` does, however, adjust the per-`Chapter` rendering of any `Sheet` (font sizes, column count, layout) and the `Sheet`-wide page max-width, without affecting Content. The `Reference User` defined here is the same human as the `Consolidation User[Content]` defined in Content; the two roles capture different activities (consuming vs building) and may be carried out at different times by the same person.

## §2 Dictionary

| Term             | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `CheatSheet`     | The complete view of one `Topic[Content]`. A collection of `Sheet`s — one per `SubTopic[Content]` — sharing a unified style. Same underlying thing as a `Topic[Content]`, viewed from the rendering aspect.                                                                                                                                                                                                                                                                                                                                                                  |
| `Sheet`          | The single-page view of one `SubTopic[Content]`. Information-dense, spatially stable, optimised so the User can rely on photographic recall to relocate previously-seen information. Generated from the `SubTopic[Content]`'s `Reference[Content]`. A `Sheet` is rendered either from `Chapter`s of cards (the default) or from the embedded artifact of an `Artifact SubTopic[Content]` (an `Embedded Sheet`).                                                                                                                                                                                                                                                                                                                          |
| `Embedded Sheet` | A `Sheet` whose body is the single embedded artifact of an `Artifact SubTopic[Content]`, rendered as-is in an isolated style scope. It has no `Chapter`s; per-`Chapter` and page-width controls do not apply. Maps 1:1 to an `Artifact SubTopic[Content]`.                                                                                                                                                                                                                                                                                                                                                                                              |
| `Chapter`        | A named structural group of cards within a `Sheet`. A `Sheet` may declare zero or more `Chapter`s; a `Sheet` with no explicit `Chapter`s renders as a single implicit `Chapter`. Each `Chapter` has its own layout (vertical or columns) and its own per-`Chapter` rendering settings (font sizes, column count). Authored by the `Consolidation User[Content]` as ordered chapter entries under `chapters:` in the `SubTopic[Content]`'s `sheet.yml` (each chapter listing its cards in order); consumed by the `Reference User` as the spatial grouping unit of a `Sheet`. |
| `Reference User` | The User acting to consume an already-built `CheatSheet`: opening it, navigating between its `Sheet`s, and using photographic recall to retrieve previously-studied information (Learning Retention). Same human as the `Consolidation User[Content]` defined in Content; the role differs.                                                                                                                                                                                                                                                                                  |

## §3 User Stories

_NFR is added per-story when a feature raises real cross-cutting quality requirements (accessibility, performance, reliability, etc.) rather than as a blanket project gate. Stories without an NFR section have no formalised NFR._

### US-4 — Browse a CheatSheet and read its Sheets

[Contexts: View]

**As a** `Reference User`, \
**I can** open a `CheatSheet` and navigate between its `Sheet`s, \
**so that** I can recall what I have studied using my photographic memory.

#### Background

```gherkin
Given a `CheatSheet` exists with multiple `Sheet`s
```

#### AC-4.1 — Open a `CheatSheet` — Happy Path

```gherkin
Given the `Reference User` has a `CheatSheet` available in their list,
When the `Reference User` opens the `CheatSheet`,
Then the `CheatSheet` is displayed,
    And one of its `Sheet`s is shown by default
```

#### AC-4.2 — Switch to another `Sheet` within the `CheatSheet` — Happy Path

```gherkin
Given the `Reference User` is viewing a `CheatSheet` with a `Sheet` displayed,
When the `Reference User` selects a different `Sheet`,
Then the selected `Sheet` is displayed in place of the previous one
```

#### AC-4.3 — Personalise the rendering of a `Chapter` — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` with multiple `Chapter`s,
When the `Reference User` adjusts any of the `Chapter`'s rendering settings (`bodySize`, `cardTitleSize`, `chapterTitleSize`, `cols`, `type`),
Then that `Chapter` reflects the new settings,
    And the other `Chapter`s of the `Sheet` remain unchanged,
    And the settings persist across reloads and navigation
```

#### AC-4.4 — Adjust the page layout width of a `Sheet` — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet`,
When the `Reference User` adjusts the page layout width,
Then the `Sheet` is laid out at the new width,
    And the new width persists across reloads of the same `Sheet`
```

#### AC-4.5 — Collapse and expand `Chapter`s — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` with multiple `Chapter`s,
When the `Reference User` collapses a `Chapter`,
Then that `Chapter`'s cards are hidden,
    And the collapsed state persists across reloads and navigation,
    And the state of every other `Chapter` is preserved
```

#### AC-4.6 — Card detail renders as a sub-row beneath card cells — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` whose cards include rows with a non-empty detail value,
When the `Sheet` is rendered,
Then each such row's detail content renders as a muted sub-row beneath the row's cells,
    And rows whose detail value is empty or absent render as a single line with no sub-row
```

---

### US-dark-mode — Toggle between Light and Dark display modes

[Contexts: View]

**As a** `Reference User`, \
**I can** switch the display of my `CheatSheet`s between a Light and a Dark theme, \
**so that** I can read my `Sheet`s comfortably regardless of ambient light or time of day.

#### AC-dark-mode.1 — Toggle the theme — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` displayed in the Light theme,
When the `Reference User` activates the theme toggle,
Then the `Sheet` is displayed in the Dark theme,
    And every other `Sheet` in every `CheatSheet` is also displayed in the Dark theme on subsequent navigation
```

#### AC-dark-mode.2 — Theme preference persists across reloads — Happy Path

```gherkin
Given the `Reference User` has activated the Dark theme,
When the `Reference User` reloads the page,
Then the application reopens in the Dark theme without a visible flash to the Light theme
```

#### AC-dark-mode.3 — First visit follows the operating system preference — Happy Path

```gherkin
Given the `Reference User` is opening the application for the first time with no stored theme preference,
    And the operating system reports a Dark theme preference,
When the application loads,
Then the `Reference User` sees the application displayed in the Dark theme
```

#### AC-dark-mode.4 — Toggle still works when persistent storage is unavailable — Sad Path

```gherkin
Given the `Reference User` is viewing the application in a browsing mode where persistent storage is blocked or unavailable,
When the `Reference User` activates the theme toggle,
Then the visible appearance of the `Sheet` switches between Light and Dark for the current session,
    And the application does not raise a user-visible error
```

#### Non-Functional Requirements

- [ ] **Functionality:** every section type of a `Sheet` (cards, code rows, callouts, the sources footer, the chapter rails) renders legibly in both themes — no hardcoded colour leaks Light values into the Dark theme or vice versa. An `Embedded Sheet` is exempt: it carries its own complete styling and renders as-is regardless of theme (see `AC-embed-view.3`).
- [ ] **Usability (Accessibility):** the theme toggle exposes its current state via `aria-pressed` and is operable by keyboard alone (Tab to focus, Space or Enter to activate); focus is visible against both backgrounds.
- [ ] **Performance:** theme transition completes within 300 ms of activation, including paint, with no layout shift.
- [ ] **Reliability (FOUC prevention):** when the stored or OS-derived theme is Dark, the application's first paint after a reload is already in the Dark theme — at no point does a Light surface flash before the script executes.

### US-sheet-search — Search within a Sheet

[Contexts: View]

**As a** `Reference User`, \
**I can** type a search term while viewing a `Sheet` and have every occurrence highlighted in place while cards with no occurrence keep their original size but show only their title, \
**so that** I can immediately spot hits and skip non-matching cards without losing the spatial layout my photographic memory relies on.

#### AC-sheet-search.1 — Highlight matches and blank non-matching cards — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` with multiple cards,
    And at least one card contains the term "model" and at least one card does not,
When the `Reference User` types "model" into the search input,
Then every occurrence of "model" inside the rendered `Sheet` is visually highlighted in place,
    And cards that contain at least one occurrence render their content normally with the highlights applied,
    And cards that contain no occurrence keep the same size and position they had before the search, with their title visible and the rest of their body invisible
```

> An `Embedded Sheet` has no cards; search inside one highlights matches within the artifact instead (see `AC-embed-view.4`).

### US-mobile-readonly — Read a Sheet on a small screen

[Contexts: View]

**As a** `Reference User`, \
**I can** open a `Sheet` on a small-screen device and read it as a single-column, vertically-scrolled view with customisation controls hidden, \
**so that** I can quickly look up information from a `Sheet` while away from my desk without fighting a layout that assumes a wide viewport.

#### AC-mobile-readonly.1 — Render every `Chapter` as a single column on a small screen — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` whose `Chapter`s use a multi-column layout,
    And the viewport width is below the small-screen threshold,
When the `Sheet` is rendered,
Then every `Chapter` displays its cards stacked one per row at full available width,
    And personalised layout and page-width constraints are not applied
```

#### AC-mobile-readonly.2 — Suppress customisation controls on a small screen — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` on a small screen,
When the `Sheet` is rendered,
Then customisation controls are not available,
    And the `Reference User`'s previously stored personalisation values remain in storage and are reapplied on the next wide-screen viewing
```

#### AC-mobile-readonly.3 — Render `Chapter` titles as inline headers on a small screen — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` with one or more named `Chapter`s on a small screen,
When the `Sheet` is rendered,
Then each `Chapter`'s title is shown as an inline header above its cards,
    And `Chapter`s are visually separated from one another
```

#### AC-mobile-readonly.4 — Resizing across the threshold switches modes live — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` above the small-screen threshold with a multi-column layout visible,
When the viewport is resized below the small-screen threshold,
Then the `Sheet` re-renders into the small-screen single-column form without a page reload,
    And resizing the viewport back above the threshold restores the prior layout, including the `Reference User`'s stored personalisation
```

#### Non-Functional Requirements

- [x] **Functionality:** every section type of a `Sheet` (cards, code rows, callouts, the sources footer, the chapter divider) renders without forcing horizontal page scroll on a 360 px-wide viewport; long unbreakable tokens (URLs, identifiers) are allowed to scroll within their own card body.
- [x] **Usability:** primary controls that remain visible on a small screen (the search input, the theme toggle) keep a minimum tap target of approximately 32 px square and remain operable without hover-only affordances.
- [x] **Performance:** the layout switch triggered by crossing the small-screen threshold (orientation change or window resize) completes on the next paint without a perceptible reload, and the small-screen render does not regress first-contentful-paint relative to the wide-screen render.

### US-embed-view — View an Embedded Sheet

[Contexts: View]

**As a** `Reference User`, \
**I can** open an `Embedded Sheet` and see its artifact rendered exactly as built — navigating to and from it like any other `Sheet`, \
**so that** I can consume artifacts inside my `CheatSheet` without losing the unified navigation.

#### AC-embed-view.1 — Render the artifact as-is — Happy Path

```gherkin
Given the `Reference User` is viewing an `Embedded Sheet`,
When the artifact is rendered,
Then the artifact's own styling is preserved,
    And the artifact's CSS does not leak into the rest of the application,
    And the application's styles do not alter the artifact
```

#### AC-embed-view.2 — Navigate to an Embedded Sheet like any other — Happy Path

```gherkin
Given the `Reference User` is viewing a `CheatSheet` that contains both card-authored `Sheet`s and an `Embedded Sheet`,
When the `Reference User` selects the `Embedded Sheet` from the Sheet picker,
Then the `Embedded Sheet` is displayed in place of the previous `Sheet`,
    And it is selectable in the same way as any card-authored `Sheet`
```

#### AC-embed-view.3 — Theme toggle leaves the artifact unchanged — Happy Path

```gherkin
Given the `Reference User` is viewing an `Embedded Sheet`,
When the `Reference User` toggles between the Light and Dark themes,
Then the application chrome reflects the selected theme,
    And the artifact's internal rendering remains unchanged
```

#### AC-embed-view.4 — Search highlights matches inside the artifact — Happy Path

```gherkin
Given the `Reference User` is viewing an `Embedded Sheet` whose artifact contains the term "model",
When the `Reference User` types "model" into the search input,
Then every occurrence of "model" inside the artifact is highlighted in place,
    And no card-blanking occurs because an `Embedded Sheet` has no cards
```

#### AC-embed-view.5 — Per-Chapter and page-width controls are absent — Happy Path

```gherkin
Given the `Reference User` is viewing an `Embedded Sheet`,
When the `Sheet` is rendered,
Then the per-`Chapter` settings gears are not shown,
    And the page-width control is not shown
```

> Search here extends `US-sheet-search` to `Embedded Sheet`s; the non-matching-card blanking in `AC-sheet-search.1` has no effect since an `Embedded Sheet` has no cards.

## §4 Data Model

Settings are persisted per `Sheet` in `localStorage` under `cheatsheet:settings:<topic>/<subtopic>` and are not part of any content file. The shape is:

```ts
type SheetSettings = {
  maxWidth: number                                       // page width — Sheet-scoped
  chapters: Record<string, Partial<ChapterSettings>>     // per-chapter overrides keyed by chapter id ('' for the implicit chapter)
}

type ChapterSettings = {
  bodySize: number
  cardTitleSize: number
  chapterTitleSize: number
  cols: number                  // 1..6
  type: 'vertical' | 'columns'
  collapsed: boolean            // open/closed state of the chapter rail; default true
}
```

Resolution at render time is two-tier: **per-`Chapter` override → hard-coded `CHAPTER_DEFAULTS`** (`web/src/store.js`). The page-scoped `maxWidth` is applied as a `--page-max` custom property on `:root`; the `Chapter`-scoped fields are applied as inline custom properties (`--body-size`, `--card-title-size`, `--chapter-title-size`, `--cards-cols`) on each `Chapter`'s `<section>` element. The body-size variable is consumed by `.chapter { font-size: var(--body-size, 12px) }`, so it scales `Chapter` content without affecting the global header/footer. The `Chapter` `type` drives a `cards-vertical` / `cards-masonry` class on the cards container.

The top-right `SettingsPanel` edits only `maxWidth`; a small gear on each `Chapter`'s rail opens a `ChapterSettingsPopover` that edits that `Chapter`'s overrides.

### Migration notes

The store API in `web/src/store.js` migrates older shapes into the current shape on first load:

- **v1 (flat shape):** only `maxWidth` survives the migration.
- **v2 (`defaults` shape):** the `defaults` block is silently dropped; `cols: null` overrides from prior shapes are normalized away (the new default is `3`).

### Small-screen override

A reactive `isSmallScreen` ref in `web/src/store.js` tracks `matchMedia('(max-width: 767.98px)')` and drives a `.is-small-screen` class on the App.vue root. While the flag is `true`: `Sheet.vue` forces every `Chapter` to `cards-vertical` and skips per-`Chapter` style injection; the `<SettingsPanel>` (page max-width control) is unmounted; and the per-`Chapter` rail, settings popover, and collapse/expand button are replaced by a static `<h2 class="chapter-rail-mobile">`. The persisted `SheetSettings` are untouched — they reapply when the viewport returns above the threshold.

## §5 API

> _Not applicable — the deployed app is a static site with no backend API._

## §6 Procedures & Workflows

> _Not applicable — the View Context has no procedures. The authoring pipeline lives in [`content.md` §6](content.md#6-procedures--workflows)._

## §7 Frontend

### Routing

| Path                    | Component | Behaviour |
|-------------------------|-----------|-----------|
| `/`                     | `Home`    | Lists every `Topic[Content]`. Each entry links to `/<topic>`. |
| `/:topic`               | `Topic`   | Loads the `Topic[Content]`. If exactly one `SubTopic[Content]` exists, replaces the URL with `/<topic>/<subtopic>`. Otherwise lists `SubTopic[Content]`s and replaces the URL with the `default` `SubTopic[Content]`. |
| `/:topic/:subtopic`     | `Sheet`   | Renders the `Sheet`. Unknown `SubTopic[Content]` redirects to the `Topic[Content]`'s default; unknown `Topic[Content]` redirects to `/`. |
| `*`                     | redirect  | Catch-all → `/`. |

Hash routing is the deliberate choice: GitHub Pages serves static files only, so without hash routing every deep link would 404 unless a `404.html` SPA fallback is wired up. Hash URLs sidestep that entirely.

### Content loading types

`web/src/lib/content.js` walks the bundled raw modules and produces:

```ts
type Topic = {
  slug: string                // folder name
  title: string
  subtitle: string | null
  default: string             // SubTopic slug
  subtopics: SubTopic[]
}

type SubTopic = {
  name: string                // folder name
  slug: string                // <topic>/<subtopic>
  kind: 'classic' | 'embed'   // 'classic' = card-authored; 'embed' = Artifact SubTopic
  frontmatter: { title: string, subtitle: string }   // header + Sheet-picker label (both kinds)
  cheatsheet?: ParsedSheet    // classic only — from parseCheatsheet(sheet.yml + cards/*.md)
  artifactHtml?: string       // embed only — raw artifact.html, rendered as-is
  sources: Source[]           // parsed from sources.yml; empty if absent
}

type Source = {
  title: string
  type: string                // doc | article | rfc | pep | video | pdf | other
  fetched: string             // ISO date
  read_as?: string
  kind: 'remote' | 'local'    // remote → opens new tab; local → downloads
  href: string                // remote URL or Vite-bundled asset URL
  filename: string | null     // basename of the local file (null for remote)
}

type ParsedSheet = {
  frontmatter: Record<string, string>
  chapters: Chapter[]         // one implicit chapter when the sheet declares none
}

type Chapter = {
  id: string                  // slug; '' for the implicit chapter
  title: string               // '' for the implicit chapter (no divider/rail rendered)
  sections: Section[]
}
```

A `Chapter`'s *layout* (`vertical` vs `columns`) is **not** part of the parsed `Sheet` — it is a runtime `Sheet` setting (see §4). The parser silently strips any legacy `{type: …}` attribute on `[chapter]` headers from older content.

### Sources loading

`sources.yml` is loaded into the runtime bundle and rendered as a "Sources" footer on each `Sheet`. Local source files referenced by relative `url` (under `content/local_sources/` or alongside the `SubTopic[Content]`'s `sources.yml`) are emitted as static assets via `import.meta.glob('...', { query: '?url' })` so they can be downloaded directly.

### Embedded Sheet rendering

When `entry.kind === 'embed'`, `Sheet.vue` skips the `Chapter`/card loop and renders **`EmbeddedArtifact.vue`** in its place; the page header (title/subtitle from `entry.frontmatter`) and the `SourcesFooter` are shared with card-authored `Sheet`s, so navigation and chrome are identical.

`EmbeddedArtifact.vue` mounts the artifact in a same-origin `<iframe srcdoc="…">` (no `sandbox` attribute). On the frame's `load` it:

- starts a parent-side `ResizeObserver` on the frame document and syncs the iframe height to the content (no inner scrollbar; nothing injected into the artifact);
- injects a `<style>` for `.search-hit` into the frame `<head>` and applies the current `searchQuery`.

A `watch(searchQuery)` re-runs the highlight: a `TreeWalker` over the frame body wraps matches in `<mark class="search-hit">` and unwraps them when the query empties. There is no card-blanking (an `Embedded Sheet` has no cards) — this is the `Embedded Sheet` arm of `US-sheet-search`.

`App.vue` hides the `<SettingsPanel>` when the current entry is embedded; the per-`Chapter` rail/gear never renders because an `Embedded Sheet` has no `Chapter`s. The `SheetSettings` in `localStorage` (§4) are therefore unused for `Embedded Sheet`s.

Mechanism rationale (iframe vs Shadow DOM), the no-sandbox trade-off, and the self-contained-artifact authoring contract are recorded in [`hldd.md` §6.6](hldd.md#66-embedded-sheets).
