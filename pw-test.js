const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('requestfailed', (req) => failedRequests.push(req.url() + ' :: ' + (req.failure() && req.failure().errorText)));

  console.log('--- loading page (HTTP server) ---');
  const t0 = Date.now();
  await page.goto('http://localhost:8791/index.html', { waitUntil: 'domcontentloaded' });
  console.log('DOMContentLoaded at', Date.now() - t0, 'ms');

  // topic picker should be usable immediately, before packs finish loading
  await page.waitForSelector('#tree', { state: 'attached' });
  const treeHtmlLen = (await page.$eval('#tree', (el) => el.innerHTML.length));
  console.log('tree populated immediately, innerHTML length:', treeHtmlLen);

  const packsLoadedEarly = await page.evaluate(() => window.SPM && window.SPM.packsLoaded);
  console.log('packsLoaded right after DOMContentLoaded:', packsLoadedEarly, '(expected false or already-true race)');

  // wait for packs to finish (SPM.packsReady)
  await page.waitForFunction(() => window.SPM && window.SPM.packsLoaded === true, { timeout: 30000 });
  console.log('packsLoaded became true at', Date.now() - t0, 'ms');

  const genCounts = await page.evaluate(() => {
    const S = window.SPM;
    let total = 0;
    for (const k of Object.keys(S.topics)) {
      const t = S.topics[k];
      total += (t.gen.e || []).length + (t.gen.m || []).length + (t.gen.a || []).length;
    }
    return { topics: Object.keys(S.topics).length, totalGenerators: total };
  });
  console.log('topics:', genCounts.topics, 'total generator fns after packs loaded:', genCounts.totalGenerators);

  // select a few topics across forms via the real UI (checkboxes), then click "New questions"
  console.log('--- selecting topics via checkboxes ---');
  await page.click('#filter'); // focus search
  await page.fill('#filter', '');
  // find topic checkboxes by data key attribute used in the tree; inspect actual markup first
  const sampleCheckbox = await page.$eval('#tree', (el) => el.querySelector('input[type=checkbox]')?.outerHTML || 'NONE');
  console.log('sample checkbox markup:', sampleCheckbox);

  const keysToPick = ['F1-1.1', 'F2-11.2', 'F5-8.5'];
  for (const k of keysToPick) {
    const found = await page.evaluate((key) => {
      const cb = document.querySelector(`input[type=checkbox][value="${key}"]`) ||
                 document.querySelector(`input[type=checkbox][data-key="${key}"]`);
      if (cb) { cb.click(); return true; }
      return false;
    }, k);
    console.log('clicked checkbox for', k, ':', found);
  }

  await page.waitForTimeout(400); // debounce inside app.js schedules generate()

  const sheetText = await page.$eval('#sheet', (el) => el.innerText.slice(0, 300));
  console.log('--- sheet preview ---');
  console.log(sheetText);

  const qCount = await page.$$eval('#sheet .questions > li', (els) => els.length);
  console.log('question count rendered:', qCount);

  // check answers section exists and toggling works
  const hasAnswers = await page.$('#answers');
  console.log('answers section present:', !!hasAnswers);
  if (hasAnswers) {
    await page.click('.ans-toggle');
    await page.waitForTimeout(100);
    const expanded = await page.$eval('.ans-toggle', (el) => el.getAttribute('aria-expanded'));
    console.log('answers expanded after toggle:', expanded);
  }

  // theme toggle + print button existence sanity
  const printBtn = await page.$('#print-btn');
  console.log('print button present:', !!printBtn);

  console.log('--- diagnostics ---');
  console.log('console errors:', consoleErrors.length, consoleErrors.slice(0, 5));
  console.log('page errors:', pageErrors.length, pageErrors.slice(0, 5));
  console.log('failed requests:', failedRequests.length, failedRequests.slice(0, 10));

  await browser.close();
  process.exit(consoleErrors.length || pageErrors.length || failedRequests.length ? 1 : 0);
})().catch((e) => { console.error('TEST CRASHED', e); process.exit(2); });
