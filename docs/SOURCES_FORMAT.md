# `sources.yml` Format

Each SubTopic folder contains one `sources.yml` listing the Sources consulted to produce its `reference.md`. Sources are the inputs to consolidation, and the deployed app surfaces them as a footer on each rendered Sheet so a Reference User can jump to the original material.

## Schema

```yaml
sources:
  - title: <human-readable title>
    url: <absolute URL or repo-relative path>
    type: doc | article | rfc | pep | video | pdf | other
    fetched: <ISO date YYYY-MM-DD>
    read_as: <one-line consolidation directive, optional>
```

| Field     | Required | Notes |
|-----------|----------|-------|
| `title`   | yes      | Display name of the Source. |
| `url`     | yes      | An absolute URL, or a repo-relative path for local files (e.g. PDFs in `content/<topic>/<subtopic>/`). |
| `type`    | yes      | One of: `doc` (official docs), `article` (blog / write-up), `rfc`, `pep`, `video`, `pdf`, `other`. |
| `fetched` | yes      | The date the Source was last consulted. ISO format, no time. |
| `read_as` | no       | One short line telling the `Consolidation User` *how* to read this Source when producing the Reference: what to extract, what to skip, what role it plays. Examples: `concepts only — skip the step-by-step walkthrough`, `authoritative — quote API signatures verbatim`, `secondary — only fill gaps left by the official docs`. Omit when the default (read in full, weigh by `type`) is fine. |

## Example

```yaml
sources:
  - title: What's New In Python 3.14
    url: https://docs.python.org/3/whatsnew/3.14.html
    type: doc
    fetched: 2026-04-18
    read_as: authoritative — drive the Sheet's structure from this; quote new-feature signatures verbatim
  - title: PEP 750 — Template String Literals
    url: https://peps.python.org/pep-0750/
    type: pep
    fetched: 2026-04-18
    read_as: extract the final accepted syntax and semantics; skip the rejected-alternatives discussion
  - title: Real Python — Tour of Python 3.14
    url: https://realpython.com/python-314/
    type: article
    fetched: 2026-04-18
    read_as: concepts and motivating examples only — skip the tutorial steps
```

## Authoring rules

- One entry per Source. Do not group multiple URLs under one entry.
- Keep the list curated. 3–7 well-chosen Sources outweighs a long undifferentiated list.
- When the Source list changes, update `fetched` for any re-consulted Source and run the Refresh flow (US-3) to regenerate `reference.md` and `sheet.yml` + `cards/*.md`.
- Local binaries (PDFs, slide decks) live alongside `sources.yml` in the SubTopic folder; reference them with a relative `url`.
