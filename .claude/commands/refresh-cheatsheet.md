---
description: Update an existing cheatsheet with new/changed information
argument-hint: <topic> [version/variant]
---

# Refresh Cheatsheet Pipeline

Updating an existing cheatsheet. Same three-phase structure as `/new-cheatsheet` but starts from existing artifacts.

Target: **$ARGUMENTS**

---

## Before you begin

1. Read `CLAUDE.md` for editorial guidance.
2. Resolve the slug and locate the existing files (content + research note).
3. If the content file doesn't exist, redirect to `/new-cheatsheet`.
4. If the research file is missing, note it — you'll need to reconstruct one as part of this refresh.

---

## Phase 1 — Delta research

**Goal:** identify what has changed since the cheatsheet was last written.

**Do:**

1. Read the existing `_research.md` in full. Note previous sources, scope, open questions.

2. Re-fetch the same primary sources with `WebFetch`. Compare against previous findings:
   - New sections or features added to the docs
   - Existing behaviors that have changed
   - Deprecations or removals
   - Errata or corrections

3. Identify any *new* authoritative sources that have emerged.

4. Write a new section at the top of `_research.md`:

   ```markdown
   ## Refresh: <ISO date>

   ### Scope of this refresh
   What prompted it (user request, version bump, doc update noticed).

   ### Source re-check
   | Source | Status | What changed |
   |--------|--------|--------------|
   | ... | re-fetched / unchanged / deprecated / replaced | ... |

   ### New findings
   - Concrete facts added since last research.

   ### Content-facing impact
   Which sections of the current `.md` are affected.
   Which are unaffected and should remain unchanged.
   ```

   Keep the original research content below — don't delete history.

5. Update the file header: `Pipeline phase: research (approved: pending)`.

**⏸ APPROVAL GATE 1 — REFRESH SCOPE**

Present to the user:
1. Summary of what changed since the last version.
2. Which parts of existing content will need edits, which stay as-is.
3. Any judgment calls.

Wait for approval. Loop until scope is agreed. Update header on approval.

---

## Phase 2 — Apply delta to content

**Goal:** surgically edit the existing `.md`, preserving what still works.

**Do:**

1. **Read `docs/CONTENT_FORMAT.md` in full before editing.** Even though you're editing existing content, the format may have changed since the sheet was originally written. Do not assume familiarity carries over between sessions.

2. **Do not rewrite the cheatsheet from scratch.** Edit in place. Preserve section IDs, ordering, and any content that didn't change. The user's photographic memory is keyed to the existing spatial layout — stability matters.

3. For each affected section:
   - Update rows that changed
   - Add new rows with a comment in the commit message noting them
   - Remove rows no longer accurate (move them to the research note's "Removed in refresh <date>" section for posterity)

4. Update frontmatter `subtitle` if the refresh substantially changes what the sheet covers.

5. Update the research note header: `Pipeline phase: content (drafted: <date>)`.

**⏸ APPROVAL GATE 2 — CONTENT DIFF**

Present a diff-style summary:
1. Path to the edited file.
2. Sections added / modified / removed with counts.
3. Anything you were tempted to change but didn't, in case the user wants you to push further.

Wait for approval. Loop on edits. Update header on approval.

---

## Phase 3 — Render & verify

Same as `/new-cheatsheet` Phase 3. Run dev server, load the sheet, verify rendering, run `npm run build`.

Confirm marks and collapsed state still work (section IDs should be unchanged, so localStorage state from prior study sessions should survive). If any section IDs *did* change, warn the user: "Marks and collapsed state for sections X, Y will be reset in localStorage."

Update research note header: `Pipeline phase: complete (shipped: <date>)`.

---

## Rules

- **Preserve section IDs** unless there's a strong reason to change them. IDs are memory anchors.
- **Preserve section order** for the same reason. Only reorder if the user explicitly asks.
- **Keep full research history** in `_research.md`. Refreshes append, they don't overwrite.
- **Date every refresh block** in ISO format.