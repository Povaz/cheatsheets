# US-sheet-search — Search within a Sheet

> Context: [View](../view.md)

**As a** `Reference User`, \
**I can** type a search term while viewing a `Sheet` and have every occurrence highlighted in place while cards with no occurrence keep their original size but show only their title, \
**so that** I can immediately spot hits and skip non-matching cards without losing the spatial layout my photographic memory relies on.

> The **APIs**, **Backend**, and **Microservices** pointer sections are not applicable to any AC in this Story — the app is a static site with no backend ([Master §5](../../hldd.md#5-api)). Each AC gives only its Data Model and Frontend pointers.

## AC-sheet-search.1 — Highlight matches and blank non-matching cards — Happy Path

```gherkin
Given the `Reference User` is viewing a `Sheet` with multiple cards,
    And at least one card contains the term "model" and at least one card does not,
When the `Reference User` types "model" into the search input,
Then every occurrence of "model" inside the rendered `Sheet` is visually highlighted in place,
    And cards that contain at least one occurrence render their content normally with the highlights applied,
    And cards that contain no occurrence keep the same size and position they had before the search, with their title visible and the rest of their body invisible
```

> An `Embedded Sheet` has no cards; search inside one highlights matches within the artifact instead (see [AC-embed-view.4](us-embed-view.md)).

**Feature file:** `frontend/e2e/features/view/sheet-search.feature` *(not yet generated)*

```mermaid
sequenceDiagram
    actor U as Reference User
    participant SB as SearchBar.vue
    participant ST as store.js
    participant S as Sheet.vue
    participant CD as Card.vue
    U->>SB: type "model"
    SB->>ST: set searchQuery
    ST-->>S: reactive query change
    S->>CD: apply highlight; blank non-matching card bodies
    CD->>U: matches highlighted in place; non-matching cards show title only
```

### Data Model
- Card content — content bundle, [Master §4.1](../../hldd.md#41-content-entities).
- `searchQuery` — transient runtime state (not persisted), held in [store.js](../../../../web/src/store.js).

### Frontend
- [SearchBar.vue](../../../../web/src/components/SearchBar.vue) — the search input.
- [Sheet.vue](../../../../web/src/pages/Sheet.vue) — orchestrates highlighting and non-matching-card blanking.
- [Card.vue](../../../../web/src/components/Card.vue) — keeps a non-matching card's size while showing only its title.
