# Reference: Git — Worktrees + Agents

Consolidated from a generic parallel-agent setup write-up (local) and the official `git-worktree` man page (authoritative). The first source contributes the mental model, slot lifecycle, and the parallel-agents framing; the second drives precise command and option semantics. PyCharm-specific tooling and project-local helper scripts in the local source are intentionally excluded — this Reference is platform-agnostic.

## The problem worktrees solve

A standard Git repo has **one working directory** and **one `HEAD`**. When two processes — two terminals, two AI agents, two IDE windows — share that directory, they share `HEAD`. A `git checkout feature/X` from one moves `HEAD` for everyone. Other processes are now silently operating on the wrong branch.

This is the consequence of a single working tree. `git worktree` removes that single point of failure: each linked worktree gets its own working directory, its own `HEAD`, and its own index. They all back onto the same `.git` — same objects, same refs, same remotes.

## Mental model

One **filing cabinet** (`.git`), many **desks** (worktrees). A commit made at desk 2 is visible from desk 1 immediately, with no push or fetch — the cabinet is shared. Each desk has its own files and its own active branch; there is no race over `HEAD`.

## Anatomy of `.git`

```
.git/
  HEAD                 ← main worktree's current branch
  config               ← remote URLs, settings (shared)
  objects/             ← all blobs/trees/commits (shared)
  refs/                ← branch + tag pointers (shared, mostly)
  worktrees/
    agent1/
      HEAD             ← this worktree's current branch
      gitdir           ← back-pointer to the linked worktree dir
      locked           ← (optional) reason text; presence blocks prune/move/remove
```

**Per-worktree** (each linked worktree has its own): `HEAD`, the index, pseudo-refs (`MERGE_HEAD`, `CHERRY_PICK_HEAD`, …), and `refs/bisect/*`, `refs/worktree/*`, `refs/rewritten/*`.

**Shared** across all worktrees: everything else under `refs/`, `objects/`, `config`, hooks.

A linked worktree's top-level `.git` is a *file* (not a directory) containing a `gitdir:` pointer back to `.git/worktrees/<name>/` in the main repo. Inside the linked worktree, `$GIT_DIR` is that private directory and `$GIT_COMMON_DIR` is the main `.git`.

## Subcommand reference

### `git worktree add <path> [<commit-ish>]`

Creates a linked worktree at `<path>` and checks out `<commit-ish>` there. If `<commit-ish>` is omitted, Git creates a new branch named after the path's basename, starting at `HEAD`. Refuses (without `--force`) if the branch is already checked out elsewhere.

Key options:

- `-b <branch>` — create a new branch from `<commit-ish>` and check it out.
- `-B <branch>` — same as `-b` but resets the branch tip if it already exists. Destructive.
- `-d, --detach` — check out `<commit-ish>` with a detached `HEAD` (no branch).
- `--orphan` — start a new worktree on an unborn branch with an empty index.
- `--no-checkout` — register the worktree without writing files; useful when combined with `git sparse-checkout`.
- `--lock [--reason <text>]` — atomically create + lock.
- `--track` / `--no-track` — explicitly mark the new branch as tracking the source.
- `--guess-remote` — when the branch name matches exactly one remote-tracking branch, set up tracking automatically. Default off; flip globally with `worktree.guessRemote = true`.
- `-f, --force` — bypass safety checks (path exists, branch already checked out). Use **twice** to override locked or missing entries.

### `git worktree list [-v | --porcelain [-z]]`

Prints every worktree (main first), with revision, branch, and any annotation (`locked`, `prunable`). `-v` adds the lock reason and prunable cause on a follow-up line. `--porcelain` is the stable machine-readable surface — one attribute per line, blank line between entries, attribute names: `worktree`, `HEAD`, `branch`, `detached`, `locked`, `prunable`. `-z` NUL-terminates lines for safe parsing.

### `git worktree lock [--reason <text>] <worktree>`

Marks a worktree locked. While locked, the worktree:

- is exempt from automatic pruning (`gc.worktreePruneExpire`),
- refuses `move` and `remove` without `--force` twice.

Useful for worktrees on portable drives (USB, network mounts) and for "agent mid-task — do not nuke" labels.

### `git worktree unlock <worktree>`

Removes the lock. Inverse of `lock`.

### `git worktree move <worktree> <new-path>`

Moves the working directory and rewrites the gitdir back-pointers. Cannot move the **main worktree**. Cannot move a worktree that contains submodules. Locked worktrees require `--force` twice.

### `git worktree remove [-f] <worktree>`

Deletes the working directory and deregisters it from `.git/worktrees/`. Refuses to remove an **unclean** worktree without `-f`; refuses a **locked** one without `-f -f`. Cannot remove the main worktree.

### `git worktree prune [-n] [-v] [--expire <time>]`

Drops stale `.git/worktrees/<name>/` entries whose working directories no longer exist on disk. Run after a manual `rm -rf`. `-n` previews; `--expire` only prunes entries older than the given time.

### `git worktree repair [<paths>...]`

Rewrites broken `gitdir`/main back-pointers when worktrees were moved manually (i.e., not via `git worktree move`).

- Main moved: run `repair` from the main worktree to reconnect linked ones.
- Linked moved: run `repair` from inside the moved worktree to reconnect to main.
- Multiple linked moved: run `repair` from any worktree, passing each new path as an argument.

`repair` is for **moves** only. For **deletes**, use `prune`.

## Configuration knobs

- `worktree.guessRemote` (bool, default `false`) — `add` auto-tracks remote when branch name matches a single remote-tracking branch.
- `worktree.useRelativePaths` (bool, default `false`) — link worktrees with relative paths (instead of absolute).
- `extensions.worktreeConfig` (bool, default `false`) — opt-in: enables a per-worktree `config.worktree` file under `.git/worktrees/<id>/`, read after `.git/config`. Set values with `git config --worktree <key> <value>`.

Variables that should **not** be in the shared `config` if they differ per worktree:

- `core.worktree` — should never be shared.
- `core.bare` — must not be shared if `true`.
- `core.sparseCheckout` — share only if every worktree uses the same sparse layout.

## Naming and setting up agent slots

Two naming conventions are common:

- **By agent slot** (reusable, generic): `proj-agent1`, `proj-agent2`. Recommended when running multiple agents in parallel.
- **By task** (descriptive, disposable): `proj-feature-login`, `proj-bugfix-api`.

Bootstrap the slots once, with placeholder branches that sit at `HEAD`:

```bash
cd ~/dev/myproject
git worktree add ../myproject-agent1 -b wt/agent1
git worktree add ../myproject-agent2 -b wt/agent2
```

The `wt/` prefix marks these branches as worktree infrastructure. They never get pushed.

```
~/dev/
  myproject/          ← main worktree, on main
  myproject-agent1/   ← parked on wt/agent1
  myproject-agent2/   ← parked on wt/agent2
```

Verify:

```
$ git worktree list
/home/you/dev/myproject         abc1234 [main]
/home/you/dev/myproject-agent1  abc1234 [wt/agent1]
/home/you/dev/myproject-agent2  abc1234 [wt/agent2]
```

## Slot lifecycle

```
worktree add  →  assign branch  →  agent works  →  merge / PR  →  reuse slot
                                                                      OR
                                                                  remove slot
```

1. **Setup** — `git worktree add ../proj-agent1 -b wt/agent1`. Once.
2. **Assign** — inside the slot, branch from main and start the agent: `cd ../proj-agent1 && git checkout -b feature/task-1 main`. Optionally drop the placeholder: `git branch -d wt/agent1`.
3. **Work** — the agent commits on its branch; commits are visible from the main desk live.
4. **Integrate** — from the main worktree: `git checkout main && git merge feature/task-1`, or push and open a PR.
5. **Reuse** — same slot, fresh branch: `cd ../proj-agent1 && git checkout -b feature/task-2 main`. Folder and tooling configuration unchanged.
6. **Cleanup** — `git worktree remove ../proj-agent1` (`--force` if dirty); `git worktree prune` if you `rm -rf`'d it manually.

The practical rhythm is to maintain two or three named agent slots and reassign them to new branches as tasks come and go — slots are infrastructure, not per-task scratch.

## Daily inspection

From any worktree:

```bash
git worktree list                           # who's where
git log --oneline --all --graph             # all branches across all worktrees
git diff main..feature/agent-1              # what agent 1 changed
git diff --name-only main..feature/agent-1  # just the file list
```

`refs/` and `objects/` are shared, so these commands work from any desk without push/fetch.

## Constraints and gotchas

- **One branch, one worktree.** Git refuses to check out the same branch in two worktrees, including `main`. Override with `--force` only if intentional.
- **Local-only.** Worktree metadata lives under your local `.git/worktrees/`. It does not push, does not appear on teammates' clones, does not run in CI, does not survive a fresh `git clone` to another host.
- **Submodules — limited support.** `git worktree move` refuses if the worktree contains submodules; multiple checkouts of a superproject with submodules are officially experimental. Each worktree needs its own submodule init.
- **Manual delete leaves stale metadata.** `rm -rf`'ing a worktree directory orphans its `.git/worktrees/<name>/` entry. `git worktree list` will mark it `prunable`; `git worktree prune` cleans it up.
- **Manual move breaks back-pointers.** Use `git worktree move` so Git can rewrite the gitdir links. If you already moved it manually, run `git worktree repair`.
- **Per-worktree config.** `core.worktree`, `core.bare`, `core.sparseCheckout` should not be in the shared `config` if they differ per worktree. Enable `extensions.worktreeConfig = true`, then use `git config --worktree …`.

## Quick reference card

```bash
# initial setup (one time, no task needed)
git worktree add ../proj-agent1 -b wt/agent1
git worktree add ../proj-agent2 -b wt/agent2

# assign a real task to a slot
cd ../proj-agent1
git checkout -b feature/task-name main
git branch -d wt/agent1                   # optional: drop the placeholder

# inspect
git worktree list
git log --oneline --all --graph

# reassign slot to next task
cd ../proj-agent1
git checkout -b feature/next-task main

# cleanup
git worktree remove ../proj-agent1        # remove + deregister
git worktree prune                        # clean up after manual rm -rf
git worktree lock ../proj-agent1          # protect from accidental removal
git worktree unlock ../proj-agent1        # undo lock
git worktree repair                       # fix back-pointers after manual move
```