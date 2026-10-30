import { chromium } from 'playwright';
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({viewport:{width:1600,height:1000}});
await p.goto('http://127.0.0.1:5173/editor/new?template=cafe-opening',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const info = await p.evaluate(() => {
  const vp = document.querySelector('.cv-viewport');
  const stage = document.querySelector('.cv-stage');
  const page = document.querySelector('.cv-page');
  const strip = document.querySelector('.page-strip');
  const cs = stage ? getComputedStyle(stage) : null;
  return {
    vp: vp ? {w: vp.clientWidth, h: vp.clientHeight, r: vp.getBoundingClientRect().toJSON()} : null,
    stage: cs ? {transform: cs.transform, w: cs.width, h: cs.height, r: stage.getBoundingClientRect().toJSON()} : null,
    page: page ? page.getBoundingClientRect().toJSON() : null,
    strip: strip ? strip.getBoundingClientRect().toJSON() : null,
  };
});
console.log(JSON.stringify(info,null,2));
await b.close();
