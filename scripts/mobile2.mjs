import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
await p.screenshot({path:'shots/mobile-landing2.png'});
// mobile dashboard with one design via new editor
await p.goto('http://127.0.0.1:5173/editor/new?template=night-shift',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
await p.screenshot({path:'shots/mobile-editor3.png'});
await p.goto('http://127.0.0.1:5173/dashboard',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
await p.screenshot({path:'shots/mobile-dashboard.png'});
// mobile gallery
await p.goto('http://127.0.0.1:5173/templates',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
await p.screenshot({path:'shots/mobile-gallery.png'});
await b.close();
