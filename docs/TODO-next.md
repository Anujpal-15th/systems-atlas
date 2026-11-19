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
