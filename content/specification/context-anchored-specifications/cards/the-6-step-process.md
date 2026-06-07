## [card the-6-step-process] The 6-Step Process

| code | desc | detail |
|------|------|--------|
| **1** | Spec File — unstructured natural-language doc — what + why | Human-written, optionally AI-assisted. The unstructured starting point the framework grafts onto. |
| **2** | Dictionary draft — initial Dictionary from the Spec File, *before* any Stories | Multiple Contexts if vocabularies clearly diverge. Deliberately small — important terms only. |
| **3** | User Stories — Connextra + INVEST + anchor | Each Story tagged with Contexts; defined terms wrapped in backticks throughout the text. Multi-Context Stories run through R6. |
| **4** | Acceptance Criteria — BDD Gherkin per Story | Inherit parent's Contexts (R4); use `` `term[Context]` `` only when same-term ambiguity surfaces at AC level. |
| **5** | Iterative refinement — any earlier artifact may be revised at any step | No formal change-control gate. Iteration is the *default* mode — Spec File, Dictionary, Contexts, Stories, AC, tags, highlights. |
| **6** | Recurring spec review — at the team's regular cadence (typically sprint review) | Prune Dictionary (R7); confirm Stories anchored (R3); re-check multi-Context Stories (R6); propagate definition changes (R9). Ongoing maintenance, not a milestone. |

> [tip] AI-generated artifacts still need human review — especially for *unhighlighted* Dictionary terms, accidental synonyms, invented terminology, and cross-context vocabulary leakage.
