## [card future] Future Enhancements

| code | name | desc | detail |
|------|------|------|--------|
| 1 | Code-level Dictionary enforcement | linter verifying code identifiers against the active Dictionary | Closes the spec/code vocabulary gap (the R10 trade-off). **Most-discussed enhancement.** |
| 2 | Unhighlighted-term checker | doc checker flags Dictionary terms appearing without backticks | Converts the discipline problem into a tooling problem. **Near-term priority** given R1's reliance on highlighting completeness. |
| 3 | Automatic `term → affected artifacts` index | generate R9's mapping automatically from the spec | Makes impact analysis cheap rather than disciplined. |
| 4 | Multi-Context Story patterns | adopt a subset of DDD's Context Map relationship patterns | Today: flat tags + R6 rubric + R5 inline disambig. Wait until recurring patterns emerge in practice. |
| 5 | Dictionary quality guidance | specificity, circularity, synonyms, plurals, multi-word terms, worked examples | Current framework gives only inclusion criteria — onboarding aid for new teams. |
| 6 | Aliases / synonyms / term versioning | optional surface forms, cross-references, change history | Expands Dictionary expressiveness without forcing complexity on teams that don't need it. |
| 7 | AI review prompts | dedicated prompts that check Stories/AC against the active Dictionary | Flag unhighlighted terms, accidental synonyms, invented terminology, cross-context vocabulary leakage. Systematizes ad-hoc human review. |

> [tip] Documented rather than hidden — the lean ethos prefers visible debt over false confidence. None adopted yet.
