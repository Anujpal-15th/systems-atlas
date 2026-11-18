# Lesson file format

One file per lesson: `content/lessons/<slug>.json`. The reference example is `content/lessons/request-lifecycle.json`; copy its shape.
Validate with: `tools/node/node.exe reconstructed-site/scripts/build.mjs <slug>` (run from the project root). It must print `ok   <slug>`.

| Field | Rule |
|---|---|
| `slug` | Exactly the catalog slug |
| `title` | 3-80 chars (use the catalog title) |
| `subtitle` | 10-200 chars, one sentence: what the learner will see happen |
| `minutes` | integer 3-30 |
| `level` | `Beginner` / `Intermediate` / `Advanced` |
| `learn` | 3-6 concrete outcomes |
| `nodes` | 2-9 components: `{id, label (<=22 chars), kind, x, y}`. `x` 5-95, `y` 8-92 (percent of a 1000x560 canvas). Nodes are 168x58 px boxes, so keep any two nodes at least 16 apart in x **or** 14 apart in y; aim for 20+ so it looks clean. Lay out left-to-right in request order. |
| `kind` | one of `client server service db cache queue lb cdn dns gateway storage worker external user region` |
| `edges` | `{from, to, label?}` connections drawn as lines; every flow needs an edge (either direction) |
| `metrics` | 0-4 `{id, label (<=16), unit}` shown as HUD tiles. Values carry forward between steps, so a step only lists what changes. Use real, defensible numbers (state assumptions in body text). Omit metrics if numbers would be invented nonsense. |
| `steps` | 5-10 steps. Each: `tag` (UPPERCASE 2-14 chars, e.g. QUESTION, CONCEPT, FLOW, WHAT IF, TRADE-OFF), `title` (<=60), `body` (60-700 chars, 2-5 plain sentences), `idea` (one-sentence key takeaway, <=220), `caption` (<=110, describes what the diagram shows now), `focus` (node ids highlighted; others dim; empty = none dimmed), `flows` (animated messages in order: `{from, to, kind, label?<=18}`, kind = `request response async handshake replicate fail`), `metrics` (`{metricId: "value"}`, value <=12 chars, plain number preferred so it animates). First step should pose the problem (tag QUESTION), last step **must** be tag `RECAP`. |
| `quiz` | 3-5 multiple-choice: `{q, options: [4 strings], answer: 0-3, why}`. One unambiguously correct answer; distractors plausible; vary the answer position. |
| `cheatsheet` | 3-8 `{term (<=40), def (10-260)}` |
| `lab` | **Required for case-study (`design-*`) lessons, omit otherwise.** `{prompt, requirements[2-8], hints[2-8], checklist[2-8]}` |

Writing rules:
- Original wording. Do not copy text from any website, book or the reference site; write it yourself.
- Plain English, short sentences, concrete numbers and examples. Explain jargon on first use.
- Technically correct and current (2025-era practice). If something is a rule of thumb, say so.
- The diagram must tell the story: each step's flows/focus should match its body.
- Stay inside the lesson's scope; neighbouring lessons cover their own topics (mention and move on).
