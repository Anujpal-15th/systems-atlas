'use strict';
// Systems Atlas: hash-routed, data-driven course. Data comes from course.js (window.COURSE), built by scripts/build.mjs.
const C = window.COURSE || { modules: [] };
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('sa:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sa:' + k, JSON.stringify(v)); } catch (e) {} }
};

// ---------- icons (24x24 stroke paths, drawn with currentColor) ----------
const I = {
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5"/>',
  server: '<rect x="4" y="4" width="16" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="16" height="6.5" rx="1.5"/><path d="M8 7.2h.01M8 16.7h.01"/>',
  service: '<path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z"/><circle cx="12" cy="12" r="2.6"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  cache: '<path d="M13 2L5 13.5h6L10 22l9-12.5h-6.2z"/>',
  queue: '<rect x="3" y="5" width="4" height="14" rx="1"/><rect x="10" y="5" width="4" height="14" rx="1"/><rect x="17" y="5" width="4" height="14" rx="1"/>',
  lb: '<path d="M3 12h6M9 12l5-6h7M9 12l5 6h7M18 3l3 3-3 3M18 15l3 3-3 3"/>',
  cdn: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"/>',
  dns: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  gateway: '<path d="M12 3l8 3.5v5.2c0 4.6-3.4 8-8 9.3-4.6-1.3-8-4.7-8-9.3V6.5z"/><path d="M9 12l2 2 4-4"/>',
  storage: '<path d="M4 7.5L12 4l8 3.5v9L12 20l-8-3.5z"/><path d="M4 7.5L12 11l8-3.5M12 11v9"/>',
  worker: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  external: '<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.7 4.7 0 0 0 7 18.5z"/>',
  region: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7 15h10"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  folder: '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.8l2 2.2h8.2A1.5 1.5 0 0 1 21 9.7v8.8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  replay: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>',
  pause: '<rect x="6.5" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  bars: '<path d="M5 19v-5M10 19V9M15 19v-7M20 19V5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  tilde: '<path d="M4 14c2-3 4-3 6-1.5s4 1.5 6-1.5 3-2 4-1"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.8l-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z"/>'
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || I.service}</svg>`;
const KIND_ICON = { client: 'laptop', user: 'user', server: 'server', service: 'service', db: 'db', cache: 'cache', queue: 'queue', lb: 'lb', cdn: 'cdn', dns: 'dns', gateway: 'gateway', storage: 'storage', worker: 'worker', external: 'external', region: 'region' };

// ---------- data ----------
const lessons = [];
C.modules.forEach((m, mi) => { m.num = mi + 1; m.lessons.forEach(l => { l.moduleId = m.id; l.moduleTitle = m.title; l.moduleNum = mi + 1; l.index = lessons.length; lessons.push(l); }); });
const bySlug = Object.fromEntries(lessons.map(l => [l.slug, l]));
const done = new Set(store.get('done', []).filter(s => bySlug[s]));
const VIEWS = ['practice', 'lab', 'cheatsheets', 'learn'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let cur = { view: null, slug: null, step: 0 };
let paused = reducedMotion;
let shownMetrics = {};
const pad = n => String(n).padStart(2, '0');

// ---------- routing ----------
function lastLesson() { const last = store.get('last', null); return last && bySlug[last.slug] ? last : lessons[0] && { slug: lessons[0].slug, step: 0 }; }
function parseHash() {
  const m = location.hash.match(/^#\/([\w-]+)?(?:\/([\w-]+))?\/?$/);
  const a = m && m[1], n = m && m[2];
  if (!a) return { view: 'home' };
  if (a === 'learn') { const l = lastLesson(); return l ? { view: 'learn', slug: l.slug, step: l.step, redirect: true } : { view: 'home' }; }
  if (VIEWS.includes(a)) return { view: a, sub: n };
  if (bySlug[a]) return { view: 'learn', slug: a, step: /^\d+$/.test(n || '') ? +n - 1 : 0 };
  return { view: 'home', redirect: true };
}
const go = (slug, step) => { location.hash = `#/${slug}/${step + 1}`; };

function route() {
  const r = parseHash();
  if (r.view === 'learn') {
    const l = bySlug[r.slug];
    const step = Math.min(Math.max(Number.isFinite(r.step) ? r.step : 0, 0), l.steps.length - 1);
    if (location.hash !== `#/${l.slug}/${step + 1}`) history.replaceState(null, '', `#/${l.slug}/${step + 1}`);
    showLesson(l, step);
  } else {
    if (r.redirect) history.replaceState(null, '', '#/');
    cur = { view: r.view, slug: null, step: 0 };
    document.body.dataset.view = r.view;
    ({ home: showHome, practice: showPractice, lab: showLab, cheatsheets: showCheats })[r.view]();
    $('#main').focus({ preventScroll: true });
    scrollTo(0, 0);
  }
  renderNav();
  closeDrawer();
}

// ---------- header + sidebar ----------
function renderNav() {
  const active = cur.view === 'home' ? null : cur.view;
  document.querySelectorAll('.views a').forEach(a => { if (a.dataset.view === active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const openId = cur.slug ? bySlug[cur.slug].moduleId : null;
  const openState = store.get('open', {});
  $('#course').innerHTML = C.modules.map(m => {
    const d = m.lessons.filter(l => done.has(l.slug)).length;
    const open = m.id === openId || openState[m.id];
    return `<details data-m="${esc(m.id)}" data-mc="${(m.num - 1) % 11}"${open ? ' open' : ''}><summary>${icon('chevron', 'chev')}${icon('folder', 'fold')}<span class="mt">${pad(m.num)}. ${esc(m.title)}</span><small>${d}/${m.lessons.length}</small></summary><ul>${m.lessons.map(l =>
      `<li><a href="#/${esc(l.slug)}/1"${l.slug === cur.slug ? ' aria-current="page"' : ''}>${icon(done.has(l.slug) ? 'check' : 'doc', done.has(l.slug) ? 'ok' : '')}<span>${esc(l.title)}</span>${l.isNew ? '<em class="new">new</em>' : ''}${done.has(l.slug) ? '<span class="sr"> (completed)</span>' : ''}</a></li>`).join('')}</ul></details>`;
  }).join('');
  $('#course').querySelectorAll('details').forEach(el => el.addEventListener('toggle', () => { const s = store.get('open', {}); s[el.dataset.m] = el.open; store.set('open', s); }));
  $('#progress-text').textContent = `${done.size} / ${lessons.length}`;
  $('#progress-bar').style.width = (lessons.length ? done.size / lessons.length * 100 : 0) + '%';
  $('#lesson-count').textContent = `${lessons.length} lessons`;
}

// ---------- home ----------
function showHome() {
  document.title = 'Systems Atlas · Learn System Design';
  const last = lastLesson(), lastL = last && bySlug[last.slug];
  const fresh = lessons.filter(l => l.isNew).length;
  $('#main').innerHTML = `<section class="card hero">
    <p class="eyebrow">${icon('spark')} Interactive system design course</p>
    <h1>Watch requests move.<br>Learn how systems scale.</h1>
    <p class="sub">${lessons.length} step-by-step lessons with animated diagrams, from one page load to payments, ride sharing and a Dynamo-style key-value store. Every lesson ends with a quiz; case studies come with a design lab.</p>
    <div class="hero-cta"><a class="btn primary" href="#/${esc(lastL.slug)}/${(done.size || store.get('last', null)) ? last.step + 1 : 1}">${done.size || store.get('last', null) ? 'Continue: ' + esc(lastL.title) : 'Start the course'} ${icon('arrowR')}</a><a class="btn" href="#/practice">${icon('target')} Practice</a><a class="btn" href="#/lab">${icon('flask')} Design Lab</a></div>
    <div class="stats"><div><b>${lessons.length}</b><span>lessons</span></div><div><b>${C.modules.length}</b><span>modules</span></div><div><b>${lessons.reduce((s, l) => s + l.steps.length, 0)}</b><span>animated steps</span></div><div><b>${lessons.reduce((s, l) => s + l.quiz.length, 0)}</b><span>quiz questions</span></div><div><b>${done.size}</b><span>completed</span></div></div>
  </section>
  <section class="modgrid" aria-label="Modules">${C.modules.map(m => {
    const d = m.lessons.filter(l => done.has(l.slug)).length;
    return `<article class="card mod" data-mc="${(m.num - 1) % 11}"><header>${icon('folder', 'fold')}<div><p class="eyebrow">Module ${pad(m.num)}</p><h2>${esc(m.title)}</h2></div><span class="pct">${d}/${m.lessons.length}</span></header>
      <div class="bar"><i data-w="${m.lessons.length ? d / m.lessons.length * 100 : 0}"></i></div>
      <ol>${m.lessons.map(l => `<li><a href="#/${esc(l.slug)}/1">${icon(done.has(l.slug) ? 'check' : 'doc', done.has(l.slug) ? 'ok' : '')}<span>${esc(l.title)}</span>${l.isNew ? '<em class="new">new</em>' : ''}</a></li>`).join('')}</ol></article>`;
  }).join('')}</section>
  <p class="foot">${fresh} lessons marked <em class="new">new</em> cover topics beyond the usual syllabus. Progress is saved in this browser only.</p>`;
  $('#main').querySelectorAll('[data-w]').forEach(i => { i.style.width = i.dataset.w + '%'; });
}

// ---------- learn view ----------
function showLesson(l, step) {
  const sameLesson = cur.view === 'learn' && cur.slug === l.slug;
  cur = { view: 'learn', slug: l.slug, step };
  document.body.dataset.view = 'learn';
  store.set('last', { slug: l.slug, step });
  if (step === l.steps.length - 1 && !done.has(l.slug)) { done.add(l.slug); store.set('done', [...done]); }
  if (!sameLesson) {
    shownMetrics = {};
    $('#main').innerHTML = lessonShell(l);
    $('#back').addEventListener('click', () => cur.step > 0 && go(l.slug, cur.step - 1));
    $('#next').addEventListener('click', nextStep);
    $('#replay').addEventListener('click', replay);
    $('#pause').addEventListener('click', togglePause);
    document.title = `${l.title} · Systems Atlas`;
    scrollTo(0, 0);
  }
  updateStep(l, step);
}

function lessonShell(l) {
  const metrics = l.metrics.map((m, i) => `<div class="metric${i === l.metrics.length - 1 && l.metrics.length > 1 ? ' last' : ''}"><span>${esc(m.label)}</span><b id="m-${esc(m.id)}">—</b></div>`).join('');
  return `<div class="lesson-main">
  <section class="card stage-card">
    <header class="lesson-head">
      <p class="crumb">${pad(l.moduleNum)}. ${esc(l.moduleTitle)} <span>/</span> Lesson ${l.index + 1} of ${lessons.length}</p>
      <div class="title-row"><h1>${esc(l.title)}</h1><div class="badges"><span class="b-time">${icon('clock')}${l.minutes} min</span><span class="b-level">${icon('bars')}${esc(l.level)}</span><span class="b-steps">${icon('list')}${l.steps.length} steps</span>${l.isNew ? `<span class="b-new">${icon('star')}new topic</span>` : ''}</div></div>
      <p class="sub">${esc(l.subtitle)}</p>
    </header>
    <div class="stage">
      <div class="hud">${metrics}<div class="hud-btns"><button id="replay" class="btn sm" aria-keyshortcuts="r">${icon('replay')}Replay</button><button id="pause" class="btn sm" aria-keyshortcuts="Space" aria-pressed="false"></button></div></div>
      <div id="diagram" class="diagram"></div>
      <div class="stage-foot"><div class="legend" aria-hidden="true"><span class="k-request">request</span><span class="k-response">response</span><span class="k-handshake">handshake</span><span class="k-async">async</span><span class="k-replicate">replicate</span><span class="k-fail">failure</span></div><p id="caption" class="caption"></p></div>
    </div>
  </section>
  <section class="card timeline" aria-label="Steps in this lesson">
    <div class="tl-head"><b>In this lesson</b><span id="step-count"></span></div>
    <ol>${l.steps.map((s, i) => `<li><a href="#/${esc(l.slug)}/${i + 1}" data-i="${i}"><span class="dot">${i + 1}</span><span class="tl-label">${esc(s.title)}</span></a></li>`).join('')}</ol>
  </section>
  </div>
  <aside class="guide-col" aria-label="Step guide">
    <section class="card guide">
      <div class="guide-top"><p class="step-label" id="step-label"></p><span class="tag" id="g-tag"></span></div>
      <h2 id="g-title"></h2>
      <p id="g-body" class="g-body"></p>
      <div class="idea">${icon('spark')}<div><b>Key idea</b><span id="g-idea"></span></div></div>
      <div class="changes" id="changes"></div>
      <div class="controls"><button id="back" class="btn">${icon('arrowL')}Back</button><button id="next" class="btn primary"></button></div>
      <p class="keys"><kbd>←</kbd><kbd>→</kbd> step · <kbd>R</kbd> replay · <kbd>Space</kbd> pause</p>
    </section>
    <section class="card learn"><b>You'll learn</b><ul id="learn">${l.learn.map(x => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
      <p class="practice-link"><a href="#/practice/${esc(l.slug)}">${icon('target')}Practice this lesson</a>${l.lab ? `<a href="#/lab/${esc(l.slug)}">${icon('flask')}Open design lab</a>` : ''}</p></section>
  </aside>`;
}

function nextStep() {
  const l = bySlug[cur.slug];
  if (cur.step < l.steps.length - 1) return go(l.slug, cur.step + 1);
  const nx = lessons[l.index + 1];
  if (nx) go(nx.slug, 0);
}

const metricAt = (l, id, i) => { let v = null; for (let k = 0; k <= i; k++) if (l.steps[k].metrics && l.steps[k].metrics[id] != null) v = String(l.steps[k].metrics[id]); return v; };

function updateStep(l, i) {
  const s = l.steps[i], n = l.steps.length;
  $('#step-label').textContent = `Step ${i + 1} / ${n}`;
  $('#g-tag').textContent = s.tag;
  $('#g-title').textContent = s.title;
  $('#g-body').textContent = s.body;
  $('#g-idea').textContent = s.idea;
  $('#caption').textContent = s.caption;
  $('#step-count').textContent = `Step ${i + 1} of ${n}`;
  $('#back').disabled = i === 0;
  const nx = lessons[l.index + 1];
  $('#next').innerHTML = (i < n - 1 ? `<span>Next: ${esc(l.steps[i + 1].title)}</span>` : nx ? `<span>Next lesson: ${esc(nx.title)}</span>` : '<span>Course complete</span>') + icon('arrowR');
  $('#next').disabled = i === n - 1 && !nx;
  document.querySelectorAll('.timeline a').forEach(a => { const k = +a.dataset.i; a.classList.toggle('past', k < i); if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
  const act = document.querySelector('.timeline a[aria-current]'), tl = document.querySelector('.timeline ol');
  if (act) tl.scrollLeft = act.offsetLeft - tl.clientWidth / 2;
  // "What changed": metric deltas against the previous step, plus newly focused components.
  const ch = [];
  for (const m of l.metrics) {
    const now = metricAt(l, m.id, i), before = i ? metricAt(l, m.id, i - 1) : null;
    if (now != null && now !== before) ch.push(before == null ? ['plus', `${m.label}: ${now}${m.unit ? ' ' + m.unit : ''}`] : ['tilde', `${m.label}: ${before} → ${now}${m.unit ? ' ' + m.unit : ''}`]);
  }
  const prevFocus = new Set(i ? l.steps[i - 1].focus || [] : []);
  for (const id of s.focus || []) if (!prevFocus.has(id) && (s.focus || []).length < l.nodes.length) ch.push(['plus', nodeLabel(l, id)]);
  $('#changes').innerHTML = ch.length ? `<b>What changed</b><ul>${ch.slice(0, 5).map(([k, t]) => `<li class="c-${k}">${icon(k)}<span>${esc(t)}</span></li>`).join('')}</ul>` : '';
  // "You'll learn" ticks fill in as the lesson progresses.
  document.querySelectorAll('#learn li').forEach((li, k, all) => li.classList.toggle('got', done.has(l.slug) || (i + 1) / n >= (k + 1) / all.length));
  for (const m of l.metrics) setMetric(m, metricAt(l, m.id, i));
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
  const tick = t => { const p = Math.min((t - t0) / 500, 1), e = 1 - (1 - p) ** 3; if (shownMetrics[m.id] !== v) return; el.textContent = (p < 1 ? (from + (to - from) * e).toFixed(dec) : v) + unit; if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

// ---------- diagram: isometric blocks in SVG; packets use SMIL so pause/replay are native ----------
const W = 900, H = 520;
let HW = 82, HH = 41, D = 28;
function blockLabel(label) {
  if (label.length <= 12 || !label.includes(' ')) return [label];
  const mid = label.length / 2; let best = -1;
  for (let k = 0; k < label.length; k++) if (label[k] === ' ' && (best < 0 || Math.abs(k - mid) < Math.abs(best - mid))) best = k;
  return [label.slice(0, best), label.slice(best + 1)];
}
function drawDiagram(l, s) {
  const PX = n => ({ x: 70 + n.x / 100 * (W - 140), y: 46 + n.y / 100 * (H - 112) });
  const P = id => PX(l.nodes.find(x => x.id === id));
  // Shrink blocks for crowded layouts: the closest pair of nodes must not overlap.
  let fit = 1;
  for (let a = 0; a < l.nodes.length; a++) for (let b = a + 1; b < l.nodes.length; b++) {
    const p = PX(l.nodes[a]), q = PX(l.nodes[b]);
    fit = Math.min(fit, Math.max(Math.abs(p.x - q.x) / 172, Math.abs(p.y - q.y) / 116));
  }
  fit = Math.max(0.62, Math.min(1, fit * 0.98));
  HW = 82 * fit; HH = 41 * fit; D = 28 * fit;
  const focus = new Set(s.focus || []);
  const flows = s.flows || [];
  const slot = 1.15, T = Math.max(flows.length, 1) * slot + 0.9;
  const hot = new Map(); flows.forEach(f => { const k = [f.from, f.to].sort().join('|'); if (!hot.has(k)) hot.set(k, f.kind); });
  let svg = `<svg id="svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="svg-title svg-desc"><title id="svg-title">${esc(l.title)} diagram</title><desc id="svg-desc">${esc(s.caption)} Components: ${esc(l.nodes.map(n => n.label).join(', '))}.${flows.length ? ' Messages: ' + esc(flows.map(f => `${nodeLabel(l, f.from)} to ${nodeLabel(l, f.to)}${f.label ? ' (' + f.label + ')' : ''}`).join('; ')) + '.' : ''}</desc>`;
  // edges (from block base centres)
  for (const e of l.edges) {
    const a = P(e.from), b = P(e.to), k = hot.get([e.from, e.to].sort().join('|'));
    svg += `<line class="edge${k ? ' hot k-' + k : ''}" x1="${a.x}" y1="${a.y + D / 2}" x2="${b.x}" y2="${b.y + D / 2}"/>`;
  }
  // blocks, back to front so lower blocks overlap upper ones
  for (const n of [...l.nodes].sort((a, b) => a.y - b.y)) {
    const { x, y } = P(n.id), cls = focus.size ? (focus.has(n.id) ? ' focus' : ' dim') : '';
    const top = `${x},${y - HH} ${x + HW},${y} ${x},${y + HH} ${x - HW},${y}`;
    const left = `${x - HW},${y} ${x},${y + HH} ${x},${y + HH + D} ${x - HW},${y + D}`;
    const right = `${x},${y + HH} ${x + HW},${y} ${x + HW},${y + D} ${x},${y + HH + D}`;
    const lines = blockLabel(n.label);
    svg += `<g class="node kind-${esc(n.kind)}${cls}"><polygon class="shadow" points="${x - HW + 8},${y + D + 6} ${x + 8},${y + HH + D + 6} ${x + HW + 8},${y + D + 6} ${x + 8},${y - HH + D + 6}"/><polygon class="f-left" points="${left}"/><polygon class="f-right" points="${right}"/><polygon class="f-top" points="${top}"/>`
      + `<svg class="nico" x="${x - 14 * fit}" y="${y - 30 * fit}" width="${28 * fit}" height="${28 * fit}" viewBox="0 0 24 24">${I[KIND_ICON[n.kind]] || I.service}</svg>`
      + lines.map((t, k) => `<text class="lbl${k ? ' l2' : ''}" font-size="${(k ? 13.5 : 16) * Math.max(fit, 0.8)}" x="${x}" y="${y + 13 * fit + k * 16 * fit - (lines.length - 1) * 4}">${esc(t)}</text>`).join('') + '</g>';
  }
  // static flow labels at edge midpoints, stacked when several share an edge
  const used = {};
  flows.forEach(f => {
    if (!f.label) return;
    const a = P(f.from), b = P(f.to), key = [f.from, f.to].sort().join('|'), k = used[key] = (used[key] || 0) + 1;
    const vertical = Math.abs(b.x - a.x) < Math.abs(b.y - a.y);
    const w = f.label.length * 8.4 + 22;
    const mx = (a.x + b.x) / 2 + (vertical ? w / 2 + 14 : 0), my = (a.y + b.y) / 2 + D / 2 + (vertical ? (k - 1) * 30 - 12 : -26 - (k - 1) * 30);
    svg += `<g class="flabel k-${esc(f.kind)}"><rect x="${mx - w / 2}" y="${my - 13}" width="${w}" height="26" rx="13"/><text x="${mx}" y="${my + 4.5}">${esc(f.label)}</text></g>`;
  });
  // animated packets
  flows.forEach((f, i) => {
    const a = P(f.from), b = P(f.to), t1 = (i * slot) / T, t2 = (i * slot + 0.95) / T;
    const path = `M${a.x},${a.y + D / 2} L${b.x},${b.y + D / 2}`;
    svg += `<g class="packet k-${esc(f.kind)}" opacity="0"><animateMotion dur="${T}s" repeatCount="indefinite" path="${path}" keyPoints="0;0;1;1" keyTimes="0;${t1.toFixed(3)};${t2.toFixed(3)};1" calcMode="linear"/><animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" keyTimes="0;${t1.toFixed(3)};${t1.toFixed(3)};${t2.toFixed(3)};${t2.toFixed(3)};1" values="0;0;1;1;0;0" calcMode="discrete"/><circle class="halo" r="13"/><circle r="7"/></g>`;
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
function syncPause() { const b = $('#pause'); if (b) { b.innerHTML = paused ? icon('play') + 'Play' : icon('pause') + 'Pause'; b.setAttribute('aria-pressed', String(paused)); } }

// ---------- practice ----------
function showPractice() {
  const sub = location.hash.split('/')[2] || '';
  const mod = C.modules.find(m => m.id === sub);
  const pool = bySlug[sub] ? [bySlug[sub]] : mod ? mod.lessons : lessons;
  const title = bySlug[sub] ? bySlug[sub].title : (mod ? mod.title : 'All topics');
  document.title = 'Practice · Systems Atlas';
  let qn = 0;
  $('#main').innerHTML = `<section class="card page-head"><p class="eyebrow">${icon('target')} Practice</p><h1>Check your understanding</h1><p class="sub">Pick an answer to see why it is right or wrong. Showing <b>${esc(title)}</b>: ${pool.reduce((s, l) => s + l.quiz.length, 0)} questions. <span id="score" class="score" aria-live="polite"></span></p>
    <div class="chips" role="group" aria-label="Filter by module"><a class="chip" href="#/practice"${!sub ? ' aria-current="true"' : ''}>All</a>${C.modules.map(m => `<a class="chip" data-mc="${(m.num - 1) % 11}" href="#/practice/${esc(m.id)}"${m.id === sub || (bySlug[sub] && bySlug[sub].moduleId === m.id) ? ' aria-current="true"' : ''}>${esc(m.title)}</a>`).join('')}</div></section>
    ${pool.map(l => `<section class="card qset"><h2><a href="#/${esc(l.slug)}/1">${esc(l.title)}</a><small>${esc(l.moduleTitle)}</small></h2>${l.quiz.map(q => { const id = 'q' + (qn++); return `<fieldset class="q" data-a="${q.answer}"><legend>${esc(q.q)}</legend>${q.options.map((o, k) => `<button class="opt" data-k="${k}" aria-describedby="${id}w"><span class="letter">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}<p class="why" id="${id}w" hidden>${esc(q.why)}</p></fieldset>`; }).join('')}</section>`).join('')}`;
  let right = 0, answered = 0;
  $('#main').querySelectorAll('.q').forEach(fs => fs.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b || fs.dataset.done) return;
    fs.dataset.done = 1; answered++;
    const ok = +b.dataset.k === +fs.dataset.a; if (ok) right++;
    fs.querySelectorAll('.opt').forEach(o => { o.disabled = true; if (+o.dataset.k === +fs.dataset.a) o.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    const w = fs.querySelector('.why'); w.hidden = false; w.classList.add(ok ? 'is-right' : 'is-wrong'); w.textContent = (ok ? 'Correct. ' : 'Not quite. ') + w.textContent;
    $('#score').textContent = `Score ${right} / ${answered}`;
  }));
}

// ---------- design lab ----------
function showLab() {
  const labs = lessons.filter(l => l.lab);
  const sub = location.hash.split('/')[2];
  const l = bySlug[sub] && bySlug[sub].lab ? bySlug[sub] : labs[0];
  document.title = 'Design Lab · Systems Atlas';
  if (!l) { $('#main').innerHTML = '<section class="card page-head"><h1>Design Lab</h1><p class="sub">No labs available yet.</p></section>'; return; }
  const checks = store.get('lab:' + l.slug, []);
  $('#main').innerHTML = `<section class="card page-head"><p class="eyebrow">${icon('flask')} Design Lab</p><h1>${esc(l.title)}</h1><p class="sub">Sketch your design first, then open hints only when stuck and review against the checklist.</p>
    <div class="chips" role="group" aria-label="Choose a design problem">${labs.map(x => `<a class="chip" href="#/lab/${esc(x.slug)}"${x === l ? ' aria-current="true"' : ''}>${esc(x.title.replace(/^Design (an? )?/, ''))}</a>`).join('')}</div></section>
    <div class="lab-grid"><section class="card lab"><h2>${icon('target')}The problem</h2><p>${esc(l.lab.prompt)}</p>
    <h2>${icon('list')}Requirements</h2><ul class="req">${l.lab.requirements.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>${icon('spark')}Hints</h2>${l.lab.hints.map((x, i) => `<details class="hint"><summary>Hint ${i + 1}</summary><p>${esc(x)}</p></details>`).join('')}</section>
    <section class="card lab"><h2>${icon('check')}Self-review checklist</h2><p class="sub" id="lab-count"></p><ul class="checklist">${l.lab.checklist.map((x, i) => `<li><label><input type="checkbox" data-i="${i}"${checks.includes(i) ? ' checked' : ''}><span>${esc(x)}</span></label></li>`).join('')}</ul>
    <a class="btn primary" href="#/${esc(l.slug)}/1">Walk through the reference design ${icon('arrowR')}</a></section></div>`;
  const count = () => { const c = $('#main').querySelectorAll('.checklist input:checked').length; $('#lab-count').textContent = `${c} of ${l.lab.checklist.length} covered`; };
  count();
  $('#main').querySelectorAll('.checklist input').forEach(cb => cb.addEventListener('change', () => { store.set('lab:' + l.slug, [...$('#main').querySelectorAll('.checklist input:checked')].map(x => +x.dataset.i)); count(); }));
}

// ---------- cheatsheets ----------
function showCheats() {
  document.title = 'Cheatsheets · Systems Atlas';
  $('#main').innerHTML = `<section class="card page-head"><p class="eyebrow">${icon('grid')} Cheatsheets</p><h1>Terms at a glance</h1><p class="sub">${lessons.reduce((s, l) => s + l.cheatsheet.length, 0)} key terms from every lesson, grouped by module.</p><label class="filter">${icon('search')}<input id="cs-filter" type="search" placeholder="Filter terms…" aria-label="Filter terms"></label></section>
    <div id="cs">${C.modules.map(m => `<section class="card cs-mod" data-mc="${(m.num - 1) % 11}"><h2>${icon('folder', 'fold')}${esc(m.title)}</h2><dl>${m.lessons.flatMap(l => l.cheatsheet.map(c => `<div class="cs-item"><dt>${esc(c.term)}</dt><dd>${esc(c.def)}</dd><a href="#/${esc(l.slug)}/1">${esc(l.title)} ${icon('chevron')}</a></div>`)).join('')}</dl></section>`).join('')}</div><p id="cs-none" class="empty" hidden>No matching terms.</p>`;
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
  $('#results').innerHTML = r.length ? r.map(x => `<a role="listitem" class="result" href="${esc(x.href)}"><span class="rtype t-${x.type.toLowerCase()}">${x.type}</span><b>${esc(x.title)}</b><small>${esc(x.sub.slice(0, 140))}</small></a>`).join('') : '<p class="empty">No matches. Try a broader word like “cache” or “queue”.</p>';
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
function isDark() { return document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); }
function syncTheme() { const d = isDark(); $('#theme').setAttribute('aria-pressed', String(d)); $('#theme').innerHTML = icon(d ? 'sun' : 'moon'); }
$('#theme').addEventListener('click', () => { const t = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('sa:theme', t); } catch (e) {} syncTheme(); });
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

document.querySelectorAll('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));
addEventListener('hashchange', route);
syncTheme();
route();
