import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://127.0.0.1:5173/templates',{waitUntil:'networkidle'});
const m = await p.evaluate(() => {
  const f=document.querySelector('.gallery-filters'); const s=document.querySelector('.gallery-search'); const bar=document.querySelector('.gallery-bar-inner');
  return {filterClient:f.clientWidth, filterScroll:f.scrollWidth, search:s.getBoundingClientRect().width, bar:bar.clientWidth, padding:getComputedStyle(bar).padding};
});
console.log(m);
await b.close();
