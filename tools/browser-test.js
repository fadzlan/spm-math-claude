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
 * for console errors, uncaught page errors and failed network requests. Also checks the loading-state UI
 * (js/i18n.js's loadingTitle/loadingBody, wired in js/app.js's generate()) actually appears under a slow
 * connection, and that it hands off cleanly to a real worksheet once the packs finish.
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

/** tick the given topic checkboxes (by their `value`, e.g. "F1-1.1") through the real DOM, then let app.js's
 * debounced generate() (200ms) fire, and return the number of rendered questions */
async function pickAndGenerate(page, keys) {
  for (const k of keys) {
    await page.evaluate((key) => {
      const cb = [...document.querySelectorAll('input[type=checkbox]')].find((el) => el.value === key);
      if (cb) cb.click();
    }, k);
  }
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

  console.log('3. loading-state UI under a throttled connection');
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: (3 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8, latency: 40 });
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#tree', { state: 'attached' });
    await page.evaluate(() => {
      const cb = [...document.querySelectorAll('input[type=checkbox]')].find((el) => el.value === 'F1-6.4');
      if (cb) cb.click();
    });
    await page.waitForTimeout(50);
    const duringLoad = await page.$eval('#sheet', (el) => el.innerText).catch(() => '');
    check(/preparing|loading|menyediakan/i.test(duringLoad), 'shows a loading placeholder while the variety packs are still in flight');
    await page.waitForFunction(() => window.SPM && window.SPM.packsLoaded === true, undefined, { timeout: 60000 });
    await page.waitForTimeout(300);
    const qCount = await page.$$eval('#sheet .questions > li', (els) => els.length).catch(() => 0);
    check(qCount > 0, `worksheet renders once the packs finish loading (${qCount} questions)`);
    await context.close();
  }

  await browser.close();
  server.close();

  console.log(`\n${failures === 0 ? 'All checks passed.' : failures + ' check(s) FAILED.'}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error('CRASHED', e);
  process.exit(2);
});
