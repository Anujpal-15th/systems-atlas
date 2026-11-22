# Illustrated renderer rollout (all 76 lessons)

State: uncommitted. The reference-matched scene-graph renderer (app.js `rx*`, svg class `rx`) now draws EVERY lesson; the old SMIL renderer, its CSS and the `"style"` lesson field are deleted. Lesson 1 scenes, cameras and label positions are identical to before (hash-checked).

## What changed
- Layout: nodes without `gx`/`gy` get iso cells from x,y (`rxGrid`: invert j(), snap, nudge to the nearest free cell, left-to-right order kept, extra room for link labels). `gx`/`gy` on a node pins it (lesson 1 pins all).
- Shapes (`rxBody`/`rxSil`/`REXT`): block (server/service/worker/gateway/lb/dns/cdn/cache/external, colours in `KCOL`), db/storage cylinder, client device, user on slab, queue (4 slabs), region (flat dashed platform). Name on the body for blocks/short db names, name pill below for the rest.
- Flows: request=req, response=green (bounce when paired on one link, else push), handshake=ping, async=msg (square, dashed link), replicate=write (dark square, dashed link), fail=kill + red burst with X, link style `cut`.
- Camera includes pills and link-label rectangles (`sc.lr`); labels use a 2nd, wider search when the first collides.

## Verification (browser, instant-settled state, every step)
76 lessons / 737 steps: no console errors, no NaN, everything inside #diagram, no block/pill/label overlaps, except lesson 1 step 7 (CDN label vs browser device, pre-existing: gx/gy leave no gap; fix by moving cdn in the JSON, e.g. gx -13).
Advisory: ~1090 sampled link points pass behind a third block (elbows chosen to minimise it, not eliminate).

## Ideas left
- `vendor/gsap/` is unreferenced; delete.
- Dark mode: block gradients and pill colours are fixed.
- Only the first flow label per link is shown.
