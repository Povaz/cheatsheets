## [table building-blocks] Building Blocks

| code | desc | detail |
|------|------|--------|
| `Context` | named scope w/ coherent vocabulary — title + short description + Dictionary + optional Relationships | Relationships are plain prose. Same-term divergence across Contexts is acknowledged here, not hidden. |
| `Dictionary entry` | a `(term, definition)` pair — written for humans, not a schema | Worth including when: ambiguous, domain-specific, business/legal/operational weight, used differently by different stakeholders, recurs across Stories, or risks implementation mistakes. |
| `Anchored Story` | tagged with ≥1 Context + highlighted terms — the artifact is bound to the Dictionary | A Story without a tag is **unanchored** — typically not yet processed, or tags removed during refactor and not replaced. Must be anchored before next recurring spec review. |
| `Anchored AC` | inherits parent Story's Contexts — not anchored independently | Carries its own highlighted terms; uses inline `term[Context]` only when same-term ambiguity surfaces at AC level. |
| `Smell` | review prompt, not a failure — "this deserves attention" | Examples: Story spans many Contexts; term has only one citation; term hard to define cleanly; two Contexts use the same word differently. |

> [warn] Do **not** define every ordinary word. The Dictionary is deliberately small — coverage of *important* terms beats completeness.
