import { chromium } from 'playwright';
import assert from 'node:assert';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1600,height:1000}});
const errors=[]; p.on('pageerror',e=>errors.push(e.message)); p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const log=(a,v)=>console.log(a+':',JSON.stringify(v));
await p.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
const heading = p.locator('.cv-el').filter({hasText:'Bruma'}).first();
await heading.click({position:{x:60,y:60}});
await p.waitForTimeout(300);
// font
await p.locator('.font-trigger').click();
await p.waitForTimeout(200);
const fontPop = await p.locator('.font-pop').boundingBox();
log('fontPop', fontPop);
await p.locator('.font-list button').filter({hasText:'Caveat'}).click();
await p.waitForTimeout(300);
const fontFamily = await heading.locator('span').first().evaluate(el=>getComputedStyle(el).fontFamily);
log('fontFamily', fontFamily);
assert.ok(fontFamily.toLowerCase().includes('caveat'));
// color
await p.locator('.insp-section').filter({hasText:'Text'}).locator('.color-trigger').first().click();
await p.waitForTimeout(200);
const colorPop = await p.locator('.color-pop').boundingBox();
log('colorPop', colorPop);
await p.locator('.color-swatches button').nth(13).click();
await p.waitForTimeout(300);
const color = await heading.locator('span').first().evaluate(el=>getComputedStyle(el).color);
log('color', color);
assert.ok(color.includes('214, 58, 43') || color.includes('rgb(217, 58, 43)') || color.includes('255, 106, 70'), color);
// close popover by clicking elsewhere
await p.locator('.insp-section').filter({hasText:'Text'}).locator('.insp-section-head').click();
// align center
await p.locator('.insp-section').filter({hasText:'Text'}).locator('.segmented button').nth(1).click();
await p.waitForTimeout(200);
const align = await heading.locator('span').first().evaluate(el=>getComputedStyle(el).textAlign);
log('align', align);
assert.equal(align,'center');
// resize
const boxBefore = await heading.boundingBox();
const se = p.locator('.cv-handle').nth(4);
const seBox = await se.boundingBox();
if (seBox) {
  await p.mouse.move(seBox.x+3, seBox.y+3);
  await p.mouse.down();
  await p.mouse.move(seBox.x+53, seBox.y+33, {steps:8});
  await p.mouse.up();
}
await p.waitForTimeout(300);
const wAfter = await heading.evaluate(el=>el.style.width);
log('resize', {before: boxBefore, widthAfter: wAfter});
// rotate
const rot = p.locator('.cv-rotate');
const rBox = await rot.boundingBox();
if (rBox) {
  await p.mouse.move(rBox.x+9, rBox.y+9);
  await p.mouse.down();
  await p.mouse.move(rBox.x+69, rBox.y+50, {steps:8});
  await p.mouse.up();
}
await p.waitForTimeout(300);
const rotation = await heading.evaluate(el=>el.style.transform);
log('rotation', rotation);
assert.ok(rotation.includes('rotate'));
// undo 3x
for(let i=0;i<3;i++){await p.locator('.ed-top-center button[title^="Undo"]').click(); await p.waitForTimeout(120);}
log('undoRotation', await heading.evaluate(el=>el.style.transform));
// layers hide
await p.locator('.insp-tabs button').nth(1).click();
await p.waitForTimeout(250);
const row = p.locator('.layer-row').filter({hasText:'Bruma'}).first();
const countBefore = await p.locator('.cv-el').count();
await row.locator('.layer-action').first().click();
await p.waitForTimeout(300);
const countHidden = await p.locator('.cv-el').count();
log('hide', {countBefore,countHidden});
assert.equal(countHidden,countBefore-1);
await p.locator('.layer-row').filter({hasText:'Bruma'}).first().locator('.layer-action').first().click();
await p.waitForTimeout(250);
assert.equal(await p.locator('.cv-el').count(),countBefore);
// multi select
await p.locator('.insp-tabs button').first().click();
await p.locator('.cv-el').nth(0).click({position:{x:5,y:5}});
await p.locator('.cv-el').nth(2).click({position:{x:5,y:5}, modifiers:['Shift']});
await p.waitForTimeout(300);
log('groupSel', await p.locator('.cv-sel-group').count());
assert.equal(await p.locator('.cv-sel-group').count(),1);
// copy/paste
const pasteBefore = await p.locator('.cv-el').count();
await p.keyboard.press('Control+c');
await p.keyboard.press('Control+v');
await p.waitForTimeout(400);
const pasteAfter = await p.locator('.cv-el').count();
log('paste', {pasteBefore,pasteAfter});
assert.equal(pasteAfter,pasteBefore+2);
// background gradient
await p.keyboard.press('Escape');
await p.getByRole('button',{name:'Background'}).click();
await p.waitForTimeout(300);
await p.locator('.bg-controls .segmented button').nth(1).click();
await p.waitForTimeout(400);
const bgImage = await p.locator('.cv-page-clip > div').first().evaluate(el=>getComputedStyle(el).backgroundImage);
log('bgImage', bgImage);
assert.ok(bgImage.includes('linear-gradient'));
await p.screenshot({path:'shots/editor-gradient.png'});
log('errors', errors);
assert.equal(errors.length,0);
await b.close();
console.log('E2E 3 OK');
