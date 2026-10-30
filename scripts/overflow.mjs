import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
for (const [w,h] of [[1440,1000],[1366,900],[1280,900],[1024,800],[768,900],[390,844],[320,720]]) {
  const p=await b.newPage({viewport:{width:w,height:h}});
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await p.waitForTimeout(500);
  const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
  console.log('landing',w,m, m.sw>m.cw?'OVERFLOW':'ok');
  await p.goto('http://127.0.0.1:5173/templates',{waitUntil:'networkidle'});
  await p.waitForTimeout(400);
  const m2=await p.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
  console.log('gallery',w,m2, m2.sw>m2.cw?'OVERFLOW':'ok');
  await p.goto('http://127.0.0.1:5173/dashboard',{waitUntil:'networkidle'});
  await p.waitForTimeout(400);
  const m3=await p.evaluate(()=>({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth}));
  console.log('dashboard',w,m3, m3.sw>m3.cw?'OVERFLOW':'ok');
  await p.close();
}
await b.close();
