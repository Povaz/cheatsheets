## [card which-to-choose] Which to Choose

| code | desc | detail |
|------|------|--------|
| `behave`     | direct port of Cucumber; dedicated runner | `context` World matches the Cucumber mental model verbatim. |
| `pytest-bdd` | step defs become pytest functions | Reuse fixtures, conftest, and plugins instead of building a parallel test infrastructure. |
| `pytest-bdd` | xdist + pytest-html / allure | First-class with the rest of pytest; markers for selective runs. |
| `behave`     | first-class hooks, formatters, tags | Not bolt-ons on top of a generic runner. |

> [tip] The `.feature` file is **identical** in both cases. Switching frameworks rewrites step definitions only — the AC the business approves are unchanged.
