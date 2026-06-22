# High-Level Design Document — Master

> A personal CheatSheet web application that supports Learning Consolidation and Learning Retention by giving the User a single-page, information-dense view of each SubTopic they have studied, optimised for photographic recall.

## Version Log

| Version | Date       | Description                                                |
|---------|------------|------------------------------------------------------------|
| v1.0    | 2026-06-02 | Initial HLDD — migrated from anchored-specs.md + design.md |
| v1.1    | 2026-06-22 | Specs: Embedded Sheet / Artifact SubTopic (US-embed-artifact, US-embed-view)   |
| v1.2    | 2026-06-22 | Design: Embedded Sheet rendering — iframe srcdoc, auto-height, search bridge   |

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
  - [§6.6 Embedded Sheets](#66-embedded-sheets)
- [§7 Procedures](#7-procedures)
- [§8 Infrastructure](#8-infrastructure)
  - [§8.1 Local / Development Environment](#81-local--development-environment)
  - [§8.2 Production Environment](#82-production-environment)

## §1 Introduction

### §1.1 Context

The User needs a single place to store its learning journey, a place that is optimized for photographic recall and accessible from any device.

### §1.2 Proposal

#### §1.2.1 Goal


The Solution has two specific Goals and both must be met:
- **Learning Consolidation:** provide a comprehensive overview of topics, allowing users to quickly grasp the key concepts and information they have already studied through the users' photographic memory.
- **Learning Retention:** serve as a reference for users to look up specific information about a topic without having to go through extensive documentation or resources.

#### §1.2.2 In Scope

> To be defined.


#### §1.2.3 Out of Scope

- **Completeness of Information:** information shown is comprehensive of what the user has already studied, not necessarily comprehensive of all information regarding the topic.

#### §1.2.4 Deliverables

- A static site deployed on GitHub Pages.

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
│           ├── sources.yml                     # Source list (optional)
│           ├── sheet.yml                       # Manifest — card-authored: title/subtitle/chapters; embedded: kind: embed
│           ├── cards/                          # card-authored Sheet: one .md per card (filename == card id)
│           └── artifact.html                   # Embedded Sheet (kind: embed): one self-contained HTML page, rendered as-is
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

### §6.6 Embedded Sheets

An `Embedded Sheet` (a `SubTopic` whose `sheet.yml` carries `kind: embed`) renders its `artifact.html` **verbatim inside a same-origin `<iframe srcdoc>`**. This gives full CSS *and* JavaScript isolation: the artifact appears exactly as it does standalone, unaffected by — and unable to affect — the app's styles or theme. The mechanism is deliberate — artifacts (typically generated in Claude Code sessions) are dropped in unaltered, with no rework to reconcile their styling with the site.

- **No `sandbox` attribute.** Same-origin access is required so the app can read the frame's document for the two integrations below. Artifacts are first-party, trusted content; the trade-off is that artifact JavaScript runs with the page's origin.
- **Auto-height.** A parent-side `ResizeObserver` on the frame's document sets the iframe height to its content, so the page scrolls naturally with no inner scrollbar. Nothing is injected into the artifact — it stays pristine. Artifacts laid out for the full viewport fall back to a sensible min-height.
- **In-Sheet search reaches inside.** On the frame's `load`, a `TreeWalker` wraps matches in `<mark class="search-hit">` (the same class as card search), with a style injected into the frame `<head>`; cleared when the query empties. There is no card-blanking — an `Embedded Sheet` has no cards.
- **Controls hidden.** Per-`Chapter` gears and the page-width control do not apply and are not shown (the `SheetSettings` in `localStorage` go unused).
- **No new runtime dependency** — `<iframe srcdoc>`, `ResizeObserver`, and `TreeWalker` are native browser APIs (per §6.5).

**Authoring contract:** an artifact must be fully self-contained (inline CSS / JS / assets). `srcdoc`'s base URL is `about:srcdoc`, so *relative* asset URLs do not resolve — which is the norm for Claude Code artifacts.

Rendering lives in `EmbeddedArtifact.vue`; `Sheet.vue` branches to it on `kind: embed`. See [`view.md` §7](view.md#7-frontend).

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
