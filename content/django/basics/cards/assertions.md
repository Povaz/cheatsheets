## [card assertions] Assertions

| code | desc | detail |
|------|------|--------|
| `assertEqual`, `assertIs`, `assertTrue`, `assertFalse` | basic equality / identity / truthiness | `assertIs` checks `is` (identity), not `==`. Useful for booleans and singletons. |
| `assertContains(response, text)` | also asserts `status_code == 200` unless you pass `status_code=` | Inverse: `assertNotContains`. For exact 200 + body text, this is the one. |
| `assertRedirects(response, url)` | response was a 30x to `url` | Follows the redirect by default and checks the final response too. |
| `assertQuerySetEqual(qs, values)` | order-sensitive by default; pass `ordered=False` for set-equal | Useful for view tests that put a QuerySet in `response.context`. |
