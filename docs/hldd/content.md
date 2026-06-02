# Content

> The Content Context covers the structure of subject matter the User has studied and the source material from which `Sheet[View]`s are built — `Topic`s, `SubTopic`s, and `Source`s. It also defines the User in their role as builder of `CheatSheet[View]`s.

## §1 Relationships

Pairs with the View Context. Each `Topic` in Content corresponds to one `CheatSheet[View]` in View — same underlying thing, different aspect (information vs rendered view). Each `SubTopic` corresponds 1:1 to a `Sheet[View]`. `Source`s are inputs to the pipeline; they are not directly visible through the View Context. The `Consolidation User` defined here is the same human as the `Reference User[View]` defined in View; the two roles capture different activities (building vs consuming) and may be carried out at different times by the same person.

## §2 Dictionary

| Term               | Definition                                                                                                                                                                                                                                                                                     |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Topic              | A broad subject area the User has studied, considered as information (e.g., "Python", "HTTP", "Claude Code"). Same underlying thing as a CheatSheet, viewed from the information aspect.                                                                                                       |
| SubTopic           | A specific area or aspect within a Topic. The Topic→SubTopic split is intentionally flexible: SubTopics may be versions (Python 3.13, 3.14), facets (Commands, Agents, Skills), or any other partition chosen per Topic. Maps 1:1 to a Sheet.                                                  |
| Source             | An external resource consulted when producing a Sheet for a SubTopic — book/PDF, article/URL, video, or any other document. Sources are inputs to consolidation; they are not directly visible to the User through Sheets. |
| Consolidation User | The User acting to build or extend a CheatSheet: selecting Topics and SubTopics, gathering Sources, and producing the Sheet. This act is itself an instance of Learning Consolidation. Same human as the Reference User defined in View; the role differs. |

## §3 User Stories

### US-1 — Generate a new CheatSheet for a Topic I have studied

[Contexts: Content]

**Title:** US-1 — Generate a new CheatSheet for a Topic I have studied

**As a** `Consolidation User`, \
**I can** generate a new empty `CheatSheet` for a `Topic` I have studied, \
**so that** I have a container ready to receive `Sheet`s as I study the `Topic`'s `SubTopic`s.

#### AC-1.1 — Generate an empty `CheatSheet` for a new `Topic` — Happy Path

```gherkin
Given no `CheatSheet` exists for the chosen `Topic`,
When the `Consolidation User` generates a `CheatSheet` for that `Topic`,
Then a new `CheatSheet` for the `Topic` is created,
    And it contains no `Sheet`s
```

---

### US-2 — Generate a Sheet for a SubTopic from its Sources

[Contexts: Content]

**Title:** US-2 — Generate a Sheet for a SubTopic from its Sources

**As a** `Consolidation User`, \
**I can** assemble a list of `Source`s for a `SubTopic` and generate a `Sheet` from them, \
**so that** my `CheatSheet` grows as I study more aspects of the same `Topic`.

#### AC-2.1 — Generate a `Sheet` for a new `SubTopic` — Happy Path

```gherkin
Given a `CheatSheet` exists for a `Topic`,
    And no `Sheet` exists for the chosen `SubTopic`,
    And the `Consolidation User` has assembled a list of `Source`s for the `SubTopic` per SOURCES_FORMAT.md,
When the `Consolidation User` generates the `Sheet`,
Then a `Sheet` conforming to CONTENT_FORMAT.md is generated from the provided `Source`s,
    And the `Sheet` appears in the `Topic`'s `CheatSheet`
```

---

### US-3 — Refresh a Sheet when its Sources change

[Contexts: Content]

**Title:** US-3 — Refresh a Sheet when its Sources change

**As a** `Consolidation User`, \
**I can** update the list of `Source`s for an existing `SubTopic` and regenerate its `Sheet` from the updated set, \
**so that** my study material stays current as I add, replace, or remove what I read.

#### AC-3.1 — Refresh a `Sheet` after updating its `Source`s — Happy Path

```gherkin
Given a `Sheet` exists for a `SubTopic` within a `CheatSheet`,
    And the `Consolidation User` has updated the `SubTopic`'s list of `Source`s per SOURCES_FORMAT.md,
When the `Consolidation User` regenerates the `Sheet`,
Then the `Sheet` is regenerated from the updated `Source`s conforming to CONTENT_FORMAT.md,
    And the `CheatSheet` continues to contain the `SubTopic`'s `Sheet` with its updated content
```

---

### US-5 — Remove a CheatSheet or a single Sheet

[Contexts: Content]

**Title:** US-5 — Remove a CheatSheet or a single Sheet

**As a** `Consolidation User`, \
**I can** remove a `CheatSheet` along with its `Topic` and every related `SubTopic` and `Source`, or remove a single `Sheet` along with its underlying `SubTopic` and `Source`s, \
**so that** I can prune material I no longer need to keep.

#### Background

```gherkin
Given a `CheatSheet` exists for a `Topic` with multiple `Sheet`s,
    And every underlying `SubTopic` and `Source` is in place
```

#### AC-5.1 — Remove an entire `CheatSheet` — Happy Path

```gherkin
Given the `Consolidation User` has initiated removal of a `CheatSheet`,
When the `Consolidation User` confirms the removal,
Then the `CheatSheet` no longer appears in the User's list,
    And every related `Sheet`, `SubTopic`, and `Source` is discarded,
    And the `Topic` is no longer tracked
```

#### AC-5.2 — Remove a single `Sheet` from a `CheatSheet` — Happy Path

```gherkin
Given the `Consolidation User` has initiated removal of a `Sheet` from a `CheatSheet`,
When the `Consolidation User` confirms the removal,
Then the `Sheet` no longer appears in the `CheatSheet`,
    And the `SubTopic` and `Source`s for that `Sheet` are discarded,
    And the remaining `Sheet`s in the `CheatSheet` are preserved
```

#### AC-5.3 — Cancel removal of a `CheatSheet` — Sad Path

```gherkin
Given the `Consolidation User` has initiated removal of a `CheatSheet`,
When the `Consolidation User` cancels the removal,
Then the `CheatSheet` remains in the User's list,
    And every `Sheet`, `SubTopic`, and `Source` is preserved unchanged
```

## §4 Data Model

### Spec-to-file-system mapping

| Spec entity | File system artifact                                               | Notes                                                                                                                 |
|-------------|--------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Topic       | `content/<topic>/`                                                 | Slug = folder name.                                                                                                   |
| SubTopic    | `content/<topic>/<subtopic>/`                                      | Slug = `<topic>/<subtopic>`.                                                                                          |
| Source      | An entry in `content/<topic>/<subtopic>/sources.yml`               | URL / PDF path / video link, type, title, fetched-at. Surfaced by the deployed app as a footer on each `Sheet[View]`. |
| Sheet       | `content/<topic>/<subtopic>/sheet.yml` + `cards/*.md`              | Manifest + per-card Markdown files (see `CONTENT_FORMAT.md`); rendered by the app.                                    |
| CheatSheet  | The set of `sheet.yml` + `cards/` directories under one `<topic>/` | Synthesised at load time; not stored as a separate artifact.                                                          |

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

## §5 API

> _Not applicable — the Content Context has no API surface. Authoring is file-based._

## §6 Procedures & Workflows

### Generation (US-1)

1. The `Consolidation User` selects a new `Topic` for which they want a `CheatSheet`.
2. An empty `CheatSheet` is generated for the `Topic`.

### Sheet generation (US-2)

1. The `Consolidation User` selects a `SubTopic` of an existing `Topic`.
2. A list of `Source`s is assembled for the `SubTopic`.
3. A `Sheet` is generated from the `Source`s and added to the `CheatSheet`.

### Refresh (US-3)

1. The `Consolidation User` updates the list of `Source`s for the affected `SubTopic`.
2. The `Sheet` is regenerated from the updated `Source`s.

### Removal (US-5)

Either the entire `CheatSheet` is removed along with all its `Sheet`s, or only the selected `Sheet` is removed. The cascade is the file-system cascade — there are no cross-folder references to clean up.

### Authoring rules

- One folder per `Topic`; one folder per `SubTopic`. A `Topic` with a single `SubTopic` is simply a `Topic` with one folder under it.
- The `Consolidation User` produces `sources.yml` first, then `sheet.yml` + `cards/*.md` from those `Source`s. Claude Code is responsible for enforcing this order during authoring.
- Files starting with `_` are editorial scratch and ignored by the loader.
- Removing a `<topic>/` folder discharges US-5 for the whole `CheatSheet`; removing a `<topic>/<subtopic>/` folder discharges US-5 for a single `Sheet`.

## §7 Frontend

> _Not applicable — the Content Context has no frontend surface. Rendering lives in [`view.md` §7](view.md#7-frontend)._
