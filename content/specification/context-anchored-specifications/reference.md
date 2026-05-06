# Reference: Specification — Context-Anchored Specifications

Consolidated from `sources.yml`: a single source, the author's framework write-up.

## Naming

Earlier drafts: "Lean DDD" (overclaimed DDD heritage), then "Vocabulary-Indexed Specifications" (rebranded the host process under one inserted feature). The current name describes what the framework actually does: it **anchors** existing User Stories + Acceptance Criteria to a Context's Dictionary. The verb *anchor* and the property *anchored* (vs. *unanchored*) are used throughout.

## The problem: silent semantic drift

The framework prevents **silent semantic drift** — two stakeholders use the same word in good faith, agree they understand each other, and only discover at implementation or acceptance time that they meant different things.

The smallest case: a single term where the developer's reasonable interpretation produces working code that fails acceptance because the business meaning was different.

The drift always surfaces — the question is *when*. Without shared vocabulary, it surfaces late: QA, UAT, production. The framework is a **shift-left** intervention: the disagreement is forced into specification, when fixing it costs a sentence rather than a sprint.

## The framework in one paragraph

Between an unstructured Spec File and the User Stories that derive from it, insert a **Dictionary**: a deliberately small set of `(term, definition)` pairs covering ambiguous, domain-risky, business-weighted, or cross-team words. User Stories and Acceptance Criteria are **anchored** to the Dictionary — each Story tagged with one or more **Contexts**, every defined term highlighted in backticks. A Story without any Context tag is **unanchored**. Highlighting is mandatory because it makes term→artifact mapping mechanically rigorous: when a definition changes, the affected artifact set is exactly the one whose highlighted text contains that term. Iterative and lean; judgment is preferred over rigid rules everywhere except this mechanical guarantee.

## Three artifacts, three jobs

The artifacts are **orthogonal** — each prevents a distinct class of failure.

| Artifact | Question | Failure prevented |
|---|---|---|
| **Dictionary** | What are we talking about? | Semantic drift |
| **User Stories** | Who needs what, and why? | Building the wrong thing |
| **Acceptance Criteria** | How must it behave? | Building it incorrectly |

Vocabulary alignment is the Dictionary's job *only*. Behavioral disputes that survive vocabulary alignment are an AC issue. Disagreement about scope is a Story issue. Connextra format (`As a <role>, I want <capability>, so that <benefit>`) keeps Stories in the *purpose* lane.

## Building blocks

- **Context** — A named scope with its own coherent vocabulary. Has a **title**, **short description**, **Dictionary**, and optional **Relationships** (plain prose describing how it relates to other Contexts; same-term divergence across Contexts is acknowledged here).
- **Dictionary entry** — A `(term, definition)` pair, written for humans, not for a schema. A term is worth including when it is ambiguous, domain-specific, carries business/legal/operational weight, affects business rules, is used differently by different stakeholders, recurs across Stories, or could cause implementation mistakes if misunderstood. **Do not** define every ordinary word.
- **Anchoring** — Binding a User Story to one or more Contexts. **Anchored** = at least one Context tag *and* its uses of defined terms are highlighted. **Unanchored** = no Context tag (typically: not yet processed, or tags removed during refactor and not replaced). Acceptance Criteria are anchored *transitively* — they inherit all parent Story Contexts (Rule 4) and carry their own highlighted terms; not anchored independently.

## The 10 rules

1. **Highlighting is mandatory.** Every use of a defined term *in its dictionary sense* must be highlighted in Stories and AC. Notation: backticks (`` `Invoice` ``). Backticks render as monospace in every viewer, survive format conversion, are mechanically greppable. Mistakes are corrected at review like any spec bug — not treated as compliance failure.

2. **Smells are review prompts, not failures.** A smell means *"this deserves attention"* — not that the artifact is wrong. Examples: a Story spanning multiple Contexts; a term with only one citation; a hard-to-define term; two Contexts using the same word differently. Smells trigger discussion, not rejection.

3. **Each anchored Story has at least one Context.** Most Stories should belong to exactly one Context — keeps them linguistically coherent and discourages oversized Stories that mix domains. An unanchored Story must be anchored before the next recurring spec review.

4. **AC inherit all of their parent Story's Contexts.** Terms in AC are interpreted against the union of parent Story Dictionaries. If a term is defined differently across two of those Contexts, Rule 5's disambiguation applies.

5. **Multi-Context Stories are allowed; ambiguous terms are disambiguated inline.** When a Story belongs to multiple Contexts and a highlighted term is defined differently in two or more of them, the term is annotated with the Context inside the backticks: `` `term[Context]` ``. In all other cases (including most uses of terms in multi-Context Stories), plain backticks are sufficient. Stories needing inline annotation are **points of attention** — same-term divergence is rare and often signals a Story doing too much.

6. **Multi-Context Stories follow a split-or-keep rubric.** Default to **split** when any of:
   - **(a) Single-rephrase split** — the Story can be cleanly stated using only one Context's vocabulary by removing/rephrasing one sentence.
   - **(b) Independent terms** — cross-Context terms refer to independent entities, not structurally entangled.
   - **(c) Clean INVEST split** — splitting yields two Stories that each pass INVEST.

   Otherwise, **keep** multi-Context. Override the default only with explicit recorded reasoning. Bounds where judgment is needed without removing it.

7. **Pruning happens at recurring spec reviews.** Not a special event — it happens at the team's regular cadence (typically sprint review). Terms with zero citations are removed; terms with one citation are kept only if judged important. *"Important"* is intentionally undefined. No formal "freeze" or "snapshot" event — stable-state moments (releases, handoffs, approvals) live outside the framework as sales/management artifacts.

8. **Iteration is mandatory, not optional.** If, while drafting a Story or AC, a Dictionary term needs adjustment or a new term needs adding, that adjustment happens *before* the artifact is finalized. Dictionary, Stories, and AC evolve together continuously.

9. **Definition changes propagate backwards.** This is the structural counterpart of iteration and the property that justifies the highlighting overhead. Because Rule 1 is mandatory, the affected-artifact set is **mechanically identifiable**: exactly the Stories and AC whose highlighted text contains the term. When a definition changes, all such artifacts are re-read and revised — or the definition change is reconsidered. Without this propagation, highlighting is decorative; with it, the Dictionary becomes a navigable index.

10. **Code-level usage is encouraged, not enforced.** Teams are strongly advised to carry Dictionary terms into class names, function names, variables, modules, APIs, DB concepts, UI labels. No syntactic check by the framework.

## User Story Maps

Built **per Context** by default — preserves linguistic coherence. Cross-context journey maps are the exception, used when end-to-end product flow needs a holistic view.

## Output format

Each Context:

```markdown
# Context: <Title>

<Short description of what this Context covers.>

## Relationships
<Plain-text description of how this Context relates to others.
 If terms overlap with other Contexts but mean different things,
 explain the divergence here.>

## Dictionary

| Term   | Definition   |
|--------|--------------|
| <term> | <definition> |
```

Stories and AC carry: one or more **Context tags**; Dictionary terms wrapped in backticks within text; in rare same-term ambiguity, `` `term[Context]` `` on ambiguous occurrences.

Single-Context (common):
```text
[Contexts: Billing]

As a `Customer`, I want to download an `Invoice` so that I can keep
a record of my purchase.
```

Multi-Context with inline disambiguation (rare):
```text
[Contexts: Billing, Account Management]

As a `Customer`, I want to update my `Billing Profile` using my
`Account[Account Management]` so that my invoices are sent to the
correct address.
```

That is the entire output contract. No required tooling, schema validation, or enforced file layout.

## The process (6 steps)

1. **Spec File** — Unstructured natural-language doc describing what is being built and why. Human-written, optionally AI-assisted.
2. **Dictionary draft** — Before Stories, the team drafts an initial Dictionary based on the Spec File. Multiple Contexts if vocabularies clearly diverge. Deliberately small — important terms only, not completeness.
3. **User Stories** — **Connextra** (`As a <role>, I want <capability> so that <benefit>`) evaluated against **INVEST** (Independent, Negotiable, Valuable, Estimable, Small, Testable). Each Story is **anchored**: tagged with Contexts, terms highlighted. Most Stories: single Context. Multi-Context Stories: split-or-keep rubric (Rule 6).
4. **Acceptance Criteria** — Per Story, in **BDD Gherkin** (`Given / When / Then`). Inherit parent's Contexts (Rule 4), highlight terms, use `` `term[Context]` `` annotation when same-term ambiguity surfaces only at AC level.
5. **Iterative refinement** — At every step, any earlier artifact may be revised: Spec File, Dictionary, Context boundaries, Stories, AC, highlighted terms, tags. No formal change-control gate; iteration is the default mode.
6. **Recurring spec review** — At the team's regular cadence: prune Dictionary (Rule 7), confirm Stories anchored, re-check multi-Context Stories against the rubric, propagate definition changes to affected artifacts (Rule 9). Ongoing maintenance, not a milestone.

The pipeline mixes manual and AI-assisted writing. The Dictionary is a shared artifact for both. AI output still requires review — especially for unhighlighted Dictionary terms, accidental synonyms, invented terminology, cross-context vocabulary leakage.

## Lineage — relation to DDD

Inspired by Domain-Driven Design (Eric Evans, 2003), but a deliberately small subset.

### Borrowed from DDD

- **Ubiquitous Language** → becomes the **Dictionary**. The single most valuable DDD idea: words mean the same thing to every stakeholder; ambiguity is a primary defect source.
- **Bounded Contexts** → becomes the framework's **Context**. A single word legitimately means different things in different parts of the same business; pretending otherwise breaks software.
- **Iterative refinement of language** — DDD treats language as living; the Dictionary too — evolved continuously, pruned at reviews, never frozen.

### Deliberately left out

- **Strategic Design machinery** — no Context Maps with formal patterns (Shared Kernel, Customer/Supplier, Conformist, Anticorruption Layer, etc.). Free-text relationships only.
- **Tactical Design patterns** — no Aggregates, Entities, Value Objects, Domain Events, Repositories, Factories.
- **Domain Events / Event Storming** — not part of this process.
- **Hard separation between Domain Model and infrastructure** — out of scope.

### Honest divergence

A purist would object: *ubiquitous language not reaching code is not really ubiquitous*. Fair. The framework's position: spec-level alignment is itself a meaningful win; syntax-checked code-level rollout is a future enhancement, not a precondition. Code carry-over is encouraged, not checked.

## Future enhancements

Documented rather than hidden — visible debt over false confidence. None adopted yet.

- **Code-level Dictionary enforcement** — a linter that verifies code identifiers against the active Dictionary, analogous to Gherkin↔executable test linkage. Would close the spec/code vocabulary gap. Most-discussed enhancement.
- **Unhighlighted-term checker** — Rule 1 enforcement is currently human-only. A doc checker that flags Dictionary terms appearing without backticks would convert discipline into tooling. Near-term priority.
- **Automatic `term → affected artifacts` index** — Rule 9's mapping is mechanically identifiable but currently computed by hand. A generator would make impact analysis cheap.
- **Multi-Context Story patterns** — currently flat tags + Rule 6 rubric + Rule 5 inline disambiguation. DDD's Context Map relationship patterns offer a more nuanced answer once recurring patterns are observed.
- **Dictionary quality guidance** — current framework gives only inclusion criteria. Deeper guidance on definition specificity, circularity, synonyms/aliases, plurals, multi-word terms, worked good/bad examples.
- **Aliases, synonyms, term versioning** — the Dictionary currently treats each term as a single canonical form with one current definition. Optional support for aliases, synonyms (cross-references), and versioning would expand expressiveness without forced complexity.
- **AI review prompts** — dedicated prompts that check Stories/AC against the active Dictionary, flagging unhighlighted terms, accidental synonyms, invented terminology, cross-context vocabulary leakage. Systematizes ad-hoc human review.