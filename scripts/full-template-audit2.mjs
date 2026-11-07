import { chromium } from 'playwright';
import fs from 'node:fs';

const base = 'http://localhost:5173';
const workers = 1;
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
const gallery = await context.newPage();
await gallery.goto(`${base}/templates`, { waitUntil: 'networkidle' });
await gallery.waitForSelector('.template-card');
const ids = await gallery.evaluate(() => [...document.querySelectorAll('.template-card')].map(a => {
  const href = a.getAttribute('href') ?? '';
  return href.split('template=')[1] ?? '';
}).filter(Boolean));
await gallery.close();
console.log('IDS', ids.length, 'UNIQUE', new Set(ids).size);

const chunks = Array.from({ length: workers }, (_, i) => ids.filter((_, index) => index % workers === i));
const failures = [];
const summaries = [];
let checked = 0;

async function auditChunk(chunk, workerIndex) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  for (const id of chunk) {
    try {
      await page.goto(`${base}/editor/new?template=${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.cv-page', { timeout: 15000 });
      await page.waitForTimeout(350);
      const pageCount = await page.locator('.page-item').count();
      const pages = [];
      for (let index = 0; index < pageCount; index++) {
        if (index > 0) {
          await page.locator('.page-thumb').nth(index).click();
          await page.waitForTimeout(180);
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
            const text = el.querySelector('span');
            const label = (text?.textContent ?? '').replace(/\s+/g, ' ').slice(0, 120);
            const record = { kind: el.className, text: label, box: { x: box.left - pageBox.left, y: box.top - pageBox.top, w: box.width, h: box.height } };
            if (box.left < pageBox.left - 2 || box.top < pageBox.top - 2 ||
                box.right > pageBox.right + 2 || box.bottom > pageBox.bottom + 2) {
              outside.push(record);
            }
            if (text) {
              const t = text.getBoundingClientRect();
              const over = {
                left: Math.max(0, box.left - t.left),
                right: Math.max(0, t.right - box.right),
                top: Math.max(0, box.top - t.top),
                bottom: Math.max(0, t.bottom - box.bottom),
              };
              if (over.left > 6 || over.right > 6 || over.top > 6 || over.bottom > 6) {
                overflow.push({ ...record, over });
              }
            }
          }
          return { count: elements.length, outside, overflow };
        });
        pages.push(metrics);
        if (metrics.count < 5) failures.push({ id, type: 'thin-page', page: index + 1, count: metrics.count });
        if (metrics.outside.length) failures.push({ id, type: 'outside', page: index + 1, elements: metrics.outside });
        if (metrics.overflow.length) failures.push({ id, type: 'overflow', page: index + 1, elements: metrics.overflow });
      }
      summaries.push({ id, pageCount, pages });
      checked++;
      if (checked % 20 === 0) console.log('CHECKED', checked, 'FAILURES', failures.length);
      await page.evaluate(() => localStorage.clear());
    } catch (error) {
      failures.push({ id, type: 'error', error: String(error).slice(0, 300) });
    }
  }
  if (errors.length) failures.push({ id: `worker-${workerIndex}-console`, type: 'console', errors: errors.slice(0, 10) });
  await page.close();
}

await Promise.all(chunks.map((chunk, index) => auditChunk(chunk, index)));
fs.mkdirSync('shots', { recursive: true });
fs.writeFileSync('shots/template-audit2.json', JSON.stringify({ ids: ids.length, summaries, failures }, null, 2));
console.log('DONE', { checked, failures: failures.length });
const byType = failures.reduce((acc, f) => ({ ...acc, [f.type]: (acc[f.type] ?? 0) + 1 }), {});
console.log('BY TYPE', byType);
for (const failure of failures.slice(0, 30)) console.log(JSON.stringify(failure));
await browser.close();

