# Cheatsheets — Claude orientation

Personal CheatSheet web application. The user has a photographic memory and studies best from single-page, information-dense reference Sheets with strong spatial structure. Density, stable layout, and memorable section IDs matter more than generic UI polish.

## User Behaviour
The user is a backend developer, not a frontend developer. He interacts with this project by asking Claude Code to add or edit Sheets, edits Markdown content files directly when he spots something wrong, and `git push`es to deploy. **Do not expect him to edit the Vue code.**

## Specifications

Specifications follow the /hldd skill prescription (Hotiday Specs v2.1.2 — Master + per-Context folders):

| Document                              | What it covers                                      |
|---------------------------------------|-----------------------------------------------------|
| `docs/hldd/hldd.md`                   | Master HLDD — data model, architecture, procedures  |
| `docs/hldd/view/view.md`              | View Context — relationships, dictionary, stories   |
| `docs/hldd/view/user-stories/us-*.md` | One sub-document per User Story (ACs + seq diagrams) |
| `docs/hldd/open-issues.md`            | Open Questions + Improvements Backlog               |

Content authoring is **not** a Context — it is captured as the data model (Master §4) and the authoring procedures (Master §7).

## Specific Rules

**Use slug-style codes, not auto-incremented integers**, for new User Stories and their ACs — e.g. `US-sheet-search` and `AC-sheet-search.1`, not `US-6` / `AC-6.1`. Each new Story is a `docs/hldd/view/user-stories/us-<slug>.md` sub-document, linked from the Context doc's §3. Multiple agents draft specs in parallel and integer codes collide. The legacy `US-4` integer code is kept as-is; every other Story already uses a slug.

**Worktrees branch from `dev`, not `main`.** Active development lives on `dev`; `main` is only the GitHub Pages deploy target. The native `EnterWorktree` tool defaults to `origin/main` and will silently miss the latest features. To base a worktree on `dev`, run `git worktree add .claude/worktrees/<name> dev` (the project's worktree directory is `.claude/worktrees/`, gitignored under `.claude/`), then enter it with `EnterWorktree path: .claude/worktrees/<name>`.

**Plans** folder is `.claude/plans/`, which is gitignored and constantly emptied. Older plans have no value.

