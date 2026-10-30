import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const log = (a, b) => console.log(a + ':', typeof b === 'string' ? b : JSON.stringify(b));
const wait = ms => page.waitForTimeout(ms);

await page.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening', { waitUntil: 'networkidle' });
await wait(1200);

// background gradient
await page.keyboard.press('Escape');
await page.locator('.ed-rail button[title="Background"]').click();
await wait(300);
await page.locator('.bg-controls .segmented button').nth(1).click();
await wait(400);
const bgImage = await page.locator('.cv-page-clip > div').first().evaluate(el => getComputedStyle(el).backgroundImage);
log('gradient', bgImage.slice(0, 60));
assert.ok(bgImage.includes('linear-gradient'));

// solid swatch
await page.locator('.bg-controls .segmented button').nth(0).click();
await wait(300);
await page.locator('.swatch-grid button').nth(12).click();
await wait(300);
const bgColor = await page.locator('.cv-page-clip > div').first().evaluate(el => getComputedStyle(el).backgroundColor);
log('solid', bgColor);

// add shape via Elements and lock it
await page.locator('.ed-rail button[title="Elements"]').click();
await wait(300);
await page.locator('.shape-btn').nth(1).click();
await wait(300);
await page.locator('.insp-sel-actions button').nth(1).click(); // lock
await wait(300);
const lockedBefore = await page.locator('.cv-el.is-locked').count();
log('locked', lockedBefore);
const sel = page.locator('.cv-el.is-locked').first();
const before = await sel.evaluate(el => el.style.left);
const box = await sel.boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 30, { steps: 6 });
  await page.mouse.up();
}
await wait(300);
log('lockedMove', { before, after: await sel.evaluate(el => el.style.left) });
assert.equal(await sel.evaluate(el => el.style.left), before);

// unlock via layer panel
await page.locator('.insp-tabs button').nth(1).click();
await wait(300);
const lockedRow = page.locator('.layer-row').filter({ hasText: 'Circle' }).first();
await lockedRow.locator('.layer-action').nth(1).click();
await wait(300);
log('lockedAfterUnlock', await page.locator('.cv-el.is-locked').count());
assert.equal(await page.locator('.cv-el.is-locked').count(), 0);

// zoom
const zoomText = await page.locator('.cv-zoom-val').innerText();
await page.locator('.cv-controls button[title="Zoom in"]').click();
await wait(250);
const zoomText2 = await page.locator('.cv-zoom-val').innerText();
log('zoom', { zoomText, zoomText2 });
assert.notEqual(zoomText, zoomText2);
await page.locator('.cv-controls button[title="Fit to screen"]').click();
await wait(300);

// shortcuts modal
await page.keyboard.press('?');
await wait(400);
log('shortcuts', await page.locator('.shortcuts-grid').count());
assert.equal(await page.locator('.shortcuts-grid').count(), 1);
await page.keyboard.press('Escape');

// transparent PNG
await page.locator('.ed-download').click();
await wait(300);
await page.locator('.export-option-row').nth(2).locator('.switch').click();
const [dl] = await Promise.all([
  page.waitForEvent('download', { timeout: 30000 }),
  page.locator('.modal-footer .btn-cobalt').click(),
]);
await dl.saveAs('shots/transparent.png');
const b64 = fs.readFileSync('shots/transparent.png').toString('base64');
const alpha = await page.evaluate(async (b64) => {
  const img = new Image();
  await new Promise(res => { img.onload = res; img.src = 'data:image/png;base64,' + b64; });
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return [...ctx.getImageData(0, 0, 1, 1).data];
}, b64);
log('transparentCorner', { alpha: alpha[3], width: await page.evaluate(b64 => 0, b64) });
assert.equal(alpha[3], 0, 'corner is transparent');

// navigation hash scroll
await page.goto('http://127.0.0.1:5173/templates', { waitUntil: 'networkidle' });
await page.getByRole('link', { name: 'Features' }).click();
await wait(1200);
log('hashUrl', page.url());
const feat = await page.locator('#features').evaluate(el => el.getBoundingClientRect().top);
log('featuresTop', feat);
assert.ok(page.url().includes('#features'));

log('errors', errors);
assert.equal(errors.length, 0);
await browser.close();
console.log('E2E FINAL OK');
