import { chromium } from 'playwright';
import assert from 'node:assert';

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];

async function audit(p, name, url) {
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(650);
  const data = await p.evaluate(() => {
    const icons = [...document.querySelectorAll('[data-vellum-icon]')];
    const allowed = 'svg.closest(".format-glyph, .logo, .brand-mark, .spin")';
    const stock = [...document.querySelectorAll('svg:not([data-vellum-icon])')]
      .filter(svg => !svg.closest('.format-glyph') && !svg.closest('.logo') && !svg.closest('.brand-mark') && !svg.closest('.spin') && !svg.closest('.page-preview') && !svg.closest('.cv-el'))
      .map(svg => svg.outerHTML.slice(0, 120));
    return {
      count: icons.length,
      echoes: document.querySelectorAll('[data-vellum-icon] .vellum-icon-echo').length,
      names: [...new Set(icons.map(el => el.getAttribute('data-vellum-icon')))],
      glyphs: document.querySelectorAll('.format-glyph').length,
      stock,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      forbidden: /Design not found/i.test(document.body.innerText),
    };
  });
  console.log(name, { count: data.count, echoes: data.echoes, glyphs: data.glyphs, stock: data.stock.length, overflow: data.overflow, forbidden: data.forbidden, names: data.names });
  if (data.stock.length) console.log(name, 'STOCK', data.stock);
  assert.equal(data.forbidden, false, `${name} rendered a not-found state`);
  assert.equal(data.overflow, false, `${name} horizontally overflows`);
  assert.equal(data.stock.length, 0, `${name} still renders stock icons`);
  assert.equal(data.echoes, data.count, `${name} has icons without the ink echo`);
  return data;
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await desktop.newPage();
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

const landing = await audit(p, 'landing 1440', `${base}/`);
const home = await audit(p, 'home 1440', `${base}/dashboard`);
const templates = await audit(p, 'templates 1440', `${base}/templates`);
const editor = await audit(p, 'editor 1440', `${base}/editor/new?template=cafe-opening`);
const designId = await p.evaluate(async () => {
  const storage = await import('/src/lib/storage.ts');
  return storage.listDesigns()[0]?.id ?? '';
});
assert.ok(designId, 'editor saved a design');
const present = await audit(p, 'present 1440', `${base}/present/${designId}`);
const notfound = await audit(p, '404 1440', `${base}/not-a-real-page`);

await p.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
await p.locator('.rail-create').click();
await p.waitForTimeout(350);
const modal = await p.evaluate(() => ({
  icons: document.querySelectorAll('.modal [data-vellum-icon]').length,
  glyphs: document.querySelectorAll('.modal .format-glyph').length,
  close: !!document.querySelector('.modal [data-vellum-icon="close"]'),
}));
console.log('create modal', modal);
assert.ok(modal.icons >= 2 && modal.close);
assert.equal(modal.glyphs, await p.locator('.size-card').count());

const shareUrl = await p.evaluate(async () => {
  const storage = await import('/src/lib/storage.ts');
  const share = await import('/src/lib/share.ts');
  const meta = storage.listDesigns()[0];
  const design = meta ? storage.getDesign(meta.id) : null;
  if (!design) return '';
  const result = await share.buildShareLink(design);
  return result.url;
});
assert.ok(shareUrl.includes('/view#d='), 'share URL created');
const shared = await audit(p, 'shared view 1440', shareUrl);

await p.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
await p.locator('.rail-nav button').filter({ hasText: 'Brand' }).click();
await p.waitForTimeout(300);
const brand = await p.evaluate(() => document.querySelectorAll('.modal [data-vellum-icon]').length);
console.log('brand modal icons', brand);
assert.ok(brand >= 2);

await p.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
await p.locator('.home-help').click();
await p.waitForTimeout(300);
const help = await p.evaluate(() => document.querySelectorAll('.modal [data-vellum-icon]').length);
console.log('help modal icons', help);
assert.ok(help >= 4);

// Mobile audit
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
const mp = await mobile.newPage();
mp.on('pageerror', e => errors.push(e.message));
mp.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const mlanding = await audit(mp, 'landing 390', `${base}/`);
const mhome = await audit(mp, 'home 390', `${base}/dashboard`);
const mtemplates = await audit(mp, 'templates 390', `${base}/templates`);
const meditor = await audit(mp, 'editor 390', `${base}/editor/new?template=cafe-opening`);
const mid = await mp.evaluate(async () => {
  const storage = await import('/src/lib/storage.ts');
  return storage.listDesigns()[0]?.id ?? '';
});
const mpresent = await audit(mp, 'present 390', `${base}/present/${mid}`);
await mp.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await mp.waitForTimeout(400);
await mp.locator('.rail-create').click();
await mp.waitForTimeout(300);
const mm = await mp.evaluate(() => ({ icons: document.querySelectorAll('.modal [data-vellum-icon]').length, glyphs: document.querySelectorAll('.modal .format-glyph').length }));
console.log('create modal 390', mm);
assert.ok(mm.icons >= 2 && mm.glyphs >= 6);

assert.ok(landing.count >= 15, 'landing icon coverage');
assert.ok(home.count >= 20, 'home icon coverage');
assert.ok(templates.glyphs >= 20, 'template format glyph coverage');
assert.ok(editor.count >= 15, 'editor icon coverage');
assert.ok(present.count >= 5, 'present icon coverage');
assert.ok(shared.count >= 4, 'shared view icon coverage');
assert.ok(notfound.count >= 1, '404 icon coverage');
assert.ok(mlanding.count >= 12 && mhome.count >= 15 && mtemplates.glyphs >= 12 && meditor.count >= 10 && mpresent.count >= 4, 'mobile icon coverage');

// Editor surfaces: context menu, AI panel, export and share dialogs
await p.goto(`${base}/editor/new?template=cafe-opening`, { waitUntil: 'networkidle' });
await p.waitForTimeout(700);
const surface = async (name, selector) => {
  const data = await p.evaluate(sel => {
    const root = document.querySelector(sel);
    if (!root) return { exists: false, icons: 0, stock: 0 };
    const stock = [...root.querySelectorAll('svg:not([data-vellum-icon])')]
      .filter(svg => !svg.closest('.format-glyph') && !svg.closest('.logo') && !svg.closest('.brand-mark') && !svg.closest('.spin') && !svg.closest('.page-preview') && !svg.closest('.cv-el'));
    return { exists: true, icons: root.querySelectorAll('[data-vellum-icon]').length, echoes: root.querySelectorAll('[data-vellum-icon] .vellum-icon-echo').length, stock: stock.length };
  }, selector);
  console.log(name, data);
  assert.ok(data.exists, `${name} not found`);
  assert.ok(data.icons >= 2, `${name} lacks custom icons`);
  assert.equal(data.echoes, data.icons, `${name} icons lack the ink echo`);
  assert.equal(data.stock, 0, `${name} still has stock icons`);
};
await p.locator('.cv-el').first().click({ button: 'right' });
await p.waitForTimeout(250);
await surface('editor context menu', '.cv-menu');
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
await p.locator('.ed-rail > button').nth(1).click();
await p.waitForTimeout(350);
await surface('editor AI panel', '.ai-panel');
await p.locator('.lp-close').click();
await p.waitForTimeout(200);
await p.locator('.cv-el').nth(2).click({ force: true });
await p.waitForTimeout(250);
const selectionIcons = await p.evaluate(() => {
  const sel = document.querySelector('.cv-sel');
  if (!sel) return { exists: false, rotate: false, icons: 0, stock: 0 };
  const stock = [...sel.querySelectorAll('svg:not([data-vellum-icon])')]
    .filter(svg => !svg.closest('.format-glyph') && !svg.closest('.logo') && !svg.closest('.brand-mark') && !svg.closest('.spin'));
  return {
    exists: true,
    rotate: !!sel.querySelector('.cv-rotate [data-vellum-icon="rotate"]'),
    icons: sel.querySelectorAll('[data-vellum-icon]').length,
    stock: stock.length,
  };
});
console.log('canvas selection', selectionIcons);
assert.ok(selectionIcons.exists && selectionIcons.rotate, 'canvas rotate handle uses the Vellum icon');
assert.equal(selectionIcons.stock, 0, 'canvas selection has stock icons');
await p.locator('.ed-download').click();
await p.waitForTimeout(300);
await surface('export modal', '.modal');
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
await p.locator('.ed-top-right .ed-action').filter({ hasText: 'Share' }).click();
await p.waitForTimeout(300);
await surface('share modal', '.modal');
await p.keyboard.press('Escape');

console.log('errors', errors);
assert.equal(errors.length, 0);
await desktop.close();
await mobile.close();
await browser.close();
console.log('ICON COVERAGE OK — every route uses the Vellum vocabulary, no stock SVGs, no overflow');
