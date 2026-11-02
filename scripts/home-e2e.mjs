import { chromium } from 'playwright';
import assert from 'node:assert';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
const log = (a, b) => console.log(a + ':', typeof b === 'string' ? b : JSON.stringify(b));
const wait = ms => page.waitForTimeout(ms);
const backHome = async () => {
  await page.click('.ed-back');
  await wait(700);
};

// hero CTA should land on Home, not the editor
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await wait(700);
const heroHref = await page.locator('.hero-ctas a').first().getAttribute('href');
log('heroCtaHref', heroHref);
assert.equal(heroHref, '/dashboard');
await page.locator('.hero-ctas a').first().click();
await wait(1000);
log('heroDestination', page.url());
assert.ok(page.url().endsWith('/dashboard'));
assert.ok(await page.locator('.home').count());

// create from Presentation category
await page.locator('.home-cat[title="Presentation"]').click();
await page.waitForSelector('.editor', { timeout: 15000 });
log('presentationSize', await page.locator('.ed-size-pill').innerText());
await wait(500);
await backHome();

// create a Doc
await page.locator('.home-cat[title="Doc"]').click();
await page.waitForSelector('.editor', { timeout: 15000 });
await wait(500);
log('docElements', await page.locator('.cv-el').count());
assert.ok(await page.locator('.cv-el').count() > 5);
await page.screenshot({ path: 'shots/home-doc-design.png' });
await backHome();

// create a Whiteboard
await page.locator('.home-cat[title="Whiteboard"]').click();
await page.waitForSelector('.editor', { timeout: 15000 });
await wait(500);
log('boardElements', await page.locator('.cv-el').count());
assert.ok(await page.locator('.cv-el').count() > 5);
await backHome();

// populated home
await wait(500);
log('recentCards', await page.locator('.home-design-card').count());
assert.ok(await page.locator('.home-design-card').count() >= 4);
await page.screenshot({ path: 'shots/home-populated.png' });

// projects view
await page.locator('.rail-nav button[title="Projects"]').click();
await wait(500);
log('projectsUrl', page.url());
log('projectCards', await page.locator('.home-project-card').count());
assert.ok((await page.locator('.home-project-card').count()) >= 3);
await page.screenshot({ path: 'shots/home-projects.png' });

// search anything: design/template/action
await page.locator('.home-search-wrap input').fill('doc');
await wait(400);
log('searchGroups', await page.locator('.home-result-group').count());
assert.ok(await page.locator('.home-result-row').count() > 0);
await page.screenshot({ path: 'shots/home-search.png' });
await page.locator('.home-search-wrap input').fill('');
await wait(300);

// back to home
await page.locator('.rail-nav button[title="Home"]').click();
await wait(500);

// video library opens from the dashboard, then the editor
await page.locator('.home-cat[title="Video"]').click();
await page.waitForSelector('.videos-page', { timeout: 15000 });
await wait(500);
log('videosPage', await page.locator('.videos-head-left h1').innerText());
assert.ok(await page.locator('.videos-new').count());
await page.locator('.videos-new').first().click();
await page.waitForSelector('.video-editor', { timeout: 15000 });
await wait(600);
log('videoEditor', await page.locator('.vd-title-wrap input').inputValue());
assert.ok(await page.locator('.vd-timeline').count());
assert.ok(await page.locator('.vd-export-btn').count());
await page.click('.vd-back');
await page.waitForSelector('.videos-page', { timeout: 15000 });
await page.locator('.videos-back').click();
await page.waitForSelector('.home', { timeout: 15000 });
await wait(500);

// print modal
await page.locator('.rail-nav button[title="Print-ready PDF"]').click();
await wait(400);
log('printModal', await page.locator('.modal-title').innerText());
const printText = await page.locator('.modal').innerText();
assert.ok(printText.includes('PDF'), 'print action present');
await page.screenshot({ path: 'shots/home-print.png' });
const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
await page.getByRole('button', { name: /Download PDF/i }).click();
const download = await downloadPromise;
log('printDownload', download.suggestedFilename());
assert.ok(download.suggestedFilename().endsWith('.pdf'));
await page.getByRole('button', { name: 'Cancel' }).click();
await wait(300);

// upload image and create a design
await page.locator('.home-cat[title="Upload"]').click().catch(()=>{});
const input = page.locator('input[type=file]');
await input.setInputFiles('shots/tpl-cafe-opening.png');
await page.waitForSelector('.editor', { timeout: 20000 });
await wait(600);
log('uploadedImageElements', await page.locator('.cv-el img').count());
assert.ok(await page.locator('.cv-el img').count() >= 1);
await backHome();

// More popover
await page.locator('.rail-nav button[title="More"]').click();
await wait(300);
log('morePopover', await page.locator('.rail-more').count());
assert.equal(await page.locator('.rail-more').count(), 1);
await page.screenshot({ path: 'shots/home-more.png' });
await page.locator('.rail-popover-backdrop').click({ position: { x: 900, y: 500 } });
await wait(250);

// Sheet modal -> static table design
await page.locator('.home-cat[title="Sheet"]').click();
await wait(350);
log('sheetModal', await page.locator('.modal-title').innerText());
assert.ok((await page.locator('.modal-title').innerText()).includes('sheet layout'));
await page.getByRole('button', { name: /Create a sheet layout/i }).click();
await page.waitForSelector('.editor', { timeout: 15000 });
await wait(450);
log('sheetElements', await page.locator('.cv-el').count());
assert.ok(await page.locator('.cv-el').count() > 20);
await backHome();

// Website modal -> static page design
await page.locator('.home-cat[title="Website"]').click();
await wait(350);
assert.ok((await page.locator('.modal-title').innerText()).includes('website page'));
await page.getByRole('button', { name: /Create website page/i }).click();
await page.waitForSelector('.editor', { timeout: 15000 });
await wait(450);
log('websiteElements', await page.locator('.cv-el').count());
assert.ok(await page.locator('.cv-el').count() >= 9);
await backHome();

// Magic Layers is explained, not faked
await page.locator('.home-cat[title="Magic Layers"]').click();
await wait(350);
log('magicModal', await page.locator('.modal-title').innerText());
assert.ok((await page.locator('.modal-title').innerText()).includes('vision model'));
assert.ok((await page.locator('.home-modal-copy').innerText()).includes('image segmentation'));
await page.getByRole('button', { name: 'Not now' }).click();
await wait(300);

// Custom size opens directly in custom mode
await page.locator('.home-cat[title="Custom size"]').click();
await wait(350);
assert.ok((await page.locator('.modal-title').innerText()).includes('Create a design'));
assert.equal(await page.getByRole('button', { name: /Back to presets/i }).count(), 1);
assert.equal(await page.locator('input[type=number]').count(), 2);
await page.screenshot({ path: 'shots/home-custom.png' });
await page.keyboard.press('Escape');
await wait(350);

// Create must return to presets after visiting custom size
await page.locator('.rail-create').click();
await wait(350);
assert.equal(await page.getByRole('button', { name: /Back to presets/i }).count(), 0);
assert.ok(await page.locator('.size-card').count() > 0);
await page.keyboard.press('Escape');
await wait(300);

// Universal search finds actions and template content
await page.locator('.home-search-wrap input').fill('print');
await wait(350);
assert.ok(await page.locator('.home-result-row.action').count() >= 1);
await page.locator('.home-search-wrap input').fill('cafe');
await wait(350);
assert.ok(await page.locator('.home-result-group').count() >= 1);
await page.screenshot({ path: 'shots/home-search.png' });
await page.locator('.home-search-wrap input').fill('');
await wait(300);

// Projects: duplicate + rename from card menu
await page.locator('.rail-nav button[title="Projects"]').click();
await wait(500);
const cardsBefore = await page.locator('.home-project-card').count();
await page.locator('.home-project-menu-btn').first().click();
await wait(250);
assert.equal(await page.locator('.home-project-menu button').count(), 6);
await page.locator('.home-project-menu button').filter({ hasText: 'Duplicate' }).click();
await wait(500);
log('cardsBeforeAfterDuplicate', `${cardsBefore} → ${await page.locator('.home-project-card').count()}`);
assert.equal(await page.locator('.home-project-card').count(), cardsBefore + 1);
await page.locator('.home-project-menu-btn').first().click();
await wait(250);
await page.locator('.home-project-menu button').filter({ hasText: 'Rename' }).click();
await wait(300);
await page.locator('#home-rename').fill('QA renamed design');
await page.getByRole('button', { name: 'Save name' }).click();
await wait(500);
log('renamedCard', await page.locator('.home-project-info a', { hasText: 'QA renamed design' }).count());
assert.equal(await page.locator('.home-project-info a', { hasText: 'QA renamed design' }).count(), 1);
await page.screenshot({ path: 'shots/home-projects.png' });

log('errors', errors);
assert.equal(errors.length, 0);

// Mobile: no horizontal overflow, usable top rail
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
const mp = await mobile.newPage();
const mobileErrors = [];
mp.on('pageerror', e => mobileErrors.push('PAGEERR ' + e.message));
mp.on('console', m => { if (m.type() === 'error') mobileErrors.push('CONSOLE ' + m.text()); });
await mp.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
await mp.waitForTimeout(800);
const mobileMetrics = await mp.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  railHeight: Math.round(document.querySelector('.home-rail')?.getBoundingClientRect().height ?? 0),
  navWidth: Math.round(document.querySelector('.rail-nav')?.getBoundingClientRect().width ?? 0),
  categories: document.querySelectorAll('.home-cat').length,
}));
log('mobileMetrics', mobileMetrics);
assert.equal(mobileMetrics.scrollWidth, mobileMetrics.clientWidth);
assert.equal(mobileMetrics.railHeight, 60);
assert.ok(mobileMetrics.navWidth > 200);
assert.equal(mobileMetrics.categories, 13);
await mp.screenshot({ path: 'shots/home-mobile.png' });
log('mobileErrors', mobileErrors);
assert.equal(mobileErrors.length, 0);

await browser.close();
console.log('HOME FEATURES E2E OK');
