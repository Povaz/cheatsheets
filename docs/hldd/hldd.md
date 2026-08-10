# CheatSheets — High-Level Design Document

> A personal CheatSheet web application that turns studied material into information-dense, spatially-stable single-page reference Sheets optimised for photographic recall, authored as content-as-code and deployed as a static site on GitHub Pages.

The append-only version table lives in [changelog.md](changelog.md). Open Questions and the Improvements Backlog live in [open-issues.md](open-issues.md).

# Table of Contents

- [1. Introduction](#1-introduction)
- [2. Architecture](#2-architecture)
- [3. Data Model](#3-data-model)
- [4. Procedures](#4-procedures)
- [5. Infrastructure](#5-infrastructure)

# 1. Introduction

## 1.1 Context

The User has a photographic memory and studies best from single-page, information-dense reference material with strong, stable spatial structure. Existing documentation and note tools optimise for completeness or linear reading, not for relocating a previously-seen fact by its position on a page. The User needs one place to hold their learning journey — optimised for photographic recall and reachable from any device.

## 1.2 Proposal

Two Goals, both of which must be met:

- **Learning Consolidation** — a comprehensive overview of a studied topic, graspable in one glance, leaning on photographic memory.
- **Learning Retention** — a reference to look up a specific fact, plus active reinforcement through daily recall questions.

**In scope (deliberate commitments):** content-as-code authoring under `content/`; one Sheet format — a semantic HTML Fragment rendered natively in the site's design system; Light/Dark theming that follows the OS until explicitly chosen; in-Sheet search highlighting matches in place; small-screen read-only rendering; per-Sheet Source attribution footer; a daily set of recall questions drawn from the accumulated Question Bank.

**Out of scope (deliberate exclusions):** completeness of information — a Sheet covers what the User has studied, not the whole topic; no backend, authentication, or server-side persistence; no runtime content editing — all mutation flows through local file edits and `git push`; no preview or staging environment.

# 2. Architecture

The application has no application layer: `content/` acts as the data layer (single source of truth), the `web/` Vue app is the presentation layer, and there is no server in between. Content files are read at build time, parsed, and baked into the JavaScript bundle; the bundle is deployed as static files and personalises itself per-browser via `localStorage`.

```mermaid
flowchart LR
    subgraph authoring["content/ — source of truth"]
        C["Topic / SubTopic files<br/>topic.yml · sheet.yml<br/>sheet.html · sources.yml"]
    end
    subgraph build["Build — Vite"]
        B["validate Fragments<br/>bundle raw files"]
    end
    subgraph app["Vue 3 SPA — web/"]
        A["render Sheets<br/>search · theming"]
    end
    H["GitHub Pages<br/>static, read-only"]
    U["User<br/>browser"]
    LS["localStorage<br/>theme · recall session"]

    C -->|git edit| B
    B -->|baked JS bundle| A
    A -->|actions/deploy-pages| H
    H --> U
    U --> A
    A <-->|prefs| LS
```

## 2.1 Content-as-code

Sheets are authored as HTML Fragments + YAML under `content/` and bundled at build time — no runtime fetching, no CMS, no database. The content format is the stable contract between authoring and rendering: the format leads, the validator and renderer follow. A feature that seems to need a new vocabulary element or manifest field is a format amendment first.

## 2.2 Theming

Light and Dark themes resolve through CSS custom properties toggled by a single class on `<html>` — no per-component dark variants; every colour flips globally. First visit follows the OS preference and tracks live OS changes until the User explicitly toggles; the choice then persists to `localStorage` and overrides the OS signal. A synchronous inline script in `index.html` sets the class before the stylesheet loads, preventing a flash of the wrong theme. When `localStorage` is blocked (e.g. private browsing), preferences degrade gracefully to the current session rather than failing.

## 2.3 Hash routing

Hash routing (`#/topic/subtopic`) is deliberate: GitHub Pages serves static files only, so without it every deep link would 404 unless a `404.html` SPA fallback were wired up. Hash URLs sidestep that with no extra configuration.

## 2.4 Dependency constraint

No runtime dependencies beyond the existing set (Vue, vue-router). The bundle must stay free of Node-oriented libraries — the in-repo YAML parser exists precisely because `js-yaml` and `gray-matter` throw `Buffer is not defined` in the browser. Adding a runtime dependency requires a design amendment, not a silent install.

## 2.5 Fragment contract

A Sheet's body is a **Fragment** (`sheet.html`): semantic HTML written in a fixed vocabulary, carrying structure and content only — no styles, no scripts, no external resources, no colours. The site owns everything else:

- **Styling** — one site-owned stylesheet styles the vocabulary through the theme custom properties, so every Sheet follows the design system and Light/Dark.
- **Behaviour** — the renderer derives the Table of Contents from the Fragment's sections, owns scroll-spy and anchor scrolling, and applies search highlighting to the rendered content.
- **Validation** — a build-time validator rejects any Fragment outside the contract; the validator code is authoritative for the exhaustive allow-list, this section for the contract.

Source links never appear inside a Fragment — attribution lives in `sources.yml` and renders through the app's Sources footer.

# 3. Data Model

There is no database. The data model is the file-system content model under `content/` (authored, bundled at build time) plus a per-browser runtime store in `localStorage`.

```mermaid
erDiagram
    TOPIC ||--o{ SUBTOPIC : contains
    SUBTOPIC ||--|| FRAGMENT : "renders (sheet.html)"
    SUBTOPIC ||--o{ SOURCE : "cites (sources.yml)"
    DAILY_RECALL_SET ||--o{ QUESTION : "contains (today.json)"
    QUESTION_BANK ||--o{ QUESTION : "archives (bank.json)"
    QUESTION }o--|| SUBTOPIC : targets
    RECALL_SESSION }o--|| DAILY_RECALL_SET : "tracks progress (localStorage)"

    TOPIC {
        string slug "folder name under content/"
        string title "topic.yml"
        string subtitle
        string default "SubTopic opened at hash-route /topic"
    }
    SUBTOPIC {
        string slug "topic/subtopic — folder path"
        string title "sheet.yml"
        string subtitle
    }
    FRAGMENT {
        html body "fixed vocabulary, no styles or scripts (2.5)"
    }
    SOURCE {
        string title
        string url "absolute, or repo-relative for local files"
        string type "doc, article, rfc, pep, video, pdf, other"
        date fetched "last consulted"
        string read_as "optional — how the Agent reads it during Generation"
    }
    DAILY_RECALL_SET {
        date generated "staleness check"
        json questions "exactly 10"
    }
    QUESTION {
        string id "YYYY-MM-DD-NN"
        string topic "Topic slug"
        string subtopic "SubTopic slug"
        string question
        json choices "exactly 4"
        int answer "zero-indexed into choices"
        string explanation
    }
    QUESTION_BANK {
        json questions "append-only, shipped questions only"
    }
    RECALL_SESSION {
        string key "recall:generated-date"
        int current "next unanswered question"
        json answers "chosen index per question, null if unanswered"
    }
```

Semantics the code cannot tell you:

- **Default SubTopic** — with no `default` key, the loader opens the lexicographically last SubTopic, so version-named SubTopics open on the newest.
- **Question Bank** — holds every `Question` that ever shipped in a `Daily Recall set`, appended only after `today.json` is written so it never contains unshipped questions; semantically deduplicated per SubTopic by the generator (same fact or same angle counts as a repeat). The web app does not load it.
- **Recall session reset** — on load the app compares `today.json`'s `generated` date with the `localStorage` key; a mismatch (new day's set deployed) clears the stale session and starts fresh.
- **`read_as`** — one line telling the Agent *how* to read a Source when producing the Sheet: what to extract, what to skip, its role.

# 4. Procedures

Development is pushed forward by the User working with the Agent. Each procedure names the Skills the Agent leverages.

## 4.1 P1 — Author or refresh a Sheet

**Skills:** `explain` (Fragment vocabulary and authoring rules).

The iterative **Generation** process: the User picks the topic and assembles Sources; the Agent produces the Sheet; rounds of review continue until the User accepts. When Sources change, update `sources.yml` and re-run.

```mermaid
sequenceDiagram
    actor U as User
    participant A as Agent (skill: explain)
    participant C as content/
    participant V as Validator
    U->>A: Topic + Sources (+ read_as guidance)
    A->>C: write topic.yml (if new) + sources.yml
    A->>C: generate sheet.yml + sheet.html
    A->>V: validate Fragment
    V-->>A: pass / reject (contract violation)
    A->>U: render for review
    loop until accepted
        U->>A: corrections
        A->>C: revise Fragment
    end
    U->>C: git commit (dev)
```

## 4.2 P2 — Generate Daily Recall

**Skills:** `questions` (generation rules, Bank dedup, schemas in practice).

A Claude Code cron task fires daily. If the routine fails (API error, git conflict), the previous day's set remains deployed — stale but functional.

```mermaid
sequenceDiagram
    participant CR as Cron (daily)
    participant A as Agent (skill: questions)
    participant C as content/
    participant M as main (GitHub)
    CR->>A: trigger
    A->>C: read every sheet.yml + sheet.html
    A->>C: read bank.json
    A->>A: pick 10 SubTopics, generate 10 questions (no repeats vs Bank)
    A->>C: write today.json (overwrite)
    A->>C: append the 10 to bank.json
    A->>M: commit + push
    M->>M: Actions build + deploy
```

## 4.3 P3 — Remove content

**Skills:** none — a plain file operation.

```mermaid
sequenceDiagram
    actor U as User
    participant C as content/
    participant P as GitHub Pages
    U->>C: delete SubTopic dir (one Sheet) or Topic dir (whole CheatSheet)
    U->>P: push → rebuild
    P-->>U: remaining Sheets unaffected
```

## 4.4 P4 — Deploy

**Skills:** none. `dev` is the integration branch; `main` is the deploy target only.

```mermaid
sequenceDiagram
    actor U as User
    participant D as dev
    participant M as main
    participant GA as Actions (deploy.yml)
    participant P as GitHub Pages
    U->>D: push authored work
    U->>M: merge dev
    M->>GA: trigger on push
    GA->>P: build + actions/deploy-pages
```

# 5. Infrastructure

- **Local** — `npm install` + `npm run dev` inside `web/` (port 5173, hot reload); `npm run build` fails on any Fragment contract violation, and the validator also runs standalone. No env vars, no services.
- **Branches** — no hosted dev/staging tier (deliberate: small personal scope). Work integrates on `dev`; promotion to `main` publishes.
- **Production** — push to `main` triggers `.github/workflows/deploy.yml`, which builds and deploys to GitHub Pages via `actions/deploy-pages`. The deployed site is static and read-only.
