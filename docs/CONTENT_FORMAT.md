# Sheet Content Format

This is the authoritative specification for `sheet.md` files. Every `content/<topic>/<subtopic>/sheet.md` must conform to this format. The parser in `web/src/lib/parseCheatsheet.js` implements this spec.

If you need to extend the format (new section type, new attribute, new callout), amend this document *first*, then update the parser to match. Content files should never drive parser changes — the parser exists to serve this spec.

## Frontmatter

```yaml
---
title: Python                   # Topic display name
subtitle: "language reference + 3.14 features"
---
```

The SubTopic name is taken from the parent folder name; it is not part of the frontmatter.

## Section headers

Sections are `H2` headers (`##`) with an optional type tag in brackets:

```markdown
## [card 2xx] 2xx — Success {accent: status-2xx}
## [pills methods] Methods
## [diagram] Request lifecycle
## [card stdlib] Standard library highlights
```

Format: `## [TYPE ID] Display Title {key: value, key: value}`

- `TYPE` — section renderer. See types below.
- `ID` — optional, used as stable DOM id and for search indexing. Defaults to slugified title.
- `Display Title` — the text shown on the card header.
- `{...}` — optional attribute block. Common attrs: `accent`, `span`, `cols`.

If no type tag is given, defaults to `card`.

## Chapters

Sections can be grouped into ordered **Chapters**. A chapter is declared with the `[chapter]` type tag; it is a structural marker, not a renderable card. Every section that follows attaches to the most-recent `[chapter]` until the next one.

```markdown
## [chapter] Introduction {type: vertical}

## [text purpose] Purpose & shape
...

## [card artifacts] Three Artifacts, Three Jobs
...

## [chapter] Deep-Dive {type: columns}

## [card building-blocks] Building Blocks
...
```

- `type` attribute: `vertical` (one card per row, full width) or `columns` (responsive masonry, the default). Omitted → `columns`.
- Chapter id is auto-slugged from the title (e.g. `Deep-Dive` → `deep-dive`); explicit ids are allowed via `[chapter <id>]` mirroring card id syntax.
- Chapters render with a horizontal rule above and the chapter title set vertically on the left rail of the chapter content.

**Implicit chapter:** Sheets that declare no `[chapter]` headers fall into a single implicit `columns` chapter with no title — divider and rail are not rendered, and the page looks identical to a chapter-free sheet. This keeps existing sheets backward-compatible.

## Section types

### `card` — titled box with a table of rows

Primary format. Table columns map to properties on each row:

```markdown
## [card 2xx] 2xx — Success {accent: status-2xx}

| code | name         | desc                         | detail                                    |
|------|--------------|------------------------------|-------------------------------------------|
| 200  | OK           | standard success             | Returns the resource in the body.         |
| 201  | Created      | resource created             | Location header should point to it.       |

> [tip] 201 with Location header is the REST-correct response to POST.
> [warn] 301 and 302 rewrite to GET on redirect.
```

Columns: `code` (mono, bold), `name` (semibold), `desc` (muted), `detail` (chapter-dependent — see below). All columns optional except at least one content column. Non-standard column names are rendered as extra muted text.

The `detail` column behaves differently depending on its parent chapter's `type`:

- In a `columns` chapter (the default), `detail` is **hidden** in the grid; rows with a non-empty `detail` value become **clickable** and open the value in a modal.
- In a `vertical` chapter, `detail` is rendered **inline** as another column; the row is **not** clickable. Vertical chapters have full horizontal width per card, so showing `detail` directly is preferred over the click-to-open interaction.

Rows without a `detail` value are plain rows in either chapter type.

### `pills` — label pills with descriptions

Use for methods, headers, keywords:

```markdown
## [pills methods] Methods

| pill    | desc                           |
|---------|--------------------------------|
| GET     | retrieve — safe, idempotent    |
| POST    | create — not idempotent        |
```

### `code` — card containing code blocks

Use for idiom references:

````markdown
## [code idioms] Idioms

```python
# walrus operator
if (n := len(data)) > 10:
    print(f"{n=}")

# match / case
match point:
    case (0, 0): "origin"
    case (x, 0): f"on x-axis at {x}"
```
````

Use language-specific fences. Rendered as a plain monospaced block in v1 (syntax highlighting deferred).

### `diagram` — card containing inline SVG

Used when content has inherent spatial structure (e.g., request/response flow):

````markdown
## [diagram] Request / Response Lifecycle

```svg
<svg viewBox="0 0 300 110">...</svg>
```
````

The SVG string is rendered inline. Keep it trusted — this content is not sanitized.

### `text` — card with short formatted prose

Supports Markdown inline formatting: `**bold**`, `*em*`, `` `code` ``, `[links](url)`, and bullet lists.

```markdown
## [text mental-model] Mental model

- **1xx** — "hold on"
- **2xx** — "here you go"
- **3xx** — "look over there"
- **4xx** — "you messed up"
- **5xx** — "I messed up"
```

## Callouts

Use blockquote syntax with a prefix tag:

```markdown
> [tip] Use idempotency keys for POST retries.
> [warn] 502/504 almost always mean a proxy/LB issue, not your app.
```

Callouts attach to the preceding section and render below its body.

## Inline formatting in table cells

Within table cells, support minimal Markdown:

- `` `backticks` `` → inline code
- `**bold**` → bold
- `*em*` → italic
- `[text](url)` → link

Nothing else. Tables are for structured data, not prose.

## Escaping pipes in table cells

A literal `|` inside a cell must be escaped as `\|`. The parser strips the backslash and keeps the pipe. Without the escape, the pipe is treated as a column separator and the cell will be split.

```markdown
| idiom      | example                        |
|------------|--------------------------------|
| dict merge | `{**a, **b}` or `a \| b`       |
```

## Accent values

In `{accent: ...}`:

- `status-2xx`, `status-3xx`, `status-4xx`, `status-5xx` — semantic, resolved to the palette.
- `neutral` — no top border (default).
- Hex value (e.g. `#3776ab`) — custom. Either unquoted (`{accent: #3776ab}`) or quoted (`{accent: "#3776ab"}`) is accepted; quotes are stripped on parse.

### Span attribute

To make a card span every column of its parent `columns` chapter, set `{span: full}`:

```markdown
## [card overview] Overview {span: full}
```

Inside a `vertical` chapter, every card already takes the full horizontal width, so `{span: full}` is a no-op there.

## Minimal working example

```markdown
---
title: Example
subtitle: demonstration
---

## [card basics] Basics

| keyword | desc                    |
|---------|-------------------------|
| `let`   | block-scoped binding    |
| `const` | immutable binding       |

> [tip] Prefer `const` by default.

## [pills types] Primitives

| pill   | desc                |
|--------|---------------------|
| number | IEEE 754 float      |
| string | UTF-16 code units   |

## [text notes] Notes

- Numbers and strings are **immutable**.
- Arrays and objects are **reference types**.
```

## How to extend this format

1. **Edit this document** with the new section type, attribute, or callout — including an example.
2. **Update `web/src/lib/parseCheatsheet.js`** to recognize it.
3. **Add or update the renderer** in `web/src/pages/Sheet.vue` (or in a component under `web/src/components/`).

The spec leads; the parser and the renderer follow. Never the other way around.
