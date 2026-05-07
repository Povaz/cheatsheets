# Reference: Specification — Acceptance Criteria

Consolidated from `sources.yml`: a single source — the author's compressed study notes on Acceptance Criteria.

## 2.1. Definition

### 2.1.1. What Acceptance Criteria Are

**Acceptance Criteria (AC)** are the set of conditions a user story must satisfy to be accepted by the Product Owner and considered complete. Each criterion is a statement with a **binary, unambiguous pass/fail outcome** that specifies both functional and non-functional expectations.

They serve three complementary purposes:

1. **Shared understanding** — Align developers, testers, and the business on *what "done" means* for this specific story before implementation begins.
2. **Scope boundary** — Define the story's edges, protecting it from scope creep and clarifying what is *out of scope*.
3. **Test contract** — Provide the raw material for acceptance tests (manual or automated), which in turn act as executable documentation of the system's behavior.

> Acceptance Criteria answer the question: *"How will we know this story works?"*
> They are distinct from the **Definition of Done** (team-wide quality gates that apply to every story, e.g., "code reviewed", "deployed to staging") and from the **Definition of Ready** (entry criteria before a story is picked up).

### 2.1.2. Characteristics of Good Acceptance Criteria

Good AC are:

- **Testable** — each criterion can be objectively verified as pass or fail.
- **Concise and unambiguous** — plain business language, no room for interpretation.
- **Independent of implementation** — they describe *what* the system does, never *how*.
- **User- or outcome-centric** — written from the perspective of the observable behavior.
- **Measurable** — vague terms (*"fast"*, *"secure"*, *"intuitive"*) are replaced with numbers, ranges, or concrete thresholds.
- **Right-sized** — most healthy stories have **1–3 criteria**; if you exceed 4–5, the story is probably too large and should be split.

These characteristics operationalize the **T** (*Testable*) in **INVEST** and the **M** (*Measurable*) in **SMART**. A story without clear AC cannot be estimated, demoed, or accepted — it is, by definition, not ready.

### 2.1.3. When to Write Acceptance Criteria

AC emerge from **conversation**, not from a single author writing in isolation. The collaborative practices below produce criteria that are richer, less biased, and more readily testable than any individual could draft alone.

- **[Three Amigos](https://johnfergusonsmart.com/three-amigos-requirements-discovery/)** — Product, Development, and QA meet to discuss a story from all three viewpoints (business intent, technical feasibility, testability). The minimum attendees are a PO/BA, a developer, and a tester.
- **[Example Mapping](https://cucumber.io/blog/bdd/example-mapping-introduction/)** *([Matt Wynne](https://medium.com/@mattwynne/introducing-example-mapping-42ccd15f8adf))* — A ~25-minute structured workshop using four colored cards:
    - 🟡 **Yellow**: the story itself.
    - 🔵 **Blue**: the *rules* (acceptance criteria / constraints).
    - 🟢 **Green**: concrete *examples* that illustrate each rule.
    - 🔴 **Red**: open *questions* that block progress and must be resolved.
  The session ends when the team has a shared map or decides the story is not ready.
- **[Specification by Example](https://www.thoughtworks.com/en-us/insights/blog/applying-bdd-acceptance-criteria-user-stories)** *(Gojko Adzic)* — Derive AC by asking: *"Show me the simplest concrete example of what we want."* Examples become the canonical specification and later the automated acceptance tests.

## 2.2. Standard Formats

Match the format to the nature of the story. Using a heavyweight format on a trivial story is noise; using a lightweight format on a complex workflow loses fidelity.

### 2.2.1. Rule-Oriented Format (Checklist)

- **Best for:** UI tweaks, static content, copy changes, simple configuration, visual-only stories.
- **Structure:** A bulleted or checkbox list of assertions.
- **Example:**
  - [ ] The search bar is pinned to the top navigation on all pages.
  - [ ] The placeholder text reads "Search by ID...".
  - [ ] The "Search" button is disabled until at least one character is entered.
  - [ ] Input is trimmed of leading/trailing whitespace before submission.

### 2.2.2. Scenario-Oriented Format (Gherkin / BDD)

- **Best for:** Business logic, workflows, APIs, calculations, state transitions — anything where context and outcome matter.
- **Structure:** **Given / When / Then**, the syntactic heart of Gherkin, which maps directly to automated tests in Cucumber, SpecFlow, Behave, pytest-bdd, etc.
    - **Given** — the initial context or pre-conditions.
    - **When** — a *single* triggering action.
    - **Then** — the observable outcome(s).
    - **And / But** — chained clauses within any of the above.
- **Example:**
  ```gherkin
  Scenario: Customer pays with a valid credit card
    Given the customer has items worth €120 in the cart
      And the customer has entered a valid credit card
    When the customer confirms the payment
    Then the order is created with status "paid"
      And a confirmation email is sent to the customer
  ```

#### 2.2.2.1. Gherkin Power Tools

- **`Feature` narrative** — a top-of-file prose block describing the broader capability the scenarios support. See [Cucumber — User Story reference](https://cucumber.io/docs/terms/user-story/).
- **`Background`** — pre-conditions shared across every scenario in a feature file; keeps scenarios DRY.
- **`Scenario Outline` + `Examples`** — run the same scenario against a data table to cover equivalence classes without duplication.

  ```gherkin
  Feature: Tiered discount at checkout
    To reward loyal customers, the checkout applies a discount
    based on the customer's loyalty tier at the time of purchase.

    Background:
      Given the discount engine is online
        And the catalogue contains an item priced at €100

    Scenario Outline: Discount by customer tier
      Given a customer with tier "<tier>"
      When they purchase the item
      Then the final price is "<final_price>"

      Examples:
        | tier     | final_price |
        | standard | €100        |
        | silver   | €90         |
        | gold     | €80         |
  ```

### 2.2.3. Choosing Between Formats

| Signal in the story                                  | Prefer |
| ---------------------------------------------------- | ------ |
| Static layout, copy, visual polish                   | Checklist |
| Conditional logic, multiple paths, state transitions | Gherkin |
| Calculations, pricing, rules engines                 | Gherkin (with `Scenario Outline`) |
| Third-party integration behavior                     | Gherkin |
| Pure a11y / compliance assertions                    | Checklist (with measurable NFRs) |

The two formats can coexist within the same story — a Gherkin block for the core flow, a checklist for peripheral UI assertions.

## 2.3. The Three Dimensions of Quality

A complete set of AC covers all three dimensions. Teams that cover only the Happy Path consistently ship bugs in production.

### 2.3.1. Happy Path (Positive Testing)

The ideal flow where inputs are valid and the system behaves as intended. **We write these in Gherkin** (see §2.2.2), because the Given/When/Then structure makes the expected flow directly executable as a BDD scenario.

```gherkin
Scenario: Customer pays with a valid credit card
  Given the customer has a valid, unexpired credit card
  When they confirm a €120 payment
  Then the payment succeeds
    And the order is marked "paid"
```

### 2.3.2. Sad Path (Negative Testing & Edge Cases)

Validation boundaries, invalid inputs, external failures, race conditions, and recovery behavior. **We write these in Gherkin** as well — each failure mode becomes its own scenario so the triggering context and observable outcome stay explicit and independently testable.

```gherkin
Scenario: Expired card is declined
  Given the customer has entered an expired credit card
  When they confirm a €120 payment
  Then the transaction is declined with error code "PAYMENT_EXPIRED"
    And no charge is recorded

Scenario: Gateway timeout is recoverable
  Given the payment gateway is unresponsive
  When the customer confirms a €120 payment
  Then a retryable error is shown after 10 s
    And no charge is recorded

Scenario: Empty cart cannot reach checkout
  Given the customer's cart contains 0 items
  When the customer navigates to the checkout page
  Then they are redirected to the cart page
```

### 2.3.3. Non-Functional Requirements (NFRs)

Cross-cutting quality attributes — often framed with **[FURPS+](https://en.wikipedia.org/wiki/FURPS)**: **F**unctionality, **U**sability, **R**eliability, **P**erformance, **S**upportability, **+** constraints (design, implementation, interface, physical, legal/compliance). Every NFR must be **measurable**; replace adjectives with numbers.

**We write NFRs as a Checklist** (see §2.2.1), not in Gherkin. NFRs are declarative thresholds that apply across the whole system or feature — they have no single triggering action, so the Given/When/Then shape adds ceremony without expressing the requirement any more clearly. A checklist of measurable assertions is the right fit.

- **Functionality** *(security, auditing, capability coverage)*: *"Credit card numbers are masked (`****-****-****-1234`) in logs, error messages, and database records."*
- **Usability** *(ergonomics, accessibility, learnability)*: *"The checkout page conforms to WCAG 2.1 Level AA and is fully operable via keyboard only."*
- **Reliability** *(availability, MTBF, recoverability)*: *"The order service sustains 99.9% monthly availability, with an RTO of 15 minutes after any single-zone failure."*
- **Performance** *(response time, throughput, resource use)*: *"Search results render in under 200 ms for the 95th percentile under the nominal load of 1,000 RPS."*
- **Supportability** *(maintainability, testability, configurability)*: *"All outbound calls emit structured logs with a correlation ID, and feature flags for this module are togglable without redeploy."*
- **+ Constraint — Legal/Compliance** *(regulatory, contractual, physical)*: *"All personal data at rest is encrypted with AES-256, per GDPR Art. 32."*

## 2.4. Anti-Patterns

🚫 **Prescribing the implementation.**
*Bad:* "The backend caches the result in Redis for 60 seconds."
*Good:* "Repeated identical searches within 60 seconds return consistent results with perceived latency under 50 ms."

🚫 **Vague, unmeasurable language.**
*Bad:* "The page should be fast and user-friendly."
*Good:* "The page reaches *First Contentful Paint* in under 1.5 s on a 3G-Fast profile."

🚫 **Too many criteria.**
More than ~5 criteria is a signal the story is actually several stories in disguise. Split it.

🚫 **Conflating AC with the Definition of Done.**
*"Code is peer-reviewed"* is not an AC — it's a DoD item. AC are story-specific; DoD is team-wide.

🚫 **Covering only the Happy Path.**
A story without sad-path or NFR criteria is a half-specified story.

🚫 **Writing AC after implementation.**
AC drive the build; they are not retroactive documentation.

🚫 **Multi-trigger `When` clauses.**
`When` must describe exactly one action. If two things happen, split into two scenarios.

## 2.5. Worked Example — From Gherkin to Executable Python

The `.feature` file from §2.2.2 is **deliberately language-agnostic**: it's the contract everyone reads. To actually *run* it as a test, we pair each step sentence with a **step definition** — a small Python function that performs the step against the real system. Two Python frameworks implement this pairing:

- **[`behave`](https://behave.readthedocs.io/)** — a direct port of Cucumber. Dedicated runner (`behave`), hooks in `features/environment.py`, and a per-scenario `context` object that carries state between steps.
- **[`pytest-bdd`](https://pytest-bdd.readthedocs.io/)** — the same Gherkin, wired into `pytest`. Step definitions become pytest functions; you get fixtures, parametrization, and the rest of the pytest ecosystem for free.

**Same `.feature` file, same scenarios, different glue layer.** Pick based on your team's existing test stack: `behave` if you think in Cucumber terms, `pytest-bdd` if your repo is already pytest-first.

### 2.5.1. The Feature File *(shared by both frameworks)*

```gherkin
# features/promo_code.feature
Feature: Apply a promo code at checkout
  Registered customers should be able to redeem valid promo codes
  for a discount; invalid or expired codes must be rejected without
  altering the cart total.

  Background:
    Given a registered customer is logged in
      And their cart contains an item priced at €100

  Scenario: Valid promo code applies a percentage discount
    Given the promo code "SPRING10" grants 10% off and is active
    When the customer applies the promo code "SPRING10"
    Then the cart total becomes €90
      And the applied discount is labelled "SPRING10 (-10%)"

  Scenario: Expired promo code is rejected
    Given the promo code "WINTER20" is expired
    When the customer applies the promo code "WINTER20"
    Then the cart total remains €100
      And an error "This promo code has expired." is shown
```

### 2.5.2. Option A — `behave`

**Layout:**

```
features/
├── environment.py              # hooks (Before/After)
├── promo_code.feature
└── steps/
    └── promo_code.py           # step definitions
```

**Hooks — `features/environment.py`:**

```python
from checkout.service import Checkout, PromoService

def before_scenario(context, scenario) -> None:
    context.promos = PromoService()
    context.checkout = Checkout(promos=context.promos)
```

**Step definitions — `features/steps/promo_code.py`:**

```python
from behave import given, when, then
from behave.runner import Context


@given("a registered customer is logged in")
def step_login(context: Context) -> None:
    context.customer = context.checkout.login_as(user_id=42, registered=True)


@given("their cart contains an item priced at €{price:d}")
def step_add_item(context: Context, price: int) -> None:
    context.checkout.add_item(sku="SKU-1", price=price)


@given('the promo code "{code}" grants {percent:d}% off and is active')
def step_register_active(context: Context, code: str, percent: int) -> None:
    context.promos.register(code=code, percent=percent, active=True)


@given('the promo code "{code}" is expired')
def step_register_expired(context: Context, code: str) -> None:
    context.promos.register(code=code, percent=20, active=False)


@when('the customer applies the promo code "{code}"')
def step_apply(context: Context, code: str) -> None:
    context.result = context.checkout.apply_promo(code)


@then("the cart total becomes €{expected:d}")
@then("the cart total remains €{expected:d}")
def step_total(context: Context, expected: int) -> None:
    assert context.checkout.total() == expected


@then('the applied discount is labelled "{label}"')
def step_label(context: Context, label: str) -> None:
    assert context.checkout.discount_label() == label


@then('an error "{message}" is shown')
def step_error(context: Context, message: str) -> None:
    assert context.result.error == message
```

**Run:**

```bash
behave
```

Key mechanics:
- **`{code}` and `{price:d}`** use the `parse` mini-language — `:d` coerces to `int`; no suffix means `str`. The role is identical to Cucumber Expressions in JS/Java.
- **`context`** is `behave`'s *World* — auto-reset per scenario by `before_scenario`.
- **Stacked `@then` decorators** let synonymous sentences (*"becomes"*, *"remains"*) share one implementation.

### 2.5.3. Option B — `pytest-bdd`

**Layout:**

```
tests/
├── features/
│   └── promo_code.feature      # reused verbatim
└── test_promo_code.py          # scenarios + step defs as pytest functions
```

**Step definitions — `tests/test_promo_code.py`:**

```python
import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from checkout.service import Checkout, PromoService

scenarios("features/promo_code.feature")


@pytest.fixture
def promos() -> PromoService:
    return PromoService()


@pytest.fixture
def checkout(promos: PromoService) -> Checkout:
    return Checkout(promos=promos)


@given("a registered customer is logged in")
def _login(checkout: Checkout) -> None:
    checkout.login_as(user_id=42, registered=True)


@given(parsers.parse("their cart contains an item priced at €{price:d}"))
def _add_item(checkout: Checkout, price: int) -> None:
    checkout.add_item(sku="SKU-1", price=price)


@given(parsers.parse('the promo code "{code}" grants {percent:d}% off and is active'))
def _register_active(promos: PromoService, code: str, percent: int) -> None:
    promos.register(code=code, percent=percent, active=True)


@given(parsers.parse('the promo code "{code}" is expired'))
def _register_expired(promos: PromoService, code: str) -> None:
    promos.register(code=code, percent=20, active=False)


@when(parsers.parse('the customer applies the promo code "{code}"'), target_fixture="result")
def _apply(checkout: Checkout, code: str):
    return checkout.apply_promo(code)


@then(parsers.parse("the cart total becomes €{expected:d}"))
@then(parsers.parse("the cart total remains €{expected:d}"))
def _total(checkout: Checkout, expected: int) -> None:
    assert checkout.total() == expected


@then(parsers.parse('the applied discount is labelled "{label}"'))
def _label(checkout: Checkout, label: str) -> None:
    assert checkout.discount_label() == label


@then(parsers.parse('an error "{message}" is shown'))
def _error(result, message: str) -> None:
    assert result.error == message
```

**Run:**

```bash
pytest
```

Key mechanics that differ from `behave`:
- **Scenarios are registered** with `scenarios("features/promo_code.feature")` — pytest discovers them automatically as if each were a `test_*` function.
- **State lives in pytest fixtures**, not a `context` object. Fixtures are injected into any step that declares them as parameters — a cleaner mapping for codebases that already use pytest fixtures heavily.
- **`target_fixture="result"`** on the `@when` step publishes its return value as a fixture usable by downstream `@then` steps, replacing `context.result`.
- You get **pytest markers, parametrization, xdist parallelism, and plugins** out of the box.

### 2.5.4. Which to Choose

| Signal | Prefer |
| --- | --- |
| Team already thinks in Cucumber/Gherkin terms | `behave` |
| Repo is already pytest-first with existing fixtures | `pytest-bdd` |
| You need parallel execution, rich plugins, or pytest-native reports | `pytest-bdd` |
| You want the *dedicated* BDD runner and tooling ecosystem | `behave` |

The `.feature` file — the artifact the business reads and approves — is **identical** in both cases. Switching frameworks later means rewriting step definitions, not acceptance criteria.

## 2.6. Bibliography

- **Mike Cohn** — *User Stories Applied: For Agile Software Development*, Addison-Wesley, 2004. Canonical reference for AC as "notes on what the story must do to be accepted."
- **Gojko Adzic** — *Specification by Example*, Manning, 2011. Grounds AC in executable, example-driven specifications.
- **Gojko Adzic & David Evans** — *Fifty Quick Ideas to Improve your User Stories*, 2013.
- **John Ferguson Smart** — *BDD in Action*, 2nd ed., Manning, 2023. Definitive guide to executable specifications.
- **Matt Wynne** — ["Introducing Example Mapping"](https://cucumber.io/blog/bdd/example-mapping-introduction/), Cucumber Blog.
- **Dave Farley** — ["Acceptance Testing Is the FUTURE of Programming"](https://www.youtube.com/watch?v=NsOUKfzyZiU), *Continuous Delivery* channel (YouTube).
- **Agile Alliance** — ["INVEST" glossary entry](https://agilealliance.org/glossary/invest/).
- **Cucumber.io** — [User Story reference](https://cucumber.io/docs/terms/user-story/).
- **Thoughtworks** — ["Applying BDD acceptance criteria in user stories"](https://www.thoughtworks.com/en-us/insights/blog/applying-bdd-acceptance-criteria-user-stories).
