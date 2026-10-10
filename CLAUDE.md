# Cheatsheets — Claude orientation

Personal CheatSheet web application. The user has a photographic memory and studies best from single-page, information-dense reference Sheets with strong spatial structure. Density, stable layout, and memorable section IDs matter more than generic UI polish.

## User Behaviour
The user is a backend developer, not a frontend developer. **The Agent is the user's only interface to content**: the user never edits content files or Vue code by hand. Work happens in conversation: picking a subject and its Sources, studying a Source step by step, building or restructuring a Sheet, growing its questions. Any work that produces or changes a Sheet, its questions, or a Learning Plan goes through the matching Skill (`explain`, `questions`, `learningplans`), whatever the conversation looks like.

Hierarchy: a **Topic** holds **Sheets**. Learning Plans are separate and never dictate the Topic/Sheet structure.

## Specifications

The project deliberately uses a **lean HLDD** (v4.0). The full hotiday-specs layout — Context folders, User Story sub-documents, ACs, `.feature` files — was retired as oversized for this project. **Do not recreate those folders or files**; route all design content into the matching `hldd.md` section.

| Document                   | What it covers                                                                                        |
|----------------------------|-------------------------------------------------------------------------------------------------------|
| `docs/hldd/hldd.md`        | The whole design — architecture decisions, data model (ER diagram), User↔Agent procedures (sequence diagrams), infrastructure |
| `docs/hldd/changelog.md`   | Append-only version log                                                                               |
| `docs/hldd/open-issues.md` | Open Questions + Improvements Backlog                                                                 |

`hldd.md` §4 Procedures maps the User↔Agent workflows and names the Skill each one leverages.

## Specific Rules

**Trunk-Based Development.** `main` is the only long-lived branch, and every push to it deploys to GitHub Pages. Commit small changes straight to `main`. Worktrees (`.claude/worktrees/`, gitignored) are short-lived: branch from `main`, merge back in the same session, then delete. Run `npm run validate` in `web/` before pushing, because it is the only gate.

**Plans** folder is `.claude/plans/`, which is gitignored and constantly emptied. Older plans have no value.

