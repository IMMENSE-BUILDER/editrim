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
log('health', await page.locator('.ai-health').innerText());
assert.ok((await page.locator('.ai-health').innerText()).includes('AI ready'));
const health = await (await page.request.get('http://127.0.0.1:5173/api/ai')).json();
assert.equal(health.model, 'minimax/minimax-m3.1-flash');

// AI agent: propose edit commands, preview, apply
await page.getByRole('tab', { name: 'Edit' }).click();
await wait(300);
await page.locator('#ai-edit-prompt').fill("Make the 'Bruma' headline cobalt and add a short line under the address: 'Open daily from 7am.'");
await page.locator('.ai-run').click();
await page.waitForSelector('.ai-result-card', { timeout: 60000 });
const planSummary = await page.locator('.ai-plan-summary').innerText();
const commandLabels = await page.locator('.ai-command-list li').allInnerTexts();
log('plan', { planSummary, commandLabels });
assert.ok(commandLabels.length >= 1);
const elementsBefore = await page.locator('.cv-el').count();
await page.getByRole('button', { name: /Apply changes/i }).click();
await wait(700);
const elementsAfter = await page.locator('.cv-el').count();
log('apply', { elementsBefore, elementsAfter });
assert.ok(elementsAfter >= elementsBefore);
const headingColor = await page.locator('.cv-el').filter({ hasText: 'Bruma' }).first().locator('span').first().evaluate(el => getComputedStyle(el).color);
log('headingColorAfterEdit', headingColor);
assert.ok(headingColor.includes('36, 64, 240') || headingColor.includes('24, 64, 240'), headingColor);
await page.screenshot({ path: 'shots/mimo-ai-edit.png' });

// Visual critique
await page.getByRole('tab', { name: 'Review' }).click();
await wait(300);
await page.getByRole('button', { name: /Review this page/i }).click();
await page.waitForSelector('.ai-critique', { timeout: 90000 });
log('critiqueScore', await page.locator('.ai-score strong').innerText());
log('critiqueSummary', (await page.locator('.ai-score-row p').innerText()).slice(0, 160));
assert.ok(await page.locator('.ai-critique').count());
await page.screenshot({ path: 'shots/mimo-ai-critique.png' });

// AI copy
await page.locator('.cv-el').filter({ hasText: 'Bruma' }).first().click({ position: { x: 60, y: 60 } });
await page.getByRole('tab', { name: 'Write' }).click();
await wait(300);
await page.locator('.ai-write-modes button').filter({ hasText: 'rewrite' }).click();
await page.locator('.ai-run').click();
await page.waitForSelector('.ai-copy-result', { timeout: 45000 });
const copy = await page.locator('.ai-copy-result > p').innerText();
log('copy', copy);
assert.ok(copy.length > 3);
await page.screenshot({ path: 'shots/mimo-ai-write.png' });

// AI illustration, now with MiniMax
await page.getByRole('tab', { name: 'Design' }).click();
await wait(300);
await page.locator('.ai-subsection-toggle').click();
await wait(200);
await page.locator('.ai-subsection textarea').fill('Three coffee cups and a sun, geometric, warm cream, coral and cobalt.');
await page.getByRole('button', { name: /Generate illustration/i }).click();
await page.waitForSelector('.ai-illustration-result img', { timeout: 90000 });
const illus = await page.locator('.ai-illustration-result img').getAttribute('src');
log('illustration', { svg: Boolean(illus?.startsWith('data:image/svg+xml')), length: illus?.length });
assert.ok(illus?.startsWith('data:image/svg+xml'));

// Error diagnostics with a simulated gateway failure
await page.route('**/api/ai', async route => {
  if (route.request().method() === 'GET') return route.continue();
  await route.fulfill({
    status: 502,
    contentType: 'application/json',
    body: JSON.stringify({
      ok: false,
      error: 'MiniMax gateway upstream failed.',
      stage: 'gateway',
      code: 'GATEWAY_502',
      status: 502,
      requestId: 'ai_minimax_diag_77',
      model: 'minimax/minimax-m3.1-flash',
    }),
  });
});
await page.getByRole('tab', { name: 'Write' }).click();
await wait(200);
await page.locator('.ai-write-modes button').filter({ hasText: 'compose' }).click();
await page.locator('#ai-write-prompt').fill('A short line for a coffee brand.');
await page.locator('.ai-run').click();
await page.waitForSelector('.ai-error', { timeout: 20000 });
const err = await page.locator('.ai-error').innerText();
log('error', err.replace(/\n/g, ' | '));
assert.ok(err.includes('GATEWAY_502'));
assert.ok(err.includes('ai_minimax_diag_77'));
assert.ok(err.includes('Vercel AI Gateway'));
await page.screenshot({ path: 'shots/mimo-ai-error.png' });

log('errors', errors);
const unexpected = errors.filter(e => !e.includes('GATEWAY_502') && !e.includes('status of 502'));
assert.equal(unexpected.length, 0);
await browser.close();
console.log('MINIMAX AI E2E OK');
