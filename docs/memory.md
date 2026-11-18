# Project memory: Systems Atlas

Running record of what was done, decided and found. Newest last.

## 2026-11-18

**Goal (from the user):** study https://designed-to-scale.vercel.app/ with the REA reverse-engineering toolkit, have an agent panel challenge the findings, and build our own system-design learning site that also fills the topics the reference lacks. Personal learning use. Then publish to GitHub and host on Vercel.

**Toolkit setup**
- REA (`rea-agents` 6.9.0) needs Node ≥24.22.1; system Node was 24.18.0. Installed portable Node 24.22.3 (SHA-256 verified) in `tools/node`, REA in `tools/rea`, registered as a project-local MCP server (`claude mcp add --scope local rea ...`). Global config untouched apart from that local-scope entry. Remove with `claude mcp remove rea -s local`.
- REA native engines (Hopper/Ghidra/IDA/JADX) not installed: not needed for websites.

**Separation**
- `tools/`: toolkit (portable Node + REA). `rea-toolkit/`: a git clone of REA made by an earlier ChatGPT/Codex agent; untouched.
- `evidence/`: all reference observations (REA evidence bundles, panel reports, screenshots). Also the reference's downloaded bundle/CSS/HTML (`reference-*` at project root). **Never published.**
- `reconstructed-site/`: our site. The only thing that goes to GitHub/Vercel.

**Evidence panel (5 agents)**: structure/a11y, JavaScript/architecture, browser behaviour, security/performance, plus the main session as verifier. Reports in `evidence/panel-*.md`. Key verified facts about the reference:
- 9 modules / 40 lessons; vanilla ES modules built with Vite; hash routes `#/<lesson>/<step>`; SVG scene graph on requestAnimationFrame; localStorage `sdt:*`; 21 languages lazy-loaded; client-side search.
- Practice, Design Lab and Cheatsheets are "coming soon" toasts with no content (a gap we fill).
- No CSP header; ~963 KB first load; no third-party requests.
- The earlier Codex dossier was partly wrong ("47 lessons", "source maps 403", "REA could not run").

**Decisions**
- Rebuilt the earlier Codex prototype from scratch as a data-driven engine (it had a crash on bad hashes, unreadable dark mode, dead buttons, metrics hard-coded to one lesson).
- Original content only: no text, art or branding copied from the reference.
- Curriculum: 11 modules / 76 lessons = the reference's 40 topics (rewritten) + 36 new topics (DNS, HTTP/TLS, autoscaling, gateways, cache stampedes, Bloom filters, search, geo, time-series, OLAP, quorums, locks, clocks, gossip, CRDTs, event sourcing, outbox/CDC, idempotency, circuit breakers, backpressure, multi-region, chaos/SLOs, service mesh, serverless, DDoS, secrets, deploy strategies, and 9 extra case studies).
- Plus working Practice (quizzes), Design Lab (case-study exercises) and Cheatsheets views.
- Lessons authored by Sonnet agents, each checked by an independent adversarial Sonnet reviewer, fix + re-check up to 2 rounds; schema enforced by `scripts/build.mjs`.

**Interruption and resume**
- The first workflow run (`wf_adcece11-c7c`) stopped when the session ended. Audit afterwards: 38 lessons authored and recorded, 3 more (batch-stream, service-discovery, timeouts-retries) finished on disk and validating, 3 broken files (event-sourcing-cqrs, outbox-cdc, redundancy), 32 never started. No fact-check had run yet, because the authoring jobs filled the concurrency slots first.
- Second run (`wf_55787986-e63`) does no re-work: the 42 validating lessons go straight to adversarial verification; only the 35 missing or broken ones are authored.
