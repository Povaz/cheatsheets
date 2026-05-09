## [text problem] Why worktrees, why for agents

- **The pain** — multiple processes (terminals, agents, IDE windows) in one repo all share `.git/HEAD`. When one runs `git checkout feature/X`, the others silently move with it. Not a tool bug; it's the consequence of a single working tree.
- **The fix** — `git worktree` adds *more* working trees backed by the same `.git`. Each linked worktree has its own files, its own `HEAD`, and its own index; all share commits, refs, and remotes.
- **Mental model** — one filing cabinet (`.git`), many desks (worktrees). A commit made at desk 2 is visible from desk 1 *immediately* — no push, no fetch.
- **Practical scope** — worktrees are local-only metadata. They don't push, don't appear on teammates' clones, don't show up in CI.
