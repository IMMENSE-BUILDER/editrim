import { chromium } from 'playwright';
import assert from 'node:assert';
const browser = await chromium.launch({ channel: 'chrome' });
const log = (k, v) => console.log(k + ':', typeof v === 'string' ? v : JSON.stringify(v));

const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERR ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });

// Landing: hero chip contained; button press tokens
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const chip = await page.locator('.hero-chip-type').boundingBox();
log('heroChipRight', chip.x + chip.width);
assert.ok(chip.x + chip.width <= 1440);
const btnMotion = await page.locator('.btn-cobalt').first().evaluate(el => {
  const s = getComputedStyle(el);
  return { prop: s.transitionProperty, dur: s.transitionDuration };
});
log('buttonMotion', btnMotion);
assert.ok(btnMotion.prop.includes('transform'));
assert.ok(btnMotion.prop.includes('background'));

// Home: contrast, focus, escape menus
await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const contrast = await page.evaluate(() => {
  const parse = c => {
    const m = c.match(/[\d.]+/g).map(Number);
    return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 };
  };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) });
  const lum = c => {
    const [r, g, b] = [c.r, c.g, c.b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const bg = parse(getComputedStyle(document.querySelector('.home')).backgroundColor);
  const fg = parse(getComputedStyle(document.querySelector('.home-section-head h2')).color);
  const merged = blend(fg, bg);
  const L1 = lum(merged), L2 = lum(bg);
  return { fg: getComputedStyle(document.querySelector('.home-section-head h2')).color, ratio: Number(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2)) };
});
log('homeHeadingContrast', contrast);
assert.ok(contrast.ratio >= 4.5);
await page.locator('.home-cat').first().focus();
const focus = await page.locator('.home-cat').first().evaluate(el => getComputedStyle(el).outlineColor);
log('homeFocusColor', focus);
assert.equal(focus, 'rgb(185, 167, 255)');
if (await page.locator('.home-project-menu-btn').count()) {
  await page.locator('.home-project-menu-btn').first().click(); await page.waitForTimeout(150);
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  assert.equal(await page.locator('.home-project-menu').count(), 0);
}
await page.locator('.rail-create').focus();
await page.locator('.rail-create').click(); await page.waitForTimeout(250);
const modalFocus = await page.evaluate(() => document.activeElement?.className);
log('modalInitialFocus', modalFocus);
assert.ok(String(modalFocus).includes('size-search-input') || String(modalFocus).includes('size-tab'));
for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
assert.ok(await page.evaluate(() => !!document.activeElement?.closest('.modal')));
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
const restored = await page.evaluate(() => document.activeElement?.className);
log('modalFocusRestored', restored);
assert.ok(String(restored).includes('rail-create'));

// Editor: menu origins, submenu direction, toast exit
await page.goto('http://localhost:5173/editor/new?template=cafe-opening', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const bruma = page.locator('.cv-el').filter({ hasText: /^Bruma$/ }).first();
await bruma.click({ button: 'right' });
await page.waitForTimeout(200);
const menuMotion = await page.locator('.cv-menu').evaluate(el => { const s = getComputedStyle(el); return { name: s.animationName, dur: s.animationDuration, origin: s.transformOrigin }; });
log('contextMenuMotion', menuMotion);
assert.equal(menuMotion.origin, '0px 0px');
await page.locator('.cv-menu-label').filter({ hasText: /^Align to page$/ }).hover();
await page.waitForTimeout(160);
const subMotion = await page.locator('.cv-menu-sub').evaluate(el => { const s = getComputedStyle(el); return { name: s.animationName, origin: s.transformOrigin }; });
log('submenuMotion', subMotion);
assert.equal(subMotion.name, 'cv-sub-in');
await page.locator('.cv-menu-label').filter({ hasText: /^Copy$/ }).click();
await page.waitForTimeout(120);
const copied = page.locator('.toast').filter({ hasText: 'Copied' });
assert.equal(await copied.count(), 1);
await page.waitForTimeout(2950);
log('toastLeaving', await copied.evaluateAll(els => els.map(e => e.className)));
assert.ok((await copied.count()) === 1);
await page.waitForTimeout(250);
log('toastAfterExit', await page.locator('.toast').filter({ hasText: 'Copied' }).count());
assert.equal(await page.locator('.toast').filter({ hasText: 'Copied' }).count(), 0);
// page menu popover origin
await page.locator('.cv-viewport').click({ button: 'right', position: { x: 20, y: 20 } });
await page.waitForTimeout(150);
const pageMenuMotion = await page.locator('.cv-menu').count() ? await page.locator('.cv-menu').evaluate(el => getComputedStyle(el).animationName) : 'closed';
log('pageMenuMotion', pageMenuMotion);
log('consoleErrors', errors);
assert.equal(errors.length, 0);
await page.screenshot({ path: 'shots/polish-final-editor.png' });
await ctx.close();

// Reduced motion pass
const rctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const rp = await rctx.newPage();
await rp.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await rp.waitForTimeout(500);
const reduced = {
  hero: await rp.locator('.hero-card').first().evaluate(el => getComputedStyle(el).animationName),
  marquee: await rp.locator('.marquee-track').evaluate(el => getComputedStyle(el).animationName),
  buttonTransition: await rp.locator('.btn').first().evaluate(el => getComputedStyle(el).transitionProperty),
};
log('reducedMotion', reduced);
assert.equal(reduced.hero, 'none');
assert.equal(reduced.marquee, 'none');
assert.ok(!reduced.buttonTransition.includes('transform'));
await rp.locator('.promise').scrollIntoViewIfNeeded();
await rp.waitForTimeout(400);
const reveal = await rp.locator('.promise').evaluate(el => { const s = getComputedStyle(el); return { cls: el.className, opacity: s.opacity, transform: s.transform }; });
log('reducedReveal', reveal);
assert.ok(reveal.cls.includes('is-visible'));
assert.equal(reveal.opacity, '1');
await rp.screenshot({ path: 'shots/polish-final-reduced.png' });
await rp.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
await rp.waitForTimeout(500);
await rp.locator('.rail-create').click();
await rp.waitForTimeout(300);
const chapterDelay = await rp.locator('.size-card').first().evaluate(el => getComputedStyle(el).animationDelay);
log('reducedSizeCardDelay', chapterDelay);
assert.equal(chapterDelay, '0s');
await rctx.close();

await browser.close();
console.log('POLISH E2E OK');
