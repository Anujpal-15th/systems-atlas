# Lesson 1 illustrated-style pilot

State: uncommitted work on lesson `request-lifecycle` only (`"style": "illustrated"`) in app.js, styles.css, content/lessons/request-lifecycle.json (+ rebuilt course.js). NOT committed/pushed. Other 75 lessons use the old renderer (checked #/caching/3 and the console: no errors).

## Current renderer (rewritten to evidence/animation-spec.md)
- `app.js`, section "illustrated style": scene-graph renderer, plain rAF (no GSAP any more; `vendor/gsap/` is now unreferenced and can be deleted).
  - `rxScenes(l)` builds one full scene per step from the lesson JSON: entities (node `gx`/`gy` grid cells, chips become pills), links (created when a flow first uses them; `solid` while used in the step, `off` otherwise), routes (a request/response pair over the same links = one bouncing packet; a chain = one multi-link route).
  - `rxGo(step)` diffs by id: exit 420, move 820, enter 680 (opacity `out`, lift `back` from 120 / device 40), stagger 130, delays `.55*420`, `+.75*820`, `.7*420`; link draw 560 starting 60 ms (+90 per link) after both ends entered, labels fade in during draw .6-1; link removal 300; camera 820 inOut (168 ms late when something exits); spotlight on settle (CSS `spot`, 1.5 s).
  - Camera: `rxFrame()` plans all steps up front (zoom = min(1.6, (W-32)/bw, (H-32)/bh) snapped to .05, previous camera reused while bounds fit).
  - Packets: circle r 4.3 (ping 3.6), 155 u/s x kind factor, start offset 20 / stop `len-16`, accumulator starts at .6 on settle, spawn forever until the step changes, .16 s hidden dwell between links, bounce = reverse in green (`#9fd28f`) with a ~40 ms turn (measured), arrival ring 450 ms (scale .8-2). Pause only stops packet stepping. Replay = instant previous step, then animate the current one.
  - Chips/pills are step data (21 high, rx 10.5, 10.5px bold, hard 2px shadow, 26 px stacking above / below). Tag changes on an existing entity cross-fade in its move tween (fade out 42%, swap at 50%, fade in 55-95%).
  - Geometry: `j(x,y,z)=[14(x+y),7(x-y)-z]`, 28x14 floor grid with radial mask, block = rounded rhombus prism s=4 h=46 r=9 outline 1.9, db cylinder r 1.7 h 38, device = 6x6 h16 slab + keyboard + screen with browser mock, links 1.9 wide, elbow r 9, trimmed 3 / 4 px, arrowhead marker 5.2.
- HUD metrics (`setMetric(..., ill)`): count-up 900 ms easeOutCubic, 480 ms non-numeric (illustrated lessons only), `.is-changed` 1.5 s flash.
- Lesson JSON: nodes carry `gx`,`gy` (browser 0,-12; dns 0,1; lb 10,-1; app 10,12; db 21,12; cdn -11,-12). Chips were re-assigned so the DNS chips live on the DNS block (so browser is unchanged on step 1 to 2, exactly like the reference: DNS enters at delay 0) and step 8's first flow has `"pkt":"slow"`.
- Removed (not in the reference): token pills, ghost trails, thinking dots, receiver pulse, token to chip morph, SMIL fallback.

## Measured (rAF sampler, same method as the spec; ms from the Next click) - see the hand-off table
DNS opacity 1 at ~580 (ref 570), lift overshoot -7.9 (ref -7.6..-7.9) and exactly 0 at ~676 (ref 687), arrowhead ~1062-1084 (ref 1071), first packet ~1665-1685 (ref 1622), packet life ~820-860 (ref 883), interval 1250 (ref 1250), camera 31-46 to ~800 (ref 53 to 820). Step 2 to 3: lb lift end ~1290 (ref 1295), link done ~1700/1800, camera 31-62 to ~800-826 (ref 37 to 821; the camera only pans when the container is narrow enough that bounds outgrow the view), spotlight ~1791 (ref 1806).

## Ideas left
- Dark-mode: block gradients and outlines are fixed (as in the reference, which remaps hexes); pill colours are fixed light.
- Link-label placement is a simplified cost search (4 sides, 7 slots); the reference also wraps long labels.
- Compare against images/8.webp at 1281px+ and on mobile; show the user lesson 1 only; roll out to other lessons only after approval.
