---
name: explain
description: intent and design decisions for authoring a Sheet — the single-page reference the site renders for one SubTopic
---

# What a Sheet is for

The User has a photographic memory. A Sheet is a single-page, information-dense reference optimised for two things: grasping a studied topic in one glance, and relocating a previously-seen fact by its position on the page. Density, stable spatial structure, and memorable section identities matter more than generic UI polish or completeness — a Sheet covers what the User has studied, not the whole topic. Scope is bounded by the User: ask if it is unbounded or ambiguous.

Before authoring, read `docs/hldd/hldd.md` — it is the entry point for everything mechanical: where content lives, the Fragment contract, and what enforces it. The build validator and the existing Sheets under `content/` are authoritative for the exact vocabulary; discover the mechanics there, don't guess them.

# Design decisions to honor

- **Progressive disclosure.** Order concepts so each is introduced only after everything it depends on. The reader must be able to go top-to-bottom once, never jumping ahead for a term used earlier. State this promise and honor it.
- **Verified official sources.** Ground every claim in primary/official documentation; prefer it over blogs unless the community canonically relies on an unofficial source. Before citing any URL, confirm it resolves and says what you claim — never cite from memory. Attribution lives outside the Sheet, never inside it.
- **Voice.** Direct, crisp, schematic: short paragraphs, lists over prose, concrete examples in the User's stack when given. No change-history, no filler.
- **Lean standard.** No tip/warning/gotcha callouts — if a fact is essential to the concept it belongs in the body; if it isn't, omit it. No in-page title, no table of contents — the site derives both. A small diagram or table wherever it clarifies more than prose.

# Success criterion

The Sheet is done only when the project's Fragment validation passes — run it and confirm before reporting done.
