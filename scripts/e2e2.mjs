import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
const log = (a, b) => console.log(a + ':', typeof b === 'string' ? b : JSON.stringify(b));
const wait = ms => page.waitForTimeout(ms);

// fresh editor
await page.goto('http://127.0.0.1:5173/editor/new?template=porter-pitch', { waitUntil: 'networkidle' });
await wait(1000);
log('initialURL', page.url());
assert.ok(await page.locator('.cv-page').count());

// page menu (fixed popover)
await page.locator('.page-item').first().hover();
await page.locator('.page-menu-btn').first().click();
await wait(300);
const menuBox = await page.locator('.page-menu').boundingBox();
log('pageMenu', menuBox);
assert.ok(menuBox && menuBox.y < 910 && menuBox.y > 60, 'menu is over the canvas, not clipped');
await page.screenshot({ path: 'shots/page-menu-fixed.png' });
await page.locator('.page-menu button').first().click();
await wait(400);
log('pagesAfterDuplicate', await page.locator('.page-item').count());
assert.equal(await page.locator('.page-item').count(), 5);

// present multi-page
await page.getByRole('button', { name: /Present/ }).click();
await wait(800);
log('presentCounter1', await page.locator('.present-count').innerText());
await page.keyboard.press('ArrowRight');
await wait(300);
log('presentCounter2', await page.locator('.present-count').innerText());
assert.equal(await page.locator('.present-count').innerText(), '2 / 5');
await page.keyboard.press('Escape');
await wait(700);
assert.ok(page.url().includes('/editor/'));

// PDF export all pages
await page.locator('.ed-download').click();
await wait(300);
await page.locator('.export-format').nth(2).click();
await page.locator('.export-option-row').first().locator('button').nth(1).click();
const [pdfDownload] = await Promise.all([
  page.waitForEvent('download', { timeout: 40000 }),
  page.locator('.modal-footer .btn-cobalt').click(),
]);
await pdfDownload.saveAs('shots/porter.pdf');
const pdfBuf = fs.readFileSync('shots/porter.pdf');
log('pdf', { bytes: pdfBuf.length, header: pdfBuf.subarray(0, 4).toString() });
assert.equal(pdfBuf.subarray(0, 4).toString(), '%PDF');

// JPG export
await page.locator('.ed-download').click();
await wait(300);
await page.locator('.export-format').nth(1).click();
const [jpgDownload] = await Promise.all([
  page.waitForEvent('download', { timeout: 30000 }),
  page.locator('.modal-footer .btn-cobalt').click(),
]);
await jpgDownload.saveAs('shots/export.jpg');
const jpgBuf = fs.readFileSync('shots/export.jpg');
log('jpg', { bytes: jpgBuf.length, marker: jpgBuf.subarray(0, 2).toString('hex') });
assert.equal(jpgBuf.subarray(0, 2).toString('hex'), 'ffd8');

// upload image
await page.getByRole('button', { name: 'Uploads' }).click();
await wait(300);
const fileInput = page.locator('.lp input[type=file]');
await fileInput.setInputFiles('shots/cafe-export.png');
await page.waitForTimeout(2600);
log('imageElements', await page.locator('.cv-el img').count());
assert.ok(await page.locator('.cv-el img').count() >= 1, 'uploaded image inserted');
const uploadedLoaded = await page.locator('.cv-el img').last().evaluate(img => img.naturalWidth > 0);
log('uploadedLoaded', uploadedLoaded);
assert.ok(uploadedLoaded);
await page.screenshot({ path: 'shots/upload-editor.png' });

// autosave + reload
await wait(1200);
const url = page.url();
await page.reload({ waitUntil: 'networkidle' });
await wait(1200);
log('reloadURL', page.url());
assert.equal(page.url(), url);
assert.ok(await page.locator('.cv-el img').count() >= 1, 'upload survives reload');

// dashboard
await page.click('.ed-back');
await wait(800);
assert.ok(page.url().includes('/dashboard'));
const cards = await page.locator('.home-design-card').count();
log('dashboardCards', cards);
await page.locator('.rail-create').click();
await wait(400);
await page.screenshot({ path: 'shots/new-design-modal.png' });
await page.getByRole('tab', { name: 'Presentation' }).click();
await page.locator('.size-card').first().click();
await wait(900);
log('newDesignURL', page.url());
assert.ok(page.url().includes('/editor/d_'));

// brand kit
await page.click('.ed-back');
await wait(600);
await page.locator('.rail-nav button[title="Brand kit"]').click();
await wait(400);
const brandInput = page.locator('#brand-name');
await brandInput.fill('Acme Studio');
await page.locator('.modal-footer .btn-cobalt').click();
await wait(600);
log('brandSaved', await page.evaluate(() => JSON.parse(localStorage.getItem('editrim.brand.v1') || '{}').name ?? null));
assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('editrim.brand.v1') || '{}').name), 'Acme Studio');

// share + import copy
await page.goto('http://127.0.0.1:5173/editor/new?template=north-mark', { waitUntil: 'networkidle' });
await wait(900);
await page.getByRole('button', { name: /Share/ }).click();
await wait(900);
const shareUrl = await page.locator('#share-url').inputValue();
const sharePage = await context.newPage();
await sharePage.goto(shareUrl, { waitUntil: 'networkidle' });
await wait(600);
await sharePage.getByRole('button', { name: /Edit a copy/i }).first().click();
await wait(1000);
log('importCopyURL', sharePage.url());
assert.ok(sharePage.url().includes('/editor/'));
log('importCopyTitle', await sharePage.locator('.ed-title input').inputValue());
assert.ok((await sharePage.locator('.ed-title input').inputValue()).includes('copy'));
await sharePage.close();

// mobile editor default: no panel
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mp = await mobile.newPage();
await mp.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening', { waitUntil: 'networkidle' });
await mp.waitForTimeout(900);
log('mobilePanel', await mp.locator('.lp').count());
assert.equal(await mp.locator('.lp').count(), 0);
await mp.screenshot({ path: 'shots/mobile-editor2.png' });
await mobile.close();

log('errors', errors);
assert.equal(errors.length, 0, 'no page errors');
await browser.close();
console.log('E2E 2 OK');
