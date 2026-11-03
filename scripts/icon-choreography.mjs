import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

/**
 * Icon choreography audit.
 *
 * 1. Static: every VellumIcon glyph must declare its own hover and press
 *    animation, both keyframe blocks must exist, and the durations must differ.
 * 2. Live: every glyph is mounted in a real button, hovered and pressed, and
 *    the computed animation names are compared against the manifest.
 */

const css = fs.readFileSync('src/styles/icon-motion.css', 'utf8');
const component = fs.readFileSync('src/components/VellumIcon.tsx', 'utf8');
const block = component.match(/const ICONS[^{]*{([\s\S]*?)\n};/);
assert.ok(block, 'ICONS map not found');
const names = [...block[1].matchAll(/^  ([a-zA-Z0-9]+):/gm)].map(match => match[1]);
console.log('icons', names.length);
assert.equal(names.length, 121, 'expected 121 icons');

const unique = new Set(names);
assert.equal(unique.size, names.length, 'icon names must be unique');

const hoverDeclarations = [...css.matchAll(/--im-hover: im-([a-zA-Z0-9]+)-h (\d+)ms/g)];
const pressDeclarations = [...css.matchAll(/--im-press: im-([a-zA-Z0-9]+)-p (\d+)ms/g)];
console.log('declarations', hoverDeclarations.length, pressDeclarations.length);
assert.equal(hoverDeclarations.length, names.length, 'every icon needs one hover animation');
assert.equal(pressDeclarations.length, names.length, 'every icon needs one press animation');

const hoverMap = new Map(hoverDeclarations.map(([, name, ms]) => [name, Number(ms)]));
const pressMap = new Map(pressDeclarations.map(([, name, ms]) => [name, Number(ms)]));

for (const name of names) {
  assert.ok(hoverMap.has(name), `no hover animation for ${name}`);
  assert.ok(pressMap.has(name), `no press animation for ${name}`);
  assert.ok(
    css.includes(`@keyframes im-${name}-h {`),
    `missing hover keyframes for ${name}`,
  );
  assert.ok(
    css.includes(`@keyframes im-${name}-p {`),
    `missing press keyframes for ${name}`,
  );
  assert.notEqual(
    hoverMap.get(name),
    pressMap.get(name),
    `${name} hover and press share the same duration`,
  );
}

// An icon must not reuse another icon's keyframe name.
const hoverNames = [...hoverMap.keys()];
const pressNames = [...pressMap.keys()];
assert.equal(new Set(hoverNames).size, hoverNames.length, 'hover keyframe names must be unique');
assert.equal(new Set(pressNames).size, pressNames.length, 'press keyframe names must be unique');

const hoverKeyframeBlocks = [...css.matchAll(/@keyframes im-([a-zA-Z0-9]+)-h /g)].map(m => m[1]);
const pressKeyframeBlocks = [...css.matchAll(/@keyframes im-([a-zA-Z0-9]+)-p /g)].map(m => m[1]);
assert.equal(hoverKeyframeBlocks.length, names.length, 'unexpected number of hover keyframe blocks');
assert.equal(pressKeyframeBlocks.length, names.length, 'unexpected number of press keyframe blocks');

const braces = (css.match(/{/g) ?? []).length - (css.match(/}/g) ?? []).length;
assert.equal(braces, 0, 'CSS braces are unbalanced');
console.log('static audit ok', {
  icons: names.length,
  hover: hoverMap.size,
  press: pressMap.size,
  braces,
});

// ---------------------------------------------------------------- live audit

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

await page.evaluate(iconNames => {
  const lab = document.createElement('div');
  lab.id = 'icon-lab';
  lab.style.cssText = [
    'position:fixed', 'left:0', 'top:0', 'width:420px', 'max-height:100vh',
    'overflow:auto', 'z-index:99999', 'display:grid',
    'grid-template-columns:repeat(6,1fr)', 'gap:6px', 'padding:8px',
    'background:#0b0a0f', 'border-right:1px solid #333',
  ].join(';');
  iconNames.forEach(name => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.labIcon = name;
    button.style.cssText = 'height:52px;display:grid;place-items:center;background:#16151d;border:1px solid #2a2933;border-radius:8px;color:#f4f1ea;cursor:pointer;padding:0;';
    button.innerHTML = `
      <svg class="vellum-icon" data-vellum-icon="${name}" data-icon-size="18" width="18" height="18"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <g class="vellum-icon-ink"><g class="vellum-icon-echo" transform="translate(0.55 0.75)"><path d="M4 4h16v16H4zM8 8h8v8H8z"/></g><g class="vellum-icon-main"><path d="M4 4h16v16H4zM8 8h8v8H8z"/></g></g>
      </svg>`;
    lab.appendChild(button);
  });
  document.body.appendChild(lab);
}, names);

const read = async name => page.evaluate(iconName => {
  const button = document.querySelector(`[data-lab-icon="${iconName}"]`);
  const ink = button.querySelector('.vellum-icon-ink');
  const style = getComputedStyle(ink);
  return { name: style.animationName, duration: style.animationDuration, transform: style.transform };
}, name);

const results = [];
for (const name of names) {
  const button = page.locator(`[data-lab-icon="${name}"]`);
  await button.hover();
  await page.waitForTimeout(60);
  const hover = await read(name);
  await page.mouse.down();
  await page.waitForTimeout(60);
  const press = await read(name);
  await page.mouse.up();
  results.push({ name, hover, press });
}

await page.screenshot({ path: 'shots/icon-choreography-lab.png' });
await page.evaluate(() => document.getElementById('icon-lab')?.remove());

const badHover = results.filter(item => item.hover.name !== `im-${item.name}-h`);
const badPress = results.filter(item => item.press.name !== `im-${item.name}-p`);
console.log('live mismatches', { hover: badHover.length, press: badPress.length });
if (badHover.length) console.log(badHover.slice(0, 6));
if (badPress.length) console.log(badPress.slice(0, 6));
assert.equal(badHover.length, 0, 'hover animations did not reach the glyph');
assert.equal(badPress.length, 0, 'press animations did not reach the glyph');

const identical = results.filter(item => item.hover.name === item.press.name);
assert.equal(identical.length, 0, 'hover and press must be distinct animations');
const sameDuration = results.filter(item => item.hover.duration === item.press.duration);
assert.equal(sameDuration.length, 0, 'hover and press must have different timings');
const stillHover = results.filter(item => item.hover.transform === 'none');
const stillPress = results.filter(item => item.press.transform === 'none');
assert.equal(stillHover.length, 0, 'every hover must move the glyph');
assert.equal(stillPress.length, 0, 'every press must move the glyph');
const sameTransform = results.filter(item => item.hover.transform === item.press.transform);
assert.equal(sameTransform.length, 0, 'hover and press must end in different poses');

const durations = results.map(item => `${item.hover.duration}/${item.press.duration}`);
console.log('sample choreography', results.slice(0, 6).map(item => ({
  icon: item.name,
  hover: item.hover.name,
  press: item.press.name,
})));
console.log('duration pairs unique', new Set(durations).size, 'of', durations.length);

// Real components must use the same rules.
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const realIcon = page.locator('.rail-nav button').filter({ hasText: 'Projects' }).locator('.vellum-icon-ink');
await page.locator('.rail-nav button').filter({ hasText: 'Projects' }).hover();
await page.waitForTimeout(40);
const realHover = await realIcon.evaluate(el => getComputedStyle(el).animationName);
const createButton = page.locator('.rail-create');
const createBox = await createButton.boundingBox();
await page.mouse.move(createBox.x + createBox.width - 6, createBox.y + createBox.height - 6);
await page.waitForTimeout(70);
const edgeHover = await page.evaluate(() => {
  const ink = document.querySelector('.rail-create .vellum-icon-ink');
  return getComputedStyle(ink).animationName;
});
console.log('hit-area edge hover', edgeHover);
assert.equal(edgeHover, 'im-plus-h', 'hovering the button edge must animate the glyph');
await page.locator('.rail-nav button').filter({ hasText: 'Projects' }).hover();
await page.mouse.down();
await page.waitForTimeout(40);
const realPress = await realIcon.evaluate(el => getComputedStyle(el).animationName);
await page.mouse.up();
console.log('real component', { realHover, realPress });
assert.equal(realHover, 'im-projects-h');
assert.equal(realPress, 'im-projects-p');

// Reduced motion must silence the choreography entirely.
const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await reducedPage.waitForTimeout(400);
const reducedButton = reducedPage.locator('.rail-nav button').filter({ hasText: 'Projects' });
await reducedButton.hover();
await reducedPage.waitForTimeout(60);
const reduced = await reducedButton.locator('.vellum-icon-ink').evaluate(el => {
  const style = getComputedStyle(el);
  return { animation: style.animationName, transform: style.transform, transition: style.transitionProperty };
});
console.log('reduced motion', reduced);
assert.equal(reduced.animation, 'none');
assert.equal(reduced.transform, 'none');
assert.ok(!reduced.transition.includes('transform'));

// Disabled controls must stay still.
await page.goto(`${base}/photo`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const disabledButton = page.locator('.ph-icon-btn[title="Undo"]');
assert.equal(await disabledButton.isDisabled(), true, 'undo should be disabled with no photo');
const disabledBox = await disabledButton.boundingBox();
await page.mouse.move(disabledBox.x + 2, disabledBox.y + 2);
await page.waitForTimeout(90);
const disabledAnim = await page.evaluate(() => {
  const ink = document.querySelector('.ph-icon-btn[title="Undo"] .vellum-icon-ink');
  return ink ? getComputedStyle(ink).animationName : 'missing';
});
console.log('disabled hover', disabledAnim);
assert.equal(disabledAnim, 'none', 'disabled controls must not perform');

// Keyboard focus replays the hover gesture for the focused control.
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
let focus = null;
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('Tab');
  focus = await page.evaluate(() => {
    const el = document.activeElement;
    const ink = el?.querySelector?.('.vellum-icon-ink');
    const root = ink?.closest('[data-vellum-icon]');
    return {
      tag: el?.tagName,
      hasInk: Boolean(ink),
      icon: root?.getAttribute('data-vellum-icon') ?? null,
      anim: ink ? getComputedStyle(ink).animationName : null,
    };
  });
  if (focus.hasInk) break;
}
console.log('keyboard focus', focus);
assert.ok(focus?.hasInk, 'tab focus should reach an icon control');
assert.equal(focus.anim, `im-${focus.icon}-h`, 'focus should replay the hover gesture');

console.log('errors', errors);
assert.equal(errors.length, 0);

await reducedContext.close();
await context.close();
await browser.close();
console.log('ICON CHOREOGRAPHY OK — 121 bespoke hover and press animations');
