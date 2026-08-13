---
name: questions
description: intent and design decisions for growing one Sheet's practice questions (active-recall reinforcement)
---

# What questions are for

Practice questions actively reinforce a Sheet the User has already studied — the site draws from the accumulated Bank at random, scored per day. Questions are generated on demand for **one Sheet**, named by the User (typically right after authoring or refreshing it). Read that Sheet and its existing questions — nothing else; do not scan the rest of the content.

Before generating, read `docs/hldd/hldd.md` — it is the entry point for where a Sheet's questions live, their shape, and how the site consumes them. The existing questions files under `content/` are authoritative examples; discover the mechanics there, don't guess them.

# Design decisions to honor

- **Challenge software-engineering reasoning, not mnemonics.** Do not fixate on hard-to-remember detail facts; measure design, architecture, and engineering judgment. Mnemonic facts may appear in the question's setup, never as the thing being tested.
- **Never repeat.** Asking the same fact or the same angle as an existing question of that Sheet counts as a repeat, even with different wording. Check against the Sheet's existing questions before writing.
- **Comprehensive explanations.** The explanation teaches the same engineering reasoning the question tests — why the answer is right and the others are not.
- **Plausible distractors.** Wrong answers are wrong but related — inside the question's topic, never absurd or obviously off-target.
- **Append, don't rewrite.** A Sheet's questions are append-only; existing entries and their order are part of the record.
