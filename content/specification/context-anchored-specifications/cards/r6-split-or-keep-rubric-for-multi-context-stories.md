## [card r6-split-or-keep-rubric-for-multi-context-stories] R6 — Split-or-Keep Rubric for Multi-Context Stories

| code | desc | detail |
|------|------|--------|
| **(a)** | Single-rephrase split — the Story can be cleanly stated using only one Context's vocabulary | …by removing or rephrasing one sentence. If yes → **split**. |
| **(b)** | Independent terms — cross-Context terms refer to independent entities | They happen to appear together but aren't structurally entangled. If yes → **split**. |
| **(c)** | Clean INVEST split — both halves pass INVEST | Splitting yields two valid Stories. If yes → **split**. |
| `default` | otherwise — **keep** the Story multi-Context | The rubric bounds where judgment is needed; it doesn't remove judgment. |
| `override` | explicit reasoning required — record alongside the Story | Override the default (split when none apply, or keep when one does) only with stated reasons. |

> [tip] Inline disambiguation `` `term[Context]` `` is needed *only* when the same term has divergent definitions across the Story's Contexts — rare. Most multi-Context Stories use plain backticks throughout.
