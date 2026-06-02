# Content

> The Content Context covers the structure of subject matter the User has studied and the source material from which `Sheet[View]`s are built — `Topic`s, `SubTopic`s, `Source`s, and the consolidated `Reference`s that back each `SubTopic`. It also defines the User in their role as builder of `CheatSheet[View]`s.

## §1 Relationships

Pairs with the View Context. Each `Topic` in Content corresponds to one `CheatSheet[View]` in View — same underlying thing, different aspect (information vs rendered view). Each `SubTopic` corresponds 1:1 to a `Sheet[View]`. `Source`s and `Reference`s are intermediate artifacts; the `Consolidation User` reads `Reference`s directly during build, but they are not exposed through the View Context. The `Consolidation User` defined here is the same human as the `Reference User[View]` defined in View; the two roles capture different activities (building vs consuming) and may be carried out at different times by the same person.

## §2 Dictionary

| Term               | Definition |
|--------------------|------------|
| Topic              | A broad subject area the User has studied, considered as information (e.g., "Python", "HTTP", "Claude Code"). Same underlying thing as a CheatSheet, viewed from the information aspect. |
| SubTopic           | A specific area or aspect within a Topic. The Topic→SubTopic split is intentionally flexible: SubTopics may be versions (Python 3.13, 3.14), facets (Commands, Agents, Skills), or any other partition chosen per Topic. Maps 1:1 to a Sheet. |
| Source             | An external resource consulted when producing the Reference of a SubTopic — book/PDF, article/URL, video, or any other document. Sources are inputs to consolidation; they are not directly visible to the User through Sheets. |
| Reference          | A single Markdown file consolidating all of a SubTopic's Sources into one comprehensive document. Serves a dual purpose: study material the User reads directly, and input from which the Sheet is generated. Distinct from a Source (raw input) and a Sheet (rendered view). |
| Consolidation User | The User acting to build or extend a CheatSheet: selecting Topics and SubTopics, gathering Sources, and producing the Reference from which a Sheet is generated. This act is itself an instance of Learning Consolidation. Same human as the Reference User defined in View; the role differs. |

## §3 User Stories

### US-1 — Generate a new CheatSheet for a Topic I have studied

[Contexts: Content, View]

**Title:** US-1 — Generate a new CheatSheet for a Topic I have studied

**As a** `Consolidation User`, \
**I can** start a new `CheatSheet` for a `Topic` by selecting its first `SubTopic`, providing its `Source`s, and consolidating them into a `Reference` from which the first `Sheet` is generated, \
**so that** I have a single-page reference of what I have studied so far.

**Format contracts:**
- `Source` list conforms to [`SOURCES_FORMAT.md`](../SOURCES_FORMAT.md)
- `Reference` conforms to [`REFERENCE_FORMAT.md`](../REFERENCE_FORMAT.md)
- `Sheet` manifest + cards conform to [`CONTENT_FORMAT.md`](../CONTENT_FORMAT.md)

INVEST check:
- **I**ndependent — pass: first story; no unbuilt prerequisite.
- **N**egotiable — pass: outcome-stated; the consolidation pipeline (LLM, scripts, manual editing) is open.
- **V**aluable — pass: the `Consolidation User` goes from no `CheatSheet` to one usable `Sheet`.
- **E**stimable — pass: scope is bounded by the spec's 5-step Generation flow.
- **S**mall — borderline: `Source`-curation + processing + rendering is a lot for one sprint slice; flagging for possible Spike or Path split (SPIDR) if it bloats during AC.
- **T**estable — pass: a new `CheatSheet` appears in the User's list with one rendered `Sheet`.

#### AC-1.1 — Generate the first `CheatSheet` for a new `Topic` — Happy Path

```gherkin
Given no `CheatSheet` exists for the `Topic` "Python",
    And the `Consolidation User` has chosen "3.14" as the first `SubTopic`,
    And has assembled a list of `Source`s for "3.14",
When the `Consolidation User` triggers consolidation,
Then a `Reference` for "3.14" is produced from the provided `Source`s,
    And a `Sheet` for "3.14" is rendered from that `Reference`,
    And a new `CheatSheet` for "Python" appears in the User's list, containing the "3.14" `Sheet`
```

_Implementation: Handled entirely on the authoring surface. Realising US-1 means creating `content/<topic>/` with `topic.yml` and one `<subtopic>/` folder containing `sources.yml`, `reference.md`, `sheet.yml`, and `cards/` in that order; the `Sheet[View]` appears in the deployed app on the next push._

---

### US-2 — Add a new SubTopic to an existing CheatSheet

[Contexts: Content, View]

**Title:** US-2 — Add a new SubTopic to an existing CheatSheet

**As a** `Consolidation User`, \
**I can** add a new `SubTopic` to an existing `CheatSheet` by providing its `Source`s and consolidating them into a `Reference` from which a new `Sheet` is generated, \
**so that** my `CheatSheet` grows as I study more aspects of the same `Topic`.

**Format contracts:**
- `Source` list conforms to [`SOURCES_FORMAT.md`](../SOURCES_FORMAT.md)
- `Reference` conforms to [`REFERENCE_FORMAT.md`](../REFERENCE_FORMAT.md)
- `Sheet` manifest + cards conform to [`CONTENT_FORMAT.md`](../CONTENT_FORMAT.md)

INVEST check:
- **I**ndependent — pass: assumes a `CheatSheet` exists, but does not require Story 1 to be implemented in any specific way.
- **N**egotiable — pass: outcome-stated.
- **V**aluable — pass: the `Consolidation User` extends an existing study area without rebuilding it.
- **E**stimable — pass: shares the `SubTopic`-generation core with Story 1.
- **S**mall — pass: narrower than Story 1 since the `CheatSheet` already exists.
- **T**estable — pass: a new `Sheet` appears within the chosen `CheatSheet`.

_Note: heavy implementation overlap with Story 1 (the `SubTopic`→`Reference`→`Sheet` pipeline). If during AC the team finds the two stories share most of the work, consider merging — but the User-visible flows (start-fresh vs extend-existing) differ enough to keep them separate at the story level._

#### AC-2.1 — Add a new `SubTopic` to an existing `CheatSheet` — Happy Path

```gherkin
Given a `CheatSheet` for the `Topic` "Python" already exists with `Sheet` "3.14",
    And the `Consolidation User` has chosen "3.13" as a new `SubTopic`,
    And has assembled a list of `Source`s for "3.13",
When the `Consolidation User` triggers consolidation,
Then a `Reference` for "3.13" is produced from the provided `Source`s,
    And a `Sheet` for "3.13" is rendered from that `Reference`,
    And the existing "Python" `CheatSheet` now contains both "3.14" and "3.13" `Sheet`s
```

_Implementation: Same authoring surface as US-1, narrower scope. Realised by adding a new `<subtopic>/` folder under an existing `content/<topic>/`; the loader picks the new `SubTopic` up automatically._

---

### US-3 — Refresh a Sheet when its Sources change

[Contexts: Content, View]

**Title:** US-3 — Refresh a Sheet when its Sources change

**As a** `Consolidation User`, \
**I can** change the list of `Source`s for an existing `SubTopic` and have its `Reference` and `Sheet` regenerated from the updated set, \
**so that** my study material stays current as I add, replace, or remove what I read.

**Format contracts:**
- `Source` list conforms to [`SOURCES_FORMAT.md`](../SOURCES_FORMAT.md)
- `Reference` conforms to [`REFERENCE_FORMAT.md`](../REFERENCE_FORMAT.md)
- `Sheet` manifest + cards conform to [`CONTENT_FORMAT.md`](../CONTENT_FORMAT.md)

INVEST check:
- **I**ndependent — pass: assumes a `SubTopic` exists; no unbuilt sibling story.
- **N**egotiable — pass: outcome-stated; what "regenerated" means in detail (full rebuild vs incremental) is open.
- **V**aluable — pass: the `Consolidation User` keeps a `Sheet` accurate without recreating it from scratch.
- **E**stimable — pass: single-`SubTopic` regeneration cycle.
- **S**mall — pass.
- **T**estable — pass: an existing `Sheet`'s content reflects the new `Source` set.

#### AC-3.1 — Refresh a `Sheet` after the `Source` list changes — Happy Path

```gherkin
Given a `Sheet` "3.14" exists in the "Python" `CheatSheet`, generated from an initial `Reference`,
    And the `Consolidation User` has changed the list of `Source`s for "3.14",
When the `Consolidation User` triggers regeneration of "3.14",
Then a new `Reference` for "3.14" is produced from the updated `Source`s,
    And the "3.14" `Sheet` is re-rendered from the new `Reference`,
    And the "Python" `CheatSheet` continues to contain "3.14" with its updated content
```

_Implementation: Realised by editing `sources.yml` for the affected `SubTopic` and regenerating `reference.md` and `sheet.yml` + `cards/*.md` from it. The same files are rewritten in place; the next push publishes the refreshed `Sheet[View]`._

---

### US-5 — Remove a CheatSheet or a single Sheet

[Contexts: Content, View]

**Title:** US-5 — Remove a CheatSheet or a single Sheet

**As a** `Reference User`, \
**I can** discard a `CheatSheet` along with its `Topic` and every related `SubTopic`, `Reference`, and `Source`, or discard a single `Sheet` along with its underlying `SubTopic`, `Reference`, and `Source`s, \
**so that** I can prune material I no longer need to keep.

INVEST check:
- **I**ndependent — pass: assumes artifacts exist; no unbuilt sibling.
- **N**egotiable — pass: confirmation flow, undo, archive-vs-delete are all open.
- **V**aluable — pass: keeps the User's workspace focused on what they actually study.
- **E**stimable — pass: cascade scope is now defined (everything related is discarded).
- **S**mall — pass.
- **T**estable — pass: a `CheatSheet` (and all its underlying artifacts) or a single `Sheet` (and its underlying artifacts) no longer appear in the User's list.

#### Background

```gherkin
Given a `CheatSheet` for "Python" exists with `Sheet`s "3.13" and "3.14",
    And every underlying `Topic`, `SubTopic`, `Reference`, and `Source` is in place
```

#### AC-5.1 — Remove an entire `CheatSheet` and all its underlying artifacts — Happy Path

```gherkin
Given the `Reference User` has initiated removal of the "Python" `CheatSheet`,
When the `Reference User` confirms the removal,
Then the "Python" `CheatSheet` no longer appears in the User's list,
    And every related `Sheet`, `SubTopic`, `Reference`, and `Source` is discarded,
    And the `Topic` "Python" is no longer tracked
```

#### AC-5.2 — Remove a single `Sheet` from a `CheatSheet` — Happy Path

```gherkin
Given the `Reference User` has initiated removal of `Sheet` "3.14",
When the `Reference User` confirms the removal,
Then `Sheet` "3.14" no longer appears in the "Python" `CheatSheet`,
    And the `SubTopic`, `Reference`, and `Source`s for "3.14" are discarded,
    And `Sheet` "3.13" remains intact in the "Python" `CheatSheet`
```

#### AC-5.3 — Cancel removal of a `CheatSheet` — Sad Path

```gherkin
Given the `Reference User` has initiated removal of the "Python" `CheatSheet`,
When the `Reference User` cancels the removal,
Then the "Python" `CheatSheet` remains in the User's list,
    And every `Sheet`, `SubTopic`, `Reference`, and `Source` is preserved unchanged
```

_Implementation: Realised as a file-system cascade — deleting `content/<topic>/` removes a whole `CheatSheet[View]`; deleting `content/<topic>/<subtopic>/` removes a single `Sheet[View]`. No cross-folder references to clean up._

## §4 Data Model

### Spec-to-file-system mapping

| Spec entity   | File system artifact                                  | Notes |
|---------------|-------------------------------------------------------|-------|
| Topic         | `content/<topic>/`                                    | Slug = folder name. |
| SubTopic      | `content/<topic>/<subtopic>/`                         | Slug = `<topic>/<subtopic>`. |
| Source        | An entry in `content/<topic>/<subtopic>/sources.yml`  | URL / PDF path / video link, type, title, fetched-at. Surfaced by the deployed app as a footer on each `Sheet[View]`. |
| Reference     | `content/<topic>/<subtopic>/reference.md`             | Consolidated study text. Read by the `Consolidation User`; **not exposed by the deployed app**. |
| Sheet         | `content/<topic>/<subtopic>/sheet.yml` + `cards/*.md` | Manifest + per-card Markdown files (see `CONTENT_FORMAT.md`); rendered by the app. |
| CheatSheet    | The set of `sheet.yml` + `cards/` directories under one `<topic>/` | Synthesised at load time; not stored as a separate artifact. |

### `topic.yml`

```yaml
title: Python                       # display name
subtitle: language reference across versions
default: "3.14"                     # SubTopic slug rendered when /<topic> is opened
```

All keys are optional. With no `default`, the loader picks the lexicographically last `SubTopic` (so version-named `SubTopic`s open on the newest).

### Full entity schemas

- [`CONTENT_FORMAT.md`](../CONTENT_FORMAT.md) — `sheet.yml` manifest schema and `cards/*.md` syntax
- [`SOURCES_FORMAT.md`](../SOURCES_FORMAT.md) — `sources.yml` schema
- [`REFERENCE_FORMAT.md`](../REFERENCE_FORMAT.md) — `reference.md` guidance

## §6 Procedures & Workflows

### Generation (US-1)

1. The `Consolidation User` selects a new `Topic` for which they want to generate a `CheatSheet[View]`.
2. The `Consolidation User` selects the first `SubTopic` of the `Topic`.
3. A list of `Source`s is generated based on the `Topic` / `SubTopic` provided.
4. All `Source`s are processed and their information organised into a single comprehensive `Reference`.
5. The `Sheet[View]` is generated from the `Reference` and added to the `CheatSheet[View]`.

### Update (US-2, US-3)

A `CheatSheet[View]` is updated in two ways:

**Source list changed (US-3):**
1. The `Consolidation User` edits `sources.yml` for the affected `SubTopic`.
2. The `Reference` is regenerated from the updated `Source`s.
3. `sheet.yml` + `cards/*.md` are regenerated from the new `Reference`.

**New SubTopic added (US-2):**
1. A new `Source` list is assembled.
2. The `Source`s are processed into a new `Reference`.
3. A new `Sheet[View]` is generated and added to the `CheatSheet[View]`.

### Removal (US-5)

Either the entire `CheatSheet[View]` is removed along with all its `Sheet[View]`s, or only the selected `Sheet[View]` is removed. The cascade is the file-system cascade — there are no cross-folder references to clean up.

### Authoring rules

- One folder per `Topic`; one folder per `SubTopic`. A `Topic` with a single `SubTopic` is simply a `Topic` with one folder under it.
- The `Consolidation User` produces `sources.yml` first, then `reference.md` from those `Source`s, then `sheet.yml` + `cards/*.md` from the `Reference`. Claude Code is responsible for enforcing this order during authoring.
- Files starting with `_` are editorial scratch and ignored by the loader.
- Removing a `<topic>/` folder discharges US-5 for the whole `CheatSheet[View]`; removing a `<topic>/<subtopic>/` folder discharges US-5 for a single `Sheet[View]`.
