import { chromium } from 'playwright';
const ids = ['cafe-opening','form-04','simple-significant','flash-sale','north-coast','tomato-basil','porter-pitch','mara-portfolio','night-shift','forms-of-quiet','elena-resume','north-card','built-in-24h','olive-ash','amara-jonah','north-mark','move-intent','ada-banner','long-take','bruma-email'];
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1400,height:1000}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
for (const id of ids) {
  await p.goto('http://127.0.0.1:5173/editor/new?template='+id,{waitUntil:'networkidle'});
  await p.waitForTimeout(700);
  const page = p.locator('.cv-page');
  await page.screenshot({path:`shots/tpl-${id}.png`});
  console.log(id, await page.boundingBox());
}
console.log('ERRORS', errs);
await b.close();
