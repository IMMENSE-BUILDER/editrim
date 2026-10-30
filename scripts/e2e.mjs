import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

const log = (label, value) => console.log(`${label}:`, typeof value === 'string' ? value : JSON.stringify(value));

await page.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
log('URL', page.url());
log('elementCount', await page.locator('.cv-el').count());
assert.equal(await page.locator('.cv-el').count(), 9, 'template element count');

// select primary heading
const heading = page.locator('.cv-el').filter({ hasText: 'Bruma' }).first();
await heading.click({ position: { x: 60, y: 60 } });
await page.waitForTimeout(200);
log('selectionVisible', await page.locator('.cv-sel').count());
const leftBefore = await heading.evaluate(el => el.style.left);
await page.mouse.move(700, 300);
await page.mouse.down();
await page.mouse.move(760, 330, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(200);
const leftAfter = await heading.evaluate(el => el.style.left);
log('drag', { leftBefore, leftAfter });
assert.notEqual(leftBefore, leftAfter, 'element moved');

await page.locator('.ed-top-center button[title^="Undo"]').click();
await page.waitForTimeout(250);
log('afterUndo', await heading.evaluate(el => el.style.left));
assert.equal(await heading.evaluate(el => el.style.left), leftBefore, 'undo restores position');

// text editing
await heading.dblclick({ position: { x: 50, y: 50 } });
await page.waitForTimeout(200);
log('textareas', await page.locator('.cv-text-editor').count());
assert.equal(await page.locator('.cv-text-editor').count(), 1);
await page.locator('.cv-text-editor').fill('Bruma Coffee');
await page.locator('.cv-controls').click({ position: { x: 10, y: 10 } });
await page.waitForTimeout(250);
log('textUpdated', await page.locator('.cv-el').filter({ hasText: 'Bruma Coffee' }).count());

// add shape
await page.getByRole('button', { name: 'Elements' }).click();
await page.waitForTimeout(200);
const beforeAdd = await page.locator('.cv-el').count();
await page.locator('.shape-btn').first().click();
await page.waitForTimeout(250);
const afterAdd = await page.locator('.cv-el').count();
log('addShape', { beforeAdd, afterAdd });
assert.equal(afterAdd, beforeAdd + 1);

// add layout
await page.getByRole('button', { name: 'Templates' }).click();
await page.waitForTimeout(150);
await page.locator('.layout-card').first().click();
await page.waitForTimeout(400);
log('afterLayout', await page.locator('.cv-el').count());

// pages
await page.locator('.page-add').click();
await page.waitForTimeout(300);
log('pageCount', await page.locator('.page-item').count());
assert.equal(await page.locator('.page-item').count(), 2);
await page.screenshot({ path: 'shots/editor-actions.png' });

// undo / redo
await page.keyboard.press('Escape');
await page.locator('.ed-top-center button[title^="Undo"]').click();
await page.waitForTimeout(250);
log('pageCountAfterUndo', await page.locator('.page-item').count());

// export png
await page.locator('.ed-download').click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'shots/export-modal.png' });
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 30000 }),
  page.locator('.modal-footer button.btn-cobalt').click(),
]);
const path = 'shots/export.png';
await download.saveAs(path);
const buf = fs.readFileSync(path);
const w = buf.readUInt32BE(16);
const h = buf.readUInt32BE(20);
log('export', { bytes: buf.length, w, h, name: download.suggestedFilename() });
assert.equal(w, 2160);
assert.equal(h, 2160);

// share
await page.getByRole('button', { name: /Share/ }).click();
await page.waitForTimeout(800);
const shareUrl = await page.locator('#share-url').inputValue();
log('shareLength', shareUrl.length);
await page.screenshot({ path: 'shots/share-modal.png' });
assert.ok(shareUrl.includes('/view#d='));
const sharePage = await context.newPage();
await sharePage.goto(shareUrl, { waitUntil: 'networkidle' });
await sharePage.waitForTimeout(900);
log('sharedTitle', await sharePage.locator('.shared-info h1').innerText());
assert.ok(await sharePage.locator('.shared-page-wrap').count());
await sharePage.screenshot({ path: 'shots/shared.png' });
await sharePage.close();

// resize
await page.keyboard.press('Escape');
await page.locator('.ed-size-pill').click();
await page.waitForTimeout(300);
await page.locator('.resize-presets button').nth(2).click();
await page.screenshot({ path: 'shots/resize-modal.png' });
await page.locator('.modal-footer .btn-cobalt').click();
await page.waitForTimeout(500);
log('sizeAfterResize', await page.locator('.ed-size-pill').innerText());

// present
await page.getByRole('button', { name: /Present/ }).click();
await page.waitForTimeout(900);
log('presentURL', page.url());
await page.screenshot({ path: 'shots/present.png' });
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(300);
log('presentCount', await page.locator('.present-count').innerText());

log('errors', errors);
assert.equal(errors.length, 0, 'no console/page errors');
await browser.close();
console.log('E2E OK');
