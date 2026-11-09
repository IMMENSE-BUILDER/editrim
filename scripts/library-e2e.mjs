import { chromium } from 'playwright';
import assert from 'node:assert';

/**
 * Dashboard library access.
 *
 * The full-screen Create a design chooser is the single entry point for
 * templates, sizes and blank workflows. The More popover still exposes the
 * same library entry.
 */

const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await p.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('.home-cat', { timeout: 20000 });
await p.waitForTimeout(500);
await p.locator('.rail-create').click();
await p.waitForSelector('.cdm-shell', { timeout: 10000 });
await p.waitForTimeout(400);

assert.equal(await p.locator('.cdm-title').innerText(), 'Create a design');
const nav = await p.locator('.cdm-nav-btn').allInnerTexts();
console.log('sections', nav);
for (const label of ['For you', 'Templates', 'Presentations', 'Social media', 'Photo editor', 'Videos', 'Printables', 'Docs', 'Whiteboards', 'Sheets', 'Websites', 'Custom size', 'Upload', 'More']) {
  assert.ok(nav.some(item => item.trim() === label), `${label} is in the chooser`);
}
assert.ok(await p.locator('.cdm-card').count() > 0, 'For you shows designs and sizes');
await p.screenshot({ path: 'shots/library-all.png' });

// Printables: search a certificate and open it.
await p.locator('.cdm-nav-btn').filter({ hasText: 'Printables' }).click();
await p.waitForTimeout(300);
await p.locator('.cdm-search input').fill('certificate');
await p.waitForTimeout(350);
const certificate = p.locator('.cdm-card').filter({ hasText: 'Certificate' }).first();
assert.ok(await certificate.count(), 'certificate designs are reachable');
await certificate.click();
await p.waitForTimeout(200);
assert.equal(await p.locator('.cdm-detail').count(), 1, 'layout details are shown');
await p.locator('.cdm-detail .cdm-primary').click();
await p.waitForSelector('.editor', { timeout: 20000 });
await p.waitForTimeout(400);
console.log('certificate size', await p.locator('.ed-size-pill').innerText());
assert.ok((await p.locator('.ed-size-pill').innerText()).includes('1240'));

// Dashboard action search still exposes the design library.
await p.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('.home-search-wrap input', { timeout: 20000 });
await p.locator('.home-search-wrap input').fill('library');
await p.waitForTimeout(300);
const rows = await p.locator('.home-result-row.action').allInnerTexts();
console.log('library search rows', rows);
assert.ok(rows.some(text => text.toLowerCase().includes('design library')));

// The rail More popover exposes the same chooser.
await p.locator('.home-search-wrap input').press('Escape');
await p.waitForTimeout(200);
await p.locator('.home-cat[title="More"]').click();
await p.waitForTimeout(300);
const moreFirst = await p.locator('.home-more-grid button').first().innerText();
console.log('more lead', moreFirst);
assert.ok(moreFirst.includes('Design library'));
await p.getByRole('button', { name: /Design library/ }).click();
await p.waitForSelector('.cdm-shell', { timeout: 10000 });
assert.equal(await p.locator('.cdm-title').innerText(), 'Create a design');
await p.keyboard.press('Escape');

console.log('errors', errors);
assert.equal(errors.length, 0);
await b.close();
console.log('LIBRARY OK');
