# `reference.md` Guidance

`reference.md` is the consolidated study text for a SubTopic — the single comprehensive document the `Consolidation User` reads to study, and the input from which `sheet.yml` + `cards/*.md` are distilled. It is plain Markdown; the deployed app does not render it.

## Required header

```markdown
# Reference: <Topic> <SubTopic>
```

A one-line introductory paragraph identifying which `sources.yml` it was built from is recommended but not required.

## Structure

Free-form Markdown. Suggested but not enforced:

- `H2` sections grouping related facts.
- Bullet lists of concrete facts, not summary prose.
- Inline code for syntax, identifiers, file paths.
- Bold for canonical names (PEP numbers, RFC numbers, key terms).

The Reference is the place to be exhaustive within the chosen scope. The Sheet is the place to be terse. Resist the urge to keep them in lock-step — the Reference may carry context the Sheet drops.

## What it is not

- Not a Source. Sources are external inputs, listed in `sources.yml`. The Reference *consolidates* them.
- Not a Sheet. Sheets follow the strict format in `CONTENT_FORMAT.md`. The Reference is freeform.
- Not a changelog of the SubTopic. It is the present-tense study material.

## Lifecycle

- Created or rewritten when `sources.yml` changes (US-3 Refresh).
- Read directly by the `Consolidation User` during study.
- Used as the basis for distilling `sheet.yml` + `cards/*.md`.
- Deleted with the SubTopic folder when the SubTopic is removed (US-5).
