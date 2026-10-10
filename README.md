# cheatsheets

A personal CheatSheet web application. Each Sheet is a single-page, information-dense reference for one studied subject, laid out for photographic recall. Practice questions drawn from every Sheet reinforce retention.

Live at: https://povaz.github.io/cheatsheets/#/

Design lives in [`docs/hldd/`](./docs/hldd/hldd.md).

## Available CheatSheets

| CheatSheet           | Sheets                                                                     |
|----------------------|----------------------------------------------------------------------------|
| AWS                  | Load Balancers, Security Groups vs NGINX                                   |
| Django               | Basics, Beyond the Basics, REST Framework, Safe Migrations                 |
| Git                  | Worktrees + Agents                                                         |
| MinIO                | S3-Backed Storage                                                          |
| Neural Networks      | Feedforward, Recurrent, word2vec, Bahdanau Attention, The Transformer      |
| PostgreSQL Internals | Storage, From Query to Page, Indexes, Indexes — Examples                   |
| React                | Basics                                                                     |
| Specifications       | Context Anchored Specification, User Stories, Acceptance Criteria, BDD Introduction |
| Supervised Learning  | The Journey to LightGBM, Quantile Regression in LightGBM                   |
| Terraform            | Basics                                                                     |

## Learning Plans

| Plan              | Goal                                                         |
|-------------------|--------------------------------------------------------------|
| LLM Learning Plan | Read new papers as they land; how architecture and training work |

## Repository layout

Every content file is written by the Agent (Claude Code), never by hand.

```
content/<topic>/topic.json                  Topic title, subtitle, default + order of Sheets
content/<topic>/<sheet>/sheet.json          Sheet title, subtitle, Sources
content/<topic>/<sheet>/sheet.html          Sheet body (Fragment: fixed semantic HTML, no styles)
content/<topic>/<sheet>/questions.json      Practice questions for that Sheet
content/plans/<plan>/plan.json              Learning Plans (Parts → Steps → Sources, pure data)
web/                                        Vue 3 app that renders content/
```

## Local development

```
cd web
npm install
npm run dev        # http://localhost:5173
npm run validate   # check every Fragment and manifest against the contract
npm test           # run the Vitest suite (also gates every deploy)
```

## Workflow

Trunk-Based Development: `main` is the only long-lived branch. Every push to `main` runs `npm test`, then builds and deploys to GitHub Pages; a failing test or a Fragment contract violation stops the deploy.
