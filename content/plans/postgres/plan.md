# Database Internals Learning Plan — PostgreSQL from the inside

**Topic:** How PostgreSQL is built — storage, concurrency, durability, query processing — and why it works.

**Goal:** Understand PostgreSQL's implementation deeply enough to be prepared to write your own database as an exercise. The exercise itself is out of scope; the Hands-on track at the end is its on-ramp.

**Baseline assumed:** you already use relational databases professionally — transactions, keys, relationships, column types, indexes, triggers, views (materialised or not). This plan never re-teaches *what* those are. It only ever asks *how they are built and why they work*.

**Promise:** Steps are sequential — each depends only on what came before it. Walk them in order; the Sequencing notes at the end name the allowed shortcuts. Parts group Steps thematically and carry the ⏱ desk-time estimates; the Step numbering runs through them.

**How to read a Step:** each Step is atomic — one concept, at most one resource per lane. **Historical** is mandatory and is provenance: who introduced the idea, when, and where; skim it out of curiosity, budget no study hours on it. **Video** and **Written** are the study lanes, present only when a worthy one exists — a Step with neither is a Historical-only Step: the skim is the whole visit. When the best written treatment is the original itself, one entry carries both labels (**Historical + Written**). **Extra** and **Hands-on** lines are optional depth outside the lanes.

Legend: ★ = highest-value Part for someone with your baseline (this is where the surprises live) · ⏱ = rough desk-time estimate.

At a glance: `0 Map → I History (optional skim) → II Storage → III Process & memory → IV Indexes ★ → V CC theory ★ → VI MVCC ★ → VII Isolation & SSI ★ → VIII WAL & recovery ★ → IX Query processing → X Replication → XI Modern directions (opt)`

**Two spine texts you'll return to constantly.** Get both now; Steps cite specific chapters. Where both cover a Step, the leaner one takes the Written lane and the deeper one appears as Extra.

- Hironobu Suzuki, *The Internals of PostgreSQL* — https://www.interdb.jp/pg/ — free, online, diagram-heavy, covers up to PG 15. The fastest path from "I know SQL" to "I know what the backend is doing".
- Egor Rogov, *PostgreSQL 14 Internals* — https://edu.postgrespro.com/postgresql_internals-14_en.pdf — free 600-page PDF from Postgres Professional. Deeper than Suzuki, with source-code references and SQL you can run to observe each claim. The closest thing to a definitive text.

---

## Part 0 — The map ⏱ 4–6h

Acquire the vocabulary and the component diagram before touching any one component. Everything after this is a zoom-in on one box of this diagram.

### Step 1 — The relational model and the component map

**Done when:** you can name every process and shared-memory structure involved in a single `UPDATE` and say which one is responsible for durability, which for isolation, and which for finding the row.

- **Historical:** Codd (1970), *A Relational Model of Data for Large Shared Data Banks* — https://doi.org/10.1145/362384.362685 — where the field began; short. Skim for what it actually argues: **data independence**, not tables. The tables are a consequence.
- **Video:** CMU 15-445/645 *Intro to Database Systems*, Fall 2024, lectures 1–3 — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq — Andy Pavlo. Course site with slides and notes: https://15445.courses.cs.cmu.edu/fall2024/
- **Written:** Hellerstein, Stonebraker & Hamilton (2007), *Architecture of a Database System* — https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf — the canonical single document on how a DBMS is decomposed. Read §1 (process models), §3 (storage), §4 up to 4.5 (transactions), §5 (query processor). Skim the rest.
- **Extra:** PostgreSQL docs, *Overview of PostgreSQL Internals* — https://www.postgresql.org/docs/current/overview.html — 15 minutes; the naming here (parse tree → query tree → plan tree) recurs in every later Step.

## Part I — Where the ideas came from · optional skim ⏱ 1–2h

Provenance, not curriculum — almost every design constraint in PostgreSQL is a decision someone argued about between 1970 and 1995, and the arguments are more legible than the code. (Codd lives in Step 1; the POSTGRES design papers live in Steps 3 and 12, attached to the concepts they originated.)

### Step 2 — The arguments, in retrospect

**Done when:** nothing gates on this Step — you leave knowing these documents exist and what each one argued.

- **Historical:** Chamberlin et al. (1981), *A History and Evaluation of System R* — https://doi.org/10.1145/358694.358703 — the first working implementation, told in retrospect; more useful than the original System R paper because it says what they got wrong.
- **Video:** CMU 15-721 *Advanced Database Systems*, lecture 1, *History of Databases* — https://www.youtube.com/watch?v=LWS8LEQAUVc — the same era as entertainment.
- **Written:** Stonebraker & Pavlo (2024), *What Goes Around Comes Around… And Around…* — https://db.cs.cmu.edu/papers/2024/whatgoesaround-sigmodrec2024.pdf — the 2024 update to the 2005 classic; best single piece on why the relational model keeps outliving its challengers.
- **Extra (standing reference):** *Readings in Database Systems*, 5th ed. (the "Red Book"), Bailis, Hellerstein & Stonebraker — http://www.redbook.io/pdf/redbook-5th-edition.pdf — a curated reading list with opinionated editorial commentary; use it to decide which papers are worth your time in any later Step.

## Part II — The storage layer ⏱ 6–8h

The physical bytes: the 8 KB page, the slotted-page layout (page header → line pointers growing down, tuples growing up), the tuple header and its system columns, `ctid`, TOAST, the free space map and visibility map, and the fork-per-relation file layout. The foundation for indexes, MVCC, WAL and VACUUM — do not skip it, even though it looks mundane.

### Step 3 — Pages, tuples, files

**Done when:** given a `ctid` you can say exactly which file, which page, and which line pointer it names — and explain why `ctid` is not a stable row identity, tracing the no-overwrite design to its 1986 statement of intent rather than to an implementation accident.

- **Historical:** Stonebraker & Rowe (1986), *The Design of POSTGRES* — https://dsf.berkeley.edu/papers/ERL-M85-95.pdf — the no-overwrite storage manager as design intent. PostgreSQL's MVCC, its VACUUM problem, and its extensibility model are all here, decades before you met them as operational quirks.
- **Video:** CMU 15-445 lectures 3–4, *Database Storage* — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq — vendor-neutral; the slotted page design is universal.
- **Written:** Suzuki, ch. 1 *Database Cluster, Databases, and Tables* — https://www.interdb.jp/pg/pgsql01.html
- **Extra (deeper):** Rogov, Part I ch. 1–3 — https://edu.postgrespro.com/postgresql_internals-14_en.pdf · PostgreSQL docs, *Database Physical Storage* — https://www.postgresql.org/docs/current/storage.html — the authoritative byte-level reference, including TOAST strategies and the visibility map.
- **Hands-on (worth the hour):** install `pageinspect` — https://www.postgresql.org/docs/current/pageinspect.html — create a small table and dump the actual page header, line pointers and tuple headers. Seeing `t_xmin`/`t_xmax` on a real row makes Step 12 almost trivial.

## Part III — Process and memory architecture ⏱ 4–5h

PostgreSQL is a process-per-connection system with a shared buffer pool: postmaster and backends, shared buffers, clock-sweep replacement, `work_mem` vs shared memory, background workers, and the lock manager's own structures (lightweight vs heavyweight locks).

### Step 4 — Why the DBMS won't trust the OS

**Done when:** you can explain why a page can be dirty in shared buffers, clean on disk, and still recoverable after a crash — and what enforces that ordering. (If you can't yet, that's Step 15.)

- **Historical:** Stonebraker (1981), *Operating System Support for Database Management* — https://doi.org/10.1145/358699.358703 — the classic argument for why a DBMS reimplements buffering, scheduling and file management instead of trusting the OS. Short, delightful — still the reason `shared_buffers` exists.
- **Video:** Bruce Momjian, *Inside PostgreSQL Shared Memory* — https://momjian.us/main/presentations/internals.html — Momjian's talks page is a permanent bookmark; later Steps point back to it.
- **Written:** Suzuki, ch. 2 *Process and Memory Architecture* — https://www.interdb.jp/pg/pgsql02.html — plus ch. 8 *Buffer Manager* — https://www.interdb.jp/pg/pgsql08.html
- **Extra (deeper):** Rogov, Part I ch. 9 *Buffer Cache* — https://edu.postgrespro.com/postgresql_internals-14_en.pdf

## Part IV — Indexes ★ ⏱ 10–14h

You use indexes daily; here you learn the data structures and the invariants that make them concurrent-safe. The highest theory-per-hour Part in the plan.

### Step 5 — B-trees, the general case

**Done when:** you can state the B-tree invariants and what a page split must preserve for the tree to stay balanced.

- **Historical:** Bayer & McCreight (1972), *Organization and Maintenance of Large Ordered Indices* — https://doi.org/10.1007/BF00288683 — the original. Short, formal, readable.
- **Video:** CMU 15-445 lectures 7–8, *B+Tree Indexes* — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq
- **Written:** Comer (1979), *The Ubiquitous B-Tree* — https://doi.org/10.1145/356770.356776 — the survey that made B-trees canonical; explains B+ trees and the variant zoo far more accessibly than the original.
- **Extra (the modern engineering):** Graefe (2011), *Modern B-Tree Techniques* — https://www.nowpublishers.com/article/Details/DBS-028 — latching vs locking, key normalisation, prefix/suffix truncation, blink-trees. Read at least the concurrency sections; latch-coupling is the answer to "how is a tree modified while a thousand readers walk it".

### Step 6 — PostgreSQL's B-link trees

**Done when:** you can explain why an index-only scan needs the visibility map, why `VACUUM` has to touch indexes at all, and what a B-tree page split does to concurrent readers mid-descent.

- **Historical:** Lehman & Yao (1981), *Efficient Locking for Concurrent Operations on B-Trees* — https://doi.org/10.1145/319628.319663 — the B-link tree: one sideways pointer per node lets readers recover from concurrent splits without lock-coupling. The variant PostgreSQL actually implements.
- **Written:** `src/backend/access/nbtree/README` — https://github.com/postgres/postgres/blob/master/src/backend/access/nbtree/README — unusually good prose: PostgreSQL's Lehman & Yao variant, page deletion, and why index tuples can't simply be deleted when a row dies.
- **Extra (deeper):** Suzuki, ch. 1 §1.4 and ch. 5 for index/heap interaction; Rogov Part III (~124 pages on indexes) is the exhaustive treatment — https://edu.postgrespro.com/postgresql_internals-14_en.pdf
- **Extra (practitioner's layer, light, high ROI):** Markus Winand, *Use The Index, Luke!* — https://use-the-index-luke.com/ — free web edition of *SQL Performance Explained*; connects the structure to the query plans you already read.

### Step 7 — Indexes as plugins

**Done when:** you can explain why GiST, GIN, SP-GiST and BRIN can exist without changes to PostgreSQL's core.

- **Historical:** Hellerstein, Naughton & Pfeffer (1995), *Generalized Search Trees for Database Systems* — https://www.vldb.org/conf/1995/P562.PDF — the paper that turned "index" into a plugin interface; the direct ancestor of every PostGIS, full-text and vector index you've ever used.
- **Extra:** PostgreSQL docs, *Index Access Method Interface Definition* — https://www.postgresql.org/docs/current/indexam.html

### Step 8 — The other family, for contrast

**Done when:** you can state the read/write amplification trade-off between LSM-trees and B-trees — the single most important axis in modern storage engines.

- **Historical + Written:** O'Neil et al. (1996), *The Log-Structured Merge-Tree (LSM-Tree)* — https://www.cs.umb.edu/~poneil/lsmtree.pdf — read to understand what PostgreSQL is *not*.

## Part V — Concurrency control theory ★ ⏱ 8–10h

The theory layer: schedules and histories, conflict-serializability and the precedence graph, 2PL, lock granularity and intention locks, deadlock handling. Serializability is a formal property with a proof obligation; "isolation level" is a set of engineering compromises against it. Get the theory before the PostgreSQL specifics, or the specifics will look arbitrary.

### Step 9 — Locks, granularity, degrees of consistency

**Done when:** given a schedule of two transactions you can draw the precedence graph and decide serializability by hand; you can state what 2PL guarantees and what it costs.

- **Historical:** Gray et al. (1976), *Granularity of Locks and Degrees of Consistency in a Shared Data Base* — https://doi.org/10.1145/582318.582381 — where "degrees of consistency" (the ancestor of isolation levels) and multi-granularity locking are introduced.
- **Video:** CMU 15-445 lectures 15–17, *Concurrency Control* — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq — the systematic material at a third of the effort, with worked schedule examples.
- **Written:** Bernstein, Hadzilacos & Goodman (1987), *Concurrency Control and Recovery in Database Systems* — free from the author's page: https://www.microsoft.com/en-us/research/people/philbe/ — the rigorous textbook; chapters 1–3 and 5 are the core. Dense but complete.

### Step 10 — The transaction concept

**Done when:** you can say what ACID names, and which of its letters are promises versus engineering compromises.

- **Historical + Written:** Gray (1981), *The Transaction Concept: Virtues and Limitations* — https://www.hpl.hp.com/techreports/tandem/TR-81.3.pdf — the paper that names ACID's substance. Genuinely enjoyable prose — the one skim here that rewards a full read.

## Part VI — MVCC ★ ⏱ 8–10h

The single most consequential design decision in PostgreSQL, and the one that produces the most operational surprises: `xmin`/`xmax` and tuple visibility, transaction IDs and the commit log (`clog`), snapshots and `xip` lists, hint bits, HOT updates, why readers never block writers, dead tuples, VACUUM and autovacuum, freezing and XID wraparound, and index bloat. Step 3 gave you the tuple header; now it earns its keep.

### Step 11 — Multiversion concurrency control, the theory

**Done when:** you can state what serializability means when reads are served from old versions.

- **Historical:** Reed (1978), *Naming and Synchronization in a Decentralized Computer System* — https://www.mit.edu/~Saltzer/publications/TRs+TMs/CSR/MIT-LCS-TR-205.pdf — the MIT thesis where multiversioning was born.
- **Written:** Bernstein & Goodman (1983), *Multiversion Concurrency Control — Theory and Algorithms* — https://doi.org/10.1145/319996.319998 — the canonical formalization; extends Part V's theory to the MVCC family.

### Step 12 — MVCC as PostgreSQL implements it

**Done when:** you can explain why a table can grow while rows are only ever deleted, why `SELECT` can dirty a page, and what a 32-bit XID space forces the system to do.

- **Historical:** Stonebraker (1987), *The Design of the POSTGRES Storage System* — https://dsf.berkeley.edu/papers/ERL-M87-06.pdf — the no-overwrite storage manager as designed, one level deeper than Step 3's paper; VACUUM's debt is visible here before the first line of code was written.
- **Video:** Bruce Momjian, *MVCC Unmasked* — https://momjian.us/main/presentations/internals.html (also on YouTube: https://www.youtube.com/watch?v=byl_CoucJE0) — ~60 min, built entirely from live queries against `pageinspect`. Probably the best single artefact on this topic in any format.
- **Written:** Suzuki, ch. 5 *Concurrency Control* — https://www.interdb.jp/pg/pgsql05.html — the visibility-check algorithm spelled out step by step.
- **Extra (deeper):** Rogov, Part II *Transactions and MVCC* (incl. ~60 pages on locks) — https://edu.postgrespro.com/postgresql_internals-14_en.pdf
- **Extra (commute-friendly, no visuals needed):** SE Radio 496, *Bruce Momjian on MVCC in Postgres* — https://se-radio.net/2022/01/episode-496-bruce-momjian-on-multi-version-concurrency-control-in-postgres-mvcc/
- **Extra (the maintenance consequence):** PostgreSQL docs, *Routine Vacuuming* — https://www.postgresql.org/docs/current/routine-vacuuming.html — read §25.1.5 on wraparound specifically. Copy-on-write storage means correctness depends on a background process keeping up. A real trade-off, not a bug.

## Part VII — Isolation levels and SSI ★ ⏱ 6–8h

The Part that will most change how you write application code. Snapshot isolation is *not* serializability, and the gap has a name and a shape.

### Step 13 — Snapshot isolation and its anomalies

**Done when:** you can construct a write-skew scenario from scratch and explain why no amount of `REPEATABLE READ` prevents it.

- **Historical + Written:** Berenson, Bernstein, Gray, Melton, O'Neil & O'Neil (1995), *A Critique of ANSI SQL Isolation Levels* — https://arxiv.org/abs/cs/0701157 — shows the ANSI phenomena fail to characterise real implementations, and defines Snapshot Isolation properly. **Write skew** is introduced here. Short, and the key to the Part.
- **Video:** Martin Kleppmann, *Transactions: myths, surprises and opportunities* (Strange Loop 2015) — https://www.youtube.com/watch?v=5ZjhNTM8XU8 — 41 min; isolation levels, their real anomalies, and write skew, with examples you'll reuse on colleagues.
- **Extra (optional, more rigorous):** Adya, Liskov & O'Neil (2000), *Generalized Isolation Level Definitions* — https://doi.org/10.1109/ICDE.2000.839388 — implementation-independent definitions in terms of dependency graphs.
- **Hands-on:** reproduce a write-skew anomaly in two `psql` sessions under `REPEATABLE READ`, then watch it become a serialization failure under `SERIALIZABLE`. Fifteen minutes, permanent effect.

### Step 14 — Serializable snapshot isolation

**Done when:** you can explain how SSI detects dangerous structures in the read/write dependency graph at runtime, and state what your application must do when `SERIALIZABLE` throws `40001`.

- **Historical:** Cahill, Röhm & Fekete (2008), *Serializable Isolation for Snapshot Databases* — https://doi.org/10.1145/1376616.1376690 — where the SSI algorithm was derived, four years before PostgreSQL shipped it.
- **Written:** Ports & Grittner (2012), *Serializable Snapshot Isolation in PostgreSQL* — https://dl.acm.org/doi/10.14778/2367502.2367523 — how PG 9.1 got true serializability without locking reads. A rare paper that is both a research contribution and an engineering post-mortem.
- **Extra:** PostgreSQL wiki, *SSI* — https://wiki.postgresql.org/wiki/SSI — worked examples with runnable SQL · PostgreSQL docs, *Transaction Isolation* — https://www.postgresql.org/docs/current/transaction-iso.html — reread it now; it will say something different than it did before.

## Part VIII — Durability: WAL and recovery ★ ⏱ 8–10h

Why a system that buffers writes in volatile memory survives being unplugged: the WAL protocol and the log-before-data rule, LSNs, full-page writes and torn pages, checkpoints, ARIES' three passes, CLRs and repeating history, and `fsync` as the thin place where all of this meets the OS.

### Step 15 — Write-ahead logging and crash recovery

**Done when:** you can explain what "repeating history during redo" means and why it's necessary, why full-page writes exist despite doubling WAL volume, what a checkpoint actually bounds — and why PostgreSQL gets away without an undo pass at all.

- **Historical:** Mohan et al. (1992), *ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging* — https://cs.stanford.edu/people/chrismre/cs345/rl/aries.pdf — the algorithm every serious DBMS descends from. Notoriously dense — the skim contract applies: §1–3 and the recovery walkthrough are enough; the study lanes below carry the load.
- **Video:** CMU 15-445 lectures 19–20, *Logging Schemes* and *Database Recovery* — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq — ARIES explained with diagrams, in about 90 minutes. Take it before the paper if ARIES is heavy going.
- **Written:** Suzuki, ch. 9 *Write Ahead Logging* — https://www.interdb.jp/pg/pgsql09.html — the clearest account of LSNs, full-page writes and checkpoint mechanics.
- **Extra (deeper):** Rogov, Part I ch. 10 *WAL* — https://edu.postgrespro.com/postgresql_internals-14_en.pdf · Momjian, *Postgres WAL* — https://momjian.us/main/presentations/internals.html
- **Extra (reference work, use as a lookup):** Gray & Reuter (1992), *Transaction Processing: Concepts and Techniques* — not free, not to be read cover to cover; the durability chapters are the best long-form treatment that exists.
- **Extra (the cautionary tale — read this one):** *PostgreSQL's fsync() surprise* (LWN, 2018) — https://lwn.net/Articles/752063/ — PostgreSQL's durability assumptions about Linux `fsync()` error reporting turned out to be wrong for twenty years. Also: https://wiki.postgresql.org/wiki/Fsync_Errors. The real lesson: durability is a chain of assumptions across layers you do not control.

> ⚠️ **PostgreSQL diverges from ARIES on purpose.** Its recovery is redo-only — no undo pass, no CLRs — because MVCC never overwrites in place: the "undo information" is simply the old row versions already sitting in the heap, and an aborted transaction's rows are invisible by the Step 12 visibility rules alone. The 1986/87 no-overwrite decision (Steps 3 and 12) is what buys this simplification. Read ARIES as the general theory, then notice which two of its three passes PostgreSQL got to delete.

## Part IX — Query processing and optimisation ⏱ 10–12h

You already read `EXPLAIN` output; here you learn what produced it, and why cost-based optimisation is a search problem with an estimation problem hiding inside it.

### Step 16 — Cost-based planning

**Done when:** you can explain why the planner chose a nested loop over a hash join, what statistic drove the decision, and what would have to change for it to choose differently.

- **Historical:** Selinger et al. (1979), *Access Path Selection in a Relational Database Management System* — https://www2.cs.duke.edu/courses/spring03/cps216/papers/selinger-etal-1979.pdf — dynamic programming over join orders, interesting orders, and a cost model. Nearly 50 years old and still the shape of PostgreSQL's planner; the one original here worth exceeding the skim contract for.
- **Video:** Momjian, *Explaining the Postgres Query Optimizer* — https://momjian.us/main/presentations/internals.html
- **Written:** Suzuki, ch. 3 *Query Processing* — https://www.interdb.jp/pg/pgsql03.html — traces a query from parse tree to plan tree with the actual cost formulas.
- **Extra (deeper):** Rogov, Part IV *Query Execution* (~115 pages) — https://edu.postgrespro.com/postgresql_internals-14_en.pdf

### Step 17 — Execution models

**Done when:** you can name the iterator ("Volcano") model and the main join algorithms, and say when each join wins.

- **Historical + Written:** Graefe (1993), *Query Evaluation Techniques for Large Databases* — https://doi.org/10.1145/152610.152611 — the encyclopaedic survey of joins, sorting, aggregation and the iterator model. Use as reference, not linear reading; the join-algorithm sections are the core.

### Step 18 — Statistics, and where the model breaks

**Done when:** you can take a real plan and find where estimated and actual rows diverge — and explain what that does to everything downstream of the misestimate.

- **Historical + Written:** ★ Leis et al. (2015), *How Good Are Query Optimizers, Really?* — https://www.vldb.org/pvldb/vol9/p204-leis.pdf — the empirical demolition: cardinality estimation errors dominate and compound multiplicatively across joins. You will never again trust an estimated row count without checking it. The most practically useful paper in the Part.
- **Extra:** PostgreSQL docs, *How the Planner Uses Statistics* — https://www.postgresql.org/docs/current/planner-stats-details.html — selectivity estimation, histograms, MCV lists, extended statistics for correlated columns.
- **Hands-on:** take a slow query from work, read the plan against `EXPLAIN (ANALYZE, BUFFERS)`, and find where estimated and actual rows diverge. Reference glossary: https://www.pgmustard.com/docs/explain

## Part X — Replication and distribution ⏱ 6–8h

Extend durability and consistency past a single machine. Lighter treatment — this is a whole field; the goal is a correct mental model rather than mastery.

### Step 19 — Replication and its dangers

**Done when:** you can explain what `synchronous_commit = on` actually guarantees, what it doesn't, and why a Postgres primary/standby pair is not by itself a consensus system.

- **Historical:** Gray, Helland, O'Neil & Shasha (1996), *The Dangers of Replication and a Solution* — https://dl.acm.org/doi/10.1145/233269.233330 — where the eager-vs-lazy replication trade-off was named, and the proof that naive replication scales as the *cube* of the number of nodes.
- **Written:** Kleppmann, *Designing Data-Intensive Applications*, ch. 5 (replication), 7 (transactions) and 9 (consistency and consensus) — https://dataintensive.net/ — the best synthesis available; ch. 7 will also retroactively sharpen Part VII.
- **Extra:** Kyle Kingsbury, *Consistency Models* — https://jepsen.io/consistency — an interactive map of the guarantees; ten minutes, permanently useful · PostgreSQL docs, *High Availability, Load Balancing, and Replication* — https://www.postgresql.org/docs/current/high-availability.html — streaming vs logical replication, synchronous commit levels, replication slots · *Raft: understandable distributed consensus* — https://raft.github.io/ — consensus is what PostgreSQL failover tooling (e.g. Patroni — https://github.com/patroni/patroni) delegates to etcd/Consul; worth knowing what it's delegating.

## Part XI — Modern directions · optional ⏱ 5–7h

Situate what you've learned against where the field is now. Everything above describes a disk-oriented, row-store, single-node OLTP engine — 1980s hardware assumptions. In Goal scope as the boundary-drawing Part: it tells you which parts of PostgreSQL you should *not* imitate in a database of your own.

### Step 20 — Past the iterator model

**Done when:** you can name the two ways past tuple-at-a-time execution and why columnar engines beat PostgreSQL on analytics.

- **Historical + Written:** Kersten et al. (2018), *Everything You Always Wanted to Know About Compiled and Vectorized Queries But Were Afraid to Ask* — https://www.vldb.org/pvldb/vol11/p2209-kersten.pdf — relevant to PostgreSQL's JIT.
- **Video (treat as a buffet, not a course):** CMU 15-721 *Advanced Database Systems* (Spring 2024) — https://www.youtube.com/playlist?list=PLSE8ODhjZXjYa_zX-KeMJui7pcN1rIaIJ — in-memory, columnar, vectorised, multi-core. Graduate-level; covers this whole Part.

### Step 21 — Storage/compute disaggregation

**Done when:** you can explain "the log is the database" and what Aurora replaced below the WAL.

- **Historical + Written:** Verbitski et al. (2017), *Amazon Aurora: Design Considerations for High Throughput Cloud-Native Relational Databases* — https://www.allthingsdistributed.com/files/p1041-verbitski.pdf — keep the Postgres front end, replace everything below the WAL. The clearest example of disaggregation.
- **Extra:** PostgreSQL docs, *Table Access Method Interface Definition* — https://www.postgresql.org/docs/current/tableam.html — pluggable storage (PG 12) is the escape hatch from heap-and-vacuum; see OrioleDB (https://www.orioledb.com/) for what people are building on it.

---

## Hands-on track — run in parallel, not after

Reading about a B-tree and implementing one produce very different kinds of knowledge. Pick **one** and run it alongside Parts II–IX. This track is the on-ramp to the Goal's write-your-own-database exercise.

- **Hands-on (pick one):** **CMU BusTub projects** — https://github.com/cmu-db/bustub — buffer pool manager, B+ tree index, query execution, concurrency control. C++, graded via public autograder, directly paired with the 15-445 lectures. The most rigorous option.
- **Hands-on (pick one):** **"Let's Build a Simple Database"** — https://cstack.github.io/db_tutorial/ — a SQLite clone in C, incrementally, from REPL to B-tree. Well-paced, finishable, genuinely instructive.
- **Hands-on (pick one):** **"Build Your Own Database From Scratch"** — https://build-your-own.org/database/ — Go; B-tree + copy-on-write + a transactional KV layer + a small relational layer. Closest in spirit to PostgreSQL's storage model.
- **Hands-on (pick one, lowest effort, highest specificity):** **PostgreSQL source spelunking** — https://github.com/pghacking/awesome-postgres-hacking — curated entry points into the actual codebase, including the exceptionally well-written `README` files under `src/backend/access/`. Pair with Tom Lane's *A Tour of PostgreSQL Internals*.

---

## Off-spine extras — kept deliberately

Not required by the sequence, but each is worth knowing exists.

- **Extra:** Alex Petrov, *Database Internals* — https://www.databass.dev/ — a book-length version of roughly Parts II–VIII plus distributed systems; one purchasable book instead of assembled papers. Weaker on PostgreSQL specifics than Rogov.
- **Extra:** Stonebraker et al. (2007), *The End of an Architectural Era* — https://doi.org/10.14778/1454159.1454211 — the argument that legacy RDBMS architecture is 30 years obsolete. Wrong in its predictions, right in its diagnosis; a useful adversarial read against Parts II–VIII.
- **Extra:** pganalyze blog and *5mins of Postgres* — https://pganalyze.com/blog — short, technically serious, frequently on internals. Good drip-feed between Parts.
- **Extra:** **Postgres.FM** — https://postgres.fm/ — weekly, ~35 min, by Postgres practitioners. Good passive reinforcement; episodes map well onto Parts IV, VI and IX.

---

## Sequencing notes

**Walk the Steps in order and the promise holds** — every dependency points backwards. The graph is looser than the line, though: Parts II and III are prerequisites for essentially everything; Parts IV, V and IX are largely independent of each other; Part VI requires II and V; VII requires VI; VIII requires II and III. If you want a shorter path, `1 → 3 → 9 → 11 → 12 → 13 → 14 → 15` is the "how is this trustworthy" spine and `1 → 3 → 5 → 6 → 16 → 18` is the "how is this fast" spine.

**Where the surprises are, given your baseline.** Parts VI, VII and VIII are where things you already do professionally turn out to rest on assumptions you'd never inspected — non-overwriting storage and its vacuum debt, snapshot isolation not being serializability, and durability being a cross-layer assumption chain. Steps 8 and 18 are the other two places where the received wisdom will move.

**On the historical papers.** Read them for the arguments, not the syntax. Several describe systems that no longer exist; the value is that they state their constraints explicitly, which modern documentation never does.

> All URLs above were verified against sources rather than recalled.
