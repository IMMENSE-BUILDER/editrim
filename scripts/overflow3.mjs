import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(500);
const data=await p.evaluate(()=>{
  const vw=document.documentElement.clientWidth;
  const all=[...document.querySelectorAll('body *')].map(el=>{const r=el.getBoundingClientRect(); return {tag:el.tagName,cls:el.className?.toString().slice(0,80),l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width),pos:getComputedStyle(el).position,ov:getComputedStyle(el).overflow};}).filter(x=>!x.cls.includes('marquee')&&(x.r>vw+1||x.l<-1));
  return {sw:document.documentElement.scrollWidth, bw:document.body.scrollWidth, all:all.slice(0,40)};
});
console.log(JSON.stringify(data,null,2));
await b.close();
