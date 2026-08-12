# Handoff: CheatSheetOS — sidebar navigation, sources drawer, new dark mode

## Overview

This is a re-organisation of the CheatSheets site UI, rebranded to **CheatSheetOS**. Three changes:

1. **New navigation.** The homepage card grid and the header folder-menus are replaced by a persistent left **Sidebar** that presents the content tree as folders (CheatSheets/Topics) and files (Sheets/SubTopics). The sidebar never unmounts while navigating between Sheets. The rest of the viewport is the **Sheet Quadrant**. The two panes scroll independently.
2. **New Sources widget.** `SourcesFooter` becomes an inverted dropdown pinned to the bottom of the Sheet Quadrant. Collapsed it is a single bar; clicking it slides a panel up over the sheet, which stays in place behind a dim.
3. **New dark mode.** The warm brown dark palette is replaced with a near-black neutral ("Ink"). **The light palette is unchanged** — every light value in this document is copied from the existing `web/src/index.css`.

The global header and footer are **removed**. Their contents (wordmark, search, theme toggle, copyright, GitHub/LinkedIn links) move into the sidebar.

## About the design files

`design-reference.html` in this bundle is a **design reference created in HTML** — a prototype showing intended look and behaviour, not production code to copy. The task is to recreate it in the existing Vue 3 + vue-router + Tailwind application under `web/`, using its established patterns: CSS custom properties in `web/src/index.css`, the Tailwind token mapping in `web/tailwind.config.js`, single-file components under `web/src/components/` and `web/src/pages/`.

Do not add runtime dependencies — HLDD §2.4 forbids it.

The prototype uses inline styles with hard-coded hex values because of how it was authored. **In the real implementation every colour must come from the existing CSS custom properties** (`rgb(var(--c-paper))` etc. / the Tailwind `paper`, `ink`, `muted`, `hairline`, `accent`, `surface`, `paper-warm` classes). The hex values in this document are given so you can verify you have the right token, not so you can paste them.

## Fidelity

**High fidelity.** Colours, typography, spacing and layout are final. Recreate pixel-perfectly using the existing tokens and Tailwind scale.

## Where to look in the reference file

Open `design-reference.html`. It is a canvas of dated design turns, newest at the top. Two turns:

- **Turn 2 — build this.**
  - `2a` — the light-mode spec. Full shell at 1360×860.
  - `2b` — the same layout in Ink dark, with the Sources drawer shown **open**.
- **Turn 1 — earlier exploration, superseded.** Kept for context only. `1a` shows the sources drawer open in light mode (useful reference for the open state, which `2a` does not show). `1c` shows the three dark palettes that were considered; **Ink** was chosen. `1d` shows a collapsed 48px rail and a mobile drawer — **explicitly deferred, do not implement**.

There is also `Current UI.dc.html` in the parent project (not bundled here): a recreation of the existing UI, used as the before-state during design. The real before-state is your repo.

---

## Screens / Views

### 1. Application shell

**Purpose** — frame every route. Replaces the current `App.vue` header / `<main>` / footer structure.

**Layout**

- Root: `display:flex`, fills the viewport (`100dvh`), `overflow:hidden`. No page-level scroll.
- Child 1 — Sidebar: `flex: 0 0 268px`, background `--c-paper-warm` (`#F3EFE6`), `border-right: 1px solid --c-hairline`.
- Child 2 — Sheet Quadrant: `flex: 1 1 0; min-width: 0`, background `--c-paper` (`#FAF8F5`), `position: relative` (the Sources drawer is absolutely positioned inside it).
- No header element. No footer element.

The sidebar lives in `App.vue` so it survives route changes. `<RouterView>` renders into the Sheet Quadrant.

### 2. Sidebar (new component — `web/src/components/Sidebar.vue`)

`display:flex; flex-direction:column; min-height:0`. Five stacked regions, top to bottom:

**2.1 Brand row** — `flex: 0 0 auto`, padding `16px 16px 13px`, `border-bottom: 1px solid --c-hairline`, `display:flex; align-items:center; gap:8px`.

- Wordmark `cheatsheet` — Fraunces, `19px`, weight `800`, `line-height:1`, colour `--c-ink`. Lowercase, as authored.
- `OS` chip — `display:inline-flex; align-items:center; padding:2px 5px; border-radius:3px`, background `--c-accent`, colour `--c-paper`, `font-size:10px; font-weight:700; letter-spacing:.08em`. JetBrains Mono.
- Spacer (`flex:1`).
- Collapse button `‹` — 22×22px, `border-radius:4px`, `1px solid --c-hairline`, background `--c-paper`, colour `--c-muted`, `font-size:11px`. **The collapsed state itself is deferred** (it was `1d`); ship the button disabled or omit it until the collapsed rail is designed.

**2.2 Filter row** — `flex: 0 0 auto`, padding `10px 16px`, `border-bottom: 1px solid --c-hairline`.

- `<input type="search" placeholder="filter">`, full width, `padding: 4px 8px`, `1px solid --c-hairline`, `border-radius:2px`, background `--c-paper`, `font-size:11px`, inherits the mono family.
- This filters the **tree** (folder + file names, substring, case-insensitive). It is **not** the in-sheet search. Both exist: the existing header `SearchBar` (which highlights matches inside the rendered Fragment, driven by `searchQuery` in `store.js`) moves into the Sheet Quadrant header — see 3.1.
- A folder with any matching file stays expanded while a filter is active, regardless of its stored open/closed state; clearing the filter restores the stored state.

**2.3 Tree** — `flex: 1 1 0; min-height:0; overflow-y:auto; padding-bottom:8px`. This is the pane that scrolls independently of the sheet.

Order: topics sorted by slug ascending; subtopics sorted by `name.localeCompare(..., {numeric:true})` **descending** — identical to the current `buildTopics()` in `web/src/lib/content.js`. Do not change the ordering; version-named sheets must keep opening newest-first.

*Folder row* — `display:flex; align-items:center; gap:8px; padding: 9px 16px 5px; cursor:pointer`.

| Element | Spec |
|---|---|
| Caret | `▶` closed / `▼` open, `font-size:7px`, `width:8px`, colour `--c-muted` |
| Accent square | `5×5px`, no radius, background = the topic's `accent` from `topic.yml`, falling back to `--c-muted` |
| Title | `topic.yml` `title`, `text-transform:uppercase; letter-spacing:.12em; font-size:10px; font-weight:700`, colour `--c-muted`, `flex:1`, truncate with ellipsis |
| Count | subtopic count zero-padded to two digits (`01`, `04`), `font-size:10px`, colour `--c-muted`, `font-variant-numeric: tabular-nums` |

Clicking anywhere on the folder row toggles it. It does **not** navigate — this differs from today, where `/topic` opens the topic's `default` subtopic. Keep that route working for existing deep links (it should expand the folder and open the default sheet), but the sidebar row itself only expands.

**`topic.yml` carries an `accent` key that the app currently parses into nothing.** The sidebar squares are its first consumer. Present values: aws `#FF9900`, git `#f05033`, minio `#C72E49`, react `#61DAFB`, specification `#6366f1`, terraform `#7B42BC`. `django` and `ml-regression` have none → `--c-muted`.

*File rows* (rendered only when the folder is open) — `display:grid; grid-template-columns: 1.5rem 1fr; align-items:baseline; column-gap:8px; padding: 3px 16px 3px 32px; cursor:pointer`.

| Element | Spec |
|---|---|
| Index | 1-based position within the folder, zero-padded (`01`), right-aligned, `font-size:10px`, colour `--c-muted`, tabular-nums |
| Name | the subtopic folder name (`worktrees-agents`), `font-size:11px`, truncate with ellipsis |
| Name, inactive | weight `400`, colour `--c-muted` |
| Name, active | weight `600`, colour `--c-accent` |
| Row, active | background `rgb(var(--c-accent) / .09)` in light, `rgb(var(--c-accent) / .13)` in dark; plus `box-shadow: inset 2px 0 0 rgb(var(--c-accent))` as the left bar |
| Row, hover | background `rgb(var(--c-hairline) / .5)` |

The stable numeric index is deliberate — HLDD §1.1 optimises for photographic recall, so a file's position in the list should be a fixed address.

**2.4 Daily Recall + theme** — `flex: 0 0 auto`, `border-top: 1px solid --c-hairline`, `display:flex; align-items:stretch`.

- Recall button — `flex:1`, `padding: 11px 16px`, `border-right: 1px solid --c-hairline`, `cursor:pointer`. Contents: 5×5px `--c-accent` square, label `Daily Recall` in `uppercase / .12em / 10px / 700 / --c-accent`, spacer, question count (`10`) at `10px --c-muted` tabular-nums. Routes to `/recall`. Hidden entirely when `recallData` is null, as today.
- Theme toggle — `flex: 0 0 42px`, borderless, centred, `--c-muted`, the existing 13×13 moon/sun SVG from `ThemeToggle.vue` unchanged.

**2.5 Site links** — `flex: 0 0 auto`, `border-top: 1px solid --c-hairline`, `padding: 10px 16px`, `display:flex; flex-direction:column; align-items:flex-start; gap:4px; font-size:10px`, colour `--c-muted`.

- Row 1: `GitHub` · `LinkedIn`, `display:flex; gap:8px`, separator `·` in `--c-hairline`. Same hrefs and `target="_blank" rel="noopener noreferrer"` as the current footer. Hover → `--c-accent`.
- Row 2: `© 2026 Erick Venneri`, `white-space:nowrap`.

Two rows, not one: at 268px a single row wraps the name mid-string.

### 3. Sheet Quadrant — sheet route (`/:topic/:subtopic`)

`display:flex; flex-direction:column; position:relative`. Three regions.

**3.1 Sheet header** — `flex: 0 0 auto`, `padding: 26px 32px 16px`, `border-bottom: 1px solid --c-hairline`.

- Path line, `margin-bottom: 11px`, `display:flex; align-items:center; gap:7px`: a 5×5px square in the topic's accent, then `git / worktrees-agents` in `uppercase / .12em / 10px / 700 / --c-muted`. Ambient context, not a control.
- `<h1>` — the sheet's `title` from `sheet.yml`. Fraunces, `44px`, weight `800`, `line-height:1`, `margin:0`.
- `<p>` — the sheet's `subtitle`. `font-size:12px`, colour `--c-muted`, `margin: 9px 0 0`.
- The in-sheet `SearchBar` belongs on this row (right-aligned against the h1, or under the path line). The prototype omits it — place it here, keep its `/` shortcut and `Escape` behaviour from `App.vue` exactly as-is.

Note the h1 no longer sits beside the subtopic name in Fraunces as in today's `Sheet.vue`; the slug moved to the path line.

**3.2 Sheet body** — `flex: 1 1 0; min-height:0; overflow-y:auto; padding: 0 32px`. Inner wrapper `max-width: 76rem; margin: 0 auto; padding: 24px 0 60px`.

This is the second independently scrolling pane. The rendered Fragment goes here via the existing `SheetFragment.vue` and `web/src/styles/sheet.css`, **unchanged**. The Fragment contract (HLDD §2.5) is untouched by this redesign — no `sheet.html` file changes anywhere in `content/`.

One consequence to handle: `sheet.css` sets `.sheet-fragment { padding: 1.75rem 1.25rem 1.5rem }` and the old `.sheet-page-body` added `0 1rem`. With the new 32px quadrant padding, drop the horizontal padding from the wrapper or from `.sheet-fragment` so the text block does not end up double-inset.

Also remove `.sheet-page`, `.sheet-page-header`, `.sheet-page-body` from `index.css`, and the `html.sheet-lock` class plus the `onMounted`/`onUnmounted` hooks in `Sheet.vue` that apply it — the shell no longer scrolls the document, so the lock is dead weight. `.sheet-page`'s `calc(100vh - 41px - 37px - 3rem)` hard-codes the header and footer heights that no longer exist.

**3.3 Sources drawer** (new component — `web/src/components/SourcesDrawer.vue`, replacing `SourcesFooter.vue`)

*Collapsed* — `flex: 0 0 auto`, `padding: 10px 32px`, `border-top: 1px solid --c-hairline`, background `--c-paper-warm`, `display:flex; align-items:center; gap:10px; cursor:pointer`.

| Element | Spec |
|---|---|
| Chevron | `⌃`, `font-size:11px`, `--c-muted` |
| Label | `Sources`, `uppercase / .12em / 10px / 700 / --c-ink` |
| Count | `02`, `10px`, `--c-muted`, tabular-nums |
| Spacer | `flex:1` |
| Preview | first source title + `· +N` for the rest, `10px`, `--c-muted`, right side, truncate with ellipsis |

Hidden entirely when the sheet has no sources, as `SourcesFooter` is today.

*Open* — see `2b` (dark) and `1a` (light).

- A dim covers the whole quadrant: `position:absolute; inset:0; background: rgb(var(--c-overlay-rgb) / var(--overlay-alpha)); pointer-events:none`. The existing overlay token is exactly right — `0.20` light, `0.60` dark. The sheet does **not** move or resize behind it.
- The panel: `position:absolute; left:0; right:0; bottom:0; height:300px` (light prototype uses 320px; standardise on 300), background `--c-paper`, `border-top: 1px solid --c-hairline`, `box-shadow: 0 -6px 18px rgba(0,0,0,.08)` light / `rgba(0,0,0,.55)` dark — i.e. `--shadow-popover` with the y-offset inverted. Add `--shadow-popover-up` to `index.css` rather than hard-coding.
- Panel header: same bar as collapsed but with `⌄` and `border-bottom` instead of `border-top`; clicking it closes.
- Panel body: `flex:1; min-height:0; overflow-y:auto; padding: 6px 32px 16px`.

*Source rows* — keep the existing grid from `SourcesFooter.vue`, widened for the drawer: `grid-template-columns: 1.75rem 7rem minmax(0,1.1fr) minmax(0,1.6fr) auto 1rem`, `column-gap: .7rem`, `align-items:baseline`, `padding: 9px 8px 9px 0`, `border-bottom: 1px solid --c-hairline`, `border-left: 2px solid transparent`.

Columns: index (`01`, tabular, right, `--c-muted`) · type badge (`doc`, `link · doc` — bordered, `--c-paper-warm` fill, `border-radius:2px`, `10px/600`, `--c-muted`) · title (`12px`, ellipsis) · `read_as` (`10px`, italic, `--c-muted`, ellipsis) · `fetched` (`10px`, tabular, `--c-muted`) · affordance (`⬇` local / `↗` remote).

Hover state carries over unchanged from `SourcesFooter.vue`: background `rgb(var(--c-hairline) / .35)`, left border `--c-accent`, title underlined in `--c-accent` at `text-underline-offset: 3px`.

The `sideways-lr` "Sources" rail from the old footer is gone.

### 4. Sheet Quadrant — landing state (`/`)

Not drawn in the prototype. Build it as: the CheatSheetOS wordmark large in Fraunces, one line of copy, and the keyboard hints (`/` to search, `⌘[` / `⌘]` to step between sheets in a folder), centred or top-left in the quadrant with the same 32px padding. Nothing else — the tree is the navigation now.

`Home.vue`'s card grid and `Topic.vue` are both retired; `/:topic` should expand that folder in the sidebar and route on to its `default` subtopic.

---

## Interactions & behaviour

| Trigger | Result |
|---|---|
| Click folder row | Toggles that folder only. Any number can be open at once. No navigation. |
| Click file row | Navigates to `/:topic/:subtopic`. Sidebar does not remount, does not scroll, does not collapse anything. |
| Click Sources bar | Drawer slides up, `220ms ease-out` on `transform: translateY(100%) → 0`; dim fades in over the same duration. |
| Click drawer header, `Escape`, or click the dim | Closes. Reverse transition. |
| Type in sidebar filter | Filters folder + file names, case-insensitive substring. Matching folders auto-expand; empty folders hide. Clearing restores stored open state. |
| `/` | Focuses the in-sheet search (existing `onGlobalKey` in `App.vue`). |
| `⌘[` / `⌘]` | Previous / next sheet within the current folder (existing behaviour, keep). |
| Route change | Sidebar auto-expands the folder containing the new sheet and marks the file active. |
| Theme toggle | Unchanged — toggles `.dark` on `<html>`, persists to `localStorage`. |

Transitions on colour stay as they are (`background-color 200ms ease, color 200ms ease` on `body`).

## State management

Add to the existing `web/src/store.js`:

- `openFolders: Set<string>` (topic slugs) — persisted to `localStorage` under a new key, e.g. `cheatsheet:open-folders`. Degrade gracefully when storage is blocked (HLDD §2.2 already requires this).
- `treeFilter: string` — session only, not persisted.
- `sourcesOpen: boolean` — session only; reset to `false` on route change.

`searchQuery` and `theme` are unchanged.

Seed `openFolders` on first visit with the folder of the current route, or empty on `/`.

This adds a `localStorage` key, so it is a data-model change — HLDD §3 lists the per-browser runtime store, and `docs/hldd/changelog.md` is append-only. Amend both.

## Design tokens

### Light — unchanged, copied from `web/src/index.css`

| Token | Value |
|---|---|
| `--c-paper` | `250 248 245` — `#FAF8F5` |
| `--c-paper-warm` | `243 239 230` — `#F3EFE6` |
| `--c-surface` | `255 255 255` — `#FFFFFF` |
| `--c-ink` | `26 26 26` — `#1A1A1A` |
| `--c-muted` | `107 107 107` — `#6B6B6B` |
| `--c-hairline` | `228 224 217` — `#E4E0D9` |
| `--c-accent` | `193 68 14` — `#C1440E` |
| `--overlay-alpha` | `0.20` |
| `--c-search-hit` | `253 230 138` |
| `--shadow-card` | `0 1px 2px rgba(0,0,0,.04)` |
| `--shadow-popover` | `0 6px 18px rgba(0,0,0,.08)` |

### Dark — replace the whole `html.dark` block

| Token | Old (warm brown) | **New — Ink** |
|---|---|---|
| `--c-paper` | `24 22 19` | **`14 15 17`** — `#0E0F11` |
| `--c-paper-warm` | `34 29 24` | **`22 24 26`** — `#16181A` |
| `--c-surface` | `31 26 21` | **`26 28 31`** — `#1A1C1F` |
| `--c-ink` | `236 230 217` | **`237 239 242`** — `#EDEFF2` |
| `--c-muted` | `138 132 122` | **`134 139 146`** — `#868B92` |
| `--c-hairline` | `46 41 34` | **`38 41 45`** — `#26292D` |
| `--c-accent` | `255 122 62` | **`242 101 34`** — `#F26522` |
| `--overlay-alpha` | `0.60` | `0.60` — unchanged |
| `--c-search-hit` | `93 74 24` | **`92 52 18`** — retune to sit under the new accent; verify `--c-ink` reads on it |
| `--shadow-card` | `0 1px 2px rgba(0,0,0,.45)` | unchanged |
| `--shadow-popover` | `0 6px 18px rgba(0,0,0,.55)` | unchanged |

Neutral, no brown. The accent stays in the same orange family so the light and dark identities match; it is slightly deeper than the old dark accent to hold up against near-black.

New token to add for the drawer: `--shadow-popover-up: 0 -6px 18px rgba(0,0,0,.08)` light, `0 -6px 18px rgba(0,0,0,.55)` dark.

### Typography — unchanged

- Mono: `'JetBrains Mono', ui-monospace, monospace` — 400/500/600/700. Body default `12px / 1.45`.
- Serif: `Fraunces, ui-serif, serif` — 800 only. Used for the wordmark (19px) and sheet `<h1>` (44px).
- Custom sizes from `tailwind.config.js`: `2xs` 10px/1.4, `xs` 11px/1.4, `sm` 12px/1.45, `base` 13px/1.45.
- `tracking-label` = `letter-spacing: .12em`, used on every uppercase label.

### Spacing and shape

- Sidebar width `268px` fixed.
- Sheet Quadrant horizontal padding `32px`; sheet body inner `max-width: 76rem`.
- Radii: `2px` inputs, `3px` the OS chip, `4px` buttons, `9–10px` fragment cards (from `sheet.css`, untouched).
- Hairlines are always `1px solid --c-hairline`.

## Accessibility

- Every secondary text colour is `--c-muted` (`#6B6B6B` light, `#868B92` dark). Do not introduce lighter greys — earlier drafts used `#B5AEA2`/`#9A948B` and fell to ~2:1 against the sidebar. `#6B6B6B` on `#F3EFE6` is ~5.2:1.
- The tree is a `role="tree"` / `treeitem` structure with `aria-expanded` on folders and `aria-current="page"` on the active file. Arrow-key traversal is a nice-to-have, not required for parity.
- The Sources bar is a `<button aria-expanded>` controlling the panel by `aria-controls`.
- Keep the existing `*:focus-visible { outline: 2px solid accent; outline-offset: 2px }`.

## Responsive

Out of scope this round. `1d` sketched a collapsed 48px rail and a mobile drawer; both were deferred. Until they land, keep the existing `isSmallScreen` behaviour from `store.js` working — at minimum the sidebar must not eat the viewport below ~700px, so hide it behind a toggle rather than shipping a 268px pane on a phone.

## Assets

None. All iconography is the existing inline SVG from `ThemeToggle.vue` plus text glyphs (`‹ ▶ ▼ ⌃ ⌄ ↗ ⬇ ·`). No new files, no icon library.

## Files in this bundle

- `design-reference.html` — the design canvas, self-contained and offline. Turn 2 (`2a`, `2b`) is the spec; turn 1 is superseded context.
- `README.md` — this document.

## Suggested change list in `web/`

| File | Change |
|---|---|
| `src/App.vue` | Rewrite: flex shell, `<Sidebar>` + `<RouterView>`. Header and footer removed. Keep `onGlobalKey`. |
| `src/components/Sidebar.vue` | New. |
| `src/components/SourcesDrawer.vue` | New; replaces `SourcesFooter.vue`. |
| `src/components/SourcesFooter.vue` | Delete. |
| `src/components/CheatSheetMenu.vue` | Delete — the tree replaces both `/` menus. |
| `src/components/SearchBar.vue` | Unchanged; remounted in the sheet header. |
| `src/components/ThemeToggle.vue` | Unchanged; remounted in the sidebar. |
| `src/pages/Sheet.vue` | New header markup; drop `sheet-lock`; swap in `SourcesDrawer`. |
| `src/pages/Home.vue` | Replace card grid with the landing state. |
| `src/pages/Topic.vue` | Delete; `/:topic` expands the folder and redirects to `default`. |
| `src/pages/Recall.vue` | Unchanged; now reached from the sidebar. |
| `src/lib/content.js` | Expose each topic's `accent` from `topic.yml` on the topic object (currently parsed and dropped). |
| `src/store.js` | Add `openFolders`, `treeFilter`, `sourcesOpen`. |
| `src/index.css` | Replace the `html.dark` block; delete `.sheet-page*` and `html.sheet-lock`; add `--shadow-popover-up`. |
| `src/styles/sheet.css` | Unchanged, except reconciling `.sheet-fragment` horizontal padding with the new 32px quadrant padding. |
| `content/**` | Unchanged. |
| `docs/hldd/hldd.md` + `changelog.md` | Amend: new View structure, new `localStorage` key. |
