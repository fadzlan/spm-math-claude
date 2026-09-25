# Working steps in the answer key – progress

Goal: every answer can show its working steps (the generator's `w` field), with a switch to show or hide them.

## Baseline (2026-09-22)

6,701 generators, 945 (14%) return `w`. Form 4: 53 / 856 (6%), Form 5: 61 / 736 (8%).
Easy 9%, Medium 15%, Advanced 18%.

## Plan

1. [x] "Show working" switch in *More options* (EN/BM, **off** by default), saved with the other options. *More options* is always shown (no longer collapsible), styled like the other option groups.
2. [x] Coverage report (`npm run working [prefix] [list]`, `tools/working.js`) + EN/BM maths check on `w` in `tools/check.js`.
3. [x] Pilot: topic F4-1.4 (solving quadratic equations by factorisation, 37 generators, 2 with working) gets full working on every generator. (Whole chapter F4-1 is 185 generators – too big for a pilot.)
4. [x] Pilot reviewed by the user: level of detail OK, Malay wording OK.
5. [x] **Roll out complete.** All levels, file by file (one agent owns each file, so edits never collide):
   - [x] **Phase 1 done – Form 4 and 5 (1,344 code sites), all verified: 0 missing, check.js 0 problems.**
   - [x] **Phase 2 done – Form 3 (~570 sites), all 25 topics verified: 0 missing, check.js 0 problems.**
   - [x] **Phase 3 done – Form 2 (~1,230 sites): 0 missing; the 180 dead F2-10.1 generators fixed.**
   - [x] **Phase 4 done – Form 1 (~1,360 sites): 0 missing.**
   - [x] The older one-line `w` hints were audited and upgraded as each file was done.

"Code sites" = distinct generator functions in the source that lack `w` (4,482 in total after the pilot; some
functions are reused by several topics, which is why the generator count is higher).

## Conventions (from the pilot)

- `w` is a list of short lines: `W(...)` = `SPM.lines`, one step per line, ending with the result.
- Don't repeat the question as the first line (e.g. `ZS(...).slice(1)` when the question is already factorised).
- `SPM.zeroSteps(u, p, v, q, k?)` (core.js) gives the standard zero-product lines for `k(ux + p)(vx + q) = 0`,
  including repeated roots. `pairLine(a, b)` (local to f4a/x4a) gives "two numbers with product … and sum …".
- Add one teaching line where it helps (e.g. "do not divide by $(x - p)$", "difference of two squares", why a root is rejected).
- Build negatives with `lin`/`poly`/`Q`/`fz`, never `(x - ${q})`: `tidyMath` hides `x - -2` as `x - (-2)`, which
  `check.js` does not flag. The scratch scan for this is `/[a-z)] [-+] \(-\d/` over generated text.

## Malay terms to review

Moved to [MALAY-TERMS.md](MALAY-TERMS.md) – the terms that differ between files, with occurrence counts,
for the user to decide. Nothing is blocked on it; it is a one-pass text replacement once decided.

## Phase 2–4 note

Agents now also audit and rewrite pre-existing one-line `w` hints in their files, so the "945 older hints" item
shrinks as the rollout goes (x3b did all 25 of its own).

## Log

- 2026-09-22 – Measured the baseline; created this file.
- 2026-09-22 – Step 1 done: `#opt-working` checkbox (index.html), `working` in app state (app.js), strings `optWorking` (i18n.js).
- 2026-09-22 – Step 2 done: `tools/working.js` + `npm run working`; `check.js` now checks that the maths in `w` matches in EN and BM.
  It found one mismatch (x4a.js:518, BM text had `g` outside `$`), fixed. Full check: 82,350 questions, 0 problems.
- 2026-09-22 – Step 3 done: all 37 generators of F4-1.4 have working (f4a.js ×8, x4a.js ×29); `SPM.zeroSteps` added to core.js.
  Fixed on the way: wrong constant term in x4a `g14a4` (answer gave $c = -pq$ instead of $pq$) and `g14a7` (the question's
  equation didn't match its own "correct" factorisation); `(x - (-2))`-style sign glitches in e8, m4, m9, m11, a3, a4, a6, a7, a9;
  a6 can no longer produce a repeated root by accident. Check: 82,350 questions, 0 problems; browser test passes.
  Known leftover: base m#0 can show a factor with a common factor, e.g. $(2x + 4)(x - 1)$ (valid, not simplest).
- 2026-09-22 – User review: detail level and Malay OK. Changes asked for and done: checkbox off by default; *More options* is
  now a normal, always-visible option group (`div.opt.more` instead of `<details>`), labels in normal case at 14px.
- 2026-09-22 – Rollout planned (above). Phase 1 started: 8 agents launched.
- 2026-09-22 – Phase 1 progress: 5 of 8 agents done and verified (coverage 0 missing, check.js 0 problems, glitch scan clean):
  - A x4a (~199 sites, F4-1.x, F4-2.1/2.1E): ~20 sign glitches and ~13 wrong/ambiguous answers fixed, e.g. a true statement
    marked False (g11m8), "wider when |a1| < |a2|" always False (TASKS_A), "narrower since 1 > 2" (g12m4).
  - B x4b+x4c (171, F4-3/4/5): 17 fixes, e.g. A' containing elements of A (4.3 e#8), impossible n(A∩B) > n(B) (4.1 a#3),
    "shortest route" that was just the first path found (5.5 m#3), English answers in the Malay version.
  - C x4d+f4a (150, F4-1.x base, F4-2/3/6/7/10): 20 fixes, e.g. test point said to be inside the region but outside it
    (6.2 m#7), speeds/accelerations from rounded intermediate values (7.1, 7.2), "Kumar … her" (10.1 a#1).
  - D x4e+x4f (158, F4-8/9): 27 fixes, e.g. statistics true/false inverted (8.1.1), "rank by sensitivity" with a fixed
    wrong order (8.2.2 a), unit-conversion arithmetic wrong (8.2.4 m), P(B) given as P(B|A) (9.2), one generator that
    always crashed (x4f 9.2 m#1, `n` not imported), many ties that gave an arbitrary "A" answer.
  - F x5b (154, F5-3/4/7): 10 fixes, e.g. "which x for the mean" wrong ~2/3 of the time (7.1), "RM0 refund" (4.1),
    money typeset inside maths. I then fixed one more that it skipped because it already had a `w`: "find p" in F5-7.1
    summed the hidden frequency too, so p was always wrong (e.g. 6+7+7+p=30 gave p=2).
  Unsure Malay terms reported by the agents are collected under "Malay terms to review" below.
- 2026-09-22 – `check.js` now also calls every generator on its own (200 draws): `makeOne` silently falls back to the
  topic's other generators, so one that always throws/rejects was invisible. Result: F4/F5 clean; 186 dead generators in
  F1–F3 (F1: 4, F2: 180 – mostly F2-10.1 –, F3: 2). They go to the phase 2–4 agents with their files.
- 2026-09-22 – Verified A, D (x4a, x4e, x4f) as well. Phase 2 (Form 3) started with 3 agents while E, G, H finish.
- 2026-09-22 – H x5d+f5a done and verified (171 sites, F5-1, F5-2, F5-8 + insurance/tax base): 0 missing, check 0 problems.
  24 fixes, e.g. a dead break-even generator (impossible `need`, never produced a question), a plan recommendation that
  was the wrong way round, data "generated" with a fresh random gradient per point (so "linear" data wasn't linear),
  a matrix printed outside `$…$` as raw LaTeX, and "at most half" translated as "sekurang-kurangnya" (at least).
- 2026-09-22 – G x5c+f5b (204 sites, F5-5, F5-6 + f5b across ch.5–8) and E x5a+f4b+f4c (163 sites, F5-1, F5-2 + F4 ch.4–10 base)
  done and verified. 13 + 16 fixes, e.g. ASA/AAS naming the wrong side (5.1), a trig question built from the sine table but
  answered from the cosine one (6.2), MCQs whose distractor equalled the key, negative projectile heights, squared unknowns
  answered with only the positive root, and a "square area varies as side²" question whose k could only be 1.
- 2026-09-22 – **Phase 1 complete.** Whole of Form 4 and Form 5: every generator has working. F4+F5 check: 0 problems,
  0 missing. I also fixed money typeset inside `$…$` (italic "RM", collapsed spaces) in x5a F5-2.3 and x5c F5-5.2, and
  added a check.js guard for a `w` given as a plain string instead of `SPM.L` (it would render as "undefined").
- 2026-09-22 – Phase 3 (Form 2) started with 6 agents, alongside the 3 Form 3 agents still running.
- 2026-09-22 – J x3b done and verified (164 sites + its 25 old hints rewritten; F3-4 scale drawings, F3-5 trigonometry,
  F3-9 straight lines): 0 missing, 0 problems, glitch scan clean (its F3-9.1 hits are bracketed substitutions like
  $\dfrac{(-4) - (-1)}{(-1) - (-3)}$, which are correct). 25 fixes, the worst being opposite/adjacent swapped in five
  figure-based trigonometry generators, a cosine question judged with tan from the wrong ratio, a question whose EN and
  MS versions drew different prices, hard-coded ticket prices that made the answer always "RM2 and RM3", and four
  figures whose labels or marked angle didn't match the text (one figure was built but never shown).
  Left alone (reported, pre-existing): F3-4.1 e has a dead true-branch so the answer is always "No"; x3b duplicates a few
  f3b generators byte-for-byte.
- 2026-09-22 – **Phase 2 complete (Form 3).** I x3a+f3a (172 sites + ~20 old hints) and K x3c+x3d+f3b (206 + ~14 hints)
  done and verified; all 25 F3 topics 0 missing, 0 problems. Fixes included two generators that never produced a question
  (`lin` not imported; an impossible perfect-square condition), a circle-theorem answer that reversed "the circles meet"
  and "they do not meet", ∠OAB given as (180−x)/2 instead of x/2, a reflex-angle answer citing the wrong theorem,
  "find ∠ACB + ∠ADB" answered x+y when the sum is 180°, hard-wired ticket prices (again, in f3b this time), and scale
  questions producing absurd sizes ("a key 2250 mm long").
- 2026-09-22 – Fixed "cenuk" → "cenuram" (cliff) in f3a.js, f1b.js, x1e.js: not a Malay word, used project-wide.
- 2026-09-22 – Phase 4 (Form 1) started with 4 agents (x1a, x1c, x1e, f1a+f1b); 3 more groups to launch as slots free up.
- 2026-09-23 – The session hit its usage limit and all 10 running agents were killed mid-file. Assessment afterwards:
  every data file still parses, the full check.js run reports no content problems, and the partial work is intact.
  Remaining: 1,465 sites (Form 1: 1,286; Form 2 leftovers: x2a 59, x2d 75, f2a 38, f2b 7).
  Form 2 is otherwise done: x2b, x2c, x2e, x2f, x2g, f2c, f2d are at 0 missing, and the 180 dead F2-10.1 generators
  plus the x2d/x2e generators that always threw are fixed (only 4 dead generators remain, all pre-existing, in Form 1:
  x1d F1-6.7 e#3/m#7 `r.pick is not a function`, F1-8.2 a#11 and F1-12.2 m#12 reject every draw).
  Restarted with 5 agents (Form 2 leftovers, x1a, x1c, x1e, f1a+f1b); the other Form 1 groups follow.
- 2026-09-23 – U x1e done and verified (158 sites, F1-8 lines & angles + F1-13 Pythagoras): 0 missing, 0 problems.
  Fixes: the dead `F1-8.2 a#11` generator (its angle could never be written in the required $Ax + B$ form, so every draw
  was rejected), 13 lost `\pm`/`\circ` backslashes, 10 answers whose Malay side was English, and "wakaf" (a roadside hut)
  used for kite instead of "lelayang".
- 2026-09-23 – New check: a single backslash in a JS template literal is swallowed, so `$\pm$` reaches KaTeX as the word
  "pm". check.js now flags a LaTeX command name appearing in maths without its backslash (ignoring `\text{…}`).
  A project-wide scan found two more real cases: x1b F1-2.3 (`300 div 224`) and x1f (`- 2 times width`). Both fixed.
- 2026-09-23 – Launched x1d+x1b (with the two dead F1-6.7 generators) and x1f+f1c.
- 2026-09-23 – S x1c done and verified (216 sites: F1-5 algebra, F1-7 inequalities, F1-11 sets): 0 missing, 0 problems,
  plus 11 old one-line hints upgraded. Fixes: two "is this a solution?" generators that printed a false relation when the
  value sat on the boundary (e.g. "No: $5 < 5$" instead of "$5 = 5$"), a sentence template that produced "Farid is scored
  higher than Amir", and a local variable that shadowed the `W` steps helper. Launched the last group, x1g+f1d.
- 2026-09-23 – Second usage-limit interruption; 6 agents killed mid-file. Again nothing lost: all files parse, the full
  check.js run shows only the 3 pre-existing dead generators (x1d F1-6.7 e#3/m#7, F1-12.2 m#12). Form 2 is now complete
  (x2a, x2d, f2a, f2b finished), and so are x1a and the f1a/f1b base files. 381 sites left, in 6 files.
  Restarted with 3 agents instead of 6 to lower the chance of another mid-flight cut-off.
- 2026-09-23 – x1g+f1c done and verified (123 new + 21 old hints upgraded; F1-10 perimeter & area, F1-12 data handling):
  0 missing, 0 problems. It fixed the last dead generator (`F1-12.2 m#12` asked for 5 distinct multiples of 5 summing to
  at most 60 – impossible, minimum is 75), a question whose EN version sometimes asked an extra part the MS version never
  did, English category names in a Malay answer, and three "which is largest/most common?" answers that could tie.
  **No GEN lines left anywhere in the project** – the x1d agent has also fixed its two F1-6.7 crashers.
- 2026-09-23 – f1d+x1f done and verified (132 sites + ~32 old hints upgraded; F1-9 polygons, F1-10 perimeter & area,
  F1-11 sets, F1-12 data, F1-13 Pythagoras): 0 missing, 0 problems. Fixes: a rhombus table giving \u2220BCD as b when the
  opposite angle was already 180\u2212b (self-contradictory whenever b \u2260 90), an isosceles apex angle computed as
  (180+d)/3 instead of (180+2d)/3, a "which has the larger perimeter" answer that named the rectangle when the square
  wins for odd a+b, and four true statements about area/perimeter answered "False" with an invented reason.
  I then fixed its reported leftover myself in f1d F1-12.4: the answer said "Increase of 0" when the two months were
  equal (now "No change"), and part (b) named one month pair when the greatest change can happen in several (now lists
  them all, in the answer and the working). No random draws changed.

## DONE – 2026-09-23

**Every generator in the project has a worked solution.** Final verification:

- `npm run working` → **6,536 / 6,536 = 100%** (F1 1725, F2 2492, F3 727, F4 856, F5 736; easy/medium/advanced all 100%).
  The tool now samples 60 draws per generator and reports `PARTIAL` if any branch omits `w`; nothing is partial.
- `node tools/check.js` → 183 topics, 82,350 questions, **0 problems**, no GEN lines (186 dead generators at the start).
- Glitch scan, all five forms: only legitimate bracketed negatives (`8 - (-2)`, `\dfrac{(-4) - (-1)}{(-1) - (-3)}`,
  matrix sizes `(2 \times 3)`).
- `node tools/browser-test.js` → all checks passed.

Also done along the way: ~250 real bugs fixed (wrong answers, questions that didn't match their answers, ties with an
arbitrary "correct" option, English text in the Malay version, money typeset inside maths, lost LaTeX backslashes,
impossible or crashing generators). check.js gained four new checks: EN/BM maths in `w`, per-generator liveness,
`w` given as a plain string, and LaTeX commands that lost their backslash. README.md and tools/PACKS.md now document
`w` as required.

**Still open for the user:** [MALAY-TERMS.md](MALAY-TERMS.md) – 9 terms that differ between files (A1–A9, with
counts and a suggestion each), plus new wording to sanity-check. One replacement pass once decided.

## Codebase sweep: Questions and answers on same line (2026-09-24)

**Finding:** All 42 data files (6,536 generators) have question objects where the question (`q:`) and answer (`a:`) are defined on the same line of code.

**Scope:** 5,346 instances across all files:
- Form files (f*.js): 594 instances across 12 files
- Exam files (x*.js): 4,752 instances across 30 files
- Worst offenders: x2d.js (337), x2a.js (302), x1a.js (300), x1d.js (300)

**Impact:** The answer is syntactically embedded immediately after the question in the source code structure:
```javascript
return { q: T(`Question...`), a: T(`Answer...`), w: W(...), sp: 's' };
```

This is not a bug or functional issue—it's a structural characteristic of how the question objects are defined. The answers are not inadvertently exposed in runtime views or output, as they are correctly gated by the `a:` property of each question object.

**Status:** Documented and available for future reference if structural refactoring is desired.
- 2026-09-24 – Malay review samples: `docs/malay-review/*.pdf`, one PDF per issue in MALAY-TERMS.md except A1/A5 (14 files), one Malay
  question per listed topic with working shown, printed from the real site in Chromium. Where the flagged term occurs in a topic the
  question shown is one that contains it; `_report.json` lists topics where no question with the term turned up (the doc's topic lists
  are per source file, so many listed topics never use the term). A7 has no topic list in the doc, so its 21 topics are the ones where
  "songsang" really appears. Not committed.
- 2026-09-25 – Malay term decisions A1–A9 applied (see "Decisions applied" at the top of MALAY-TERMS.md): Betul/Salah for true/false (1,049
  replacements; forged-*palsu* in the tax topic kept), *sudut pedalaman sehala*, *contoh penyangkal*, *isi padu*, *digit pertama*,
  no whisker word (f4c, x4e, x5b rewritten in EN and BM as min-to-Q1 / Q3-to-max distances), x3d oblique-projection sentence, x5b
  "semua cukai dan rebat". `npm run check` 0 problems, browser test passes. Open: B *mata peratusan* (examples sent), A6/A8 wording
  to glance at. Not committed.
- 2026-09-25 – Follow-up: A2 corrected to *sudut pedalaman sehala*; A8 withdrawn (syllabus/form3/ch07 only says "non-orthogonal / slanting
  projection", never "oblique projection"), so the x3d sentence now just says it is not an orthogonal projection. A6 stem-and-leaf wording
  (f1d, x1g) awaiting the user's answer.
- 2026-09-25 – A6 settled: *digit sa* = units digit (7 uses, incl. the 2 *digit sebut* in x1d → *digit sa*); *digit pertama* = first digit and
  *digit terakhir* = last digit are not used in the data. `npm run check` 0 problems.
- 2026-09-25 – B *mata peratusan* (percentage points) confirmed by the user; no change. Other section-B terms not yet reviewed.
- 2026-09-25 – B *titik pusingan*, *sebutan pemalar*, *gelang* confirmed by the user; remaining B terms and section C still to review.
- 2026-09-25 – Section B decisions applied: pengelakan cukai (evasion; legal avoidance renamed penghindaran cukai), menyongsangkan arah simbol ketaksamaan, alat tepi lurus sahaja; other listed B terms kept. check.js 0 problems. Left: 5 working-step phrases + section C.
- 2026-09-25 – Reverted penghindaran cukai -> pengelakan cukai secara sah (user: correct for legal avoidance); ketidaksamaan segi tiga; deduktibel -> lebihan (38); kept the other listed B/C terms. check.js 0 problems. Only the base-b borrowing sentence is unreviewed.
- 2026-09-25 – Number-base column wording: lajur -> tempat in x4a (19 uses; 'tempat seterusnya' for the borrowing sentence). Table/matrix/vector 'lajur' kept. check.js 0 problems. All listed Malay terms now reviewed except any new ones.
- 2026-09-25 – docs/malay-review/ deleted at the user's request (its PDFs showed the pre-decision wording). Malay term decisions committed.
