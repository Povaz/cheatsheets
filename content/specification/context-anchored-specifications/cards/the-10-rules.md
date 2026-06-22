## [table the-10-rules] The 10 Rules

| code | desc | detail |
|------|------|--------|
| **R1** | Highlighting is mandatory — every defined term in its dictionary sense → backticks: `` `Invoice` `` | Backticks render as monospace in every viewer, survive format conversion, are mechanically greppable. Mistakes are corrected at review like any spec bug — not treated as compliance failure. |
| **R2** | Smells are prompts, not failures — a smell triggers discussion, not rejection | The framework supports shared understanding, not compliance. Examples in the Building Blocks card. |
| **R3** | Each anchored Story has ≥1 Context — most Stories should have *exactly* one | Multi-Context Stories tend to be oversized and mix domains. Unanchored Stories must be anchored before the next recurring review. |
| **R4** | AC inherit all parent Story's Contexts — terms read against the union of Dictionaries | If a term is defined differently across two of those Contexts, Rule 5 disambiguation kicks in. |
| **R5** | Multi-Context: inline disambiguation — `` `term[Context]` `` only when same-term divergence | In *all other* cases (including most uses in multi-Context Stories), plain backticks suffice. Inline annotation = **point of attention** for reviewers. |
| **R6** | Split-or-keep rubric — default to split if (a) single-rephrase, (b) independent terms, or (c) clean INVEST split | See dedicated card. Override the default only with explicit recorded reasoning. |
| **R7** | Prune at recurring spec reviews — not a special event — happens at sprint review or equivalent cadence | Zero-citation terms removed; one-citation terms kept only if judged important. *"Important"* is intentionally undefined. No formal "freeze" or "snapshot" — releases live outside the framework as sales/management artifacts. |
| **R8** | Iteration is mandatory — Dictionary, Stories, AC evolve together continuously | If drafting a Story or AC needs a Dictionary adjustment, do it *before* finalizing the artifact — no separate change-control gate. |
| **R9** | Definition changes propagate backwards — the affected-artifact set is mechanically identifiable: every Story/AC whose highlighted text contains that term | The structural counterpart of R8 and the property that justifies the highlighting overhead. Without R9, R1 is decorative. With it, the Dictionary becomes a navigable index. |
| **R10** | Code-level usage is encouraged, not enforced — carry Dictionary terms into class/function/var/module/API/DB/UI names | No syntactic check by the framework. See *Lineage → honest divergence* for the trade-off. |
