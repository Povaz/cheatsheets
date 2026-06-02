# View

> The View Context covers what the User sees and navigates — the single-page, information-dense rendered surfaces optimised for photographic recall. It also defines the User in their role as consumer of CheatSheets.

## §1 Relationships

Pairs with the Content Context. A `CheatSheet` is the rendered view of exactly one `Topic[Content]`; a `Sheet` is the rendered view of exactly one `SubTopic[Content]`, generated from that `SubTopic[Content]`'s `Reference[Content]`. The `Reference User` does not edit `Sheet` content directly — content changes flow through Content (`Source[Content]`s → `Reference[Content]` → `Sheet`). The `Reference User` does, however, adjust the per-`Chapter` rendering of any `Sheet` (font sizes, column count, layout) and the `Sheet`-wide page max-width, without affecting Content. The `Reference User` defined here is the same human as the `Consolidation User[Content]` defined in Content; the two roles capture different activities (consuming vs building) and may be carried out at different times by the same person.

## §2 Dictionary

| Term           | Definition |
|----------------|------------|
| `CheatSheet`   | The complete view of one `Topic[Content]`. A collection of `Sheet`s — one per `SubTopic[Content]` — sharing a unified style. Same underlying thing as a `Topic[Content]`, viewed from the rendering aspect. |
| `Sheet`        | The single-page view of one `SubTopic[Content]`. Information-dense, spatially stable, optimised so the User can rely on photographic recall to relocate previously-seen information. Generated from the `SubTopic[Content]`'s `Reference[Content]`. |
| `Chapter`      | A named structural group of cards within a `Sheet`. A `Sheet` may declare zero or more `Chapter`s; a `Sheet` with no explicit `Chapter`s renders as a single implicit `Chapter`. Each `Chapter` has its own layout (vertical or columns) and its own per-`Chapter` rendering settings (font sizes, column count). Authored by the `Consolidation User[Content]` as ordered chapter entries under `chapters:` in the `SubTopic[Content]`'s `sheet.yml` (each chapter listing its cards in order); consumed by the `Reference User` as the spatial grouping unit of a `Sheet`. |
| `Reference User` | The User acting to consume an already-built `CheatSheet`: opening it, navigating between its `Sheet`s, and using photographic recall to retrieve previously-studied information (Learning Retention). Same human as the `Consolidation User[Content]` defined in Content; the role differs. |

## §3 User Stories

_Activated as of `US-dark-mode`. Earlier stories (`US-1`..`US-5`) intentionally have no FURPS+ rollup — the project is small and personal. NFR is added per-story when a feature raises real cross-cutting quality requirements (accessibility, performance, reliability, etc.) rather than as a blanket project gate. Stories without an NFR section below have no formalised NFR._

### US-4 — Browse a CheatSheet and read its Sheets

[Contexts: View]

**Title:** US-4 — Browse a CheatSheet and read its Sheets

**As a** `Reference User`, \
**I can** open a `CheatSheet` and navigate between its `Sheet`s, \
**so that** I can recall what I have studied using my photographic memory.

INVEST check:
- **I**ndependent — pass: a `CheatSheet` could come from any source, not strictly Story 1.
- **N**egotiable — pass: navigation UX (tabs, scroll, keyboard, etc.) is open.
- **V**aluable — pass: this story IS the Learning Retention goal for the `Reference User`.
- **E**stimable — pass: bounded reading/navigation surface.
- **S**mall — pass.
- **T**estable — pass: the `Reference User` opens a `CheatSheet`, sees `Sheet`s, can switch between them.

#### Background

```gherkin
Given a `CheatSheet` for "Python" exists with `Sheet`s "3.13" and "3.14"
```

#### AC-4.1 — Open a `CheatSheet` — Happy Path

```gherkin
Given the `Reference User` has the "Python" `CheatSheet` available in their list,
When the `Reference User` opens the "Python" `CheatSheet`,
Then the `CheatSheet` is displayed,
    And one of its `Sheet`s is shown by default
```

#### AC-4.2 — Switch to another `Sheet` within the `CheatSheet` — Happy Path

```gherkin
Given the `Reference User` is viewing the "Python" `CheatSheet` with `Sheet` "3.13" displayed,
When the `Reference User` selects `Sheet` "3.14",
Then `Sheet` "3.14" is displayed in place of "3.13"
```

#### AC-4.3 — Personalise the rendering of a `Chapter` — Happy Path

```gherkin
Given the `Reference User` is viewing `Sheet` "3.14" of the "Python" `CheatSheet`,
    And `Sheet` "3.14" contains `Chapter` "Standard library" alongside other `Chapter`s,
When the `Reference User` opens the settings on `Chapter` "Standard library",
    And adjusts its body-text size, card-title size, chapter-title size, layout, or column count,
Then the rendering of `Chapter` "Standard library" reflects the new settings,
    And the other `Chapter`s of `Sheet` "3.14" remain unchanged
```

#### AC-4.4 — Per-`Chapter` settings persist across sessions — Happy Path

```gherkin
Given the `Reference User` has personalised the rendering of `Chapter` "Standard library" on `Sheet` "3.14",
When the `Reference User` reloads the page,
    Or navigates away from `Sheet` "3.14" and back,
Then `Chapter` "Standard library" is rendered with the previously-set settings,
    And no other `Chapter` or `Sheet` is affected
```

#### AC-4.5 — Adjust the page max-width of a `Sheet` — Happy Path

```gherkin
Given the `Reference User` is viewing `Sheet` "3.14" of the "Python" `CheatSheet`,
When the `Reference User` opens the page settings,
    And adjusts the maximum page width,
Then `Sheet` "3.14" is laid out at the new width,
    And the new width persists across reloads of the same `Sheet`
```

#### AC-4.6 — `Chapter` open/closed state persists across sessions — Happy Path

```gherkin
Given the `Reference User` is viewing `Sheet` "3.14" of the "Python" `CheatSheet`,
    And `Sheet` "3.14" contains `Chapter` "Standard library" alongside other `Chapter`s,
    And the `Reference User` has collapsed `Chapter` "Standard library" so its cards are hidden,
When the `Reference User` reloads the page,
    Or navigates away from `Sheet` "3.14" and back,
Then `Chapter` "Standard library" is rendered in its previously-set collapsed state with its cards hidden,
    And the open/closed state of every other `Chapter` of `Sheet` "3.14" is preserved as last left,
    And no `Chapter` on any other `Sheet` is affected
```

_Implementation: US-4 is the only story served by the deployed web app. It is realised by the routing table (§7) and the content loader — `/` lists `Topic[Content]`s, `/:topic` resolves to the default `SubTopic[Content]`, `/:topic/:subtopic` renders the `Sheet`._

### US-dark-mode — Toggle between Light and Dark display modes

[Contexts: View]

**Title:** US-dark-mode — Toggle between Light and Dark display modes

**As a** `Reference User`, \
**I can** switch the display of my `CheatSheet`s between a Light and a Dark theme, \
**so that** I can read my `Sheet`s comfortably regardless of ambient light or time of day.

INVEST check:
- **I**ndependent — pass: builds on US-4 in spirit but does not require any other story to be implemented in any specific way; the toggle works on whatever `CheatSheet`s exist.
- **N**egotiable — pass: outcome-stated. Where the control lives (header, settings panel, OS-only), how the choice is persisted, and whether OS preference is followed by default are all open and belong in AC.
- **V**aluable — pass: directly serves Learning Retention by making the `Reference User`'s reading experience comfortable in low-light conditions and during long study sessions.
- **E**stimable — pass: bounded surface (one toggle, one palette swap). No new content pipeline is involved.
- **S**mall — pass: 1–2 days of work; fits a sprint slice.
- **T**estable — pass: the `Reference User` activates the control and the visible appearance of every `Sheet` changes accordingly.

_Anchoring note: single Context (`View`). Dictionary terms (`Reference User`, `CheatSheet`, `Sheet`) are backticked in their dictionary sense. "Light theme" and "Dark theme" are plain UX terms and intentionally not backticked — they are not in the Dictionary._

_Code convention: this story uses a slug code (`US-dark-mode`) rather than the integer scheme of US-1..US-5. New stories adopt slug codes from this point forward to keep agent-authored revisions merge-safe; existing integer codes remain sticky and are never renumbered._

#### AC-dark-mode.1 — Toggle the theme — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` from the "Python" `CheatSheet` displayed in the Light theme,
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

- [ ] **Functionality:** every section type of a `Sheet` (cards, code rows, pill rows, callouts, the sources footer, the chapter rails) renders legibly in both themes — no hardcoded colour leaks Light values into the Dark theme or vice versa.
- [ ] **Usability (Accessibility):** the theme toggle exposes its current state via `aria-pressed` and is operable by keyboard alone (Tab to focus, Space or Enter to activate); focus is visible against both backgrounds.
- [ ] **Performance:** theme transition completes within 300 ms of activation, including paint, with no layout shift.
- [ ] **Reliability (FOUC prevention):** when the stored or OS-derived theme is Dark, the application's first paint after a reload is already in the Dark theme — at no point does a Light surface flash before the script executes.

### US-sheet-search — Search within a Sheet

[Contexts: View]

**Title:** US-sheet-search — Search within a Sheet

**As a** `Reference User`, \
**I can** type a search term while viewing a `Sheet` and have every occurrence highlighted in place while cards with no occurrence keep their original size but show only their title, \
**so that** I can immediately spot hits and skip non-matching cards without losing the spatial layout my photographic memory relies on.

INVEST check:
- **I**ndependent — pass: applies to any rendered `Sheet`; no dependency on other stories.
- **N**egotiable — pass: visual treatment (`<mark>` colour, "blank body but title visible" vs alternatives) is open.
- **V**aluable — pass: directly supports Learning Retention by accelerating in-`Sheet` lookup.
- **E**stimable — pass: scope is the existing search-bar plus per-section render path.
- **S**mall — pass: one feature on top of an already-rendered `Sheet`.
- **T**estable — pass: matched terms are wrapped in a marker element; non-matching cards keep their footprint with only the title visible.

#### AC-sheet-search.1 — Highlight matches and blank non-matching cards — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` with multiple cards,
    And at least one card contains the term "model" and at least one card does not,
When the `Reference User` types "model" into the search input,
Then every occurrence of "model" inside the rendered `Sheet` is visually highlighted in place,
    And cards that contain at least one occurrence render their content normally with the highlights applied,
    And cards that contain no occurrence keep the same size and position they had before the search, with their title visible and the rest of their body invisible
```

#### AC-sheet-search.2 — Diagram cards remain visible — Sad Path

```gherkin
Given the `Reference User` is viewing a `Sheet` containing a diagram card,
    And the diagram does not contain the searched term in its source markup,
When the `Reference User` enters a search term that matches no diagram content,
Then the diagram card still renders its full body,
    And no highlight markup is injected into the diagram itself
```

### US-mobile-readonly — Read a Sheet on a small screen

[Contexts: View]

**Title:** US-mobile-readonly — Read a Sheet on a small screen

**As a** `Reference User`, \
**I can** open a `Sheet` on a small-screen device and read it as a single-column, vertically-scrolled view with authoring and customisation controls hidden, \
**so that** I can quickly look up information from a `Sheet` while away from my desk without fighting a layout that assumes a wide viewport.

INVEST check:
- **I**ndependent — pass: applies to any rendered `Sheet`; no dependency on other stories. Coexists with `US-4`'s per-`Chapter` settings (those settings remain authoritative on wide screens, and are simply suppressed on small screens).
- **N**egotiable — pass: outcome-stated. The exact viewport breakpoint, the visual treatment of `Chapter` titles, and which controls are suppressed are all open and belong in AC.
- **V**aluable — pass: directly serves Learning Retention by extending the `Reference User`'s lookup surface from the desk to any device they have on hand.
- **E**stimable — pass: bounded surface (CSS responsive overrides plus one reactive viewport flag). No new content pipeline, no new section types, no new persisted settings.
- **S**mall — pass: 1 day of work; reuses the existing `cards-vertical` layout already built for vertical `Chapter`s.
- **T**estable — pass: at a small viewport every `Sheet` renders cards in a single column with the customisation affordances absent; at a wide viewport behaviour is unchanged.

_Anchoring note: single Context (`View`). Dictionary terms (`Reference User`, `Sheet`, `Chapter`, `CheatSheet`) are backticked in their dictionary sense. "Small screen" / "wide viewport" are plain UX terms and intentionally not backticked — they are not in the Dictionary. The chosen design threshold is **768 px viewport width** (a `Sheet` rendered below this width is considered to be on a small screen); pinning the exact pixel value belongs to design/implementation and is recorded here only for auditability._

_Scope note: this story covers reading a `Sheet`. It does not introduce mobile-only navigation patterns, a hamburger menu, install prompts, offline support, or row-level reflow of multi-column card rows into label/value pairs. The `CheatSheet` index and `Topic[Content]` index pages are expected to remain usable on small screens by virtue of their already-simple link-list layout, and any further responsive work for those pages is out of scope here._

#### AC-mobile-readonly.1 — Render every `Chapter` as a single column on a small screen — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` whose `Chapter`s have been authored or personalised with a multi-column layout,
    And the viewport width is below the small-screen threshold,
When the `Sheet` is rendered,
Then every `Chapter` displays its cards stacked one per row at full available width,
    And the per-`Chapter` column count and `vertical`/`columns` layout type stored from prior personalisation are not applied,
    And the page-wide max-width constraint is not applied
```

#### AC-mobile-readonly.2 — Suppress customisation affordances on a small screen — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` on a small screen,
When the `Sheet` is rendered,
Then the page max-width control is not present in the page,
    And the per-`Chapter` settings popover is not present on any `Chapter`,
    And the `Chapter` collapse/expand affordance is not present on any `Chapter`,
    And the `Reference User`'s previously stored personalisation values remain in storage and are reapplied on the next wide-screen viewing
```

#### AC-mobile-readonly.3 — Render `Chapter` titles as horizontal headers on a small screen — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` with one or more named `Chapter`s on a small screen,
When the `Sheet` is rendered,
Then each `Chapter`'s title is shown as a horizontal header above its cards, preceded by the same divider that separates `Chapter`s on a wide screen,
    And the vertical `Chapter` rail is not rendered
```

#### AC-mobile-readonly.4 — Resizing across the threshold switches modes live — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` with the viewport above the small-screen threshold and a multi-column layout visible,
When the viewport is resized below the small-screen threshold,
Then the `Sheet` re-renders into the small-screen single-column form without a page reload,
    And resizing the viewport back above the threshold restores the prior multi-column layout, including the `Reference User`'s stored per-`Chapter` personalisation
```

#### Non-Functional Requirements

- [x] **Functionality:** every section type of a `Sheet` (cards, code rows, pill rows, callouts, the sources footer, the chapter divider) renders without forcing horizontal page scroll on a 360 px-wide viewport; long unbreakable tokens (URLs, identifiers) are allowed to scroll within their own card body.
- [x] **Usability:** primary controls that remain visible on a small screen (the search input, the theme toggle) keep a minimum tap target of approximately 32 px square and remain operable without hover-only affordances.
- [x] **Performance:** the layout switch triggered by crossing the small-screen threshold (orientation change or window resize) completes on the next paint without a perceptible reload, and the small-screen render does not regress first-contentful-paint relative to the wide-screen render.

### US-card-detail-wrap — Detail field renders as a sub-row beneath card cells

[Contexts: View]

**Title:** US-card-detail-wrap — Detail field renders as a sub-row beneath card cells

**As a** `Reference User`, when I view a `Sheet`,
**I want** each card row's `detail` content to render as a muted prose line beneath the row's tabular cells (rather than as a fourth cell in the same line),
**so that** verbose detail does not stretch the row's first three cells, leaving wasted vertical space alongside short `code` / `name` / `desc` values.

INVEST check:
- **I**ndependent — pass: scoped to `card` row rendering; no dependency on other stories.
- **N**egotiable — pass: the styling specifics (indent depth, vertical padding) are tunable.
- **V**aluable — pass: directly serves Learning Retention by improving the spatial density of card-style references.
- **E**stimable — pass: a small grid + CSS change in two files plus one CSS rule.
- **S**mall — pass: under 1 day of work.
- **T**estable — pass: visually verified per the AC below; no parser or content-format changes are required.

_Anchoring note: single Context (`View`). Dictionary terms (`Reference User`, `Sheet`) are backticked in their dictionary sense._

#### AC-card-detail-wrap.1 — Detail wraps as a muted sub-row beneath card cells — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` whose cards include rows with a non-empty detail value,
When the `Sheet` is rendered,
Then each such row's tabular cells render in a single grid line aligned across the card,
    And the detail content for that row renders as a muted prose sub-row directly beneath the cells, indented from the row's left edge and spanning the row's full row width,
    And rows whose detail value is empty or absent render as a single tabular line with no sub-row
```

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
  cheatsheet: ParsedSheet     // from parseCheatsheet(sheet.yml + cards/*.md)
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

### Reference exclusion

`reference.md` is **not** loaded into the runtime bundle. Bundling it would only inflate the deployed payload for content the `Reference User` never sees. It lives in the repo for the `Consolidation User[Content]` and for git history.
