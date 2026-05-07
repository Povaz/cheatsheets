# Design

This document defines how the project realises the specification in [`anchored-specs.md`](./anchored-specs.md): the file tree that holds Content Context artifacts, the Vue 3 + Tailwind application that renders the View Context, and the GitHub Pages deployment pipeline.

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
│           └── sheet.md                        # Sheet source (rendered by the app)
├── docs/
│   ├── anchored-specs.md                       # spec (authoritative)
│   ├── design.md                               # this document
│   ├── CONTENT_FORMAT.md                       # sheet.md syntax
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
| Source        | An entry in `content/<topic>/<subtopic>/sources.yml`  | URL / PDF path / video link, type, title, fetched-at. |
| Reference     | `content/<topic>/<subtopic>/reference.md`             | Consolidated study text. Read by the `Consolidation User`; **not exposed by the deployed app**. |
| Sheet         | `content/<topic>/<subtopic>/sheet.md`                 | Cheatsheet-format Markdown (see `CONTENT_FORMAT.md`); rendered by the app. |
| CheatSheet    | The set of `sheet.md` files under one `<topic>/`      | Synthesised at load time; not stored as a separate artifact. |

### 2.3 Authoring rules

- One folder per Topic; one folder per SubTopic. A Topic with a single SubTopic is simply a Topic with one folder under it.
- The `Consolidation User` produces `sources.yml` first, then `reference.md` from those sources, then `sheet.md` from the reference. Claude Code is responsible for enforcing this order during authoring.
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
    notes: official release notes
  - title: PEP 750 — Template Strings
    url: https://peps.python.org/pep-0750/
    type: pep
    fetched: 2026-04-18
```

`sources.yml` is the audit trail behind the Reference. US-3 (Refresh) is exactly: edit this file, regenerate the Reference, regenerate the Sheet.

### 2.6 `reference.md`

Freeform Markdown — no schema beyond standard Markdown. It is the single comprehensive document the `Consolidation User` reads to study, and the input from which `sheet.md` is distilled. Guidance for length / structure lives in `docs/REFERENCE_FORMAT.md`.

### 2.7 `sheet.md`

The cheatsheet-format Markdown rendered by the deployed app. Frontmatter + `H2` section headers with type tags + tables / code / diagrams / pills / text. The format is fully specified in `docs/CONTENT_FORMAT.md` and is the stable contract between authoring and rendering.

## 3. Vue 3 + Tailwind setup

### 3.1 Stack

| Layer              | Choice                                                     |
|--------------------|------------------------------------------------------------|
| Build              | Vite 5                                                     |
| Framework          | Vue 3, Composition API, `<script setup>`                   |
| Routing            | vue-router 4 with `createWebHashHistory`                   |
| Styling            | Tailwind CSS 3, `@tailwind` layers in `web/src/index.css`  |
| Content loading    | `import.meta.glob('../../../content/**/*', { query: '?raw', eager: true })` — content is bundled at build time |
| YAML / Markdown    | In-repo parsers (`web/src/lib/yaml.js`, `web/src/lib/parseCheatsheet.js`); no `gray-matter`, no `js-yaml` (avoid `Buffer is not defined` in the browser) |

No new runtime dependencies beyond what is already in `web/package.json`. The constraint to keep the bundle free of Node-oriented libs is durable; if it ever needs to change, raise it as a design amendment rather than a silent dep add.

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
    └── components/               # leaf components (Card, CodeRow, PillRow, Callout, DetailModal, SearchBar, SubTopicSwitcher, SettingsPanel, Toast)
```

The detailed content of each subdirectory drifts as features land; treat the inline file tree as orientation, not as a contract. The contracts are: `parseCheatsheet.js` consumes `sheet.md` per `docs/CONTENT_FORMAT.md`; `content.js` consumes the `content/` tree and produces `Topic[]` (see §3.4); `store.js` exports the shared reactive state used by App and components.

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
  cheatsheet: ParsedSheet     // from parseCheatsheet(sheet.md)
}

type ParsedSheet = {
  frontmatter: Record<string, string>
  chapters: Chapter[]         // one implicit `columns` chapter when the sheet declares none
}

type Chapter = {
  id: string                  // slug; '' for the implicit chapter
  title: string               // '' for the implicit chapter (no divider/rail rendered)
  type: 'vertical' | 'columns'
  sections: Section[]
}
```

`sources.yml` and `reference.md` are part of the Content Context but are **not loaded into the runtime bundle**. Bundling them would only inflate the deployed payload for content the `Reference User` never sees. They live in the repo for the `Consolidation User` and for git history.

### 3.5 Build artifacts and ignored paths

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

## 5. End-to-end verification

A complete check of the system runs:

1. `cd web && npm install && npm run dev` — `/` lists every CheatSheet; `/#/<topic>` redirects to `/#/<topic>/<default-subtopic>`; the Sheet renders with cards and search.
2. `cd web && npm run build` — succeeds with `REPO_NAME` matching the GitHub repository name.
3. Pushing to `main` — the workflow finishes green; the Pages URL serves the built site at `/<repo>/`.
4. The `Reference User` flow (US-4): open `/`, click a CheatSheet, see one Sheet by default, switch SubTopics — each step matches `AC-4.1` and `AC-4.2`.

## 6. Out of scope

- Any UI for US-1, US-2, US-3, US-5. Those remain authoring flows handled by Claude Code operating on the file tree.
- Tests, CI checks beyond the build, preview deploys.
- Source files larger than what fits in the bundle (PDFs, videos): `sources.yml` references them by URL or path; storage of binaries is left to the repo or external hosting and is not the app's concern.
