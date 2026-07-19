# Daily Recall — Design Spec

> Feature: 10 random multiple-choice questions drawn from existing Sheets, generated daily by a Claude Code cron routine and deployed as static content.

## 1. Goal

Sheets cover topics the user studied but may not actively work with. Knowledge fades without reinforcement. Daily Recall surfaces 10 questions grounded in existing Sheet content so the user exercises recall across the full topic breadth without manual curation.

## 2. Constraints

- Static site on GitHub Pages — no backend, no runtime API calls.
- Content-as-code — questions are authored as a committed file, deployed via the existing push-to-`main` pipeline.
- No new runtime dependencies beyond the existing set (Vue, vue-router).
- Mobile-friendly — the feature should work well on a phone screen.

## 3. Data Model

One file in the content tree, overwritten daily:

```
content/recall/today.json
```

Schema:

```json
{
  "generated": "2026-07-19",
  "questions": [
    {
      "id": "2026-07-19-01",
      "topic": "django",
      "subtopic": "basics-v2",
      "question": "What does transaction.atomic do when an inner block raises?",
      "choices": [
        "Commits the outer transaction",
        "Rolls back to the savepoint",
        "Silently swallows the error",
        "Retries the block three times"
      ],
      "answer": 1,
      "explanation": "Inner atomic blocks create savepoints. An exception rolls back to that savepoint, not the entire transaction."
    }
  ]
}
```

| Field         | Type     | Notes                                                      |
|---------------|----------|-------------------------------------------------------------|
| `generated`   | ISO date | Date the set was created. Used to detect staleness.         |
| `questions`   | array    | Exactly 10 entries.                                         |
| `id`          | string   | `YYYY-MM-DD-NN`. Unique per question within a day.         |
| `topic`       | string   | Topic slug — matches `content/<topic>/`.                    |
| `subtopic`    | string   | SubTopic slug — matches `content/<topic>/<subtopic>/`.      |
| `question`    | string   | The question text.                                          |
| `choices`     | string[] | Exactly 4 options.                                          |
| `answer`      | integer  | Zero-indexed index into `choices`.                          |
| `explanation` | string   | One or two sentences on why the correct answer is correct.  |

The file is committed to `main` (deploy target). The `content/recall/` directory does not exist until the first routine run creates it.

## 4. Generation Routine

A Claude Code cron task firing daily (e.g. 06:00 CET).

### Flow

1. Check out `main`.
2. Discover all sheets by walking `content/*/` — read `sheet.yml` and `artifact.html` for each subtopic.
3. Pick 10 subtopics uniformly at random. No two questions from the same subtopic in one day.
4. For each subtopic, generate one multiple-choice question with 4 choices, 1 correct answer, and a concise explanation.
5. Write `content/recall/today.json`, overwriting any previous version.
6. Commit and push to `main`.
7. The existing GitHub Actions deploy workflow rebuilds and deploys.

### Question quality

- Questions must be grounded in the sheet's content — not external knowledge.
- Mix of factual recall, reasoning, and application is encouraged.
- Distractors must be plausible (wrong but related), never absurd.
- No employer-specific vocabulary (same masking rule as content authoring).

### Generator prompt

The prompt powering question generation is a user-facing artifact the user owns and iterates on. The initial version is a minimal scaffold — simple enough to read and tweak directly.

### Failure mode

If the routine fails (API error, git conflict), the previous day's `today.json` stays deployed. The app renders whatever is baked in — stale but functional.

## 5. Frontend

### Route

New route: `#/recall`, served by `web/src/pages/Recall.vue`.

A "Daily Recall" link appears in the app's nav bar alongside the existing topic links.

### States

**Question view** — Shows current question number (e.g. "3 / 10"), the question text, a topic/subtopic badge, and 4 choice buttons. No timer.

**Reveal view** — After selecting a choice: correct answer highlights green, wrong pick highlights red, explanation appears below. A "Review this sheet" text link points to `#/<topic>/<subtopic>`. A "Next" button advances to the next question.

**Summary view** — After question 10: scorecard showing X/10 correct. Lists all 10 questions with the user's pick vs the correct answer, grouped by right/wrong.

### Persistence

Session progress is stored in `localStorage` under `recall:<generated-date>`:

```json
{
  "current": 3,
  "answers": [1, 0, null, null, null, null, null, null, null, null]
}
```

- `current` — index of the next unanswered question.
- `answers` — the user's chosen index for each question, or `null` if unanswered.

On load, the app compares the `generated` date in `today.json` with the localStorage key. If they match, resume from `current`. If they don't match (new day's file deployed), clear the old key and start fresh.

Score is not persisted beyond the session — no history, no streak tracking.

### Mobile

The page is mobile-friendly: single-column layout, touch-sized choice buttons, no horizontal scroll. Same responsive approach as the rest of the app.

## 6. Build Integration

`today.json` is imported at build time by Vite, the same way other content files are loaded. The content loader (`web/src/lib/content.js`) gets a small addition to read and export the recall data.

If `content/recall/today.json` does not exist at build time (no cron run yet), the app renders the `#/recall` route with a "No questions yet" empty state.

No new build plugin, no new runtime dependency.

## 7. Out of Scope

- Question archive / history of past days.
- Staleness-weighted topic selection.
- Score tracking or streak persistence.
- Spaced repetition algorithm.
- Runtime question generation (browser-side AI).

These are all possible future enhancements but are deliberately excluded from v1.
