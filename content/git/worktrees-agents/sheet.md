---
title: Worktrees + Agents
subtitle: parallel branches in one repo — and parallel agents without HEAD races
---

## [chapter] Foundations {type: vertical}

## [text problem] Why worktrees, why for agents

- **The pain** — multiple processes (terminals, agents, IDE windows) in one repo all share `.git/HEAD`. When one runs `git checkout feature/X`, the others silently move with it. Not a tool bug; it's the consequence of a single working tree.
- **The fix** — `git worktree` adds *more* working trees backed by the same `.git`. Each linked worktree has its own files, its own `HEAD`, and its own index; all share commits, refs, and remotes.
- **Mental model** — one filing cabinet (`.git`), many desks (worktrees). A commit made at desk 2 is visible from desk 1 *immediately* — no push, no fetch.
- **Practical scope** — worktrees are local-only metadata. They don't push, don't appear on teammates' clones, don't show up in CI.

## [card anatomy] What lives where in `.git`

| code | name | desc | detail |
|------|------|------|--------|
| `HEAD` | per-worktree | each worktree's current branch | Main worktree's `HEAD` is at `.git/HEAD`; each linked worktree's `HEAD` is at `.git/worktrees/<name>/HEAD`. Independent. |
| `objects/` | shared | commits, trees, blobs | All worktrees see the same history immediately. No push/fetch needed between desks. |
| `refs/` | shared | branch & tag pointers | Single ref namespace across worktrees — except per-worktree refs (`refs/bisect/*`, `refs/worktree/*`, `refs/rewritten/*`) and pseudo-refs like `MERGE_HEAD`. |
| `config` | shared | remote URLs, settings | Per-worktree overrides via `extensions.worktreeConfig` + `git config --worktree`. Use for `core.worktree`, `core.sparseCheckout`. |
| `worktrees/<name>/` | per-worktree | metadata for each linked worktree | Holds that worktree's `HEAD`, `gitdir` (back-pointer), and optional `locked` file with reason text. |
| `.git` (top of linked) | file, not dir | one-line `gitdir:` pointer back to the main repo's `.git/worktrees/<name>/` | Inside the worktree, `$GIT_DIR` resolves to the private dir; `$GIT_COMMON_DIR` resolves to the main `.git`. |

> [tip] The branch a worktree is on is mechanical — it's literally what `.git/worktrees/<name>/HEAD` points to.

## [chapter] Commands {type: columns}

## [card verbs] `git worktree` subcommands

| code | name | desc | detail |
|------|------|------|--------|
| `add <path> [<commit-ish>]` | create | new linked worktree at `<path>` checking out `<commit-ish>` | If `<commit-ish>` omitted, creates a branch named after the path's basename from `HEAD`. Errors if the branch is already checked out elsewhere unless `--force`. |
| `list` | inspect | show all worktrees with revision, branch, and status | `-v` adds annotations (locked reason, prunable cause); `--porcelain` is machine-readable; `-z` NUL-terminates lines for safe parsing. |
| `lock <worktree>` | protect | prevent automatic pruning, `move`, and `remove` | `--reason "<text>"` records why. Useful for portable/network mounts, or to mark "agent mid-task — do not nuke". |
| `unlock <worktree>` | release | undo `lock` | — |
| `move <worktree> <new-path>` | relocate | move the working directory and update metadata | Cannot move the main worktree or one with submodules. Locked worktrees need `--force` twice. |
| `remove <worktree>` | delete | drop the working directory and deregister | Refuses if worktree is unclean (use `-f`) or locked (`-f -f`). Cannot remove the main worktree. |
| `prune` | cleanup | drop stale `.git/worktrees/<name>/` entries whose folder no longer exists | Safe after a manual `rm -rf` of the worktree dir. `-n` previews; `--expire <time>` only prunes older than threshold. |
| `repair [<paths>...]` | fix | rewrite `gitdir` back-pointers when the main or a linked worktree was moved manually | Run from any worktree; pass moved paths as args when several moved at once. For *deletes*, use `prune` instead. |

## [card add-options] `git worktree add` — key options

| code | name | desc | detail |
|------|------|------|--------|
| `-b <branch>` | new branch | create `<branch>` from `<commit-ish>` and check it out | Common pattern: `git worktree add ../slot -b wt/slot` for a placeholder branch sitting at HEAD. |
| `-B <branch>` | new or reset | like `-b` but resets the branch tip if it already exists | Destructive — overwrites the existing branch's tip. |
| `-d, --detach` | detached HEAD | check out `<commit-ish>` without a branch | Useful for ad-hoc inspection or builds you don't intend to commit on. |
| `--orphan` | empty history | new worktree on an unborn branch with empty index | For starting an unrelated history (e.g., a `gh-pages` branch). |
| `--no-checkout` | metadata only | register the worktree without writing files | Then run `git sparse-checkout` etc. before checking out. |
| `--lock [--reason <s>]` | locked from birth | mark the new worktree locked atomically | Equivalent to `add` then `lock`, but in one step. |
| `--track` / `--no-track` | upstream | mark `<commit-ish>` as upstream of the new branch | Auto for unique remote-tracking matches; suppress with `--no-track`. |
| `--guess-remote` | auto-track remote | when branch name matches exactly one remote-tracking branch, track it | Default off; flip globally with `worktree.guessRemote = true`. |
| `-f, --force` | override | bypass safety checks (branch already checked out, path exists, etc.) | Use **twice** to override locked or missing-worktree checks. |

## [card daily] Daily inspection

| code | name | desc | detail |
|------|------|------|--------|
| `git worktree list` | who's where | path + commit + branch for every worktree | First line is the main worktree. Add `-v` for lock reasons and prunable annotations. |
| `git log --oneline --all --graph` | unified history | all branches across all worktrees in one graph | Works from *any* worktree — `refs/` is shared. Use the main desk to oversee agent commits. |
| `git diff main..feature/agent-1` | what they changed | range diff between agent's branch and `main` | `--name-only` for just the file list. No checkout, no fetch — refs are local. |
| `git rev-parse --git-path HEAD` | resolve a ref's file | per-worktree path for the ref | Returns the *current* worktree's `HEAD` file. Use to script per-worktree state. |
| `git worktree list --porcelain` | scriptable view | one attribute per line, blank line between entries | Stable parsing surface for tooling: `worktree`, `HEAD`, `branch`/`detached`, `locked`, `prunable`. |

## [card lifecycle] Agent slot lifecycle

| code | name | desc | detail |
|------|------|------|--------|
| 1. setup | provision | create the slot once with a placeholder branch | `git worktree add ../proj-agent1 -b wt/agent1`. Sits at HEAD; never pushed. The `wt/` prefix marks it as infrastructure. |
| 2. assign | start a task | inside the slot, branch from `main` and launch the agent | `cd ../proj-agent1 && git checkout -b feature/task-1 main`. Optionally `git branch -d wt/agent1` to drop the placeholder. |
| 3. work | commit normally | agent commits on `feature/task-1`; visible from main desk live | No push needed for the dev to read the agent's commits — `.git/objects` is shared. |
| 4. integrate | merge or PR | from main worktree: `git checkout main && git merge feature/task-1` (or push and open a PR) | Agent's branch keeps living in its slot until reassigned. |
| 5. reuse | new task, same slot | inside the slot, branch from main again | `cd ../proj-agent1 && git checkout -b feature/task-2 main`. Folder and tooling config unchanged. |
| 6. cleanup | retire the slot | when the slot is genuinely no longer needed | `git worktree remove ../proj-agent1` (`--force` if dirty); `git worktree prune` if you `rm -rf`'d it manually. |

> [tip] Reuse slots, don't churn them. Worktree directories are infrastructure, not per-task scratch — the practical rhythm is two or three named slots reassigned as tasks come and go.

## [chapter] Notes {type: vertical}

## [card config] Per-worktree configuration

| code | name | desc | detail |
|------|------|------|--------|
| `extensions.worktreeConfig` | bool, default `false` | opt-in to per-worktree config | Once enabled (`git config extensions.worktreeConfig true`), use `git config --worktree <key> <value>` to write into `.git/worktrees/<id>/config.worktree`. Read after `.git/config`. |
| `worktree.guessRemote` | bool, default `false` | `add` auto-tracks remote when branch name matches exactly one remote-tracking branch | Per-repo or global. Saves typing `--track` for typical "checkout the remote feature branch" flows. |
| `worktree.useRelativePaths` | bool, default `false` | link worktrees with relative paths instead of absolute | Useful when the parent dir of the repo + worktrees may move together. |
| `core.worktree` | should never be shared | per-worktree only — overrides where Git looks for the working tree | If it leaks into shared `config`, every linked worktree breaks. Always set with `--worktree`. |
| `core.bare` | not shared if `true` | per-worktree only when its value differs across worktrees | Same reasoning as `core.worktree` — sharing a `true` value blows up the linked worktrees. |
| `core.sparseCheckout` | not shared unless uniform | per-worktree when sparse layouts differ | If only some worktrees use sparse checkout, `--worktree` it. |

## [card limits] Constraints & gotchas

| code | name | desc | detail |
|------|------|------|--------|
| One branch, one worktree | git refuses to check the same branch out twice | including `main` — if your repo's `main` is checked out in the main desk, no other worktree can use `main` | This is a safety feature. Override with `--force` only if you know what you're doing. |
| Local-only | worktrees are not pushed | metadata lives under `.git/worktrees/` of the local clone | They don't appear on teammates' machines, don't run in CI, don't survive `git clone` to a new host. |
| Submodules | partial support | `git worktree move` refuses with submodules; multiple checkouts of a superproject with submodules is officially experimental | If your repo uses submodules, expect each worktree to need its own submodule init and to hit edge cases. |
| Manual delete leaves stale meta | if you `rm -rf` a worktree dir | `.git/worktrees/<name>/` is now orphaned; `git worktree list` will mark it `prunable` | Run `git worktree prune` (or `--expire <time>`) to clean up. |
| Manual move breaks back-pointers | if you `mv` a worktree without `git worktree move` | the `gitdir` link in `.git/worktrees/<name>/` still points at the old location | Run `git worktree repair` from the moved worktree (or pass moved paths from any worktree) to rewrite the back-pointers. |