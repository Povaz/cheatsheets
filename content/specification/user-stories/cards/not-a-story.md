## [card not-a-story] Not a User Story

| code | name | desc | detail |
|------|------|------|--------|
| `Task` | implementation work item | *"Add /api/v1/users POST endpoint"* | Belongs as a Task. The story is *"As an admin, I can invite a new user, so they can start using the platform."* |
| `Impl note` | technical decision | *"Use Redis for session storage"* | Belongs in a spike or ADR, not on the story card. |
| `DoD` | team-wide quality gate | *"code reviewed"*, *"deployed to staging"* | Definition of Done is per-team, applies to every story — not authored per story. |
| `Improvement` | internal tooling | *"a script that resets the test DB"* | Belongs as a Task or Improvement Item. If the only beneficiary is the team, the story format is a contortion (see *Fake Story*). |
