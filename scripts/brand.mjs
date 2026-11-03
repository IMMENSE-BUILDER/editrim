import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const c = await b.newContext({viewport:{width:1440,height:1000}});
const p = await c.newPage();
await p.goto('http://127.0.0.1:5173/dashboard',{waitUntil:'networkidle'});
await p.waitForTimeout(1000);
await p.screenshot({path:'shots/dashboard-empty.png'});
// brand kit
await p.getByRole('button',{name:/Brand kit/i}).first().click();
await p.waitForTimeout(400);
await p.locator('#brand-name').fill('Acme Studio');
await p.screenshot({path:'shots/brand-modal.png'});
await p.locator('.modal-footer .btn-cobalt').click();
await p.waitForTimeout(600);
console.log('brandLS', await p.evaluate(()=>localStorage.getItem('editrim.brand.v1')));
// new design modal sizes screenshot
await p.getByRole('button',{name:/New design/i}).first().click();
await p.waitForTimeout(300);
await p.screenshot({path:'shots/new-design-modal2.png'});
await b.close();
