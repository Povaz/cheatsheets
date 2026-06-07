## [card dependency-locked-klarna-instalments] 🚫 Dependency-locked — Klarna instalments {accent: status-4xx}

| code | desc | detail |
|------|------|--------|
| `Title` | Pay course fee with Klarna instalments — concrete user outcome | Reads cleanly *as a story*, but… |
| `As a` | learner — named role | …the deliverable sits outside the team's Zone of Control. |
| `I can` | choose Klarna at checkout and split my course fee across instalments — observable capability | Team cannot ship until contract + SDK access exist. |
| `so that` | I can enrol without paying the full amount up front — value hypothesis | Lowers the enrolment barrier — a real Sphere-of-Influence outcome. |
| `INVEST` | I + E fail — blocked on signed contract & SDK access | **Fix:** split. Keep the in-team work as a *third-party instalment provider* abstraction at checkout; track the Klarna contract & integration as a separate dependency. |

> [warn] *Dependency-locked* stories sit in *In Progress* until the external unblocks — that is not agile, it is a blocked ticket with the wrong status.
