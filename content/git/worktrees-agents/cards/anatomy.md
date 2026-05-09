## [card anatomy] What lives where in `.git`

| code | desc | detail |
|------|------|--------|
| `HEAD` | per-worktree — each worktree's current branch | Main worktree's `HEAD` is at `.git/HEAD`; each linked worktree's `HEAD` is at `.git/worktrees/<name>/HEAD`. Independent. |
| `objects/` | shared — commits, trees, blobs | All worktrees see the same history immediately. No push/fetch needed between desks. |
| `refs/` | shared — branch & tag pointers | Single ref namespace across worktrees — except per-worktree refs (`refs/bisect/*`, `refs/worktree/*`, `refs/rewritten/*`) and pseudo-refs like `MERGE_HEAD`. |
| `config` | shared — remote URLs, settings | Per-worktree overrides via `extensions.worktreeConfig` + `git config --worktree`. Use for `core.worktree`, `core.sparseCheckout`. |
| `worktrees/<name>/` | per-worktree — metadata for each linked worktree | Holds that worktree's `HEAD`, `gitdir` (back-pointer), and optional `locked` file with reason text. |
| `.git` (top of linked) | file, not dir — one-line `gitdir:` pointer back to the main repo's `.git/worktrees/<name>/` | Inside the worktree, `$GIT_DIR` resolves to the private dir; `$GIT_COMMON_DIR` resolves to the main `.git`. |

> [tip] The branch a worktree is on is mechanical — it's literally what `.git/worktrees/<name>/HEAD` points to.
