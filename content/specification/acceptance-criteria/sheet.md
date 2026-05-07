---
title: Acceptance Criteria
subtitle: pass/fail behavioral contract for a User Story — formats, dimensions, BDD glue
---

## [chapter] Introduction {type: vertical}

## [text purpose] Purpose & shape

- **Definition** — a set of binary, unambiguous **pass/fail** conditions a User Story must satisfy to be accepted; covers functional and non-functional expectations.
- **Three jobs** — *shared understanding* (what "done" means) · *scope boundary* (what's out of scope) · *test contract* (raw material for acceptance tests, manual or automated).
- **Not the same as** — the **Definition of Done** (team-wide quality gates: code-reviewed, deployed-to-staging) or the **Definition of Ready** (entry criteria before a story is picked up).
- **The question they answer** — *"How will we know this story works?"*

## [card characteristics] Characteristics of Good AC

| code | name | desc | detail |
|------|------|------|--------|
| `T` | Testable | objectively verifiable as pass or fail | A criterion that can't be checked isn't a criterion — it's an aspiration. Operationalizes the **T** in INVEST. |
| `U` | Concise & unambiguous | plain business language; no room for interpretation | If two readers disagree on what "passes" means, rewrite the AC before any code is written. |
| `I` | Implementation-independent | describes *what* the system does, never *how* | "Returns results in <50 ms" is an AC. "Caches in Redis for 60 s" is a design note that belongs in tech docs. |
| `O` | User- / outcome-centric | written from the perspective of observable behavior | The AC is what someone outside the team — a tester, a PO, a customer — would describe as "the thing working". |
| `M` | Measurable | vague terms (*"fast"*, *"secure"*, *"intuitive"*) → numbers, ranges, thresholds | The **M** in SMART. *"Fast"* starts a conversation; *"p95 < 200 ms at 1 000 RPS"* ends one. |
| `R` | Right-sized | most healthy stories have **1–3** AC; > 5 ⇒ split | A long AC tail usually means two stories pretending to be one. Treat the count as a smell, not a target. |

> [tip] Together these operationalize **T** (Testable) in INVEST and **M** (Measurable) in SMART. A Story without clear AC cannot be estimated, demoed, or accepted — by definition, not ready.

## [card collaboration] Collaborative Practices

| code | name | desc | detail |
|------|------|------|--------|
| `3A` | [Three Amigos](https://johnfergusonsmart.com/three-amigos-requirements-discovery/) | Product + Dev + QA discuss a story from all three viewpoints | Minimum attendees: a PO/BA, a developer, a tester. Catches business-intent / feasibility / testability gaps before any code is written. |
| `EM` | [Example Mapping](https://cucumber.io/blog/bdd/example-mapping-introduction/) | ~25-min workshop with four colored cards | 🟡 Yellow = the Story · 🔵 Blue = rules / AC · 🟢 Green = concrete examples per rule · 🔴 Red = blocking questions. Ends when the team has a shared map or declares the story not ready. *([Matt Wynne](https://medium.com/@mattwynne/introducing-example-mapping-42ccd15f8adf))* |
| `SbE` | [Specification by Example](https://www.thoughtworks.com/en-us/insights/blog/applying-bdd-acceptance-criteria-user-stories) | derive AC by asking *"show me the simplest concrete example"* | *(Gojko Adzic)* — the examples become the canonical specification and later the automated acceptance tests. |

> [tip] AC emerge from **conversation**, not from a single author writing in isolation. Three viewpoints catch what one misses.

## [chapter] Deep-Dive {type: columns}

## [card formats-choice] Choosing the Format

| code | name | desc | detail |
|------|------|------|--------|
| 1 | Static layout, copy, visual polish | **Checklist** | UI tweaks, copy changes, simple config. Bulleted assertions are right-sized for visual-only work. |
| 2 | Conditional logic, multiple paths, state transitions | **Gherkin** | Given/When/Then makes context and outcome explicit and independently testable. |
| 3 | Calculations, pricing, rules engines | **Gherkin** + `Scenario Outline` | Equivalence classes go in the `Examples` table — one scenario, many input rows. |
| 4 | Third-party integration behavior | **Gherkin** | Each failure mode (timeout, auth fail, partial response) becomes its own scenario. |
| 5 | Pure a11y / compliance assertions | **Checklist** | Declarative thresholds with no single trigger — Gherkin would be ceremony without clarity. |

> [tip] The two formats can coexist within one Story — Gherkin for the core flow, a checklist for peripheral UI assertions.

## [card checklist] Rule-Oriented (Checklist)

| code | name | desc | detail |
|------|------|------|--------|
| `use` | Best for | UI tweaks, static content, copy changes, simple configuration, visual-only stories | Lightweight enough that adding ceremony hurts more than it helps. |
| `1` | Pinned position | The search bar is pinned to the top navigation on all pages | — |
| `2` | Placeholder text | Reads `Search by ID...` | — |
| `3` | Disabled state | The "Search" button is disabled until at least one character is entered | — |
| `4` | Input handling | Input is trimmed of leading/trailing whitespace before submission | — |

## [code gherkin] Scenario-Oriented (Gherkin)

```gherkin
Scenario: Customer pays with a valid credit card
  Given the customer has items worth €120 in the cart
    And the customer has entered a valid credit card
  When the customer confirms the payment
  Then the order is created with status "paid"
    And a confirmation email is sent to the customer
```

> [tip] **Given** = pre-conditions · **When** = a *single* triggering action · **Then** = observable outcomes. Use **And/But** to chain clauses inside any of the three.

## [card power-tools] Gherkin Power Tools

| code | name | desc | detail |
|------|------|------|--------|
| `Feature` | Top-of-file narrative | prose block describing the broader capability the scenarios support | One-paragraph framing visible to the business. See [Cucumber — User Story reference](https://cucumber.io/docs/terms/user-story/). |
| `Background` | Shared pre-conditions | factored-out `Given` steps that run before every scenario in the file | Keeps scenarios DRY without hiding setup. |
| `Scenario Outline` + `Examples` | Parametrized scenario | one scenario run against a data table of inputs / expected outputs | `Examples:` rows for tiers `standard / silver / gold` produce final prices €100 / €90 / €80 — one scenario, three runs. |

## [code happy] Happy Path (Positive)

```gherkin
Scenario: Customer pays with a valid credit card
  Given the customer has a valid, unexpired credit card
  When they confirm a €120 payment
  Then the payment succeeds
    And the order is marked "paid"
```

> [tip] The ideal flow — valid inputs, intended behavior. Always covered. Never enough on its own.

## [code sad] Sad Path & Edge Cases

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

> [warn] Validation boundaries, invalid inputs, external failures, race conditions, recovery. Each failure mode = its own scenario.

## [card nfrs] NFRs (FURPS+)

| code | name | desc | detail |
|------|------|------|--------|
| `F` | Functionality | security · auditing · capability coverage | *Credit card numbers are masked (`****-****-****-1234`) in logs, error messages, and database records.* |
| `U` | Usability | ergonomics · accessibility · learnability | *The checkout page conforms to WCAG 2.1 Level AA and is fully operable via keyboard only.* |
| `R` | Reliability | availability · MTBF · recoverability | *The order service sustains 99.9 % monthly availability, with an RTO of 15 minutes after any single-zone failure.* |
| `P` | Performance | response time · throughput · resource use | *Search results render in under 200 ms for the 95th percentile under the nominal load of 1 000 RPS.* |
| `S` | Supportability | maintainability · testability · configurability | *All outbound calls emit structured logs with a correlation ID, and feature flags for this module are togglable without redeploy.* |
| `+` | Constraints | design · implementation · interface · physical · legal/compliance | *All personal data at rest is encrypted with AES-256, per GDPR Art. 32.* |

> [tip] NFRs are written as a **Checklist**, not Gherkin — declarative thresholds with no single trigger. Replace adjectives (*fast*, *secure*) with numbers.

## [card antipatterns] Anti-Patterns

| code | name | desc | detail |
|------|------|------|--------|
| 🚫 | Prescribing the implementation | *Bad:* "The backend caches the result in Redis for 60 seconds." | ✅ "Repeated identical searches within 60 seconds return consistent results with perceived latency under 50 ms." |
| 🚫 | Vague, unmeasurable language | *Bad:* "The page should be fast and user-friendly." | ✅ "The page reaches *First Contentful Paint* in under 1.5 s on a 3G-Fast profile." |
| 🚫 | Too many criteria | More than ~5 AC ⇒ likely several stories in disguise | ✅ Split until each Story has 1–3 AC. The smell is the count, the cure is splitting. |
| 🚫 | Conflating AC with Definition of Done | *"Code is peer-reviewed"* is not an AC — it's a DoD item | ✅ AC are story-specific; DoD is team-wide and applies to every story. Different artifacts. |
| 🚫 | Covering only the Happy Path | A Story without sad-path or NFR criteria is half-specified | ✅ Always pair the Happy Path with at least one Sad Path and one NFR threshold. |
| 🚫 | Writing AC after implementation | AC become retroactive documentation rather than a contract | ✅ AC drive the build. Write them with the team **before** code starts. |
| 🚫 | Multi-trigger `When` clauses | `When` describing two actions hides cause-and-effect | ✅ Each scenario has exactly one `When`. If two things happen, split into two scenarios. |

## [chapter] Worked Example {type: vertical}

## [code feature] The Feature File (shared)

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

> [tip] Language-agnostic contract — both `behave` and `pytest-bdd` consume this file unchanged. Switching frameworks rewrites step definitions only, not AC.

## [code behave] Option A — `behave`

```python
# features/environment.py — hooks
from checkout.service import Checkout, PromoService

def before_scenario(context, scenario) -> None:
    context.promos = PromoService()
    context.checkout = Checkout(promos=context.promos)
```

```python
# features/steps/promo_code.py — step definitions
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

```bash
behave
```

> [tip] **`{price:d}`** uses the `parse` mini-language — `:d` coerces to `int`, no suffix means `str`. **`context`** is `behave`'s per-scenario *World*, auto-reset by `before_scenario`. **Stacked `@then`** decorators let synonyms ("becomes" / "remains") share one step.

## [code pytest-bdd] Option B — `pytest-bdd`

```python
# tests/test_promo_code.py
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

```bash
pytest
```

> [tip] **`scenarios(...)`** auto-discovers each scenario as a `test_*` function. State lives in **pytest fixtures**, not a `context` World. **`target_fixture="result"`** publishes a step's return value as a fixture downstream `@then` steps consume. Free pytest markers, parametrization, xdist parallelism, plugins.

## [card frameworks] Which to Choose

| code | name | desc | detail |
|------|------|------|--------|
| 1 | Team thinks in Cucumber/Gherkin terms | **`behave`** | Direct port of Cucumber; dedicated runner; `context` World matches the Cucumber mental model verbatim. |
| 2 | Repo is already pytest-first with existing fixtures | **`pytest-bdd`** | Step defs become pytest functions; you reuse fixtures, conftest, and plugins instead of building a parallel test infrastructure. |
| 3 | Need parallel execution, rich plugins, pytest-native reports | **`pytest-bdd`** | xdist for parallelism; pytest-html / allure for reports; markers for selective runs. |
| 4 | Want the *dedicated* BDD runner & ecosystem | **`behave`** | First-class hooks, formatters, and tags — not bolt-ons on top of a generic runner. |

> [tip] The `.feature` file is **identical** in both cases. Switching frameworks rewrites step definitions only — the AC the business approves are unchanged.
