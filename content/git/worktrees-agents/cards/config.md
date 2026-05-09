## [card config] Per-worktree configuration

| code | desc | detail |
|------|------|--------|
| `extensions.worktreeConfig` | opt-in to per-worktree config | Once enabled (`git config extensions.worktreeConfig true`), use `git config --worktree <key> <value>` to write into `.git/worktrees/<id>/config.worktree`. Read after `.git/config`. |
| `worktree.guessRemote` | `add` auto-tracks remote when branch name matches exactly one remote-tracking branch | Per-repo or global. Saves typing `--track` for typical "checkout the remote feature branch" flows. |
| `worktree.useRelativePaths` | link worktrees with relative paths instead of absolute | Useful when the parent dir of the repo + worktrees may move together. |
| `core.worktree` | per-worktree only — overrides where Git looks for the working tree | If it leaks into shared `config`, every linked worktree breaks. Always set with `--worktree`. |
| `core.bare` | per-worktree only when its value differs across worktrees | Same reasoning as `core.worktree` — sharing a `true` value blows up the linked worktrees. |
| `core.sparseCheckout` | per-worktree when sparse layouts differ | If only some worktrees use sparse checkout, `--worktree` it. |
