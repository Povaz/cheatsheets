## [card formats-choice] Choosing the Format

| code | name | desc | detail |
|------|------|------|--------|
| `chk` | Static layout, copy, visual polish | bulleted assertions are right-sized for visual-only work | UI tweaks, copy changes, simple config. Adding ceremony hurts more than it helps. |
| `gherkin` | Conditional logic, multiple paths, state transitions | Given/When/Then makes context and outcome explicit | Each path is independently testable; branching is captured in the structure. |
| `gh+SO` | Calculations, pricing, rules engines | Gherkin + `Scenario Outline` | Equivalence classes go in the `Examples` table — one scenario, many input rows. |
| `gherkin` | Third-party integration behavior | one scenario per failure mode | Timeout, auth fail, partial response, retry — each gets its own explicit context + trigger + outcome. |
| `chk` | Pure a11y / compliance assertions | declarative thresholds, no trigger | Gherkin would be ceremony without clarity. WCAG conformance, encryption-at-rest — checklist material. |

> [tip] The two formats can coexist within one Story — Gherkin for the core flow, a checklist for peripheral UI assertions.
