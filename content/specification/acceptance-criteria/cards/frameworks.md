## [card frameworks] Which to Choose

| code | name | desc | detail |
|------|------|------|--------|
| `behave`     | Team thinks in Cucumber/Gherkin terms | direct port of Cucumber; dedicated runner | `context` World matches the Cucumber mental model verbatim. |
| `pytest-bdd` | Repo is already pytest-first with existing fixtures | step defs become pytest functions | Reuse fixtures, conftest, and plugins instead of building a parallel test infrastructure. |
| `pytest-bdd` | Need parallel execution, rich plugins, pytest-native reports | xdist + pytest-html / allure | First-class with the rest of pytest; markers for selective runs. |
| `behave`     | Want the *dedicated* BDD runner & ecosystem | first-class hooks, formatters, tags | Not bolt-ons on top of a generic runner. |

> [tip] The `.feature` file is **identical** in both cases. Switching frameworks rewrites step definitions only — the AC the business approves are unchanged.
