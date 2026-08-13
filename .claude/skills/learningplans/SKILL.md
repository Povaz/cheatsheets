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
- **Verified resources.** Every resource must be confirmed to exist and to cover what you claim — resolve URLs, check the attribution (author, year, venue) — never cite from memory. "Best for the scientific community" is a judgment to ground in evidence (citations, community consensus), not vibes.

# Success criterion

The plan reaches the stated Goal — no Steps beyond it, no gaps before it — and every Resource has been verified. Confirm both before reporting done.
