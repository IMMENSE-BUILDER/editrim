import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

/**
 * Library expansion audit.
 *
 * Confirms the 24 new collection templates are in the gallery and that every
 * page renders with elements inside the artboard and no text overflow.
 */

const base = 'http://localhost:5173';

const NEW_TEMPLATES = {
  'ed-field-notes': { size: [1240, 1754], pages: 1 },
  'ed-miso-smoke': { size: [1240, 1754], pages: 1 },
  'ed-long-table': { size: [1080, 1080], pages: 1 },
  'ed-sable-resume': { size: [1240, 1754], pages: 2 },

  'so-aster-skin': { size: [1080, 1080], pages: 1 },
  'so-fieldwork': { size: [1080, 1080], pages: 3 },
  'so-nocturne': { size: [1080, 1920], pages: 1 },
  'so-sunday-service': { size: [1080, 1920], pages: 1 },

  'dk-meridian': { size: [1920, 1080], pages: 4 },
  'dk-tidal': { size: [1920, 1080], pages: 4 },
  'dk-studio-ledger': { size: [1920, 1080], pages: 4 },
  'dk-common-ground': { size: [1920, 1080], pages: 3 },

  'br-aperture': { size: [1000, 1000], pages: 2 },
  'br-marrow': { size: [1050, 600], pages: 2 },
  'br-kite': { size: [1000, 1000], pages: 2 },
  'br-atelier-nine': { size: [1050, 600], pages: 2 },

  'ev-sonic-bloom': { size: [1240, 1754], pages: 1 },
  'ev-quiet-hour': { size: [1080, 1080], pages: 1 },
  'ev-after-hours': { size: [1000, 1000], pages: 1 },
  'ev-makers-market': { size: [1240, 1754], pages: 1 },

  'co-omni': { size: [1080, 1080], pages: 1 },
  'co-sundae': { size: [1080, 1920], pages: 1 },
  'co-runway-07': { size: [1280, 720], pages: 1 },
  'co-good-shelf': { size: [1584, 396], pages: 1 },
};

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

await page.goto(`${base}/templates`, { waitUntil: 'networkidle' });
await page.waitForSelector('.template-card');
const gallery = await page.evaluate(() => ({
  cards: document.querySelectorAll('.template-card').length,
  count: document.querySelector('.gallery-count')?.textContent?.trim(),
  ids: [...document.querySelectorAll('.template-card')].map(a => {
    const href = a.getAttribute('href') ?? '';
    return href.split('template=')[1] ?? '';
  }),
}));
console.log('gallery', { cards: gallery.cards, count: gallery.count, unique: new Set(gallery.ids).size });
assert.equal(gallery.cards, 300, 'the gallery lists all 300 templates');
assert.equal(new Set(gallery.ids).size, 300, 'template ids are unique');
for (const id of Object.keys(NEW_TEMPLATES)) assert.ok(gallery.ids.includes(id), `${id} is in the gallery`);
await page.screenshot({ path: 'shots/library-expanded-final.png', fullPage: false });

let checkedPages = 0;
const summaries = [];

for (const [id, expected] of Object.entries(NEW_TEMPLATES)) {
  await page.goto(`${base}/editor/new?template=${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.cv-page');
  await page.waitForTimeout(500);

  const sizeText = await page.locator('.ed-size-pill').innerText();
  const dimensions = sizeText.match(/(\d+)\s*[×x]\s*(\d+)/);
  assert.ok(dimensions, `${id} exposes a size pill`);
  assert.equal(Number(dimensions[1]), expected.size[0], `${id} width`);
  assert.equal(Number(dimensions[2]), expected.size[1], `${id} height`);

  const pageCount = await page.locator('.page-item').count();
  assert.equal(pageCount, expected.pages, `${id} page count`);

  let totalElements = 0;
  for (let index = 0; index < pageCount; index++) {
    if (index > 0) {
      await page.locator('.page-thumb').nth(index).click();
      await page.waitForTimeout(220);
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
        const id = el.getAttribute('data-element-id') ?? el.className;
        if (box.left < pageBox.left - 2 || box.top < pageBox.top - 2 ||
            box.right > pageBox.right + 2 || box.bottom > pageBox.bottom + 2) {
          outside.push(id);
        }
        const span = el.querySelector('span');
        if (span) {
          const text = span.getBoundingClientRect();
          if (text.left < box.left - 6 || text.right > box.right + 6 ||
              text.top < box.top - 6 || text.bottom > box.bottom + 6) {
            overflow.push(id);
          }
        }
      }
      return { count: elements.length, outside, overflow };
    });
    assert.ok(metrics.count >= 6, `${id} page ${index + 1} has enough layers`);
    assert.deepEqual(metrics.outside, [], `${id} page ${index + 1} keeps elements inside the artboard`);
    assert.deepEqual(metrics.overflow, [], `${id} page ${index + 1} has no text overflow`);
    totalElements += metrics.count;
    checkedPages += 1;
  }
  summaries.push({ id, pages: pageCount, elements: totalElements });
  console.log(id, `${pageCount}p`, `${totalElements} layers`);
}

fs.mkdirSync('shots', { recursive: true });
assert.equal(checkedPages, 42, 'all 42 new pages were inspected');
assert.equal(errors.length, 0, 'no console or page errors');
console.log('pages checked', checkedPages);
console.log('errors', errors.slice(0, 5));
console.log('LIBRARY EXPANSION OK');
await browser.close();


