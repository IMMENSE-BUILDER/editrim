import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

/**
 * Canva Pro parity audit: exercises the features added in this pass through the
 * real editor shell — Magic Resize variants, version history, bulk create,
 * command palette, inline AI, export suite, presenter notes, text effects,
 * image crop/masks, marquee + tidy.
 */

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

const wait = (ms) => page.waitForTimeout(ms);
const log = (label, value) => console.log(label, value);

await page.goto(`${base}/editor/new?template=cafe-opening`, { waitUntil: 'networkidle' });
await page.waitForSelector('.cv-page');
await wait(700);
const editorUrl = page.url();
const designId = editorUrl.split('/editor/')[1].split(/[?#]/)[0];
log('designId', designId);
assert.ok(designId.startsWith('d_'));

/* ---------- text effects ---------- */
await page.locator('.cv-el').filter({ hasText: 'Bruma' }).first().click();
await wait(300);
assert.equal(await page.locator('.insp-effect-grid').count(), 1, 'text effects are available');
await page.locator('.insp-effect-grid button', { hasText: 'Outline' }).click();
await wait(200);
const stroke = await page.evaluate(() => {
  const el = document.querySelector('.cv-el.is-selected > div') ?? document.querySelector('.cv-el.is-selected');
  return el ? getComputedStyle(el).webkitTextStrokeWidth : null;
});
log('outlineStroke', stroke);
assert.ok(stroke && stroke !== '0px', 'outline applies a text stroke');

await page.locator('.insp-effect-grid button', { hasText: 'Highlight' }).click();
await wait(200);
const highlight = await page.evaluate(() => {
  const el = document.querySelector('.cv-el.is-selected > div') ?? document.querySelector('.cv-el.is-selected');
  return el ? getComputedStyle(el).backgroundColor : null;
});
log('highlight', highlight);
assert.ok(highlight && highlight !== 'rgba(0, 0, 0, 0)', 'highlight paints a background');
await page.keyboard.press('Control+z');
await page.keyboard.press('Control+z');

/* ---------- inline AI: compact trigger, explicit expansion ---------- */
assert.equal(await page.locator('.iai-trigger').count(), 1, 'inline AI trigger appears for selected text');
await page.screenshot({ path: 'shots/studio-inline-ai-trigger.png' });
await page.locator('.iai-trigger').click();
await wait(250);
await page.screenshot({ path: 'shots/studio-inline-ai-open.png' });
const inlineActions = await page.locator('.iai-pill .iai-action').count();
log('inlineActions', inlineActions);
assert.ok(inlineActions >= 5, 'inline AI exposes rewrite, shorten, expand, tone and translate');
await page.locator('.iai-close').click();
await wait(200);
assert.equal(await page.locator('.iai-trigger').count(), 1, 'closing collapses back to the trigger');

/* ---------- image crop and mask ---------- */
await page.locator('.ed-rail > button[title="Elements"]').click();
await wait(400);
await page.locator('.photo-btn').first().click();
await wait(900);
await page.locator('.cv-el img').last().click();
await wait(300);
assert.equal(await page.locator('.insp-mask-grid').count(), 1, 'mask picker is available');
await page.locator('.insp-mask-grid button', { hasText: 'Circle' }).click();
await wait(250);
const clip = await page.evaluate(() => {
  const img = document.querySelector('.cv-el.is-selected img');
  return img?.parentElement ? getComputedStyle(img.parentElement).clipPath : null;
});
log('maskClip', clip);
assert.ok(clip?.includes('ellipse'), 'circle mask clips the image');

const zoom = page.locator('.slider-field').filter({ hasText: 'Zoom' }).locator('input[type=range]').first();
await zoom.evaluate(input => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, '160');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await wait(250);
const cropZoom = await page.evaluate(() => {
  const img = document.querySelector('.cv-el.is-selected img');
  return img ? getComputedStyle(img).transform : null;
});
log('cropTransform', cropZoom);
assert.ok(cropZoom && cropZoom !== 'none', 'crop zoom transforms the image');

/* ---------- tidy up ---------- */
await page.keyboard.press('Escape');
await page.keyboard.press('Control+a');
await wait(200);
const before = await page.evaluate(() => [...document.querySelectorAll('.cv-el')].map(el => Math.round(el.getBoundingClientRect().left)).slice(0, 4));
await page.locator('.inspector button', { hasText: 'Tidy up' }).click();
await wait(350);
const after = await page.evaluate(() => [...document.querySelectorAll('.cv-el')].map(el => Math.round(el.getBoundingClientRect().left)).slice(0, 4));
log('tidy', { before, after });
assert.notDeepEqual(before, after, 'tidy up repositions the selection');
await page.keyboard.press('Control+z');

/* ---------- speaker notes ---------- */
await page.keyboard.press('Escape');
await wait(200);
const notes = page.locator('.insp-notes');
assert.equal(await notes.count(), 1, 'speaker notes field exists');
await notes.fill('Studio parity note.');
await wait(300);
await page.locator('.inspector select').filter({ hasText: 'Page transition' }).count().catch(() => 0);

/* ---------- marquee ---------- */
const pageBox = await page.locator('.cv-page').boundingBox();
assert.ok(pageBox);
await page.mouse.move(pageBox.x + 30, pageBox.y + 30);
await page.mouse.down();
await page.mouse.move(pageBox.x + pageBox.width * 0.65, pageBox.y + pageBox.height * 0.65, { steps: 12 });
await page.mouse.up();
await wait(250);
const marqueeSelected = await page.locator('.cv-el.is-selected').count();
log('marqueeSelected', marqueeSelected);
assert.ok(marqueeSelected >= 2, 'marquee selects multiple elements');

/* ---------- version history (auto snapshot) ---------- */
await wait(4200);
await page.locator('button[title="Version history"]').click();
await wait(600);
const historyRows = await page.locator('.history-entry, .history-row, .history-item').count();
const historySnapshot = await page.evaluate(async () => {
  const request = indexedDB.open('editrim-history');
  return new Promise(resolve => {
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('snapshots')) { db.close(); resolve(0); return; }
      const tx = db.transaction('snapshots', 'readonly');
      const count = tx.objectStore('snapshots').count();
      tx.oncomplete = () => { const n = count.result; db.close(); resolve(n); };
    };
    request.onerror = () => resolve(0);
  });
});
log('history', { historyRows, historySnapshot });
assert.ok(historyRows >= 1, 'history drawer lists versions');
assert.ok(historySnapshot >= 1, 'autosave snapshot is stored in IndexedDB');
await page.screenshot({ path: 'shots/studio-pro-history.png' });
await page.keyboard.press('Escape');
await wait(300);

/* ---------- command palette ---------- */
await page.keyboard.press('Control+k');
await wait(350);
assert.equal(await page.locator('.cmd-panel').count(), 1, 'command palette opens');
await page.locator('.cmd-input').fill('history');
await wait(250);
assert.ok(await page.locator('.cmd-row').first().isVisible());
await page.locator('.cmd-input').press('Enter');
await wait(500);
assert.ok(await page.locator('.history-drawer').isVisible(), 'command runs');
await page.keyboard.press('Escape');
await wait(300);

/* ---------- magic resize ---------- */
await page.locator('button[title="Resize & variants"]').click();
await wait(500);
await page.getByRole('button', { name: /Instagram post/ }).first().click();
await page.getByRole('button', { name: /Story/ }).first().click();
await page.getByRole('button', { name: /Create 2 variants/ }).click();
await wait(2500);
const openButtons = await page.getByRole('button', { name: /^Open/ }).count();
log('resizeOpenButtons', openButtons);
assert.ok(openButtons >= 2, 'two variants were created');
await page.screenshot({ path: 'shots/studio-pro-resize.png' });
await page.getByRole('button', { name: 'Done' }).click();
await wait(300);

const variants = await page.evaluate(() => {
  const found = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('editrim.design.v1.')) continue;
    const design = JSON.parse(localStorage.getItem(key));
    if (design.category === 'Resize') found.push({ id: design.id, title: design.title, variantOf: design.variantOf, rootId: design.rootId });
  }
  return found;
});
log('variants', variants);
assert.ok(variants.length >= 2, 'variants persist as real designs');
assert.ok(variants.every(v => v.variantOf && v.rootId), 'variants link to their source');

/* ---------- export suite ---------- */
await page.locator('.ed-download').click();
await wait(400);
const formats = await page.locator('.export-format').allTextContents();
log('formats', formats.map(t => t.trim().split('\n')[0]));
assert.equal(formats.length, 5, 'five export formats');
await page.locator('.export-format', { hasText: 'SVG' }).click();
const [svgDownload] = await Promise.all([
  page.waitForEvent('download', { timeout: 30000 }),
  page.locator('.modal-footer .btn-cobalt').click(),
]);
await svgDownload.saveAs('shots/studio-pro.svg');
const svg = fs.readFileSync('shots/studio-pro.svg', 'utf8');
assert.ok(svg.startsWith('<svg'), 'SVG starts with an svg root');
assert.ok(svg.includes('<text'), 'SVG contains real text');
assert.ok(!svg.includes('<foreignObject'), 'SVG is not a foreignObject screenshot');

await wait(400);
await page.locator('.ed-download').click();
await wait(400);
await page.locator('.export-format', { hasText: 'WebP' }).click();
const [webpDownload] = await Promise.all([
  page.waitForEvent('download', { timeout: 30000 }),
  page.locator('.modal-footer .btn-cobalt').click(),
]);
await webpDownload.saveAs('shots/studio-pro.webp');
const webp = fs.readFileSync('shots/studio-pro.webp');
assert.equal(webp.subarray(0, 4).toString(), 'RIFF');
assert.equal(webp.subarray(8, 12).toString(), 'WEBP');

/* ---------- present + notes ---------- */
await page.locator('.ed-action', { hasText: 'Present' }).click();
await page.waitForSelector('.present-page');
await wait(500);
const counter = await page.locator('.present-count').innerText();
log('presentCounter', counter);
assert.match(counter, /1 \/ \d+/);
await page.keyboard.press('n');
await wait(250);
const noteVisible = await page.locator('.present-notes').filter({ hasText: 'Studio parity note.' }).count();
assert.ok(noteVisible >= 1, 'speaker notes appear in present mode');
await page.screenshot({ path: 'shots/studio-pro-present.png' });
await page.keyboard.press('Escape');
await wait(250);
await page.keyboard.press('Escape');
await page.waitForURL(/\/editor\//, { timeout: 15000 });
await page.waitForSelector('.cv-page');

/* ---------- presenter view ---------- */
await page.goto(`${base}/present/${designId}?presenter=1`, { waitUntil: 'networkidle' });
await page.waitForSelector('.presenter-stage, .presenter-rail');
const timer = await page.locator('.presenter-clock-time').innerText();
log('presenterTimer', timer);
assert.match(timer, /\d{2}:\d{2}/, 'presenter timer runs');
assert.ok(await page.locator('.presenter-notes').count() >= 1, 'presenter shows notes');

const health = await page.request.get(`${base}/api/ai`);
log('aiHealth', health.status());
assert.equal(health.status(), 200);

log('errors', errors.slice(0, 5));
assert.equal(errors.length, 0, 'no console errors');
await browser.close();
console.log('STUDIO PRO E2E OK');
