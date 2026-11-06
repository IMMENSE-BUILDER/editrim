import { chromium } from 'playwright';
import assert from 'node:assert';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
const log = (a, b) => console.log(a + ':', typeof b === 'string' ? b : JSON.stringify(b));
const wait = ms => page.waitForTimeout(ms);

await page.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening#ai', { waitUntil: 'networkidle' });
await wait(1800);
log('aiPanel', await page.locator('.ai-panel').count());
log('health', await page.locator('.ai-health').innerText());
await page.screenshot({ path: 'shots/ai-panel.png' });
assert.equal(await page.locator('.ai-panel').count(), 1);

// select heading then write mode
await page.locator('.cv-el').filter({ hasText: 'Bruma' }).first().click({ position: { x: 60, y: 60 } });
await page.getByRole('tab', { name: 'Write' }).click();
await wait(400);
await page.locator('.ai-write-modes button').filter({ hasText: 'rewrite' }).click();
await page.locator('.ai-run').click();
await page.waitForSelector('.ai-copy-result', { timeout: 45000 });
const copy = await page.locator('.ai-copy-result > p').innerText();
log('aiCopy', copy);
assert.ok(copy.length > 3);
await page.screenshot({ path: 'shots/ai-write.png' });
const copyDiag = await page.locator('.ai-error').count();
log('writeErrors', copyDiag);

// design generation
await page.getByRole('tab', { name: 'Design' }).click();
await wait(300);
await page.locator('#ai-design-prompt').fill('A launch poster for Bruma, a slow coffee brand. Warm, editorial, confident, with a coffee photo.');
await page.locator('.ai-run').click();
await page.waitForSelector('.ai-result-card', { timeout: 90000 });
log('designResult', await page.locator('.ai-result-head').innerText());
log('designElements', await page.locator('.ai-design-preview .page-preview').count());
await page.screenshot({ path: 'shots/ai-design.png' });
const pagesBefore = await page.locator('.page-item').count();
await page.getByRole('button', { name: /Add as new page/i }).click();
await wait(700);
const pagesAfter = await page.locator('.page-item').count();
log('addAiPage', { pagesBefore, pagesAfter });
assert.equal(pagesAfter, pagesBefore + 1);

// illustration
await page.locator('.ai-subsection-toggle').click();
await wait(200);
await page.locator('.ai-subsection textarea').fill('Three coffee cups and a sun, geometric, warm cream, coral and cobalt.');
await page.getByRole('button', { name: /Generate illustration/i }).click();
await page.waitForSelector('.ai-illustration-result img', { timeout: 90000 });
const svgSrc = await page.locator('.ai-illustration-result img').getAttribute('src');
log('illustration', { hasSvg: Boolean(svgSrc?.startsWith('data:image/svg+xml')), chars: svgSrc?.length });
assert.ok(svgSrc?.startsWith('data:image/svg+xml'));
await page.screenshot({ path: 'shots/ai-illustration.png' });

// critique
await page.getByRole('tab', { name: 'Review' }).click();
await wait(300);
await page.getByRole('button', { name: /Review this page/i }).click();
await page.waitForSelector('.ai-critique', { timeout: 60000 });
log('critiqueScore', await page.locator('.ai-score strong').innerText());
log('critiqueSummary', (await page.locator('.ai-score-row p').innerText()).slice(0, 120));
await page.screenshot({ path: 'shots/ai-critique.png' });

// simulate a gateway failure and verify diagnostics UI
await page.route('**/api/ai', async route => {
  if (route.request().method() === 'GET') return route.continue();
  await route.fulfill({
    status: 502,
    contentType: 'application/json',
    body: JSON.stringify({
      ok: false,
      error: 'Simulated gateway failure for diagnostics test.',
      stage: 'gateway',
      code: 'GATEWAY_502',
      status: 502,
      requestId: 'ai_test_12345',
      model: 'minimax/minimax-m3.1-flash',
    }),
  });
});
await page.getByRole('tab', { name: 'Write' }).click();
await wait(300);
await page.locator('.ai-write-modes button').filter({ hasText: 'compose' }).click();
await page.locator('#ai-write-prompt').fill('A short diagnostics test headline.');
await page.locator('.ai-run').click();
await page.waitForSelector('.ai-error', { timeout: 20000 });
const errText = await page.locator('.ai-error').innerText();
log('errorCard', errText.replace(/\n/g, ' | '));
assert.ok(errText.includes('GATEWAY_502'));
assert.ok(errText.includes('ai_test_12345'));
assert.ok(errText.includes('Vercel AI Gateway'));
await page.screenshot({ path: 'shots/ai-error.png' });

log('pageErrors', errors);
const unexpected = errors.filter(e => !e.includes('GATEWAY_502') && !e.includes('status of 502'));
assert.equal(unexpected.length, 0);
await browser.close();
console.log('AI E2E OK');
