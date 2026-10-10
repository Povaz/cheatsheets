---
name: learningplans
description: intent and design decisions for authoring a Learning Plan — a linear sequence of Learning Steps toward a stated Goal. Invoke whenever the User asks for a Plan, or when researching Sources shows a subject is too big for one Sheet
---

# What a Learning Plan is for

A Learning Plan turns a topic the User wants to master into an internally coherent sequence of Learning Steps that can be walked linearly, start to finish. It is driven by two inputs, both stated by the User — never start without both, ask:

- **Topic** — drives the content: *what* is being learned.
- **Goal** — drives the scope: *how far* the plan goes. The plan ends where the Goal is reached, not where the topic ends.

Before authoring, read `HLDD.md` — it is the entry point for where Learning Plans live, their shape, and how the site consumes them. Discover the mechanics there, don't guess them.

# Design decisions to honor

- **Progressive disclosure sequencing.** Order Steps so each one depends only on what came before it. The User must be able to progress linearly through the plan, never needing a later Step to understand an earlier one. State this promise and honor it.
- **Precise Step scope.** Each Step covers one well-bounded piece of the journey — its scope stated precisely enough that the User knows when the Step is done.
- **Sources by role.** Each Source has one role:
  1. **Original** — the published work where the thing was first presented, so the User learns who, when and where. Expected on every Step that has one; it is provenance to skim, not a study obligation.
  2. **Video** — the best video treatment of the Step's scope, if a worthy one exists.
  3. **Written** — the best written treatment (paper, book, article, annotated code). When the Original is also the best read, the Original card serves both; do not pad.
  Worthwhile extras or hands-on material become another Video or Written Source, only when they genuinely help the Step. A Step never offers a menu of equivalents.
- **Pragmatism — time is budgeted toward the Goal.** Video and Written are the fastest sound route to the Step's scope. Attach each Original to the Step where its concept is actually learned.
- **Verified resources.** Every Source must be confirmed to exist and to cover what you claim — resolve URLs, check author and year — never cite from memory. "Best" is a judgment grounded in evidence (citations, community consensus), not vibes.

# Shape

A Plan is data, not prose: Parts → Steps → Sources, in the Plan's JSON file. The existing Plans and the validator are authoritative for the exact fields; discover them there.

- The Plan's subtitle states the **Goal** in one line.
- Every Part and Step gets a clear title and a **one-line** summary; every Source gets a **one-line** note saying what it is (e.g. "The paper that presented the transformer"). No overviews, legends, reading instructions or exit checks — the page renders the structure.
- Steps are atomic: one concept each. A Step that would need two Originals is two Steps. Step numbering runs across Parts.
- A Step is marked done, and linked to the Sheet it produced, only when the User says so.

# Success criterion

The plan reaches the stated Goal — no Steps beyond it, no gaps before it — every Source has been verified, and the project's validation passes. Confirm all three before reporting done.
