# CheatSheet Specifications

**Source:** `docs/specs.md`

A personal CheatSheet web application that supports Learning Consolidation and Learning Retention by giving the User a single-page, information-dense view of each SubTopic they have studied, optimised for photographic recall.

## Table of Contents

- [Contexts & Dictionary](#contexts--dictionary)
- [User Stories](#user-stories)
  - [US-1 — Generate a new CheatSheet for a Topic I have studied](#us-1--generate-a-new-cheatsheet-for-a-topic-i-have-studied)
  - [US-2 — Add a new SubTopic to an existing CheatSheet](#us-2--add-a-new-subtopic-to-an-existing-cheatsheet)
  - [US-3 — Refresh a Sheet when its Sources change](#us-3--refresh-a-sheet-when-its-sources-change)
  - [US-4 — Browse a CheatSheet and read its Sheets](#us-4--browse-a-cheatsheet-and-read-its-sheets)
  - [US-5 — Remove a CheatSheet or a single Sheet](#us-5--remove-a-cheatsheet-or-a-single-sheet)
- [Non-Functional Requirements](#non-functional-requirements)
- [Unstructured Specs](#unstructured-specs)

## Contexts & Dictionary

### Context: Content

The Content Context covers the structure of subject matter the User has studied and the source material from which Sheets are built — Topics, SubTopics, Sources, and the consolidated References that back each SubTopic. It also defines the User in their role as builder of CheatSheets.

#### Relationships

Pairs with the View Context. Each Topic in Content corresponds to one CheatSheet in View — same underlying thing, different aspect (information vs rendered view). Each SubTopic corresponds 1:1 to a Sheet. Sources and References are intermediate artifacts; the Consolidation User reads References directly during build, but they are not exposed through the View Context. The Consolidation User defined here is the same human as the Reference User defined in View; the two roles capture different activities (building vs consuming) and may be carried out at different times by the same person.

#### Dictionary

| Term               | Definition |
|--------------------|------------|
| Topic              | A broad subject area the User has studied, considered as information (e.g., "Python", "HTTP", "Claude Code"). Same underlying thing as a CheatSheet, viewed from the information aspect. |
| SubTopic           | A specific area or aspect within a Topic. The Topic→SubTopic split is intentionally flexible: SubTopics may be versions (Python 3.13, 3.14), facets (Commands, Agents, Skills), or any other partition chosen per Topic. Maps 1:1 to a Sheet. |
| Source             | An external resource consulted when producing the Reference of a SubTopic — book/PDF, article/URL, video, or any other document. Sources are inputs to consolidation; they are not directly visible to the User through Sheets. |
| Reference          | A single Markdown file consolidating all of a SubTopic's Sources into one comprehensive document. Serves a dual purpose: study material the User reads directly, and input from which the Sheet is generated. Distinct from a Source (raw input) and a Sheet (rendered view). |
| Consolidation User | The User acting to build or extend a CheatSheet: selecting Topics and SubTopics, gathering Sources, and producing the Reference from which a Sheet is generated. This act is itself an instance of Learning Consolidation. Same human as the Reference User defined in View; the role differs. |

### Context: View

The View Context covers what the User sees and navigates — the single-page, information-dense rendered surfaces optimised for photographic recall. It also defines the User in their role as consumer of CheatSheets.

#### Relationships

Pairs with the Content Context. A CheatSheet is the rendered view of exactly one Topic; a Sheet is the rendered view of exactly one SubTopic, generated from that SubTopic's Reference. The Reference User does not edit View artifacts directly — content changes flow through Content (Sources → Reference → Sheet). The Reference User defined here is the same human as the Consolidation User defined in Content; the two roles capture different activities (consuming vs building) and may be carried out at different times by the same person.

#### Dictionary

| Term           | Definition |
|----------------|------------|
| CheatSheet     | The complete view of one Topic. A collection of Sheets — one per SubTopic — sharing a unified style. Same underlying thing as a Topic, viewed from the rendering aspect. |
| Sheet          | The single-page view of one SubTopic. Information-dense, spatially stable, optimised so the User can rely on photographic recall to relocate previously-seen information. Generated from the SubTopic's Reference. |
| Reference User | The User acting to consume an already-built CheatSheet: opening it, navigating between its Sheets, and using photographic recall to retrieve previously-studied information (Learning Retention). Same human as the Consolidation User defined in Content; the role differs. |

## User Stories

### US-1 — Generate a new CheatSheet for a Topic I have studied

[Contexts: Content, View]

**Title:** US-1 — Generate a new CheatSheet for a Topic I have studied

**As a** `Consolidation User`, \
**I can** start a new `CheatSheet` for a `Topic` by selecting its first `SubTopic`, providing its `Source`s, and consolidating them into a `Reference` from which the first `Sheet` is generated, \
**so that** I have a single-page reference of what I have studied so far.

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

### US-2 — Add a new SubTopic to an existing CheatSheet

[Contexts: Content, View]

**Title:** US-2 — Add a new SubTopic to an existing CheatSheet

**As a** `Consolidation User`, \
**I can** add a new `SubTopic` to an existing `CheatSheet` by providing its `Source`s and consolidating them into a `Reference` from which a new `Sheet` is generated, \
**so that** my `CheatSheet` grows as I study more aspects of the same `Topic`.

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

### US-3 — Refresh a Sheet when its Sources change

[Contexts: Content, View]

**Title:** US-3 — Refresh a Sheet when its Sources change

**As a** `Consolidation User`, \
**I can** change the list of `Source`s for an existing `SubTopic` and have its `Reference` and `Sheet` regenerated from the updated set, \
**so that** my study material stays current as I add, replace, or remove what I read.

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

### US-4 — Browse a CheatSheet and read its Sheets

[Contexts: View]

**Title:** US-4 — Browse a CheatSheet and read its Sheets

**As a** `Reference User`, \
**I can** open a `CheatSheet` and navigate between its `Sheet`s, \
**so that** I can recall what I have studied using my photographic memory.

INVEST check:
- **I**ndependent — pass: a `CheatSheet` could come from any source, not strictly Story 1.
- **N**egotiable — pass: navigation UX (tabs, scroll, keyboard, etc.) is open.
- **V**aluable — pass: this story IS the Learning Retention goal for the `Reference User`.
- **E**stimable — pass: bounded reading/navigation surface.
- **S**mall — pass.
- **T**estable — pass: the `Reference User` opens a `CheatSheet`, sees `Sheet`s, can switch between them.

#### Background

```gherkin
Given a `CheatSheet` for "Python" exists with `Sheet`s "3.13" and "3.14"
```

#### AC-4.1 — Open a `CheatSheet` — Happy Path

```gherkin
Given the `Reference User` has the "Python" `CheatSheet` available in their list,
When the `Reference User` opens the "Python" `CheatSheet`,
Then the `CheatSheet` is displayed,
    And one of its `Sheet`s is shown by default
```

#### AC-4.2 — Switch to another `Sheet` within the `CheatSheet` — Happy Path

```gherkin
Given the `Reference User` is viewing the "Python" `CheatSheet` with `Sheet` "3.13" displayed,
When the `Reference User` selects `Sheet` "3.14",
Then `Sheet` "3.14" is displayed in place of "3.13"
```

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

## Non-Functional Requirements

_Skipped per project scope. This is a small personal project; FURPS+ Non-Functional Requirements are not being formalised at this stage. Add this section if/when scale, performance, security, or compliance constraints become relevant._

## Unstructured Specs

### Goals
- Learning Consolidation: provide a comprehensive overview of topics, allowing users to quickly grasp the key concepts and information they have already studied through the users' photographic memory.
- Learning Retention: serve as a reference for users to look up specific information about a topic without having to go through extensive documentation or resources.

#### What is not the Goal
- Completeness of Information: information shown is comprehensive of what the user has already studied, not necessarily comprehensive of all information regarding the topic.


### Project Definitions & Terminology

Overview of the project's terminology and definitions:
- Goals are implemented via CheatSheets generation.
- Each Topic is related to one CheatSheet.
- A Topic might have related SubTopics.
- A CheatSheet is a collection of Sheets.
- Each SubTopic is related to a specific Sheet of a CheatSheet.

#### Content - Topic & Subtopics
- A Topic is a broad subject area that encompasses various concepts, principles, and information related to a specific field of study or interest.
- SubTopics are specific areas or aspects within a Topic that provide more detailed information and focus on particular concepts or principles related to the broader Topic.

Their relationship definition is kept simple and general to allow flexibility in defining how Topics are split into SubTopics. In extreme cases, SubTopics are completely arbitrary and can be defined as needed.

Example 1:
- Topic: Python
- SubTopics: Python 3.13, Python 3.14, Python 3.15

Example 2:
- Topic: Claude Code
- SubTopics: Commands, Agents, Skills, Context Management.

#### View - CheatSheet & Sheets
- A CheatSheet represents the view of a Topic.
- A CheatSheet is a collection of Sheets, one for each SubTopic of the Topic.
- A Sheet is a specific view of a SubTopic of a CheatSheet.

The fundamental property of Sheets is that they offer an organized, comprehensive view of SubTopic information in one single interactive interface. Leveraging photograpic memory is at the center of the User's needs.

CheatSheets offer a unified style for all Sheets it contains.

### Processes

The project contains four processes:
1. CheatSheet Creation: a new CheatSheet is generated and added to the list of available CheatSheets.
2. CheatSheet Update: an existing CheatSheet is updated with new information or changes.
3. CheatSheet View: the User navigate the CheatSheet of a Topic and its Sheets.
4. CheatSheet Removal: a CheatSheet is removed from the list of available CheatSheets.

#### CheatSheets/Sheets Generation

1. The User selects a new Topic for which they want to generate a CheatSheet.
2. The User selects the first SubTopic of the Topic.
3. A list of Sources is generated based on the Topic → SubTopic provided.
   - A Source is a specific resource or reference that contains information related to the Topic.
   - It can be a book (PDF file), article (URL), video, or any other type of document that provides relevant information about the Topic.
4. All Sources are processed, and their information organized in a single comprehensive Markdown file, which represents the content of the SubTopic.
5. CheatSheets and the first Sheet of the CheatSheet are generated and added to the list of available CheatSheets.

#### CheatSheets/Sheets Update

A CheatSheet is updated in two ways:
1. Source List is changed.
2. A new SubTopic is added to the Topic.

If a Source List is changed, each SubTopic impacted by the change is impacted:
1. The new list of Sources is processed, and their related Markdown files are updated.
2. CheatSheet and impacted Sheets are updated.

If a new Subtopic is added:
1. A new List of Sources is generated.
2. The new List of Sources is processed into a its new Content Markdown file.
3. A new Sheet is generated and added to the CheatSheet.

#### CheatSheets View

1. The User selects a CheatSheet to view its Sheets.
2. The User navigates through the Sheets of the selected CheatSheet, accessing the information related to each SubTopic.
3. The User can interact with the Sheets, such as expanding sections, clicking on links, or accessing additional resources related to the SubTopic information.

#### CheatSheets Removal

Either the entire CheatSheet is removed along with all its Sheets or only the selected Sheet is removed.
