## [code the-feature-file-shared] The Feature File (shared)

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
