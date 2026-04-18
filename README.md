# cheatsheets

My personal cheatsheet collection. Built with Vue + Vite.

Live: _(GitHub Pages URL will go here once deployed)_

## Available cheatsheets

- **Python** — 3.14, 3.13
- **HTTP** — status codes, methods

## Adding or updating cheatsheets

Use Claude Code slash commands:

- `/new-cheatsheet <topic>` — create a new one
- `/refresh-cheatsheet <topic>` — update against current sources
- `/review-cheatsheet <topic>` — get improvement suggestions

See `.claude/commands/` for the detailed pipelines and `docs/CONTENT_FORMAT.md` for the content syntax.

## Running locally

```
npm install
npm run dev
```

Then open http://localhost:5173/.

## Deploying

Push to `main`. GitHub Actions will build and deploy to Pages automatically. To enable, go to the repo's **Settings → Pages** and set the source to **GitHub Actions**.
