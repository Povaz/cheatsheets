---
name: questions
description: intent and design decisions for one Sheet's practice questions (active-recall reinforcement). Invoke whenever a Sheet's questions are minted, extended, or rewritten after the Sheet changed
---

# What questions are for

Practice questions actively reinforce a Sheet the User has already studied — the site draws from the accumulated Bank at random, scored per day. Questions are generated for **one Sheet** — typically once the User accepts it, or when it changes. Read that Sheet and its existing questions — nothing else; do not scan the rest of the content.

Before generating, read `HLDD.md` — it is the entry point for where a Sheet's questions live, their shape, and how the site consumes them. The existing questions files under `content/` are authoritative examples; discover the mechanics there, don't guess them.

# Design decisions to honor

- **Challenge software-engineering reasoning, not mnemonics.** Do not fixate on hard-to-remember detail facts; measure design, architecture, and engineering judgment. Mnemonic facts may appear in the question's setup, never as the thing being tested.
- **Never repeat.** Asking the same fact or the same angle as an existing question of that Sheet counts as a repeat, even with different wording. Check against the Sheet's existing questions before writing.
- **Comprehensive explanations.** The explanation teaches the same engineering reasoning the question tests — why the answer is right and the others are not.
- **Plausible distractors.** Wrong answers are wrong but related — inside the question's topic, never absurd or obviously off-target.
- **Questions follow their Sheet.** When the Sheet was restructured, rewrite its questions to test the Sheet as it is now; otherwise extend them without touching existing entries.
