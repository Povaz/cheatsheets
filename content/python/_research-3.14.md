# Research: Python 3.14

Last updated: 2026-04-18
Pipeline phase: complete (shipped: 2026-04-18)

> Note: this research note was authored during the initial project bootstrap,
> not via the `/new-cheatsheet` slash command. Subsequent refreshes should
> follow the standard `/refresh-cheatsheet` pipeline.

## Sources

| Source | URL | Accessed | Notes |
|--------|-----|----------|-------|
| What's New In Python 3.14 (official) | https://docs.python.org/3/whatsnew/3.14.html | 2026-04-18 | Primary authoritative source for the 3.14 release |
| Python Language Reference | https://docs.python.org/3/reference/ | 2026-04-18 | Version-agnostic language surface |
| PEP index | https://peps.python.org/ | 2026-04-18 | Canonical PEP numbers and titles |

## Key findings

### PEPs shipped in 3.14

- **PEP 649** — Deferred Evaluation Of Annotations Using Descriptors. Now the default behavior. Annotations stored in lazy annotate functions, evaluated on demand. Companion: **PEP 749** implements it; new `annotationlib` module exposes `get_annotations()` with `Format.VALUE / FORWARDREF / STRING`.
- **PEP 734** — Multiple Interpreters in the Standard Library. New `concurrent.interpreters` module; subinterpreters get true multi-core parallelism. New `concurrent.futures.InterpreterPoolExecutor`.
- **PEP 750** — Template String Literals. New `t'...'` prefix returns `Template` objects (not `str`). Enables safe-by-construction HTML/SQL escaping. Supporting `string.templatelib` module.
- **PEP 758** — `except` and `except*` without brackets when no `as` clause: `except TimeoutError, ConnectionRefusedError:` is now valid.
- **PEP 765** — `return` / `break` / `continue` inside a `finally` block now emits `SyntaxWarning` (statement is unreachable-style / subtly wrong semantics).
- **PEP 768** — Safe external debugger interface for CPython. New `sys.remote_exec(pid, script_path)` to attach to a running process. Opt-out via `PYTHON_DISABLE_REMOTE_DEBUG` or `-X disable-remote-debug`.
- **PEP 776** — Emscripten is now an officially supported platform (Tier 3).
- **PEP 779** — Free-threaded Python officially supported (still opt-in build; ~5–10% single-threaded penalty).
- **PEP 784** — Zstandard support in the stdlib. New `compression.zstd` module; zstd-compressed archives in `tarfile`, `zipfile`, `shutil`. Unified `compression.*` namespace also re-exports `bz2`, `gzip`, `lzma`, `zlib`.
- **PEP 761** — PGP signatures on official releases discontinued (build-process change).
- **PEP 741** — Python configuration C API enhancements (C API consumers only).

### Interpreter & runtime

- Tail-call interpreter: ~3–5% pyperformance uplift; opt-in build (`--with-tail-call-interp`); requires Clang 19+ on x86-64 / AArch64.
- Incremental cycle GC: two generations (young / old) instead of three; `gc.collect(1)` performs an increment; cycle collection pause times cut by up to an order of magnitude.
- Color tracebacks enabled by default (respects `NO_COLOR` / `FORCE_COLOR`).
- Better error messages: keyword typo suggestions (`whille` → `while`), clear `'elif' block follows an 'else' block`, clearer unhashable-type errors, context manager protocol mismatches.
- `-X importtime=2` also accounts for already-cached modules.
- `-c` source argument is now auto-dedented.
- `-J` is no longer reserved for Jython (free flag).

### REPL

- Syntax highlighting enabled by default. Disable via `PYTHON_BASIC_REPL` or `NO_COLOR`. Theme API: experimental `_colorize.set_theme()`.
- Tab-completion for `import` statements and `from X import Y` submodule names.
- Multi-line editing (carried forward from 3.13).

### New / renamed stdlib modules

- `annotationlib` — introspect deferred annotations.
- `compression` — umbrella package; `compression.zstd` is new, others re-exports. Legacy `lzma`/`bz2`/`gzip`/`zlib` are *not* deprecated; no removal planned before 3.19.
- `concurrent.interpreters` — subinterpreters (PEP 734).
- `string.templatelib` — `Template` / `Interpolation` types for PEP 750.

### Selected stdlib additions (non-exhaustive, cheatsheet-relevant)

- `pathlib.Path.copy() / copy_into() / move() / move_into()` — native recursive copy/move.
- `pathlib.Path.info` — cached stat-like info object.
- `asyncio` introspection: `python -m asyncio ps PID`, `python -m asyncio pstree PID`, `asyncio.capture_call_graph()` / `print_call_graph()`.
- `heapq.heapify_max() / heappush_max() / heappop_max() / heapreplace_max() / heappushpop_max()`.
- `functools.Placeholder` sentinel for partial-argument holes; `reduce(initial=...)` keyword form.
- `operator.is_none()` / `is_not_none()`.
- `float.from_number()` / `complex.from_number()` / `Decimal.from_number()` / `Fraction.from_number()`.
- `map(..., strict=True)` mirrors `zip(..., strict=True)`.
- `pdb`: remote attach `python -m pdb -p PID`; `$_asynctask`; `set_trace_async()`.
- `http.server.HTTPSServer`; CLI `--tls-cert/--tls-key/--tls-password-file`.
- `concurrent.futures.ProcessPoolExecutor` default start method now `'forkserver'` on Unix (except macOS).

### Syntax surface (quick-ref for the card)

- `except A, B:` legal (PEP 758)
- `t"hello {name}"` is a `Template`, not a `str` (PEP 750)
- `def f(x: Undefined): ...` — `Undefined` not evaluated at def time (PEP 649)
- `return` in `finally` → `SyntaxWarning` (PEP 765)

## Open questions

- None for initial authoring. Ongoing: when 3.15 lands, candidates to watch include further `annotationlib` API settling and `concurrent.interpreters` ergonomics.

## Proposed scope

Six main cards plus a "what's new" strip:

1. Data types & literals (all versions)
2. Control flow (if/match/for/while/try/with)
3. Functions & classes (def, args, dataclass, property, dunders)
4. Comprehensions & idioms (f-strings, walrus, unpacking, enumerate/zip)
5. Standard library highlights (pathlib, itertools, functools, collections, typing, contextlib)
6. Async (asyncio surface + 3.14 introspection)

Plus:

- Top: "What's new in 3.14" — 5–6 one-liners covering PEPs 649, 750, 758, 765, 779, 784 with a nod to PEP 768 and PEP 734.
- Common traps / gotchas surfaced as `> [warn]` callouts inside the cards they relate to (not a separate card).
