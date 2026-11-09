import { chromium } from 'playwright';
import assert from 'node:assert';

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
const removedVideoCopy = [
  'Make your first cut',
  'No timeline theory',
  'Project media',
  'Quick add',
  'Track mix',
  'Editable',
  'Start over',
  'Everything is saved in this browser',
  'Drag the text directly',
];
const removedHomeCopy = [
  'Pick up where you left off',
  'Made to be made yours',
  'Everything in this workspace',
  'A little help from the machine',
  'Start with a sentence',
  'The small doors in',
];

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await desktop.newPage();
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await p.goto(`${base}/videos`, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
assert.equal(await p.locator('.videos-page').count(), 1);
assert.ok(await p.locator('.videos-new').count());
await p.locator('.videos-new').first().click();
await p.waitForSelector('.video-editor', { timeout: 15000 });
await p.waitForTimeout(500);
const video = await p.evaluate(() => ({
  text: document.body.innerText,
  dropzones: document.querySelectorAll('.vd-dropzone, .vd-quick-add, .vd-project-card, .vd-shortcuts').length,
  actions: document.querySelectorAll('.vd-library-actions').length,
  panels: [...document.querySelectorAll('.vd-panel-head h2')].map(el => el.textContent),
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
}));
console.log('video', video);
assert.equal(video.dropzones, 0);
assert.equal(video.actions, 1);
assert.deepEqual(video.panels, ['Media', 'Project']);
assert.equal(video.overflow, false);
removedVideoCopy.forEach(copy => assert.ok(!video.text.includes(copy), `video copy remains: ${copy}`));

await p.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded' });
await p.waitForSelector('.home', { timeout: 20000 });
await p.waitForTimeout(600);
const home = await p.evaluate(() => ({
  text: document.body.innerText,
  tabs: document.querySelectorAll('.home-tabs').length,
  workspaceLabel: document.querySelectorAll('.home-workspace-label').length,
  eyebrows: document.querySelectorAll('.home-eyebrow').length,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
}));
console.log('home', home);
assert.equal(home.tabs, 0);
assert.equal(home.workspaceLabel, 0);
assert.equal(home.eyebrows, 0);
assert.equal(home.overflow, false);
removedHomeCopy.forEach(copy => assert.ok(!home.text.includes(copy), `home copy remains: ${copy}`));

await p.goto(`${base}/templates`, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
const templates = await p.evaluate(() => ({
  title: document.querySelector('.gallery-hero h1')?.textContent,
  text: document.body.innerText,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
}));
console.log('templates', templates);
assert.equal(templates.title, 'Templates');
assert.equal(templates.overflow, false);
for (const copy of ['Start with something', 'Every template here was drawn by hand']) {
  assert.ok(!templates.text.includes(copy), `templates copy remains: ${copy}`);
}

await p.goto(`${base}/editor/new?template=cafe-opening`, { waitUntil: 'networkidle' });
await p.waitForTimeout(700);
const editor = await p.evaluate(() => ({
  hints: document.querySelectorAll('.cv-tip, .lp-lede, .lp-note, .insp-hint').length,
  text: document.body.innerText,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
}));
console.log('editor', editor);
assert.equal(editor.hints, 0);
assert.equal(editor.overflow, false);
assert.ok(!editor.text.includes('Double-click text to edit'));

await p.goto(`${base}/photo`, { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
const photo = await p.evaluate(() => ({
  text: document.body.innerText,
  rail: document.querySelectorAll('.ph-rail-btn').length,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
}));
console.log('photo', photo);
assert.equal(photo.rail, 4);
assert.equal(photo.overflow, false);
for (const copy of ['Drag the handles to crop', 'Choose a photo to start', 'Select a layer to edit', 'JPEG, PNG, WebP']) {
  assert.ok(!photo.text.includes(copy), `photo copy remains: ${copy}`);
}

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
const mp = await mobile.newPage();
mp.on('pageerror', e => errors.push(e.message));
mp.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
for (const route of ['/videos', '/dashboard', '/templates', '/photo', '/editor/new?template=cafe-opening']) {
  await mp.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  await mp.waitForTimeout(500);
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  console.log(`mobile ${route}`, overflow);
  assert.equal(overflow, false);
}

assert.equal(errors.length, 0);
await browser.close();
console.log('SIMPLICITY E2E OK');
