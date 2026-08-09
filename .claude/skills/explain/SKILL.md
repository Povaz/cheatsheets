---
name: explain
description: guidelines to create a self-contained HTML page (an embedded Sheet artifact) that introduces a topic and stays useful as a reference. Lean project variant — no in-page title, no tip/gotcha callouts, no glossary or cheat-sheet tails.
---

Produce the result as a single self-contained Artifact: one rendered HTML page that first introduces the topic to the user and then dives deeper into a comprehensive explanation of the topic, with the scope bounded by the user (ask if unbounded or ambiguous).

Method:
- Progressive disclosure. Order concepts so each is introduced only after
  everything it depends on. The reader must be able to go top-to-bottom once,
  never needing to jump ahead for a term used earlier — if concept B relies on
  concept A, A comes first. State this promise and honor it.
- Verified official sources. Ground every claim in primary/official documentation;
  prefer it over blogs unless the community canonically relies on an unofficial
  source. Before citing any URL, confirm it actually resolves and says what you
  claim — never cite from memory. Do not embed source links or an "All sources"
  list in the page — attribution lives outside it (`sources.yml` for CheatSheet
  artifacts).
- Voice. Direct, crisp, schematic: short paragraphs, lists over prose, concrete
  examples (use my stack/context when I give it). No change-history, no filler.

Page structure:
- No hero or in-page title section — the host page provides the title. The page
  starts directly at the table of contents. Keep only a concise `<title>` tag.
- A numbered table of contents (sidebar on desktop, collapsing on mobile).
- Numbered sections.
- No tip/warning/gotcha callouts — if a fact is essential to the concept, it
  belongs in the body text; if it isn't, omit it. A small flow diagram or table
  wherever it clarifies more than prose.

Artifact constraints:
- Fully self-contained: inline CSS, system-font stack, no external resources
  (the CSP blocks them).
- Modest, symmetric page spacing: ~28px padding above the first element and
  ~24px below the last section. No large tail padding sized for standalone
  pages, and no trailing margin on the last section (reset it with
  `section:last-of-type`).
- Responsive; tables and code blocks scroll inside their own container so the
  page never scrolls horizontally.
- Set a concise <title> and a fitting favicon emoji; commit to one clean visual
  direction.
