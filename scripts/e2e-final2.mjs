import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';
const b = await chromium.launch({channel:'chrome'});
const c = await b.newContext({viewport:{width:1600,height:1000}, acceptDownloads:true});
const p = await c.newPage();
const errors=[]; p.on('pageerror',e=>errors.push(e.message)); p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const wait=ms=>p.waitForTimeout(ms);
await p.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening',{waitUntil:'networkidle'});
await wait(1200);
// add shape and lock then unlock via layers
await p.locator('.ed-rail button[title="Elements"]').click(); await wait(300);
await p.locator('.shape-btn').nth(1).click(); await wait(300);
await p.locator('.insp-sel-actions button').nth(1).click(); await wait(300);
console.log('locked', await p.locator('.cv-el.is-locked').count());
await p.locator('.insp-tabs button').nth(1).click(); await wait(300);
await p.locator('.layer-row.active .layer-action').nth(1).click(); await wait(300);
console.log('afterUnlock', await p.locator('.cv-el.is-locked').count());
assert.equal(await p.locator('.cv-el.is-locked').count(),0);
// zoom
const z1=await p.locator('.cv-zoom-val').innerText();
await p.locator('.cv-controls button[title="Zoom in"]').click(); await wait(300);
const z2=await p.locator('.cv-zoom-val').innerText();
console.log('zoom', z1, z2);
assert.notEqual(z1,z2);
await p.locator('.cv-controls button[title="Fit to screen"]').click(); await wait(300);
// shortcuts
await p.keyboard.press('?'); await wait(400);
console.log('shortcuts', await p.locator('.shortcuts-grid').count());
await p.keyboard.press('Escape');
// transparent png
await p.locator('.ed-download').click(); await wait(300);
await p.locator('.export-option-row').nth(2).locator('.switch').click();
const [dl] = await Promise.all([p.waitForEvent('download',{timeout:30000}), p.locator('.modal-footer .btn-cobalt').click()]);
await dl.saveAs('shots/transparent.png');
const b64=fs.readFileSync('shots/transparent.png').toString('base64');
const alpha=await p.evaluate(async(b64)=>{const img=new Image(); await new Promise(r=>{img.onload=r; img.src='data:image/png;base64,'+b64;}); const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height; const ctx=cv.getContext('2d'); ctx.drawImage(img,0,0); const d=ctx.getImageData(0,0,1,1).data; return {a:d[3], w:img.width, h:img.height};},b64);
console.log('transparent', alpha);
assert.equal(alpha.a,0);
// hash nav
await p.goto('http://127.0.0.1:5173/templates',{waitUntil:'networkidle'});
await p.getByRole('link',{name:'Features'}).click();
await wait(1300);
console.log('hashUrl', p.url());
const top = await p.locator('#features').evaluate(el=>el.getBoundingClientRect().top);
console.log('featuresTop', Math.round(top));
console.log('errors', errors);
assert.equal(errors.length,0);
await b.close();
console.log('FINAL2 OK');
