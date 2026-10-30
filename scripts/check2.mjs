import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
await p.locator('.templates-section').scrollIntoViewIfNeeded();
await p.waitForTimeout(600);
await p.screenshot({path:'shots/templates-landing2.png'});
await p.locator('.bento-section').scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p.screenshot({path:'shots/bento2.png'});
// gallery Porter filtered
await p.goto('http://127.0.0.1:5173/templates?category=Presentation',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
await p.screenshot({path:'shots/gallery-presentations.png'});
// move intent and forms
await p.goto('http://127.0.0.1:5173/editor/new?template=move-intent',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
await p.locator('.cv-page').screenshot({path:'shots/tpl-move-intent2.png'});
await p.goto('http://127.0.0.1:5173/editor/new?template=forms-of-quiet',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
await p.locator('.cv-page').screenshot({path:'shots/tpl-forms2.png'});
await p.goto('http://127.0.0.1:5173/editor/new?template=mara-portfolio',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
await p.locator('.page-item').nth(2).locator('.page-thumb').click();
await p.waitForTimeout(500);
await p.locator('.cv-page').screenshot({path:'shots/tpl-mara-p3b.png'});
await b.close();
