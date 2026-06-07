## [code sad-path-and-edge-cases] Sad Path & Edge Cases

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
