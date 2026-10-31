import { chromium } from 'playwright';
import assert from 'node:assert';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const log = (a, b) => console.log(a + ':', typeof b === 'string' ? b : JSON.stringify(b));
const wait = ms => page.waitForTimeout(ms);

// AI Edit preview + apply
await page.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening#ai', { waitUntil: 'networkidle' });
await wait(1400);
await page.getByRole('tab', { name: 'Edit' }).click();
await wait(200);
await page.locator('#ai-edit-prompt').fill("Make the 'Bruma' headline cobalt and add a short line under the address: 'Open daily from 7am.'");
await page.locator('.ai-run').click();
await page.waitForSelector('.ai-result-card', { timeout: 60000 });
await wait(500);
await page.screenshot({ path: 'shots/mimo-edit-preview.png' });
log('editPreviewCommands', await page.locator('.ai-command-list li').allInnerTexts());
assert.ok(await page.locator('.ai-command-list li').count() >= 1);
await page.getByRole('button', { name: /Apply changes/i }).click();
await wait(600);
const headingColor = await page.locator('.cv-el').filter({ hasText: 'Bruma' }).first().locator('span').first().evaluate(el => getComputedStyle(el).color);
log('appliedHeadingColor', headingColor);
assert.ok(headingColor.includes('36, 64, 240'));

// AI design with MiMo
await page.getByRole('tab', { name: 'Design' }).click();
await wait(200);
await page.locator('#ai-design-prompt').fill('A warm editorial launch poster for Bruma slow coffee, with one coffee photo and a confident headline.');
await page.locator('.ai-run').click();
await page.waitForSelector('.ai-result-card', { timeout: 90000 });
await wait(500);
log('designHead', await page.locator('.ai-result-head').innerText());
await page.screenshot({ path: 'shots/mimo-design-result.png' });
const pagesBefore = await page.locator('.page-item').count();
await page.getByRole('button', { name: /Add as new page/i }).click();
await wait(700);
const pagesAfter = await page.locator('.page-item').count();
log('designAdded', { pagesBefore, pagesAfter });
assert.equal(pagesAfter, pagesBefore + 1);

// Illustration insert
await page.locator('.ai-subsection-toggle').click();
await wait(200);
await page.locator('.ai-subsection textarea').fill('Three coffee cups and a geometric sun, cream, coral and cobalt.');
await page.getByRole('button', { name: /Generate illustration/i }).click();
await page.waitForSelector('.ai-illustration-result img', { timeout: 90000 });
const imgCountBefore = await page.locator('.cv-el img').count();
await page.getByRole('button', { name: /^Insert$/i }).click();
await wait(700);
const imgCountAfter = await page.locator('.cv-el img').count();
log('illustrationInsert', { imgCountBefore, imgCountAfter });
assert.ok(imgCountAfter > imgCountBefore);
await page.screenshot({ path: 'shots/mimo-illustration-insert.png' });

log('errors', errors);
assert.equal(errors.length, 0);
await browser.close();
console.log('MIMO DESIGN/EDIT OK');
