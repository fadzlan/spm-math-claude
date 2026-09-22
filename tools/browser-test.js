#!/usr/bin/env node
/* Browser smoke test for site/ (Playwright + a real Chromium – not a simulation).
 *
 *   npm install                # once; if it can't find a matching Chromium build, run:
 *                               #   npx playwright install chromium
 *   node tools/browser-test.js # or: npm run test:browser
 *
 * Loads the app both from a local static server and directly via file:// (the "double-click" case the
 * README promises), waits for the lazily-loaded variety packs (js/packs.js -> js/data/x*.js) to land, drives
 * the topic picker and "New questions" through the real DOM (not SPM.generate() called directly), and checks
 * for console errors, uncaught page errors and failed network requests. Also checks, under a slow connection,
 * that the first worksheet waits only on the packs its topics need (js/pack-manifest.js) and not on all of
 * them, that the loading-state UI (js/i18n.js's loadingTitle/loadingBody, wired in js/app.js's generate())
 * appears only while something is actually in flight and hands off cleanly to a real worksheet, that a request
 * superseded while its pack was loading doesn't overwrite the newer worksheet, and that the background
 * prefetch then loads the rest.
 *
 * Exits non-zero (and lists every failed check) if anything is wrong; prints "ok"/"FAIL" per check as it runs.
 */
const path = require('path');
const http = require('http');
const fs = require('fs');
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('playwright is not installed – run `npm install` first (see the comment at the top of this file).');
  process.exit(2);
}

const root = path.join(__dirname, '..', 'site');
const PORT = 8791;
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const file = path.join(root, p);
      if (!file.startsWith(root)) {
        res.writeHead(403);
        return res.end();
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404);
          return res.end('not found');
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

let failures = 0;
function check(cond, msg) {
  if (cond) console.log('  ok   ' + msg);
  else {
    console.log('  FAIL ' + msg);
    failures++;
  }
}

/** run fn(page) inside a fresh context, collecting console/page/network errors */
async function withPage(browser, fn) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('requestfailed', (r) => failedRequests.push(r.url() + ' :: ' + (r.failure() && r.failure().errorText)));
  await fn(page, context);
  await context.close();
  return { consoleErrors, pageErrors, failedRequests };
}

/** click one topic checkbox (by its topic key, e.g. "F1-1.1") through the real DOM; false if it isn't there */
function clickTopic(page, key) {
  return page.evaluate((k) => {
    const cb = document.querySelector(`#tree input[data-key="${k}"]`);
    if (cb) cb.click();
    return !!cb;
  }, key);
}

/** clear the selection, tick exactly the given topics through the real DOM, then let app.js's debounced
 * generate() (200ms) fire, and return the number of rendered questions */
async function pickAndGenerate(page, keys) {
  await page.click('#clear-all');
  for (const k of keys) check(await clickTopic(page, k), `topic checkbox ${k} exists`);
  await page.waitForTimeout(400);
  return page.$$eval('#sheet .questions > li', (els) => els.length).catch(() => 0);
}

function reportDiag(diag, suffix) {
  check(diag.consoleErrors.length === 0, `no console errors${suffix} (${diag.consoleErrors.length})`);
  check(diag.pageErrors.length === 0, `no page errors${suffix} (${diag.pageErrors.length})`);
  check(diag.failedRequests.length === 0, `no failed network requests${suffix} (${diag.failedRequests.length})`);
  for (const e of diag.consoleErrors.concat(diag.pageErrors, diag.failedRequests)) console.log('       ' + e);
}

(async () => {
  console.log('SPM site browser test (Playwright + Chromium)\n');
  const server = await startServer();
  const browser = await chromium.launch();

  console.log('1. served over HTTP');
  {
    const diag = await withPage(browser, async (page) => {
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#tree', { state: 'attached' });
      check((await page.$eval('#tree', (el) => el.innerHTML.length)) > 1000, 'topic tree renders immediately (before the variety packs finish loading)');
      await page.waitForFunction(() => window.SPM && window.SPM.packsLoaded === true, undefined, { timeout: 30000 });
      const total = await page.evaluate(() =>
        Object.values(window.SPM.topics).reduce((s, t) => s + (t.gen.e || []).length + (t.gen.m || []).length + (t.gen.a || []).length, 0)
      );
      check(total > 5000, `variety packs (js/data/x*.js) loaded (${total} generator functions registered)`);
      const qCount = await pickAndGenerate(page, ['F1-1.1', 'F2-11.2', 'F5-8.5']);
      check(qCount === 10, `worksheet generated across 3 forms via real checkboxes (${qCount}/10 questions)`);
      await page.click('.ans-toggle');
      await page.waitForTimeout(100);
      check((await page.$eval('.ans-toggle', (el) => el.getAttribute('aria-expanded'))) === 'true', 'answers toggle works');
    });
    reportDiag(diag, '');
  }

  console.log('2. opened directly via file:// (double-click)');
  {
    const filePath = 'file://' + path.resolve(root, 'index.html');
    const diag = await withPage(browser, async (page) => {
      await page.goto(filePath, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#tree', { state: 'attached' });
      await page.waitForFunction(() => window.SPM && window.SPM.packsLoaded === true, undefined, { timeout: 30000 });
      const qCount = await pickAndGenerate(page, ['F3-9.2']);
      check(qCount > 0, `worksheet generated from file:// (${qCount} questions)`);
    });
    reportDiag(diag, ' over file://');
  }

  console.log('3. on-demand packs and the loading state under a throttled connection');
  {
    const diag = await withPage(browser, async (page, context) => {
      const client = await context.newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: (3 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8, latency: 40 });
      // hold back one pack until released, to supersede a worksheet request while its pack is still loading
      let release;
      const held = new Promise((r) => (release = r));
      await page.route('**/js/data/x3b.js', async (route) => {
        await held;
        await route.continue();
      });
      // watch #sheet from the very start (app.js's first generate() runs before DOMContentLoaded): count the
      // times the loading placeholder is put up, and note which packs had been requested, and whether all packs
      // were in, when the first worksheet appeared
      await page.addInitScript(() => {
        const t = (window.__t = { loading: 0, firstPacks: null, allInAtFirst: null });
        new MutationObserver(() => {
          const sheet = document.getElementById('sheet');
          if (!sheet) return;
          if (sheet.querySelector('.empty') && /preparing|menyediakan/i.test(sheet.textContent)) t.loading++;
          if (!t.firstPacks && sheet.querySelector('.questions')) {
            t.firstPacks = [...document.querySelectorAll('script[src*="js/data/x"]')].map((s) => s.src.replace(/^.*\/(x\w+)\.js$/, '$1')).sort();
            t.allInAtFirst = window.SPM.packsLoaded;
          }
        }).observe(document, { childList: true, subtree: true });
      });
      const loadingCount = () => page.evaluate(() => window.__t.loading);
      const heading = () => page.$eval('#sheet h2', (el) => el.textContent).catch(() => '');
      const qCount = () => page.$$eval('#sheet .questions > li', (els) => els.length).catch(() => 0);

      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#tree', { state: 'attached' });
      await page.waitForFunction(() => window.__t.firstPacks, undefined, { timeout: 30000 });
      const t = await page.evaluate(() => window.__t);
      // the packs of app.js's default selection (a fresh context has no saved state)
      const want = await page.evaluate(() => [...new Set(['F1-1.1', 'F1-1.2', 'F1-1.3', 'F1-1.4', 'F1-1.5'].flatMap((k) => window.SPM.packManifest[k] || []))].sort());
      check(t.loading > 0, 'shows a loading placeholder while the packs for the selected topics are in flight');
      check(want.length > 0 && t.firstPacks.join() === want.join(), `first worksheet requested only the packs its topics need ([${t.firstPacks}], expected [${want}])`);
      check(t.allInAtFirst === false, 'first worksheet rendered without waiting for all the packs');
      check((await qCount()) > 0, `loading placeholder hands off to a worksheet (${await qCount()} questions)`);

      // note the topic keys of every paper app.js actually generates (the heading alone can't tell: it's built
      // from the current selection, not from the paper)
      await page.evaluate(() => {
        const gen = window.SPM.generate;
        window.SPM.generate = (opts) => ((window.__t.lastKeys = opts.keys.join()), gen(opts));
      });
      const lastKeys = () => page.evaluate(() => window.__t.lastKeys);
      // (wait on results rather than fixed times below: packs executing in the background can delay timers)
      let before = await loadingCount();
      await clickTopic(page, 'F1-1.5'); // deselect one: the rest's packs are already in
      await page.waitForFunction(() => window.__t.lastKeys === 'F1-1.1,F1-1.2,F1-1.3,F1-1.4', undefined, { timeout: 10000 }).catch(() => {});
      check((await loadingCount()) === before && (await qCount()) > 0, 'no loading placeholder when the selected topics\' packs are already loaded');

      before = await loadingCount();
      await page.click('#clear-all');
      await clickTopic(page, 'F3-9.2'); // needs the held-back x3b
      await page.waitForFunction((n) => window.__t.loading > n, before, { timeout: 10000 }).catch(() => {});
      check((await loadingCount()) > before, 'loading placeholder when a newly selected topic\'s pack is still loading');
      await clickTopic(page, 'F3-9.2');
      await clickTopic(page, 'F1-1.1'); // its pack is in, so this worksheet renders while x3b is still held
      await page.waitForFunction(() => window.__t.lastKeys === 'F1-1.1', undefined, { timeout: 10000 }).catch(() => {});
      const newer = await heading();
      check((await lastKeys()) === 'F1-1.1' && (await qCount()) > 0, `newer selection renders while the older one's pack is still loading (${await lastKeys()}: "${newer}")`);
      release();
      await page.waitForFunction(() => window.SPM.havePacks(['F3-9.2']), undefined, { timeout: 30000 });
      await page.waitForTimeout(300);
      check((await lastKeys()) === 'F1-1.1' && (await heading()) === newer && (await qCount()) > 0, `the superseded request doesn't overwrite it once its pack lands (last paper generated from: ${await lastKeys()})`);

      await page.waitForFunction(() => window.SPM && window.SPM.packsLoaded === true, undefined, { timeout: 90000 });
      const total = await page.evaluate(() => Object.values(window.SPM.topics).reduce((s, t) => s + (t.gen.e || []).length + (t.gen.m || []).length + (t.gen.a || []).length, 0));
      check(total > 5000, `background prefetch loads the remaining packs (${total} generator functions registered)`);
    });
    reportDiag(diag, ' under throttling');
  }

  await browser.close();
  server.close();

  console.log(`\n${failures === 0 ? 'All checks passed.' : failures + ' check(s) FAILED.'}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error('CRASHED', e);
  process.exit(2);
});
