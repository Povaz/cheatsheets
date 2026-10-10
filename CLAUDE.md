# Cheatsheets — Claude orientation

Personal CheatSheet web application. The user has a photographic memory and studies best from single-page, information-dense reference Sheets with strong spatial structure. Density, stable layout, and memorable section IDs matter more than generic UI polish.

## User Behaviour
The user is a backend developer, not a frontend developer. **The Agent is the user's only interface to content**: the user never edits content files or Vue code by hand. Work happens in conversation: picking a subject and its Sources, studying a Source step by step, building or restructuring a Sheet, growing its questions. Any work that produces or changes a Sheet, its questions, or a Learning Plan goes through the matching Skill (`explain`, `questions`, `learningplans`), whatever the conversation looks like.

Hierarchy: a **Topic** holds **Sheets**. Learning Plans are separate and never dictate the Topic/Sheet structure.

## Specifications

The whole design is one short file, `docs/hldd/hldd.md`: it holds only what the code cannot tell — rationale, deliberate exclusions, rules for the Agent, the User↔Agent procedures, and Ideas. Everything else is inferred from the code. **Do not add** changelogs, backlogs, User Stories, ACs or `.feature` files, and do not describe mechanics the code already shows. History lives in git.

## Specific Rules

**Trunk-Based Development.** `main` is the only long-lived branch, and every push to it deploys to GitHub Pages. Commit small changes straight to `main`. Worktrees (`.claude/worktrees/`, gitignored) are short-lived: branch from `main`, merge back in the same session, then delete. Run `npm test` and `npm run validate` in `web/` before pushing, because they are the only gates (the deploy workflow runs both and stops on failure).

**Plans** folder is `.claude/plans/`, which is gitignored and constantly emptied. Older plans have no value.

