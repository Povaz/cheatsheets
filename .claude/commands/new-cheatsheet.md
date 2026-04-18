---
description: Create a new cheatsheet following the research → distill → render pipeline
argument-hint: <topic> [version/variant]
---

# New Cheatsheet Authoring Pipeline

You are creating a new cheatsheet for this project. Follow the three phases below in order. **Do not skip phases. Do not combine phases.** Stop at each approval gate and wait for explicit user confirmation before proceeding.

The topic requested: **$ARGUMENTS**

---

## Before you begin

1. Read `CLAUDE.md` for project orientation and editorial guidance (density targets, when to use each section type).
2. Determine whether this is a **flat topic** (e.g., `http`, `regex`) or a **multi-variant topic** (e.g., `python 3.14`, `postgres 16`). Multi-variant topics are ones where the technology has meaningful versions the user would want to compare. If it's ambiguous, ask the user.
3. Derive the slug:
   - Flat topic → `<topic>` (e.g., `regex`), content at `content/<topic>/<topic>.md`, research at `content/<topic>/_research.md`
   - Multi-variant → `<topic>/<variant>` (e.g., `python/3.14`), content at `content/<topic>/<variant>.md`, research at `content/<topic>/_research-<variant>.md`
4. Check whether content already exists at the target path. If so, redirect to `/refresh-cheatsheet`.

---

## Phase 1 — Research

**Goal:** compile a curated, verified knowledge base before writing any content.

**Do:**

1. Identify 3–7 high-quality primary and secondary sources. Prioritize:
   - Official documentation (release notes, language spec, RFC, vendor docs)
   - Authoritative secondary sources (PEPs, W3C specs, well-known reference sites)
   - Respected community resources (only if primary sources are thin)
   - Avoid: random blog posts, outdated tutorials, marketing pages, AI-generated content

2. Use `WebFetch` to retrieve each source. Read, don't skim — extract concrete facts, not summaries.

3. For version-specific cheatsheets, fetch the **official "what's new" / changelog / release notes** document for that version. Non-negotiable. Training data on specific versions is often incomplete; primary sources are authoritative.

4. Write a research note at the path derived above. Format:

   ```markdown
   # Research: <Topic> [<variant if any>]

   Last updated: <ISO date>
   Pipeline phase: research (approved: <pending | yyyy-mm-dd>)

   ## Sources

   | Source | URL | Accessed | Notes |
   |--------|-----|----------|-------|
   | ... | ... | ... | why this is authoritative |

   ## Key findings

   Bullet list of ~15–40 concrete facts extracted from the sources.
   Include PEP numbers, RFC numbers, version numbers, exact syntax,
   behavioral details. No prose summaries — facts only.

   ## Open questions

   Things that were ambiguous, contradictory across sources, or that
   you think the user should make a call on (scope, depth, inclusion).

   ## Proposed scope

   Which topics/subtopics this cheatsheet will cover, grouped roughly
   as they might become cards.
   ```

**⏸ APPROVAL GATE 1 — SOURCES**

After writing the research note, STOP. Present to the user:

1. The path where you wrote the research note.
2. A bulleted list of the sources you chose, with a one-line justification for each.
3. The "Proposed scope" section — what cards you're planning.
4. Any open questions that need user input.

Wait for explicit approval. Loop on Phase 1 until approved. When approved, update the research note header: `Pipeline phase: research (approved: <today's date>)`. Then proceed.

---

## Phase 2 — Distill into Markdown

**Goal:** turn the approved research into a complete cheatsheet source file.

**Do:**

1. **Read `docs/CONTENT_FORMAT.md` in full before writing any content.** This is the authoritative specification for section types, frontmatter, callouts, and inline formatting. Do not improvise; do not rely on memory from a prior session. The format may have been updated.

2. **Write the cheatsheet content** to the path derived at the start. Follow the authoring guidance in `CLAUDE.md` (editorial direction — density targets, when to use each section type) together with the strict format rules from `docs/CONTENT_FORMAT.md` (syntax):
   - 5–8 cards for a well-filled sheet
   - Each card densely populated; use `detail` columns for expanded info
   - Pick section IDs that are memorable and make sense as spatial anchors (the user's photographic memory uses them as landmarks)
   - Add `tip` and `warn` callouts where they earn their place — don't pad

3. **Do not modify the Vue code** to accommodate content that doesn't fit. If content needs a section type that doesn't exist in `docs/CONTENT_FORMAT.md`, stop and raise it as an open question. The content format is stable; the code follows it, not vice versa. Format changes happen by amending `docs/CONTENT_FORMAT.md` first, then updating the parser to match.

4. Set frontmatter carefully:
   - `title` — the topic display name
   - `variant` — set for multi-variant, omit for flat
   - `subtitle` — one short line, information-first, not marketing
   - `accent` — pick a color that matches the technology's conventional identity (Python blue, Rust orange, Go cyan) if it has one; otherwise omit and inherit the default
   - `layout` — `grid` (default) or `columns`

5. Cross-reference against the research note. Every non-obvious claim should be traceable to a source. If something is in the content but not the research, either add it to research with a source, or remove it from the content.

6. Update the research note header: `Pipeline phase: content (drafted: <date>)`.

**⏸ APPROVAL GATE 2 — CONTENT**

After writing the `.md` file, STOP. Present to the user:

1. The path to the new `.md` file.
2. A summary of the sections you created (titles + row counts + any callouts).
3. Any decisions you made that weren't explicitly spec'd.
4. Any content you considered but cut, with reasoning.

Wait for explicit approval. Loop on Phase 2 until approved. Update the research note header: `Pipeline phase: content (approved: <date>)`. Then proceed.

---

## Phase 3 — Render & verify

**Goal:** confirm the new cheatsheet loads correctly in the app.

**Do:**

1. Run the dev server if not already running: `npm run dev`.

2. Verify the cheatsheet appears:
   - Flat topic: `/#/<topic>` renders directly
   - New multi-variant first variant: `/#/<topic>` lists variants, `/#/<topic>/<variant>` renders
   - Added variant of existing topic: variant switcher includes the new variant

3. Visually confirm:
   - Rows render with correct columns
   - Callouts display with correct tip/warn styling
   - Variant switcher works (for multi-variant)
   - Detail modal works on rows with `detail` fields
   - Search matches rows from the new cheatsheet
   - Responsive layout holds at 1200 / 900 / 600 px

4. Run `npm run build` to confirm production build succeeds.

5. If anything fails:
   - **Parser errors** → fix the Markdown, not the parser. If the content format genuinely needs extension, stop and ask — don't silently change `parseCheatsheet.js`.
   - **Rendering errors** → check browser console, report to user, do NOT modify component code without asking.
   - **Build errors** → same — report, don't silently fix by rewriting code.

6. Update the research note header: `Pipeline phase: complete (shipped: <date>)`.

**✅ DONE**

Report to the user:
1. Paths to `_research.md` and the new content file.
2. URL to view the cheatsheet in the dev server.
3. Suggestion: `git add content/<topic>/ && git commit -m "Add <topic> cheatsheet"`.

---

## Rules that apply across all phases

- **Never skip research.** The research note is the memory of why content looks the way it does; it's not optional.
- **Never edit the Vue components or parser** to accommodate content. Change the content, or propose a `docs/CONTENT_FORMAT.md` amendment.
- **Commit the `_research.md` file.** It's a repo artifact, not scratch work.
- **Date everything in ISO format** (`2026-04-17`).
- **If you're uncertain, ask.** A 10-second clarification saves a 10-minute rewrite.
