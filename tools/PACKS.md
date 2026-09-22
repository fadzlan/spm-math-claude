# Variety packs – how to add question variety to a topic

The original generators (`site/js/data/f*.js`) give every topic only a handful of question types. **Variety packs**
(`site/js/data/x*.js`) add many more, on top of the originals, with `SPM.extend`. Goal: **≥ 50× more distinct question
templates per topic** (see "Measuring" below for the exact target per topic).

## 0. Ground rules

* Edit **only your own pack file(s)** (named in your assignment) and scratch files in the scratchpad directory.
  Do not touch `core.js`, `i18n.js`, `figs.js`, `svg.js`, `vary.js`, other `x*.js` / `f*.js` files, tools, `index.html`.
  (Found a bug in shared code? Say so in your final report; don't fix it.)
* Keep the original generators untouched – your packs only *add*.
* The app is a static site: plain ES2019 JS in an IIFE, no imports, no network.

## 1. The generator contract

A topic is `{ id, en, ms, scope, gen: { e: [fn…], m: [fn…], a: [fn…] } }` (Easy / Medium / Advanced).
Add generators with

```js
SPM.extend('F3-1.2', { e: [g1, g2, …], m: […], a: […] });   // topic key = 'F' + form + '-' + id
```

A generator is `(r) => ({ q, a, w?, fig?, sp })`:

* `q`, `a`, `w` are bilingual: `SPM.L('English…', 'Bahasa Melayu…')` (imported below as `T`). `q` = question, `a` = final
  answer (what the answer key prints), `w` = optional short worked solution / key step (shown under the answer).
* Maths is KaTeX between `$…$` – never `$$`. Text outside `$` is plain text/HTML (`<br>`, `<b>` ok).
  Multi-part questions: `SPM.parts([T(..), T(..)])` gives (a), (b), (c) lists (also for answers: `SPM.parts` in `a`).
  Tables: `SPM.table(rows, {head:[…], rowHead:true})`.
* `sp` = answer-space size: `'xs' | 's' | 'm' | 'l' | 'xl'` (or mm). Required.
* `fig` (optional) = SVG string, or `T(svgEn, svgMs)` if labels differ; build with `SPM.svg` / `SPM.figs` (read
  `figs.js`, `svg.js`). Figures add real variety – use them where the topic is visual.
* `r` is a seeded RNG: `r.int(lo,hi) r.step(lo,hi,step) r.nz(lo,hi) r.pick(arr) r.chance(p) r.shuffle(arr) r.sample(arr,n)
  r.distinct(n,lo,hi) r.name() r.boy() r.girl() r.pair() r.names(n)`. **Never use `Math.random`.**
* `need(cond)` (= `SPM.need`) rejects a bad random draw (the engine retries with fresh numbers). Use it freely to
  guarantee clean answers, distinct values, no degenerate cases.
* Helpers in `core.js`: `SPM.n(x)` number → string, `SPM.fx(x,dp)`, `SPM.rm(x)` money `RM1 250.50`, `SPM.gm(x)` grouped
  digits inside maths, `SPM.Fr` (exact fractions: `Fr.make/add/sub/mul/div/tex/mixed`), `SPM.poly/lin/bin` (algebra
  strings, no `1x`/`+ -3` glitches), `SPM.gcd/lcm/isPrime/primeFactors/factors`, `SPM.round`, `SPM.sum/mean/median`.
* Shared bilingual context banks in `SPM.bank` (`vary.js`: items, foods, fruits, places, vehicles, jobs, clubs, sports,
  containers, animals, crops, subjects, units) – `r.pick(SPM.bank.foods)` gives `{en, ms, en1, lo, hi}`. Add your own
  local banks for topic-specific contexts.
* Look at how the existing generators in `f*.js` (search for the topic id) are written: same style, same Malay terms.

Skeleton of a pack file:

```js
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, Fr, poly, lin, rm } = SPM;
  const T = SPM.L, S = SPM.svg, F = SPM.figs;

  /* ---- F3-1.2 Law of indices : task types – (list them here) ---- */
  const ge = [ (r) => { … return { q: T(`…`, `…`), a: T(`$…$`), sp: 's' }; }, … ];
  const gm = [ … ];
  const ga = [ … ];
  SPM.extend('F3-1.2', { e: ge, m: gm, a: ga });
})();
```

## 2. What "variety" means here (and what it does not)

A **template** = a question after all random draws are normalised away (numbers, names, letters, signs, list order).
Two questions are the same template if they differ only in those draws. Different **task**, **representation**,
**context**, **wording that changes what is asked**, **number/kind of parts**, or **maths structure** = different template.

Build variety along these axes and combine them:

1. **Task type** (biggest lever): compute · complete/fill the blank · find the missing value (work backwards) ·
   true/false with justification · spot and correct the error · choose the correct option (MCQ with meaningful
   distractors that mirror common misconceptions) · compare/order/classify · match/pair · estimate & check reasonableness ·
   explain/justify · construct your own example · multi-step problem · multi-part (a)(b)(c) chaining.
2. **Representation**: symbolic · word problem · table · diagram/figure · number line/graph · formula/rule · pattern.
3. **Maths structure**: different forms of the same skill (e.g. `ax+b=c`, `a(x+b)=c`, `x/a+b=c`, unknown on both sides,
   fractions, decimals, negative coefficients, brackets…), number types, one-step vs multi-step.
4. **Context** (Malaysian, age-appropriate, realistic numbers): shopping, canteen, travel, sports, farming, building,
   school, money & banking, weather, cooking, tech… Cosmetic story swaps are fine as a *secondary* lever, but **at most
   about a quarter of your templates may come from pure noun/context swapping**; the rest must be structurally different
   questions. Do not pad with reworded duplicates ("Find"/"Calculate"/"Evaluate" alone are not different templates).
5. **Levels**: `e` = one-step recall / direct application; `m` = multi-step, applications, common misconceptions;
   `a` = non-routine, multi-part, reasoning, "explain/justify", cross-topic connection (inside syllabus scope).
   Every level needs its own genuine spread (each of e/m/a ≥ 1/6 of the topic target).

Practical way to get hundreds of templates without hundreds of hand-written functions: write **families** – one generator
function that internally chooses among several sub-forms (`r.pick` of a list of `{en, ms, …}` phrasings / task variants /
contexts) so a single function yields 5–20 templates – and put 15–40 families per level in the pools. The engine picks
generator functions uniformly and without repeats inside one worksheet, so pool breadth = worksheet variety.

## 3. Correctness and language – non-negotiable

* **Every answer must be mathematically correct for the drawn numbers**, computed from the same variables as the question.
  Prefer computing the answer with an independent method from the one used to *build* the question (e.g. build
  `x`, then display `ax+b`, and compute the answer by solving from the displayed numbers – or brute-force it in your
  scratch test script). Reject draws with ambiguous or multiple answers, division by zero, fractions when an integer
  is intended, unrealistic values (negative lengths, ages, prices; 0.3 of a person), answers that are trivial (0/1) unless intended.
* Stay **inside the KSSM syllabus scope for that Form and topic**: read the syllabus file for your chapters
  (`syllabus/form<F>/ch<NN>-*.md`): *Typical question types*, *Difficulty strategies*, *Domain restrictions*, and the
  scope flag (core vs enrichment). Do not use content taught later (e.g. no quadratic formula in Form 1).
* **Bilingual, always.** Every `q`/`a`/`w` is `T(en, ms)`. Malay must be natural and use KSSM terminology as in the
  existing generators (grep `f*.js`). The **maths inside `$…$` must be identical in EN and MS** (only `\text{…}` may
  differ) – the checker enforces it. Never call `r.*` twice to build the two languages: compute values once, then
  interpolate the same variables into both strings.
* KaTeX-safe: balanced `$`, only KaTeX-supported commands (`\dfrac`, `\times`, `\div`, `\circ`, `\begin{pmatrix}` …); in JS
  template strings every backslash is doubled (`\\dfrac`, `\\times`). Use `SPM.lin/poly` for algebra so there is no `1x`, `+ -3`, `0x`.
* Numbers in worded problems: money `SPM.rm()`, sensible units, no floating-point noise (use `SPM.n/fx`).
* Plain-text answers must say what is asked (units, "x = …", set notation, etc.). MCQ answers state the letter *and* the value.
* Questions must be self-contained (state all data), unambiguous, one clear task.
* Performance: a generator should run in well under a millisecond typically; avoid huge search loops (cap `retry`).

## 4. Measuring and checking (run from the project root)

Restrict the tools to your own pack and topics so that other agents' half-written files never affect you:

```sh
export SPM_PACKS=x3a            # comma list of your pack files (without .js); originals f*.js always load
SPM_TOPICS=F3-1.,F3-2. SPM_N=600 node tools/check.js       # stress test: exceptions, NaN, bad $, EN/BM maths mismatch, odd signs …
node tools/check.js F3-1.2 6                                # print 6 samples per level for eyeballing (prefix* works: F3-1*)
node tools/variety.js 'F3-1*'                               # variety table: base / now / target, e/m/a spread, status
node tools/variety.js F3-1.2 --show 60                      # print 60 distinct template skeletons of the topic
```

`variety.js` counts distinct templates over 2 500 draws per level and compares with the topic's target
(`50 × baseline`, at least 150, at most 400). **Status must read `ok` for every topic of your pack**, and
`check.js` must report `problems: 0`. Then read many samples (all levels) and fix anything wrong, dull or repetitive;
the number alone is not the goal – a student generating 30 questions should see 30 clearly different problems.
Be sceptical of your own numbers: check some answers by hand.

`check.js` also parses every `$…$` with the real KaTeX and reports parse errors, so a clean run means it will render.

**Size budget.** All packs are loaded by the page as plain scripts, so keep them lean: aim for **≤ ~25 KB of source per
topic** (≤ ~150 KB for the whole pack). Get variety from data-driven families (phrasing tables, context banks, shared
helpers written once at the top of the pack) rather than from long hand-written repetition, and don't duplicate helpers.

Efficiency tip: write and test one topic at a time (write the code, run check + variety for that topic, fix, move on)
rather than writing the whole pack blind.

## 5. Final report (keep it short)

Table of your topics: `now / target`, note any topic that did not reach `ok` and why, note any bug in shared code, and any
questionable syllabus-scope decision. No long prose.
