#!/usr/bin/env node
/* Sanity checker for the question generators.
 *   node tools/check.js            -> stress-test every topic (exceptions, NaN, unbalanced $, empty answers)
 *   node tools/check.js F1-1.2 6   -> print 6 samples of one topic (all difficulties), for eyeballing
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..', 'site', 'js');
const ctx = { console, Math, JSON, Object, Array, String, Number, Set, Map, Error, RegExp, parseInt, parseFloat, isNaN, Infinity, NaN };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
const files = ['core.js', 'svg.js', 'i18n.js'];
const dataDir = path.join(root, 'data');
const dataFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.js')).sort();
for (const f of ['core.js', 'svg.js', 'figs.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
for (const f of dataFiles) vm.runInContext(fs.readFileSync(path.join(dataDir, f), 'utf8'), ctx, { filename: f });
const SPM = ctx.SPM;

const strip = (s) => String(s).replace(/<[^>]*>/g, ' ');
function problems(q) {
  const out = [];
  const texts = { qen: q.q && q.q.en, qms: q.q && q.q.ms, aen: q.a && q.a.en, ams: q.a && q.a.ms, wen: q.w && q.w.en, wms: q.w && q.w.ms };
  for (const [k, v] of Object.entries(texts)) {
    if (v === undefined || v === null) { if (k[0] !== 'w') out.push('missing ' + k); continue; }
    if (typeof v !== 'string') { out.push('non-string ' + k); continue; }
    if (/undefined|NaN|\[object|Infinity|null/.test(v)) out.push('bad token in ' + k + ': ' + v.slice(0, 120));
    if ((v.split('$').length - 1) % 2) out.push('unbalanced $ in ' + k + ': ' + v.slice(0, 120));
    if (v.trim() === '' || v.trim() === '$$') out.push('empty ' + k);
    if (/\$\s*\$/.test(v)) out.push('empty math in ' + k);
    if (/\.\.\./.test(v)) out.push('ellipsis in ' + k);
    if (/\+ -\d|- -\d|\+ \+|(^|[^\d.\\a-zA-Z{^_])1[a-z]\b|\b0[a-z]\b/.test(v.split('$').filter((_, i) => i % 2).join(' ')) ) out.push('odd sign/coefficient in ' + k + ': ' + v.slice(0, 100));
  }
  // the same maths must appear in both languages (catches r.* calls inside L(en, ms) templates)
  const mathOf = (t) => String(t).split('$').filter((_, i) => i % 2).join('|').replace(/\\text\{[^}]*\}/g, '\\text{}').replace(/<[^>]*>/g, '');
  if (q.q && mathOf(q.q.en) !== mathOf(q.q.ms)) out.push('math differs en/ms in question: ' + mathOf(q.q.en).slice(0, 70) + ' <> ' + mathOf(q.q.ms).slice(0, 70));
  if (q.a && mathOf(q.a.en) !== mathOf(q.a.ms)) out.push('math differs en/ms in answer: ' + mathOf(q.a.en).slice(0, 70) + ' <> ' + mathOf(q.a.ms).slice(0, 70));
  if (q.fig) { const figs = Array.isArray(q.fig) ? q.fig : [q.fig]; for (const f of figs) { const s = typeof f === 'string' ? f : f.en; if (/NaN|undefined/.test(s)) out.push('bad svg'); } }
  if (!q.sp) out.push('no sp');
  return out;
}

const arg = process.argv[2];
if (arg && arg !== 'all') {
  const N = +process.argv[3] || 4;
  const keys = arg.includes('*') ? Object.keys(SPM.topics).filter((k) => k.startsWith(arg.replace('*', ''))) : [arg];
  for (const key of keys) {
    const t = SPM.topics[key];
    console.log(`\n===== ${key} ${t.en}`);
    for (const d of ['e', 'm', 'a']) {
      const r = SPM.makeRng('sample-' + key + d);
      const seen = new Set();
      for (let i = 0; i < N; i++) {
        const q = SPM.makeOne(t, d, r, seen, i);
        console.log(`[${d}] Q: ${strip(q.q.en)}${q.fig ? '  {fig}' : ''}`);
        console.log(`     MS: ${strip(q.q.ms)}`);
        console.log(`     A: ${strip(q.a.en)}${q.w ? '   | W: ' + strip(q.w.en) : ''}`);
        const p = problems(q); if (p.length) console.log('     !!! ' + p.join(' ; '));
      }
    }
  }
  process.exit(0);
}

let bad = 0, total = 0, dupes = 0;
const rows = [];
for (const key of Object.keys(SPM.topics)) {
  const t = SPM.topics[key];
  for (const d of ['e', 'm', 'a']) {
    const r = SPM.makeRng('stress-' + key + d);
    let fails = 0; const texts = new Set();
    for (let i = 0; i < 150; i++) {
      try {
        const q = SPM.makeOne(t, d, r, new Set(), i);
        total++;
        texts.add(q.q.en);
        const p = problems(q);
        if (p.length) { bad++; const sig = key + d + p[0].slice(0, 20); if (!global.__seen) global.__seen = new Set(); if (!global.__seen.has(sig)) { global.__seen.add(sig); console.log(key, d, p.join(' ; ')); } }
      } catch (e) { fails++; if (fails < 3) console.log('EXC', key, d, e.message, (e.stack || '').split('\n')[1]); }
    }
    if (fails) { bad += fails; }
    rows.push([key, d, texts.size]);
  }
}
const low = rows.filter((x) => x[2] < 20);
console.log(`\nTopics: ${Object.keys(SPM.topics).length}, questions generated: ${total}, problems: ${bad}`);
if (low.length) console.log('Low variety (unique of 150):', low.map((x) => x.join(':')).join(' '));
