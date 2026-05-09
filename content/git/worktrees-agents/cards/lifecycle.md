## [card lifecycle] Agent slot lifecycle

| code | desc | detail |
|------|------|--------|
| 1. setup | provision — create the slot once with a placeholder branch | `git worktree add ../proj-agent1 -b wt/agent1`. Sits at HEAD; never pushed. The `wt/` prefix marks it as infrastructure. |
| 2. assign | start a task — inside the slot, branch from `main` and launch the agent | `cd ../proj-agent1 && git checkout -b feature/task-1 main`. Optionally `git branch -d wt/agent1` to drop the placeholder. |
| 3. work | commit normally — agent commits on `feature/task-1`; visible from main desk live | No push needed for the dev to read the agent's commits — `.git/objects` is shared. |
| 4. integrate | merge or PR — from main worktree: `git checkout main && git merge feature/task-1` (or push and open a PR) | Agent's branch keeps living in its slot until reassigned. |
| 5. reuse | new task, same slot — inside the slot, branch from main again | `cd ../proj-agent1 && git checkout -b feature/task-2 main`. Folder and tooling config unchanged. |
| 6. cleanup | retire the slot — when the slot is genuinely no longer needed | `git worktree remove ../proj-agent1` (`--force` if dirty); `git worktree prune` if you `rm -rf`'d it manually. |

> [tip] Reuse slots, don't churn them. Worktree directories are infrastructure, not per-task scratch — the practical rhythm is two or three named slots reassigned as tasks come and go.
