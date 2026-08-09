# View

> The View Context covers what the User sees and navigates — the single-page, information-dense rendered surfaces optimised for photographic recall. It also defines the User in their role as consumer of CheatSheets.

# 1. Relationships

View renders the content data model and is driven by the authoring procedures, both defined in the Master HLDD. Each View term is the rendered aspect of a content entity defined in [Master §4](../hldd.md#4-data-model): a `CheatSheet` renders one `Topic`, and a `Sheet` renders one `SubTopic` from its `Fragment` — each 1:1.

The `Reference User` does not edit `Sheet` content directly — content changes flow through the authoring procedures ([Master §7](../hldd.md#7-procedures)): Sources are consulted and a Sheet is generated. The `Reference User` is the same human as the `Consolidation User` ([Master §2.1](../hldd.md#21-user-roles)) in a different role.

# 2. Dictionary

## `CheatSheet`

The complete view of one `Topic`. A collection of `Sheet`s — one per `SubTopic` — sharing a unified style. Same underlying thing as a `Topic` (defined in [Master §4](../hldd.md#4-data-model)), viewed from the rendering aspect.

## `Sheet`

The single-page view of one `SubTopic`, rendered from its `Fragment` as a native page in the site's design system. Information-dense, spatially stable, optimised so the `Reference User` can rely on photographic recall to relocate previously-seen information. Generated from the `SubTopic`'s `Source`s.

## `Fragment`

The authored body of a `Sheet`: semantic HTML in the fixed vocabulary ([Master §4.1](../hldd.md#41-content-entities)), carrying structure and content only — no styling, no scripts, no colours of its own. The site styles it and drives its behaviour ([Master §3.5](../hldd.md#35-sheet-fragment-contract)).

## `Table of Contents`

The navigation rail of a `Sheet`, derived by the renderer from the `Fragment`'s sections — never authored. A sidebar on wide screens; a collapsible block above the content on small screens. Activating an entry scrolls to its section; the section currently in view is indicated.

## `Reference User`

The User acting to consume an already-built `CheatSheet`: opening it, navigating between its `Sheet`s, and using photographic recall to retrieve previously-studied information (Learning Retention). Same human as the `Consolidation User` ([Master §2.1](../hldd.md#21-user-roles)); the role differs.

# 3. User Stories

- [US-4 — Browse a CheatSheet and read its Sheets](user-stories/us-browse-cheatsheet.md)
- [US-page-view — View a Sheet as a native page](user-stories/us-page-view.md)
- [US-dark-mode — Toggle between Light and Dark display modes](user-stories/us-dark-mode.md)
- [US-sheet-search — Search within a Sheet](user-stories/us-sheet-search.md)
- [US-mobile-readonly — Read a Sheet on a small screen](user-stories/us-mobile-readonly.md)
