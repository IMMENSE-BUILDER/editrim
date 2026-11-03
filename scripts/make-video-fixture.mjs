import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('scripts/fixtures');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'test-clip.webm');
if (fs.existsSync(outFile) && fs.statSync(outFile).size > 2000) {
  console.log('fixture exists', outFile, fs.statSync(outFile).size);
  process.exit(0);
}
const browser = await chromium.launch({ channel: 'chrome' });
const p = await (await browser.newContext({ viewport: { width: 640, height: 360 } })).newPage();
await p.goto('http://localhost:5173/video', { waitUntil: 'networkidle' });

for (let attempt = 1; attempt <= 6; attempt++) {
  const result = await p.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no context');
    const stream = canvas.captureStream(30);
    const type = ['video/webm;codecs=vp8', 'video/webm'].find(item => MediaRecorder.isTypeSupported(item)) ?? '';
    const chunks = [];
    const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    const stopped = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.start(100);
    const start = performance.now();
    await new Promise(resolve => {
      const draw = () => {
        const t = (performance.now() - start) / 1000;
        const gradient = ctx.createLinearGradient(0, 0, 320, 180);
        gradient.addColorStop(0, `hsl(${Math.floor(t * 120) + 210} 80% 42%)`);
        gradient.addColorStop(1, '#09080d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 320, 180);
        ctx.fillStyle = '#d8f55a';
        ctx.font = '700 28px sans-serif';
        ctx.fillText('EDITRIM', 20, 60);
        ctx.fillStyle = '#f4f1ea';
        ctx.font = '500 14px sans-serif';
        ctx.fillText(`test clip ${t.toFixed(1)}s`, 20, 92);
        if (t < 1.25) requestAnimationFrame(draw); else resolve(null);
      };
      draw();
    });
    recorder.stop();
    await stopped;
    await new Promise(resolve => setTimeout(resolve, 500));
    stream.getTracks().forEach(track => track.stop());
    const buffer = await new Blob(chunks, { type: 'video/webm' }).arrayBuffer();
    return Array.from(new Uint8Array(buffer));
  });
  console.log('attempt', attempt, 'bytes', result.length);
  if (result.length > 2000) {
    fs.writeFileSync(outFile, Buffer.from(result));
    break;
  }
  await p.waitForTimeout(500);
}
await browser.close();
if (!fs.existsSync(outFile)) process.exit(1);
console.log('wrote', outFile, fs.statSync(outFile).size);
