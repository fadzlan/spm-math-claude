const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('requestfailed', (req) => failedRequests.push(req.url() + ' :: ' + (req.failure() && req.failure().errorText)));

  const filePath = 'file://' + path.resolve('site/index.html');
  console.log('--- loading via file:// ---', filePath);
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#tree', { state: 'attached' });
  console.log('tree attached over file://');

  await page.waitForFunction(() => window.SPM && window.SPM.packsLoaded === true, { timeout: 30000 });
  console.log('packsLoaded true over file://');

  const genCounts = await page.evaluate(() => {
    const S = window.SPM;
    let total = 0;
    for (const k of Object.keys(S.topics)) {
      const t = S.topics[k];
      total += (t.gen.e || []).length + (t.gen.m || []).length + (t.gen.a || []).length;
    }
    return total;
  });
  console.log('total generator fns after packs loaded (file://):', genCounts);

  // pick one topic and generate
  await page.evaluate(() => {
    const cb = document.querySelector('input[type=checkbox][value="F3-9.2"]') ||
               [...document.querySelectorAll('input[type=checkbox]')].find((el) => el.value === 'F3-9.2');
    if (cb) cb.click();
  });
  await page.waitForTimeout(400);
  const qCount = await page.$$eval('#sheet .questions > li', (els) => els.length).catch(() => -1);
  console.log('question count rendered (file://):', qCount);

  console.log('console errors:', consoleErrors.length, consoleErrors.slice(0, 5));
  console.log('page errors:', pageErrors.length, pageErrors.slice(0, 5));
  console.log('failed requests:', failedRequests.length, failedRequests.slice(0, 10));

  await browser.close();
  process.exit(consoleErrors.length || pageErrors.length || failedRequests.length || qCount <= 0 ? 1 : 0);
})().catch((e) => { console.error('TEST CRASHED', e); process.exit(2); });
