import { chromium } from 'playwright';
import assert from 'node:assert';

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];

async function check(width, height, theme) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.evaluate(value => localStorage.setItem('editrim_theme_v1', value), theme);
  await page.goto(`${base}/editor/new?template=cafe-opening`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.cv-page');
  await page.waitForTimeout(600);

  const topbar = await page.evaluate(() => {
    const bar = document.querySelector('.ed-topbar');
    const right = document.querySelector('.ed-top-right');
    const left = document.querySelector('.ed-top-left');
    const center = document.querySelector('.ed-top-center');
    const box = el => el ? el.getBoundingClientRect() : null;
    return {
      viewport: window.innerWidth,
      theme: document.documentElement.dataset.theme,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      bar: box(bar),
      left: box(left),
      center: box(center),
      right: box(right),
      overlaps: box(left) && box(center) ? box(left).right > box(center).left + 1 : false,
      rightOverflow: box(right) ? box(right).right > window.innerWidth + 1 : false,
    };
  });
  results.push({ width, height, theme, ...topbar });
  await page.screenshot({ path: `shots/studio-${width}-${theme}.png` });

  // Command palette
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(300);
  assert.ok(await page.locator('.cmd-panel').isVisible());
  const cmd = await page.locator('.cmd-panel').evaluate(el => {
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  });
  results[results.length - 1].cmd = { ...cmd, fits: cmd.left >= 0 && cmd.right <= width + 1 };
  if (theme === 'dark') await page.screenshot({ path: `shots/studio-command-${width}-dark.png` });
  await page.keyboard.press('Escape');

  // Resize studio (via the command palette so it also works at phone widths)
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(250);
  await page.locator('.cmd-input').fill('resize');
  await page.waitForTimeout(200);
  await page.locator('.cmd-input').press('Enter');
  await page.waitForTimeout(500);
  const resizeFits = await page.locator('.modal:visible').evaluate(el => {
    const r = el.getBoundingClientRect();
    return r.left >= 0 && r.right <= window.innerWidth + 1 && r.top >= 0 && r.bottom <= window.innerHeight + 1;
  });
  results[results.length - 1].resizeFits = resizeFits;
  if (theme === 'dark') await page.screenshot({ path: `shots/studio-resize-${width}-dark.png` });
  await page.keyboard.press('Escape');

  // Export
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(250);
  await page.locator('.cmd-input').fill('download');
  await page.waitForTimeout(200);
  await page.locator('.cmd-input').press('Enter');
  await page.waitForTimeout(500);
  const exportFits = await page.locator('.modal:visible').evaluate(el => {
    const r = el.getBoundingClientRect();
    return r.left >= 0 && r.right <= window.innerWidth + 1 && r.top >= 0 && r.bottom <= window.innerHeight + 1;
  });
  results[results.length - 1].exportFits = exportFits;
  if (theme === 'dark') await page.screenshot({ path: `shots/studio-export-${width}-dark.png` });
  await page.keyboard.press('Escape');

  results[results.length - 1].errors = errors;
  assert.equal(errors.length, 0);
  await context.close();
}

await check(1440, 900, 'dark');
await check(1366, 768, 'dark');
await check(1024, 700, 'light');
await check(390, 844, 'dark');

for (const r of results) console.log(JSON.stringify(r));
assert.ok(results.every(r => !r.overflowX), 'no horizontal overflow at any width');
assert.ok(results.every(r => !r.rightOverflow), 'topbar actions stay inside the viewport');
assert.ok(results.every(r => r.cmd.fits), 'command palette fits');
assert.ok(results.every(r => r.resizeFits), 'resize modal fits');
assert.ok(results.every(r => r.exportFits), 'export modal fits');
await browser.close();
console.log('STUDIO RESPONSIVE OK');

