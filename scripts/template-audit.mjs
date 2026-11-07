import { chromium } from 'playwright';
import fs from 'node:fs';

const ids = process.argv.slice(2);
const base = 'http://localhost:5173';
const outDir = 'shots/templates-audit';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

for (const id of ids) {
  try {
    await page.goto(`${base}/editor/new?template=${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cv-page', { timeout: 15000 });
    await page.waitForTimeout(700);
    const pageCount = await page.locator('.page-item').count();
    const result = { id, pageCount, pages: [] };
    for (let index = 0; index < pageCount; index++) {
      if (index > 0) {
        await page.locator('.page-thumb').nth(index).click();
        await page.waitForTimeout(300);
      }
      const metrics = await page.evaluate(() => {
        const pageEl = document.querySelector('.cv-page');
        if (!pageEl) return { count: 0, outside: [], overflow: [] };
        const pageBox = pageEl.getBoundingClientRect();
        const elements = [...document.querySelectorAll('.cv-el')];
        const outside = [];
        const overflow = [];
        for (const el of elements) {
          const box = el.getBoundingClientRect();
          const elementId = el.getAttribute('data-element-id') ?? el.className;
          if (box.left < pageBox.left - 2 || box.top < pageBox.top - 2 ||
              box.right > pageBox.right + 2 || box.bottom > pageBox.bottom + 2) {
            outside.push(elementId);
          }
          const span = el.querySelector('span');
          if (span) {
            const text = span.getBoundingClientRect();
            if (text.left < box.left - 6 || text.right > box.right + 6 ||
                text.top < box.top - 6 || text.bottom > box.bottom + 6) {
              overflow.push(elementId);
            }
          }
        }
        return { count: elements.length, outside, overflow };
      });
      result.pages.push(metrics);
      if (index === 0) {
        await page.locator('.cv-page').screenshot({ path: `${outDir}/${id}.png` });
      }
    }
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({ id, error: String(error) }));
  }
}
console.log('ERRORS', JSON.stringify(errors.slice(0, 20)));
await browser.close();
