## [card daily] Daily inspection

| code | name | desc | detail |
|------|------|------|--------|
| `git worktree list` | who's where | path + commit + branch for every worktree | First line is the main worktree. Add `-v` for lock reasons and prunable annotations. |
| `git log --oneline --all --graph` | unified history | all branches across all worktrees in one graph | Works from *any* worktree — `refs/` is shared. Use the main desk to oversee agent commits. |
| `git diff main..feature/agent-1` | what they changed | range diff between agent's branch and `main` | `--name-only` for just the file list. No checkout, no fetch — refs are local. |
| `git rev-parse --git-path HEAD` | resolve a ref's file | per-worktree path for the ref | Returns the *current* worktree's `HEAD` file. Use to script per-worktree state. |
| `git worktree list --porcelain` | scriptable view | one attribute per line, blank line between entries | Stable parsing surface for tooling: `worktree`, `HEAD`, `branch`/`detached`, `locked`, `prunable`. |
