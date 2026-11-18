# Systems Atlas

An interactive, step-by-step system design course: animated request diagrams, practice quizzes, design-lab exercises and cheatsheets. 11 modules, 76 lessons, from "how a request travels" to designing payments, ride sharing and a Dynamo-style key-value store.

Built for personal learning. Inspired by the mechanics of the *Designed to Scale* course; all lesson content, diagrams and code here are original.

## Run locally

No dependencies. Open `index.html` directly, or serve the folder:

```bash
node scripts/serve.mjs   # http://127.0.0.1:5180
```

## Edit or add a lesson

1. Add the lesson to `content/catalog.json`.
2. Write `content/lessons/<slug>.json` following `content/SCHEMA.md`.
3. `node scripts/build.mjs` validates every lesson and regenerates `course.js`.

## Docs

- `docs/ARCHITECTURE.md`: how the app works
- `docs/memory.md`: project log and decisions
- `docs/conversation.md`: record of the agents that researched, wrote and reviewed the content
