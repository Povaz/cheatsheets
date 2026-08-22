# Backlog

> This project runs a **lean HLDD** (three files only). The `hldd` skill's `backlog.md` schema is
> adopted here in place, inside `open-issues.md`; no new file is created and the filename is
> unchanged so the Master's existing link keeps resolving.

## Classification

- **Issue / Bug** — fixes or assesses a known issue. Also covers known defects, risks, inconsistencies, and assessments needed to resolve a known issue.
- **Feature** — net-new application behaviour. Starting implementation mints one or more User Stories in the item's HLDD Context.
- **Task** — bounded work fitting neither category above. Task Type is one of: Optimisation, Refactoring, Tests, R&D.
- **HLDD Context** — one canonical Master Context title, or Cross-cutting. This project's lean Master carries no §2.3 Contexts list; the Context values below are the ones already in use in this document and are preserved verbatim.
- **Architectural Component(s)** — where the work lands, drawn from Master [§2 Architecture](hldd.md#2-architecture) (`content/` data layer · Build — Vite · Vue 3 SPA `web/` · GitHub Pages · `localStorage`), plus Infra for CI/CD or deployment work fitting no runtime component.
- **Estimated Effort** — Low, Medium, or High. The source table carried no effort column; items migrated from it read `Not stated` rather than carry an invented estimate.
- **Priority** — Low, Medium, High, or Highest.
- **Status** — To do, In Progress, or Done. The source table used a wider vocabulary (`Deferred`, version-tagged `Resolved` / `Closed` notes); those original strings are preserved verbatim under [Unallocated](#unallocated).

## 1. Issues / Bugs

### IMP-7 — Unbounded Question Bank growth

- **Description:** The Question Bank grows unbounded (10 questions appended daily); consider pruning, capping, or splitting `bank.json`.
- **HLDD Context:** Retention
- **Architectural Component(s):** `content/` (Question Bank files) · Infra (daily cron)
- **Estimated Effort:** Not stated
- **Priority:** Low
- **Status:** Done
- **Related:** v6.1 split the Bank into per-Sheet `questions.json` and retired the daily cron (growth is now on-demand).

## 2. Features

### IMP-3 — Re-quiz from the Question Bank

- **Description:** Re-quiz from the Question Bank — a practice mode replaying accumulated past questions beyond the daily set.
- **HLDD Context:** Retention
- **Architectural Component(s):** Vue 3 SPA (`web/`) · `content/` (Question Bank files) · `localStorage` (daily score)
- **Estimated Effort:** Not stated
- **Priority:** Low
- **Status:** Done
- **Related:** Resolved in v6.0 — practice questions on Home draw from the whole Bank.

### IMP-4 — New Home Page with folder-like navigation

- **Description:** New Home Page with a sidebar, folder-like navigation.
- **HLDD Context:** Home
- **Architectural Component(s):** Vue 3 SPA (`web/`)
- **Estimated Effort:** Not stated
- **Priority:** Low
- **Status:** To do

### IMP-5 — "Sheet" / "Cheat" View Mode concept

- **Description:** New Cheatsheet View Mode concept: "Sheet" (current, information-dense reference) and "Cheat" (new — compresses everything into a conceptual map).
- **HLDD Context:** View
- **Architectural Component(s):** Vue 3 SPA (`web/`) · `content/` (Fragment contract)
- **Estimated Effort:** Not stated
- **Priority:** Low
- **Status:** To do

### IMP-6 — Read-only goals dashboard

- **Description:** New read-only web page with a dashboard tracking goals.
- **HLDD Context:** Retention
- **Architectural Component(s):** Vue 3 SPA (`web/`) · `localStorage`
- **Estimated Effort:** Not stated
- **Priority:** Low
- **Status:** To do

## 3. Tasks

### IMP-2 — Archive the pre-v2.0 content/view snapshots

- **Description:** Archive the pre-v2.0 `content.md` / `view.md` snapshots to `docs/retired/` (git history already preserves them).
- **HLDD Context:** Cross-cutting
- **Architectural Component(s):** Infra (repository documentation; no runtime component)
- **Task Type:** Refactoring
- **Estimated Effort:** Not stated
- **Priority:** Low
- **Status:** To do

## Unallocated

Content from the previous schema with no destination in the current one, carried verbatim.

### Open Questions

The previous document opened with a `## 1. Open Questions` section. The current schema has no
Open Questions category. The table held no rows; its heading and column set are preserved here.

| ID    | Context       | Question                                                                                                                  | Impact                         | Status                                                        |
|-------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|---------------------------------------------------------------|

### Original Status values

The current Status vocabulary (To do / In Progress / Done) cannot express `Deferred`, nor the
version-tagged resolution notes the previous schema kept inline. The original strings, verbatim:

| ID    | Original Status                                                                                                   |
|-------|-------------------------------------------------------------------------------------------------------------------|
| IMP-2 | Deferred                                                                                                          |
| IMP-3 | Resolved (v6.0) — practice questions on Home draw from the whole Bank.                                            |
| IMP-4 | Deferred                                                                                                          |
| IMP-5 | Deferred                                                                                                          |
| IMP-6 | Deferred                                                                                                          |
| IMP-7 | Closed — v6.1 split the Bank into per-Sheet `questions.json` and retired the daily cron (growth is now on-demand) |
