---
title: HTTP
subtitle: methods + status codes
layout: grid
---

<!--
Stub cheatsheet — flat-topic example. Proves the flat-topic route works.
Expand with `/refresh-cheatsheet http` or `/new-cheatsheet http` follow-ups.
-->

## [pills methods] Methods

| pill    | desc                                     |
| ------- | ---------------------------------------- |
| GET     | retrieve — safe, idempotent, cacheable   |
| HEAD    | like GET, no body — safe, idempotent     |
| POST    | create / submit — **not** idempotent     |
| PUT     | replace — idempotent                     |
| PATCH   | partial update — not guaranteed idempotent |
| DELETE  | remove — idempotent                      |
| OPTIONS | capabilities / CORS preflight            |

## [card 2xx] 2xx — Success {accent: "#2d5016"}

| code | name         | desc                              | detail                                                                   |
| ---- | ------------ | --------------------------------- | ------------------------------------------------------------------------ |
| 200  | OK           | standard success                  | Returns the resource in the body.                                        |
| 201  | Created      | new resource created              | Should set `Location:` to the new resource URL.                          |
| 202  | Accepted     | queued for async processing       | No promise of completion; give the client a way to check status.         |
| 204  | No Content   | success, empty body               | Common response to `PUT` / `DELETE`.                                     |
| 206  | Partial      | byte-range response               | Used with `Range:` request header for resumable downloads / streaming.   |

## [card 4xx] 4xx — Client error {accent: "#7f1d1d"}

| code | name             | desc                                   | detail                                                                 |
| ---- | ---------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| 400  | Bad Request      | malformed request                      | Use for invalid syntax. For semantic validation prefer 422.            |
| 401  | Unauthorized     | authentication required / invalid      | Name is a misnomer — it's really "unauthenticated".                    |
| 403  | Forbidden        | authenticated but not permitted        | Server refuses to authorize a valid identity.                          |
| 404  | Not Found        | resource doesn't exist                 | Also used (arguably) to hide 403s from unauthenticated users.          |
| 409  | Conflict         | state conflict                         | Typical for optimistic concurrency failures or unique-constraint hits. |
| 422  | Unprocessable    | syntactically valid, semantically bad  | Preferred over 400 for validation errors.                              |
| 429  | Too Many Reqs    | rate-limited                           | Pair with `Retry-After:` header.                                       |

> [tip] Use idempotency keys on `POST` to make retries safe.
> [warn] 5xx almost always means a proxy / load balancer / upstream issue, not your app code.
