## [card git-worktree-add-key-options] `git worktree add` — key options

| code | desc | detail |
|------|------|--------|
| `-b <branch>` | new branch — create `<branch>` from `<commit-ish>` and check it out | Common pattern: `git worktree add ../slot -b wt/slot` for a placeholder branch sitting at HEAD. |
| `-B <branch>` | new or reset — like `-b` but resets the branch tip if it already exists | Destructive — overwrites the existing branch's tip. |
| `-d, --detach` | detached HEAD — check out `<commit-ish>` without a branch | Useful for ad-hoc inspection or builds you don't intend to commit on. |
| `--orphan` | empty history — new worktree on an unborn branch with empty index | For starting an unrelated history (e.g., a `gh-pages` branch). |
| `--no-checkout` | metadata only — register the worktree without writing files | Then run `git sparse-checkout` etc. before checking out. |
| `--lock [--reason <s>]` | locked from birth — mark the new worktree locked atomically | Equivalent to `add` then `lock`, but in one step. |
| `--track` / `--no-track` | upstream — force/suppress marking `<commit-ish>` as upstream of the new branch | Default-on when `<commit-ish>` is itself a remote-tracking branch; `--track` forces it, `--no-track` suppresses it. Name-based remote lookup is `--guess-remote` (next row). |
| `--guess-remote` | auto-track remote — when branch name matches exactly one remote-tracking branch, track it | Default off; flip globally with `worktree.guessRemote = true`. |
| `-f, --force` | override — bypass safety checks (branch already checked out, path exists, etc.) | Use **twice** to override locked or missing-worktree checks. |
