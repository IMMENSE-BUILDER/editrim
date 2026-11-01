import { chromium } from 'playwright';
import assert from 'node:assert';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERR ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
const wait = ms => page.waitForTimeout(ms);
const log = (label, value) => console.log(label + ':', typeof value === 'string' ? value : JSON.stringify(value));

const design = () => page.evaluate(() => {
  const id = location.pathname.split('/').pop();
  return JSON.parse(localStorage.getItem('vellum.design.v1.' + id) || 'null');
});
const closeMenu = async () => {
  if (await page.locator('.cv-menu').count()) {
    await page.keyboard.press('Escape');
    await wait(120);
  }
};
const row = label => page.locator('.cv-menu-label').filter({ hasText: new RegExp('^' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') });
const open = async loc => {
  await closeMenu();
  await loc.click({ button: 'right' });
  await wait(220);
  assert.equal(await page.locator('.cv-menu').count(), 1, 'menu opens');
};
const choose = async label => { await row(label).click(); await wait(260); };

await page.goto('http://localhost:5173/editor/new?template=cafe-opening', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const bruma = page.locator('.cv-el').filter({ hasText: /^Bruma$/ }).first();
const coffee = page.locator('.cv-el').filter({ hasText: /COFFEE\s*&\s*BREAD/ }).first();
const elementCount = () => page.locator('.cv-el').count();
log('templateElements', await elementCount());

// The complete menu is present
await open(bruma);
const labels = await page.locator('.cv-menu-label').allInnerTexts();
log('menu', labels);
for (const required of ['Copy', 'Copy style', 'Paste', 'Duplicate', 'Delete', 'Layer', 'Align to page', 'Group', 'Create component', 'Comment', 'Lock', 'Apply colors to page', 'Download selection', 'Magic Write', 'Translate text']) {
  assert.ok(labels.includes(required), required + ' present');
}
assert.equal(await row('Paste').locator('..').isDisabled(), true, 'Paste disabled with empty clipboard');

// Submenus
await row('Layer').hover(); await wait(200);
log('layerSubmenu', await page.locator('.cv-menu-sub .cv-menu-label').allInnerTexts());
assert.equal(await page.locator('.cv-menu-sub .cv-menu-label').count(), 4);
await row('Layer').hover(); await wait(100);
await page.locator('.cv-menu-label').filter({ hasText: /^Align to page$/ }).hover(); await wait(200);
assert.equal(await page.locator('.cv-menu-sub .cv-menu-label').count(), 6);
await closeMenu();

// Copy style + paste style
await open(bruma); await choose('Copy style');
await open(coffee);
assert.ok((await page.locator('.cv-menu-label').allInnerTexts()).includes('Paste text style'));
await choose('Paste text style');
await wait(500);
let d = await design();
let bEl = d.pages[0].elements.find(e => e.text === 'Bruma');
let cEl = d.pages[0].elements.find(e => e.text === 'COFFEE  &  BREAD');
log('copyStyle', { from: bEl.fontSize, to: cEl.fontSize });
assert.equal(cEl.fontSize, bEl.fontSize);
await page.keyboard.press('Control+z'); await wait(500);

// Copy + paste from the page menu
await open(bruma); await choose('Copy');
const beforePaste = await elementCount();
await page.locator('.cv-viewport').click({ button: 'right', position: { x: 20, y: 20 } });
await wait(220);
assert.ok((await page.locator('.cv-menu-label').allInnerTexts()).includes('Paste'));
await choose('Paste'); await wait(600);
log('paste', `${beforePaste} ? ${await elementCount()}`);
assert.equal(await elementCount(), beforePaste + 1);
await page.keyboard.press('Control+z'); await wait(500);

// Duplicate + delete
await open(bruma); await choose('Duplicate'); await wait(500);
const duplicated = await elementCount();
assert.equal(duplicated, beforePaste + 1);
await open(page.locator('.cv-el.is-selected').first());
await choose('Delete'); await wait(500);
log('duplicateDelete', `${beforePaste} ? ${duplicated} ? ${await elementCount()}`);
assert.equal(await elementCount(), beforePaste);

// Layer and align
await open(bruma);
await row('Layer').hover(); await wait(150);
await page.locator('.cv-menu-sub .cv-menu-label').filter({ hasText: /^Bring to front$/ }).click(); await wait(500);
d = await design();
assert.equal(d.pages[0].elements[d.pages[0].elements.length - 1].text, 'Bruma', 'brought to front');
await open(bruma);
await row('Align to page').hover(); await wait(150);
await page.locator('.cv-menu-sub .cv-menu-label').filter({ hasText: /^Align left$/ }).click(); await wait(900);
d = await design();
bEl = d.pages[0].elements.find(e => e.text === 'Bruma');
log('alignLeft', bEl.x);
assert.ok(Math.abs(bEl.x) < 0.5);

// Group + ungroup
await bruma.click(); await coffee.click({ modifiers: ['Shift'] }); await wait(150);
await open(bruma); assert.ok((await page.locator('.cv-menu-label').allInnerTexts()).includes('Group'));
await choose('Group'); await wait(500);
d = await design();
log('groupedLayers', d.pages[0].elements.filter(e => e.groupId).length);
assert.ok(d.pages[0].elements.filter(e => e.groupId).length >= 2);
await bruma.click(); await wait(250);
log('groupSelection', { selected: await page.locator('.cv-el.is-selected').count(), outline: await page.locator('.cv-sel-group').count() });
assert.ok((await page.locator('.cv-el.is-selected').count()) >= 2);
await open(bruma); assert.ok((await page.locator('.cv-menu-label').allInnerTexts()).includes('Ungroup'));
await choose('Ungroup'); await wait(500);
d = await design();
assert.equal(d.pages[0].elements.filter(e => e.groupId).length, 0);

// Reusable component: create, insert, persist, delete
await bruma.click(); await coffee.click({ modifiers: ['Shift'] });
await open(bruma); await choose('Create component');
assert.equal(await page.locator('.modal-title').innerText(), 'Create component');
await page.locator('#component-name').fill('Menu hero');
await page.getByRole('button', { name: 'Save component' }).click(); await wait(700);
assert.equal(await page.locator('.component-card').count(), 1);
log('componentStored', await page.evaluate(() => JSON.parse(localStorage.getItem('vellum_components_v1') || '[]').map(c => c.name)));
const beforeComponent = await elementCount();
await page.locator('.component-thumb').first().click(); await wait(700);
log('componentInsert', `${beforeComponent} ? ${await elementCount()}`);
assert.ok((await elementCount()) > beforeComponent);
await page.keyboard.press('Control+z'); await wait(500);
await page.locator('.component-delete').first().click(); await wait(400);
assert.equal(await page.locator('.component-card').count(), 0);

// Comment: add, pin, resolve, delete
await closeMenu();
await open(bruma); await choose('Comment'); await wait(300);
assert.equal(await page.locator('.modal-title').innerText(), 'Comments');
await page.locator('.comment-input').fill('Tighten the headline kerning before launch.');
await page.getByRole('button', { name: 'Post comment' }).click(); await wait(450);
assert.equal(await page.locator('.comment-item').count(), 1);
await page.locator('.modal-footer').getByRole('button', { name: 'Close', exact: true }).click(); await wait(300);
assert.equal(await page.locator('.cv-comment-pin').count(), 1);
await page.locator('.cv-comment-pin').first().click(); await wait(300);
assert.ok((await page.locator('.comment-thread').innerText()).includes('Tighten the headline kerning'));
await page.locator('.comment-actions button').filter({ hasText: 'Resolve' }).click(); await wait(300);
await page.locator('.modal-footer').getByRole('button', { name: 'Close', exact: true }).click(); await wait(400);
assert.equal(await page.locator('.cv-comment-pin').count(), 0, 'resolved pin hidden');
await open(bruma); await choose('Comment'); await wait(300);
await page.locator('.comment-actions button').filter({ hasText: 'Delete' }).click(); await wait(300);
assert.equal(await page.locator('.comment-item').count(), 0);
await page.locator('.modal-footer').getByRole('button', { name: 'Close', exact: true }).click(); await wait(300);

// Lock protects delete, then unlock
await open(bruma);
await row('Lock').hover(); await wait(150);
await page.locator('.cv-menu-sub .cv-menu-label').filter({ hasText: /^Lock selection$/ }).click(); await wait(500);
d = await design();
assert.equal(d.pages[0].elements.find(e => e.text === 'Bruma').locked, true);
const lockedCount = await elementCount();
await page.keyboard.press('Delete'); await wait(400);
assert.equal(await elementCount(), lockedCount, 'locked layer survives delete');
await open(bruma);
await row('Lock').hover(); await wait(150);
await page.locator('.cv-menu-sub .cv-menu-label').filter({ hasText: /^Unlock selection$/ }).click(); await wait(500);
d = await design();
assert.notEqual(d.pages[0].elements.find(e => e.text === 'Bruma').locked, true);

// Apply colors + undo
await open(bruma);
const beforeBg = (await design()).pages[0].background;
await choose('Apply colors to page'); await wait(1200);
d = await design();
log('palette', { before: beforeBg.kind, after: d.pages[0].background });
assert.notDeepEqual(d.pages[0].background, beforeBg);
await page.keyboard.press('Control+z'); await wait(700);
d = await design();
assert.deepEqual(d.pages[0].background, beforeBg);

// Download selection
await open(bruma);
const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
await choose('Download selection');
const download = await downloadPromise;
log('selectionDownload', download.suggestedFilename());
assert.ok(download.suggestedFilename().endsWith('-selection.png'));

// Magic Write and Translate hand off to AI Studio
await open(bruma); await choose('Magic Write'); await wait(700);
assert.equal(await page.locator('.ai-panel').count(), 1);
assert.ok((await page.locator('.ai-tabs button.active').innerText()).includes('Write'));
assert.equal(await page.evaluate(() => document.activeElement?.id), 'ai-write-prompt');
await page.locator('.ai-head .lp-close').click(); await wait(300);
await open(bruma); await choose('Translate text'); await wait(700);
assert.equal(await page.locator('.ai-panel').count(), 1);
assert.ok((await page.locator('.ai-translate').innerText()).includes('Translate the selected text'));
await page.locator('.ai-head .lp-close').click(); await wait(300);

// Page context menu and page-level comment clamped inside canvas
await page.locator('.cv-viewport').click({ button: 'right', position: { x: 20, y: 20 } });
await wait(250);
const pageRows = await page.locator('.cv-menu-label').allInnerTexts();
log('pageMenu', pageRows);
for (const required of ['Paste', 'Select all', 'Add page', 'Duplicate page', 'Resize canvas', 'Page background', 'Comment here', 'Fit canvas']) {
  assert.ok(pageRows.includes(required), required + ' on page menu');
}
await choose('Comment here'); await wait(300);
await page.locator('.comment-input').fill('Page-level note.');
await page.getByRole('button', { name: 'Post comment' }).click(); await wait(350);
await page.locator('.modal-footer').getByRole('button', { name: 'Close', exact: true }).click(); await wait(400);
const pageRect = await page.locator('.cv-page').boundingBox();
const pinRect = await page.locator('.cv-comment-pin').first().boundingBox();
log('pagePinInsidePage', { page: pageRect, pin: pinRect });
assert.ok(pinRect.x >= pageRect.x && pinRect.y >= pageRect.y && pinRect.x + pinRect.width <= pageRect.x + pageRect.width && pinRect.y + pinRect.height <= pageRect.y + pageRect.height);

log('consoleErrors', errors);
assert.equal(errors.length, 0);
await page.screenshot({ path: 'shots/context-menu-final.png' });
await browser.close();
console.log('CONTEXT MENU E2E OK');
