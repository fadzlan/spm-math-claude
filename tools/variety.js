#!/usr/bin/env node
/* Variety meter: how many DISTINCT question templates does each topic produce?
 *
 *   node tools/variety.js                 -> table for every topic (current vs baseline vs target)
 *   node tools/variety.js F3-1*           -> only topics whose key starts with F3-1
 *   node tools/variety.js --baseline      -> (re)write tools/variety-baseline.json from the current code
 *   node tools/variety.js F3-1.3 --show 25   -> also print 25 distinct template skeletons of the topic
 *
 * A "template" is the English question with everything that is only a random draw normalised away:
 * numbers -> #, people's names -> NAME, single letters / vertex labels inside maths -> v / V.
 * Two questions that differ only in those are the same template; different wording, task, context,
 * maths structure or number of parts are different templates. (Figures are ignored.)
 *
 * Also reported: "M", the number of distinct *maths* skeletons (all $..$ segments, normalised) – a guard against
 * inflating variety with cosmetic story changes alone.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..', 'site', 'js');
const ctx = { console, Math, JSON, Object, Array, String, Number, Set, Map, Error, RegExp, parseInt, parseFloat, isNaN, Infinity, NaN };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['core.js', 'svg.js', 'figs.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const dataDir = path.join(root, 'data');
for (const f of fs.readdirSync(dataDir).filter((f) => f.endsWith('.js')).sort()) vm.runInContext(fs.readFileSync(path.join(dataDir, f), 'utf8'), ctx, { filename: f });
const SPM = ctx.SPM;
const NAMES = new RegExp('\\b(' + SPM.BOYS.concat(SPM.GIRLS).join('|') + ')\\b', 'g');

const normMath = (m) =>
  m
    .replace(/\\text\{[^}]*\}/g, 'T')
    .replace(/\d+(\.\d+)?/g, '#')
    .replace(/(?<![\\a-zA-Z])[A-Z]{2,4}(?![a-zA-Z])/g, 'V')
    .replace(/(?<![\\a-zA-Z])[a-zA-Z](?![a-zA-Z])/g, 'v')
    .replace(/\s+/g, '');
function signature(q) {
  const s = String(q.q.en).replace(/<\/?(li|ol|br|p|div|span)[^>]*>/g, ' ¶ ').replace(/<[^>]*>/g, ' ');
  const parts = s.split('$');
  const text = parts.map((seg, i) => (i % 2 ? '$' + normMath(seg) + '$' : seg.replace(NAMES, 'NAME').replace(/\d+(\.\d+)?/g, '#'))).join('');
  const maths = parts.filter((_, i) => i % 2).map(normMath).join('|');
  return { t: text.replace(/\s+/g, ' ').trim(), m: (q.q.en.split(/\s+/)[0] || '') + '§' + maths };
}

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const showN = flag('--show') ? +args[args.indexOf('--show') + 1] || 20 : 0;
const pat = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const SAMPLES = 2500; // draws per level
const TARGET = (b) => Math.min(400, Math.max(150, b * 50)); // 50x baseline, floored at 150 and capped at 400

function measure(key) {
  const t = SPM.topics[key];
  const sigs = new Set(), maths = new Set(), perLevel = {};
  const examples = new Map();
  for (const d of ['e', 'm', 'a']) {
    const r = SPM.makeRng('variety-' + key + d);
    const lv = new Set();
    for (let i = 0; i < SAMPLES; i++) {
      try {
        const q = SPM.makeOne(t, d, r, new Set(), i);
        const s = signature(q);
        sigs.add(s.t); maths.add(s.m); lv.add(s.t);
        if (!examples.has(s.t)) examples.set(s.t, q.q.en);
      } catch (e) { /* ignore */ }
    }
    perLevel[d] = lv.size;
  }
  return { total: sigs.size, m: maths.size, e: perLevel.e, mid: perLevel.m, a: perLevel.a, examples };
}

const keys = Object.keys(SPM.topics).filter((k) => !pat || (pat.includes('*') ? k.startsWith(pat.replace('*', '')) : k === pat));
const basePath = path.join(__dirname, 'variety-baseline.json');
if (flag('--baseline')) {
  const out = {};
  for (const k of Object.keys(SPM.topics)) { const m = measure(k); out[k] = { total: m.total, m: m.m }; }
  fs.writeFileSync(basePath, JSON.stringify(out, null, 1));
  console.log('baseline written for', Object.keys(out).length, 'topics');
  process.exit(0);
}
const base = fs.existsSync(basePath) ? JSON.parse(fs.readFileSync(basePath, 'utf8')) : {};
let ok = 0, sumB = 0, sumC = 0;
console.log('topic     base  now  target  x      e/m/a           M(now)  status');
for (const k of keys) {
  const m = measure(k);
  const b = (base[k] && base[k].total) || m.total;
  const tg = TARGET(b);
  const pass = m.total >= tg && Math.min(m.e, m.mid, m.a) >= tg / 6;
  if (pass) ok++;
  sumB += b; sumC += m.total;
  console.log(`${k.padEnd(9)} ${String(b).padStart(4)} ${String(m.total).padStart(4)} ${String(tg).padStart(6)} ${(m.total / b).toFixed(1).padStart(5)}  ${[m.e, m.mid, m.a].join('/').padEnd(14)} ${String(m.m).padStart(6)}  ${pass ? 'ok' : 'NEEDS ' + Math.max(0, tg - m.total) + ' more'}`);
  if (showN) {
    let i = 0;
    for (const [, ex] of m.examples) { if (i++ >= showN) break; console.log('     · ' + String(ex).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 150)); }
  }
}
console.log(`\n${ok}/${keys.length} topics at target · templates ${sumB} -> ${sumC} (${(sumC / sumB).toFixed(1)}x)`);
