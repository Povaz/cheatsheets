# Open Issues

## 1. Open Questions

| ID    | Context       | Question                                                                                                                  | Impact                         | Status                                                        |
|-------|---------------|---------------------------------------------------------------------------------------------------------------------------|--------------------------------|---------------------------------------------------------------|
| OQ-1  | View          | After the Content Context dissolved, how should surviving View Dictionary terms tag the former `[Content]` entities now defined in Master §4? | Low — tagging consistency      | Resolved (v2.0) — use plain names; Master is not a Context.   |
| OQ-2  | Cross-cutting | Should the authored content-format schema and the runtime `SheetSettings` store both live under Master §4?                | Low — document organisation    | Resolved (v2.0) — yes; §4 is the single canonical data-model home. |

## 2. Improvements Backlog

| ID    | Context       | Description                                                                                                                       | Priority | Status   |
|-------|---------------|----------------------------------------------------------------------------------------------------------------------------------|----------|----------|
| IMP-1 | View          | Generate the runner-side `.feature` files and an e2e harness under `frontend/e2e/features/view/`; every AC currently cites a *(not yet generated)* feature. | Medium   | Deferred |
| IMP-2 | Cross-cutting | Archive the pre-v2.0 `content.md` / `view.md` snapshots to `docs/retired/` (git history already preserves them).                 | Low      | Deferred |
