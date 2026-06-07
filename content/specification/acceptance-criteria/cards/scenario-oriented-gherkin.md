## [code scenario-oriented-gherkin] Scenario-Oriented (Gherkin)

```gherkin
Scenario: Customer pays with a valid credit card
  Given the customer has items worth €120 in the cart
    And the customer has entered a valid credit card
  When the customer confirms the payment
  Then the order is created with status "paid"
    And a confirmation email is sent to the customer
```

> [tip] **Given** = pre-conditions · **When** = a *single* triggering action · **Then** = observable outcomes. Use **And/But** to chain clauses inside any of the three.
