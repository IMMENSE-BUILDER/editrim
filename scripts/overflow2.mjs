import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(600);
const bad=await p.evaluate(()=>{
  const vw=document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')].map(el=>{
    const r=el.getBoundingClientRect();
    return {tag:el.tagName, cls:el.className?.toString().slice(0,60), left:Math.round(r.left), right:Math.round(r.right), w:Math.round(r.width), pos:getComputedStyle(el).position};
  }).filter(x=>x.right>vw+1 || x.left<-1).slice(0,30);
});
console.log(JSON.stringify(bad,null,2));
await b.close();
