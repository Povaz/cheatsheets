## [table other-smells] Other Smells

| code | desc | detail |
|------|------|--------|
| `impl` | *Bad:* "add a `/api/v1/users` POST endpoint" | *Good:* "invite a new user, so they can start using the platform". Strip the verb-of-doing from the goal. |
| `why?` | a story without a reason has no value hypothesis | If the reason is *"because the PO said so"*, reopen the conversation — the story is not ready. |
| `role=user` | *"As a user, I want…"* | Always prefer the most concrete role available: learner, course admin, operator, finance controller, accessibility auditor. |
| `merge` | description contains *"Given … When … Then …"* | Skipping the 3Cs Confirmation layer and mixing two artifacts. Narrative on the card; AC in their own section. |
| `capacity` | *"we have 3 points left, slice off something tiny"* | Breeds Micro-Stories. Split along a real user-value axis, not to fit the burndown. |
| `invented` | rewrite mentions roles, screens, endpoints, integrations not in the input | Looks authoritative but silently expands scope. If the draft does not mention it, **ask** — do not guess. |
