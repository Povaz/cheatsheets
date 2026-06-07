## [card anti-patterns-from-the-frame] Anti-patterns from the Frame {accent: status-4xx}

| code | desc | detail |
|------|------|--------|
| 🚫 | Fake Story — need sits inside Zone of Control | *"QA can have automated DB restarts so I can test faster"* — internal tooling dressed as a story. **Fix:** track as a Task / Improvement Item. |
| 🚫 | Misleading Story — goal is a prescribed solution | *"Run query optimization on reports DB"* — the real need is *"finish month-end review on time"*. **Fix:** extract the underlying need; caching / pre-aggregation / async loading are now all on the table. |
| 🚫 | Dependency-Locked — deliverable is outside Zone of Control | *"Pay with Klarna"* before the contract is signed. Sits in *In Progress* until external unblocks — not agile. **Fix:** split. Keep the in-team abstraction as the story; track the integration separately. |
| 🚫 | Micro-Story — sliced too thin to carry user value | *"Click the Log-in button so my click is recorded"* — no business risk standalone. **Fix:** regroup with siblings under a value-carrying story. Click-tracking belongs in AC or analytics, not as its own story. |

> [warn] The skill's rule is **warn, don't block** — annotate the story and let the author decide. Most of these arise honestly in refinement.
