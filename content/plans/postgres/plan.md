# Database Internals Learning Plan — PostgreSQL from the inside

**Baseline assumed:** you already use relational databases professionally — transactions, keys, relationships, column types, indexes, triggers, views (materialised or not). This plan never re-teaches *what* those are. It only ever asks *how they are built and why they work*.

**Legend**
- 📖 paper / book · 🎥 video / talk · 📝 article or web doc · 🛠 hands-on
- `≈ pick one` — the listed resources cover the same ground in different formats; choose by taste and time.
- ★ — highest-value step for someone with your baseline (this is where the surprises live).
- ⏱ — rough desk-time estimate.

**At a glance**
`0 Map → 1 History → 2 Storage → 3 Process & memory → 4 Indexes ★ → 5 CC theory ★ → 6 MVCC in PG ★ → 7 Isolation & SSI ★ → 8 WAL & recovery ★ → 9 Query processing → 10 Replication → 11 Modern directions`

**Two spine texts you'll return to constantly.** Get both now; individual modules point at specific chapters rather than asking you to read them front to back.
- 📖 Hironobu Suzuki, *The Internals of PostgreSQL* — https://www.interdb.jp/pg/ — free, online, diagram-heavy, covers up to PG 15. The fastest path from "I know SQL" to "I know what the backend is doing".
- 📖 Egor Rogov, *PostgreSQL 14 Internals* — https://edu.postgrespro.com/postgresql_internals-14_en.pdf — free 600-page PDF from Postgres Professional. Deeper than Suzuki, with source-code references and SQL you can run to observe each claim. This is the closest thing to a definitive text.

---

## Module 0 — The map ⏱ 4–6h

**Goal:** acquire the vocabulary and the component diagram before touching any one component. Everything after this is a zoom-in on one box of this diagram.

`≈ pick one`
- 📖 Hellerstein, Stonebraker & Hamilton (2007), *Architecture of a Database System* — https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf — the canonical single document on how a DBMS is decomposed. Read §1 (process models), §3 (storage), §4 up to 4.5 (transactions), §5 (query processor). Skim the rest.
- 🎥 CMU 15-445/645 *Intro to Database Systems*, Fall 2024, lectures 1–3 — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq — Andy Pavlo. Course site with slides and notes: https://15445.courses.cs.cmu.edu/fall2024/
- 📝 PostgreSQL docs, *Overview of PostgreSQL Internals* — https://www.postgresql.org/docs/current/overview.html — 15 minutes, tells you the five stages a query passes through. Cheap, and the naming here (parse tree → query tree → plan tree) recurs in every later module.

**Exit check:** you can name every process and shared-memory structure involved in a single `UPDATE` and say which one is responsible for durability, which for isolation, and which for finding the row.

---

## Module 1 — Where the ideas came from ⏱ 6–8h

**Goal:** the historical spine. Almost every design constraint in PostgreSQL is a decision someone argued about between 1970 and 1995, and the arguments are more legible than the code.

**The founding claim**
- 📖 Codd (1970), *A Relational Model of Data for Large Shared Data Banks* — https://doi.org/10.1145/362384.362685 — short. Read it for what it actually argues: **data independence**, not tables. The tables are a consequence.

**The first working implementation**
- 📖 Chamberlin et al. (1981), *A History and Evaluation of System R* — https://doi.org/10.1145/358694.358703 — the retrospective is more useful than the original System R paper; it says what they got wrong.

**Postgres itself**
- 📖 Stonebraker & Rowe (1986), *The Design of POSTGRES* — https://dsf.berkeley.edu/papers/ERL-M85-95.pdf — read this specifically for the no-overwrite storage manager. PostgreSQL's MVCC, its VACUUM problem, and its extensibility model (types, operators, index access methods) are all here, as design intent, decades before you met them as operational quirks.

`≈ pick one` for a compressed 50-year survey
- 📖 Stonebraker & Pavlo (2024), *What Goes Around Comes Around… And Around…* — https://db.cs.cmu.edu/papers/2024/whatgoesaround-sigmodrec2024.pdf — the 2024 update to the 2005 classic. Best single piece on why the relational model keeps outliving its challengers.
- 🎥 CMU 15-721 *Advanced Database Systems*, lecture 1, *History of Databases* — https://www.youtube.com/watch?v=LWS8LEQAUVc — the same content as entertainment.

**Optional standing reference:** 📖 *Readings in Database Systems*, 5th ed. (the "Red Book"), Bailis, Hellerstein & Stonebraker — http://www.redbook.io/pdf/redbook-5th-edition.pdf — not a book to read linearly. It's a curated reading list with opinionated editorial commentary; use it to decide which papers are worth your time in any later module.

**Exit check:** you can explain why PostgreSQL never overwrites a row in place, and trace that decision to a 1986 design goal rather than to an implementation accident.

---

## Module 2 — The storage layer: pages, tuples, files ⏱ 6–8h

**Goal:** understand the physical bytes. This is the foundation for indexes, MVCC, WAL and VACUUM — do not skip it, even though it looks mundane.

Cover: the 8 KB page, the slotted-page layout (page header → line pointers growing down, tuples growing up), the tuple header and its system columns, `ctid`, TOAST for oversized attributes, the free space map and visibility map, and the fork-per-relation file layout.

`≈ pick one`
- 📖 Suzuki, ch. 1 *Database Cluster, Databases, and Tables* — https://www.interdb.jp/pg/pgsql01.html
- 📖 Rogov, *PostgreSQL 14 Internals*, Part I ch. 1–3 — https://edu.postgrespro.com/postgresql_internals-14_en.pdf
- 🎥 CMU 15-445 lectures 3–4, *Database Storage* — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq — vendor-neutral; the slotted page design is universal.

**Supplementary**
- 📝 PostgreSQL docs, *Database Physical Storage* — https://www.postgresql.org/docs/current/storage.html — the authoritative byte-level reference, including TOAST strategies and the visibility map.

🛠 **Hands-on (worth the hour):** install `pageinspect` — https://www.postgresql.org/docs/current/pageinspect.html — then create a small table and dump the actual page header, line pointers and tuple headers. Seeing `t_xmin`/`t_xmax` on a real row makes Module 6 almost trivial.

**Exit check:** given a `ctid` you can say exactly which file, which page, and which line pointer it names — and explain why `ctid` is not a stable row identity.

---

## Module 3 — Process and memory architecture ⏱ 4–5h

**Goal:** PostgreSQL is a process-per-connection system with a shared buffer pool. Understand why that choice was made, and what it costs.

Cover: postmaster and backend processes, shared buffers, the clock-sweep replacement policy and why the DBMS refuses to delegate caching to the OS, `work_mem` vs shared memory, background workers, and the lock manager's own data structures (lightweight locks vs heavyweight locks).

`≈ pick one`
- 📖 Suzuki, ch. 2 *Process and Memory Architecture* — https://www.interdb.jp/pg/pgsql02.html — plus ch. 8 *Buffer Manager* — https://www.interdb.jp/pg/pgsql08.html
- 📖 Rogov, Part I ch. 9 *Buffer Cache* — https://edu.postgrespro.com/postgresql_internals-14_en.pdf
- 🎥 Bruce Momjian, *Inside PostgreSQL Shared Memory* — https://momjian.us/main/presentations/internals.html — Momjian's talks page is a permanent bookmark; several later modules point back to it.

**Historical counterpoint (short, delightful)**
- 📖 Stonebraker (1981), *Operating System Support for Database Management* — https://doi.org/10.1145/358699.358703 — the classic argument for why a DBMS reimplements buffering, scheduling and file management instead of trusting the OS. Still the reason `shared_buffers` exists.

**Exit check:** you can explain why a page can be dirty in shared buffers, clean on disk, and still recoverable after a crash — and what enforces that ordering. (If you can't yet, that's Module 8.)

---

## Module 4 — Indexes ★ ⏱ 10–14h

**Goal:** you use indexes daily; here you learn the data structures and the invariants that make them concurrent-safe. This is the module with the highest theory-per-hour ratio.

### 4a — B-trees, the general case

`≈ pick one` for the origin
- 📖 Bayer & McCreight (1972), *Organization and Maintenance of Large Ordered Indices* — https://doi.org/10.1007/BF00288683 — the original. Short, formal, readable.
- 📖 Comer (1979), *The Ubiquitous B-Tree* — https://doi.org/10.1145/356770.356776 — the survey that made B-trees canonical; explains B+ trees and the variant zoo far more accessibly than the original.
- 🎥 CMU 15-445 lectures 7–8, *B+Tree Indexes* — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq

**Then the modern treatment** (this is where the real engineering is):
- 📖 Graefe (2011), *Modern B-Tree Techniques* — https://www.nowpublishers.com/article/Details/DBS-028 — survey covering latching vs locking, key normalisation, prefix/suffix truncation, blink-trees. Read at least the sections on concurrency; latch-coupling is the answer to "how is a tree modified while a thousand readers walk it".

### 4b — PostgreSQL's actual implementations

- 📖 Lehman & Yao (1981), *Efficient Locking for Concurrent Operations on B-Trees* — https://doi.org/10.1145/319628.319663 — the B-link tree: one sideways pointer per node lets readers recover from concurrent splits without lock-coupling. This is the variant PostgreSQL actually implements; the README below assumes you've met it.
- 📝 `src/backend/access/nbtree/README` — https://github.com/postgres/postgres/blob/master/src/backend/access/nbtree/README — unusually good prose. Explains PostgreSQL's Lehman & Yao variant, page deletion, and why index tuples can't simply be deleted when a row dies.
- 📖 Suzuki, ch. 1 §1.4 and ch. 5 for index/heap interaction; Rogov Part III (~124 pages on indexes) is the exhaustive treatment — https://edu.postgrespro.com/postgresql_internals-14_en.pdf

**The extensibility story** — why PostgreSQL has GiST, GIN, SP-GiST, BRIN at all:
- 📖 Hellerstein, Naughton & Pfeffer (1995), *Generalized Search Trees for Database Systems* — https://www.vldb.org/conf/1995/P562.PDF — the paper that turned "index" into a plugin interface. This is the direct ancestor of every PostGIS, full-text and vector index you've ever used.
- 📝 PostgreSQL docs, *Index Access Method Interface Definition* — https://www.postgresql.org/docs/current/indexam.html

### 4c — The other family, for contrast
- 📖 O'Neil et al. (1996), *The Log-Structured Merge-Tree (LSM-Tree)* — https://www.cs.umb.edu/~poneil/lsmtree.pdf — read this to understand what PostgreSQL is *not*. The read/write amplification trade-off against B-trees is the single most important axis in modern storage engines.

### 4d — Practitioner's layer (light, high ROI)
- 📝 Markus Winand, *Use The Index, Luke!* — https://use-the-index-luke.com/ — free web edition of *SQL Performance Explained*. Cheap to consume, and it connects the structure to the query plans you already read.

**Exit check:** you can explain why an index-only scan needs the visibility map, why `VACUUM` has to touch indexes at all, and what a B-tree page split does to concurrent readers mid-descent.

---

## Module 5 — Concurrency control theory ★ ⏱ 8–10h

**Goal:** the theory layer. Serializability is a formal property with a proof obligation; "isolation level" is a set of engineering compromises against it. Get the theory before the PostgreSQL specifics, or the specifics will look arbitrary.

Cover: schedules and histories, conflict-serializability and the precedence graph, two-phase locking and why 2PL yields serializability, lock granularity and intention locks, deadlock detection vs prevention, and multiversion concurrency control as an alternative family.

**The foundations**
- 📖 Gray et al. (1976), *Granularity of Locks and Degrees of Consistency in a Shared Data Base* — https://doi.org/10.1145/582318.582381 — where "degrees of consistency" (the ancestor of isolation levels) and multi-granularity locking are introduced.
- 📖 Gray (1981), *The Transaction Concept: Virtues and Limitations* — https://www.hpl.hp.com/techreports/tandem/TR-81.3.pdf — the paper that names ACID's substance. Genuinely enjoyable prose.

`≈ pick one` for the systematic treatment
- 📖 Bernstein, Hadzilacos & Goodman (1987), *Concurrency Control and Recovery in Database Systems* — free from the author's page: https://www.microsoft.com/en-us/research/people/philbe/ — the rigorous textbook. Chapters 1–3 and 5 are the core. Dense but complete.
- 🎥 CMU 15-445 lectures 15–17, *Concurrency Control* — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq — the same material at a third of the effort, with worked schedule examples.

**Exit check:** given a schedule of two transactions you can draw the precedence graph and decide serializability by hand; you can state what 2PL guarantees and what it costs.

---

## Module 6 — MVCC as PostgreSQL implements it ★ ⏱ 10–12h

**Goal:** the single most consequential design decision in PostgreSQL, and the one that produces the most operational surprises. Module 2 gave you the tuple header; now it earns its keep.

Cover: `xmin`/`xmax` and tuple visibility, transaction IDs and the commit log (`clog`), snapshots and `xip` lists, hint bits, HOT updates, why readers never block writers, dead tuples, VACUUM and autovacuum, freezing and transaction ID wraparound, and index bloat.

**Where it came from**
- 📖 Reed (1978), *Naming and Synchronization in a Decentralized Computer System* — https://www.mit.edu/~Saltzer/publications/TRs+TMs/CSR/MIT-LCS-TR-205.pdf — the MIT thesis where multiversioning was born; skim for the idea, not the system.
- 📖 Bernstein & Goodman (1983), *Multiversion Concurrency Control — Theory and Algorithms* — https://doi.org/10.1145/319996.319998 — the canonical formalization: what serializability means when reads are served from old versions. Extends Module 5's theory to the MVCC family.
- 📖 Stonebraker (1987), *The Design of the POSTGRES Storage System* — https://dsf.berkeley.edu/papers/ERL-M87-06.pdf — the no-overwrite storage manager as designed, one level deeper than Module 1's design paper; VACUUM's debt is visible here before the first line of code was written.

`≈ pick one`
- 🎥 Bruce Momjian, *MVCC Unmasked* — https://momjian.us/main/presentations/internals.html (also on YouTube: https://www.youtube.com/watch?v=byl_CoucJE0) — ~60 min, built entirely from live queries against `pageinspect`. Probably the best single artefact on this topic in any format.
- 📖 Suzuki, ch. 5 *Concurrency Control* — https://www.interdb.jp/pg/pgsql05.html — the written equivalent, with the visibility-check algorithm spelled out step by step.
- 📖 Rogov, Part II *Transactions and MVCC* (incl. ~60 pages on locks) — https://edu.postgrespro.com/postgresql_internals-14_en.pdf — the deepest of the three.
- 🎥 (light) SE Radio 496, *Bruce Momjian on MVCC in Postgres* — https://se-radio.net/2022/01/episode-496-bruce-momjian-on-multi-version-concurrency-control-in-postgres-mvcc/ — a commute-friendly version, no visuals needed.

**Then the maintenance consequence**
- 📝 PostgreSQL docs, *Routine Vacuuming* — https://www.postgresql.org/docs/current/routine-vacuuming.html — read §25.1.5 on wraparound specifically. Copy-on-write storage means the correctness of your database depends on a background process keeping up. That's a real trade-off, not a bug.

**Exit check:** you can explain why a table can grow while rows are only ever deleted, why `SELECT` can dirty a page, and what a 32-bit XID space forces the system to do.

---

## Module 7 — Isolation levels, anomalies, and serializable snapshot isolation ★ ⏱ 6–8h

**Goal:** this is the module that will most change how you write application code. Snapshot isolation is *not* serializability, and the gap has a name and a shape.

- 📖 Berenson, Bernstein, Gray, Melton, O'Neil & O'Neil (1995), *A Critique of ANSI SQL Isolation Levels* — https://arxiv.org/abs/cs/0701157 — shows that the ANSI phenomena (dirty read, non-repeatable read, phantom) fail to characterise real implementations, and defines Snapshot Isolation properly. **Write skew** is introduced here. Read this one closely; it is short and it is the key to the module.
- 📖 (optional, more rigorous) Adya, Liskov & O'Neil (2000), *Generalized Isolation Level Definitions* — https://doi.org/10.1109/ICDE.2000.839388 — implementation-independent definitions in terms of dependency graphs. Take it if the 1995 paper leaves you wanting formality.

**Then PostgreSQL's answer:**
- 📖 Ports & Grittner (2012), *Serializable Snapshot Isolation in PostgreSQL* — https://dl.acm.org/doi/10.14778/2367502.2367523 — how PG 9.1 got true serializability without locking reads, by detecting dangerous structures in the read/write dependency graph at runtime. A rare paper that is both a research contribution and an engineering post-mortem.
- 📝 PostgreSQL wiki, *SSI* — https://wiki.postgresql.org/wiki/SSI — worked examples of the anomalies SSI catches, with runnable SQL.
- 📝 PostgreSQL docs, *Transaction Isolation* — https://www.postgresql.org/docs/current/transaction-iso.html — reread this now; it will say something different than it did before.

🛠 **Hands-on:** reproduce a write-skew anomaly in two `psql` sessions under `REPEATABLE READ`, then watch it become a serialization failure under `SERIALIZABLE`. Fifteen minutes, permanent effect.

**Exit check:** you can construct a write-skew scenario from scratch, explain why no amount of `REPEATABLE READ` prevents it, and state what your application must do when `SERIALIZABLE` throws `40001`.

---

## Module 8 — Durability: write-ahead logging and recovery ★ ⏱ 8–10h

**Goal:** the "trustworthiness" half of your question. Why does a system that buffers writes in volatile memory survive being unplugged?

Cover: the WAL protocol and the log-before-data rule, LSNs, full-page writes and torn pages, checkpoints, redo and undo, ARIES' three passes (analysis, redo, undo), CLRs and repeating history, and `fsync` as the thin place where all of this meets the OS.

**The theory**
- 📖 Mohan et al. (1992), *ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging* — https://cs.stanford.edu/people/chrismre/cs345/rl/aries.pdf — the algorithm that every serious DBMS descends from. Notoriously dense; read §1–3 and the recovery walkthrough, skim the rest. If it stalls you, take the CMU lecture first and return.

`≈ pick one` for a gentler path in
- 🎥 CMU 15-445 lectures 19–20, *Logging Schemes* and *Database Recovery* — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq — ARIES explained with diagrams, in about 90 minutes. Do this first if ARIES is heavy going.
- 📖 Gray & Reuter (1992), *Transaction Processing: Concepts and Techniques* — the reference work; not free, not to be read cover to cover, but the durability chapters are the best long-form treatment that exists. Use as a lookup.

**PostgreSQL specifics**

> ⚠️ **PostgreSQL diverges from ARIES on purpose.** Its recovery is redo-only — no undo pass, no CLRs — because MVCC never overwrites in place: the "undo information" is simply the old row versions already sitting in the heap, and an aborted transaction's rows are invisible by the Module 6 visibility rules alone. The 1986/87 no-overwrite decision (Modules 1 and 6) is what buys this simplification. Read ARIES as the general theory, then notice which two of its three passes PostgreSQL got to delete.

- 📖 Suzuki, ch. 9 *Write Ahead Logging* — https://www.interdb.jp/pg/pgsql09.html — the clearest account of LSNs, full-page writes and checkpoint mechanics.
- 📖 Rogov, Part I ch. 10 *WAL* — https://edu.postgrespro.com/postgresql_internals-14_en.pdf
- 🎥 Momjian, *Postgres WAL* — https://momjian.us/main/presentations/internals.html

**The cautionary tale — read this one**
- 📝 *PostgreSQL's fsync() surprise* (LWN, 2018) — https://lwn.net/Articles/752063/ — PostgreSQL's durability assumptions about Linux `fsync()` error reporting turned out to be wrong for twenty years. Also: https://wiki.postgresql.org/wiki/Fsync_Errors. This is the module's real lesson: durability is a chain of assumptions across layers you do not control.

**Exit check:** you can explain what "repeating history during redo" means and why it's necessary, why full-page writes exist despite doubling WAL volume, what a checkpoint actually bounds — and why PostgreSQL gets away without an undo pass at all.

---

## Module 9 — Query processing and optimisation ⏱ 10–12h

**Goal:** you already read `EXPLAIN` output. Here you learn what produced it, and why cost-based optimisation is a search problem with an estimation problem hiding inside it.

### 9a — The founding algorithm
- 📖 Selinger et al. (1979), *Access Path Selection in a Relational Database Management System* — https://www2.cs.duke.edu/courses/spring03/cps216/papers/selinger-etal-1979.pdf — dynamic programming over join orders, interesting orders, and a cost model. Nearly 50 years old and still the shape of PostgreSQL's planner. One of the most influential systems papers ever written.

### 9b — Execution
- 📖 Graefe (1993), *Query Evaluation Techniques for Large Databases* — https://doi.org/10.1145/152610.152611 — the encyclopaedic survey of joins, sorting, aggregation and the iterator ("Volcano") model. Use as reference, not linear reading; the join-algorithm sections are the core.

`≈ pick one` for PostgreSQL's planner and executor specifically
- 📖 Suzuki, ch. 3 *Query Processing* — https://www.interdb.jp/pg/pgsql03.html — traces a query from parse tree to plan tree with the actual cost formulas.
- 📖 Rogov, Part IV *Query Execution* (~115 pages) — https://edu.postgrespro.com/postgresql_internals-14_en.pdf
- 🎥 Momjian, *Explaining the Postgres Query Optimizer* — https://momjian.us/main/presentations/internals.html

### 9c — Statistics and where the model breaks
- 📝 PostgreSQL docs, *How the Planner Uses Statistics* — https://www.postgresql.org/docs/current/planner-stats-details.html — selectivity estimation, histograms, MCV lists, and extended statistics for correlated columns.
- 📖 Leis et al. (2015), *How Good Are Query Optimizers, Really?* — https://www.vldb.org/pvldb/vol9/p204-leis.pdf ★ — an empirical demolition: cardinality estimation errors dominate, and they compound multiplicatively across joins. Read this and you will never again trust an estimated row count without checking it. The most practically useful paper in this module.

🛠 **Hands-on:** take a slow query from work, read the plan against `EXPLAIN (ANALYZE, BUFFERS)`, and find where estimated and actual rows diverge. Reference glossary: https://www.pgmustard.com/docs/explain

**Exit check:** you can explain why the planner chose a nested loop over a hash join, what statistic drove the decision, and what would have to change for it to choose differently.

---

## Module 10 — Replication and distribution ⏱ 6–8h

**Goal:** extend durability and consistency past a single machine. Lighter treatment — this is a whole field, and the goal here is a correct mental model rather than mastery.

- 📖 Kleppmann, *Designing Data-Intensive Applications*, ch. 5 (replication), 7 (transactions) and 9 (consistency and consensus) — https://dataintensive.net/ — the best synthesis available for this material; ch. 7 will also retroactively sharpen Module 7.
- 📝 Kyle Kingsbury, *Consistency Models* — https://jepsen.io/consistency — an interactive map of the guarantees and how they relate. Ten minutes, permanently useful.
- 📝 PostgreSQL docs, *High Availability, Load Balancing, and Replication* — https://www.postgresql.org/docs/current/high-availability.html — streaming vs logical replication, synchronous commit levels, replication slots.
- 📝 *Raft: understandable distributed consensus* — https://raft.github.io/ — the visualisation plus the paper. Consensus is what PostgreSQL failover tooling (e.g. Patroni — https://github.com/patroni/patroni) delegates to etcd/Consul; worth knowing what it's delegating.

**Exit check:** you can explain what `synchronous_commit = on` actually guarantees, what it doesn't, and why a Postgres primary/standby pair is not by itself a consensus system.

---

## Module 11 — Modern directions ⏱ 5–7h, optional

**Goal:** situate what you've learned against where the field is now. Everything above describes a disk-oriented, row-store, single-node OLTP engine — an architecture designed for 1980s hardware assumptions.

- 📖 Kersten et al. (2018), *Everything You Always Wanted to Know About Compiled and Vectorized Queries But Were Afraid to Ask* — https://www.vldb.org/pvldb/vol11/p2209-kersten.pdf — the two ways past the tuple-at-a-time iterator model. Relevant to PostgreSQL's JIT and to why columnar engines beat it on analytics.
- 📖 Verbitski et al. (2017), *Amazon Aurora: Design Considerations for High Throughput Cloud-Native Relational Databases* — https://www.allthingsdistributed.com/files/p1041-verbitski.pdf — "the log is the database": what happens when you keep the Postgres front end and replace everything below the WAL. The clearest example of storage/compute disaggregation.
- 📝 PostgreSQL docs, *Table Access Method Interface Definition* — https://www.postgresql.org/docs/current/tableam.html — pluggable storage, added in PG 12, is the escape hatch from heap-and-vacuum. See OrioleDB (https://www.orioledb.com/) for what people are building on it.
- 🎥 CMU 15-721 *Advanced Database Systems* (Spring 2024) — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYa_zX-KeMJui7pcN1rIaIJ — in-memory, columnar, vectorised, multi-core. Graduate-level; treat as a buffet, not a course.

---

## Hands-on track — run in parallel, not after

Reading about a B-tree and implementing one produce very different kinds of knowledge. Pick **one** of these and run it alongside Modules 2–9.

`≈ pick one`
- 🛠 **CMU BusTub projects** — https://github.com/cmu-db/bustub — buffer pool manager, B+ tree index, query execution, concurrency control. C++, graded via public autograder, directly paired with the 15-445 lectures. The most rigorous option.
- 🛠 **"Let's Build a Simple Database"** — https://cstack.github.io/db_tutorial/ — build a SQLite clone in C, incrementally, from REPL to B-tree. Well-paced, finishable, genuinely instructive.
- 🛠 **"Build Your Own Database From Scratch"** — https://build-your-own.org/database/ — Go, covers B-tree + copy-on-write + a transactional KV layer + a small relational layer on top. Closest in spirit to PostgreSQL's storage model.
- 🛠 **PostgreSQL source spelunking (lowest effort, highest specificity)** — https://github.com/pghacking/awesome-postgres-hacking — curated entry points into the actual codebase, including the exceptionally well-written `README` files under `src/backend/access/`. Pair with Tom Lane's *A Tour of PostgreSQL Internals*.

---

## Standalone chapters — off-spine, kept deliberately

Not required by the sequence, but each is worth knowing exists.

- 📖 Alex Petrov, *Database Internals* — https://www.databass.dev/ — a book-length version of roughly Modules 2–8 plus distributed systems. If you'd rather have one purchasable book than assembled papers, this is it. Weaker on PostgreSQL specifics than Rogov.
- 📖 Stonebraker et al. (2007), *The End of an Architectural Era* — https://doi.org/10.14778/1454159.1454211 — the argument that legacy RDBMS architecture is 30 years obsolete. Wrong in its predictions, right in its diagnosis; a useful adversarial read against everything in Modules 2–8.
- 📝 pganalyze blog and *5mins of Postgres* — https://pganalyze.com/blog — short, technically serious, frequently on internals (index selection, planner behaviour, vacuum). Good drip-feed between modules.
- 🎥 **Postgres.FM** — https://postgres.fm/ — weekly, ~35 min, hosted by Postgres practitioners. Good passive reinforcement; episode topics map well onto Modules 4, 6 and 9.
- 📖 Cahill, Röhm & Fekete (2008), *Serializable Isolation for Snapshot Databases* — https://doi.org/10.1145/1376616.1376690 — the research predecessor to Module 7's PostgreSQL paper; take it if you want the algorithm's derivation rather than its deployment.

---

## Sequencing notes

**The dependency graph is not linear everywhere.** Modules 2 and 3 are prerequisites for essentially everything. Modules 4, 5 and 9 are largely independent of each other. Module 6 requires 2 and 5; Module 7 requires 6; Module 8 requires 2 and 3. If you want a shorter path, `0 → 2 → 5 → 6 → 7 → 8` is the "how is this trustworthy" spine and `0 → 2 → 4 → 9` is the "how is this fast" spine.

**Where the surprises are, given your baseline.** Modules 6, 7 and 8 are where things you already do professionally turn out to rest on assumptions you'd never inspected — non-overwriting storage and its vacuum debt, snapshot isolation not being serializability, and durability being a cross-layer assumption chain. Module 4c and Module 9c are the other two places where the received wisdom will move.

**On the historical papers.** Read them for the arguments, not the syntax. Several describe systems that no longer exist; the value is that they state their constraints explicitly, which modern documentation never does.
