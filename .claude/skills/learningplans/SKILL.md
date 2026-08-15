---
name: learningplans
description: intent and design decisions for authoring a Learning Plan — a linear sequence of Learning Steps toward a stated Goal
---

# What a Learning Plan is for

A Learning Plan turns a topic the User wants to master into an internally coherent sequence of Learning Steps that can be walked linearly, start to finish. It is driven by two inputs, both stated by the User — never start without both, ask:

- **Topic** — drives the content: *what* is being learned.
- **Goal** — drives the scope: *how far* the plan goes. The plan ends where the Goal is reached, not where the topic ends.

Before authoring, read `docs/hldd/hldd.md` — it is the entry point for where Learning Plans live, their shape, and how the site consumes them. Discover the mechanics there, don't guess them.

# Design decisions to honor

- **Progressive disclosure sequencing.** Order Steps so each one depends only on what came before it. The User must be able to progress linearly through the plan, never needing a later Step to understand an earlier one. State this promise and honor it.
- **Precise Step scope.** Each Step covers one well-bounded piece of the journey — its scope stated precisely enough that the User knows when the Step is done.
- **Three Learning Resources per Step:**
  1. **Historical/original (mandatory)** — the resource where the concept was first proposed or introduced, so the User learns who was involved, when, and where it happened.
  2. **Best video (if any)** — the video the scientific community regards as the best treatment of the Step's scope. Omit only when no worthy video exists.
  3. **Best written resource** — the paper, book, or article the scientific community regards as the best written treatment. When this is the historical/original resource itself, one entry serves both roles — do not pad with a second-best.
- **Pragmatism — time is budgeted toward the Goal.** The three lanes carry different time contracts. Historical is provenance: cite it, say in one line what began there, and let the User skim it out of curiosity — it is never a study obligation, whatever its page count. The Step's real study time lives in the Video/Written lanes, chosen as the fastest sound route to the Step's scope — efficiency, not shortcuts. Attach each original to the Step where its concept is actually learned; a Step that exists only to deliver history has no place on the spine — at most it survives as an explicitly optional skim with an honest, near-zero time cost.
- **Verified resources.** Every resource must be confirmed to exist and to cover what you claim — resolve URLs, check the attribution (author, year, venue) — never cite from memory. "Best for the scientific community" is a judgment to ground in evidence (citations, community consensus), not vibes.

# Shape on the page

The plan must read at a glance — Goal and Steps highlighted, resources legible against each other:

- The header states **Topic**, **Goal**, and the linearity promise before the first Step, plus one line telling the User how to read the lanes (Historical = provenance/skim; Video/Written = study).
- Each Step carries: its number and name, a one-or-two-line **Scope**, a **Done when** exit check, then its resources one per line, each prefixed with its lane — **Historical**, **Video**, **Written** — with optional **Extra**/**Hands-on** lines for worthwhile material that fits no lane. When one entry serves two roles, label it so (**Historical + Written**).
- Steps are atomic: one concept, one entry per lane — the author chooses the best; a Step never offers a menu. A Step that would need two originals is two Steps: split until each covers one concept. Runners-up and material that fits no lane survive as **Extra**/**Hands-on** lines, never as lane alternatives.
- Survey or praxis material with no original of its own lives outside the Step sequence — a preamble or a parallel hands-on track — and states where its originals live. Thematic Parts may group Steps for narrative; the Step numbering runs through them.

# Success criterion

The plan reaches the stated Goal — no Steps beyond it, no gaps before it — and every Resource has been verified. Confirm both before reporting done.
