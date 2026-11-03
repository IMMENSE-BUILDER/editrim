import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

/**
 * Theme audit: the light paper studio and the dark ink studio must both be
 * complete, not a filter. Checks the dashboard toggle position, persistence
 * before first paint, contrast on every major surface, and the curated dark
 * treatments for the marketing site, templates gallery, editor and modals.
 */

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const wait = ms => page.waitForTimeout(ms);

const parse = value => {
  const m = value.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1];
  return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 };
};
const blend = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});
const lum = c => {
  const [r, g, b] = [c.r, c.g, c.b].map(v => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (fgValue, bgValue) => {
  const bg = parse(bgValue);
  const fg = blend(parse(fgValue), bg);
  const a = lum(fg);
  const b = lum(bg);
  return Number(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2));
};

const styleOf = (selector, property) => page.locator(selector).first().evaluate(
  (el, prop) => getComputedStyle(el)[prop],
  property,
);

// ---------------------------------------------------------------- light first
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.removeItem('vellum_theme_v1'));
await page.reload({ waitUntil: 'networkidle' });
await wait(700);

assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'light');
const lightBody = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const lightHome = await styleOf('.home', 'backgroundColor');
const lightRail = await styleOf('.home-rail', 'backgroundColor');
console.log('light shell', { lightBody, lightHome, lightRail });
assert.ok(lum(parse(lightBody)) > 0.7, 'light body should be paper');
assert.ok(lum(parse(lightHome)) > 0.7, 'light dashboard should be paper');
assert.ok(lum(parse(lightRail)) > 0.7, 'light rail should be paper');

const toggle = page.locator('.rail-bottom .rail-theme');
assert.equal(await toggle.count(), 1, 'the theme switch lives in the rail bottom');
const toggleBox = await toggle.boundingBox();
const railBox = await page.locator('.home-rail').boundingBox();
console.log('toggle placement', { toggleY: Math.round(toggleBox.y), railY: Math.round(railBox.y), railH: Math.round(railBox.height) });
assert.ok(toggleBox.y > railBox.y + railBox.height * 0.55, 'toggle sits in the lower rail');
assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
assert.equal(await toggle.getAttribute('aria-label'), 'Switch to dark mode');

const lightHeading = await styleOf('.home-section-head h2', 'color');
const lightLabel = await styleOf('.home-cat-label', 'color');
const lightHeadingRatio = contrast(lightHeading, lightHome);
const lightLabelRatio = contrast(lightLabel, lightHome);
console.log('light contrast', { lightHeadingRatio, lightLabelRatio });
assert.ok(lightHeadingRatio >= 7, 'light heading contrast');
assert.ok(lightLabelRatio >= 4.5, 'light category label contrast');

// --------------------------------------------------------------- toggle dark
await toggle.click();
await wait(60);
const switching = await page.evaluate(() => document.documentElement.classList.contains('theme-switching'));
assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
assert.equal(await page.evaluate(() => localStorage.getItem('vellum_theme_v1')), 'dark');
assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
await wait(500);
const darkHome = await styleOf('.home', 'backgroundColor');
const darkRail = await styleOf('.home-rail', 'backgroundColor');
console.log('dark shell', { darkHome, darkRail, switching });
assert.ok(lum(parse(darkHome)) < 0.02, 'dark dashboard should be ink');
assert.equal(switching, true, 'theme change cross-fades');
assert.equal(await page.evaluate(() => document.documentElement.classList.contains('theme-switching')), false);

const darkHeading = await styleOf('.home-section-head h2', 'color');
const darkLabel = await styleOf('.home-cat-label', 'color');
const darkHeadingRatio = contrast(darkHeading, darkHome);
const darkLabelRatio = contrast(darkLabel, darkHome);
console.log('dark contrast', { darkHeadingRatio, darkLabelRatio });
assert.ok(darkHeadingRatio >= 7, 'dark heading contrast');
assert.ok(darkLabelRatio >= 4.5, 'dark category label contrast');
await page.screenshot({ path: 'shots/theme-audit-dashboard-dark.png' });

// -------------------------------------------------------------- persistence
const stored = await context.storageState();
await page.reload({ waitUntil: 'domcontentloaded' });
const beforePaint = await page.evaluate(() => document.documentElement.dataset.theme);
assert.equal(beforePaint, 'dark', 'stored theme applies before first paint');
await page.waitForLoadState('networkidle');
await wait(600);
assert.equal(await styleOf('.home', 'backgroundColor'), darkHome);

// ------------------------------------------------------------------ landing
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await wait(900);
const headerBg = await styleOf('.site-header', 'backgroundColor');
const navColor = await styleOf('.site-nav a', 'color');
const pageBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const navRatio = contrast(navColor, blend(parse(headerBg), parse(pageBg)) ? `rgb(${Math.round(blend(parse(headerBg), parse(pageBg)).r)}, ${Math.round(blend(parse(headerBg), parse(pageBg)).g)}, ${Math.round(blend(parse(headerBg), parse(pageBg)).b)})` : pageBg);
console.log('landing dark', { headerBg, navColor, navRatio });
assert.ok(lum(parse(headerBg)) < 0.05, 'landing header is dark');
assert.ok(navRatio >= 4.5, 'landing nav contrast');

await page.locator('.site-footer').scrollIntoViewIfNeeded();
await wait(700);
const footerBg = await styleOf('.site-footer', 'backgroundColor');
const footerWord = await styleOf('.site-footer .logo-word', 'color');
const footerLink = await styleOf('.footer-cols a', 'color');
console.log('footer dark', { footerBg, footerWord, footerLink });
assert.ok(lum(parse(footerBg)) < 0.03, 'footer is deep ink');
assert.ok(contrast(footerWord, footerBg) >= 4.5, 'footer wordmark contrast');
assert.ok(contrast(footerLink, footerBg) >= 4.5, 'footer link contrast');
await page.screenshot({ path: 'shots/theme-audit-landing-dark.png' });

// ---------------------------------------------------------------- templates
await page.goto(`${base}/templates`, { waitUntil: 'networkidle' });
await wait(800);
const galleryBar = await styleOf('.gallery-bar', 'backgroundColor');
const filterColor = await styleOf('.gallery-filter:not(.active)', 'color');
const activeFilterColor = await styleOf('.gallery-filter.active', 'color');
const activeFilterBg = await styleOf('.gallery-filter.active', 'backgroundColor');
const barBlend = blend(parse(galleryBar), parse(pageBg));
const barRgb = `rgb(${Math.round(barBlend.r)}, ${Math.round(barBlend.g)}, ${Math.round(barBlend.b)})`;
const filterRatio = contrast(filterColor, barRgb);
const activeFilterRatio = contrast(activeFilterColor, activeFilterBg);
console.log('templates dark', { galleryBar, filterColor, filterRatio, activeFilterColor, activeFilterBg, activeFilterRatio });
assert.ok(lum(parse(galleryBar)) < 0.05, 'gallery bar is dark');
assert.ok(filterRatio >= 4.5, 'gallery filter contrast');
assert.ok(activeFilterRatio >= 4.5, 'active gallery filter contrast');
await page.screenshot({ path: 'shots/theme-audit-templates-dark.png' });

// ------------------------------------------------------------------- editor
await page.goto(`${base}/editor/new?template=cafe-opening`, { waitUntil: 'networkidle' });
await wait(1000);
const topbar = await styleOf('.ed-topbar', 'backgroundColor');
const panel = await styleOf('.lp', 'backgroundColor');
const inspector = await styleOf('.inspector', 'backgroundColor');
const nameInputBg = await styleOf('.inspector .input', 'backgroundColor');
const nameInputColor = await styleOf('.inspector .input', 'color');
console.log('editor dark', { topbar, panel, inspector, nameInputBg, nameInputColor });
assert.ok(lum(parse(topbar)) < 0.03, 'editor topbar is dark');
assert.ok(lum(parse(panel)) < 0.03, 'editor panel is dark');
assert.ok(lum(parse(inspector)) < 0.03, 'editor inspector is dark');
assert.ok(lum(parse(nameInputBg)) < 0.03, 'editor input is dark');
assert.ok(contrast(nameInputColor, nameInputBg) >= 4.5, 'editor input text contrast');

await page.locator('.ed-download').click();
await wait(500);
const modalBg = await styleOf('.modal', 'backgroundColor');
const modalText = await styleOf('.modal-title', 'color');
console.log('export dark', { modalBg, modalText });
assert.ok(lum(parse(modalBg)) < 0.05, 'export modal is dark');
assert.ok(contrast(modalText, modalBg) >= 4.5, 'export modal title contrast');
await page.screenshot({ path: 'shots/theme-audit-editor-dark.png' });
await page.keyboard.press('Escape');

// ------------------------------------------------------------------- shared
await page.goto(`${base}/view`, { waitUntil: 'networkidle' });
await wait(700);
const sharedTop = await styleOf('.shared-top', 'backgroundColor');
const sharedBg = await styleOf('.shared-shell', 'backgroundColor');
const sharedTitle = await styleOf('.shared-empty h1', 'color');
console.log('shared dark', { sharedTop, sharedBg, sharedTitle });
assert.ok(lum(parse(sharedTop)) < 0.05, 'shared header is dark');
assert.ok(contrast(sharedTitle, sharedBg) >= 4.5, 'shared title contrast');

// --------------------------------------------------------------- back to light
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await wait(700);
await page.locator('.rail-theme').click();
await wait(600);
assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
assert.equal(await page.evaluate(() => localStorage.getItem('vellum_theme_v1')), 'light');
assert.ok(lum(parse(await styleOf('.home', 'backgroundColor'))) > 0.7, 'dashboard returns to paper');
assert.equal(await page.locator('.rail-theme').getAttribute('aria-pressed'), 'false');
await page.screenshot({ path: 'shots/theme-audit-dashboard-light.png' });

// --------------------------------------------------------------------- mobile
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
const mp = await mobile.newPage();
mp.on('pageerror', error => errors.push(error.message));
await mp.goto(`${base}/`, { waitUntil: 'networkidle' });
await mp.evaluate(() => localStorage.setItem('vellum_theme_v1', 'dark'));
await mp.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await mp.waitForTimeout(700);
const mobileState = await mp.evaluate(() => {
  const toggle = document.querySelector('.rail-theme');
  const rail = document.querySelector('.home-rail');
  return {
    theme: document.documentElement.dataset.theme,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    toggleVisible: Boolean(toggle) && getComputedStyle(toggle).display !== 'none',
    railHeight: Math.round(rail.getBoundingClientRect().height),
    railTop: Math.round(rail.getBoundingClientRect().top),
  };
});
console.log('mobile dark', mobileState);
assert.equal(mobileState.theme, 'dark');
assert.equal(mobileState.overflow, false);
assert.equal(mobileState.toggleVisible, true);
assert.ok(mobileState.railHeight >= 48);
await mp.screenshot({ path: 'shots/theme-audit-mobile-dark.png' });
await mobile.close();

// --------------------------------------------------------------- reduced motion
const reduced = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const rp = await reduced.newPage();
await rp.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await rp.waitForTimeout(600);
await rp.locator('.rail-theme').click();
await rp.waitForTimeout(60);
const reducedState = await rp.evaluate(() => ({
  theme: document.documentElement.dataset.theme,
  switching: document.documentElement.classList.contains('theme-switching'),
}));
console.log('reduced motion toggle', reducedState);
assert.equal(reducedState.theme, 'dark');
assert.equal(reducedState.switching, false, 'reduced motion skips the cross-fade');
await reduced.close();

console.log('errors', errors);
assert.equal(errors.length, 0);
await context.close();
await browser.close();
console.log('THEME AUDIT OK - light paper and dark ink are complete');
