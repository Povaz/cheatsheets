---
description: Review an existing cheatsheet and propose improvements without making changes
argument-hint: <topic> [version/variant] [--focus density|layout|accuracy|all]
---

# Review Cheatsheet Pipeline

Performing a **read-only review** of an existing cheatsheet and producing prioritized suggestions. Do not edit any files — the user decides what to act on.

Target: **$ARGUMENTS**

---

## Before you begin

1. Read `CLAUDE.md`.
2. Locate the cheatsheet and its research note.
3. Parse `--focus` if provided:
   - `density` — too sparse or too dense?
   - `layout` — spatial arrangement serving the memory-palace use case?
   - `accuracy` — content still correct vs. current primary sources?
   - `all` (default) — everything plus general quality

---

## Review dimensions

For each dimension, produce **concrete observations with row/section references**, not vague feelings.

### 1. Density

- Count cards and rows per card. Flag cards with <3 rows (sparse) or >15 rows (overflowing).
- Check whether the sheet feels undersized (<30 rows total) or oversized (>100). Oversized sheets may need splitting into variants.
- Identify rows that feel like padding. Identify gaps where a high-value adjacent topic isn't covered.
- Identify rows that might belong in `detail` fields rather than visible rows.

### 2. Layout

- Are related topics spatially adjacent?
- Do section IDs feel like memorable anchors, or generic (`section-1`, `misc`)?
- Is the accent color system used consistently? Semantic accents should mean what they're documented to mean.
- Is there a clear entry point and flow?

### 3. Accuracy

- Spot-check a sample of rows against primary sources in `_research.md`.
- If research is >6 months old, suggest a `/refresh-cheatsheet`.
- For version-specific sheets, check whether newer versions have superseded features listed.
- Flag any claim not traceable to a cited source.

### 4. Format compliance

- Does the file follow the content format specified in `docs/CONTENT_FORMAT.md`?
- Any malformed tables, invalid section types, missing frontmatter fields?

### 5. Cross-sheet consistency

- If the user has multiple cheatsheets, is the tone / style / density / use of callouts similar?
- Are conventions consistent?
- Flag outliers — either style drift or an intentional exception.

---

## Output format

Produce a single review note at `content/<topic>/_review-<ISO-date>.md` (do NOT commit — it's scratch; the user decides what to do). Structure:

```markdown
# Review: <Topic> [<variant>] — <date>

Scope: <focus areas reviewed>

## Summary

Two to four sentences. Overall health, top priority suggestions.

## High-priority suggestions

Numbered list. Each: what to change, why (tie to review dimension), rough cost (trivial / medium / large).

## Lower-priority suggestions

Same format for nice-to-haves.

## Leave-alone confirmations

Things you looked at and concluded are fine — explicitly naming them.

## Questions for the user

Places where you don't have enough context to judge.
```

Do not phrase suggestions as commands. Use "consider", "could", "worth exploring" — the user is the decision-maker.

---

## ⏸ HANDOFF

Present:

1. Path to the review file.
2. Tight summary (3–5 bullets) of top suggestions.
3. Offer paths forward:
   - "Run `/refresh-cheatsheet <topic>` to act on the accuracy items"
   - "Tell me which specific suggestions to implement and I'll open each edit for approval"
   - "I'll leave this for you to read through"

Do not start editing unless explicitly told to.

---

## Rules

- **Read-only by default.** This workflow should never silently modify content.
- **Be specific.** "Card X feels thin" is not useful. "Card X has 2 rows while peers have 7–9; consider adding rows Y, Z" is useful.
- **Respect the user's choices.** If sparsity or unusual layout is justified in `_research.md`, don't flag it.
- **Don't review your own output.** If the cheatsheet was written in the same session, your review inherits your biases. Note this; suggest a fresh session.