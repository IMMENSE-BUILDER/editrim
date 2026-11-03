import { chromium } from 'playwright';
import assert from 'node:assert';

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];

function watch(page) {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
watch(p);

const transform = locator => locator.evaluate(el => getComputedStyle(el).transform);
const animation = locator => locator.evaluate(el => {
  const s = getComputedStyle(el);
  return { name: s.animationName, duration: s.animationDuration, transform: s.transform };
});

// ---------- dashboard ----------
await p.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await p.waitForTimeout(700);

const echo = await p.evaluate(() => {
  const icons = [...document.querySelectorAll('[data-editrim-icon]')];
  return {
    icons: icons.length,
    echoes: document.querySelectorAll('[data-editrim-icon] .editrim-icon-echo').length,
    compactHidden: [...document.querySelectorAll('.editrim-icon.is-compact .editrim-icon-echo')]
      .every(el => getComputedStyle(el).display === 'none'),
  };
});
console.log('icon layers', echo);
assert.equal(echo.icons, echo.echoes);
assert.ok(echo.compactHidden);

const cat = p.locator('.home-cat').filter({ hasText: 'Templates' });
const catIcon = cat.locator('.home-cat-icon .editrim-icon');
const catEntrance = await animation(catIcon);
console.log('category entrance animation', catEntrance);
assert.ok(catEntrance.name.includes('editrim-icon-enter'));
const catBefore = await transform(catIcon);
await cat.hover();
await p.waitForTimeout(280);
const catAfter = await transform(catIcon);
console.log('category icon transform', catBefore, '->', catAfter);
assert.notEqual(catAfter, catBefore);
assert.notEqual(catAfter, 'none');

const create = p.locator('.rail-create');
const createIcon = create.locator('.editrim-icon');
const createBefore = await transform(createIcon);
await create.hover();
await p.waitForTimeout(240);
const createAfter = await transform(createIcon);
console.log('create icon transform', createBefore, '->', createAfter);
assert.notEqual(createAfter, createBefore);
assert.notEqual(createAfter, 'none');

const projects = p.locator('.rail-nav button').filter({ hasText: 'Projects' });
const projectsIcon = projects.locator('.editrim-icon');
const projectsBefore = await transform(projectsIcon);
await projects.hover();
await p.waitForTimeout(240);
const projectsAfter = await transform(projectsIcon);
console.log('rail icon transform', projectsBefore, '->', projectsAfter);
assert.notEqual(projectsAfter, projectsBefore);

// Create modal glyph motion
await p.locator('.rail-create').click();
await p.waitForTimeout(350);
const glyph = p.locator('.size-card .format-glyph').first();
const glyphBefore = await transform(glyph);
await p.locator('.size-card').first().hover();
await p.waitForTimeout(240);
const glyphAfter = await transform(glyph);
console.log('format glyph transform', glyphBefore, '->', glyphAfter);
assert.notEqual(glyphAfter, glyphBefore);
await p.keyboard.press('Escape');
await p.waitForTimeout(250);

// ---------- studio ----------
await p.goto(`${base}/editor/new?template=cafe-opening`, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);

const railTabs = p.locator('.ed-rail > button');
const elementsTab = railTabs.filter({ hasText: 'Elements' });
const elementsIcon = elementsTab.locator('.editrim-icon');
const studioEntrance = await animation(elementsIcon);
console.log('studio entrance animation', studioEntrance);
assert.ok(studioEntrance.name.includes('editrim-icon-enter'));
const elementsBefore = await transform(elementsIcon);
await elementsTab.hover();
await p.waitForTimeout(240);
const elementsAfter = await transform(elementsIcon);
console.log('studio rail icon transform', elementsBefore, '->', elementsAfter);
assert.notEqual(elementsAfter, elementsBefore);

const aiTab = railTabs.filter({ hasText: 'AI' });
await aiTab.click();
await p.waitForTimeout(80);
const activeIcon = aiTab.locator('.editrim-icon');
const activeAnim = await animation(activeIcon);
console.log('active rail animation', activeAnim);
assert.ok(activeAnim.name.includes('editrim-icon-pop'));
assert.notEqual(activeAnim.duration, '0s');

// Close AI panel, hover undo
await p.locator('.lp-close').click();
await p.waitForTimeout(250);
const target = p.locator('.cv-el').nth(2);
await target.click({ force: true });
await p.waitForTimeout(300);
const rotateHandle = p.locator('.cv-rotate .editrim-icon');
const rotateBefore = await transform(rotateHandle);
await p.locator('.cv-rotate').hover();
await p.waitForTimeout(220);
const rotateAfter = await transform(rotateHandle);
console.log('canvas rotate icon', rotateBefore, '->', rotateAfter);
assert.notEqual(rotateAfter, rotateBefore);
const undo = p.locator('.ed-top-center .ed-ico').first();
const undoIcon = undo.locator('.editrim-icon');
const undoBefore = await transform(undoIcon);
await undo.hover();
await p.waitForTimeout(220);
const undoAfter = await transform(undoIcon);
console.log('undo icon transform', undoBefore, '->', undoAfter);
assert.notEqual(undoAfter, undoBefore);

// Context menu icon motion
await target.click({ button: 'right', force: true });
await p.waitForTimeout(300);
const row = p.locator('.cv-menu-row').filter({ hasText: 'Duplicate' });
const rowIcon = row.locator('.cv-menu-icon .editrim-icon');
const rowBefore = await transform(rowIcon);
await row.hover();
await p.waitForTimeout(240);
const rowAfter = await transform(rowIcon);
console.log('context icon transform', rowBefore, '->', rowAfter);
assert.notEqual(rowAfter, rowBefore);
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
await target.click({ force: true });
await p.waitForTimeout(250);

// Inspector alignment icon motion
const align = p.locator('.insp-align button').first();
const alignIcon = align.locator('.editrim-icon');
const alignBefore = await transform(alignIcon);
await align.hover();
await p.waitForTimeout(220);
const alignAfter = await transform(alignIcon);
console.log('inspector icon transform', alignBefore, '->', alignAfter);
assert.notEqual(alignAfter, alignBefore);

// AI mode tab active pop
await aiTab.click();
await p.waitForTimeout(300);
const modeTab = p.locator('.ai-tabs button').nth(2);
await modeTab.click();
await p.waitForTimeout(80);
const modeAnim = await animation(modeTab.locator('.editrim-icon'));
console.log('AI mode icon animation', modeAnim);
assert.ok(modeAnim.name.includes('editrim-icon-pop'));

// ---------- reduced motion ----------
const rctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const rp = await rctx.newPage();
watch(rp);
await rp.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await rp.waitForTimeout(600);
const rc = rp.locator('.home-cat').filter({ hasText: 'Templates' });
const rcIcon = rc.locator('.home-cat-icon .editrim-icon');
const reducedBase = await rcIcon.evaluate(el => {
  const s = getComputedStyle(el);
  return { transition: s.transitionProperty, animation: s.animationName, transform: s.transform };
});
await rc.hover();
await rp.waitForTimeout(250);
const reducedHover = await rcIcon.evaluate(el => {
  const s = getComputedStyle(el);
  return { transform: s.transform, animation: s.animationName };
});
console.log('reduced motion', reducedBase, '->', reducedHover);
assert.ok(!reducedBase.transition.includes('transform'));
assert.equal(reducedBase.animation, 'none');
assert.equal(reducedHover.transform, 'none');
assert.equal(reducedHover.animation, 'none');

await rp.goto(`${base}/editor/new?template=cafe-opening`, { waitUntil: 'networkidle' });
await rp.waitForTimeout(600);
const rtab = rp.locator('.ed-rail > button').nth(1);
await rtab.click();
await rp.waitForTimeout(80);
const reducedStudio = await rtab.locator('.editrim-icon').evaluate(el => {
  const s = getComputedStyle(el);
  return { transition: s.transitionProperty, animation: s.animationName };
});
console.log('reduced studio', reducedStudio);
assert.ok(!reducedStudio.transition.includes('transform'));
assert.equal(reducedStudio.animation, 'none');

console.log('errors', errors);
assert.equal(errors.length, 0);

await p.screenshot({ path: 'shots/icon-v2-studio-final.png' });
await ctx.close();
await rctx.close();
await browser.close();
console.log('ICON MOTION E2E OK');
