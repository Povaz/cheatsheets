---
name: questions
description: guidelines to create a new questions for Daily Recall feature
---

# What this Skill does
It generates 10 new questions for the CheatSheets project, refreshing its Daily Recall feature.

# How to use it

1. Read `docs/hldd/hldd.md` §3 (Data Model — `Daily Recall set` and `Question Bank`) and §4.2 (Procedure P2 — Generate Daily Recall).
2. Read `content/recall/today.json` to see the current shape in practice.
3. Read all `content/*/` directories. For each subtopic, read its `sheet.yml` to get the title, and its `sheet.html` to understand the content.
4. Pick 10 subtopics at random, no two questions from the same subtopic.
5. Read `content/recall/bank.json` and collect the past questions of each picked subtopic.
6. For each picked subtopic, generate one multiple-choice question per the `Question` shape in §3 (and `today.json` in practice). Never repeat a bank question for that subtopic — asking the same fact or the same angle counts as a repeat, even with different wording.
7. Write the result to `content/recall/today.json`, overwriting the previous set.
8. Append the same 10 questions to `content/recall/bank.json` — after the `today.json` write, so the bank only ever contains questions that shipped.

# Rules
Follow these guidelines to generate the questions.

## Challenge my software engineering reasoning skills, not my mnemonic ones.
- Do not fixate on very detailed hard/mnemonic facts, write questions that measures my Software Engineering and Design/Architectural skills.
- Hard/Mnemonic facts can be used in the Question to lay out the question itself.

## Write comprehensive answer explanations
- Following the Questions rationale, explanations should cover the same Software Engineering and Design/Architectural explanations.

## Distractors must be plausible — wrong but related, never absurd
- Avoid writing wrong answers that are outside the topic of the question and imply apparently wrong outcomes
