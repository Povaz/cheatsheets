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
