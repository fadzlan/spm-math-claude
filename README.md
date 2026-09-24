# SPM Mathematics Question Generator

A static website (no backend, no build step) that generates practice questions **and answers** for every
topic in the KSSM Mathematics syllabus, Form 1 – Form 5 (5 forms · 53 chapters · 183 topics), based on the
files in `syllabus/`.

## Run it

Open `site/index.html` in a browser (double-click works – there are no modules or XHR/fetch calls; the page's own
script tags, including the lazily-loaded ones described below, work the same from `file://` as from a server), or
serve the `site/` folder from any static host (GitHub Pages, Netlify, `python3 -m http.server -d site`), or run
`npm run serve` for a dependency-free Node static server with gzip, keep-alive and caching headers
(`tools/serve.js`).

For development, `npm run dev` serves `site/` with Vite (live reload, no build) on port 5180, bound to this
machine's Tailscale IPv4 address (`tailscale ip -4`) so it's reachable over the tailnet only. Set `SPM_HOST` to
bind elsewhere, e.g. `SPM_HOST=127.0.0.1 npm run dev`.

## Features

* Pick any mix of topics (tick a form, a chapter or single topics; search by name in English or Bahasa Melayu).
* Number of questions (1–100) and difficulty: **Easy / Medium / Advanced / Mixed**.
* **Interface language** (EN / BM) and **question language** (EN / BM) are independent.
* **Normal** format leaves working space under each question (sized to the question type);
  **Compact** has no gaps (optionally two columns) so a sheet can be reprinted many times.
* **Working steps** – every question's answer can show the steps that lead to it (formula → substitution → result,
  in both languages). Off by default; switch it on with “Show working steps in the answers” under *More options*.
* **Print / Save as PDF** – the answers are always on their own last page(s), never sharing a page with questions.
  On screen the answers are collapsed until you expand them.
* Light and dark mode (follows the system, can be toggled), responsive layout.
* A *seed* makes any worksheet reproducible; “New questions” draws a new seed.
* Maths is typeset with KaTeX (vendored in `site/vendor/katex`, works offline); diagrams are inline SVG generated
  from the same numbers as the answer key.
* Deep variety: every topic has at least 150 (most have 300–400+) distinct question *templates* – not just
  different numbers, but different task types, wording, representations and contexts – so a 30-question worksheet
  reads as 30 different problems, not the same one re-rolled. See `tools/PACKS.md` for how this is built and
  measured.

## Layout

```
site/
  index.html          page shell
  css/style.css       theme tokens, screen layout, print rules
  js/core.js          random numbers, fractions/algebra helpers, registry, paper generator
  js/svg.js, figs.js  figure builders (number lines, planes, graphs, Venn, circles, triangles …)
  js/vary.js          shared bilingual context banks (shops, foods, places, jobs …) used by the data files
  js/i18n.js          UI strings and worksheet strings (EN / BM)
  js/app.js           user interface
  js/packs.js          loads js/data/x*.js on demand, then the rest in the background (see below)
  js/pack-manifest.js  generated: which x*.js packs extend which topic (npm run manifest)
  js/data/f<form><part>.js   the original generators, chapter by chapter (f1a … f5b)
  js/data/x<form><part>.js   "variety packs" – extra generators added on top with SPM.extend (x1a … x5d)
tools/check.js         stress test of every generator (see below)
tools/working.js       worked-solution coverage per topic (`npm run working [prefix] [list]`)
tools/pack-manifest.js writes site/js/pack-manifest.js (`npm run manifest`; `check.js` fails when it's stale)
tools/variety.js       counts distinct question templates per topic against a 50×-baseline target (see below)
tools/browser-test.js  real-browser smoke test (Playwright) of the page itself (see below)
tools/PACKS.md         the brief used to write/extend a variety pack – the generator contract, what "variety"
                       means here, correctness/bilingual rules, and how to measure a pack
package.json           dev-only tooling deps (Playwright, for tools/browser-test.js) – the site itself needs none
syllabus/              the source syllabus
```

Each topic is `{ id, en, ms, scope, gen: { e: [fn…], m: [fn…], a: [fn…] } }`; a generator `fn(rng)` builds the
numbers first and returns `{ q, a, w, fig?, sp }` with English and Malay text (`SPM.L(en, ms)`), `w` = the worked
solution (`SPM.lines(step, step, …)`; every generator has one – `npm run working` reports coverage), an optional SVG
and an answer-space size. `need(cond)` rejects a random draw and retries. `SPM.extend(key, gen)` (used by the
`x*.js` files) appends more generators to a topic already registered by `addChapter`, without touching the
originals.

**Loading.** `js/data/f*.js` (~700 KB total) load normally and register every topic, so the topic picker and a
first worksheet are ready immediately. `js/data/x*.js` (~5.6 MB together, the extra variety) are loaded by
`js/packs.js` via dynamically-created `<script>` tags: each worksheet first loads just the packs its topics need
(looked up in `js/pack-manifest.js`), showing a brief “preparing the question bank” message only while one is
still in flight, and after the first worksheet the remaining packs are fetched in the background, two at a time.
Nothing is lost if one fails to load, since the base topics already work on their own. After adding a pack or an
`SPM.extend` call, run `npm run manifest` (`npm run check` fails until you do).

## Checking the generators

```
node tools/check.js                     # ~150 questions per topic and level: exceptions, NaN, unbalanced $, EN/BM maths mismatch, KaTeX parse errors …
node tools/check.js F4-1.4 3            # print 3 samples per level for one topic (prefix* works too)
SPM_TOPICS=F1-1. SPM_N=1000 node tools/check.js   # restrict to matching topic-key prefixes, and set draws per topic/level
SPM_PACKS=x1a node tools/check.js        # only load one variety pack's x*.js (plus all the originals) – useful while editing a pack

node tools/variety.js                    # per-topic distinct-question-template count vs. its target, and totals
node tools/variety.js 'F3-1*'            # just the topics starting with F3-1
node tools/variety.js F3-1.2 --show 30   # also print 30 distinct template skeletons of one topic
node tools/variety.js --baseline         # (re)write tools/variety-baseline.json from the current code
```

`check.js` and `variety.js` run the generators directly in Node (no browser needed) – fast, and enough for every
day-to-day change. There's also a real-browser smoke test, for changes to `index.html`/`app.js`/`packs.js` or
anything about how the page itself loads and renders:

```
npm install                # once (dev-only; the site itself has no dependencies or build step)
node tools/browser-test.js # or: npm run test:browser
```

It drives an actual Chromium (via Playwright) through the real UI – served over HTTP and opened directly via
`file://` (the double-click case) – checks the topic picker renders before the variety packs finish loading, that
they do finish loading and a worksheet can be generated across several forms, that the answers toggle works, and
that there are no console errors, page errors or failed network requests; it also throttles the connection once to
confirm the "preparing the question bank…" loading state appears and hands off cleanly. If no matching Chromium
build is cached yet, run `npx playwright install chromium` first.
