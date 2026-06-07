## [card three-artifacts-three-jobs] Three Artifacts, Three Jobs

| code | desc | detail |
|------|------|--------|
| `Dictionary` | What are we talking about? — prevents **semantic drift** | The deliberately small `(term, definition)` set per Context. Definitions are written for humans, not for a schema. |
| `User Stories` | Who needs what, and why? — prevents **building the wrong thing** | Connextra format (`As a <role>, I want <capability>, so that <benefit>`). Three slots keep Stories in the *purpose* lane. |
| `Acceptance Criteria` | How must it behave? — prevents **building it incorrectly** | BDD Gherkin (`Given / When / Then`) per Story. Inherits parent's Contexts (Rule 4). |

> [tip] Artifacts are orthogonal — each prevents a distinct failure class. Behavioral disputes after vocabulary alignment = AC issue, not a Dictionary failure.
