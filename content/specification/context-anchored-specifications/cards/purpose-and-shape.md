## [text purpose-and-shape] Purpose & shape

- **Problem** — *silent semantic drift*: stakeholders use the same word in good faith and only discover at acceptance time they meant different things.
- **Intervention** — between the unstructured Spec File and User Stories, insert a **Dictionary** of `(term, definition)` pairs covering ambiguous, domain-risky, or business-weighted words.
- **Anchoring** — each Story is tagged with one or more **Contexts** and wraps defined terms in backticks. *Anchored* = at least one Context tag + highlighted terms; *unanchored* = no Context tag.
- **Why it pays off** — when a definition changes, the affected-artifact set is *mechanically identifiable*: the Stories and AC whose highlighted text contains that term. Without highlighting, the Dictionary is decorative.
