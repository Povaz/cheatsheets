# High-Level Design Document — Master

> A personal CheatSheet web application that supports Learning Consolidation and Learning Retention by giving the User a single-page, information-dense view of each SubTopic they have studied, optimised for photographic recall.

## Version Log

| Version | Date       | Description                                                |
|---------|------------|------------------------------------------------------------|
| v1.0    | 2026-06-02 | Initial HLDD — migrated from anchored-specs.md + design.md |

## Table of Contents

- [§1 Introduction](#1-introduction)
  - [§1.1 Context](#11-context)
  - [§1.2 Proposal](#12-proposal)
- [§2 Cross-cutting Assumptions](#2-cross-cutting-assumptions)
  - [§2.1 User Roles](#21-user-roles)
  - [§2.2 External System Assumptions](#22-external-system-assumptions)
- [§3 Architecture](#3-architecture)
  - [§3.1 Repository layout](#31-repository-layout)
  - [§3.2 Stack](#32-stack)
- [§4 Data Model](#4-data-model)
- [§5 API](#5-api)
- [§6 Frontend](#6-frontend)
  - [§6.1 Content-as-code](#61-content-as-code)
  - [§6.2 Theming](#62-theming)
  - [§6.3 Routing](#63-routing)
  - [§6.4 User-side rendering preferences](#64-user-side-rendering-preferences)
  - [§6.5 Dependency constraint](#65-dependency-constraint)
- [§7 Procedures](#7-procedures)
- [§8 Infrastructure](#8-infrastructure)
  - [§8.1 Local / Development Environment](#81-local--development-environment)
  - [§8.2 Production Environment](#82-production-environment)

## §1 Introduction

### §1.1 Context

The system has two surfaces:

| Surface                                   | Implements                                                  | Where it runs                                                 |
|-------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------|
| Authoring pipeline (`Consolidation User`) | US-1 Generate, US-2 Sheet generation, US-3 Refresh, US-5 Remove | Local: Claude Code edits files in `content/`, then `git push` |
| Deployed web app (`Reference User`)       | US-4 Browse                                                 | GitHub Pages — read-only static site                          |

The split is deliberate. Mutation happens by editing files in `content/` and pushing; deployment re-renders. The deployed app needs no write path, no auth, no backend — which is precisely what GitHub Pages can host.

### §1.2 Proposal

#### §1.2.1 Goal

- **Learning Consolidation:** provide a comprehensive overview of topics, allowing users to quickly grasp the key concepts and information they have already studied through the users' photographic memory.
- **Learning Retention:** serve as a reference for users to look up specific information about a topic without having to go through extensive documentation or resources.

#### §1.2.2 In Scope

The following User Stories define the current scope:

| Story               | Title                                                |
|---------------------|------------------------------------------------------|
| US-1                | Generate a new CheatSheet for a Topic I have studied |
| US-2                | Generate a Sheet for a SubTopic from its Sources     |
| US-3                | Refresh a Sheet when its Sources change              |
| US-4                | Browse a CheatSheet and read its Sheets              |
| US-5                | Remove a CheatSheet or a single Sheet                |
| US-dark-mode        | Toggle between Light and Dark display modes          |
| US-sheet-search     | Search within a Sheet                                |
| US-mobile-readonly  | Read a Sheet on a small screen                       |


#### §1.2.3 Out of Scope

- **Completeness of Information:** information shown is comprehensive of what the user has already studied, not necessarily comprehensive of all information regarding the topic.

#### §1.2.4 Deliverables

- A static site deployed on GitHub Pages.
- A content tree under `content/` serving as single source of truth for all Topics, SubTopics, Sources, References, and Sheets.

## §2 Cross-cutting Assumptions

### §2.1 User Roles

| Role               | Definition                                                                                                                                                                                                                 | Source Context |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| Consolidation User | The User acting to build or extend a CheatSheet: selecting Topics and SubTopics, gathering Sources, and producing the Reference from which a Sheet is generated. This act is itself an instance of Learning Consolidation. | Content        |
| Reference User     | The User acting to consume an already-built CheatSheet: opening it, navigating between its Sheets, and using photographic recall to retrieve previously-studied information (Learning Retention).                          | View           |

The Consolidation User and the Reference User are the same human in different roles. The two roles capture different activities (building vs consuming) and may be carried out at different times by the same person.

### §2.2 External System Assumptions

**GitHub Pages:** static hosting only. No authentication, no backend, no database. The deployed app is read-only — all mutation flows through local file edits and `git push`.

## §3 Architecture

### §3.1 Repository layout

```
.
├── content/                                    # Content Context — single source of truth
│   └── <topic>/                                # Topic
│       ├── topic.yml                           # Topic metadata
│       └── <subtopic>/                         # SubTopic
│           ├── sources.yml                     # Source list
│           ├── sheet.yml                       # Sheet manifest (title, subtitle, chapter → card order)
│           └── cards/                          # One .md per card (filename == card id)
├── docs/
│   ├── hldd/
│   │   ├── hldd.md                            # this document
│   │   ├── content.md                         # Content Context
│   │   └── view.md                            # View Context
│   └── retired/                                # Historical snapshots
├── web/                                       # View Context — npm package (Vite + Vue + Tailwind)
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

### §3.2 Stack

| Layer           | Choice                                                                                                                                                   |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Build           | Vite 5                                                                                                                                                   |
| Framework       | Vue 3 Composition API                                                                                                                                    |
| Styling         | Tailwind CSS 3 (`darkMode: 'class'`), `@tailwind` layers in `web/src/index.css`                                                                          |

No new runtime dependencies beyond what is already in `web/package.json`. The constraint to keep the bundle free of Node-oriented libs is durable; if it ever needs to change, raise it as a design amendment rather than a silent dep add.

## §4 Data Model

> _Not applicable — the project has no database. The file-system data model lives in [`content.md` §4](content.md#4-data-model); the localStorage shape lives in [`view.md` §4](view.md#4-data-model)._

## §5 API

> _Not applicable — the deployed app is a static site with no backend API._

## §6 Frontend

### §6.1 Content-as-code

Sheets are authored as Markdown + YAML files under `content/` and bundled into the app at build time. There is no runtime fetching, no CMS, no database — the build tool reads the raw content files, parses them, and bakes the result into the JavaScript bundle.

The content format (specified in [`content.md` §4](content.md#4-data-model)) is the stable contract between authoring and rendering. The Vue code exists to render it; the format leads. If a feature seems to require a new section type or manifest field, the format spec is amended first — the parser and renderer follow.

### §6.2 Theming

Light and Dark themes resolve through CSS custom properties toggled by a single class on `<html>`. No per-component dark variants — every colour in the palette flips globally when the class changes.

First visit follows the OS preference and tracks live OS changes until the user explicitly toggles. The user's choice persists to `localStorage` and overrides the OS signal from that point on.

A synchronous inline script in `index.html` sets the theme class before the stylesheet loads. This prevents a flash of the wrong theme (FOUC) on reload.

### §6.3 Routing

Hash routing (`#/topic/subtopic`). GitHub Pages serves static files only — without hash routing every deep link would 404 unless a `404.html` SPA fallback is wired up. Hash URLs sidestep that entirely, with no extra configuration.

### §6.4 User-side rendering preferences

Per-`Chapter` rendering settings (font sizes, column count, layout type, collapsed state) and per-`Sheet` page max-width are stored in `localStorage`, not in content files. This keeps the content format clean and lets the `Reference User` personalise the view without affecting the authored content.

Settings survive navigation and reloads. The small-screen breakpoint (< 768 px) temporarily overrides them — forcing single-column layout and hiding customisation controls — without erasing the stored values. Returning to a wide viewport restores the user's preferences.

### §6.5 Dependency constraint

No runtime dependencies beyond the existing set (Vue, vue-router). The bundle must stay free of Node-oriented libraries — the in-repo YAML parser exists precisely because `js-yaml` and `gray-matter` throw `Buffer is not defined` in the browser. Adding a new dependency requires a design amendment, not a silent install.

## §7 Procedures

> _Not applicable — no procedures span both Contexts. The authoring pipeline lives in [`content.md` §6](content.md#6-procedures--workflows)._

## §8 Infrastructure

### §8.1 Local / Development Environment

Run `npm install` and `npm run dev` inside `web/`. The dev server serves the app at `localhost:5173` with hot reload. Content changes under `content/` are picked up on the next page refresh (Vite re-bundles the raw files).

No database, no backend services, no environment variables required.

### §8.2 Production Environment

Push to `main` triggers a GitHub Actions workflow that builds the app and deploys to GitHub Pages via `actions/deploy-pages`. No `gh-pages` branch, no manual upload.

The deployed site is static and read-only. Hash routing avoids deep-link 404s without needing a `404.html` fallback.

There is no preview environment or staging — the small personal scope justifies the simplicity.
