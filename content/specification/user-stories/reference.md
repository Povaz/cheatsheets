 # 1. User Stories

## 1.1. Definition

### 1.1.1. What a User Story Is

A **user story** is a short, user-facing description of a capability the system should offer, written from the perspective of the person who gets value from it. The purpose of a story is not to specify a solution — it is to **hold a place for a conversation** between the business, the developers, and the testers who will deliver it.

Ron Jeffries articulated this with the **[3Cs](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/)**:

- **Card** — the short written narrative (historically an index card), deliberately too small to contain the full specification. Just enough to remember what to discuss.
- **Conversation** — the shared design discussion the card prompts. This is where the actual requirements are discovered and agreed.
- **Confirmation** — the **Acceptance Criteria**: the observable conditions that tell everyone the story is "done". These are written separately (see [§2. Acceptance Criteria](acceptance-criteria-study.md)).

> A user story answers the question: *"What value, to which user, and why?"*
> It deliberately does **not** answer *how* the system will deliver it — that conversation happens at refinement, and the answer ends up in the Acceptance Criteria.

### 1.1.2. What a User Story Is Not

A story is **not**:

- **A task.** "Add a REST endpoint for password reset" is a task; the user story is "Reset password via emailed link."
- **An implementation note.** "Use Redis for session storage" belongs on a technical spike or ADR, not on a story card.
- **A definition of done.** Team-wide quality gates ("code reviewed", "deployed to staging") live in the **Definition of Done**, not in any specific story.
- **An internal tooling improvement with no user-visible outcome.** That is a Task or Improvement Item (see [§1.4.5 Fake Story](#145--fake-story)).

If the work has no end user — only an internal beneficiary — flag it and track it as a Task rather than contorting it into the story format.

### 1.1.3. When a Story Is Written

Stories emerge from **conversation during backlog refinement**, not from a Product Owner writing in isolation. The collaborative practices below produce stories that are richer, less biased, and more readily testable than any individual could draft alone.

- **[Three Amigos](https://johnfergusonsmart.com/three-amigos-requirements-discovery/)** — Product, Development, and QA meet to discuss a feature from all three viewpoints (business intent, technical feasibility, testability). The minimum attendees are a PO/BA, a developer, and a tester. *(Also used to generate AC; see [§2.1.3](acceptance-criteria-study.md).)*
- **[Example Mapping](https://cucumber.io/blog/bdd/example-mapping-introduction/)** *([Matt Wynne](https://medium.com/@mattwynne/introducing-example-mapping-42ccd15f8adf))* — a ~25-minute structured workshop that simultaneously refines the story and seeds its Acceptance Criteria. Four colored cards are used:
    - 🟡 **Yellow**: the story itself.
    - 🔵 **Blue**: the *rules* (acceptance criteria / constraints).
    - 🟢 **Green**: concrete *examples* illustrating each rule.
    - 🔴 **Red**: open *questions* blocking progress.
  The session ends when the team has a shared map, or decides the story is not ready.
- **[User Story Mapping](https://jpattonassociates.com/user-story-mapping/)** *(Jeff Patton)* — Arrange stories by user journey (horizontal) and release priority (vertical) to surface gaps, sequencing risks, and slice candidates.

## 1.2. Characteristics of Good Stories — INVEST

Bill Wake coined **[INVEST](https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/)** in 2003 as a quick quality check. A story that fails any letter is a candidate for refinement, splitting, or a clarifying conversation. *Not* a pass/fail gate — INVEST is a lens.

- **I — Independent.** The story can be built, tested, and demoed without depending on another unbuilt story in the same backlog. A story with a hard dependency is waiting, not ready.
- **N — Negotiable.** The story states a user goal, not a specific implementation. The team should be free to propose alternative solutions in refinement.
- **V — Valuable.** Someone observable — a learner, a course admin, a paying customer — gets measurable value. If the beneficiary is the delivery team itself, it is almost certainly a Task (see [§1.4.5 Fake Story](#145--fake-story)).
- **E — Estimable.** There is enough clarity for the team to ballpark effort. An un-estimable story may need a Spike (see [§1.5.2](#152-spidr)) to burn down uncertainty first.
- **S — Small.** Realistically completable in **1–2 days**, and certainly within a single sprint. Larger stories must be split before being taken in — see [§1.5 Splitting](#15-splitting-stories--spidr-and-friends).
- **T — Testable.** The outcome is observable. The Acceptance Criteria formalise this later; at story-writing time it is enough that the story is *testable in principle*.

A story that passes all six but still feels wrong is still wrong — trust the instinct and flag it.

## 1.3. Standard Format — Connextra

### 1.3.1. The Template

The house format is the **Connextra template**, developed around 2001:

```
**Title:** <short, concrete phrase — the feature or outcome, not the implementation>

**As a** <type of user>,
**I can** <some goal>,
**so that** <some reason>.
```

The Title reads like a headline (under ~80 characters) and is phrased around the user-visible outcome, not the technical task. *Good:* "Reset password via email link." *Bad:* "Add password-reset endpoint."

The narrative states **who**, **what**, and **why** — in that order. We use **"I can"** (not "I want" or "I need") by house convention. "I can" forces the author to describe an observable capability; "I want" drifts easily into wishful or vague language.

### 1.3.2. Where Each Piece Lives

| Artifact                     | Where it lives                                                         |
| ---------------------------- | ---------------------------------------------------------------------- |
| Title                        | Jira *Summary*                                                         |
| Connextra narrative          | Jira *Description*                                                     |
| INVEST / anti-pattern notes  | Review comment while the story is in-flight; stripped after acceptance |
| Acceptance Criteria          | Jira *Description* (separate section) — see [§2](acceptance-criteria-study.md) |
| Definition of Done           | Team-level, not per story                                              |

### 1.3.3. Role Granularity

Always prefer the most concrete role available. *"Learner", "course admin", "content editor", "finance controller"* beat the generic *"user"* every time, because the named role gives the team a mental model of who is actually affected by the change. Vague roles produce vague stories.

If the input does not name a role and you cannot infer it, **ask** — do not guess. Inventing a role shifts design decisions onto the ghost of whichever role you happened to pick.

## 1.4. Systems-Thinking and Anti-Patterns

Gojko Adzic's **["Zone of Control, Sphere of Influence"](https://gojko.net/2014/09/12/zone-of-control-vs-sphere-of-influence/)** frame is the sharpest diagnostic tool for story quality. It treats a delivery team as operating inside three concentric zones.

### 1.4.1. Zone of Control

All the things the team changes directly — source code, schemas, infra config, internal tools, the deployment pipeline. Changes here are bounded by the team's own capacity and calendar.

### 1.4.2. Sphere of Influence

Things the team affects but does not fully control: user behaviour, conversion rates, customer satisfaction, business outcomes. The team can move these numbers, but cannot guarantee them with a pull request.

### 1.4.3. External Environment

Things beyond the team's reach: regulatory changes, vendor roadmaps, exchange rates, macroeconomics. The team cannot move these, only respond to them.

### 1.4.4. The Healthy Pattern

> A healthy story has its **User Need in the Sphere of Influence** and its **Deliverable in the Zone of Control**.

That is: the story promises to change something the team can ship (Zone of Control) in order to move something the team cares about (Sphere of Influence). When a story breaks this pattern, it usually falls into one of four traps. The skill's rule is **warn, don't block** — annotate the story with a ⚠ note and let the user decide.

### 1.4.5. 🚫 Fake Story

The user need sits **inside the Zone of Control** — there is no business risk, only an internal chore dressed as a story.

- **Example:** *"As a QA, I can have automated DB restarts, so that I can test faster."*
- **Why flag:** this is a tooling improvement, not a user-facing feature. It belongs as a Task or Improvement Item.
- **Fix:** rewrite as a Task, or ask *"who is the actual end user, and what observable business value does this deliver to them?"*

### 1.4.6. 🚫 Misleading Story (Solution Trap)

The author has prescribed a specific technical solution as the *goal*, rather than stating the underlying user need.

- **Example:** *"As an operator, I can run query optimization on the reports DB, so that monthly reports load faster."*
- **Why flag:** "query optimization" is a solution. The real need might be *"finish month-end review on time"* — which could be solved by caching, pre-aggregation, async loading, or indeed query optimisation. Prescribing the solution in the story removes the team's freedom to propose a better one.
- **Fix:** extract the underlying need, then let refinement propose the solution. A Spike may be needed if the root cause is unclear.

### 1.4.7. 🚫 Dependency-Locked Story

The **Deliverable sits outside the Zone of Control** — blocked on a third-party vendor, a cross-team API that has not yet been contracted, or an artifact another team owns.

- **Example:** *"As a learner, I can pay with Klarna, so that I can split my course fee."* — when the Klarna contract is not yet signed.
- **Why flag:** the team cannot deliver this, no matter how well it is written. It sits in *In Progress* until the external dependency unblocks — which is not agile, it is a blocked ticket with the wrong status.
- **Fix:** split. Keep the in-team work as the story (e.g., *"third-party instalment provider"* abstraction at checkout); track the external dependency as a separate work item.

### 1.4.8. 🚫 Micro-Story

A large business story was sliced so thin that a sub-story no longer carries any business risk on its own. It is still inside the Zone of Control, but it has lost its link to user value.

- **Example:** *"As a learner, I can click the 'Log in' button, so that my click is recorded."* (split off from a full login story).
- **Why flag:** acceptable as short-term sequencing; in mid-to-long-term plans, it should be rolled back into a story that still carries user-visible value. Micro-stories clutter the backlog and inflate velocity without shipping outcomes.
- **Fix:** regroup with siblings under a single user-value-carrying story. Click-tracking alone belongs in AC or analytics instrumentation, not as its own story.

## 1.5. Splitting Stories — SPIDR and Friends

### 1.5.1. Why Split Vertically, Not Horizontally

A split is **vertical** when each resulting story still delivers end-to-end user value on its own. A split is **horizontal** when it divides work by technical layer (*"build the API", "build the UI", "write the tests"*) — each layer is useless to the user in isolation. Horizontal splits break INVEST-Valuable and INVEST-Independent at the same time and should be rejected in refinement.

### 1.5.2. SPIDR

Mike Cohn's **[SPIDR](https://www.mountaingoatsoftware.com/blog/five-simple-but-powerful-ways-to-split-user-stories)** is the canonical taxonomy:

- **S — Spike.** Time-box a research spike first when the story fails INVEST-Estimable (unknown tech, unclear domain). A spike delivers *knowledge*, not the feature. Split the feature out once the spike lands.
  - *Example:* "Spike: evaluate Klarna vs. Afterpay vs. Riverty SDKs for instalment checkout, 3 days."
- **P — Paths.** Split along workflow steps or decision branches. Each path is a separately demoable user journey.
  - *Example:* "Search" → "Add to cart" → "Checkout" → "Confirmation email."
- **I — Interface.** Split by UI surface or channel.
  - *Example:* Web checkout → mobile-web checkout → native-app checkout; or read-view first, edit-view later; or REST endpoint first, webhook second.
- **D — Data.** Split by data subset or variant.
  - *Example:* EUR accounts first, multi-currency later; free-tier search first, premium filters second.
- **R — Rules.** Extract each complex business rule into its own story: one rule = one story = one testable outcome.
  - *Example:* "Apply standard 10% loyalty discount" → "Apply stacked promo-code discount" → "Apply campus partner discount."

### 1.5.3. Extras Kept Alongside SPIDR

- **CRUD** — Create / Read / Update / Delete as separate stories when each carries its own user value. Most commonly appears in admin or content-management flows. A pure CRUD split risks producing Micro-Stories; always check that each CRUD slice is genuinely user-valuable on its own.
- **Happy path vs. edge cases** — deliver the core flow first, then error handling, validation, and recovery as follow-up stories. This is often a better slicing axis than trying to specify every error up-front.

### 1.5.4. Choosing an Axis

| Signal in the story                                                 | Prefer              |
| ------------------------------------------------------------------- | ------------------- |
| Story fails INVEST-Estimable — real effort unknown                  | **S**pike first     |
| Multi-step user journey ("search → filter → buy")                   | **P**aths           |
| Different channels or form factors (web / mobile / API)             | **I**nterface       |
| Scope collapses cleanly along a data axis (region, currency, tier)  | **D**ata            |
| Multiple independent business rules in one story                    | **R**ules           |
| Admin-style work touching the same entity from multiple operations  | CRUD                |
| Core flow is clear; error handling would double the scope           | Happy vs. edges     |

When you split, return the resulting stories **and** a one-line note explaining the axis you used, so the reviewer can tell whether you picked the right one.

## 1.6. Worked Examples

Each example shows the raw input, the produced story, its INVEST block, and — where applicable — the systems-thinking warning.

### 1.6.1. Happy Path — Reset Password via Emailed Link

**Input (raw requirement):**
> Users should be able to recover their password when they forget it. Send an email with a link, the link expires after 24h, and they can set a new password.

**Output:**

**Title:** Reset password via emailed link

**As a** learner,
**I can** request a password reset and receive a link by email to set a new password,
**so that** I can regain access to my account without contacting support.

INVEST check:
- **I**ndependent — pass: no dependency on an unbuilt story in this backlog; assumes the standard auth/account foundation exists.
- **N**egotiable — pass: the narrative states the user goal, not a specific implementation (email provider, token format, UI).
- **V**aluable — pass: a locked-out learner regains access without a support ticket.
- **E**stimable — pass: familiar pattern, scope is bounded to request + email + reset.
- **S**mall — pass: fits within a sprint; the three sub-steps are tight.
- **T**estable — pass: *"learner requests reset → receives email → sets new password → logs in"* is a single observable scenario.

*The 24h link expiry is an acceptance-criterion concern, not a story concern. It belongs in AC alongside the email template and rate-limiting rules, not in the narrative.*

### 1.6.2. 🚫 Fake Story — Test-DB Reset Script

**Input:**
> As a developer, I want a script that resets the test database, so that I can run tests faster.

**Output:**

**Title:** Test-DB reset script (flagged — not a user story)

**As a** developer,
**I can** reset the test database with a script,
**so that** I can run tests faster.

INVEST check:
- **I**ndependent — pass: standalone tooling change.
- **N**egotiable — fail: the goal *is* the implementation ("a script"); nothing left to negotiate.
- **V**aluable — fail: no end-user-visible value; benefit sits inside the team.
- **E**stimable — pass: scope is narrow.
- **S**mall — pass: a script, not a feature.
- **T**estable — pass: the script either resets the DB or it doesn't.

⚠ **Fake Story** — the need (*"run tests faster"*) sits inside the Zone of Control. Track as a Task or Improvement Item. If the team insists on keeping it as a story, the next question is: *who is the actual end user, and what observable business value does this deliver to them?*

### 1.6.3. 🚫 Misleading Story — Report Performance

**Input:**
> As an operator, I can run query optimization on the reports DB, so that monthly reports load faster.

**Output:**

**Title:** Monthly report loads without manual intervention (needs problem clarification)

**As an** operator,
**I can** open the monthly report and have it render without waiting on my own action,
**so that** I can complete month-end review on time.

INVEST check:
- **I**ndependent — pass.
- **N**egotiable — pass (after rewrite): the goal is now an outcome; caching, pre-aggregation, or async loading are all on the table.
- **V**aluable — pass: month-end review finishes on time.
- **E**stimable — fail: the underlying cause of slowness is not established.
- **S**mall — unknown: depends on root cause.
- **T**estable — pass in principle.

⚠ **Misleading Story** — the original `<goal>` was a prescribed solution ("query optimization"). The rewrite surfaces the underlying need; a Spike may be required before the story is estimable (see [§1.5.2 — S](#152-spidr)).

### 1.6.4. 🚫 Dependency-Locked Story — Klarna Instalments

**Input:**
> As a learner, I can pay my course fee with Klarna, so that I can split the payment across instalments.

**Output:**

**Title:** Pay course fee with Klarna instalments (dependency-locked)

**As a** learner,
**I can** choose Klarna at checkout and split my course fee across instalments,
**so that** I can enrol without paying the full amount up front.

INVEST check:
- **I**ndependent — fail: blocked on a signed Klarna contract and SDK access, neither of which the team owns.
- **N**egotiable — pass: outcome-based.
- **V**aluable — pass: lowers the enrolment barrier for price-sensitive learners.
- **E**stimable — fail: SDK surface and compliance requirements unknown.
- **S**mall — unknown: likely multi-sprint once unblocked.
- **T**estable — pass in principle.

⚠ **Dependency-locked** — deliverable requires the Klarna contract and SDK. Split: keep the in-team work as the story (a *"third-party instalment provider"* abstraction at checkout); track the Klarna integration and contract as a separate dependency.

### 1.6.5. 🚫 Micro-Story — Log-In Button Click

**Input (split off a larger login story):**
> As a learner, I can click the "Log in" button, so that my click is recorded.

**Output:**

**Title:** Log-in button click (flagged — micro-story)

**As a** learner,
**I can** click the "Log in" button,
**so that** my click is recorded.

INVEST check:
- **I**ndependent — pass: trivially isolated.
- **N**egotiable — fail: the goal is one UI event; nothing to negotiate.
- **V**aluable — fail: clicking a button is not a user outcome; the learner still cannot log in.
- **E**stimable — pass.
- **S**mall — pass: arguably too small.
- **T**estable — pass.

⚠ **Micro-Story** — no standalone business risk. Regroup with sibling stories under a single user-value-carrying story (e.g., *"Log in with email and password, so that I can access my enrolled courses"*). Click-tracking alone belongs in AC or analytics instrumentation.

## 1.7. Story Writing in Practice

Stories reach the backlog from several directions. The input flow dictates how much of the writing is authoring versus rewriting, but the output format (Title + Connextra + INVEST block) is always the same.

- **From scratch — raw functional requirements.** Extract distinct user-facing capabilities from the prose. Identify the user role(s). Produce one story per capability. If the source is genuinely ambiguous about who the user is or what system they act within, **ask**; do not invent.
- **From rough story drafts.** Preserve the author's intent. Rewrite only what is necessary to match format, fix anti-patterns, or split oversized stories. Explain each delta inline next to the story it applies to, so the reviewer can scan story-by-story rather than hunt through a trailing summary.
- **From a Confluence page.** Read the page with `mcp__claude_ai_Atlassian__getConfluencePage` (or locate it first with `mcp__claude_ai_Atlassian__searchConfluenceUsingCql`) and treat its content as raw requirements or draft stories per the rules above. Do not write improved stories back to the page until the author has reviewed the draft.
- **From existing Jira issues.** Read them with `mcp__claude_ai_Atlassian__getJiraIssue` (or locate them via `mcp__claude_ai_Atlassian__searchJiraIssuesUsingJql`). Treat the current *Summary + Description* as draft material. Never update Jira silently — always show the proposed changes first. Creation and updates (`mcp__claude_ai_Atlassian__createJiraIssue` / `mcp__claude_ai_Atlassian__editJiraIssue`) are a separate, explicit step.

## 1.8. Anti-Patterns Beyond Systems-Thinking

🚫 **Implementation-first phrasing.**
*Bad:* "As an admin, I can add a `/api/v1/users` POST endpoint, so that new users can be created."
*Good:* "As an admin, I can invite a new user, so that they can start using the platform."

🚫 **Missing `so that`.**
A story without a reason is a story without a value hypothesis. If the reason is *"because the PO said so"*, re-open the conversation — the story is not ready.

🚫 **Role = "user".**
Generic roles produce generic stories. Name the role (learner, course admin, operator, finance controller, accessibility auditor).

🚫 **Story + AC merged into one blob.**
The narrative belongs on the card; the AC belong in the dedicated AC section (see [§2](acceptance-criteria-study.md)). A story whose description contains *"Given… When… Then…"* is skipping the 3Cs' Confirmation layer and mixing two artifacts.

🚫 **Stories written to match sprint capacity.**
Splitting a story because *"we have 3 points left"* breeds Micro-Stories (see [§1.4.8](#148--micro-story)). Split along a real user value axis, not to fit capacity.

🚫 **Invented system components.**
Referencing user roles, screens, endpoints, integrations, or concepts that do not appear in the input makes the rewrite look authoritative while silently expanding scope. If the draft does not mention it, **ask**.

## 1.9. Bibliography

- **Mike Cohn** — *User Stories Applied: For Agile Software Development*, Addison-Wesley, 2004. The canonical book-length treatment.
- **Mike Cohn** — ["SPIDR: Five Simple but Powerful Ways to Split User Stories"](https://www.mountaingoatsoftware.com/blog/five-simple-but-powerful-ways-to-split-user-stories), Mountain Goat Software.
- **Bill Wake** — ["INVEST in Good Stories, and SMART Tasks"](https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/), XP123, 2003. The original INVEST article.
- **Gojko Adzic** — ["Zone of Control, Sphere of Influence"](https://gojko.net/2014/09/12/zone-of-control-vs-sphere-of-influence/), 2014. The systems-thinking frame used in [§1.4](#14-systems-thinking-and-anti-patterns).
- **Gojko Adzic & David Evans** — *Fifty Quick Ideas to Improve your User Stories*, 2013. Source of the Fake / Misleading / Micro-Story anti-patterns.
- **Ron Jeffries** — ["Essential XP: Card, Conversation, Confirmation"](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/), 2001. The 3Cs.
- **Jeff Patton** — *User Story Mapping*, O'Reilly, 2014. The companion technique for backlog-level storytelling.
- **Matt Wynne** — ["Introducing Example Mapping"](https://cucumber.io/blog/bdd/example-mapping-introduction/), Cucumber Blog.
- **Agile Alliance** — ["INVEST" glossary entry](https://agilealliance.org/glossary/invest/).
- **LogRocket** — ["Writing meaningful user stories with the INVEST principle"](https://blog.logrocket.com/product-management/writing-meaningful-user-stories-invest-principle/).
- **Cucumber.io** — [User Story reference](https://cucumber.io/docs/terms/user-story/).

---
