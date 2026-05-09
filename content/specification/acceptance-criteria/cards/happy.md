## [code happy] Happy Path (Positive)

```gherkin
Scenario: Customer pays with a valid credit card
  Given the customer has a valid, unexpired credit card
  When they confirm a €120 payment
  Then the payment succeeds
    And the order is marked "paid"
```

> [tip] The ideal flow — valid inputs, intended behavior. Always covered. Never enough on its own.
