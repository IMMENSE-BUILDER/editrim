import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(500);
const d=await p.evaluate(()=>{
 const out={};
 for(const sel of ['html','body','.landing','.hero','.hero-stage','.marquee','.templates-section','.formats-section','.bento-section','.steps-section','.pricing-section','.faq-section','.final-cta','.site-footer']){
   const el=document.querySelector(sel); if(el){const r=el.getBoundingClientRect(); out[sel]={sw:el.scrollWidth,cw:el.clientWidth,l:Math.round(r.left),r:Math.round(r.right),ov:getComputedStyle(el).overflowX,pos:getComputedStyle(el).position};}
 }
 return out;
});
console.log(JSON.stringify(d,null,2));
await b.close();
