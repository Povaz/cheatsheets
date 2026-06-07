## [card constraints-and-gotchas] Constraints & gotchas

| code | desc | detail |
|------|------|--------|
| One branch, one worktree | including `main` — if your repo's `main` is checked out in the main desk, no other worktree can use `main` | This is a safety feature. Override with `--force` only if you know what you're doing. |
| Local-only | metadata lives under `.git/worktrees/` of the local clone | They don't appear on teammates' machines, don't run in CI, don't survive `git clone` to a new host. |
| Submodules | `git worktree move` refuses with submodules; multiple checkouts of a superproject with submodules is officially experimental | If your repo uses submodules, expect each worktree to need its own submodule init and to hit edge cases. |
| Manual delete leaves stale meta | `.git/worktrees/<name>/` is now orphaned; `git worktree list` will mark it `prunable` | Run `git worktree prune` (or `--expire <time>`) to clean up. |
| Manual move breaks back-pointers | the `gitdir` link in `.git/worktrees/<name>/` still points at the old location | Run `git worktree repair` from the moved worktree (or pass moved paths from any worktree) to rewrite the back-pointers. |
