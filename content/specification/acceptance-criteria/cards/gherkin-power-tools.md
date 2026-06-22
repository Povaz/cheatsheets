## [table gherkin-power-tools] Gherkin Power Tools

| code | desc | detail |
|------|------|--------|
| `Feature` | prose block describing the broader capability the scenarios support | One-paragraph framing visible to the business. See [Cucumber — User Story reference](https://cucumber.io/docs/terms/user-story/). |
| `Background` | factored-out `Given` steps that run before every scenario in the file | Keeps scenarios DRY without hiding setup. |
| `Scenario Outline` + `Examples` | one scenario run against a data table of inputs / expected outputs | `Examples:` rows for tiers `standard / silver / gold` produce final prices €100 / €90 / €80 — one scenario, three runs. |
