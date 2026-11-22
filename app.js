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
  drawIllustrated(l, s);
  $('#live').textContent = `Step ${i + 1} of ${n}: ${s.title}`;
  fitGuide();
}

function setMetric(m, v) {
  const el = document.getElementById('m-' + m.id);
  if (!el) return;
  const unit = m.unit ? ` ${m.unit}` : '';
  if (v == null) { el.textContent = '—'; shownMetrics[m.id] = null; return; }
  const prev = shownMetrics[m.id], from = parseFloat(prev), to = Number(v);
  shownMetrics[m.id] = v;
  if (prev !== v && !reducedMotion) { const box = el.parentElement; box.classList.remove('is-changed'); void box.offsetWidth; box.classList.add('is-changed'); }
  if (reducedMotion || !Number.isFinite(to) || !Number.isFinite(from) || from === to) { el.textContent = v + unit; return; }
  const t0 = performance.now(), dec = (v.split('.')[1] || '').length, dur = 900;
  const tick = t => { const p = Math.min((t - t0) / dur, 1), e = 1 - (1 - p) ** 3; if (shownMetrics[m.id] !== v) return; el.textContent = (p < 1 ? (from + (to - from) * e).toFixed(dec) : v) + unit; if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

// ---------- diagram: scene-graph renderer (iso blocks, grid layout, packets), numbers from evidence/animation-spec.md ----------
// A step is a full scene {ents, links, routes}; goTo(scene) diffs by id (exit / move / enter), the camera tweens its viewBox, packets spawn forever until the next step.
const NS = 'http://www.w3.org/2000/svg';
const ILL_ICON = { dns: 'cdn', cdn: 'external' };
function roundPoly(p, r) {
  return p.map((q, i) => {
    const pr = p[(i + p.length - 1) % p.length], nx = p[(i + 1) % p.length];
    const u = o => { const L = Math.hypot(o[0] - q[0], o[1] - q[1]), t = Math.min(r, L / 2) / L; return [q[0] + (o[0] - q[0]) * t, q[1] + (o[1] - q[1]) * t]; };
    const A = u(pr), B = u(nx);
    return `${i ? 'L' : 'M'}${A[0].toFixed(1)},${A[1].toFixed(1)}Q${q[0].toFixed(1)},${q[1].toFixed(1)} ${B[0].toFixed(1)},${B[1].toFixed(1)}`;
  }).join('') + 'Z';
}
const RT = { exit: 420, move: 820, enter: 680, draw: 560, stagger: 130 };
const EZ = { io: t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2, out: t => 1 - (1 - t) ** 3, back: t => 1 + 2.35 * (t - 1) ** 3 + 1.35 * (t - 1) ** 2 };
const c01 = t => t < 0 ? 0 : t > 1 ? 1 : t, lerp = (a, b, t) => a + (b - a) * t;
const jx = (x, y, z = 0) => [14 * (x + y), 7 * (x - y) - z]; // iso projection, 2:1
const RC = { // [top a, top b, side a, side b]
  orange: ['#fee6cc', '#fcd4ad', '#f9c697', '#f3b47f'], yellow: ['#fff3d6', '#fee7b8', '#fcdb9c', '#f6cd82'], blue: ['#e6f0fc', '#d0e2f8', '#bcd5f2', '#9fc2e8'],
  purple: ['#f1e8fc', '#e1d2f6', '#d3c1f0', '#bba2e6'], green: ['#e8f6df', '#d3edc5', '#c3e4b1', '#a5d28e'], slab: ['#fbf8f2', '#ece6da', '#ddd5c6', '#c9bfac']
};
const KCOL = { server: 'orange', service: 'orange', worker: 'green', gateway: 'blue', lb: 'blue', cache: 'yellow', dns: 'yellow', cdn: 'green', external: 'slab', client: 'slab', user: 'orange', db: 'purple', storage: 'purple', queue: 'purple', region: 'slab' };
const RTYPE = { client: 'device', user: 'user', db: 'db', storage: 'db', queue: 'queue', region: 'region' }, rxType = k => RTYPE[k] || 'block';
const PK = { req: { r: 4.3, f: '#f3b47f', s: '#211e1b', w: 1.5 }, slow: { r: 4.3, f: '#efb041', s: '#211e1b', w: 1.5 }, push: { r: 4.3, f: '#9fd28f', s: '#211e1b', w: 1.5 }, ping: { r: 3.6, f: '#f4fbef', s: '#2f8a43', w: 2.1 }, kill: { r: 3.6, f: '#fde3df', s: '#c0392b', w: 2.1 },
  msg: { q: 9.6, rx: 2.4, f: '#efb041', s: '#211e1b', w: 1.5 }, write: { q: 8.4, rx: 2, f: '#5d5466', s: '#211e1b', w: 1.5 } };
const PKIND = { handshake: 'ping', response: 'push', async: 'msg', replicate: 'write', fail: 'kill' }, LSTYLE = { fail: 'cut', async: 'dashed', replicate: 'dashed' };
const PKSPEED = { slow: .32, ping: .85 };
const REXT = { block: { top: -74, bot: 28, hw: 56 }, db: { top: -55, bot: 17, hw: 34 }, device: { top: -100, bot: 42, hw: 84 }, user: { top: -58, bot: 22, hw: 42 }, queue: { top: -48, bot: 34, hw: 68 }, region: { top: -42, bot: 42, hw: 84 } };
const ZL = { block: 120, db: 120, device: 40, user: 60, queue: 80, region: 0 };
const pinPoly = (x, y, pl) => { let c = false; for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) if ((pl[i][1] > y) !== (pl[j][1] > y) && x < (pl[j][0] - pl[i][0]) * (y - pl[i][1]) / (pl[j][1] - pl[i][1]) + pl[i][0]) c = !c; return c; };
const RX = { svg: null, slug: '', key: '', si: 0, sc: [], cams: [], cur: { ents: {}, links: {}, routes: [] }, ents: new Map(), links: new Map(), pks: [], fxs: [], flows: [], vb: [0, 0, 900, 520], camTw: null, end: 0, settled: true, spotIds: [], raf: 0, last: 0, W: 900, H: 520, L: {} };

// ---- layout: lessons without gx/gy get iso grid cells from each node's x,y (% of the 1000x560 canvas): invert j(), snap to a cell, then nudge colliding blocks (and linked blocks that leave no room for the link label) to the nearest free cell, left to right. gx/gy on a node pin it. ----
const RGS = [9, 6]; // canvas % -> screen px
const rxSplit = s => { const w = s.split(' '); if (w.length < 3) return w.length > 1 ? [w[0], w[1]] : [s]; let k = 1, d = 1e9; for (let i = 1; i < w.length; i++) { const e = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length); if (e < d) { d = e; k = i; } } return [w.slice(0, k).join(' '), w.slice(k).join(' ')]; };
const rxPillLabel = n => { const t = rxType(n.kind); return t === 'db' ? rxSplit(n.label).some(w => w.length > 10) : t !== 'block'; }; // blocks and short db names carry their name on the body, everything else gets a name pill below
function rxTags(n, s) {
  const tags = []; if (n.url) tags.push({ text: n.url });
  if (rxPillLabel(n)) tags.push({ text: n.label, tone: 'gray', below: true });
  for (const c of s.chips || []) if (c.node === n.id && typeof c.text === 'string') tags.push({ text: c.text, tone: c.tone || 'paper', cpu: c.kind === 'progress' ? +c.value || 0 : undefined, below: c.at === 'bottom' });
  return tags;
}
function rxGrid(l) {
  const lw = {}, fp = {}, pos = {}, placed = [];
  for (const s of l.steps) { const seen = {}; for (const f of s.flows || []) { const k = [f.from, f.to].sort().join('|'); if (!seen[k]) { seen[k] = 1; lw[k] = Math.max(lw[k] || 0, f.label ? f.label.length * 5.8 + 18 : 0); } } }
  for (const n of l.nodes) { // footprint = body + the most pills ever stacked above / below it, same in every step
    let up = 0, dn = 0, wd = 0; for (const s of l.steps) { const t = rxTags(n, s); up = Math.max(up, t.filter(q => !q.below).length); dn = Math.max(dn, t.filter(q => q.below).length); for (const q of t) wd = Math.max(wd, pw(q)); }
    const x = REXT[rxType(n.kind)]; fp[n.id] = [Math.max(x.hw, wd / 2) + 8, x.top - (up ? 8 + up * 26 : 0) - 8, x.bot + (dn ? 8 + dn * 26 : 0) + 8];
  }
  const rect = (n, c) => { const [X, Y] = jx(c[0], c[1]), f = fp[n.id]; return [X - f[0], Y + f[1], X + f[0], Y + f[2]]; };
  const clash = (n, c) => placed.some(p => { // overlap, or linked blocks with less room than the label needs (side by side, or stacked)
    const a = rect(n, c), b = rect(p, pos[p.id]), k = [n.id, p.id].sort().join('|'), need = k in lw ? [lw[k] + 12, lw[k] ? 37 : 12] : [0, 0];
    return Math.max(a[0] - b[2], b[0] - a[2]) < need[0] && Math.max(a[1] - b[3], b[1] - a[3]) < need[1];
  });
  const fixed = l.nodes.filter(n => n.gx != null && n.gy != null), rest = l.nodes.filter(n => !fixed.includes(n)).sort((a, b) => a.x - b.x || a.y - b.y);
  for (const n of fixed) { pos[n.id] = [n.gx, n.gy]; placed.push(n); }
  for (const n of rest) {
    const X = (n.x - 50) * RGS[0], Y = (n.y - 50) * RGS[1], g0 = Math.round((X / 14 + Y / 7) / 2), h0 = Math.round((X / 14 - Y / 7) / 2); let best = null;
    for (let R = 8; !best; R += 16) for (let a = g0 - R; a <= g0 + R; a++) for (let b = h0 - R; b <= h0 + R; b++) {
      if (clash(n, [a, b])) continue;
      const [cx, cy] = jx(a, b); let cost = Math.hypot(cx - X, cy - Y);
      for (const p of placed) { const px = jx(...pos[p.id])[0]; if ((p.x < n.x - 1 && px > cx + 14) || (p.x > n.x + 1 && px < cx - 14)) cost += 300; } // keep left-to-right order
      if (!best || cost < best.cost) best = { cost, c: [a, b] };
    }
    pos[n.id] = best.c; placed.push(n);
  }
  return pos;
}
// how many sample points of a polyline run through the bodies of other nodes (used to pick the better of the two elbows)
function rxCross(l, pos, ids, pts) {
  let c = 0; for (let i = 1; i < pts.length; i++) for (let t = 0; t < 1; t += .1) {
    const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t;
    for (const n of l.nodes) if (!ids.includes(n.id)) { const [cx, cy] = jx(...pos[n.id]), e = REXT[rxType(n.kind)]; if (Math.abs(x - cx) < e.hw - 6 && y > cy + e.top + 6 && y < cy + e.bot - 6) c++; }
  }
  return c;
}
// scenes: one per step, built from the lesson JSON (chips become pills; flows become routes)
function rxScenes(l) {
  const first = firstSeen(l), seen = new Map(), key = (a, b) => [a, b].sort().join('|'), nd = id => l.nodes.find(n => n.id === id), pos = rxGrid(l), auto = l.nodes.some(n => n.gx == null || n.gy == null);
  return l.steps.map((s, i) => {
    const ents = {}, links = {}, flows = s.flows || [];
    for (const n of l.nodes) if (first[n.id] <= i) { const t = rxType(n.kind); ents[n.id] = { id: n.id, type: t, color: KCOL[n.kind] || 'orange', kind: n.kind, label: n.label, x: pos[n.id][0], y: pos[n.id][1], tags: rxTags(n, s) }; }
    const now = new Map();
    for (const f of flows) {
      const k = key(f.from, f.to); (now.get(k) || now.set(k, []).get(k)).push(f);
      if (!seen.has(k)) {
        const A = pos[f.from], B = pos[f.to]; let via = A[0] !== B[0] && A[1] !== B[1] ? [B[0], A[1]] : null;
        if (via && auto) { const v2 = [A[0], B[1]], pt = v => [A, v, B].map(q => jx(...q)), ids = [f.from, f.to]; if (rxCross(l, pos, ids, pt(v2)) < rxCross(l, pos, ids, pt(via))) via = v2; }
        seen.set(k, { a: f.from, b: f.to, via });
      }
    }
    for (const [k, v] of seen) {
      const fs = now.get(k), st = fs ? new Set(fs.map(f => LSTYLE[f.kind] || 'solid')) : null;
      links[k] = { id: k, a: v.a, b: v.b, via: v.via, style: !fs ? (flows.length ? 'off' : 'solid') : st.size === 1 ? [...st][0] : 'solid', heads: fs && fs.some(f => f.kind === 'handshake') ? 'both' : 'end', label: fs && fs[0].label || '' };
    }
    // routes: a request/response pair over the same links is one packet that bounces; a chain is walked link by link
    const fl = flows.map(f => ({ link: key(f.from, f.to), rev: seen.get(key(f.from, f.to)).a !== f.from, kind: f.kind, pkt: f.pkt, from: f.from, to: f.to })), n = fl.length;
    const chain = a => a.every((x, k) => !k || a[k - 1].to === x.from), pal = n >= 2 && n % 2 === 0 && fl.every((x, k) => x.link === fl[n - 1 - k].link && x.rev !== fl[n - 1 - k].rev);
    const mk = (legs, bounce) => { const f0 = legs[0], kind = f0.pkt || PKIND[f0.kind] || 'req'; return { legs: legs.map(x => ({ link: x.link, rev: x.rev })), bounce, kind, fail: legs[legs.length - 1].kind === 'fail', rate: kind === 'ping' ? 1.3 : .8, speed: 1, hold: kind === 'slow' && bounce ? .8 : 0 }; };
    const routes = !n ? [] : pal ? [mk(fl.slice(0, n / 2), true)] : chain(fl) ? [mk(fl, false)] : fl.map(x => mk([x], false));
    return { ents, links, routes, title: s.caption };
  });
}
const rxExt = e => REXT[e.type];
const rxBox = e => { const [cx, cy] = jx(e.x, e.y), x = rxExt(e), up = e.tags.filter(t => !t.below).length, dn = e.tags.filter(t => t.below).length, hw = Math.max(x.hw, 60, ...e.tags.map(t => pw(t) / 2)); return [cx - hw, cy + x.top - (up ? 8 + up * 26 : 0), cx + hw, cy + x.bot + (dn ? 8 + dn * 26 : 0)]; };
function rxSil(e) {
  const [cx, cy] = jx(e.x, e.y), sh = pl => pl.map(p => [cx + p[0], cy + p[1]]);
  if (e.type === 'block') return [sh([[-56, -46], [0, -74], [56, -46], [56, 0], [0, 28], [-56, 0]])];
  if (e.type === 'db') { const q = []; for (let i = 0; i <= 16; i++) { const t = Math.PI + Math.PI * i / 16; q.push([33.66 * Math.cos(t), -38 + 16.83 * Math.sin(t)]); } for (let i = 0; i <= 16; i++) { const t = Math.PI * i / 16; q.push([33.66 * Math.cos(t), 16.83 * Math.sin(t)]); } return [sh(q)]; }
  if (e.type === 'user') return [sh([[-42, -8], [0, -29], [42, -8], [42, 0], [0, 21], [-42, 0]]), sh([[-12, -8], [-12, -56], [12, -56], [12, -8]])];
  if (e.type === 'queue') return [sh([[-67.2, -3.6], [16.8, -45.6], [67.2, -20.4], [67.2, -8.4], [-16.8, 33.6], [-67.2, 8.4]])];
  if (e.type === 'region') return [sh([[-84, 0], [0, -42], [84, 0], [0, 42]])];
  return [sh([[-84, -16], [0, -58], [84, -16], [84, 0], [0, 42], [-84, 0]]), sh([[-2.4, -2.4, 19], [-2.4, 2.4, 19], [-2.4, 2.4, 66], [-2.4, -2.4, 66]].map(([x, y, z]) => jx(x, y, z)))];
}
const pw = t => t.cpu != null ? 86 : t.text.length * 6.3 + 18, PH = 21;
function rxPillSvg(t, cx, cy, size = 10.5, cpu = t.cpu) {
  const w = pw(t), x = cx - w / 2, y = cy - PH / 2, tone = t.tone || 'paper';
  let g = `<g class="pl t-${tone}"><rect class="sh" x="${x.toFixed(1)}" y="${(y + 2).toFixed(1)}" width="${w.toFixed(1)}" height="${PH}" rx="10.5"/><rect class="bg" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${PH}" rx="10.5"/>`;
  if (cpu != null) {
    const v = Math.max(0, Math.min(100, cpu)), col = v < 60 ? '#7fc278' : v < 85 ? '#efb041' : '#e5534b';
    g += `<text x="${(x + 9).toFixed(1)}" y="${(cy + 3.7).toFixed(1)}" font-size="${size}">cpu</text><rect class="bar" x="${(x + 33).toFixed(1)}" y="${(cy - 3.5).toFixed(1)}" width="28" height="7" rx="3.5"/><rect x="${(x + 33).toFixed(1)}" y="${(cy - 3.5).toFixed(1)}" width="${Math.max(2, 28 * v / 100).toFixed(1)}" height="7" rx="3.5" fill="${col}"/><text x="${(x + 66).toFixed(1)}" y="${(cy + 3.7).toFixed(1)}" font-size="${size}">${Math.round(v)}%</text>`;
  } else g += `<text x="${cx.toFixed(1)}" y="${(cy + size * .35).toFixed(1)}" font-size="${size}" text-anchor="middle">${esc(t.text)}</text>`;
  return g + '</g>';
}
// pills for an entity: stacked 26 px apart above (or below) the block; positions are local to the entity's ground centre
function rxPills(e, tags, cpu) {
  const x = rxExt(e); let u = 0, d = 0, s = '';
  for (const t of tags) { const cy = t.below ? x.bot + 8 + 10.5 + 26 * d++ : x.top - 8 - 10.5 - 26 * u++; s += rxPillSvg(t, 0, cy, 10.5, t.cpu != null ? cpu : undefined); }
  return s;
}
function rxBody(e) {
  const c = e.color, cid = 'cp-' + e.id, ico = I[ILL_ICON[e.kind] || KIND_ICON[e.kind]] || I.service;
  const prism = (hw, h, col, id, ol = 'ol') => {
    const hh = hw / 2, sil = roundPoly([[-hw, -h], [0, -hh - h], [hw, -h], [hw, 0], [0, hh], [-hw, 0]], 9), top = roundPoly([[-hw, -h], [0, -hh - h], [hw, -h], [0, hh - h]], 10);
    const sheen = roundPoly([[-hw * .74, -h - 1], [0, -h - hh * .74 - 1], [hw * .74, -h - 1], [0, -h + hh * .74 - 1]], 8);
    return `<clipPath id="${id}"><path d="${sil}"/></clipPath><path d="${sil}" fill="url(#rx-s-${col})"/><path d="M${hw},${-h}L0,${hh - h}L0,${hh}L${hw},0Z" clip-path="url(#${id})" fill="#3a2a14" fill-opacity=".05"/><path d="${top}" fill="url(#rx-t-${col})"/>`
      + `<path d="${sheen}" fill="#fff" fill-opacity=".22" filter="url(#rx-b2)"/><path d="M${-hw},${1.4 - h}L0,${hh - h + 1.4}L${hw},${1.4 - h}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="M${-hw},${3.4 - h}L0,${hh - h + 3.4}L${hw},${3.4 - h}" fill="none" stroke="#5a4123" stroke-opacity=".07" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path class="${ol}" d="${sil}"/>`;
  };
  const prs = (x0, x1, y0, y1, z0, z1, col) => { // flat box in grid space: top + the two faces that face the camera
    const P = (x, y, z) => jx(x, y, z).map(v => v.toFixed(1)).join(','), q = a => 'M' + a.map(p => P(...p)).join('L') + 'Z';
    return `<path d="${q([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" fill="url(#rx-s-${col})"/><path d="${q([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]])}" fill="url(#rx-s-${col})"/><path d="${q([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])}" fill="url(#rx-t-${col})"/><path class="ol2" d="${q([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])}"/><path class="ol2" d="${q([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}"/><path class="ol2" d="${q([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]])}"/>`;
  };
  if (e.type === 'db') {
    const rx = 33.66, ry = rx / 2, h = 38, body = `M${-rx},${-h}L${-rx},0A${rx},${ry} 0 0 0 ${rx},0L${rx},${-h}`;
    return `<path d="${body}Z" fill="url(#rx-s-${c})"/><path d="${body}Z" fill="url(#rx-cs)"/><ellipse cy="${-h}" rx="${rx}" ry="${ry}" fill="url(#rx-t-${c})"/><ellipse cy="${-h - 1}" rx="${rx * .6}" ry="${ry * .5}" fill="#fff" fill-opacity=".22" filter="url(#rx-b2)"/><path class="ol" d="${body}"/><ellipse class="ol" cy="${-h}" rx="${rx}" ry="${ry}"/>`
      + `<g class="gl" transform="translate(-8,${-h - 8}) scale(.667)">${ico}</g>${rxPillLabel(e) ? '' : rxSplit(e.label).length > 1 ? rxSplit(e.label).map((t, i) => `<text class="bl" y="${i ? -4 : -15}" font-size="10">${esc(t)}</text>`).join('') : `<text class="bl" y="-10" font-size="${Math.min(12, 60 / (e.label.length * .6)).toFixed(1)}">${esc(e.label)}</text>`}`;
  }
  if (e.type === 'device') {
    const sy = 2.2, pxs = 14 * sy;
    return prism(84, 16, 'slab', cid, 'ol2') + prs(-2.8, 2.4, -2.3, 2.3, 16, 19, 'slab') + prs(-2.6, -2.2, -sy - .2, sy + .2, 19, 66, 'slab')
      + `<g transform="matrix(1 -.5 0 1 ${(14 * -2.2).toFixed(1)} ${(7 * -2.2).toFixed(1)})"><rect x="${-pxs + 2}" y="-64" width="${2 * pxs - 4}" height="43" rx="2" fill="#f6f1e6"/><rect x="${-pxs + 2}" y="-64" width="${2 * pxs - 4}" height="8" rx="2" fill="#e4dccb"/>`
      + `<circle cx="${-pxs + 8}" cy="-60" r="1.8" fill="#E5534B"/><circle cx="${-pxs + 14}" cy="-60" r="1.8" fill="#EFB041"/><circle cx="${-pxs + 20}" cy="-60" r="1.8" fill="#7FC278"/><rect x="${-pxs + 8}" y="-48" width="${pxs}" height="5" rx="2.5" fill="#d9cfb8"/><rect x="${-pxs + 8}" y="-39" width="${pxs * 1.3}" height="5" rx="2.5" fill="#e4dccb"/><rect x="${-pxs + 8}" y="-30" width="${pxs * .8}" height="5" rx="2.5" fill="#e4dccb"/></g>`;
  }
  if (e.type === 'user') {
    const h = 36, rx = 11, ry = 5.5, body = `M${-rx},${-h}L${-rx},-8A${rx},${ry} 0 0 0 ${rx},-8L${rx},${-h}`;
    return prism(42, 8, 'slab', cid, 'ol2') + `<path d="${body}Z" fill="url(#rx-s-${c})"/><path d="${body}Z" fill="url(#rx-cs)"/><ellipse cy="${-h}" rx="${rx}" ry="${ry}" fill="url(#rx-t-${c})"/><path class="ol" d="${body}"/><ellipse class="ol" cy="${-h}" rx="${rx}" ry="${ry}"/>`
      + `<circle cy="-46" r="9" fill="url(#rx-t-${c})"/><circle class="ol" cy="-46" r="9"/><ellipse cx="-3" cy="-49" rx="3" ry="2" fill="#fff" fill-opacity=".5"/>`;
  }
  if (e.type === 'queue') { let q = ''; for (let i = 0; i < 4; i++) q += prs(-1.8, 1.8, 1.8 - 1.6 * i, 3 - 1.6 * i, 0, 12, c); return q; }
  if (e.type === 'region') { const d = roundPoly([[-84, 0], [0, -42], [84, 0], [0, 42]], 12); return `<path d="${d}" fill="url(#rx-t-${c})" fill-opacity=".55"/><path class="ol2" d="${d}" stroke-dasharray="7 5"/><g class="gl" transform="translate(-9,-9) scale(.75)">${ico}</g>`; }
  const [l1, l2 = ''] = rxSplit(e.label), f1 = Math.min(13.5, 98 / (l1.length * .66)), f2 = Math.min(10, 98 / (l2.length * .62 || 1));
  return prism(56, 46, c, cid) + `<g class="gl" transform="translate(-7,-69) scale(.583)">${ico}</g><text class="bl" y="-44" font-size="${f1.toFixed(1)}">${esc(l1)}</text>` + (l2 ? `<text class="bl s2" y="-33" font-size="${f2.toFixed(1)}">${esc(l2)}</text>` : '');
}
const rxDefs = () => {
  let s = '<filter id="rx-b6" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6.5"/></filter><filter id="rx-b2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>'
    + '<linearGradient id="rx-cs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3a2a14" stop-opacity=".12"/></linearGradient>'
    + '<pattern id="rx-grid" width="28" height="14" patternUnits="userSpaceOnUse"><path class="gr" d="M0,0L14,7L28,0M14,7L0,14M14,7L28,14"/></pattern>'
    + '<radialGradient id="rx-fg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".42" stop-color="#fff" stop-opacity=".92"/><stop offset=".78" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
    + '<mask id="rx-fm" maskUnits="userSpaceOnUse" x="-1400" y="-840" width="2800" height="1680"><rect x="-1400" y="-840" width="2800" height="1680" fill="url(#rx-fg)"/></mask>'
    + '<marker id="rx-ar" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="5.2" markerHeight="5.2" orient="auto-start-reverse"><path class="ah" d="M1,1.2L9,5L1,8.8z"/></marker><marker id="rx-ar-off" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="5.2" markerHeight="5.2" orient="auto-start-reverse"><path class="ah off" d="M1,1.2L9,5L1,8.8z"/></marker>';
  for (const [c, v] of Object.entries(RC)) s += `<linearGradient id="rx-t-${c}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${v[0]}"/><stop offset="1" stop-color="${v[1]}"/></linearGradient><linearGradient id="rx-s-${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v[2]}"/><stop offset="1" stop-color="${v[3]}"/></linearGradient>`;
  return s;
};
// ---- links: grid points -> rounded polyline (r 9), trimmed 3 px outside the source and 4 px before the target outline ----
function rxLinkGeom(lk, sc) {
  const A = sc.ents[lk.a], B = sc.ents[lk.b], g = (x, y) => jx(x, y), p = [g(A.x, A.y), ...(lk.via ? [g(...lk.via)] : []), g(B.x, B.y)];
  let d = 'M' + p[0].join(',');
  for (let i = 1; i < p.length - 1; i++) { const a = p[i - 1], b = p[i], c = p[i + 1], r = 9, u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]], lu = Math.hypot(...u), lv = Math.hypot(...v); d += `L${(b[0] + u[0] / lu * r).toFixed(1)},${(b[1] + u[1] / lu * r).toFixed(1)}Q${b[0]},${b[1]} ${(b[0] + v[0] / lv * r).toFixed(1)},${(b[1] + v[1] / lv * r).toFixed(1)}`; }
  d += 'L' + p[p.length - 1].join(',');
  const t = document.createElementNS(NS, 'path'); t.setAttribute('d', d);
  const L = t.getTotalLength(), sa = rxSil(A), sb = rxSil(B), ins = (q, s) => s.some(pl => pinPoly(q.x, q.y, pl));
  let a = 0, b = L; while (a < L / 2 && ins(t.getPointAtLength(a), sa)) a++; while (b > L / 2 && ins(t.getPointAtLength(b), sb)) b--;
  a += 3; b -= lk.heads === 'none' ? 3 : 4;
  const n = Math.max(2, Math.ceil((b - a) / 2)), q = []; for (let i = 0; i <= n; i++) { const o = t.getPointAtLength(a + (b - a) * i / n); q.push([o.x, o.y]); }
  return { d: 'M' + q.map(o => o[0].toFixed(1) + ',' + o[1].toFixed(1)).join('L'), pts: q };
}
// link labels: candidate slots along the path on 4 sides (two distances), lowest overlap cost wins; the rectangles are kept on the scene so the camera can frame them
function rxPlaceLabels(sc) {
  const boxes = [], obst = Object.values(sc.ents).map(e => { const [cx, cy] = jx(e.x, e.y), x = rxExt(e); return [cx - x.hw, cy + x.top, cx + x.hw, cy + x.bot]; }), pos = {};
  for (const e of Object.values(sc.ents)) { const [cx, cy] = jx(e.x, e.y), x = rxExt(e); let u = 0, d = 0; for (const t of e.tags) { const w = pw(t), yy = t.below ? cy + x.bot + 8 + 10.5 + 26 * d++ : cy + x.top - 8 - 10.5 - 26 * u++; boxes.push([cx - w / 2, yy - 10.5, cx + w / 2, yy + 10.5]); } }
  const geo = Object.values(sc.links).map(k => RX.L[k.id] || (RX.L[k.id] = rxLinkGeom(k, sc))), lap = (r, q, mg) => r[0] < q[2] + mg && r[2] > q[0] - mg && r[1] < q[3] + mg && r[3] > q[1] - mg, clash = r => obst.some(o => lap(r, o, 2)) || boxes.some(o => lap(r, o, 2));
  for (const k of Object.values(sc.links)) {
    if (!k.label) continue;
    const g = RX.L[k.id], w = k.label.length * 5.8 + 18, h = PH, n = g.pts.length;
    const run = (F, M, mg, oc) => { let best = null; // first pass keeps the plain 7 slots; if that still collides, retry with more slots, a second distance and a safety margin
      for (const f of F) {
        const i = Math.min(n - 2, Math.max(0, Math.round(f * (n - 1)))), P = g.pts[i];
        for (const m of M) for (const [dx, dy] of [[0, -(h / 2 + 7 + m)], [0, h / 2 + 7 + m], [-(w / 2 + 7 + m), 0], [w / 2 + 7 + m, 0]]) {
          const r = [P[0] + dx - w / 2, P[1] + dy - h / 2, P[0] + dx + w / 2, P[1] + dy + h / 2], ov = q => lap(r, q, mg); let cost = Math.abs(f - .5) * 60 + (dx ? 12 : 0) + m;
          for (const o of obst) if (ov(o)) cost += oc[0]; for (const o of boxes) if (ov(o)) cost += oc[1];
          for (const gg of geo) for (let q = 0; q < gg.pts.length; q += 4) { const o = gg.pts[q]; if (o[0] > r[0] - 3 && o[0] < r[2] + 3 && o[1] > r[1] - 3 && o[1] < r[3] + 3) cost += 18; }
          if (!best || cost < best.cost) best = { cost, x: P[0] + dx, y: P[1] + dy, r };
        }
      }
      return best;
    };
    let best = run([.5, .4, .6, .3, .7, .2, .8], [0], 0, [170, 90]);
    if (clash(best.r)) { const b2 = run([.5, .4, .6, .3, .7, .2, .8, .1, .9], [0, 16, 32, 48, 64, 80], 2, [400, 400]); if (!clash(b2.r)) best = b2; }
    pos[k.id] = [best.x, best.y]; boxes.push(best.r);
  }
  sc.lr = boxes.slice(boxes.length - Object.keys(pos).length);
  return pos;
}
// camera: zoom fits the bounds (16 px margin, snapped down to .05, cap 1.6); the previous camera is kept while the new bounds still fit
function rxPlan(sc, prev) {
  const bs = Object.values(sc.ents).map(rxBox); if (!bs.length) return prev || { cx: 0, cy: 0, z: 1 };
  // extra room around the blocks for link labels and pills that hang off the lines
  const lr = sc.lr || [], x0 = Math.min(...bs.map(b => b[0]) .map(v => v - 40), ...lr.map(r => r[0] - 8)), y0 = Math.min(...bs.map(b => b[1] - 12), ...lr.map(r => r[1] - 8)), x1 = Math.max(...bs.map(b => b[2] + 40), ...lr.map(r => r[2] + 8)), y1 = Math.max(...bs.map(b => b[3] + 48), ...lr.map(r => r[3] + 8)), { W, H } = RX, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (prev) { const vw = W / prev.z, vh = H / prev.z, pd = 12 / prev.z; if (x0 >= prev.cx - vw / 2 + pd && x1 <= prev.cx + vw / 2 - pd && y0 >= prev.cy - vh / 2 + pd && y1 <= prev.cy + vh / 2 - pd && Math.abs(cx - prev.cx) < .15 * vw && Math.abs(cy - prev.cy) < .15 * vh) return prev; }
  return { cx, cy, z: Math.max(.3, Math.floor(Math.min(1.6, (W - 32) / (x1 - x0), (H - 32) / (y1 - y0)) / .05 + 1e-6) * .05) };
}
const rxVB = c => [c.cx - RX.W / c.z / 2, c.cy - RX.H / c.z / 2, RX.W / c.z, RX.H / c.z];
function rxFrame() { // plan every step up front so the camera stays stable between steps
  const dg = $('#diagram'); RX.W = dg.clientWidth > 100 ? dg.clientWidth : 900; RX.H = dg.clientHeight > 100 ? dg.clientHeight : 520;
  RX.L = {}; RX.sc.forEach(s => { s.lp = rxPlaceLabels(s); }); let p = null; RX.cams = RX.sc.map(s => p = rxPlan(s, p));
}
const rxSet = (el, a) => { for (const k in a) el.setAttribute(k, a[k]); return el; };
const rxMk = (n, a, p) => { const e = rxSet(document.createElementNS(NS, n), a || {}); if (p) p.append(e); return e; };
function rxMount(l) {
  const dg = $('#diagram'); cancelAnimationFrame(RX.raf);
  RX.slug = l.slug; RX.sc = rxScenes(l); rxFrame(); RX.key = ''; RX.ents = new Map(); RX.links = new Map(); RX.pks = []; RX.fxs = []; RX.flows = []; RX.cur = { ents: {}, links: {}, routes: [] }; RX.settled = true; RX.camTw = null; RX.spotIds = [];
  dg.innerHTML = `<svg id="svg" class="rx" viewBox="0 0 ${RX.W} ${RX.H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(l.title)} diagram" aria-describedby="svg-desc"><desc id="svg-desc"></desc><defs>${rxDefs()}</defs><g id="rx-floor"><rect x="-1400" y="-840" width="2800" height="1680" fill="url(#rx-grid)" mask="url(#rx-fm)"/></g><g id="rx-links"></g><g id="rx-pk"></g><g id="rx-ents"></g><g id="rx-over"></g></svg>`;
  RX.svg = $('#svg'); RX.last = performance.now(); RX.raf = requestAnimationFrame(rxTick);
}
// ---- goTo: diff the new scene against what is on screen, schedule tweens ----
function rxGo(si, instant) {
  const R = RX, sc = R.sc[si], now = performance.now(), prev = R.cur, k = instant ? 0 : 1; R.si = si; R.cur = sc;
  const removed = [], changed = [], added = [];
  for (const [id, e] of R.ents) if (!e.dying && !sc.ents[id]) removed.push(id);
  for (const id in sc.ents) { const e = R.ents.get(id); if (e && e.dying) { e.g.remove(); e.o.remove(); R.ents.delete(id); } const o = R.ents.get(id); if (!o) added.push(id); else if (JSON.stringify(o.spec) !== JSON.stringify(sc.ents[id])) changed.push(id); }
  const ex = removed.length > 0, c = ex ? .55 * RT.exit * k : 0, lead = (changed.length ? c + .75 * RT.move : ex ? .7 * RT.exit : 0) * k;
  added.sort((a, b) => (sc.ents[a].x - sc.ents[a].y) - (sc.ents[b].x - sc.ents[b].y) || sc.ents[a].x - sc.ents[b].x);
  let end = 0; const done = {};
  removed.forEach(id => { const e = R.ents.get(id); e.dying = true; e.tw = { k: 'exit', t0: now, dur: RT.exit * k, l0: e.lift }; end = Math.max(end, RT.exit * k); });
  changed.forEach(id => { const e = R.ents.get(id), s = sc.ents[id]; e.tw = { k: 'move', t0: now + c, dur: RT.move * k, from: { x: e.x, y: e.y, cpu: e.cpu, lift: e.lift }, to: s, tagsTo: s.tags, swapped: false }; e.spec = s; end = Math.max(end, c + RT.move * k); });
  added.forEach((id, i) => {
    const s = sc.ents[id], g = rxMk('g', { opacity: 0 }, $('#rx-ents')), o = rxMk('g', { opacity: 0 }, $('#rx-over')), sh = rxMk('g', {}, g), bd = rxMk('g', {}, g);
    sh.innerHTML = rxShadow(s); bd.innerHTML = rxBody(s);
    const dl = lead + i * RT.stagger * k; done[id] = dl + .8 * RT.enter * k;
    R.ents.set(id, { id, spec: s, x: s.x, y: s.y, cpu: (s.tags.find(t => t.cpu != null) || {}).cpu, lift: 0, tags: s.tags, g, bd, sh, o, tw: { k: 'enter', t0: now + dl, dur: RT.enter * k, l0: ZL[s.type] }, dying: false }); end = Math.max(end, dl + RT.enter * k);
  });
  // sort entities back to front
  [...R.ents.values()].sort((a, b) => (a.spec.x - a.spec.y) - (b.spec.x - b.spec.y) || a.spec.x - b.spec.x).forEach(e => $('#rx-ents').append(e.g));
  // links: existing ones only change style, missing ones fade out, new ones draw in
  const lblPos = sc.lp; let p = 0;
  for (const [id, lk] of R.links) if (!sc.links[id]) { lk.rm = now; end = Math.max(end, 300 * k); }
  for (const id in sc.links) {
    const s = sc.links[id], old = R.links.get(id), g = R.L[id] || (R.L[id] = rxLinkGeom(s, sc));
    if (old && !old.rm) { if (old.spec.label !== s.label) { old.lt.textContent = s.label; old.lbl.setAttribute('opacity', 0); old.lw = now; } old.spec = s; old.lpos = lblPos[id]; rxLinkStyle(old); rxLabelPlace(old, s, lblPos[id]); continue; }
    const ed = n => done[n] || 0, a = (Math.max(ed(s.a), ed(s.b), c + (changed.length ? .6 * RT.move * k : 0)) + 60 * k + p++ * 90 * k);
    const path = rxMk('path', { class: 'lk', d: g.d, fill: 'none' }, $('#rx-links')), len = path.getTotalLength(), lbl = rxMk('g', { class: 'pl t-paper', opacity: 0 }, $('#rx-over')), lt = rxMk('text', { 'font-size': 9.5, 'text-anchor': 'middle' });
    const lk = { id, spec: s, path, len, d0: now + a, lbl, lt, lw: 0, g, done: false };
    lt.textContent = s.label; lbl.append(rxMk('rect', { class: 'sh' }), rxMk('rect', { class: 'bg' }), lt); R.links.set(id, lk); rxLinkStyle(lk); rxLabelPlace(lk, s, lblPos[id]); end = Math.max(end, a + RT.draw * k);
  }
  // camera
  const to = rxVB(R.cams[si]), cd = (ex ? .4 * RT.exit : 0) * k; R.camTw = { t0: now + cd, dur: RT.move * k, from: R.vb.slice(), to }; end = Math.max(end, cd + RT.move * k);
  // packets: the old ones fade out, flows restart (accumulator .6) once everything has settled
  for (const q of R.pks) if (!q.leave) q.leave = now;
  R.flows = reducedMotion ? [] : sc.routes.map(r => ({ r, acc: .6 })); R.end = now + end; R.settled = false; R.spotIds = instant ? [] : [...added, ...changed];
  R.svg.querySelector('desc').textContent = `${sc.title}. Components: ${Object.values(sc.ents).map(e => e.label).join(', ')}.`;
  if (instant) { for (const e of R.ents.values()) rxEnt(e, now + 1e6); for (const lk of R.links.values()) rxLink(lk, now + 1e6); R.vb = to; R.camTw = null; R.svg.setAttribute('viewBox', to.map(v => v.toFixed(2)).join(' ')); R.settled = true; }
}
const rxShadow = s => { if (s.type === 'region') return ''; const sil = rxSil(s)[0], [cx, cy] = jx(s.x, s.y); return `<path d="M${sil.map(q => (q[0] - cx).toFixed(1) + ',' + (q[1] - cy).toFixed(1)).join('L')}Z" fill="#6b5236" fill-opacity=".26" filter="url(#rx-b6)"/>`; };
function rxLinkStyle(lk) {
  const s = lk.spec, off = s.style === 'off';
  lk.path.setAttribute('class', 'lk ' + s.style); lk.path.setAttribute('marker-end', lk.drawn ? `url(#rx-ar${off ? '-off' : ''})` : '');
  if (s.heads === 'both') lk.path.setAttribute('marker-start', lk.drawn ? `url(#rx-ar${off ? '-off' : ''})` : ''); else lk.path.removeAttribute('marker-start');
}
function rxLabelPlace(lk, s, pos) {
  const lb = lk.lbl; lk.lpos = pos; lb.style.display = s.label && pos ? '' : 'none'; if (!s.label || !pos) return;
  const w = s.label.length * 5.8 + 18, [rs, rb] = lb.querySelectorAll('rect');
  rxSet(rs, { x: pos[0] - w / 2, y: pos[1] - PH / 2 + 2, width: w, height: PH, rx: 10.5 }); rxSet(rb, { x: pos[0] - w / 2, y: pos[1] - PH / 2, width: w, height: PH, rx: 10.5 }); rxSet(lk.lt, { x: pos[0], y: pos[1] + 3.3 });
}
// ---- per-frame state ----
function rxEnt(e, now) {
  const t = e.tw; let op = 1, pop = 1;
  if (t) {
    const p = t.dur ? c01((now - t.t0) / t.dur) : 1;
    if (t.k === 'enter') { op = pop = EZ.out(p); e.lift = t.l0 * (1 - EZ.back(p)); }
    else if (t.k === 'exit') { op = pop = 1 - EZ.io(p); e.lift = t.l0 - 22 * EZ.io(p); if (p >= 1) { e.g.remove(); e.o.remove(); RX.ents.delete(e.id); return; } }
    else {
      const q = EZ.io(p), f = t.from, s = t.to, cpu = (s.tags.find(u => u.cpu != null) || {}).cpu;
      e.x = lerp(f.x, s.x, q); e.y = lerp(f.y, s.y, q); e.lift = lerp(f.lift, 0, q); e.cpu = cpu == null ? f.cpu : f.cpu == null ? cpu : lerp(f.cpu, cpu, q);
      if (p >= .5 && !t.swapped) { t.swapped = true; e.tags = t.tagsTo; }
      pop = p < .42 ? 1 - p / .42 : p < .55 ? 0 : p < .95 ? (p - .55) / .4 : 1;
    }
    if (p >= 1) { if (t.k === 'move') { e.tags = t.tagsTo; e.cpu = (t.to.tags.find(u => u.cpu != null) || {}).cpu; e.x = t.to.x; e.y = t.to.y; } e.tw = null; e.lift = 0; if (t.k === 'enter') { op = pop = 1; } }
  }
  const [cx, cy] = jx(e.x, e.y), ls = Math.max(0, e.lift);
  e.g.setAttribute('opacity', op.toFixed(3)); e.bd.setAttribute('transform', `translate(${cx.toFixed(2)} ${(cy - e.lift).toFixed(2)})`);
  e.sh.setAttribute('transform', `translate(${cx.toFixed(2)} ${(cy + Math.min(9, 3 + 46 * .15)).toFixed(2)})`); e.sh.setAttribute('opacity', (1 / (1 + ls / 80)).toFixed(3));
  e.o.setAttribute('opacity', pop.toFixed(3)); e.o.setAttribute('transform', `translate(${cx.toFixed(2)} ${(cy - e.lift).toFixed(2)})`);
  const sig = e.tags === e.ts && e.cpu === e.cs ? 1 : 0; if (!sig) { e.o.innerHTML = rxPills(e.spec, e.tags, e.cpu); e.ts = e.tags; e.cs = e.cpu; }
}
function rxLink(lk, now) {
  let op = 1, draw = c01((now - lk.d0) / RT.draw), q = EZ.io(draw);
  if (lk.rm) { const p = c01((now - lk.rm) / 300); op = 1 - EZ.io(p); if (p >= 1) { lk.path.remove(); lk.lbl.remove(); RX.links.delete(lk.id); delete RX.L[lk.id]; return; } q = 1; }
  const off = lk.spec.style === 'off', pa = lk.path;
  if (!lk.drawn && q > .97) { lk.drawn = true; rxLinkStyle(lk); }
  if (draw >= 1 && !lk.settled) { lk.settled = true; pa.removeAttribute('stroke-dasharray'); pa.removeAttribute('stroke-dashoffset'); }
  if (!lk.settled) { if (off || lk.spec.style !== 'solid') pa.setAttribute('opacity', Math.min(1, q * 1.4).toFixed(3)); else { pa.setAttribute('stroke-dasharray', lk.len.toFixed(1)); pa.setAttribute('stroke-dashoffset', (lk.len * (1 - q)).toFixed(2)); } } else if (!lk.rm) pa.removeAttribute('opacity');
  if (lk.rm) pa.setAttribute('opacity', op.toFixed(3));
  let lo = lk.rm ? op : c01((q - .6) / .4); if (lk.lw) lo = Math.min(lo, c01((now - lk.lw) / 320)); lk.lbl.setAttribute('opacity', lo.toFixed(3));
}
function rxSettle() {
  const R = RX; R.settled = true;
  for (const id of R.spotIds) {
    const e = R.ents.get(id); if (!e || e.dying) continue; const [cx, cy] = jx(e.x, e.y), w = { device: 6, db: 3.4, user: 3, queue: 5, region: 6 }[e.spec.type] || 4, d = roundPoly([[cx - 14 * w, cy], [cx, cy - 7 * w], [cx + 14 * w, cy], [cx, cy + 7 * w]], 10);
    const sp = rxMk('path', { class: 'spot', d }, $('#rx-floor')); sp.addEventListener('animationend', () => sp.remove());
  }
  R.spotIds = [];
}
// packets: circle r 4.3, 155 u/s, walk the route link by link (.16 s dwell, hidden), bounce reverses with the return colour, ring on arrival
function rxSpawn(f) {
  const R = RX, segs = []; let ok = true;
  f.r.legs.forEach(g => { const lk = R.links.get(g.link); if (!lk) { ok = false; return; } segs.push(g.rev ? { lk, a: lk.len - 20, b: 16 } : { lk, a: 20, b: lk.len - 16 }); });
  if (!ok || !segs.length) return;
  const k = PK[f.r.kind] || PK.req, el = rxMk('g', { opacity: 0 }, $('#rx-pk')), sh = rxMk(k.q ? 'rect' : 'circle', k.q ? { x: -k.q / 2, y: -k.q / 2, width: k.q, height: k.q, rx: k.rx } : { r: k.r }, el);
  rxSet(sh, { fill: k.f, stroke: k.s, 'stroke-width': k.w });
  R.pks.push({ el, sh, f: f.r, segs, i: 0, s: segs[0].a, back: false, wait: 0, hold: 0, leave: 0, k, spd: 155 * f.r.speed * (PKSPEED[f.r.kind] || 1) });
}
function rxPackets(dt, now) {
  const R = RX;
  for (const f of R.flows) { f.acc += dt * f.r.rate; while (f.acc >= 1) { f.acc -= 1; rxSpawn(f); } }
  for (const q of R.pks.slice()) {
    if (q.leave) continue;
    if (q.hold > 0) { q.hold -= dt; if (q.f.hold) q.sh.setAttribute('stroke-width', (1.5 + 1.9 * (.5 - .5 * Math.cos(2 * Math.PI * (q.f.hold - q.hold) / .8))).toFixed(2)); if (q.hold > 0) continue; q.sh.setAttribute('stroke-width', q.k.w); }
    if (q.wait > 0) { q.wait -= dt; if (q.wait > 0) continue; q.el.setAttribute('opacity', 1); }
    const sg = q.segs[q.i]; let from = q.back ? sg.b : sg.a, to = q.back ? sg.a : sg.b; const d = to >= from ? 1 : -1;
    q.s += d * q.spd * dt;
    if ((q.s - to) * d >= 0) {
      q.s = to; const last = q.back ? q.i === 0 : q.i === q.segs.length - 1;
      if (!last) { q.i += q.back ? -1 : 1; const n = q.segs[q.i]; q.s = q.back ? n.b : n.a; q.wait = .16; q.el.setAttribute('opacity', 0); }
      else if (q.f.bounce && !q.back) { q.back = true; q.sh.setAttribute('fill', '#9fd28f'); q.hold = q.f.hold || .04; } // measured: the turn at the far end holds about one frame
      else { const o = sg.lk.path.getPointAtLength(q.s), x = rxMk('g', { transform: `translate(${o.x.toFixed(1)} ${o.y.toFixed(1)})` }, $('#rx-pk')); rxMk('circle', q.f.fail ? { r: 5, fill: '#e5534b', stroke: '#c0392b', 'stroke-width': 1.6 } : { r: 4.3, fill: 'none', stroke: '#3fa456', 'stroke-width': 1.6, 'vector-effect': 'non-scaling-stroke' }, x); if (q.f.fail) rxMk('path', { d: 'M-2.2,-2.2L2.2,2.2M2.2,-2.2L-2.2,2.2', stroke: '#fff', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, x); R.fxs.push({ el: x, fail: q.f.fail, o, t0: now }); q.el.remove(); R.pks.splice(R.pks.indexOf(q), 1); continue; }
    }
    const o = sg.lk.path.getPointAtLength(q.s); q.el.setAttribute('transform', `translate(${o.x.toFixed(2)} ${o.y.toFixed(2)})`); if (!q.wait && q.el.getAttribute('opacity') !== '1') q.el.setAttribute('opacity', 1);
  }
}
function rxTick() {
  const R = RX; if (!R.svg || !R.svg.isConnected) { R.svg = null; R.raf = 0; return; }
  const now = performance.now(), dt = Math.min(now - R.last, 50) / 1000; R.last = now;
  for (const e of [...R.ents.values()]) rxEnt(e, now); for (const lk of [...R.links.values()]) rxLink(lk, now);
  const t = R.camTw; if (t) { const p = c01((now - t.t0) / t.dur), q = EZ.io(p); R.vb = t.from.map((v, i) => lerp(v, t.to[i], q)); R.svg.setAttribute('viewBox', R.vb.map(v => v.toFixed(2)).join(' ')); if (p >= 1) R.camTw = null; }
  if (!R.settled && now >= R.end) rxSettle();
  if (R.settled && !paused) rxPackets(dt, now);
  for (const q of R.pks.slice()) if (q.leave) { const p = (now - q.leave) / 260; if (p >= 1) { q.el.remove(); R.pks.splice(R.pks.indexOf(q), 1); } else q.el.setAttribute('opacity', (1 - p).toFixed(3)); }
  for (const x of R.fxs.slice()) { const p = (now - x.t0) / (x.fail ? 650 : 450); if (p >= 1) { x.el.remove(); R.fxs.splice(R.fxs.indexOf(x), 1); } else { const e = EZ.out(p), sc = x.fail ? (p < .35 ? lerp(.7, 1.25, p / .35) : lerp(1.25, 2.3, (p - .35) / .65)) : lerp(.8, 2, e); x.el.setAttribute('transform', `translate(${x.o.x.toFixed(1)} ${x.o.y.toFixed(1)}) scale(${sc.toFixed(3)})`); x.el.setAttribute('opacity', (x.fail ? (p < .5 ? 1 : 1 - (p - .5) / .5) : .9 * (1 - e)).toFixed(3)); } }
  R.raf = requestAnimationFrame(rxTick);
}
function drawIllustrated(l, s) {
  const si = l.steps.indexOf(s), key = l.slug + '#' + si;
  if (!RX.svg || RX.svg !== $('#svg') || RX.slug !== l.slug) rxMount(l);
  const dg = $('#diagram');
  if (RX.key === key) { if (dg.clientWidth !== RX.W || dg.clientHeight !== RX.H) { rxFrame(); RX.vb = rxVB(RX.cams[si]); RX.camTw = null; RX.svg.setAttribute('viewBox', RX.vb.map(v => v.toFixed(2)).join(' ')); } return; }
  const cold = !RX.key; RX.key = key;
  if (cold) { RX.vb = rxVB(RX.cams[si]); RX.svg.setAttribute('viewBox', RX.vb.map(v => v.toFixed(2)).join(' ')); }
  rxGo(si, reducedMotion);
  syncPause();
}
function rxReplay() { const R = RX, si = R.si; if (!R.svg) return; R.pks.forEach(q => q.el.remove()); R.pks = []; if (R.sc[si - 1]) rxGo(si - 1, true); else rxClear(); rxGo(si, reducedMotion); }
function rxClear() { const R = RX; for (const e of R.ents.values()) { e.g.remove(); e.o.remove(); } for (const k of R.links.values()) { k.path.remove(); k.lbl.remove(); } R.ents = new Map(); R.links = new Map(); R.L = {}; R.cur = { ents: {}, links: {}, routes: [] }; R.vb = rxVB(R.cams[R.si]); }
// step index at which each node first appears (focus or flow endpoint); never-referenced nodes appear at the last step
function firstSeen(l) {
  const f = {}, last = l.steps.length - 1;
  l.steps.forEach((st, k) => { for (const id of st.focus || []) f[id] ??= k; for (const x of st.flows || []) { f[x.from] ??= k; f[x.to] ??= k; } });
  for (const n of l.nodes) f[n.id] ??= last;
  return f;
}
const nodeLabel = (l, id) => (l.nodes.find(n => n.id === id) || {}).label || id;
function replay() { rxReplay(); if (paused) togglePause(); }
function togglePause() { paused = !paused; syncPause(); }
function syncPause() { const b = $('#pause'); $('#diagram').classList.toggle('paused', paused); if (b) { b.innerHTML = paused ? icon('play') + 'Play' : icon('pause') + 'Pause'; b.setAttribute('aria-pressed', String(paused)); } }

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
