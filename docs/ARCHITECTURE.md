# Systems Atlas: architecture

An original, interactive system-design course. Static site, no framework, no build toolchain beyond one Node script.

## Files

| Path | Role |
|---|---|
| `index.html` | Shell: header (views, search, theme), course sidebar, `<main>` that each view renders into, search `<dialog>`, live region. Strict CSP meta (`script-src 'self'`, no inline script/style). |
| `theme.js` | Runs before paint; applies the saved theme (`sa:theme`) so dark mode never flashes. |
| `course.js` | **Generated.** `window.COURSE = {modules:[{id,title,lessons:[...]}]}`. Do not edit by hand. |
| `app.js` | The whole app (~300 lines): router, sidebar, lesson player, SVG diagram, Practice, Design Lab, Cheatsheets, search, keyboard shortcuts. |
| `styles.css` | Design tokens on `:root` (light) and `[data-theme=dark]` / `prefers-color-scheme` (dark), layout, responsive breakpoints at 1180px and 860px. |
| `content/catalog.json` | Course outline: modules → lessons (slug, title, scope, `isNew` = topic missing from the reference site). |
| `content/lessons/<slug>.json` | One lesson each. Format in `content/SCHEMA.md`. |
| `scripts/build.mjs` | Validates every lesson against the schema (field lengths, node overlap, flows need edges, quiz shape, RECAP last) and writes `course.js`. `node scripts/build.mjs <slug>` validates one lesson without writing. |
| `scripts/serve.mjs` | Tiny local static server for preview. |

## Runtime model

- **Routing**: hash only. `#/<slug>/<step>` (1-based) for lessons; `#/practice[/module-or-slug]`, `#/lab[/slug]`, `#/cheatsheets`. Invalid slugs fall back to the last-visited lesson; out-of-range steps are clamped and the URL is rewritten with `history.replaceState`. (The reference site uses the same `#/<lesson>/<step>` shape; confirmed by REA bundle analysis and browser scenarios.)
- **Lesson player**: the shell is rendered once per lesson; changing step only updates text nodes, timeline `aria-current`, metrics and the diagram, so keyboard focus is never lost.
- **Diagram**: generated SVG. Nodes are boxes placed by percentage coordinates; edges are lines; each step's `flows` become packets animated with SMIL `<animateMotion>` on a shared loop. Because it is SMIL, Pause/Replay are native (`svg.pauseAnimations()`, `setCurrentTime(0)`). Edges carrying a flow are drawn dashed in the flow's colour so the step reads even when paused or with reduced motion (reduced motion starts paused).
- **Metrics**: HUD tiles; a value carries forward from the last step that set it, and numeric changes count up over 500 ms.
- **Persistence** (localStorage, `sa:` prefix, every access wrapped in try/catch): `done` (completed lessons; a lesson completes when its last step is shown), `last` (resume point), `open` (sidebar module state), `theme`, `lab:<slug>` (Design Lab checklist).
- **Search**: in-memory index of lessons, cheatsheet terms and steps; all words must match, title hits score higher. Ctrl/⌘+K or `/`; arrow keys move through results.
- **Accessibility**: skip link, labelled landmarks, `aria-current` on the active view/lesson/step, native `<details>` modules (collapsed content is hidden from assistive tech), SVG `role=img` with a generated description of the step's messages, polite live region announcing step changes, visible focus rings, shortcuts disabled while typing or while the search dialog is open.

## Why this shape

- Reference evidence (REA + browser scenarios) showed a vanilla-JS, hash-routed SPA with SVG scenes and localStorage; nothing about the problem needs a framework, so none was added.
- Lessons are data, not code, so ~75 lessons could be written and fact-checked in parallel by separate agents and validated mechanically.
- One generated `course.js` keeps the site working from `file://` and on any static host. Ceiling: it grows with content (~0.5–1 MB); split into per-lesson files loaded on demand if it ever matters.
