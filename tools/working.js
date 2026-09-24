#!/usr/bin/env node
/* Coverage of worked solutions (the generators' `w` field).
 *   node tools/working.js               -> totals by form and level
 *   node tools/working.js F4-1          -> per-topic coverage for keys starting with F4-1 (F4 = a whole form)
 *   node tools/working.js F4-1.4 list   -> each generator of one topic prefix without `w`, with its file:line
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..', 'site', 'js');
const ctx = { console, Math, JSON, Object, Array, String, Number, Set, Map, Error, RegExp, parseInt, parseFloat, isNaN, Infinity, NaN };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['core.js', 'svg.js', 'figs.js', 'vary.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const dataDir = path.join(root, 'data');
const sources = {};
for (const f of fs.readdirSync(dataDir).filter((f) => f.endsWith('.js')).sort()) {
  sources[f] = fs.readFileSync(path.join(dataDir, f), 'utf8');
  vm.runInContext(sources[f], ctx, { filename: f });
}
const SPM = ctx.SPM;

// does generator g return `w` on EVERY draw? (branches inside one generator can differ, so sample many)
// returns true (always), false (never), 'partial' (some draws only), or null (never produced a question)
const DRAWS = +process.env.SPM_W_DRAWS || 60;
function hasW(g, seed) {
  const r = SPM.makeRng(seed);
  let with_ = 0, without = 0;
  for (let i = 0; i < DRAWS * 8 && with_ + without < DRAWS; i++) {
    try { const q = g(r); if (q && q.q) (q.w ? with_++ : without++); } catch (e) { if (e !== SPM.REJECT) return null; }
  }
  if (!with_ && !without) return null;
  return without === 0 ? true : with_ === 0 ? false : 'partial';
}
function where(g) {
  const src = g.toString();
  for (const [f, s] of Object.entries(sources)) {
    const i = s.indexOf(src);
    if (i >= 0) return `site/js/data/${f}:${s.slice(0, i).split('\n').length}`;
  }
  return '?';
}

const prefix = process.argv[2] || '';
const list = process.argv[3] === 'list';
const pct = (a, b) => (b ? Math.round((100 * a) / b) + '%' : '-');
const tot = {}; const add = (k, w) => { tot[k] = tot[k] || [0, 0]; tot[k][0]++; if (w) tot[k][1]++; };
for (const key of Object.keys(SPM.topics)) {
  if (!key.startsWith(prefix)) continue;
  const t = SPM.topics[key];
  const per = [0, 0];
  for (const d of ['e', 'm', 'a']) {
    (t.gen[d] || []).forEach((g, i) => {
      const w = hasW(g, `w-${key}${d}${i}`);
      const full = w === true;
      add('all', full); add(key.slice(0, 2), full); add('level ' + d, full);
      per[0]++; if (full) per[1]++;
      if (list && !full) console.log(`${key} ${d}#${i} ${where(g)}${w === 'partial' ? '  PARTIAL (some draws have no w)' : w === null ? '  (never produces a question)' : ''}`);
    });
  }
  if (prefix && !list) console.log(`${key.padEnd(8)} ${String(per[1]).padStart(4)} / ${String(per[0]).padEnd(4)} ${pct(per[1], per[0]).padStart(4)}  ${t.en}`);
}
if (!list) {
  if (prefix) console.log('');
  for (const [k, [n, w]] of Object.entries(tot)) console.log(`${k.padEnd(8)} ${String(w).padStart(5)} / ${String(n).padEnd(5)} ${pct(w, n)}`);
}
