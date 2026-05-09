# cheatsheets

A personal CheatSheet web application that supports Learning Consolidation and Learning Retention by giving the user a single-page, information-dense view of each SubTopic they have studied, optimised for photographic recall.

Live: https://povaz.github.io/cheatsheets/#/

## Authoritative documents

- [`docs/anchored-specs.md`](./docs/anchored-specs.md) — specification (Contexts, Dictionary, User Stories, Acceptance Criteria).
- [`docs/design.md`](./docs/design.md) — system design (file tree, Vue + Tailwind setup, GitHub Pages deployment).
- [`docs/CONTENT_FORMAT.md`](./docs/CONTENT_FORMAT.md) — `sheet.yml` manifest schema and `cards/*.md` syntax.
- [`docs/SOURCES_FORMAT.md`](./docs/SOURCES_FORMAT.md) — `sources.yml` schema.
- [`docs/REFERENCE_FORMAT.md`](./docs/REFERENCE_FORMAT.md) — `reference.md` guidance.
- [`CLAUDE.md`](./CLAUDE.md) — orientation for Claude Code sessions.

## Available CheatSheets

| CheatSheet | Sheets |
|------------|--------|
| Specification | Context-Anchored Specifications |
| Git | Worktrees + Agents |

## Project layout

```
content/<topic>/topic.yml
content/<topic>/<subtopic>/sources.yml
content/<topic>/<subtopic>/reference.md
content/<topic>/<subtopic>/sheet.yml
content/<topic>/<subtopic>/cards/<id>.md
web/                              # Vite + Vue + Tailwind app (run npm here)
```

## Running locally

```
cd web
npm install
npm run dev
```

Then open http://localhost:5173/.

## Deploying

Push to `main`. GitHub Actions builds and deploys to Pages automatically. To enable, go to the repo's **Settings → Pages** and set the source to **GitHub Actions**.
