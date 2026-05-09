## [card antipatterns] Anti-Patterns

| code | name | desc | detail |
|------|------|------|--------|
| `impl`  | Prescribing the implementation | *Bad:* "The backend caches the result in Redis for 60 seconds." | ✅ "Repeated identical searches within 60 seconds return consistent results with perceived latency under 50 ms." |
| `vague` | Vague, unmeasurable language | *Bad:* "The page should be fast and user-friendly." | ✅ "The page reaches *First Contentful Paint* in under 1.5 s on a 3G-Fast profile." |
| `count` | Too many criteria | More than ~5 AC ⇒ likely several stories in disguise | ✅ Split until each Story has 1–3 AC. The smell is the count, the cure is splitting. |
| `dod`   | Conflating AC with Definition of Done | *"Code is peer-reviewed"* is not an AC — it's a DoD item | ✅ AC are story-specific; DoD is team-wide and applies to every story. Different artifacts. |
| `happy` | Covering only the Happy Path | A Story without sad-path or NFR criteria is half-specified | ✅ Always pair the Happy Path with at least one Sad Path and one NFR threshold. |
| `late`  | Writing AC after implementation | AC become retroactive documentation rather than a contract | ✅ AC drive the build. Write them with the team **before** code starts. |
| `multi` | Multi-trigger `When` clauses | `When` describing two actions hides cause-and-effect | ✅ Each scenario has exactly one `When`. If two things happen, split into two scenarios. |
