# Lesson 1 illustrated-style pilot

State: uncommitted work on lesson `request-lifecycle` only (`"style": "illustrated"`) in app.js, styles.css, scripts/build.mjs, content/lessons/request-lifecycle.json, plus vendor/gsap/. NOT committed/pushed; live site unchanged. Other 75 lessons use the old renderer (checked #/caching/3).

Done:
- Edges are clipped to block silhouettes (cube hexagon, laptop platform + screen, +6px gap) and drawn behind blocks. Cubes have no inner strokes (outline, filled soft top highlight, two side faces); the platform has no inner lines either.
- Collision avoidance: every pill, chip, flow label, arrowhead and edge line is an obstacle; flow labels are placed first (beside their line, both sides, then slid along it), then node chips (nudged vertically first, then sideways), then edge chips; >= 8px gaps. Measured: no overlaps on steps 1-10 once animations settle.
- GSAP 3.15.1 (vendor/gsap/gsap.min.js, MotionPathPlugin.min.js, LICENSE note) loaded lazily by `loadGsap()` only when an illustrated lesson draws. `enhance()` builds one timeline per step: blocks pop (back.out), edges draw, packets travel via MotionPath (power2.inOut), labels/chips fade+rise. Pause/Play/Replay drive the timeline; reduced motion shows the end state; if gsap fails to load, the SMIL/CSS renderer stays.
- Layout tweak in the lesson JSON: browser y 55 -> 40, cdn x 26 -> 12 (more room around the laptop); "you" pill moved to the lower left of the laptop.

Left / ideas:
- Flow labels on short edges can sit a bit away from their line (step 2); consider longer edges or moving dns/lb apart.
- Packets play once per step (no endless loop any more); add a repeating sub-timeline if wanted.
- Compare with images/8.webp once more at 1281px+ widths (fit layout) and on mobile.
- Show the user lesson 1 only; roll out to other lessons only after approval.

## Plan (agreed with the user)
Iterate on lesson 1 (request-lifecycle) only until the user approves the final look and animation. Only then roll the illustrated style out to all lessons.

## Update: db cylinder + smooth lines (still lesson 1 only, uncommitted)
- db/storage kinds draw as a soft isometric cylinder (lighter radial top, vertical-gradient lilac body, 2.5px outline, db icon on the front); name pill sits beside it on the right (obstacle for routes/labels).
- Edges: one elbow, quadratic rounded corner (R=22); route() tries both iso elbows and keeps the one that crosses fewer other blocks. Arrowheads are smaller rounded triangles (idle ones scaled .72), both ends for two-way edges. Polyline sampled every 3px.
- Packets r=6; trailing packet is hollow (panel fill, kind-coloured stroke).
- Ideas left: compare again at 1920px / mobile; hollow packet currently on every flow kind, restrict to responses if preferred.

## Update: story-driven message tokens (lesson 1 only, uncommitted)
- Each flow now carries a pill token (dot + short text: `flow.token` or the label, max 17 chars) built in `enhance()`; SMIL packets are only the no-gsap fallback. Timeline per step: blocks pop (back.out 1.6) -> edges draw (power1.out) -> per flow: token scale-in, MotionPath along the exact trimmed edge (sine.inOut, 400 units/s, min 0.7s) with 3 fading ghost dots -> receiver pulse (scale 1.06 + ripple ring) -> 3 "thinking" dots (~0.45s) when the next flow leaves that node -> next token. Labels/chips fade in when the story reaches them.
- FLIP-style landing: a chip on the destination whose text contains the token text (e.g. browser "-> 203.0.113.7", db "full scan") is where the token settles; the token hops onto the chip and crossfades into it. Step 2: the IP chip moved from dns to browser in the lesson JSON for this.
- Loop: master timeline = intro + first pass + nested repeating pass (repeatDelay 1.2s). Pause/Play/Replay drive the master; reduced motion = end state, no tokens.
- Note: the Browser pane throttles rAF when idle, so animations only advance while screenshots are taken.
- Ideas: token text duplicates the static flow label (could hide labels on replays); tune pulse/ring size per node kind.
