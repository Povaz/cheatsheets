# Cheatsheets — Claude orientation

Personal CheatSheet web application. The user has a photographic memory and studies best from single-page, information-dense reference Sheets with strong spatial structure. Density, stable layout, and memorable section IDs matter more than generic UI polish.

## User Behaviour
The user is a backend developer, not a frontend developer. He interacts with this project by asking Claude Code to add or edit Sheets, edits Markdown content files directly when he spots something wrong, and `git push`es to deploy. **Do not expect him to edit the Vue code.**

## Project Structure

**To add a Sheet, create the SubTopic folder under `content/<topic>/` with `sources.yml`, `sheet.yml`, and a `cards/` directory containing one `.md` per card. Do not touch the Vue app.** The content format is the stable contract; the code exists to render it.

### Authoritative documents

| Document               | What it covers                                                                                                                      |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `docs/hldd/hldd.md`    | Master: goals, architecture, frontend design decisions, infrastructure                                                              |
| `docs/hldd/content.md` | Content Context: dictionary, user stories (US-1/2/3/5), data model (sources.yml + sheet.yml + cards/ schemas), authoring procedures |
| `docs/hldd/view.md`    | View Context: dictionary, user stories (US-4, dark-mode, search, mobile, detail-wrap), data model, frontend                         |

## Specific Rules

**Use slug-style codes, not auto-incremented integers**, for new User Stories and their ACs in `docs/hldd/content.md` §3 and `docs/hldd/view.md` §3 — e.g. `US-sheet-search` and `AC-sheet-search.1`, not `US-6` / `AC-6.1`. Multiple agents draft specs in parallel and integer codes collide. Existing US-1…US-5 are kept as-is.

**Worktrees branch from `dev`, not `main`.** Active development lives on `dev`; `main` is only the GitHub Pages deploy target. The native `EnterWorktree` tool defaults to `origin/main` and will silently miss the latest features. To base a worktree on `dev`, run `git worktree add .claude/worktrees/<name> dev` (the project's worktree directory is `.claude/worktrees/`, gitignored under `.claude/`), then enter it with `EnterWorktree path: .claude/worktrees/<name>`.

**Plans** folder is `.claude/plans/`, which is gitignored and constantly emptied. Older plans have no value.

