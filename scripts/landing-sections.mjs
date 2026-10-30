import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(1000);
for (const [sel,name] of [['.promise','promise'],['.templates-section','templates-section'],['.bento-section','bento'],['.steps-section','steps'],['.pricing-section','pricing'],['.faq-section','faq'],['.final-cta','final']]) {
  await p.locator(sel).scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await p.screenshot({path:`shots/sec-${name}.png`});
}
await b.close();
