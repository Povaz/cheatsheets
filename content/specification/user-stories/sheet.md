---
title: User Stories
subtitle: short user-facing capability statements that hold a place for a refinement conversation
---

## [chapter] Foundations

## [card 3cs] The 3Cs (Ron Jeffries)

| code | name | desc | detail |
|------|------|------|--------|
| `Card` | the short narrative | deliberately too small to specify | An index card historically — just enough to remember what to discuss. Title + Connextra narrative live here. |
| `Conversation` | the design discussion | requirements discovered & agreed | Happens at refinement (Three Amigos / Example Mapping). Where the *how* gets decided. |
| `Confirmation` | the Acceptance Criteria | observable conditions for "done" | Lives in a separate AC section, *not* in the story narrative. A story whose description contains "Given/When/Then" is skipping this layer. |

> [tip] A user story answers *what value, to which user, and why?* — never *how*. The *how* is for refinement and ends up in the AC.

## [code connextra] Connextra Template

```text
**Title:** <short, concrete phrase — the user-visible outcome, not the implementation>

**As a** <type of user>,
**I can** <some goal>,
**so that** <some reason>.
```

> [tip] Use **"I can"**, not "I want" — it forces an observable capability. "I want" drifts into wishful language. Title reads like a headline (≤80 chars), phrased around the outcome ("Reset password via email link"), not the task ("Add password-reset endpoint").

## [card not-a-story] Not a User Story

| code | name | desc | detail |
|------|------|------|--------|
| `Task` | implementation work item | *"Add /api/v1/users POST endpoint"* | Belongs as a Task. The story is *"As an admin, I can invite a new user, so they can start using the platform."* |
| `Impl note` | technical decision | *"Use Redis for session storage"* | Belongs in a spike or ADR, not on the story card. |
| `DoD` | team-wide quality gate | *"code reviewed"*, *"deployed to staging"* | Definition of Done is per-team, applies to every story — not authored per story. |
| `Improvement` | internal tooling | *"a script that resets the test DB"* | Belongs as a Task or Improvement Item. If the only beneficiary is the team, the story format is a contortion (see *Fake Story*). |

## [chapter] Quality & Anti-Patterns

## [card invest] INVEST (Bill Wake)

| code | name | desc | detail |
|------|------|------|--------|
| **I** | Independent | buildable + demoable on its own | A story with a hard dependency on another *unbuilt* story is waiting, not ready. Split or sequence; don't pretend. |
| **N** | Negotiable | states user goal, not the implementation | If the goal *is* the implementation ("a script", "an endpoint"), there is nothing left for refinement to discuss. |
| **V** | Valuable | observable user gets measurable value | If the only beneficiary is the delivery team, it is almost certainly a Task in disguise (see *Fake Story*). |
| **E** | Estimable | enough clarity to ballpark effort | Un-estimable → run a Spike (SPIDR-S) to burn down uncertainty before taking the story. |
| **S** | Small | 1–2 days, certainly within a sprint | Larger stories must be split *before* being taken in — and split along user value, not leftover capacity. |
| **T** | Testable | outcome is observable | The AC formalise this later; at story-writing time it's enough to be testable in principle. |

> [tip] INVEST is a lens, not a pass/fail gate. A story that passes all six but still feels wrong is still wrong — trust the instinct and flag it.

## [card zone-of-control] Zone of Control Frame (Gojko Adzic)

| code | name | desc | detail |
|------|------|------|--------|
| `Zone` | Zone of Control | the team ships it directly | Source code, schemas, infra config, internal tools, deployment pipeline. Bounded by team capacity. |
| `Sphere` | Sphere of Influence | the team affects but does not control | User behaviour, conversion, satisfaction, business outcomes. Movable, not guaranteed by a PR. |
| `External` | External Environment | beyond the team's reach | Regulators, vendor roadmaps, exchange rates, macroeconomics. Respond to, do not move. |
| **✓** | the **healthy pattern** | Need in Sphere, Deliverable in Zone | Story promises a Zone-of-Control change to move a Sphere-of-Influence outcome. Breaks of this rule produce the four anti-patterns below. |

## [card antipatterns] Anti-patterns from the Frame {accent: status-4xx}

| code | name | desc | detail |
|------|------|------|--------|
| 🚫 | Fake Story | need sits inside Zone of Control | *"QA can have automated DB restarts so I can test faster"* — internal tooling dressed as a story. **Fix:** track as a Task / Improvement Item. |
| 🚫 | Misleading Story | goal is a prescribed solution | *"Run query optimization on reports DB"* — the real need is *"finish month-end review on time"*. **Fix:** extract the underlying need; caching / pre-aggregation / async loading are now all on the table. |
| 🚫 | Dependency-Locked | deliverable is outside Zone of Control | *"Pay with Klarna"* before the contract is signed. Sits in *In Progress* until external unblocks — not agile. **Fix:** split. Keep the in-team abstraction as the story; track the integration separately. |
| 🚫 | Micro-Story | sliced too thin to carry user value | *"Click the Log-in button so my click is recorded"* — no business risk standalone. **Fix:** regroup with siblings under a value-carrying story. Click-tracking belongs in AC or analytics, not as its own story. |

> [warn] The skill's rule is **warn, don't block** — annotate the story and let the author decide. Most of these arise honestly in refinement.

## [card smells] Other Smells

| code | name | desc | detail |
|------|------|------|--------|
| `impl` | implementation-first phrasing | *Bad:* "add a `/api/v1/users` POST endpoint" | *Good:* "invite a new user, so they can start using the platform". Strip the verb-of-doing from the goal. |
| `why?` | missing `so that` | a story without a reason has no value hypothesis | If the reason is *"because the PO said so"*, reopen the conversation — the story is not ready. |
| `role=user` | generic role | *"As a user, I want…"* | Always prefer the most concrete role available: learner, course admin, operator, finance controller, accessibility auditor. |
| `merge` | story + AC merged into one blob | description contains *"Given … When … Then …"* | Skipping the 3Cs Confirmation layer and mixing two artifacts. Narrative on the card; AC in their own section. |
| `capacity` | sprint-capacity-driven splits | *"we have 3 points left, slice off something tiny"* | Breeds Micro-Stories. Split along a real user-value axis, not to fit the burndown. |
| `invented` | invented system components | rewrite mentions roles, screens, endpoints, integrations not in the input | Looks authoritative but silently expands scope. If the draft does not mention it, **ask** — do not guess. |

## [chapter] Splitting & Practice

## [card spidr] SPIDR + Extras (Mike Cohn)

| code | name | desc | detail |
|------|------|------|--------|
| **S** | Spike | research first when story fails INVEST-Estimable | Time-boxed; delivers *knowledge*, not the feature. *Ex:* "Spike: Klarna vs Afterpay vs Riverty SDKs for instalment checkout, 3 days." |
| **P** | Paths | split along workflow steps or decision branches | Each path is a separately demoable user journey. *Ex:* Search → Add to cart → Checkout → Confirmation email. |
| **I** | Interface | split by UI surface or channel | Web → mobile-web → native-app; read-view first, edit-view later; REST first, webhook second. |
| **D** | Data | split by data subset or variant | EUR-only first, multi-currency later; free-tier search first, premium filters second. |
| **R** | Rules | one complex business rule per story | One rule = one story = one testable outcome. *Ex:* loyalty discount → promo-code discount → campus-partner discount. |
| `CRUD` | Create / Read / Update / Delete | each as its own story when each carries user value | Most common in admin / CMS flows. Risks Micro-Stories — check each slice is genuinely user-valuable. |
| `happy/edges` | Happy path vs. edge cases | core flow first, error-handling + recovery as follow-ups | Often a better axis than specifying every error up front. |

> [tip] **Vertical, not horizontal.** A split is vertical when each resulting story still delivers end-to-end value. Splits by *technical layer* ("build the API", "build the UI", "write the tests") break INVEST-Valuable and INVEST-Independent at the same time — reject them in refinement.

## [card axis] Choosing a Splitting Axis

| name | desc |
|------|------|
| story not estimable, real effort unknown | **S**pike first |
| multi-step user journey | **P**aths |
| multiple channels / form factors | **I**nterface |
| clean data axis (region, currency, tier) | **D**ata |
| many independent business rules | **R**ules |
| admin-style work over the same entity | **CRUD** |
| core flow clear, errors would double scope | **Happy vs. edges** |

> [tip] When you split, return the resulting stories **and** a one-line note explaining the axis you used — so the reviewer can tell whether you picked the right one.

## [card refinement] Collaborative Refinement

| code | name | desc | detail |
|------|------|------|--------|
| `3-Amigos` | Three Amigos | Product + Dev + QA review the same feature | Three viewpoints: business intent, technical feasibility, testability. Minimum attendees: PO/BA + dev + tester. |
| `Example` | Example Mapping (Matt Wynne) | ~25-min workshop refining the story + seeding AC | 🟡 story · 🔵 rules (AC) · 🟢 examples · 🔴 questions. Ends with a shared map, or *"not ready"*. |
| `Story-Map` | Story Mapping (Jeff Patton) | user-journey × release-priority grid | Surfaces gaps, sequencing risks, slice candidates at backlog level — not per-story. |

## [chapter] Worked Examples

## [card ex-happy] Happy path — Reset password via emailed link

| code | name | desc | detail |
|------|------|------|--------|
| `Title` | Reset password via emailed link | concrete, user-visible outcome | Headline-style, ≤80 chars, no implementation verb. |
| `As a` | learner | named role | Generic "user" loses the mental model of who is affected. |
| `I can` | request a password reset and receive a link by email to set a new password | observable capability | "I can" forces an observable goal; "I want" drifts into wishful language. |
| `so that` | I can regain access to my account without contacting support | the value hypothesis | Removes a support burden; restores access for the learner. |
| `INVEST` | all six pass | I / N / V / E / S / T | The 24h link expiry, email template, and rate-limiting rules belong in **AC** — not in the story narrative. |

## [card ex-dep-locked] 🚫 Dependency-locked — Klarna instalments {accent: status-4xx}

| code | name | desc | detail |
|------|------|------|--------|
| `Title` | Pay course fee with Klarna instalments | concrete user outcome | Reads cleanly *as a story*, but… |
| `As a` | learner | named role | …the deliverable sits outside the team's Zone of Control. |
| `I can` | choose Klarna at checkout and split my course fee across instalments | observable capability | Team cannot ship until contract + SDK access exist. |
| `so that` | I can enrol without paying the full amount up front | value hypothesis | Lowers the enrolment barrier — a real Sphere-of-Influence outcome. |
| `INVEST` | I + E fail | blocked on signed contract & SDK access | **Fix:** split. Keep the in-team work as a *third-party instalment provider* abstraction at checkout; track the Klarna contract & integration as a separate dependency. |

> [warn] *Dependency-locked* stories sit in *In Progress* until the external unblocks — that is not agile, it is a blocked ticket with the wrong status.
