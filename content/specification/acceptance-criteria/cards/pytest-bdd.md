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
