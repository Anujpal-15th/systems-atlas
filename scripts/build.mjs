// Validates content/lessons/*.json against catalog.json and bundles them into course.js.
// Usage: node scripts/build.mjs            -> build (skips invalid lessons, exits 1 if any errors)
//        node scripts/build.mjs <slug>...  -> validate only those lessons, print errors, no write
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(join(root, 'content/catalog.json'), 'utf8'));
const KINDS = ['client', 'server', 'service', 'db', 'cache', 'queue', 'lb', 'cdn', 'dns', 'gateway', 'storage', 'worker', 'external', 'user', 'region'];
const FLOWS = ['request', 'response', 'async', 'handshake', 'replicate', 'fail'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const str = (v, min = 1, max = 2000) => typeof v === 'string' && v.trim().length >= min && v.length <= max;

export function validate(l, slug) {
  const e = [];
  const need = (ok, msg) => { if (!ok) e.push(msg); };
  need(l.slug === slug, `slug must be "${slug}"`);
  need(str(l.title, 3, 80), 'title 3-80 chars');
  need(str(l.subtitle, 10, 200), 'subtitle 10-200 chars');
  need(Number.isInteger(l.minutes) && l.minutes >= 3 && l.minutes <= 30, 'minutes int 3-30');
  need(LEVELS.includes(l.level), `level one of ${LEVELS}`);
  need(Array.isArray(l.learn) && l.learn.length >= 3 && l.learn.length <= 6 && l.learn.every(x => str(x, 5, 140)), 'learn: 3-6 strings');
  const nodes = Array.isArray(l.nodes) ? l.nodes : [];
  need(nodes.length >= 2 && nodes.length <= 9, 'nodes: 2-9');
  const ids = new Set();
  for (const n of nodes) {
    need(str(n.id, 1, 30) && /^[a-z0-9-]+$/.test(n.id) && !ids.has(n.id), `node id invalid/duplicate: ${n.id}`);
    ids.add(n.id);
    need(str(n.label, 1, 22), `node ${n.id}: label 1-22 chars`);
    need(KINDS.includes(n.kind), `node ${n.id}: kind one of ${KINDS}`);
    need(Number.isFinite(n.x) && n.x >= 5 && n.x <= 95 && Number.isFinite(n.y) && n.y >= 8 && n.y <= 92, `node ${n.id}: x 5-95, y 8-92`);
  }
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    need(Math.abs(a.x - b.x) >= 16 || Math.abs(a.y - b.y) >= 14, `nodes ${a.id} and ${b.id} overlap (need dx>=16 or dy>=14)`);
  }
  const edges = Array.isArray(l.edges) ? l.edges : [];
  const hasEdge = (a, b) => edges.some(x => (x.from === a && x.to === b) || (x.from === b && x.to === a));
  for (const x of edges) need(ids.has(x.from) && ids.has(x.to) && x.from !== x.to, `edge ${x.from}->${x.to} references unknown node`);
  const metrics = Array.isArray(l.metrics) ? l.metrics : [];
  need(metrics.length <= 4, 'metrics: 0-4');
  const mids = new Set(metrics.map(m => m.id));
  for (const m of metrics) need(str(m.id, 1, 20) && str(m.label, 1, 16), `metric ${m.id}: id and label (<=16 chars)`);
  const steps = Array.isArray(l.steps) ? l.steps : [];
  need(steps.length >= 5 && steps.length <= 10, 'steps: 5-10');
  steps.forEach((s, i) => {
    const p = `step ${i + 1}`;
    need(str(s.tag, 2, 14) && s.tag === s.tag.toUpperCase(), `${p}: tag UPPERCASE 2-14 chars`);
    need(str(s.title, 3, 60), `${p}: title 3-60 chars`);
    need(str(s.body, 60, 700), `${p}: body 60-700 chars`);
    need(str(s.idea, 10, 220), `${p}: idea 10-220 chars`);
    need(str(s.caption, 5, 110), `${p}: caption 5-110 chars`);
    need(Array.isArray(s.focus) && s.focus.every(id => ids.has(id)), `${p}: focus must list node ids`);
    need(Array.isArray(s.flows), `${p}: flows array`);
    for (const f of s.flows || []) {
      need(ids.has(f.from) && ids.has(f.to) && hasEdge(f.from, f.to), `${p}: flow ${f.from}->${f.to} needs an edge between existing nodes`);
      need(FLOWS.includes(f.kind), `${p}: flow kind one of ${FLOWS}`);
      need(f.label === undefined || str(f.label, 1, 18), `${p}: flow label <=18 chars`);
    }
    for (const k of Object.keys(s.metrics || {})) need(mids.has(k) && str(String(s.metrics[k]), 1, 12), `${p}: metric ${k} unknown or value >12 chars`);
  });
  need(steps.at(-1)?.tag === 'RECAP', 'last step tag must be RECAP');
  const quiz = Array.isArray(l.quiz) ? l.quiz : [];
  need(quiz.length >= 3 && quiz.length <= 5, 'quiz: 3-5');
  quiz.forEach((q, i) => {
    need(str(q.q, 10, 300) && Array.isArray(q.options) && q.options.length === 4 && q.options.every(o => str(o, 1, 160)), `quiz ${i + 1}: q + 4 options`);
    need(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3 && str(q.why, 10, 400), `quiz ${i + 1}: answer 0-3 and why`);
  });
  const cs = Array.isArray(l.cheatsheet) ? l.cheatsheet : [];
  need(cs.length >= 3 && cs.length <= 8 && cs.every(c => str(c.term, 1, 40) && str(c.def, 10, 260)), 'cheatsheet: 3-8 {term, def}');
  if (l.lab !== undefined) {
    const b = l.lab;
    need(str(b.prompt, 20, 400), 'lab.prompt 20-400');
    for (const k of ['requirements', 'hints', 'checklist']) need(Array.isArray(b[k]) && b[k].length >= 2 && b[k].length <= 8 && b[k].every(x => str(x, 5, 220)), `lab.${k}: 2-8 strings`);
  }
  return e;
}

const all = catalog.modules.flatMap(m => m.lessons.map(x => ({ ...x, module: m.id })));
const only = process.argv.slice(2);
let errors = 0;
const ready = new Set();
for (const meta of only.length ? all.filter(x => only.includes(x.slug)) : all) {
  const file = join(root, 'content/lessons', `${meta.slug}.json`);
  if (!existsSync(file)) { console.log(`MISSING ${meta.slug}`); errors++; continue; }
  let l;
  try { l = JSON.parse(readFileSync(file, 'utf8')); } catch (err) { console.log(`INVALID JSON ${meta.slug}: ${err.message}`); errors++; continue; }
  const e = validate(l, meta.slug);
  if (e.length) { errors++; console.log(`FAIL ${meta.slug}\n  - ${e.join('\n  - ')}`); } else { ready.add(meta.slug); console.log(`ok   ${meta.slug}`); }
}
if (!only.length) {
  const course = { modules: catalog.modules.map(m => ({ id: m.id, title: m.title, lessons: m.lessons.filter(x => ready.has(x.slug)).map(x => ({ ...JSON.parse(readFileSync(join(root, 'content/lessons', `${x.slug}.json`), 'utf8')), isNew: x.isNew })) })).filter(m => m.lessons.length) };
  writeFileSync(join(root, 'course.js'), `window.COURSE=${JSON.stringify(course)};\n`);
  console.log(`\nbuilt course.js: ${ready.size}/${all.length} lessons`);
}
process.exit(errors ? 1 : 0);
