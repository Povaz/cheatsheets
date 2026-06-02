# Design

This document defines how the project realises the specification in [`anchored-specs.md`](./anchored-specs.md): the file tree that holds Content Context artifacts, the Vue 3 + Tailwind application that renders the View Context, and the GitHub Pages deployment pipeline.

## Table of contents

- [1. Purpose & scope](#1-purpose--scope)
- [2. Folder & document structure](#2-folder--document-structure)
- [3. Vue 3 + Tailwind setup](#3-vue-3--tailwind-setup)
- [4. GitHub Pages deployment](#4-github-pages-deployment)
- [5. User Story implementation](#5-user-story-implementation)

## 1. Purpose & scope

The system has two surfaces:

| Surface                          | Implements                                                                 | Where it runs                       |
|----------------------------------|----------------------------------------------------------------------------|-------------------------------------|
| Authoring pipeline (`Consolidation User`) | US-1 Generate, US-2 Add SubTopic, US-3 Refresh, US-5 Remove                | Local: Claude Code edits files in `content/`, then `git push` |
| Deployed web app (`Reference User`)        | US-4 Browse                                                                 | GitHub Pages — read-only static site |

The split is deliberate. Mutation happens by editing files in `content/` and pushing; deployment re-renders. The deployed app needs no write path, no auth, no backend — which is precisely what GitHub Pages can host.

## 2. Folder & document structure

### 2.1 Repository layout

```
.
├── content/                                    # Content Context — single source of truth
│   └── <topic>/                                # Topic
│       ├── topic.yml                           # Topic metadata
│       └── <subtopic>/                         # SubTopic
│           ├── sources.yml                     # Source list
│           ├── reference.md                    # Reference (consolidated study text)
│           ├── sheet.yml                       # Sheet manifest (title, subtitle, chapter → card order)
│           └── cards/                          # One .md per card (filename == card id)
├── docs/
│   ├── anchored-specs.md                       # spec (authoritative)
│   ├── design.md                               # this document
│   ├── CONTENT_FORMAT.md                       # sheet.yml manifest schema and cards/*.md syntax
│   ├── SOURCES_FORMAT.md                       # sources.yml schema
│   └── REFERENCE_FORMAT.md                     # reference.md guidance
├── web/                                        # View Context — npm package (Vite + Vue + Tailwind)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── public/
│   │   └── favicon.svg
│   └── src/                                    # Vue app code
├── .github/workflows/deploy.yml                # GH Pages CI
├── README.md
└── CLAUDE.md
```

All npm operations (`npm install`, `npm run dev`, `npm run build`) are executed from `web/`.

### 2.2 Spec → file system mapping

| Spec entity   | File system artifact                                  | Notes |
|---------------|-------------------------------------------------------|-------|
| Topic         | `content/<topic>/`                                    | Slug = folder name. |
| SubTopic      | `content/<topic>/<subtopic>/`                         | Slug = `<topic>/<subtopic>`. |
| Source        | An entry in `content/<topic>/<subtopic>/sources.yml`  | URL / PDF path / video link, type, title, fetched-at. Surfaced by the deployed app as a footer on each Sheet. |
| Reference     | `content/<topic>/<subtopic>/reference.md`             | Consolidated study text. Read by the `Consolidation User`; **not exposed by the deployed app**. |
| Sheet         | `content/<topic>/<subtopic>/sheet.yml` + `cards/*.md` | Manifest + per-card Markdown files (see `CONTENT_FORMAT.md`); rendered by the app. |
| CheatSheet    | The set of `sheet.yml` + `cards/` directories under one `<topic>/` | Synthesised at load time; not stored as a separate artifact. |

### 2.3 Authoring rules

- One folder per Topic; one folder per SubTopic. A Topic with a single SubTopic is simply a Topic with one folder under it.
- The `Consolidation User` produces `sources.yml` first, then `reference.md` from those sources, then `sheet.yml` + `cards/*.md` from the reference. Claude Code is responsible for enforcing this order during authoring.
- Files starting with `_` are editorial scratch and ignored by the loader. Use them for things that should live next to the artifacts but never reach the renderer (e.g. `_notes.md`).
- Removing a `<topic>/` folder discharges US-5 for the whole CheatSheet; removing a `<topic>/<subtopic>/` folder discharges US-5 for a single Sheet. The cascade is the file-system cascade — there are no cross-folder references to clean up.

### 2.4 `topic.yml`

```yaml
title: Python                       # display name
subtitle: language reference across versions
default: "3.14"                     # SubTopic slug rendered when /<topic> is opened
```

All keys are optional. With no `default`, the loader picks the lexicographically last SubTopic (so version-named SubTopics open on the newest).

### 2.5 `sources.yml`

Authoritative shape lives in `docs/SOURCES_FORMAT.md`; in summary:

```yaml
sources:
  - title: "What's New In Python 3.14"
    url: https://docs.python.org/3.14/whatsnew/3.14.html
    type: doc                       # doc | article | rfc | pep | video | pdf | other
    fetched: 2026-04-18
    read_as: authoritative — drive the Sheet's structure from this
  - title: PEP 750 — Template Strings
    url: https://peps.python.org/pep-0750/
    type: pep
    fetched: 2026-04-18
```

`sources.yml` is the audit trail behind the Reference. US-3 (Refresh) is exactly: edit this file, regenerate the Reference, regenerate the Sheet.

### 2.6 `reference.md`

Freeform Markdown — no schema beyond standard Markdown. It is the single comprehensive document the `Consolidation User` reads to study, and the input from which `sheet.yml` + `cards/*.md` are distilled. Guidance for length / structure lives in `docs/REFERENCE_FORMAT.md`.

### 2.7 `sheet.yml` + `cards/`

The Sheet manifest and per-card Markdown files rendered by the deployed app. `sheet.yml` declares title, subtitle, and the ordered chapter → card structure; each `cards/<id>.md` carries one card's content (section type, columns, rows). The format is fully specified in `docs/CONTENT_FORMAT.md` and is the stable contract between authoring and rendering.

## 3. Vue 3 + Tailwind setup

### 3.1 Stack

| Layer              | Choice                                                     |
|--------------------|------------------------------------------------------------|
| Build              | Vite 5                                                     |
| Framework          | Vue 3, Composition API, `<script setup>`                   |
| Routing            | vue-router 4 with `createWebHashHistory`                   |
| Styling            | Tailwind CSS 3 (`darkMode: 'class'`), `@tailwind` layers in `web/src/index.css` |
| Content loading    | `import.meta.glob('../../../content/**/*', { query: '?raw', eager: true })` — content is bundled at build time |
| YAML / Markdown    | In-repo parsers (`web/src/lib/yaml.js`, `web/src/lib/parseCheatsheet.js`); no `gray-matter`, no `js-yaml` (avoid `Buffer is not defined` in the browser) |

No new runtime dependencies beyond what is already in `web/package.json`. The constraint to keep the bundle free of Node-oriented libs is durable; if it ever needs to change, raise it as a design amendment rather than a silent dep add.

Color tokens (`paper`, `paper-warm`, `surface`, `ink`, `muted`, `hairline`, `accent`, `overlay`) resolve through CSS custom properties on `:root` / `html.dark` in `web/src/index.css`, so `bg-paper`, `text-ink`, etc. flip with the theme — no per-component `dark:` variants. The active theme (`'light' | 'dark'`) lives in `web/src/store.js` (`theme` ref + `toggleTheme` / `setTheme`), persists to `localStorage` under `cheatsheet:theme`, and is applied by toggling a `dark` class on `<html>`. First-visit value follows OS `prefers-color-scheme` and tracks live OS changes until the user explicitly toggles. An inline script in `web/index.html` sets the class synchronously before the stylesheet loads to prevent FOUC. The header toggle is `web/src/components/ThemeToggle.vue`.

### 3.2 `web/` layout

```
web/
├── index.html                    # Vite project root
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── package-lock.json
├── public/                       # static assets (favicon, etc.)
└── src/                          # Vue app source
    ├── main.js                   # createApp + router + index.css
    ├── App.vue                   # shell: header, search bar, settings panel, router-view, footer, toast
    ├── index.css                 # Tailwind layers + component classes (cards-masonry, cards-vertical, chapter-*, max-w-page, card-title, ...)
    ├── router.js                 # routes: /, /:topic, /:topic/:subtopic
    ├── store.js                  # reactive search query, toast state, runtime settings (persisted to localStorage)
    ├── lib/                      # parsers and helpers (content loader, parseCheatsheet, yaml, format, accents)
    ├── pages/                    # routed views (Home, Topic, Sheet)
    └── components/               # leaf components (Card, CodeRow, PillRow, Callout, SearchBar, SubTopicSwitcher, SettingsPanel, Toast)
```

The detailed content of each subdirectory drifts as features land; treat the inline file tree as orientation, not as a contract. The contracts are: `parseCheatsheet.js` consumes `sheet.yml` + `cards/*.md` per `docs/CONTENT_FORMAT.md`; `content.js` consumes the `content/` tree and produces `Topic[]` (see §3.4); `store.js` exports the shared reactive state used by App and components.

### 3.3 Routing

| Path                    | Component | Behaviour |
|-------------------------|-----------|-----------|
| `/`                     | `Home`    | Lists every Topic. Each entry links to `/<topic>`. |
| `/:topic`               | `Topic`   | Loads the Topic. If exactly one SubTopic exists, replaces the URL with `/<topic>/<subtopic>`. Otherwise lists SubTopics and replaces the URL with the `default` SubTopic. |
| `/:topic/:subtopic`     | `Sheet`   | Renders the Sheet. Unknown SubTopic redirects to the Topic's default; unknown Topic redirects to `/`. |
| `*`                     | redirect  | Catch-all → `/`. |

Hash routing is the deliberate choice: GitHub Pages serves static files only, so without hash routing every deep link would 404 unless a `404.html` SPA fallback is wired up. Hash URLs sidestep that entirely.

### 3.4 Content loading

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

A chapter's *layout* (`vertical` vs `columns`) is **not** part of the parsed Sheet — it is a runtime Sheet setting (see §3.5). The parser silently strips any legacy `{type: …}` attribute on `[chapter]` headers from older content.

### 3.5 Sheet settings

Settings are persisted per Sheet in `localStorage` under `cheatsheet:settings:<topic>/<subtopic>` and are not part of any content file. The shape is:

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

Resolution at render time is two-tier: **per-chapter override → hard-coded `CHAPTER_DEFAULTS`** (`web/src/store.js`). The page-scoped `maxWidth` is applied as a `--page-max` custom property on `:root`; the chapter-scoped fields are applied as inline custom properties (`--body-size`, `--card-title-size`, `--chapter-title-size`, `--cards-cols`) on each chapter's `<section>` element. The body-size variable is consumed by `.chapter { font-size: var(--body-size, 12px) }`, so it scales chapter content without affecting the global header/footer. The chapter `type` drives a `cards-vertical` / `cards-masonry` class on the cards container.

The top-right `SettingsPanel` edits only `maxWidth`; a small gear on each chapter's rail opens a `ChapterSettingsPopover` that edits that chapter's overrides. The store API in `web/src/store.js` migrates older shapes (pre-feature flat shape; the intermediate two-feature `defaults` shape) into the current shape on first load — only `maxWidth` survives the v1 migration; v2's `defaults` block is silently dropped. `cols: null` overrides from prior shapes are normalized away (the new default is `3`).

`sources.yml` is loaded into the runtime bundle and rendered as a "Sources" footer on each Sheet (§5.4). Local source files referenced by relative `url` (under `content/local_sources/` or alongside the SubTopic's `sources.yml`) are emitted as static assets via `import.meta.glob('...', { query: '?url' })` so they can be downloaded directly.

`reference.md` is **not** loaded into the runtime bundle. Bundling it would only inflate the deployed payload for content the `Reference User` never sees. It lives in the repo for the `Consolidation User` and for git history.

**Small-screen override.** A reactive `isSmallScreen` ref in `web/src/store.js` tracks `matchMedia('(max-width: 767.98px)')` and drives a `.is-small-screen` class on the App.vue root. While the flag is `true`: `Sheet.vue` forces every chapter to `cards-vertical` and skips per-chapter style injection; the `<SettingsPanel>` (page max-width control) is unmounted; and the per-chapter rail, settings popover, and collapse/expand button are replaced by a static `<h2 class="chapter-rail-mobile">`. The persisted `SheetSettings` are untouched — they reapply when the viewport returns above the threshold.

### 3.6 Build artifacts and ignored paths

`web/dist/` and `web/node_modules/` are gitignored — `web/dist/` is produced by `npm run build` and uploaded as the Pages artifact in CI; `web/node_modules/` is restored from `web/package-lock.json` by `npm ci`. The `.gitignore` patterns `node_modules` and `dist` match at any depth, so no path-specific entries are needed.

## 4. GitHub Pages deployment

### 4.1 Strategy

Build on GitHub Actions, publish via the official `actions/deploy-pages` action. No `gh-pages` branch, no manual upload step. Hash routing means no `404.html` fallback is required.

### 4.2 Workflow — `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
        working-directory: web
      - run: npm run build
        working-directory: web
        env:
          REPO_NAME: ${{ github.event.repository.name }}
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: web/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 4.3 Vite base path

```js
// web/vite.config.js
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === 'production' ? `/${process.env.REPO_NAME || 'cheatsheets'}/` : '/',
}))
```

Production assets resolve under `https://<user>.github.io/<repo>/`; in `npm run dev` the base stays at `/`.

### 4.4 Repo settings prerequisites

- **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- Default branch: `main`.
- Repository visibility public, or Pages enabled on the plan.

### 4.5 Deploy lifecycle

1. The `Consolidation User` edits files in `content/` and / or `web/`, commits, pushes to `main`.
2. The workflow runs `npm ci` and `npm run build` inside `web/`, uploads `web/dist/` as the Pages artifact, and deploys.
3. The `Reference User` opens the public URL and is on the new version on next page load.

That is the only deploy path. There is no preview environment, no staging — small personal scope justifies the simplicity.

## 5. User Story implementation

This section maps each User Story in `anchored-specs.md` to the parts of this design that realise it. The mechanics are described in Sections 1–4; the entries below only state which mechanics carry which story.

### 5.1 US-1 — Generate a new CheatSheet

A `Consolidation User` task, handled entirely on the authoring surface (§1). Realising US-1 means creating `content/<topic>/` with `topic.yml` and one `<subtopic>/` folder containing `sources.yml`, `reference.md`, `sheet.yml`, and `cards/` in that order (§2.3). The Sheet appears in the deployed app on the next push through the pipeline in §4.5; no app change is required.

### 5.2 US-2 — Add a new SubTopic

Same authoring surface as US-1, narrower scope. Realised by adding a new `<subtopic>/` folder under an existing `content/<topic>/` (§2.1, §2.2) following the same `sources.yml` → `reference.md` → `sheet.yml` + `cards/` order (§2.3). The loader described in §3.4 picks the new SubTopic up automatically; the routing rules in §3.3 expose it under `/:topic/:subtopic`.

### 5.3 US-3 — Refresh a Sheet

Realised by editing `sources.yml` for the affected SubTopic and regenerating `reference.md` and `sheet.yml` + `cards/*.md` from it (§2.5). No structural change — the same files are rewritten in place, and the next push through §4.5 publishes the refreshed Sheet. `reference.md` stays outside the runtime bundle (§3.4); `sources.yml` and `sheet.yml` + `cards/*.md` are both loaded — the Sheet manifest and cards drive the rendered Sheet, and `sources.yml` drives the Sources footer beneath it.

### 5.4 US-4 — Browse a CheatSheet

The only User Story served by the deployed web app (§1). Realised by the routing table in §3.3: `/` lists Topics, `/:topic` resolves to the Topic's default SubTopic, `/:topic/:subtopic` renders the Sheet. The data behind these routes is the `Topic[]` shape produced by the loader in §3.4; rendering is the responsibility of the components listed in §3.2.

### 5.5 US-5 — Remove a CheatSheet or a single Sheet

Realised as a file-system cascade (§2.3): deleting `content/<topic>/` discharges removal of a whole CheatSheet, deleting `content/<topic>/<subtopic>/` discharges removal of a single Sheet. There are no cross-folder references to clean up, so no app-level work is needed; the next push through §4.5 publishes the pruned site.
