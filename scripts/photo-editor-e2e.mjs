import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const wait = ms => page.waitForTimeout(ms);
const attr = name => page.getAttribute('.photo-editor', name);
const settings = async () => JSON.parse(await attr('data-adjustments'));
const crop = async () => JSON.parse(await attr('data-crop'));

const canvasSample = () => page.evaluate(() => {
  const canvas = document.querySelector('.ph-canvas');
  const ctx = canvas.getContext('2d');
  const points = [
    [0.2, 0.2], [0.5, 0.2], [0.8, 0.2], [0.2, 0.5],
    [0.5, 0.5], [0.8, 0.5], [0.2, 0.8], [0.5, 0.8], [0.8, 0.8],
  ];
  const values = points.map(([x, y]) => {
    const data = ctx.getImageData(Math.floor(x * canvas.width), Math.floor(y * canvas.height), 1, 1).data;
    return [data[0], data[1], data[2]];
  });
  const avg = values.reduce((acc, [r, g, b]) => [acc[0] + r / values.length, acc[1] + g / values.length, acc[2] + b / values.length], [0, 0, 0]);
  return { avg: avg.map(v => Math.round(v)), width: canvas.width, height: canvas.height };
});

const setRange = async (selector, value) => {
  await page.locator(selector).fill(String(value));
  await wait(220);
};

const edgeEnergy = () => page.evaluate(() => {
  const canvas = document.querySelector('.ph-canvas');
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const width = canvas.width;
  const height = canvas.height;
  const step = 3;
  let total = 0;
  let count = 0;
  for (let row = 0; row < height; row += step) {
    const rowOffset = row * width * 4;
    for (let col = 0; col + step < width; col += step) {
      const index = rowOffset + col * 4;
      const next = index + step * 4;
      total += Math.abs(data[index] - data[next]);
      total += Math.abs(data[index + 1] - data[next + 1]);
      total += Math.abs(data[index + 2] - data[next + 2]);
      count += 3;
    }
  }
  return total / count;
});

function readPngSize(path) {
  const buffer = fs.readFileSync(path);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

// ---------- clean start ----------
await page.goto(`${base}/photo`, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  localStorage.removeItem('vellum_photo_session_v1');
  await new Promise(resolve => {
    const request = indexedDB.deleteDatabase('vellum-photo-source');
    request.onsuccess = () => resolve(null);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
});
await page.reload({ waitUntil: 'networkidle' });
await wait(500);
assert.equal(await attr('data-ready'), 'no');
assert.equal(await page.locator('.ph-empty').count(), 1);
assert.equal(await page.locator('.ph-rail-btn').count(), 4);
console.log('empty state ok');

// ---------- geometry ----------
const geometry = await page.evaluate(async () => {
  const { renderPhotoToCanvas } = await import('/src/lib/photo/render.ts');
  const { DEFAULT_ADJUSTMENTS } = await import('/src/lib/photo/types.ts');
  const source = document.createElement('canvas');
  source.width = 400;
  source.height = 400;
  const ctx = source.getContext('2d');
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(200, 0, 200, 200);
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(0, 200, 200, 200);
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(200, 200, 200, 200);
  const img = new Image();
  img.src = source.toDataURL();
  await img.decode();

  const frame = (rotate, crop, flipX = false, flipY = false) => ({
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    transform: { rotate, flipX, flipY },
    crop,
    filter: 'original',
    text: [],
  });
  const read = (canvas, x, y) => {
    const data = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
    const near = (target) => Math.abs(data[0] - target[0]) < 8 && Math.abs(data[1] - target[1]) < 8 && Math.abs(data[2] - target[2]) < 8;
    return {
      red: near([255, 0, 0]),
      green: near([0, 255, 0]),
      blue: near([0, 0, 255]),
      yellow: near([255, 255, 0]),
    };
  };
  const corners = canvas => [
    read(canvas, 8, 8),
    read(canvas, canvas.width - 8, 8),
    read(canvas, 8, canvas.height - 8),
    read(canvas, canvas.width - 8, canvas.height - 8),
  ];

  const full = { x: 0, y: 0, w: 1, h: 1 };
  const rotated = renderPhotoToCanvas(img, frame(90, full));
  const rightHalf = renderPhotoToCanvas(img, frame(0, { x: 0.5, y: 0, w: 0.5, h: 1 }));
  const flipped = renderPhotoToCanvas(img, frame(0, full, true, false));
  return {
    rotatedCorners: corners(rotated),
    rotatedSize: [rotated.width, rotated.height],
    rightHalfCorners: corners(rightHalf),
    rightHalfSize: [rightHalf.width, rightHalf.height],
    flippedCorners: corners(flipped),
  };
});
console.log('geometry', JSON.stringify(geometry));
const [tl, tr, bl, br] = geometry.rotatedCorners;
assert.ok(tl.blue && tr.red && bl.yellow && br.green, 'rotate 90 maps source corners clockwise');
assert.deepEqual(geometry.rotatedSize, [400, 400]);
assert.ok(geometry.rightHalfCorners[0].green && geometry.rightHalfCorners[2].yellow, 'crop keeps the right half');
assert.deepEqual(geometry.rightHalfSize, [200, 400]);
assert.ok(geometry.flippedCorners[0].green && geometry.flippedCorners[1].red, 'flip X mirrors corners');

// ---------- import ----------
await page.locator('.ph-file-input').setInputFiles('scripts/fixtures/photo-sample.png');
await page.waitForFunction(() => document.querySelector('.photo-editor')?.getAttribute('data-ready') === 'yes', null, { timeout: 15000 });
await wait(700);
const imported = await canvasSample();
assert.ok(imported.width > 600 && imported.height > 400, 'preview canvas rendered');
assert.equal(await page.locator('.ph-range[data-adjustment]').count(), 16);
assert.equal(await page.locator('.ph-histogram-canvas').count(), 1);
console.log('imported', imported.width, imported.height, 'sliders 16');

// ---------- adjustments ----------
const baseSample = await canvasSample();
const initial = await settings();
assert.equal(initial.exposure, 0);

await setRange('.ph-range[data-adjustment="exposure"] input', 0.9);
await setRange('.ph-range[data-adjustment="contrast"] input', 32);
await setRange('.ph-range[data-adjustment="highlights"] input', -40);
await setRange('.ph-range[data-adjustment="shadows"] input', 35);
await setRange('.ph-range[data-adjustment="whites"] input', -20);
await setRange('.ph-range[data-adjustment="blacks"] input', 25);
await setRange('.ph-range[data-adjustment="temperature"] input', -45);
await setRange('.ph-range[data-adjustment="tint"] input', 18);
await setRange('.ph-range[data-adjustment="vibrance"] input', 30);
await setRange('.ph-range[data-adjustment="saturation"] input', -15);
await setRange('.ph-range[data-adjustment="clarity"] input', 40);
await setRange('.ph-range[data-adjustment="sharpen"] input', 35);
await setRange('.ph-range[data-adjustment="vignette"] input', 55);
await setRange('.ph-range[data-adjustment="grain"] input', 22);
await setRange('.ph-range[data-adjustment="fade"] input', 26);
await page.waitForTimeout(500);

const adjusted = await settings();
const adjustedSample = await canvasSample();
assert.equal(adjusted.exposure, 0.9);
assert.equal(adjusted.contrast, 32);
assert.equal(adjusted.temperature, -45);
assert.equal(adjusted.vignette, 55);
assert.equal(adjusted.fade, 26);
assert.equal(await attr('data-filter'), 'custom');
const delta = Math.abs(adjustedSample.avg[0] - baseSample.avg[0]) + Math.abs(adjustedSample.avg[2] - baseSample.avg[2]);
assert.ok(delta > 6, `adjustments changed pixels (delta ${delta})`);
console.log('adjustments applied, pixel delta', delta, 'avg', baseSample.avg, '->', adjustedSample.avg);

// Blur must reduce high-frequency detail; removing it must restore it.
const sharpEnergy = await edgeEnergy();
await setRange('.ph-range[data-adjustment="blur"] input', 40);
await page.waitForTimeout(500);
const blurredEnergy = await edgeEnergy();
assert.equal((await settings()).blur, 40);
assert.ok(blurredEnergy < sharpEnergy * 0.85, `blur softens detail (${sharpEnergy.toFixed(2)} -> ${blurredEnergy.toFixed(2)})`);
await setRange('.ph-range[data-adjustment="blur"] input', 0);
await page.waitForTimeout(500);
const restoredEnergy = await edgeEnergy();
assert.ok(restoredEnergy > blurredEnergy * 1.05, 'blur reset restores detail');
console.log('edge energy', { sharpEnergy: sharpEnergy.toFixed(2), blurredEnergy: blurredEnergy.toFixed(2), restoredEnergy: restoredEnergy.toFixed(2) });
await setRange('.ph-range[data-adjustment="blur"] input', 0);
await page.screenshot({ path: 'shots/photo-adjust-1440.png' });

// ---------- compare ----------
await page.locator('.ph-compare').dispatchEvent('pointerdown');
await page.waitForTimeout(450);
const compareSample = await canvasSample();
const compareDelta = Math.abs(compareSample.avg[0] - baseSample.avg[0]) + Math.abs(compareSample.avg[2] - baseSample.avg[2]);
assert.ok(compareDelta < 6, `compare shows the original (delta ${compareDelta})`);
assert.equal(await page.locator('.ph-compare-badge').count(), 1);
await page.screenshot({ path: 'shots/photo-compare-1440.png' });
await page.locator('.ph-compare').dispatchEvent('pointerup');
await page.waitForTimeout(400);
const afterCompare = await canvasSample();
assert.ok(Math.abs(afterCompare.avg[0] - baseSample.avg[0]) > 3, 'compare release restores edits');
console.log('compare ok', baseSample.avg, compareSample.avg, afterCompare.avg);

// ---------- undo / redo ----------
await page.locator('.ph-icon-btn[title="Undo"]').click();
await wait(350);
assert.equal((await settings()).blur, 40);
assert.equal(await attr('data-filter'), 'custom');
await page.locator('.ph-icon-btn[title="Redo"]').click();
await wait(350);
assert.equal((await settings()).blur, 0);
await page.keyboard.press('Control+z');
await wait(300);
assert.equal((await settings()).blur, 40);
await page.keyboard.press('Control+Shift+z');
await wait(300);
assert.equal((await settings()).blur, 0);
console.log('undo/redo ok');

// ---------- crop ----------
await page.locator('.ph-rail-btn').filter({ hasText: 'Crop' }).click();
await wait(400);
assert.equal(await page.locator('.ph-crop-box').count(), 1);
const fullCrop = await crop();
assert.deepEqual(fullCrop, { x: 0, y: 0, w: 1, h: 1 });

await page.locator('.ph-aspect-btn').filter({ hasText: '1:1' }).click();
await wait(450);
const imageSize = {
  width: Number(await attr('data-source-width')),
  height: Number(await attr('data-source-height')),
};
const rotate = Number(await attr('data-rotate'));
const rotated = rotate === 90 || rotate === 270 ? { width: imageSize.height, height: imageSize.width } : imageSize;
const pixelRatio = value => (value.w * rotated.width) / (value.h * rotated.height);
const squareCrop = await crop();
assert.ok(Math.abs(pixelRatio(squareCrop) - 1) < 0.01, `square crop ${JSON.stringify(squareCrop)}`);
console.log('square crop', squareCrop, pixelRatio(squareCrop).toFixed(3));

const handle = page.locator('.ph-crop-handle.is-se');
const handleBox = await handle.boundingBox();
assert.ok(handleBox, 'crop handle visible');
await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
await page.mouse.down();
await page.mouse.move(handleBox.x - 160, handleBox.y - 120, { steps: 14 });
await page.mouse.up();
await wait(450);
const draggedCrop = await crop();
assert.ok(draggedCrop.w < squareCrop.w - 0.05, `crop shrank to ${draggedCrop.w}`);
assert.ok(Math.abs(pixelRatio(draggedCrop) - 1) < 0.01, 'aspect stayed square while dragging');
console.log('dragged crop', draggedCrop, pixelRatio(draggedCrop).toFixed(3));
await page.screenshot({ path: 'shots/photo-crop-1440.png' });

await page.locator('.ph-tool-btn').filter({ hasText: 'Right' }).click();
await wait(400);
const rotatedCrop = await crop();
const rotatedSize = { width: rotated.height, height: rotated.width };
const rotatedRatio = (rotatedCrop.w * rotatedSize.width) / (rotatedCrop.h * rotatedSize.height);
assert.ok(Math.abs(rotatedRatio - 1) < 0.02, 'square crop survives rotate');

await page.locator('.ph-tool-btn').filter({ hasText: 'Flip X' }).click();
await wait(400);
const flippedXCrop = await crop();
assert.ok(Math.abs(flippedXCrop.x - (1 - rotatedCrop.x - rotatedCrop.w)) < 0.005, 'flip X mirrors the crop rect');
assert.equal(Number(await attr('data-rotate')), 90);

await page.locator('.ph-tool-btn').filter({ hasText: 'Flip Y' }).click();
await wait(400);
const flippedYCrop = await crop();
assert.ok(Math.abs(flippedYCrop.y - (1 - flippedXCrop.y - flippedXCrop.h)) < 0.005, 'flip Y mirrors the crop rect');
assert.equal(await page.locator('.ph-tool-btn.is-active').filter({ hasText: 'Flip Y' }).count(), 1);
await page.locator('.ph-primary-btn').filter({ hasText: 'Apply' }).click();
await wait(450);
assert.equal(await page.locator('.ph-crop-box').count(), 0);
console.log('rotate/flip ok, crop applied');

// ---------- filters ----------
await page.locator('.ph-rail-btn').filter({ hasText: 'Filters' }).click();
await wait(700);
assert.equal(await page.locator('.ph-filter-tile').count(), 9);
assert.equal(await page.locator('.ph-filter-canvas').count(), 9);
const tileOverflow = await page.evaluate(() => {
  const grid = document.querySelector('.ph-filter-grid');
  const panel = document.querySelector('.ph-inspector-scroll');
  return grid && panel ? grid.scrollWidth > panel.clientWidth + 1 : true;
});
assert.equal(tileOverflow, false, 'filter grid fits the inspector');
await page.locator('.ph-filter-tile').filter({ hasText: 'Noir' }).click();
await wait(500);
assert.equal(await attr('data-filter'), 'noir');
assert.equal((await settings()).saturation, -100);
await page.screenshot({ path: 'shots/photo-filters-1440.png' });
console.log('filters ok');

// ---------- text ----------
await page.locator('.ph-rail-btn').filter({ hasText: 'Text' }).click();
await wait(300);
await page.locator('.ph-add-text').click();
await wait(400);
assert.equal(await attr('data-text-count'), '1');
assert.equal(await page.locator('.ph-text-box').count(), 1);

const textArea = page.locator('.ph-textarea');
await textArea.fill('SUMMIT');
await wait(400);
await page.locator('.ph-field').filter({ hasText: 'Size' }).locator('input').fill('96');
await wait(400);
const beforeDrag = await page.evaluate(() => document.querySelector('.ph-text-box').style.left + '|' + document.querySelector('.ph-text-box').style.top);
const box = await page.locator('.ph-text-box').boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 - 90, { steps: 12 });
await page.mouse.up();
await wait(400);
const afterDrag = await page.evaluate(() => document.querySelector('.ph-text-box').style.left + '|' + document.querySelector('.ph-text-box').style.top);
assert.notEqual(beforeDrag, afterDrag, 'text layer moved');
await page.locator('.ph-tool-btn[aria-label="Align right"]').click();
await wait(300);
await page.screenshot({ path: 'shots/photo-text-1440.png' });
console.log('text ok', beforeDrag, '->', afterDrag);

await page.locator('.ph-add-text').click();
await wait(400);
assert.equal(await attr('data-text-count'), '2');
await page.locator('.ph-text-item').last().locator('button').click();
await wait(400);
assert.equal(await attr('data-text-count'), '1');
console.log('text layer delete ok');

// ---------- persistence ----------
const beforeReload = await crop();
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => document.querySelector('.photo-editor')?.getAttribute('data-ready') === 'yes', null, { timeout: 15000 });
await wait(900);
assert.equal(await attr('data-filter'), 'noir');
assert.equal(await attr('data-text-count'), '1');
assert.equal((await settings()).contrast, 28);
assert.equal((await settings()).saturation, -100);
assert.deepEqual(await crop(), beforeReload);
assert.equal(await page.locator('.ph-title-wrap input').inputValue(), 'photo-sample');
const restoredText = await page.locator('.ph-textarea').count();
console.log('restored session; textarea visible in text mode:', restoredText);
await page.locator('.ph-rail-btn').filter({ hasText: 'Text' }).click();
await wait(300);
assert.equal(await page.locator('.ph-textarea').inputValue(), 'SUMMIT');
console.log('persistence ok');

// ---------- export ----------
await page.locator('.ph-export-btn').click();
await wait(300);
const meta = (await page.locator('.ph-export-meta').innerText()).replace(/\s+/g, ' ');
console.log('export meta', meta);

await page.locator('.ph-seg button').filter({ hasText: 'PNG' }).click();
await wait(200);
const pngPromise = page.waitForEvent('download', { timeout: 45000 });
await page.locator('.ph-export-actions .ph-primary-btn').click();
const pngDownload = await pngPromise;
const pngPath = await pngDownload.path();
const pngSize = readPngSize(pngPath);
const pngBytes = fs.statSync(pngPath).size;
const expected = meta.match(/(\d+) × (\d+)/);
assert.ok(expected, 'export dimensions shown');
assert.equal(pngSize.width, Number(expected[1]));
assert.equal(pngSize.height, Number(expected[2]));
assert.ok(pngBytes > 20000, `png has content (${pngBytes} bytes)`);
assert.ok(pngDownload.suggestedFilename().endsWith('.png'));
console.log('png export', pngDownload.suggestedFilename(), pngSize, pngBytes);

await page.locator('.ph-export-btn').click();
await wait(250);
await page.locator('.ph-seg button').filter({ hasText: 'WEBP' }).click();
await page.locator('.ph-seg button').filter({ hasText: 'Half' }).click();
await wait(200);
const webpPromise = page.waitForEvent('download', { timeout: 45000 });
await page.locator('.ph-export-actions .ph-primary-btn').click();
const webpDownload = await webpPromise;
const webpBytes = fs.statSync(await webpDownload.path()).size;
assert.ok(webpDownload.suggestedFilename().endsWith('.webp'));
assert.ok(webpBytes > 8000);
console.log('webp export', webpDownload.suggestedFilename(), webpBytes);

await page.locator('.ph-export-btn').click();
await wait(250);
await page.locator('.ph-seg button').filter({ hasText: 'JPEG' }).click();
await wait(200);
const jpegPromise = page.waitForEvent('download', { timeout: 45000 });
await page.locator('.ph-export-actions .ph-primary-btn').click();
const jpegDownload = await jpegPromise;
assert.ok(jpegDownload.suggestedFilename().endsWith('.jpg'));
assert.ok(fs.statSync(await jpegDownload.path()).size > 20000);
console.log('jpeg export ok');

// ---------- mobile ----------
await page.setViewportSize({ width: 390, height: 844 });
await wait(700);
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false);
const mobile = await page.evaluate(() => {
  const rail = document.querySelector('.ph-rail').getBoundingClientRect();
  const stage = document.querySelector('.ph-stage').getBoundingClientRect();
  const panel = document.querySelector('.ph-inspector').getBoundingClientRect();
  const canvas = document.querySelector('.ph-canvas').getBoundingClientRect();
  return {
    railTop: Math.round(rail.top),
    railHeight: Math.round(rail.height),
    stageHeight: Math.round(stage.height),
    panelHeight: Math.round(panel.height),
    canvasWidth: Math.round(canvas.width),
    canvasHeight: Math.round(canvas.height),
    viewport: window.innerHeight,
  };
});
console.log('mobile layout', mobile);
assert.ok(mobile.railHeight >= 48 && mobile.railHeight <= 64, 'tool rail is a bottom bar');
assert.ok(mobile.railTop > 600, 'tool rail sits at the bottom');
assert.ok(mobile.stageHeight > 120, 'stage keeps usable height');
assert.ok(mobile.canvasWidth <= 390 && mobile.canvasWidth > 200, 'canvas fits the phone width');

const panelScroll = await page.evaluate(() => {
  const el = document.querySelector('.ph-inspector-scroll');
  const before = el.scrollTop;
  el.scrollTop = 80;
  return { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, moved: el.scrollTop > before };
});
console.log('mobile panel scroll', panelScroll);
assert.ok(panelScroll.scrollHeight > panelScroll.clientHeight, 'inspector is scrollable on mobile');
assert.ok(panelScroll.moved, 'inspector scroll moves');

await page.screenshot({ path: 'shots/photo-mobile-390.png' });

await page.locator('.ph-rail-btn').filter({ hasText: 'Adjust' }).click();
await wait(400);
assert.equal(await attr('data-mode'), 'adjust');
await page.screenshot({ path: 'shots/photo-mobile-adjust-390.png' });

await page.locator('.ph-export-btn').click();
await wait(350);
const exportFits = await page.evaluate(() => {
  const card = document.querySelector('.ph-export-card').getBoundingClientRect();
  return {
    left: Math.round(card.left),
    right: Math.round(card.right),
    width: Math.round(card.width),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
});
console.log('mobile export card', exportFits);
assert.equal(exportFits.overflow, false);
assert.ok(exportFits.left >= 0 && exportFits.right <= 390, 'export dialog fits the phone');
await page.locator('.ph-export-actions .ph-ghost-btn').click();
await wait(250);

// ---------- drag and drop replaces the photo ----------
await page.setViewportSize({ width: 1440, height: 1000 });
await wait(500);
await page.evaluate(async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#3ba55d';
  ctx.fillRect(0, 0, 120, 80);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'dropped-photo.png', { type: 'image/png' });
  const transfer = new DataTransfer();
  transfer.items.add(file);
  document.querySelector('.photo-editor').dispatchEvent(
    new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }),
  );
});
await wait(1200);
assert.equal(await attr('data-source-width'), '120');
assert.equal(await attr('data-source-height'), '80');
assert.equal(await page.locator('.ph-title-wrap input').inputValue(), 'dropped-photo');
assert.equal(await attr('data-text-count'), '0');
assert.equal(await attr('data-filter'), 'original');
console.log('drop import ok');

// ---------- dashboard entry ----------
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await wait(500);
assert.equal(await page.locator('.home-cat[title="Photo"]').count(), 1);
await page.locator('.home-cat[title="Photo"]').click();
await page.waitForSelector('.photo-editor', { timeout: 10000 });
await wait(500);
assert.equal(await attr('data-ready'), 'yes');
console.log('dashboard entry ok');

console.log('errors', errors);
assert.equal(errors.length, 0);
await browser.close();
console.log('PHOTO EDITOR E2E OK');
