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

await page.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.click('.ed-back');
await page.waitForTimeout(500);
await page.goto('http://127.0.0.1:5173/editor/new?template=form-04', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.click('.ed-back');
await page.waitForTimeout(700);

log('dashboardUrl', page.url());
assert.ok(page.url().includes('/dashboard'));
log('initialCards', await page.locator('.design-card').count());

// search
await page.locator('.dash-search input').fill('Bruma');
await page.waitForTimeout(300);
log('searchCount', await page.locator('.design-card').count());
await page.locator('.dash-search input').fill('');
await page.waitForTimeout(300);

// rename
const card = page.locator('.design-card').filter({ hasText: 'Bruma Café' }).first();
await card.locator('.design-menu-btn').click();
await page.waitForTimeout(200);
await page.locator('.design-menu button').filter({ hasText: 'Rename' }).click();
await page.waitForTimeout(300);
await page.locator('#rename').fill('Bruma — Opening Post');
await page.getByRole('button', { name: 'Save name' }).click();
await page.waitForTimeout(500);
log('renamed', await page.locator('.design-name').filter({ hasText: 'Bruma — Opening Post' }).count());
assert.equal(await page.locator('.design-name').filter({ hasText: 'Bruma — Opening Post' }).count(), 1);

// duplicate
const cardsBefore = await page.locator('.design-card').count();
const renamedCard = page.locator('.design-card').filter({ hasText: 'Bruma — Opening Post' }).first();
await renamedCard.locator('.design-menu-btn').click();
await page.locator('.design-menu button').filter({ hasText: 'Duplicate' }).click();
await page.waitForTimeout(600);
const cardsAfter = await page.locator('.design-card').count();
log('duplicate', { cardsBefore, cardsAfter });
assert.equal(cardsAfter, cardsBefore + 1);

// download from card
const dupCard = page.locator('.design-card').filter({ hasText: 'Bruma — Opening Post copy' }).first();
await dupCard.locator('.design-menu-btn').click();
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 30000 }),
  page.locator('.design-menu button').filter({ hasText: 'Download PNG' }).click(),
]);
await download.saveAs('shots/dash-download.png');
const buf = fs.readFileSync('shots/dash-download.png');
log('dashDownload', { bytes: buf.length, w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) });
assert.equal(buf.readUInt32BE(16), 2160);

// delete duplicate
await dupCard.locator('.design-menu-btn').click();
await page.locator('.design-menu button').filter({ hasText: 'Delete' }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: 'Delete design' }).click();
await page.waitForTimeout(600);
log('deleted', await page.locator('.design-card').count());
assert.equal(await page.locator('.design-card').count(), cardsAfter - 1);

// custom size modal
await page.getByRole('button', { name: /New design/i }).first().click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: /Custom size/i }).click();
await page.waitForTimeout(300);
await page.locator('#design-w').fill('800');
await page.locator('#design-h').fill('600');
await page.locator('#design-title').fill('Custom 800');
await page.screenshot({ path: 'shots/custom-size.png' });
await page.getByRole('button', { name: /Create canvas/i }).click();
await page.waitForTimeout(900);
log('customSize', await page.locator('.ed-size-pill').innerText());
assert.ok((await page.locator('.ed-size-pill').innerText()).includes('800'));

// brand kit saved in editor
await page.getByRole('button', { name: 'Brand' }).click();
await page.waitForTimeout(300);
const brandName = await page.locator('.brand-card strong').innerText();
log('brandNameInEditor', brandName);
await page.locator('.brand-card .btn').click();
await page.waitForTimeout(300);
await page.locator('#brand-name').fill('Atelier Test');
await page.locator('.modal-footer .btn-cobalt').click();
await page.waitForTimeout(500);
log('brandPanelAfterSave', await page.locator('.brand-card strong').innerText());
assert.equal(await page.locator('.brand-card strong').innerText(), 'Atelier Test');

// template gallery filter
await page.goto('http://127.0.0.1:5173/templates?category=Presentation', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
log('presentationTemplates', await page.locator('.template-card').count());
assert.equal(await page.locator('.template-card').count(), 2);
await page.locator('.gallery-search input').fill('porter');
await page.waitForTimeout(300);
log('searchTemplates', await page.locator('.template-card').count());
assert.equal(await page.locator('.template-card').count(), 1);
await page.screenshot({ path: 'shots/gallery-filtered.png' });

log('errors', errors);
assert.equal(errors.length, 0);
await browser.close();
console.log('E2E DASH OK');
