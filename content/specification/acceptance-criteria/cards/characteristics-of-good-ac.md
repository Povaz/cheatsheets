## [table characteristics-of-good-ac] Characteristics of Good AC

| desc | detail |
|------|--------|
| objectively verifiable as pass or fail | A criterion that can't be checked isn't a criterion — it's an aspiration. Operationalizes the **T** in INVEST. |
| plain business language; no room for interpretation | If two readers disagree on what "passes" means, rewrite the AC before any code is written. |
| describes *what* the system does, never *how* | "Returns results in <50 ms" is an AC. "Caches in Redis for 60 s" is a design note that belongs in tech docs. |
| written from the perspective of observable behavior | The AC is what someone outside the team — a tester, a PO, a customer — would describe as "the thing working". |
| vague terms (*"fast"*, *"secure"*, *"intuitive"*) → numbers, ranges, thresholds | The **M** in SMART. *"Fast"* starts a conversation; *"p95 < 200 ms at 1 000 RPS"* ends one. |
| most healthy stories have **1–3** AC; > 5 ⇒ split | A long AC tail usually means two stories pretending to be one. Treat the count as a smell, not a target. |

> [tip] Together these operationalize **T** (Testable) in INVEST and **M** (Measurable) in SMART. A Story without clear AC cannot be estimated, demoed, or accepted — by definition, not ready.
