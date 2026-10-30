import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1400,height:1000}});
for (const id of ['porter-pitch','mara-portfolio','north-card']) {
  await p.goto('http://127.0.0.1:5173/editor/new?template='+id,{waitUntil:'networkidle'});
  await p.waitForTimeout(800);
  const n = await p.locator('.page-item').count();
  for (let i=0;i<n;i++){
    await p.locator('.page-item').nth(i).locator('.page-thumb').click();
    await p.waitForTimeout(400);
    await p.locator('.cv-page').screenshot({path:`shots/tpl-${id}-p${i+1}.png`});
    console.log(id, i+1, n);
  }
}
await b.close();
