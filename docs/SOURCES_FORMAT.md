# `sources.yml` Format

Each SubTopic folder contains one `sources.yml` listing the Sources consulted to produce its `reference.md`. Sources are the inputs to consolidation; they are not exposed by the deployed app.

## Schema

```yaml
sources:
  - title: <human-readable title>
    url: <absolute URL or repo-relative path>
    type: doc | article | rfc | pep | video | pdf | other
    fetched: <ISO date YYYY-MM-DD>
    notes: <one-line free text, optional>
```

| Field    | Required | Notes |
|----------|----------|-------|
| `title`  | yes      | Display name of the Source. |
| `url`    | yes      | An absolute URL, or a repo-relative path for local files (e.g. PDFs in `content/<topic>/<subtopic>/`). |
| `type`   | yes      | One of: `doc` (official docs), `article` (blog / write-up), `rfc`, `pep`, `video`, `pdf`, `other`. |
| `fetched`| yes      | The date the Source was last consulted. ISO format, no time. |
| `notes`  | no       | One short line on why this Source was picked or what it provides. |

## Example

```yaml
sources:
  - title: What's New In Python 3.14
    url: https://docs.python.org/3/whatsnew/3.14.html
    type: doc
    fetched: 2026-04-18
    notes: official release notes — primary authoritative source
  - title: PEP 750 — Template String Literals
    url: https://peps.python.org/pep-0750/
    type: pep
    fetched: 2026-04-18
```

## Authoring rules

- One entry per Source. Do not group multiple URLs under one entry.
- Keep the list curated. 3–7 well-chosen Sources outweighs a long undifferentiated list.
- When the Source list changes, update `fetched` for any re-consulted Source and run the Refresh flow (US-3) to regenerate `reference.md` and `sheet.md`.
- Local binaries (PDFs, slide decks) live alongside `sources.yml` in the SubTopic folder; reference them with a relative `url`.
