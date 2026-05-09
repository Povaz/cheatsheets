## [card verbs] `git worktree` subcommands

| code | desc | detail |
|------|------|--------|
| `add <path> [<commit-ish>]` | new linked worktree at `<path>` checking out `<commit-ish>` | If `<commit-ish>` omitted, creates a branch named after the path's basename from `HEAD`. Errors if the branch is already checked out elsewhere unless `--force`. |
| `list` | show all worktrees with revision, branch, and status | `-v` adds annotations (locked reason, prunable cause); `--porcelain` is machine-readable; `-z` NUL-terminates lines for safe parsing. |
| `lock <worktree>` | prevent automatic pruning, `move`, and `remove` | `--reason "<text>"` records why. Useful for portable/network mounts, or to mark "agent mid-task — do not nuke". |
| `unlock <worktree>` | undo `lock` | — |
| `move <worktree> <new-path>` | move the working directory and update metadata | Cannot move the main worktree or one with submodules. Locked worktrees need `--force` twice. |
| `remove <worktree>` | drop the working directory and deregister | Refuses if worktree is unclean (use `-f`) or locked (`-f -f`). Cannot remove the main worktree. |
| `prune` | drop stale `.git/worktrees/<name>/` entries whose folder no longer exists | Safe after a manual `rm -rf` of the worktree dir. `-n` previews; `--expire <time>` only prunes older than threshold. |
| `repair [<paths>...]` | rewrite `gitdir` back-pointers when the main or a linked worktree was moved manually | Run from any worktree; pass moved paths as args when several moved at once. For *deletes*, use `prune` instead. |
