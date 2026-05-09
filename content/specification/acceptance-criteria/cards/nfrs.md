## [card nfrs] NFRs (FURPS+)

| code | desc | detail |
|------|------|--------|
| `F` | Functionality — security · auditing · capability coverage | *Credit card numbers are masked (`****-****-****-1234`) in logs, error messages, and database records.* |
| `U` | Usability — ergonomics · accessibility · learnability | *The checkout page conforms to WCAG 2.1 Level AA and is fully operable via keyboard only.* |
| `R` | Reliability — availability · MTBF · recoverability | *The order service sustains 99.9 % monthly availability, with an RTO of 15 minutes after any single-zone failure.* |
| `P` | Performance — response time · throughput · resource use | *Search results render in under 200 ms for the 95th percentile under the nominal load of 1 000 RPS.* |
| `S` | Supportability — maintainability · testability · configurability | *All outbound calls emit structured logs with a correlation ID, and feature flags for this module are togglable without redeploy.* |
| `+` | Constraints — design · implementation · interface · physical · legal/compliance | *All personal data at rest is encrypted with AES-256, per GDPR Art. 32.* |

> [tip] NFRs are written as a **Checklist**, not Gherkin — declarative thresholds with no single trigger. Replace adjectives (*fast*, *secure*) with numbers.
