# View

> The View Context covers what the User sees and navigates — the single-page, information-dense rendered surfaces optimised for photographic recall. It also defines the User in their role as consumer of CheatSheets.

# 1. Relationships

View is the only Context; it renders the content data model and is driven by the authoring procedures, both defined in the Master HLDD. Each View term is the rendered aspect of a content entity defined in [Master §4](../hldd.md#4-data-model): a `CheatSheet` renders one `Topic`, a `Sheet` renders one `SubTopic`, and an `Embedded Sheet` renders one Artifact SubTopic — each 1:1.

The `Reference User` does not edit `Sheet` content directly — content changes flow through the authoring procedures ([Master §7](../hldd.md#7-procedures)): Sources are consulted and a Sheet is generated. The `Reference User` does, however, adjust the per-`Chapter` rendering of any `Sheet` (font sizes, column count, layout) and the `Sheet`-wide page max-width, without affecting content; those preferences are the runtime settings store ([Master §4.2](../hldd.md#42-runtime-settings-store)). The `Reference User` is the same human as the `Consolidation User` ([Master §2.1](../hldd.md#21-user-roles)) in a different role.

# 2. Dictionary

## `CheatSheet`

The complete view of one `Topic`. A collection of `Sheet`s — one per `SubTopic` — sharing a unified style. Same underlying thing as a `Topic` (defined in [Master §4](../hldd.md#4-data-model)), viewed from the rendering aspect.

## `Sheet`

The single-page view of one `SubTopic`. Information-dense, spatially stable, optimised so the `Reference User` can rely on photographic recall to relocate previously-seen information. Generated from the `SubTopic`'s `Source`s. A `Sheet` is rendered either from `Chapter`s of cards (the default) or from the embedded artifact of an Artifact SubTopic (an `Embedded Sheet`).

## `Embedded Sheet`

A `Sheet` whose body is the single embedded artifact of an Artifact SubTopic, rendered as-is in an isolated style scope. It has no `Chapter`s; per-`Chapter` and page-width controls do not apply. Maps 1:1 to an Artifact SubTopic (defined in [Master §4.1](../hldd.md#41-content-entities)). The isolation mechanism is recorded in [Master §3.6](../hldd.md#36-embedded-sheet-isolation).

## `Chapter`

A named structural group of cards within a `Sheet`. A `Sheet` may declare zero or more `Chapter`s; a `Sheet` with no explicit `Chapter`s renders as a single implicit `Chapter`. Each `Chapter` has its own layout (vertical or columns) and its own per-`Chapter` rendering settings (font sizes, column count). Authored as ordered entries under `chapters:` in the `SubTopic`'s `sheet.yml` ([Master §4.1](../hldd.md#41-content-entities)); consumed by the `Reference User` as the spatial grouping unit of a `Sheet`.

## `Reference User`

The User acting to consume an already-built `CheatSheet`: opening it, navigating between its `Sheet`s, and using photographic recall to retrieve previously-studied information (Learning Retention). Same human as the `Consolidation User` ([Master §2.1](../hldd.md#21-user-roles)); the role differs.

# 3. User Stories

- [US-4 — Browse a CheatSheet and read its Sheets](user-stories/us-browse-cheatsheet.md)
- [US-dark-mode — Toggle between Light and Dark display modes](user-stories/us-dark-mode.md)
- [US-sheet-search — Search within a Sheet](user-stories/us-sheet-search.md)
- [US-mobile-readonly — Read a Sheet on a small screen](user-stories/us-mobile-readonly.md)
- [US-embed-view — View an Embedded Sheet](user-stories/us-embed-view.md)
