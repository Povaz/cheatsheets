---
title: Context-Anchored Specifications
subtitle: shift-left vocabulary alignment grafted onto a User Stories + Acceptance Criteria pipeline
---

## [chapter] Introduction

## [text purpose] Purpose & shape

- **Problem** — *silent semantic drift*: stakeholders use the same word in good faith and only discover at acceptance time they meant different things.
- **Intervention** — between the unstructured Spec File and User Stories, insert a **Dictionary** of `(term, definition)` pairs covering ambiguous, domain-risky, or business-weighted words.
- **Anchoring** — each Story is tagged with one or more **Contexts** and wraps defined terms in backticks. *Anchored* = at least one Context tag + highlighted terms; *unanchored* = no Context tag.
- **Why it pays off** — when a definition changes, the affected-artifact set is *mechanically identifiable*: the Stories and AC whose highlighted text contains that term. Without highlighting, the Dictionary is decorative.

## [card artifacts] Three Artifacts, Three Jobs

| code | name | desc | detail |
|------|------|------|--------|
| `Dictionary` | What are we talking about? | prevents **semantic drift** | The deliberately small `(term, definition)` set per Context. Definitions are written for humans, not for a schema. |
| `User Stories` | Who needs what, and why? | prevents **building the wrong thing** | Connextra format (`As a <role>, I want <capability>, so that <benefit>`). Three slots keep Stories in the *purpose* lane. |
| `Acceptance Criteria` | How must it behave? | prevents **building it incorrectly** | BDD Gherkin (`Given / When / Then`) per Story. Inherits parent's Contexts (Rule 4). |

> [tip] Artifacts are orthogonal — each prevents a distinct failure class. Behavioral disputes after vocabulary alignment = AC issue, not a Dictionary failure.

## [chapter] Deep-Dive

## [card building-blocks] Building Blocks

| code | name | desc | detail |
|------|------|------|--------|
| `Context` | named scope w/ coherent vocabulary | title + short description + Dictionary + optional Relationships | Relationships are plain prose. Same-term divergence across Contexts is acknowledged here, not hidden. |
| `Dictionary entry` | a `(term, definition)` pair | written for humans, not a schema | Worth including when: ambiguous, domain-specific, business/legal/operational weight, used differently by different stakeholders, recurs across Stories, or risks implementation mistakes. |
| `Anchored Story` | tagged with ≥1 Context + highlighted terms | the artifact is bound to the Dictionary | A Story without a tag is **unanchored** — typically not yet processed, or tags removed during refactor and not replaced. Must be anchored before next recurring spec review. |
| `Anchored AC` | inherits parent Story's Contexts | not anchored independently | Carries its own highlighted terms; uses inline `term[Context]` only when same-term ambiguity surfaces at AC level. |
| `Smell` | review prompt, not a failure | "this deserves attention" | Examples: Story spans many Contexts; term has only one citation; term hard to define cleanly; two Contexts use the same word differently. |

> [warn] Do **not** define every ordinary word. The Dictionary is deliberately small — coverage of *important* terms beats completeness.

## [card rules] The 10 Rules

| code | name | desc | detail |
|------|------|------|--------|
| **R1** | Highlighting is mandatory | every defined term in its dictionary sense → backticks: `` `Invoice` `` | Backticks render as monospace in every viewer, survive format conversion, are mechanically greppable. Mistakes are corrected at review like any spec bug — not treated as compliance failure. |
| **R2** | Smells are prompts, not failures | a smell triggers discussion, not rejection | The framework supports shared understanding, not compliance. Examples in the Building Blocks card. |
| **R3** | Each anchored Story has ≥1 Context | most Stories should have *exactly* one | Multi-Context Stories tend to be oversized and mix domains. Unanchored Stories must be anchored before the next recurring review. |
| **R4** | AC inherit all parent Story's Contexts | terms read against the union of Dictionaries | If a term is defined differently across two of those Contexts, Rule 5 disambiguation kicks in. |
| **R5** | Multi-Context: inline disambiguation | `` `term[Context]` `` only when same-term divergence | In *all other* cases (including most uses in multi-Context Stories), plain backticks suffice. Inline annotation = **point of attention** for reviewers. |
| **R6** | Split-or-keep rubric | default to split if (a) single-rephrase, (b) independent terms, or (c) clean INVEST split | See dedicated card. Override the default only with explicit recorded reasoning. |
| **R7** | Prune at recurring spec reviews | not a special event — happens at sprint review or equivalent cadence | Zero-citation terms removed; one-citation terms kept only if judged important. *"Important"* is intentionally undefined. No formal "freeze" or "snapshot" — releases live outside the framework as sales/management artifacts. |
| **R8** | Iteration is mandatory | Dictionary, Stories, AC evolve together continuously | If drafting a Story or AC needs a Dictionary adjustment, do it *before* finalizing the artifact — no separate change-control gate. |
| **R9** | Definition changes propagate backwards | the affected-artifact set is mechanically identifiable: every Story/AC whose highlighted text contains that term | The structural counterpart of R8 and the property that justifies the highlighting overhead. Without R9, R1 is decorative. With it, the Dictionary becomes a navigable index. |
| **R10** | Code-level usage is encouraged, not enforced | carry Dictionary terms into class/function/var/module/API/DB/UI names | No syntactic check by the framework. See *Lineage → honest divergence* for the trade-off. |

## [card split-keep] R6 — Split-or-Keep Rubric for Multi-Context Stories

| code | name | desc | detail |
|------|------|------|--------|
| **(a)** | Single-rephrase split | the Story can be cleanly stated using only one Context's vocabulary | …by removing or rephrasing one sentence. If yes → **split**. |
| **(b)** | Independent terms | cross-Context terms refer to independent entities | They happen to appear together but aren't structurally entangled. If yes → **split**. |
| **(c)** | Clean INVEST split | both halves pass INVEST | Splitting yields two valid Stories. If yes → **split**. |
| `default` | otherwise | **keep** the Story multi-Context | The rubric bounds where judgment is needed; it doesn't remove judgment. |
| `override` | explicit reasoning required | record alongside the Story | Override the default (split when none apply, or keep when one does) only with stated reasons. |

> [tip] Inline disambiguation `` `term[Context]` `` is needed *only* when the same term has divergent definitions across the Story's Contexts — rare. Most multi-Context Stories use plain backticks throughout.

## [code output] Output Format

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

```text
# Single-Context Story (the common case)

[Contexts: Billing]

As a `Customer`, I want to download an `Invoice` so that I can keep
a record of my purchase.
```

```text
# Multi-Context Story with inline disambiguation (rare)

[Contexts: Billing, Account Management]

As a `Customer`, I want to update my `Billing Profile` using my
`Account[Account Management]` so that my invoices are sent to the
correct address.
```

## [card process] The 6-Step Process

| code | name | desc | detail |
|------|------|------|--------|
| **1** | Spec File | unstructured natural-language doc — what + why | Human-written, optionally AI-assisted. The unstructured starting point the framework grafts onto. |
| **2** | Dictionary draft | initial Dictionary from the Spec File, *before* any Stories | Multiple Contexts if vocabularies clearly diverge. Deliberately small — important terms only. |
| **3** | User Stories | Connextra + INVEST + anchor | Each Story tagged with Contexts; defined terms wrapped in backticks throughout the text. Multi-Context Stories run through R6. |
| **4** | Acceptance Criteria | BDD Gherkin per Story | Inherit parent's Contexts (R4); use `` `term[Context]` `` only when same-term ambiguity surfaces at AC level. |
| **5** | Iterative refinement | any earlier artifact may be revised at any step | No formal change-control gate. Iteration is the *default* mode — Spec File, Dictionary, Contexts, Stories, AC, tags, highlights. |
| **6** | Recurring spec review | at the team's regular cadence (typically sprint review) | Prune Dictionary (R7); confirm Stories anchored (R3); re-check multi-Context Stories (R6); propagate definition changes (R9). Ongoing maintenance, not a milestone. |

> [tip] AI-generated artifacts still need human review — especially for *unhighlighted* Dictionary terms, accidental synonyms, invented terminology, and cross-context vocabulary leakage.

## [chapter] Further Info

## [card lineage] DDD Lineage

| code | name | desc | detail |
|------|------|------|--------|
| `borrowed` | **Ubiquitous Language** | → becomes the **Dictionary** | The single most valuable DDD idea: words mean the same thing to every stakeholder; ambiguity is a primary defect source. |
| `borrowed` | **Bounded Contexts** | → becomes the framework's **Context** | A single word legitimately means different things in different parts of the same business; pretending otherwise breaks software. |
| `borrowed` | iterative language refinement | living artifact, never frozen | DDD treats language as living; the Dictionary is too — evolved continuously, pruned at reviews. |
| `dropped` | Strategic Design machinery | no Context Maps with formal patterns | Shared Kernel, Customer/Supplier, Conformist, Anticorruption Layer — replaced by free-text Relationships. |
| `dropped` | Tactical Design patterns | no Aggregates / Entities / Value Objects | Nor Domain Events, Repositories, Factories. Specification layer, not code-design methodology. |
| `dropped` | Event Storming workshops | not part of this process | — |
| `dropped` | Domain Model / infra separation | out of scope | — |
| `divergence` | code-level uptake = encouraged, not enforced | **R10**, not a syntactic check | Purist objection: *language not reaching code is not really ubiquitous* — fair. Position: spec-level alignment is itself a meaningful win; code-level is a future enhancement, not a precondition. |

## [card future] Future Enhancements

| code | name | desc | detail |
|------|------|------|--------|
| 1 | Code-level Dictionary enforcement | linter verifying code identifiers against the active Dictionary | Closes the spec/code vocabulary gap (the R10 trade-off). **Most-discussed enhancement.** |
| 2 | Unhighlighted-term checker | doc checker flags Dictionary terms appearing without backticks | Converts the discipline problem into a tooling problem. **Near-term priority** given R1's reliance on highlighting completeness. |
| 3 | Automatic `term → affected artifacts` index | generate R9's mapping automatically from the spec | Makes impact analysis cheap rather than disciplined. |
| 4 | Multi-Context Story patterns | adopt a subset of DDD's Context Map relationship patterns | Today: flat tags + R6 rubric + R5 inline disambig. Wait until recurring patterns emerge in practice. |
| 5 | Dictionary quality guidance | specificity, circularity, synonyms, plurals, multi-word terms, worked examples | Current framework gives only inclusion criteria — onboarding aid for new teams. |
| 6 | Aliases / synonyms / term versioning | optional surface forms, cross-references, change history | Expands Dictionary expressiveness without forcing complexity on teams that don't need it. |
| 7 | AI review prompts | dedicated prompts that check Stories/AC against the active Dictionary | Flag unhighlighted terms, accidental synonyms, invented terminology, cross-context vocabulary leakage. Systematizes ad-hoc human review. |

> [tip] Documented rather than hidden — the lean ethos prefers visible debt over false confidence. None adopted yet.