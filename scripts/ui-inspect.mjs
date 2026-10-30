import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1600,height:1000}});
await p.goto('http://127.0.0.1:5173/editor/new?template=porter-pitch',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
// page menu
await p.locator('.page-item').first().hover();
await p.locator('.page-menu-btn').first().click();
await p.waitForTimeout(300);
const menu = p.locator('.page-menu');
console.log('pageMenuVisible', await menu.isVisible());
if (await menu.count()) console.log('pageMenuBox', await menu.boundingBox(), 'strip', await p.locator('.page-strip-scroll').boundingBox());
await p.screenshot({path:'shots/page-menu.png'});
// open text selection and color popover
await p.locator('.page-menu').click({position:{x:5,y:5}}).catch(()=>{});
await p.keyboard.press('Escape');
const text = p.locator('.cv-el').filter({hasText:'The operating system'}).first();
await text.click({position:{x:40,y:40}});
await p.waitForTimeout(200);
console.log('sel', await p.locator('.cv-sel').count());
// open font field
await p.locator('.font-trigger').click();
await p.waitForTimeout(200);
console.log('fontPop', await p.locator('.font-pop').boundingBox(), 'scroll', await p.locator('.insp-scroll').boundingBox());
await p.screenshot({path:'shots/font-pop.png'});
await p.keyboard.press('Escape');
await p.locator('.insp-section').filter({hasText:'Text'}).locator('.color-trigger').first().click();
await p.waitForTimeout(200);
console.log('colorPop', await p.locator('.color-pop').boundingBox());
await p.screenshot({path:'shots/color-pop.png'});
await b.close();
