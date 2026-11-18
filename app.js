'use strict';
// Systems Atlas: hash-routed, data-driven course. Data comes from course.js (window.COURSE), built by scripts/build.mjs.
const C = window.COURSE || { modules: [] };
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('sa:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sa:' + k, JSON.stringify(v)); } catch (e) {} }
};

const lessons = [];
C.modules.forEach((m, mi) => m.lessons.forEach(l => { l.moduleId = m.id; l.moduleTitle = m.title; l.moduleNum = mi + 1; l.index = lessons.length; lessons.push(l); }));
const bySlug = Object.fromEntries(lessons.map(l => [l.slug, l]));
const done = new Set(store.get('done', []).filter(s => bySlug[s]));
const VIEWS = ['practice', 'lab', 'cheatsheets'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let cur = { view: null, slug: null, step: 0 };
let paused = reducedMotion;
let shownMetrics = {};

// ---------- routing ----------
function parseHash() {
  const m = location.hash.match(/^#\/([\w-]+)?(?:\/(\d+))?\/?$/);
  const a = m && m[1], n = m && m[2];
  if (a && VIEWS.includes(a)) return { view: a, sub: n };
  if (a && bySlug[a]) return { view: 'learn', slug: a, step: n ? +n - 1 : 0, explicit: !!n };
  const last = store.get('last', null);
  if (last && bySlug[last.slug]) return { view: 'learn', slug: last.slug, step: last.step, redirect: true };
  return { view: 'learn', slug: lessons[0] && lessons[0].slug, step: 0, redirect: true };
}
const go = (slug, step) => { location.hash = `#/${slug}/${step + 1}`; };

function route() {
  const r = parseHash();
  if (r.view === 'learn') {
    if (!r.slug) { $('#main').innerHTML = '<p class="empty">No lessons built yet. Run <code>node scripts/build.mjs</code>.</p>'; return; }
    const l = bySlug[r.slug];
    const step = Math.min(Math.max(Number.isFinite(r.step) ? r.step : 0, 0), l.steps.length - 1);
    if (r.redirect || String(step + 1) !== (location.hash.split('/')[2] || '')) { history.replaceState(null, '', `#/${l.slug}/${step + 1}`); }
    showLesson(l, step);
  } else {
    cur = { view: r.view, slug: null, step: 0 };
    ({ practice: showPractice, lab: showLab, cheatsheets: showCheats })[r.view]();
    $('#main').focus({ preventScroll: true });
    scrollTo(0, 0);
  }
  renderNav();
  closeDrawer();
}

// ---------- sidebar + header ----------
function renderNav() {
  const view = cur.view;
  document.querySelectorAll('.views a').forEach(a => { if (a.dataset.view === view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const openId = cur.slug ? bySlug[cur.slug].moduleId : null;
  const openState = store.get('open', {});
  $('#course').innerHTML = C.modules.map((m, i) => {
    const d = m.lessons.filter(l => done.has(l.slug)).length;
    const open = m.id === openId || openState[m.id];
    return `<details data-m="${esc(m.id)}"${open ? ' open' : ''}><summary><span class="num">${String(i + 1).padStart(2, '0')}</span> ${esc(m.title)} <small>${d}/${m.lessons.length}</small></summary><ul>${m.lessons.map(l =>
      `<li><a href="#/${esc(l.slug)}/1"${l.slug === cur.slug ? ' aria-current="page"' : ''}><span class="tick" aria-hidden="true">${done.has(l.slug) ? '✓' : ''}</span>${esc(l.title)}${l.isNew ? ' <em class="new">new</em>' : ''}${done.has(l.slug) ? '<span class="sr"> (completed)</span>' : ''}</a></li>`).join('')}</ul></details>`;
  }).join('');
  $('#course').querySelectorAll('details').forEach(el => el.addEventListener('toggle', () => { const s = store.get('open', {}); s[el.dataset.m] = el.open; store.set('open', s); }));
  $('#progress-text').textContent = `${done.size} / ${lessons.length}`;
  $('#progress-bar').style.width = (lessons.length ? done.size / lessons.length * 100 : 0) + '%';
}

// ---------- learn view ----------
function showLesson(l, step) {
  const sameLesson = cur.view === 'learn' && cur.slug === l.slug;
  cur = { view: 'learn', slug: l.slug, step };
  store.set('last', { slug: l.slug, step });
  if (step === l.steps.length - 1 && !done.has(l.slug)) { done.add(l.slug); store.set('done', [...done]); }
  if (!sameLesson) {
    shownMetrics = {};
    $('#main').innerHTML = lessonShell(l);
    $('#back').addEventListener('click', () => step0() > 0 && go(l.slug, step0() - 1));
    $('#next').addEventListener('click', () => nextStep());
    $('#replay').addEventListener('click', replay);
    $('#pause').addEventListener('click', togglePause);
    document.title = `${l.title} · Systems Atlas`;
    scrollTo(0, 0);
  }
  updateStep(l, step);
}
const step0 = () => cur.step;

function lessonShell(l) {
  const metrics = l.metrics.map(m => `<div class="metric"><span>${esc(m.label)}</span><b id="m-${esc(m.id)}">—</b></div>`).join('');
  return `<section class="panel heading">
    <p class="crumb">${String(l.moduleNum).padStart(2, '0')}. ${esc(l.moduleTitle)} / Lesson ${l.index + 1} of ${lessons.length}</p>
    <div class="title-row"><h1>${esc(l.title)}</h1><div class="badges"><span>${l.minutes} min</span><span>${esc(l.level)}</span><span>${l.steps.length} steps</span>${l.isNew ? '<span class="badge-new">New topic</span>' : ''}</div></div>
    <p class="sub">${esc(l.subtitle)}</p>
  </section>
  <section class="panel stage" aria-label="Diagram">
    <div class="hud">${metrics}<div class="hud-btns"><button id="replay" class="btn" aria-keyshortcuts="r">↻ Replay</button><button id="pause" class="btn" aria-keyshortcuts="Space" aria-pressed="false">Ⅱ Pause</button></div></div>
    <div id="diagram" class="diagram"></div>
    <p id="caption" class="caption"></p>
    <div class="legend" aria-hidden="true"><span class="k-request">● request</span><span class="k-response">● response</span><span class="k-handshake">● handshake</span><span class="k-async">● async</span><span class="k-replicate">● replicate</span><span class="k-fail">● failure</span></div>
  </section>
  <section class="panel timeline" aria-label="Steps in this lesson">
    <div class="tl-head"><b>IN THIS LESSON</b><span id="step-count"></span></div>
    <ol>${l.steps.map((s, i) => `<li><a href="#/${esc(l.slug)}/${i + 1}" data-i="${i}"><span class="dot">${i + 1}</span><span class="tl-label">${esc(s.title)}</span></a></li>`).join('')}</ol>
  </section>
  <aside class="panel guide" aria-label="Step guide">
    <p class="step-label" id="step-label"></p>
    <h2 id="g-title"></h2>
    <p id="g-body"></p>
    <div class="idea"><b>Key idea</b><span id="g-idea"></span></div>
    <div class="controls"><button id="back" class="btn">← Back</button><button id="next" class="btn primary"></button></div>
    <p class="keys"><kbd>←</kbd> <kbd>→</kbd> step · <kbd>R</kbd> replay · <kbd>Space</kbd> pause</p>
    <div class="learn"><b>You'll learn</b><ul>${l.learn.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <p class="practice-link"><a href="#/practice/${esc(l.slug)}">Practice this lesson →</a>${l.lab ? ` · <a href="#/lab/${esc(l.slug)}">Open design lab →</a>` : ''}</p>
  </aside>`;
}

function nextStep() {
  const l = bySlug[cur.slug];
  if (cur.step < l.steps.length - 1) return go(l.slug, cur.step + 1);
  const nx = lessons[l.index + 1];
  if (nx) go(nx.slug, 0);
}

function updateStep(l, i) {
  const s = l.steps[i], n = l.steps.length;
  $('#step-label').innerHTML = `Step ${i + 1} / ${n} <span class="tag">${esc(s.tag)}</span>`;
  $('#g-title').textContent = s.title;
  $('#g-body').textContent = s.body;
  $('#g-idea').textContent = s.idea;
  $('#caption').textContent = s.caption;
  $('#step-count').textContent = `Step ${i + 1} of ${n}`;
  $('#back').disabled = i === 0;
  const nx = lessons[l.index + 1];
  $('#next').textContent = i < n - 1 ? `Next: ${l.steps[i + 1].title} →` : nx ? `Next lesson: ${nx.title} →` : 'Course complete ✓';
  $('#next').disabled = i === n - 1 && !nx;
  document.querySelectorAll('.timeline a').forEach(a => { const k = +a.dataset.i; a.classList.toggle('past', k < i); if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
  const act = document.querySelector('.timeline a[aria-current]'), tl = document.querySelector('.timeline ol');
  if (act) tl.scrollLeft = act.offsetLeft - tl.clientWidth / 2;
  // Metrics carry forward: value = last one defined at or before this step.
  for (const m of l.metrics) {
    let v = null;
    for (let k = 0; k <= i; k++) if (l.steps[k].metrics && l.steps[k].metrics[m.id] != null) v = String(l.steps[k].metrics[m.id]);
    setMetric(m, v);
  }
  drawDiagram(l, s);
  $('#live').textContent = `Step ${i + 1} of ${n}: ${s.title}`;
}

function setMetric(m, v) {
  const el = document.getElementById('m-' + m.id);
  if (!el) return;
  const unit = m.unit ? ` ${m.unit}` : '';
  if (v == null) { el.textContent = '—'; shownMetrics[m.id] = null; return; }
  const from = parseFloat(shownMetrics[m.id]), to = Number(v);
  shownMetrics[m.id] = v;
  if (reducedMotion || !Number.isFinite(to) || !Number.isFinite(from) || from === to) { el.textContent = v + unit; return; }
  const t0 = performance.now(), dec = (v.split('.')[1] || '').length;
  const tick = t => { const p = Math.min((t - t0) / 500, 1), e = 1 - (1 - p) ** 3; el.textContent = (from + (to - from) * e).toFixed(dec) + unit; if (p < 1 && shownMetrics[m.id] === v) requestAnimationFrame(tick); else if (shownMetrics[m.id] === v) el.textContent = v + unit; };
  requestAnimationFrame(tick);
}

// ---------- diagram (SVG + SMIL so pause/replay are native) ----------
const ICON = { client: '▭', user: '☺', server: '▣', service: '◇', db: '⛁', cache: '⚡', queue: '☰', lb: '⇆', cdn: '◎', dns: '⌕', gateway: '⛩', storage: '▤', worker: '⚙', external: '☁', region: '⌂' };
const W = 1000, H = 560, NW = 168, NH = 58;
function drawDiagram(l, s) {
  const P = id => { const n = l.nodes.find(x => x.id === id); return { x: n.x / 100 * W, y: n.y / 100 * H }; };
  const focus = new Set(s.focus || []);
  const flows = s.flows || [];
  const slot = 1.1, T = Math.max(flows.length, 1) * slot + 0.8;
  const hot = new Map(flows.map(f => [[f.from, f.to].sort().join('|'), f.kind]));
  let svg = `<svg id="svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="svg-title svg-desc"><title id="svg-title">${esc(l.title)} diagram</title><desc id="svg-desc">${esc(s.caption)} Components: ${esc(l.nodes.map(n => n.label).join(', '))}.${flows.length ? ' Messages: ' + esc(flows.map(f => `${nodeLabel(l, f.from)} to ${nodeLabel(l, f.to)}${f.label ? ' (' + f.label + ')' : ''}`).join('; ')) + '.' : ''}</desc>`;
  for (const e of l.edges) {
    const a = P(e.from), b = P(e.to), k = hot.get([e.from, e.to].sort().join('|'));
    svg += `<line class="edge${k ? ' hot k-' + k : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    if (e.label) svg += `<text class="edge-label" x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 8}">${esc(e.label)}</text>`;
  }
  for (const n of l.nodes) {
    const p = P(n.id), cls = focus.size ? (focus.has(n.id) ? ' focus' : ' dim') : '';
    svg += `<g class="node kind-${esc(n.kind)}${cls}" transform="translate(${p.x - NW / 2},${p.y - NH / 2})"><rect class="shadow" x="4" y="4" width="${NW}" height="${NH}" rx="10"/><rect class="box" width="${NW}" height="${NH}" rx="10"/><text class="ico" x="22" y="${NH / 2 + 7}">${ICON[n.kind] || '■'}</text><text class="lbl" x="${NW / 2 + 14}" y="${NH / 2 + 5}">${esc(n.label)}</text></g>`;
  }
  flows.forEach((f, i) => {
    const a = P(f.from), b = P(f.to), t1 = (i * slot) / T, t2 = (i * slot + 0.9) / T;
    const path = `M${a.x},${a.y} L${b.x},${b.y}`;
    const vis = `<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" keyTimes="0;${t1.toFixed(3)};${t1.toFixed(3)};${t2.toFixed(3)};${t2.toFixed(3)};1" values="0;0;1;1;0;0" calcMode="discrete"/>`;
    svg += `<g class="packet k-${esc(f.kind)}" opacity="0"><animateMotion dur="${T}s" repeatCount="indefinite" path="${path}" keyPoints="0;0;1;1" keyTimes="0;${t1.toFixed(3)};${t2.toFixed(3)};1" calcMode="linear"/>${vis}<circle r="9"/>${f.label ? `<text class="pkt-label" y="-15">${esc(f.label)}</text>` : ''}</g>`;
  });
  svg += '</svg>';
  $('#diagram').innerHTML = svg;
  const el = $('#svg');
  if (paused) { el.setCurrentTime(0.5); el.pauseAnimations(); }
  syncPause();
}
const nodeLabel = (l, id) => (l.nodes.find(n => n.id === id) || {}).label || id;
function replay() { const el = $('#svg'); if (el) { el.setCurrentTime(0); if (paused) togglePause(); } }
function togglePause() { const el = $('#svg'); paused = !paused; if (el) paused ? el.pauseAnimations() : el.unpauseAnimations(); syncPause(); }
function syncPause() { const b = $('#pause'); if (b) { b.textContent = paused ? '▶ Play' : 'Ⅱ Pause'; b.setAttribute('aria-pressed', String(paused)); } }

// ---------- practice ----------
function showPractice() {
  const sub = (location.hash.split('/')[2]) || '';
  const pool = bySlug[sub] ? [bySlug[sub]] : C.modules.find(m => m.id === sub)?.lessons || lessons;
  const title = bySlug[sub] ? bySlug[sub].title : (C.modules.find(m => m.id === sub)?.title || 'All topics');
  document.title = 'Practice · Systems Atlas';
  let qn = 0;
  $('#main').innerHTML = `<section class="panel heading"><p class="crumb">Practice</p><h1>Check your understanding</h1><p class="sub">Pick an answer to see why it is right or wrong. Showing: <b>${esc(title)}</b>. <span id="score" aria-live="polite"></span></p>
    <div class="chips" role="group" aria-label="Filter by module"><a class="chip" href="#/practice"${!sub ? ' aria-current="true"' : ''}>All</a>${C.modules.map(m => `<a class="chip" href="#/practice/${esc(m.id)}"${m.id === sub ? ' aria-current="true"' : ''}>${esc(m.title)}</a>`).join('')}</div></section>
    ${pool.map(l => `<section class="panel qset"><h2><a href="#/${esc(l.slug)}/1">${esc(l.title)}</a></h2>${l.quiz.map(q => { const id = 'q' + (qn++); return `<fieldset class="q" data-a="${q.answer}"><legend>${esc(q.q)}</legend>${q.options.map((o, k) => `<button class="opt" data-k="${k}" aria-describedby="${id}w">${'ABCD'[k]}. ${esc(o)}</button>`).join('')}<p class="why" id="${id}w" hidden>${esc(q.why)}</p></fieldset>`; }).join('')}</section>`).join('')}`;
  let right = 0, answered = 0;
  $('#main').querySelectorAll('.q').forEach(fs => fs.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b || fs.dataset.done) return;
    fs.dataset.done = 1; answered++;
    const ok = +b.dataset.k === +fs.dataset.a; if (ok) right++;
    fs.querySelectorAll('.opt').forEach(o => { o.disabled = true; if (+o.dataset.k === +fs.dataset.a) o.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    const w = fs.querySelector('.why'); w.hidden = false; w.textContent = (ok ? 'Correct. ' : 'Not quite. ') + w.textContent;
    $('#score').textContent = `Score: ${right} / ${answered}`;
  }));
}

// ---------- design lab ----------
function showLab() {
  const labs = lessons.filter(l => l.lab);
  const sub = location.hash.split('/')[2];
  const l = bySlug[sub] && bySlug[sub].lab ? bySlug[sub] : labs[0];
  document.title = 'Design Lab · Systems Atlas';
  if (!l) { $('#main').innerHTML = '<section class="panel heading"><h1>Design Lab</h1><p class="sub">No labs available yet.</p></section>'; return; }
  const checks = store.get('lab:' + l.slug, []);
  $('#main').innerHTML = `<section class="panel heading"><p class="crumb">Design Lab</p><h1>${esc(l.title)}</h1><p class="sub">Work the problem on paper first, then compare against the checklist. Hints are hidden until you need them.</p>
    <div class="chips" role="group" aria-label="Choose a design problem">${labs.map(x => `<a class="chip" href="#/lab/${esc(x.slug)}"${x === l ? ' aria-current="true"' : ''}>${esc(x.title.replace(/^Design (an? )?/, ''))}</a>`).join('')}</div></section>
    <section class="panel lab"><h2>The problem</h2><p>${esc(l.lab.prompt)}</p>
    <h2>Requirements</h2><ul>${l.lab.requirements.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>Hints</h2>${l.lab.hints.map((x, i) => `<details class="hint"><summary>Hint ${i + 1}</summary><p>${esc(x)}</p></details>`).join('')}
    <h2>Self-review checklist</h2><ul class="checklist">${l.lab.checklist.map((x, i) => `<li><label><input type="checkbox" data-i="${i}"${checks.includes(i) ? ' checked' : ''}> ${esc(x)}</label></li>`).join('')}</ul>
    <p><a class="btn primary" href="#/${esc(l.slug)}/1">Walk through the reference design →</a></p></section>`;
  $('#main').querySelectorAll('.checklist input').forEach(cb => cb.addEventListener('change', () => store.set('lab:' + l.slug, [...$('#main').querySelectorAll('.checklist input:checked')].map(x => +x.dataset.i))));
}

// ---------- cheatsheets ----------
function showCheats() {
  document.title = 'Cheatsheets · Systems Atlas';
  $('#main').innerHTML = `<section class="panel heading"><p class="crumb">Cheatsheets</p><h1>Terms at a glance</h1><p class="sub">Every key term from every lesson, grouped by module.</p><input id="cs-filter" type="search" placeholder="Filter terms…" aria-label="Filter terms"></section>
    <div id="cs">${C.modules.map(m => `<section class="panel cs-mod"><h2>${esc(m.title)}</h2><dl>${m.lessons.flatMap(l => l.cheatsheet.map(c => `<div class="cs-item"><dt>${esc(c.term)}</dt><dd>${esc(c.def)} <a href="#/${esc(l.slug)}/1">${esc(l.title)}</a></dd></div>`)).join('')}</dl></section>`).join('')}</div><p id="cs-none" class="empty" hidden>No matching terms.</p>`;
  $('#cs-filter').addEventListener('input', e => {
    const q = e.target.value.toLowerCase(); let any = false;
    $('#main').querySelectorAll('.cs-mod').forEach(sec => { let n = 0; sec.querySelectorAll('.cs-item').forEach(it => { const hit = it.textContent.toLowerCase().includes(q); it.hidden = !hit; n += hit; }); sec.hidden = !n; any = any || n > 0; });
    $('#cs-none').hidden = any;
  });
}

// ---------- search ----------
const index = lessons.flatMap(l => [
  { type: 'Lesson', title: l.title, sub: l.moduleTitle + ' · ' + l.subtitle, href: `#/${l.slug}/1`, text: (l.title + ' ' + l.subtitle + ' ' + l.learn.join(' ')).toLowerCase() },
  ...l.cheatsheet.map(c => ({ type: 'Term', title: c.term, sub: l.title + ' · ' + c.def, href: `#/${l.slug}/1`, text: (c.term + ' ' + c.def).toLowerCase() })),
  ...l.steps.map((s, i) => ({ type: 'Step', title: s.title, sub: l.title + ` · step ${i + 1}`, href: `#/${l.slug}/${i + 1}`, text: (s.title + ' ' + s.body).toLowerCase() }))
]);
function search(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return index.filter(x => x.type === 'Lesson').slice(0, 12);
  const score = x => words.every(w => x.text.includes(w)) ? words.reduce((s, w) => s + (x.title.toLowerCase().includes(w) ? 3 : 1), 0) + (x.type === 'Lesson' ? 2 : x.type === 'Term' ? 1 : 0) : 0;
  return index.map(x => [score(x), x]).filter(a => a[0]).sort((a, b) => b[0] - a[0]).slice(0, 30).map(a => a[1]);
}
function renderResults() {
  const r = search($('#q').value);
  $('#results').innerHTML = r.length ? r.map(x => `<a role="listitem" class="result" href="${esc(x.href)}"><span class="rtype">${x.type}</span><b>${esc(x.title)}</b><small>${esc(x.sub.slice(0, 140))}</small></a>`).join('') : '<p class="empty">No matches. Try a broader word like “cache” or “queue”.</p>';
}
function openSearch() { const d = $('#search'); if (!d.open) { d.showModal(); $('#q').select(); renderResults(); } }
$('#search-open').addEventListener('click', openSearch);
$('#search-close').addEventListener('click', () => $('#search').close());
$('#q').addEventListener('input', renderResults);
$('#results').addEventListener('click', e => { if (e.target.closest('a')) $('#search').close(); });
$('#search').addEventListener('click', e => { if (e.target === $('#search')) $('#search').close(); });
$('#search').addEventListener('keydown', e => {
  const items = [...$('#results').querySelectorAll('a')], i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0])?.focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); i <= 0 ? $('#q').focus() : items[i - 1].focus(); }
  else if (e.key === 'Enter' && document.activeElement === $('#q') && items[0]) { e.preventDefault(); items[0].click(); }
});

// ---------- theme, drawer, keys ----------
function syncTheme() { const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); $('#theme').setAttribute('aria-pressed', String(dark)); }
$('#theme').addEventListener('click', () => { const dark = $('#theme').getAttribute('aria-pressed') !== 'true'; document.documentElement.dataset.theme = dark ? 'dark' : 'light'; try { localStorage.setItem('sa:theme', dark ? 'dark' : 'light'); } catch (e) {} syncTheme(); });
function closeDrawer() { document.body.classList.remove('drawer'); $('#menu').setAttribute('aria-expanded', 'false'); }
$('#menu').addEventListener('click', () => { const o = !document.body.classList.contains('drawer'); document.body.classList.toggle('drawer', o); $('#menu').setAttribute('aria-expanded', String(o)); if (o) $('#course a[aria-current], #course summary')?.focus(); });
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
  if (e.key === 'Escape' && document.body.classList.contains('drawer')) { closeDrawer(); $('#menu').focus(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || $('#search').open || e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (e.key === '/') { e.preventDefault(); openSearch(); return; }
  if (cur.view !== 'learn') return;
  if (e.key === 'ArrowRight') { e.preventDefault(); nextStep(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); if (cur.step > 0) go(cur.slug, cur.step - 1); }
  else if (e.key.toLowerCase() === 'r') replay();
  else if (e.code === 'Space' && !e.target.closest('button, a, summary')) { e.preventDefault(); togglePause(); }
});

addEventListener('hashchange', route);
syncTheme();
route();
