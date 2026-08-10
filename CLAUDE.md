# Cheatsheets — Claude orientation

Personal CheatSheet web application. The user has a photographic memory and studies best from single-page, information-dense reference Sheets with strong spatial structure. Density, stable layout, and memorable section IDs matter more than generic UI polish.

## User Behaviour
The user is a backend developer, not a frontend developer. He interacts with this project by asking Claude Code to add or edit Sheets, edits Markdown content files directly when he spots something wrong, and `git push`es to deploy. **Do not expect him to edit the Vue code.**

## Specifications

The project deliberately uses a **lean HLDD** (v4.0). The full hotiday-specs layout — Context folders, User Story sub-documents, ACs, `.feature` files — was retired as oversized for this project. **Do not recreate those folders or files**; route all design content into the matching `hldd.md` section.

| Document                   | What it covers                                                                                        |
|----------------------------|-------------------------------------------------------------------------------------------------------|
| `docs/hldd/hldd.md`        | The whole design — architecture decisions, data model (ER diagram), User↔Agent procedures (sequence diagrams), infrastructure |
| `docs/hldd/changelog.md`   | Append-only version log                                                                               |
| `docs/hldd/open-issues.md` | Open Questions + Improvements Backlog                                                                 |

`hldd.md` §4 Procedures maps the User↔Agent workflows and names the Skill each one leverages (`explain` for Sheet authoring, `questions` for Daily Recall).

## Specific Rules

**Worktrees branch from `dev`, not `main`.** Active development lives on `dev`; `main` is only the GitHub Pages deploy target. The native `EnterWorktree` tool defaults to `origin/main` and will silently miss the latest features. To base a worktree on `dev`, run `git worktree add .claude/worktrees/<name> dev` (the project's worktree directory is `.claude/worktrees/`, gitignored under `.claude/`), then enter it with `EnterWorktree path: .claude/worktrees/<name>`.

**Plans** folder is `.claude/plans/`, which is gitignored and constantly emptied. Older plans have no value.

