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
  chevL: '<path d="M15 6l-6 6 6 6"/>',
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
  const saved = store.get('open', ''), openId2 = openId || (typeof saved === 'string' ? saved : '');
  $('#course').innerHTML = `<div class="rail">${C.modules.map(m => `<a href="#/${esc(m.lessons[0].slug)}/1" title="${esc(pad(m.num) + '. ' + m.title)}" data-mc="${(m.num - 1) % 11}"${m.id === openId ? ' aria-current="true"' : ''}>${icon('folder')}<span class="sr">${esc(m.title)}</span></a>`).join('')}</div>` + C.modules.map(m => {
    const d = m.lessons.filter(l => done.has(l.slug)).length;
    const open = m.id === openId2;
    return `<details data-m="${esc(m.id)}" data-mc="${(m.num - 1) % 11}"${open ? ' open' : ''}><summary>${icon('chevron', 'chev')}${icon('folder', 'fold')}<span class="mt">${pad(m.num)}. ${esc(m.title)}</span><small>${d}/${m.lessons.length}</small></summary><ul>${m.lessons.map(l =>
      `<li><a href="#/${esc(l.slug)}/1"${l.slug === cur.slug ? ' aria-current="page"' : ''}>${icon(done.has(l.slug) ? 'check' : 'doc', done.has(l.slug) ? 'ok' : '')}<span>${esc(l.title)}</span>${l.isNew ? '<em class="new">new</em>' : ''}${done.has(l.slug) ? '<span class="sr"> (completed)</span>' : ''}</a></li>`).join('')}</ul></details>`;
  }).join('');
  $('#course').querySelectorAll('details').forEach(el => el.addEventListener('toggle', () => {
    if (el.open) { store.set('open', el.dataset.m); $('#course').querySelectorAll('details[open]').forEach(o => { if (o !== el) o.open = false; }); }
    else if (store.get('open', '') === el.dataset.m) store.set('open', '');
  }));
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
    <section class="card learn"><b>You'll learn</b><ul id="learn">${l.learn.map(x => `<li>${icon('check')}<span title="${esc(x)}">${esc(x)}</span></li>`).join('')}</ul>
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
  fitGuide();
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

// ---------- diagram: illustrated isometric scene in SVG; packets use SMIL so pause/replay are native ----------
const W = 900, H = 520;
let K = 1; // auto "fit" scale baked into iso() so strokes keep their weight
const iso = (u, v, z = 0) => [K * 0.866 * (u - v), K * (0.5 * (u + v) - z)];
const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
const poly = (c, a, x = '') => `<polygon class="s f-${c}" points="${pts(a)}"${x}/>`;
const box = (u0, u1, v0, v1, z0, z1, x = '') =>
  poly('left', [iso(u0, v1, z0), iso(u1, v1, z0), iso(u1, v1, z1), iso(u0, v1, z1)], x) + poly('right', [iso(u1, v1, z0), iso(u1, v0, z0), iso(u1, v0, z1), iso(u1, v1, z1)], x) + poly('top', [iso(u0, v0, z1), iso(u1, v0, z1), iso(u1, v1, z1), iso(u0, v1, z1)], x);
const seg = (a, b) => `<path class="d" d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/>`;
function cyl(r, z0, z1, bands = []) {
  const rx = K * 1.2247 * r, ry = K * 0.7071 * r, y0 = -K * z0, y1 = -K * z1;
  return `<path class="s f-left" d="M${-rx},${y0}A${rx},${ry} 0 0 0 ${rx},${y0}L${rx},${y1}L${-rx},${y1}Z"/>`
    + bands.map(z => `<path class="d" d="M${-rx},${-K * z}A${rx},${ry} 0 0 0 ${rx},${-K * z}"/>`).join('') + `<ellipse class="s f-top" cy="${y1}" rx="${rx}" ry="${ry}"/>`;
}
// per-kind illustration: [svg, ground-front y (unscaled) where the label pill hangs], or null for a labelled prism
function art(kind) {
  const led = (u, v, z) => { const [x, y] = iso(u, v, z); return `<circle class="led" cx="${x}" cy="${y}" r="${2.4 * Math.max(K, .8)}"/>`; };
  if (kind === 'client') {
    let s = box(-44, 44, -44, 44, 0, 8) + box(-22, -18, -22, 22, 12, 46) + box(-16, 24, -24, 24, 8, 12);
    for (const z of [24, 30, 36, 42]) s += seg(iso(-18, -14, z), iso(-18, z % 12 ? 14 : 6, z));
    return [s + [-8, 4, 14].map(u => seg(iso(u, -16, 12), iso(u, 16, 12))).join(''), 44];
  }
  if (kind === 'user') { const [hx, hy] = iso(0, 0, 40); return [cyl(26, 0, 5) + cyl(10, 5, 28) + `<circle class="s f-top" cx="${hx}" cy="${hy}" r="${9 * K}"/>`, 20]; }
  if (kind === 'db' || kind === 'storage') return [cyl(30, 0, 42, kind === 'db' ? [14, 28] : [10, 21, 32]), 21];
  if (kind === 'queue') { let s = ''; for (let i = 0; i < 4; i++) s += box(-36 + i * 18, -26 + i * 18, -22, 22, 0, 26) + seg(iso(-26 + i * 18, -14, 13), iso(-26 + i * 18, 14, 13)); return [s, 29]; }
  if (kind === 'region') return [box(-72, 72, -72, 72, 0, 5, ' stroke-dasharray="7 5"'), 72];
  return null;
}
// camera: the viewBox tweens between per-step frames; last frame is remembered per lesson
const cam = { slug: null, vb: null, raf: 0 }, lastDraw = { slug: null, focus: new Set() };
const easeIO = p => p < .5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
function flyTo(svg, to, slug) {
  cancelAnimationFrame(cam.raf);
  const from = cam.slug === slug && cam.vb && !reducedMotion ? cam.vb : to, set = v => svg.setAttribute('viewBox', v.map(x => x.toFixed(1)).join(' '));
  cam.slug = slug; cam.vb = from; set(from);
  if (from === to) return;
  const t0 = performance.now();
  const tick = t => { const p = Math.min((t - t0) / 650, 1), e = easeIO(p); cam.vb = p < 1 ? from.map((v, k) => v + (to[k] - v) * e) : to; set(cam.vb); if (p < 1) cam.raf = requestAnimationFrame(tick); };
  cam.raf = requestAnimationFrame(tick);
}
function drawDiagram(l, s) {
  if (tl) { tl.kill(); tl = null; }
  if (l.style === 'illustrated') return drawIllustrated(l, s);
  let PX = n => ({ x: 90 + n.x / 100 * (W - 180), y: 100 + n.y / 100 * (H - 190) });
  const P = id => PX(l.nodes.find(x => x.id === id));
  K = 1;
  const real = l.nodes.filter(n => n.kind !== 'region');
  for (let a = 0; a < real.length; a++) for (let b = a + 1; b < real.length; b++) {
    const p = PX(real[a]), q = PX(real[b]);
    K = Math.min(K, Math.max(Math.abs(p.x - q.x) / 180, Math.abs(p.y - q.y) / 178));
  }
  K = Math.max(0.62, Math.min(1.3, K * 0.98));
  // fit layout: keep blocks at natural size (K=1, ~170 units wide) and spread the nodes instead of shrinking them
  const dg = $('#diagram'), cw = dg.clientWidth, ch = dg.clientHeight, fitLayout = matchMedia('(min-width:1281px)').matches && cw > 200 && ch > 100;
  if (fitLayout) { const S = 1 / K, P0 = PX; K = 1; PX = n => { const p = P0(n); return { x: 450 + (p.x - 450) * S, y: 265 + (p.y - 265) * S }; }; }
  const focus = new Set(s.focus || []), flows = s.flows || [];
  const si = l.steps.indexOf(s), first = firstSeen(l);
  const prevFocus = !reducedMotion && lastDraw.slug === l.slug ? lastDraw.focus : null;
  lastDraw.slug = l.slug; lastDraw.focus = focus;
  const vis = n => first[n.id] <= si, shown = l.nodes.filter(vis), shownIds = new Set(shown.map(n => n.id));
  const slot = 1.15, T = Math.max(flows.length, 1) * slot + 0.9;
  const key = (a, b) => [a, b].sort().join('|');
  // iso-routed elbow along the two iso axes (rounded corner), canonical per sorted pair; straight when the detour would be large
  // single-elbow route along the two iso axes with a quadratic rounded corner; of the two possible elbows pick the one that keeps clear of other blocks
  const routes = {}, U = [.866, .5], V = [.866, -.5], R = 22;
  const route = (ida, idb) => {
    const [i1, i2] = [ida, idb].sort(), ck = i1 + '|' + i2; if (routes[ck]) return routes[ck];
    const a = P(i1), b = P(i2), dx = b.x - a.x, dy = b.y - a.y, du = (dx / .866 + 2 * dy) / 2, dv = (dx / .866 - 2 * dy) / 2;
    const c = Math.hypot(dx, dy) || 1, nrm = [-dy / c, dx / c], straight = { i1, i2, d: `M${a.x},${a.y}L${b.x},${b.y}`, mid: [(a.x + b.x) / 2, (a.y + b.y) / 2], n: nrm };
    const m1 = { x: a.x + du * U[0], y: a.y + du * U[1] }, off = Math.abs((m1.x - a.x) * dy - (m1.y - a.y) * dx) / c, r = Math.min(R, Math.abs(du) / 2, Math.abs(dv) / 2);
    if (off > 90 || r < 2) return routes[ck] = straight;
    const mk = (first, s1, s2, e1, e2) => { const m = { x: a.x + first[0] * s1, y: a.y + first[1] * s1 }, rr = Math.min(R, Math.abs(s1) / 2, Math.abs(s2) / 2), q1 = [Math.sign(s1) * e1[0], Math.sign(s1) * e1[1]], q2 = [Math.sign(s2) * e2[0], Math.sign(s2) * e2[1]]; return { i1, i2, m, n: nrm, mid: [m.x, m.y], d: `M${a.x},${a.y}L${m.x - rr * q1[0]},${m.y - rr * q1[1]}Q${m.x},${m.y} ${m.x + rr * q2[0]},${m.y + rr * q2[1]}L${b.x},${b.y}`, a, b }; };
    const A = mk(U, du, dv, U, V), B = mk(V, dv, du, V, U);
    const bad = o => { let k = 0; const p = document.createElementNS(NS, 'path'); p.setAttribute('d', o.d); const L = p.getTotalLength(); for (let t = 0; t <= L; t += 4) { const q = p.getPointAtLength(t); for (const id in nodeRect) { if (id === i1 || id === i2) continue; const r4 = nodeRect[id]; if (q.x > r4[0] - 10 && q.x < r4[2] + 10 && q.y > r4[1] - 10 && q.y < r4[3] + 10) k++; } } return k; };
    return routes[ck] = bad(B) < bad(A) ? B : A;
  };
  const hot = new Map(); flows.forEach(f => { if (!hot.has(key(f.from, f.to))) hot.set(key(f.from, f.to), { kind: f.kind, fwd: route(f.from, f.to).fwd }); });
  const clsFor = (n, fs) => (fs.size ? (fs.has(n.id) ? ' focus' : ' dim') : '') + (first[n.id] === si && !reducedMotion ? ' rise' : '');
  const prisms = new Set();
  const nodeSvg = n => {
    const { x, y } = PX(n), a = art(n.kind), rg = n.kind === 'region';
    const c1 = clsFor(n, focus), c0 = prevFocus ? clsFor(n, prevFocus) : c1;
    let g = `<ellipse class="shadow" cy="${K * 8}" rx="${K * (rg ? 90 : 92)}" ry="${K * (rg ? 48 : 52)}"/>`;
    if (focus.has(n.id) && !rg) g += `<ellipse class="ring" cy="${K * 4}" rx="${K * 98}" ry="${K * 58}"/>`;
    if (a) {
      // name pill: panel fill, ink border, leading icon (user / globe / db ...)
      const ic = { client: 'cdn', user: 'user', db: 'db', storage: 'storage', queue: 'queue', region: 'region' }[n.kind] || 'cdn', tw = n.label.length * 8.6, w = tw + 54, py = K * a[1] + 14;
      g += a[0] + `<g class="pill"><rect x="${-w / 2}" y="${py}" width="${w}" height="34" rx="17"/><g class="pico" transform="translate(${-w / 2 + 11},${py + 8}) scale(.75)">${I[ic]}</g><text x="${12}" y="${py + 22.5}">${esc(n.label)}</text></g>`;
    } else {
      // hexagonal prism seen from above: flat-top hexagon (rounded) + side depth under the three lower edges; label inside the top face
      prisms.add(n.kind);
      const tiers = n.kind === 'server' ? 2 : 1, D = 26 * K, Rr = 85 * K, H = tiers * D, ico = 26 * K, hw = (dy) => Rr - Math.abs(dy) / 1.732;
      const hex = oy => { const v = [0, 1, 2, 3, 4, 5].map(i => [Rr * Math.cos(i * Math.PI / 3), oy + Rr * Math.sin(i * Math.PI / 3)]), t = 10 * K * .577; let d = '';
        v.forEach((p, i) => { const pr = v[(i + 5) % 6], nx = v[(i + 1) % 6], u = (q) => { const l = Math.hypot(q[0] - p[0], q[1] - p[1]); return [(q[0] - p[0]) / l * t, (q[1] - p[1]) / l * t]; }, a1 = u(pr), b1 = u(nx);
          d += `${i ? 'L' : 'M'}${(p[0] + a1[0]).toFixed(1)},${(p[1] + a1[1]).toFixed(1)}Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${(p[0] + b1[0]).toFixed(1)},${(p[1] + b1[1]).toFixed(1)}`; });
        return d + 'Z'; };
      for (let t = 0; t < tiers; t++) g += `<path class="s f-left" d="${hex(-t * D)}"/>`;
      g += `<path class="s" fill="url(#gr-${esc(n.kind)})" d="${hex(-H)}"/>`;
      const cy = -H, w1 = n.label.split(' ')[0], w2 = n.label.slice(w1.length).trim(), f1 = Math.max(9, Math.min(17 * Math.max(K, .8), K * 120 / (w1.length * .6))), f2 = w2 ? Math.max(8, Math.min(13 * Math.max(K, .8), K * 126 / (w2.length * .56))) : 0;
      const iy = cy - (w2 ? 30 : 20) * K;
      g += `<g class="nico" transform="translate(${-ico / 2},${iy - ico / 2}) scale(${ico / 24})">${I[KIND_ICON[n.kind]] || I.service}</g>`
        + `<text class="lbl" font-size="${f1.toFixed(1)}" x="0" y="${(cy + (w2 ? 12 : 16) * K).toFixed(1)}">${esc(w1)}</text>` + (w2 ? `<text class="lbl l2" font-size="${f2.toFixed(1)}" x="0" y="${(cy + 12 * K + f1 * 1.05).toFixed(1)}">${esc(w2)}</text>` : '');
    }
    return `<g class="node kind-${esc(n.kind)}${c0}"${c0 !== c1 ? ` data-c="${c1}"` : ''} transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><g class="body">${g}</g></g>`;
  };
  // camera: frame only the visible nodes, with a minimum size, keeping the canvas aspect
  const fids = new Set([...focus, ...flows.flatMap(f => [f.from, f.to])].filter(id => shownIds.has(id))), cn = fids.size ? shown.filter(n => fids.has(n.id)) : (shown.length ? shown : l.nodes.slice(0, 1));
  const sp = cn.map(PX), x0 = Math.min(...sp.map(p => p.x)) - 150 * K - 40, x1 = Math.max(...sp.map(p => p.x)) + 150 * K + 40;
  const y0 = Math.min(...sp.map(p => p.y)) - 150 * K - 50, y1 = Math.max(...sp.map(p => p.y)) + 95 * K + 40;
  let vw = Math.max(x1 - x0, 600), vh = y1 - y0; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (vw / vh < W / H) vw = vh * W / H; else vh = vw * H / W;
  let target = [cx - vw / 2, cy - vh / 2, vw, vh];
  // fit layout: fixed comfortable scale (1 SVG unit = 1 CSS px), only zooming out when the visible nodes would not fit
  if (fitLayout) {
    const ext = ns => { const q = ns.map(PX), X0 = Math.min(...q.map(p => p.x)) - 115, X1 = Math.max(...q.map(p => p.x)) + 115, Y0 = Math.min(...q.map(p => p.y)) - 120, Y1 = Math.max(...q.map(p => p.y)) + 125; return { X0, X1, Y0, Y1, sc: Math.min(1, cw / (X1 - X0), ch / (Y1 - Y0)) }; };
    const e1 = ext(cn), e2 = ext(shown), e = shown.length && e2.sc >= .75 ? e2 : e1; // prefer framing everything revealed so far when it still reads at a comfortable scale
    const ex = (e.X0 + e.X1) / 2, ey = (e.Y0 + e.Y1) / 2;
    target = [ex - cw / e.sc / 2, ey - ch / e.sc / 2, cw / e.sc, ch / e.sc];
  }
  let body = '';
  const order = [...shown].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const n of order) if (n.kind === 'region') body += nodeSvg(n);
  for (const e of l.edges) if (shownIds.has(e.from) && shownIds.has(e.to)) {
    const k = hot.get(key(e.from, e.to)), isNew = Math.max(first[e.from], first[e.to]) === si && !reducedMotion;
    body += `<path class="edge${k ? ' hot k-' + k.kind : ''}${isNew ? ' new' : ''}"${k ? ` data-f="${k.fwd ? 'f' : 'r'}"` : ''} d="${route(e.from, e.to).d}"/>`;
  }
  for (const n of order) if (n.kind !== 'region') body += nodeSvg(n);
  // flow labels beside the path midpoint (offset along the normal, clear of the line), stacked when several share an edge
  const used = {};
  flows.forEach(f => {
    if (!f.label) return;
    const rt = route(f.from, f.to), k = used[key(f.from, f.to)] = (used[key(f.from, f.to)] || 0) + 1, w = f.label.length * 9.2 + 30;
    let [nx, ny] = rt.n; if (ny > 0) { nx = -nx; ny = -ny; }
    const d = Math.abs(nx) * w / 2 + Math.abs(ny) * 18 + 14 + (k - 1) * 40, mx = rt.mid[0] + nx * d, my = rt.mid[1] + ny * d;
    body += `<g class="flabel k-${esc(f.kind)}"><rect x="${mx - w / 2}" y="${my - 18}" width="${w}" height="36" rx="18"/><text x="${mx}" y="${my + 5.5}">${esc(f.label)}</text></g>`;
  });
  // packets: two dots per flow (staggered), SMIL motion with eased spline timing inside the flow's slot
  flows.forEach((f, i) => {
    const rt = route(f.from, f.to), kp = rt.fwd ? '0;0;1;1' : '1;1;0;0';
    for (const dl of [0, 0.18]) {
      const t1 = ((i * slot + dl) / T).toFixed(3), t2 = ((i * slot + 0.95 + dl) / T).toFixed(3), kt = `0;${t1};${t2};1`;
      body += `<g class="packet k-${esc(f.kind)}" opacity="0"><animateMotion dur="${T}s" repeatCount="indefinite" path="${rt.d}" keyPoints="${kp}" keyTimes="${kt}" calcMode="spline" keySplines="0 0 1 1;.45 0 .2 1;0 0 1 1"/><animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" keyTimes="0;${t1};${t1};${t2};${t2};1" values="0;0;1;1;0;0" calcMode="discrete"/><circle r="7"/></g>`;
    }
  });
  const defs = [...prisms].map(k => `<g class="kind-${esc(k)}"><linearGradient id="gr-${esc(k)}" x1="0" y1="0" x2="1" y2="1"><stop class="gs-a" offset="0"/><stop class="gs-b" offset="1"/></linearGradient></g>`).join('');
  $('#diagram').innerHTML = `<svg id="svg" viewBox="${target.map(v => v.toFixed(1)).join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="svg-title svg-desc"><title id="svg-title">${esc(l.title)} diagram</title><desc id="svg-desc">${esc(s.caption)} Components: ${esc(shown.map(n => n.label).join(', '))}.${flows.length ? ' Messages: ' + esc(flows.map(f => `${nodeLabel(l, f.from)} to ${nodeLabel(l, f.to)}${f.label ? ' (' + f.label + ')' : ''}`).join('; ')) + '.' : ''}</desc><defs>${defs}</defs>${body}</svg>`;
  const el = $('#svg');
  // measure edges: draw-in length for new ones; trim hot ones short of the node and add an arrowhead at the destination
  const R0 = 82 * K;
  el.querySelectorAll('.edge').forEach(p => {
    const L = p.getTotalLength(), dir = p.dataset.f;
    if (p.classList.contains('new')) p.style.setProperty('--len', L.toFixed(1));
    if (!dir) return;
    const R = Math.min(R0, L / 3), at = dir === 'f' ? L - R : R, sg = dir === 'f' ? 1 : -1;
    const q = p.getPointAtLength(at), a = p.getPointAtLength(Math.max(at - 2, 0)), b = p.getPointAtLength(Math.min(at + 2, L));
    const ang = Math.atan2(sg * (b.y - a.y), sg * (b.x - a.x)) * 180 / Math.PI;
    p.style.strokeDasharray = dir === 'f' ? `${L - R} ${L}` : `0 ${R} ${L - R} ${L}`;
    const ar = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ar.setAttribute('class', 'arrow' + (p.classList.contains('new') ? ' new' : '')); ar.setAttribute('d', 'M-14,-8L4,0L-14,8Z');
    ar.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
    el.insertBefore(ar, el.querySelector('.flabel,.packet'));
  });
  flyTo(el, target, l.slug);
  if (prevFocus) { el.getBoundingClientRect(); el.querySelectorAll('.node[data-c]').forEach(n => n.setAttribute('class', `node kind-${n.getAttribute('class').match(/kind-(\S+)/)[1]}${n.dataset.c}`)); }
  if (paused) { el.setCurrentTime(0.5); el.pauseAnimations(); }
  syncPause();
}
// ---------- illustrated style (opt-in per lesson: "style": "illustrated"): soft isometric cubes, detailed laptop, pills, status chips ----------
const IA = 84, IB = 50, ID = 44, NS = 'http://www.w3.org/2000/svg';
const ILL_ICON = { dns: 'cdn', cdn: 'external' };
function roundPoly(p, r) {
  return p.map((q, i) => {
    const pr = p[(i + p.length - 1) % p.length], nx = p[(i + 1) % p.length];
    const u = o => { const L = Math.hypot(o[0] - q[0], o[1] - q[1]), t = Math.min(r, L / 2) / L; return [q[0] + (o[0] - q[0]) * t, q[1] + (o[1] - q[1]) * t]; };
    const A = u(pr), B = u(nx);
    return `${i ? 'L' : 'M'}${A[0].toFixed(1)},${A[1].toFixed(1)}Q${q[0].toFixed(1)},${q[1].toFixed(1)} ${B[0].toFixed(1)},${B[1].toFixed(1)}`;
  }).join('') + 'Z';
}
const CUBE = [[0, -IB], [IA, 0], [IA, ID], [0, IB + ID], [-IA, ID], [-IA, 0]];
function laptopSvg() {
  K = 1;
  const P_ = 72, PT = 16, PLAT = [iso(-P_, -P_, 0), iso(P_, -P_, 0), iso(P_, -P_, -PT), iso(P_, P_, -PT), iso(-P_, P_, -PT), iso(-P_, P_, 0)];
  let g = `<ellipse class="ishadow" cx="8" cy="${(iso(0, 0, -PT)[1] + 40).toFixed(1)}" rx="150" ry="38"/>`;
  g += `<g clip-path="url(#ipl)"><polygon class="pf-l" points="${pts([iso(-P_, P_, 0), iso(P_, P_, 0), iso(P_, P_, -PT), iso(-P_, P_, -PT)])}"/><polygon class="pf-r" points="${pts([iso(P_, P_, 0), iso(P_, -P_, 0), iso(P_, -P_, -PT), iso(P_, P_, -PT)])}"/><polygon class="pf-t" points="${pts([iso(-P_, -P_, 0), iso(P_, -P_, 0), iso(P_, P_, 0), iso(-P_, P_, 0)])}"/></g>`;
  g += `<path class="iout" d="${roundPoly(PLAT, 24)}"/>`;
  const dz = 6, u0 = -30, u1 = 46, v0 = -46, v1 = 46;
  g += `<g class="lap">` + poly('left', [iso(u0, v1, 0), iso(u1, v1, 0), iso(u1, v1, dz), iso(u0, v1, dz)]) + poly('right', [iso(u1, v1, 0), iso(u1, v0, 0), iso(u1, v0, dz), iso(u1, v1, dz)]) + poly('top', [iso(u0, v0, dz), iso(u1, v0, dz), iso(u1, v1, dz), iso(u0, v1, dz)]);
  let kb = '';
  for (let r = 0; r <= 5; r++) { const u = -22 + r * 8; kb += `M${iso(u, -38, dz)}L${iso(u, 38, dz)}`; }
  for (let c = 0; c <= 12; c++) { const v = -38 + c * 6.34; kb += `M${iso(-22, v, dz)}L${iso(18, v, dz)}`; }
  g += `<path class="kb" d="${kb}"/><path class="tp" d="${roundPoly([iso(25, -14, dz), iso(40, -14, dz), iso(40, 14, dz), iso(25, 14, dz)], 4)}"/>`;
  const S = (v, z, off = 0) => iso(-30 - 9 * (z - dz) / 50 + off, v, z), zt = 56;
  g += `<polygon class="s scr-d" points="${pts([S(v1, dz), S(v1, dz, -5), S(v1, zt, -5), S(v1, zt)])}"/>`
    + `<polygon class="s scr-d" points="${pts([S(v0, zt), S(v1, zt), S(v1, zt, -5), S(v0, zt, -5)])}"/>`
    + `<polygon class="s scr-f" points="${pts([S(v1, dz), S(v0, dz), S(v0, zt), S(v1, zt)])}"/>`;
  const sc = (a, b) => S(40 - 80 * a, 12 + 38 * b), Q = (a0, a1, b0, b1, c, r = 2) => `<path class="${c}" d="${roundPoly([sc(a0, b0), sc(a1, b0), sc(a1, b1), sc(a0, b1)], r)}"/>`;
  g += Q(0.05, 0.95, 0.04, 0.96, 'glass', 3) + Q(0.05, 0.95, 0.86, 0.96, 'ui-bar', 2);
  [0.09, 0.14, 0.19].forEach((a, i) => { const [x, y] = sc(a, 0.91); g += `<circle class="ui-dot d${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7"/>`; });
  g += Q(0.1, 0.9, 0.45, 0.78, 'ui-hero', 3) + Q(0.1, 0.72, 0.3, 0.37, 'ui-line', 2) + Q(0.1, 0.5, 0.18, 0.25, 'ui-line', 2) + Q(0.1, 0.62, 0.08, 0.14, 'ui-line', 2);
  return g + '</g>';
}
function cubeSvg(n) {
  const k = n.kind, T = [[0, -IB], [IA, 0], [0, IB], [-IA, 0]], Lf = [[-IA, 0], [0, IB], [0, IB + ID], [-IA, ID]], Rf = [[0, IB], [IA, 0], [IA, ID], [0, IB + ID]];
  const w1 = n.label.split(' ')[0], w2 = n.label.slice(w1.length).trim(), ico = 26;
  return `<ellipse class="ishadow" cx="6" cy="${IB + ID + 16}" rx="${IA + 18}" ry="26"/><g clip-path="url(#icl)"><polygon fill="url(#ig-l-${esc(k)})" points="${pts(Lf)}"/><polygon fill="url(#ig-r-${esc(k)})" points="${pts(Rf)}"/><polygon fill="url(#ig-t-${esc(k)})" points="${pts(T)}"/></g>`
    + `<path class="ihi" d="${roundPoly([[0, -IB + 14], [IA - 22, -2], [0, IB - 18], [-IA + 22, -2]], 12)}"/><path class="iout" d="${roundPoly(CUBE, 18)}"/>`
    + `<g class="nico" transform="translate(${-ico / 2},${w2 ? -37 : -32}) scale(${ico / 24})">${I[ILL_ICON[k] || KIND_ICON[k]] || I.service}</g>`
    + `<text class="ilbl" font-size="18" x="0" y="${w2 ? 11 : 16}">${esc(w1)}</text>` + (w2 ? `<text class="ilbl l2" font-size="13" x="0" y="29">${esc(w2)}</text>` : '');
}
// database / storage: soft cylinder (elliptical top with highlight, vertical-gradient body); name pill sits beside it
const CRX = 72, CRY = 30, CTY = -22, CBY = 52, isCyl = n => n.kind === 'db' || n.kind === 'storage';
const CYL = (() => { const q = []; for (let i = 0; i <= 24; i++) { const t = Math.PI + Math.PI * i / 24; q.push([CRX * Math.cos(t), CTY + CRY * Math.sin(t)]); } for (let i = 0; i <= 24; i++) { const t = Math.PI * i / 24; q.push([CRX * Math.cos(t), CBY + CRY * Math.sin(t)]); } return q; })();
function cylSvg(n) {
  const k = esc(n.kind), body = `M${-CRX},${CTY}L${-CRX},${CBY}A${CRX},${CRY} 0 0 0 ${CRX},${CBY}L${CRX},${CTY}`;
  return `<ellipse class="ishadow" cx="6" cy="${CBY + CRY - 2}" rx="${CRX + 22}" ry="22"/><path fill="url(#ig-l-${k})" d="${body}Z"/><ellipse fill="url(#ig-t-${k})" cx="0" cy="${CTY}" rx="${CRX}" ry="${CRY}"/>`
    + `<ellipse class="ihi" cx="-6" cy="${CTY - 3}" rx="${CRX - 22}" ry="${CRY - 11}"/><path class="iout" d="${body}"/><ellipse class="iout" cx="0" cy="${CTY}" rx="${CRX}" ry="${CRY}"/>`
    + `<g class="nico" transform="translate(-14,${CTY + CRY + 3}) scale(${28 / 24})">${I[KIND_ICON[n.kind]] || I.db}</g>`;
}
// pill / chip builders: return {svg, w} centred on (cx, cy)
function pillSvg(cx, cy, text, ic, cls = 'ipill', h = 36, fs = 15) {
  const w = text.length * fs * 0.61 + (ic ? 50 : 30), x = cx - w / 2, y = cy - h / 2;
  return { w, h, svg: `<g class="${cls}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="${h / 2}"/>${ic ? `<g class="pico" transform="translate(${(x + 12).toFixed(1)},${(cy - 9).toFixed(1)}) scale(.75)">${I[ic]}</g>` : ''}<text font-size="${fs}" x="${(x + (ic ? 38 : 15)).toFixed(1)}" y="${(cy + fs * 0.34).toFixed(1)}">${esc(text)}</text></g>` };
}
function chipSvg(cx, cy, c) {
  if (c.kind !== 'progress') return pillSvg(cx, cy, c.text, null, 'ichip', 32, 14);
  const v = Math.max(0, Math.min(100, +c.value || 0)), tw = (c.text || '').length * 8.6, w = 14 + 20 + 8 + 56 + 8 + tw + 12, x = cx - w / 2, y = cy - 16, bx = x + 42;
  return { w, h: 32, svg: `<g class="ichip"><rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="32" rx="16"/><g class="pico gear" transform="translate(${(x + 12).toFixed(1)},${cy - 8}) scale(.67)">${I.worker}</g><rect class="ibar" x="${bx.toFixed(1)}" y="${cy - 4}" width="56" height="8" rx="4"/><rect class="ifill" x="${bx.toFixed(1)}" y="${cy - 4}" width="${Math.max(8, 56 * v / 100).toFixed(1)}" height="8" rx="4"/><text font-size="14" x="${(bx + 64).toFixed(1)}" y="${cy + 5}">${esc(c.text || '')}</text></g>` };
}
// silhouettes (node-local coords): the rounded cube hexagon; laptop = platform + screen
const inPoly = (x, y, pl) => { let c = false; for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) if ((pl[i][1] > y) !== (pl[j][1] > y) && x < (pl[j][0] - pl[i][0]) * (y - pl[i][1]) / (pl[j][1] - pl[i][1]) + pl[i][0]) c = !c; return c; };
let lapPolys = null;
const inSil = (n, x, y) => {
  if (isCyl(n)) return inPoly(x, y, CYL);
  if (n.kind !== 'client') return inPoly(x, y, CUBE);
  if (!lapPolys) { K = 1; lapPolys = [[iso(-72, -72, 0), iso(72, -72, 0), iso(72, -72, -16), iso(72, 72, -16), iso(-72, 72, -16), iso(-72, 72, 0)], [iso(-39, -46, 62), iso(-39, 46, 62), iso(-30, 46, 6), iso(-30, -46, 6)]]; }
  return lapPolys.some(pl => inPoly(x, y, pl));
};
// walk the centre-to-centre path out of both silhouettes (+6 gap); returns a polyline plus sample points for collision tests
function trimPath(d, in1, in2) {
  const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d);
  const L = p.getTotalLength(); let a = 0, b = L;
  while (a < L * .45 && in1(p.getPointAtLength(a))) a += 2;
  while (b > L * .55 && in2(p.getPointAtLength(b))) b -= 2;
  a = Math.min(a + 6, L * .45); b = Math.max(b - 6, L * .55);
  const n = Math.max(2, Math.ceil((b - a) / 3)), q = [];
  for (let i = 0; i <= n; i++) q.push(p.getPointAtLength(a + (b - a) * i / n));
  const ang = (p0, p1) => Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  return { d: 'M' + q.map(o => o.x.toFixed(1) + ',' + o.y.toFixed(1)).join('L'), s: q[0], e: q[n], as: ang(q[0], q[1]), ae: ang(q[n - 1], q[n]), len: b - a, at: t => p.getPointAtLength(a + t), pts: q.map(o => [o.x, o.y]) };
}
function drawIllustrated(l, s) {
  K = 1;
  const PX = n => ({ x: 110 + n.x / 100 * 1120, y: 110 + n.y / 100 * 450 });
  const nodeById = id => l.nodes.find(x => x.id === id), P = id => PX(nodeById(id));
  const focus = new Set(s.focus || []), flows = s.flows || [], chips = (s.chips || []).filter(c => c && typeof c.text === 'string');
  const si = l.steps.indexOf(s), first = firstSeen(l);
  const prevFocus = !reducedMotion && lastDraw.slug === l.slug ? lastDraw.focus : null;
  lastDraw.slug = l.slug; lastDraw.focus = focus;
  const shown = l.nodes.filter(n => first[n.id] <= si), shownIds = new Set(shown.map(n => n.id));
  const slot = 1.15, T = Math.max(flows.length, 1) * slot + 0.9, key = (a, b) => [a, b].sort().join('|');
  const route = (ida, idb) => {
    const [i1, i2] = [ida, idb].sort(), a = P(i1), b = P(i2), dx = b.x - a.x, dy = b.y - a.y;
    const du = (dx / .866 + 2 * dy) / 2, dv = (2 * dy - dx / .866) / 2, m = { x: a.x + du * .866, y: a.y + du * .5 };
    const c = Math.hypot(dx, dy) || 1, off = Math.abs((m.x - a.x) * dy - (m.y - a.y) * dx) / c, s1 = Math.abs(du), s2 = Math.abs(dv), r = Math.min(26, s1 / 2, s2 / 2), nrm = [-dy / c, dx / c];
    if (off > 90 || r < 2) return { i1, i2, d: `M${a.x},${a.y}L${b.x},${b.y}`, mid: [(a.x + b.x) / 2, (a.y + b.y) / 2], n: nrm };
    const e1 = [Math.sign(du) * .866, Math.sign(du) * .5], e2 = [-Math.sign(dv) * .866, Math.sign(dv) * .5], h = (s1 + s2) / 2;
    return { i1, i2, d: `M${a.x},${a.y}L${m.x - r * e1[0]},${m.y - r * e1[1]}Q${m.x},${m.y} ${m.x + r * e2[0]},${m.y + r * e2[1]}L${b.x},${b.y}`, mid: h <= s1 ? [a.x + e1[0] * h, a.y + e1[1] * h] : [m.x + e2[0] * (h - s1), m.y + e2[1] * (h - s1)], n: nrm };
  };
  const hot = new Map(); flows.forEach(f => { const k = key(f.from, f.to), o = hot.get(k) || { kind: f.kind, to: new Set() }; o.to.add(f.to); hot.set(k, o); });
  const clsFor = (n, fs) => (fs.size ? (fs.has(n.id) ? ' focus' : ' dim') : '') + (first[n.id] === si && !reducedMotion ? ' rise' : '');
  const used = new Set(), rects = [], arrows = [], epts = [], nodeRect = {};
  let nodes = '', edges = '', over = '';
  const order = [...shown].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const n of order) {
    const { x, y } = PX(n), lap = n.kind === 'client', c1 = clsFor(n, focus), c0 = prevFocus ? clsFor(n, prevFocus) : c1;
    used.add(n.kind);
    let g = lap ? laptopSvg() : isCyl(n) ? cylSvg(n) : cubeSvg(n), nr;
    if (lap) {
      const p1 = pillSvg(0, -128, n.url || n.label, 'cdn'), p2 = pillSvg(-52, 124, n.you || 'you', 'user');
      g += p1.svg + p2.svg; rects.push([x - 126, y - 106, x + 126, y + 92], [x - p1.w / 2, y - 146, x + p1.w / 2, y - 110], [x - 52 - p2.w / 2, y + 106, x - 52 + p2.w / 2, y + 142]);
    nr = [x - 126, y - 146, x + 126, y + 142];
    } else if (isCyl(n)) {
      const pl = pillSvg(0, 0, n.label, KIND_ICON[n.kind], 'ipill', 36, 15), px = CRX + 14 + pl.w / 2, q = pillSvg(px, CTY + 4, n.label, KIND_ICON[n.kind]);
      g += q.svg; nr = [x - CRX - 4, y + CTY - CRY - 4, x + px + pl.w / 2 + 4, y + CBY + CRY + 6]; rects.push(nr);
    } else rects.push(nr = [x - IA - 4, y - IB - 4, x + IA + 4, y + IB + ID + 6]);
    nodeRect[n.id] = nr;
    nodes += `<g class="inode kind-${esc(n.kind)}${c0}"${c0 !== c1 ? ` data-c="${c1}"` : ''} transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><g class="body">${g}</g></g>`;
  }
  // edges: clipped to the block silhouettes (start/end just outside them) and drawn before the nodes, so they stay behind blocks
  const head = (pt, ang, cls) => { arrows.push([pt.x - 14, pt.y - 14, pt.x + 14, pt.y + 14]); return `<path class="iarrow${cls}" d="M-16,-8.5Q-15,-8 1,0Q-15,8 -16,8.5Z" transform="translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${ang.toFixed(1)})${cls.includes('idle') ? ' scale(.72)' : ''}"/>`; };
  const trims = {}, eIdx = new Map(), sil = id => p => { const n = nodeById(id), c = PX(n); return inSil(n, p.x - c.x, p.y - c.y); };
  let ei = 0;
  for (const e of l.edges) if (shownIds.has(e.from) && shownIds.has(e.to)) {
    const rt = route(e.from, e.to), h = hot.get(key(e.from, e.to)), tm = trims[key(e.from, e.to)] = trimPath(rt.d, sil(rt.i1), sil(rt.i2)), dests = h ? h.to : new Set([e.to]);
    const isNew = Math.max(first[e.from], first[e.to]) === si && !reducedMotion, cl = (h ? '' : ' idle') + (isNew ? ' fresh' : '');
    eIdx.set(key(e.from, e.to), ei++); epts.push(...tm.pts);
    edges += `<path class="iedge${h ? ' hot' : ''}${isNew ? ' fresh' : ''}" d="${tm.d}"/>`;
    for (const dst of dests) over += dst === rt.i2 ? head(tm.e, tm.ae, cl) : head(tm.s, tm.as + 180, cl);
  }
  flows.forEach((f, i) => {
    const rt = route(f.from, f.to), k = key(f.from, f.to), tm = trims[k]; if (!tm) return;
    const rev = f.from === rt.i1 ? 0 : 1, kp = rev ? '1;1;0;0' : '0;0;1;1';
    for (const dl of [0, 0.18]) {
      const t1 = ((i * slot + dl) / T).toFixed(3), t2 = ((i * slot + 0.95 + dl) / T).toFixed(3), kt = `0;${t1};${t2};1`;
      over += `<g class="ipacket k-${esc(f.kind)}${dl ? ' tail' : ''}" data-e="${eIdx.get(k)}" data-r="${rev}" data-i="${i}" data-d="${dl}" opacity="0"><animateMotion dur="${T}s" repeatCount="indefinite" path="${tm.d}" keyPoints="${kp}" keyTimes="${kt}" calcMode="spline" keySplines="0 0 1 1;.45 0 .2 1;0 0 1 1"/><animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" keyTimes="0;${t1};${t1};${t2};${t2};1" values="0;0;1;1;0;0" calcMode="discrete"/><circle r="6"/></g>`;
    }
  });
  // collision avoidance: every pill/chip/label gets a box; candidates are tried until the box keeps >= GAP from blocks, pills, chips, arrowheads and edge lines
  const GAP = 8, bx = (cx, cy, w, h) => [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
  const free = r => !rects.concat(arrows).some(q => r[0] < q[2] + GAP && r[2] > q[0] - GAP && r[1] < q[3] + GAP && r[3] > q[1] - GAP) && !epts.some(p => p[0] > r[0] - GAP && p[0] < r[2] + GAP && p[1] > r[1] - GAP && p[1] < r[3] + GAP);
  // node-anchored: try the wanted spot, then nudge vertically first, then sideways (nearest first)
  const NUDGE = []; for (let dy = -192; dy <= 192; dy += 12) for (let dx = -240; dx <= 240; dx += 12) NUDGE.push([dx, dy]);
  NUDGE.sort((a, b) => Math.hypot(a[0], a[1] * 1.6) - Math.hypot(b[0], b[1] * 1.6));
  const spot = (cx, cy, w, h) => { for (const [dx, dy] of NUDGE) if (free(bx(cx + dx, cy + dy, w, h))) return [cx + dx, cy + dy]; return [cx, cy]; };
  // line-anchored: beside the line (both sides, then further out), then slide along the line
  const along = (tm, w, h, sides) => {
    for (const al of [0, 40, -40, 80, -80, 120, -120, 170, -170]) {
      const s = tm.len / 2 + al; if (s < 20 || s > tm.len - 20) continue;
      const p = tm.at(s), a = tm.at(s - 2), b = tm.at(s + 2), tx = b.x - a.x, ty = b.y - a.y, tn = Math.hypot(tx, ty) || 1; let nx = -ty / tn, ny = tx / tn; if (ny > 0) { nx = -nx; ny = -ny; }
      for (let step = 0; step < 4; step++) for (const sd of sides) {
        const d = Math.abs(nx) * w / 2 + Math.abs(ny) * h / 2 + 14 + step * (h + 8), cx = p.x - sd * nx * d, cy = p.y - sd * ny * d;
        if (free(bx(cx, cy, w, h))) return [cx, cy];
      }
    }
    const m = tm.at(tm.len / 2); return [m.x, m.y + 44];
  };
  const slots = {}; let chipOut = '', lblOut = '';
  flows.forEach(f => {
    if (!f.label) return;
    const tm = trims[key(f.from, f.to)]; if (!tm) return;
    const pr = pillSvg(0, 0, f.label, null, 'iflabel', 36, 15), [mx, my] = along(tm, pr.w, 36, [1, -1]), q = pillSvg(mx, my, f.label, null, 'iflabel', 36, 15);
    lblOut += q.svg; rects.push(bx(mx, my, q.w, 36));
  });
  for (const c of chips) {
    const n = shownIds.has(c.node) && nodeById(c.node); if (!n || (c.at || '').startsWith('edge:')) continue;
    const at = c.at || 'top', sk = c.node + '|' + at, k = slots[sk] = (slots[sk] || 0) + 1, { x, y } = PX(n), lap = n.kind === 'client', probe = chipSvg(0, 0, c), dk = (k - 1) * 38;
    let cx, cy;
    if (at === 'right') { cx = x + (lap ? 135 : 96) + probe.w / 2; cy = y + (lap ? -30 : 0) + dk; }
    else if (at === 'left') { cx = x - (lap ? 135 : 96) - probe.w / 2; cy = y + (lap ? -30 : 0) + dk; }
    else if (at === 'bottom') { cx = x; cy = y + (lap ? 168 : 118) + dk; }
    else { cx = x + probe.w / 2 - 8; cy = y - (lap ? 176 : 80) - dk; }
    [cx, cy] = spot(cx, cy, probe.w, 32); const q = chipSvg(cx, cy, c); chipOut += q.svg; rects.push(bx(cx, cy, q.w, 32));
  }
  for (const c of chips) {
    const at = c.at || ''; if (!at.startsWith('edge:') || !shownIds.has(c.node)) continue;
    const [a, b] = at.slice(5).split('-'), tm = trims[key(a, b)]; if (!tm) continue;
    const probe = chipSvg(0, 0, c), [cx, cy] = along(tm, probe.w, 32, [-1, 1]), q = chipSvg(cx, cy, c); chipOut += q.svg; rects.push(bx(cx, cy, q.w, 32));
  }
  over += lblOut;
  const defs = [...used].map(k => `<g class="kind-${esc(k)}"><radialGradient id="ig-t-${esc(k)}" cx=".5" cy=".38" r=".75"><stop class="ga" offset="0"/><stop class="gb" offset="1"/></radialGradient><linearGradient id="ig-l-${esc(k)}" x1="0" y1="0" x2="0" y2="1"><stop class="gc" offset="0"/><stop class="gd" offset="1"/></linearGradient><linearGradient id="ig-r-${esc(k)}" x1="0" y1="0" x2="0" y2="1"><stop class="ge" offset="0"/><stop class="gf" offset="1"/></linearGradient></g>`).join('')
    + `<clipPath id="icl"><path d="${roundPoly(CUBE, 18)}"/></clipPath><clipPath id="ipl"><path d="${roundPoly([iso(-72, -72, 0), iso(72, -72, 0), iso(72, -72, -16), iso(72, 72, -16), iso(-72, 72, -16), iso(-72, 72, 0)], 24)}"/></clipPath>`;
  // camera: frame everything revealed so far (nodes + chips + labels)
  const dg = $('#diagram'), cw = dg.clientWidth, chh = dg.clientHeight, fit = matchMedia('(min-width:1281px)').matches && cw > 200 && chh > 100, asp = fit ? cw / chh : W / H;
  const rr = rects.length ? rects : [[0, 0, 100, 100]], x0 = Math.min(...rr.map(r => r[0])) - 36, x1 = Math.max(...rr.map(r => r[2])) + 36, y0 = Math.min(...rr.map(r => r[1])) - 30, y1 = Math.max(...rr.map(r => r[3])) + 36;
  let vw = Math.max(x1 - x0, 760), vh = y1 - y0; const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  if (vw / vh < asp) vw = vh * asp; else vh = vw / asp;
  const target = [mx - vw / 2, my - vh / 2, vw, vh];
  const desc = `${s.caption} Components: ${shown.map(n => n.label).join(', ')}.${flows.length ? ' Messages: ' + flows.map(f => `${nodeLabel(l, f.from)} to ${nodeLabel(l, f.to)}${f.label ? ' (' + f.label + ')' : ''}`).join('; ') + '.' : ''}${chips.length ? ' Status: ' + chips.map(c => `${nodeLabel(l, c.node)} ${c.text}`).join('; ') + '.' : ''}`;
  dg.innerHTML = `<svg id="svg" class="ill" viewBox="${target.map(v => v.toFixed(1)).join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="svg-title svg-desc"><title id="svg-title">${esc(l.title)} diagram</title><desc id="svg-desc">${esc(desc)}</desc><defs>${defs}</defs>${edges}${nodes}${over}${chipOut}</svg>`;
  const el = $('#svg');
  el.querySelectorAll('.ichip').forEach((c, i) => { c.style.animationDelay = (0.45 + i * 0.12) + 's'; });
  flyTo(el, target, l.slug);
  if (prevFocus) { el.getBoundingClientRect(); el.querySelectorAll('.inode[data-c]').forEach(n => n.setAttribute('class', `inode kind-${n.getAttribute('class').match(/kind-(\S+)/)[1]}${n.dataset.c}`)); }
  if (paused) { el.setCurrentTime(0.5); el.pauseAnimations(); }
  syncPause();
  // GSAP is loaded lazily; until (or unless) it is there, the SMIL/CSS renderer above stays in charge
  if (window.gsap) enhance(el); else loadGsap().then(ok => ok && enhance(el));
}
let gsapReady = null, tl = null;
function loadGsap() {
  return gsapReady ||= new Promise(res => {
    const ld = (f, ok) => { const s = document.createElement('script'); s.src = 'vendor/gsap/' + f; s.onload = ok; s.onerror = () => res(false); document.head.append(s); };
    ld('gsap.min.js', () => ld('MotionPathPlugin.min.js', () => { try { gsap.registerPlugin(MotionPathPlugin); res(true); } catch { res(false); } }));
  });
}
// one gsap timeline per step: blocks pop in, edges draw, packets travel, labels/chips rise in
function enhance(el) {
  const g = window.gsap; if (!g || $('#svg') !== el) return;
  el.querySelectorAll('.ipacket animateMotion,.ipacket animate').forEach(a => a.remove());
  el.classList.add('gs');
  if (reducedMotion) return; // end state only
  const q = s => [...el.querySelectorAll(s)], edgeEls = q('.iedge');
  tl = g.timeline();
  const bodies = q('.inode.rise .body');
  if (bodies.length) tl.fromTo(bodies, { scale: .4, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(1.7)', stagger: .12, clearProps: 'transform,opacity' });
  tl.addLabel('edges', bodies.length ? '>-0.1' : 0);
  q('.iedge.fresh').forEach(p => { const L = p.getTotalLength(); tl.fromTo(p, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .6, ease: 'power1.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 'edges'); });
  const heads = q('.iarrow.fresh'); if (heads.length) tl.fromTo(heads, { opacity: 0 }, { opacity: 1, duration: .25, clearProps: 'opacity' }, 'edges+=.45');
  tl.addLabel('packets', '>');
  q('.ipacket').forEach(p => {
    const at = `packets+=${(+p.dataset.i * .9 + +p.dataset.d).toFixed(2)}`, path = edgeEls[+p.dataset.e], rev = p.dataset.r === '1';
    if (!path) return;
    tl.set(p, { opacity: 1 }, at).to(p, { motionPath: { path, align: path, alignOrigin: [.5, .5], start: rev ? 1 : 0, end: rev ? 0 : 1 }, duration: .95, ease: 'power2.inOut' }, at).set(p, { opacity: 0 }, at + '+=.95');
  });
  const tags = q('.iflabel,.ichip'); if (tags.length) tl.fromTo(tags, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .4, ease: 'power2.out', stagger: .08, clearProps: 'transform,opacity' }, '>-0.05');
  if (paused) tl.progress(1).pause();
}
// step index at which each node first appears (focus or flow endpoint); never-referenced nodes appear at the last step
function firstSeen(l) {
  const f = {}, last = l.steps.length - 1;
  l.steps.forEach((st, k) => { for (const id of st.focus || []) f[id] ??= k; for (const x of st.flows || []) { f[x.from] ??= k; f[x.to] ??= k; } });
  for (const n of l.nodes) f[n.id] ??= last;
  return f;
}
const nodeLabel = (l, id) => (l.nodes.find(n => n.id === id) || {}).label || id;
function replay() { const el = $('#svg'); if (tl) tl.restart(); else if (el) el.setCurrentTime(0); if (paused) togglePause(); }
function togglePause() { const el = $('#svg'); paused = !paused; if (tl) { if (paused) tl.pause(); else if (tl.progress() === 1) tl.restart(); else tl.play(); } else if (el) paused ? el.pauseAnimations() : el.unpauseAnimations(); syncPause(); }
function syncPause() { const b = $('#pause'); $('#diagram').classList.toggle('paused', paused); if (b) { b.innerHTML = paused ? icon('play') + 'Play' : icon('pause') + 'Pause'; b.setAttribute('aria-pressed', String(paused)); } }
function blockLabel(label) {
  if (label.length <= 12 || !label.includes(' ')) return [label];
  const mid = label.length / 2; let best = -1;
  for (let k = 0; k < label.length; k++) if (label[k] === ' ' && (best < 0 || Math.abs(k - mid) < Math.abs(best - mid))) best = k;
  return [label.slice(0, best), label.slice(best + 1)];
}

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
// desktop sidebar rail (>=981px); the diagram re-fits when the grid transition ends
function syncSide(min) {
  document.body.classList.toggle('side-min', min); const b = $('#sidemin');
  b.setAttribute('aria-expanded', String(!min)); b.setAttribute('aria-label', min ? 'Expand course list' : 'Collapse course list');
}
function toggleSide() { const m = !document.body.classList.contains('side-min'); store.set('sideMin', m); syncSide(m); }
syncSide(!!store.get('sideMin', false));
$('#sidemin').addEventListener('click', toggleSide);
document.querySelector('.shell').addEventListener('transitionend', e => { if (e.target === e.currentTarget && e.propertyName === 'grid-template-columns' && cur.view === 'learn') { const l = bySlug[cur.slug]; drawDiagram(l, l.steps[cur.step]); } });
function closeDrawer() { document.body.classList.remove('drawer'); $('#menu').setAttribute('aria-expanded', 'false'); }
$('#menu').addEventListener('click', () => { const o = !document.body.classList.contains('drawer'); document.body.classList.toggle('drawer', o); $('#menu').setAttribute('aria-expanded', String(o)); if (o) $('#course a[aria-current], #course summary')?.focus(); });
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
  if (e.key === 'Escape' && document.body.classList.contains('drawer')) { closeDrawer(); $('#menu').focus(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || $('#search').open || e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (e.key === '[' && matchMedia('(min-width:981px)').matches) { e.preventDefault(); toggleSide(); return; }
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

// Shrink the guide text a step at a time until the panel fits without scrolling (desktop fit layout only).
function fitGuide() {
  const g = $('.guide'); if (!g) return;
  let size = 13; g.style.fontSize = '';
  const body = $('#g-body'); body.style.fontSize = '';
  const ch = $('#changes'); ch.hidden = false;
  const idea = $('.idea'); if (idea) idea.hidden = false;
  while (g.scrollHeight > g.clientHeight + 1 && size > 12) { size -= 0.5; body.style.fontSize = size + 'px'; }
  if (g.scrollHeight > g.clientHeight + 1) ch.hidden = true;
  while (g.scrollHeight > g.clientHeight + 1 && size > 11) { size -= 0.5; body.style.fontSize = size + 'px'; }
  if (idea && g.scrollHeight > g.clientHeight + 1) idea.hidden = true; // last resort at short viewports
}
addEventListener('resize', () => { if (cur.view === 'learn') fitGuide(); });

// Desktop lesson layout is tuned for a 1920px-wide viewport; scale it uniformly on smaller screens
// (e.g. 125% Windows scaling gives a 1536px viewport) so proportions stay identical.
function applyZoom() {
  const de = document.documentElement;
  const z = cur.view === 'learn' && innerWidth >= 1281 ? Math.max(0.66, Math.min(1, innerWidth / 1920)) : 1;
  de.style.zoom = z === 1 ? '' : String(z);
  de.style.setProperty('--z', String(z));
}
addEventListener('resize', applyZoom);
addEventListener('hashchange', applyZoom);
applyZoom();
