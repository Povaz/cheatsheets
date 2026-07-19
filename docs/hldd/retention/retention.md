# Retention

> The Retention Context covers active reinforcement of studied material — surfacing what the User has learned through exercises that test recall, so that knowledge persists beyond the initial study session.

# 1. Relationships

Retention draws its material from the content entities defined in [Master §4](../hldd.md#4-data-model): questions target `SubTopic`s and are grounded in `Sheet` content. The actor is the `Reference User` (defined in [View](../view/view.md)); the role is the same human, exercising recall rather than consulting a reference. The generation routine (Master §7.6) reads `Sheet` artifacts to produce questions.

# 2. Dictionary

## `Question`

A multiple-choice prompt targeting a single `SubTopic`, with exactly four choices, one correct answer (zero-indexed), and a concise explanation. The atomic unit of the Retention Context — everything else (the daily set, the route, the scorecard) is built around delivering and answering `Question`s.

## `Daily Recall`

A set of 10 `Question`s generated daily by an automated routine and deployed as a static file. The set is replaced each day; progress within a session is persisted locally.

# 3. User Stories

- [US-daily-recall — Answer daily questions to reinforce learning](user-stories/us-daily-recall.md)
