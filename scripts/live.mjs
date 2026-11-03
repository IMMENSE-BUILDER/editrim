import { chromium } from 'playwright';
import fs from 'node:fs';
const base='https://editrim.vercel.app';
const b=await chromium.launch({channel:'chrome'});
const c=await b.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const p=await c.newPage();
const errors=[]; p.on('pageerror',e=>errors.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE '+m.text())});
await p.goto(base+'/',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
console.log('home title', await p.title());
console.log('hero present', await p.locator('.hero-title').count());
await p.screenshot({path:'shots/live-home.png'});
await p.getByRole('link',{name:/Start designing/i}).first().click();
await p.waitForTimeout(2500);
console.log('editor url', p.url());
console.log('page elements', await p.locator('.cv-el').count());
await p.screenshot({path:'shots/live-editor.png'});
// export from production
await p.locator('.ed-download').click();
await p.waitForTimeout(300);
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:30000}), p.locator('.modal-footer .btn-cobalt').click()]);
await dl.saveAs('shots/live-export.png');
const buf=fs.readFileSync('shots/live-export.png');
console.log('export', buf.length, buf.readUInt32BE(16), buf.readUInt32BE(20), dl.suggestedFilename());
// templates route direct
await p.goto(base+'/templates',{waitUntil:'networkidle'});
await p.waitForTimeout(800);
console.log('templates count', await p.locator('.template-card').count());
// dashboard route direct
await p.goto(base+'/dashboard',{waitUntil:'networkidle'});
await p.waitForTimeout(800);
console.log('dashboard title', await p.title());
// template editor route
await p.goto(base+'/editor/new?template=porter-pitch',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
console.log('template editor pages', await p.locator('.page-item').count());
console.log('errors', errors.filter(e=>!e.includes('favicon')).slice(0,10));
await b.close();
