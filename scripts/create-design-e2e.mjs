import { chromium } from 'playwright';
import assert from 'node:assert';

/**
 * Create a design chooser audit.
 *
 * Every central dashboard category must open the full-screen chooser, expose
 * designs / sizes, show layout details before entering, and hand off to the
 * correct editor with the chosen dimensions.
 */

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push('PAGE ' + error.message));
page.on('console', message => { if (message.type() === 'error') errors.push('CONSOLE ' + message.text()); });
const wait = ms => page.waitForTimeout(ms);

async function dashboard() {
  await page.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.home-cat', { timeout: 20000 });
  await wait(250);
}

async function openCategory(title) {
  await dashboard();
  await page.locator(`.home-cat[title="${title}"]`).click();
  await page.waitForSelector('.cdm-shell', { timeout: 10000 });
  await wait(260);
  return page.evaluate(() => ({
    active: document.querySelector('.cdm-nav-btn.is-active')?.textContent?.trim(),
    cards: document.querySelectorAll('.cdm-card').length,
    chips: document.querySelectorAll('.cdm-chip').length,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  }));
}

const expected = [
  ['Templates', 'Templates'],
  ['Presentation', 'Presentations'],
  ['Social media', 'Social media'],
  ['Video', 'Videos'],
  ['Printables', 'Printables'],
  ['Doc', 'Docs'],
  ['Whiteboard', 'Whiteboards'],
  ['Sheet', 'Sheets'],
  ['Website', 'Websites'],
  ['Photo', 'Photo editor'],
  ['Upload', 'Upload'],
  ['Custom size', 'Custom size'],
];

for (const [title, active] of expected) {
  const info = await openCategory(title);
  assert.equal(info.active, active, `${title} opens the ${active} section`);
  assert.equal(info.overflow, false, `${title} does not overflow`);
  if (title !== 'Upload' && title !== 'Custom size') {
    assert.ok(info.cards > 0 || active === 'Upload' || active === 'Custom size', `${title} shows choices`);
  }
  console.log('category', title, info);
  await page.keyboard.press('Escape');
  await wait(150);
  assert.equal(await page.locator('.cdm-shell').count(), 0, `${title} closes with Escape`);
}

// Templates: search, details, handoff.
await dashboard();
await page.locator('.home-cat[title="Templates"]').click();
await page.waitForSelector('.cdm-shell');
await wait(350);
assert.equal(await page.locator('.cdm-chip').count(), 20, 'template categories are exposed');
await page.locator('.cdm-search input').fill('poster');
await wait(400);
const searchCards = await page.locator('.cdm-card').count();
assert.ok(searchCards > 0, 'template search returns results');
console.log('search cards', searchCards);
await page.locator('.cdm-search input').fill('');
await wait(300);
const first = page.locator('.cdm-card').first();
const firstName = await first.locator('.cdm-card-name').innerText();
await first.click();
await wait(250);
assert.equal(await page.locator('.cdm-detail').count(), 1, 'layout details appear before opening');
const detail = await page.evaluate(() => ({
  name: document.querySelector('.cdm-detail-copy strong')?.textContent?.trim(),
  meta: document.querySelector('.cdm-detail-copy span')?.textContent?.trim(),
}));
assert.equal(detail.name, firstName, 'detail name matches the selected template');
assert.ok(/1080|1240|1920|1600|1400/.test(detail.meta), 'detail includes dimensions');
console.log('detail', detail);
await page.locator('.cdm-detail .cdm-primary').click();
await page.waitForSelector('.cv-page', { timeout: 20000 });
assert.ok(page.url().includes('/editor/d_'), 'template handoff opens the editor');
console.log('template handoff', page.url());

// Presentation size handoff.
await dashboard();
await page.locator('.home-cat[title="Presentation"]').click();
await page.waitForSelector('.cdm-shell');
await page.locator('.cdm-card').filter({ hasText: 'Presentation (16:9)' }).first().click();
await wait(200);
await page.locator('.cdm-detail .cdm-primary').click();
await page.waitForSelector('.cv-page', { timeout: 20000 });
assert.equal(await page.locator('.ed-size-pill').innerText(), '1920 × 1080', 'presentation size is applied');
console.log('presentation handoff', page.url());

// Video format handoff.
await dashboard();
await page.locator('.home-cat[title="Video"]').click();
await page.waitForSelector('.cdm-shell');
await page.locator('.cdm-card').filter({ hasText: 'Mobile Video' }).first().click();
await wait(200);
await page.locator('.cdm-detail .cdm-primary').click();
await page.waitForSelector('.video-editor', { timeout: 20000 });
await wait(400);
const video = await page.evaluate(() => ({
  width: document.querySelector('.video-editor')?.getAttribute('data-width'),
  height: document.querySelector('.video-editor')?.getAttribute('data-height'),
}));
assert.deepEqual(video, { width: '1080', height: '1920' }, 'video format is applied');
console.log('video handoff', page.url(), video);

// Custom size handoff.
await dashboard();
await page.locator('.home-cat[title="Custom size"]').click();
await page.waitForSelector('.cdm-shell');
const customInputs = page.locator('.cdm-custom-fields input');
await customInputs.nth(0).fill('800');
await customInputs.nth(1).fill('600');
await page.locator('.cdm-custom-fields .cdm-primary').click();
await page.waitForSelector('.cv-page', { timeout: 20000 });
assert.equal(await page.locator('.ed-size-pill').innerText(), '800 × 600', 'custom size is applied');
console.log('custom handoff', page.url());

// Upload handoff.
await dashboard();
await page.locator('.home-cat[title="Upload"]').click();
await page.waitForSelector('.cdm-shell');
await page.locator('.cdm-file-input').setInputFiles('scripts/fixtures/photo-sample.png');
await page.waitForSelector('.cv-page', { timeout: 20000 });
console.log('upload handoff', page.url());

// Mobile: full-screen chooser, two columns, active category visible.
const mobile = await context.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded' });
await mobile.waitForSelector('.home-cat', { timeout: 20000 });
await mobile.locator('.home-cat[title="Social media"]').click();
await mobile.waitForSelector('.cdm-shell');
await mobile.waitForTimeout(450);
const mobileInfo = await mobile.evaluate(() => {
  const shell = document.querySelector('.cdm-shell');
  const nav = document.querySelector('.cdm-nav');
  const active = document.querySelector('.cdm-nav-btn.is-active');
  const grid = document.querySelector('.cdm-grid');
  const ar = active?.getBoundingClientRect();
  const nr = nav?.getBoundingClientRect();
  return {
    shell: shell ? { w: shell.getBoundingClientRect().width, h: shell.getBoundingClientRect().height } : null,
    columns: grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0,
    activeVisible: ar && nr ? ar.left >= nr.left - 1 && ar.right <= nr.right + 1 : false,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
});
assert.equal(mobileInfo.shell?.w, 390, 'mobile chooser fills the viewport width');
assert.equal(mobileInfo.shell?.h, 844, 'mobile chooser fills the viewport height');
assert.equal(mobileInfo.columns, 2, 'mobile uses two columns');
assert.equal(mobileInfo.activeVisible, true, 'mobile scrolls the active category into view');
assert.equal(mobileInfo.overflow, false, 'mobile chooser does not overflow');
await mobile.screenshot({ path: 'shots/create-design-mobile.png' });
console.log('mobile', mobileInfo);

assert.deepEqual(errors, [], 'no console or page errors');
await browser.close();
console.log('CREATE DESIGN E2E OK');
