## [card spidr] SPIDR + Extras (Mike Cohn)

| code | desc | detail |
|------|------|--------|
| **S** | Spike — research first when story fails INVEST-Estimable | Time-boxed; delivers *knowledge*, not the feature. *Ex:* "Spike: Klarna vs Afterpay vs Riverty SDKs for instalment checkout, 3 days." |
| **P** | Paths — split along workflow steps or decision branches | Each path is a separately demoable user journey. *Ex:* Search → Add to cart → Checkout → Confirmation email. |
| **I** | Interface — split by UI surface or channel | Web → mobile-web → native-app; read-view first, edit-view later; REST first, webhook second. |
| **D** | Data — split by data subset or variant | EUR-only first, multi-currency later; free-tier search first, premium filters second. |
| **R** | Rules — one complex business rule per story | One rule = one story = one testable outcome. *Ex:* loyalty discount → promo-code discount → campus-partner discount. |
| `CRUD` | Create / Read / Update / Delete — each as its own story when each carries user value | Most common in admin / CMS flows. Risks Micro-Stories — check each slice is genuinely user-valuable. |
| `happy/edges` | Happy path vs. edge cases — core flow first, error-handling + recovery as follow-ups | Often a better axis than specifying every error up front. |

> [tip] **Vertical, not horizontal.** A split is vertical when each resulting story still delivers end-to-end value. Splits by *technical layer* ("build the API", "build the UI", "write the tests") break INVEST-Valuable and INVEST-Independent at the same time — reject them in refinement.
