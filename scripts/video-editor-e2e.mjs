import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

const base = 'http://localhost:5173';
const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', e => errors.push('PAGE: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
const wait = ms => p.waitForTimeout(ms);

function makeWav(seconds = 0.6, frequency = 440) {
  const sampleRate = 44100;
  const count = Math.floor(sampleRate * seconds);
  const buffer = Buffer.alloc(44 + count * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + count * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) {
    const sample = Math.sin((i / sampleRate) * Math.PI * 2 * frequency) * 0.28;
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  return buffer;
}

await p.goto(`${base}/videos`, { waitUntil: 'domcontentloaded' });
await p.evaluate(async () => {
  localStorage.removeItem('editrim_video_projects_v1');
  localStorage.removeItem('editrim_video_last_id_v1');
  localStorage.removeItem('editrim_video_project_v1');
  await new Promise(resolve => {
    const req = indexedDB.deleteDatabase('editrim-video-media');
    req.onsuccess = () => resolve(null);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
});
await p.reload({ waitUntil: 'networkidle' });
await wait(600);
console.log('videos empty', await p.locator('.videos-empty h2').innerText());
assert.equal(await p.locator('.video-card').count(), 0);

await p.locator('.videos-new').first().click();
await p.waitForSelector('.video-editor', { timeout: 15000 });
await wait(700);
console.log('editor url', p.url());
assert.ok(/\/video\/video_/.test(p.url()));

// Import video, then add it.
await p.locator('.vd-file-input').setInputFiles('scripts/fixtures/test-clip.webm');
await p.waitForSelector('.vd-media-card', { timeout: 20000 });
await wait(500);
assert.equal(await p.locator('.vd-media-card').count(), 1);
await p.locator('.vd-media-card').first().click();
await wait(400);
assert.equal(await p.locator('.vd-clip').count(), 1);

// Add text, image and audio.
await p.locator('.vd-library-actions .vd-ghost-btn').filter({ hasText: 'Text' }).click();
await wait(300);
assert.equal(await p.locator('.vd-clip-text').count(), 1);
await p.locator('.vd-inspector textarea').first().fill('Launch day');

const png = await p.evaluate(() => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no image canvas');
  const gradient = ctx.createLinearGradient(0, 0, 200, 200);
  gradient.addColorStop(0, '#2440f0');
  gradient.addColorStop(1, '#d8f55a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#14130f';
  ctx.beginPath();
  ctx.arc(100, 100, 48, 0, Math.PI * 2);
  ctx.fill();
  return canvas.toDataURL('image/png');
});
await p.locator('.vd-file-input').setInputFiles({
  name: 'launch-card.png',
  mimeType: 'image/png',
  buffer: Buffer.from(png.split(',')[1], 'base64'),
});
await p.waitForFunction(() => document.querySelectorAll('.vd-media-card').length === 2, null, { timeout: 15000 });
await p.locator('.vd-media-card[data-kind="image"]').click();
await wait(450);
assert.equal(await p.locator('.vd-clip-image').count(), 1);

await p.locator('.vd-file-input').setInputFiles({
  name: 'room-tone.wav',
  mimeType: 'audio/wav',
  buffer: makeWav(),
});
await p.waitForFunction(() => document.querySelectorAll('.vd-media-card').length === 3, null, { timeout: 15000 });
await p.locator('.vd-media-card[data-kind="audio"]').click();
await wait(450);
assert.equal(await p.locator('.vd-clip-audio').count(), 1);
assert.equal(await p.locator('.vd-clip-audio .vd-waveform').count(), 1);

// Undo and redo the audio addition.
const beforeUndo = await p.locator('.vd-clip').count();
await p.locator('.vd-header-center .vd-icon-btn[title="Undo"]').click();
await wait(250);
assert.equal(await p.locator('.vd-clip').count(), beforeUndo - 1);
await p.locator('.vd-header-center .vd-icon-btn[title="Redo"]').click();
await wait(250);
assert.equal(await p.locator('.vd-clip').count(), beforeUndo);

// Aspect ratio change and restore.
await p.keyboard.press('Escape');
await wait(250);
await p.locator('.vd-aspect-grid button').filter({ hasText: '9:16' }).click();
await wait(250);
assert.equal(await p.locator('.video-editor').getAttribute('data-width'), '1080');
assert.equal(await p.locator('.video-editor').getAttribute('data-height'), '1920');
await p.locator('.vd-aspect-grid button').filter({ hasText: '16:9' }).click();
await wait(250);

// Trim the video clip from its right edge.
const videoClip = p.locator('.vd-clip-video');
await videoClip.click();
await wait(200);
const videoBox = await videoClip.boundingBox();
assert.ok(videoBox);
await p.mouse.move(videoBox.x + videoBox.width - 3, videoBox.y + videoBox.height / 2);
await p.mouse.down();
await p.mouse.move(videoBox.x + videoBox.width - 78, videoBox.y + videoBox.height / 2, { steps: 6 });
await p.mouse.up();
await wait(300);
const trimmedBox = await videoClip.boundingBox();
console.log('trim width', videoBox.width, '->', trimmedBox?.width);
assert.ok(trimmedBox && trimmedBox.width < videoBox.width - 40);

// Split the text clip at 0.6s.
await p.locator('.vd-clip-text').first().click();
await wait(200);
const ruler = p.locator('.vd-ruler');
const box = await ruler.boundingBox();
assert.ok(box);
await p.mouse.click(box.x + 0.6 * 74, box.y + 10);
await wait(250);
const beforeSplit = await p.locator('.vd-clip').count();
await p.keyboard.press('s');
await wait(350);
const afterSplit = await p.locator('.vd-clip').count();
console.log('split clips', beforeSplit, '->', afterSplit);
assert.equal(afterSplit, beforeSplit + 1);

// Image overlay drag.
await p.mouse.click(box.x + 5 * 74, box.y + 10);
await wait(300);
await p.locator('.vd-clip-image').click();
await wait(300);
const imageRanges = p.locator('.vd-inspector input[type=range]');
const rangesBefore = await imageRanges.evaluateAll(els => els.map(el => Number(el.value)));
const canvasBox = await p.locator('.vd-canvas-wrap').boundingBox();
assert.ok(canvasBox);
await p.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
await p.mouse.down();
await p.mouse.move(canvasBox.x + canvasBox.width / 2 + 110, canvasBox.y + canvasBox.height / 2 + 35, { steps: 6 });
await p.mouse.up();
await wait(300);
const rangesAfter = await imageRanges.evaluateAll(els => els.map(el => Number(el.value)));
console.log('image ranges', rangesBefore, '->', rangesAfter);
assert.ok(rangesBefore.length >= 3);
assert.notEqual(rangesAfter[2], rangesBefore[2]);

// Advanced: speed, colour correction and text motion.
await p.locator('.vd-clip-video').click();
await wait(300);
const durationInput = p.locator('.vd-inspector .vd-field').filter({ hasText: 'Duration' }).locator('input');
const speedSelect = p.locator('.vd-inspector .vd-field').filter({ hasText: 'Speed' }).locator('select');
const durationBeforeSpeed = Number(await durationInput.inputValue());
assert.equal(await speedSelect.inputValue(), '1');
await speedSelect.selectOption('2');
await wait(300);
const durationAfterSpeed = Number(await durationInput.inputValue());
console.log('speed duration', durationBeforeSpeed, '->', durationAfterSpeed);
assert.ok(durationAfterSpeed < durationBeforeSpeed - 0.4);
await speedSelect.selectOption('1');
await wait(250);

const brightness = p.locator('.vd-inspector .vd-range').filter({ hasText: 'Brightness' }).locator('input');
const contrast = p.locator('.vd-inspector .vd-range').filter({ hasText: 'Contrast' }).locator('input');
console.log('look controls', await brightness.count(), await contrast.count());
assert.equal(await brightness.count(), 1);
await brightness.evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, '1.2');
await contrast.evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, '1.15');
await wait(250);
await p.screenshot({ path: 'shots/video-editor-advanced-1440.png' });

await p.locator('.vd-clip-text').first().click();
await wait(300);
const motion = p.locator('.vd-inspector .vd-field').filter({ hasText: 'Motion' }).locator('select');
assert.equal(await motion.count(), 1);
await motion.selectOption('rise');
await wait(250);
assert.equal(await motion.inputValue(), 'rise');

// Playback advances and pauses.
await p.locator('.vd-play').click();
await wait(750);
const playingTime = Number(await p.locator('.video-editor').getAttribute('data-current-time'));
console.log('play time', playingTime, 'playing', await p.locator('.video-editor').getAttribute('data-playing'));
assert.ok(playingTime > 0.25);
await p.locator('.vd-play').click();
await wait(200);
await p.screenshot({ path: 'shots/video-editor-clips-1440.png' });

// Reload restores the project and media.
await wait(900);
await p.reload({ waitUntil: 'networkidle' });
await p.waitForSelector('.vd-clip', { timeout: 15000 });
await wait(600);
const restoredClips = await p.locator('.vd-clip').count();
const restoredMedia = await p.locator('.vd-media-card').count();
console.log('restored clips/media', restoredClips, restoredMedia);
assert.equal(restoredClips, afterSplit);
assert.equal(restoredMedia, 3);

// Export a real WebM.
const downloadPromise = p.waitForEvent('download', { timeout: 45000 });
await p.locator('.vd-export-btn').click();
const download = await downloadPromise;
const path = await download.path();
assert.ok(path);
const size = fs.statSync(path).size;
console.log('export', download.suggestedFilename(), size);
assert.ok(download.suggestedFilename().endsWith('.webm'));
assert.ok(size > 5000);
await wait(600);
assert.equal(await p.locator('.vd-export-overlay').count(), 0);
await p.screenshot({ path: 'shots/video-editor-final-1440.png' });

// Back to the video library: search, duplicate, delete and reload.
await p.locator('.vd-back').click();
await p.waitForSelector('.videos-page', { timeout: 15000 });
await wait(500);
assert.equal(await p.locator('.toast').count(), 0);
assert.equal(await p.locator('.video-card').count(), 1);
const cardTitle = await p.locator('.video-card-meta strong').innerText();
console.log('library card', cardTitle);
await p.locator('.videos-search input').fill('test');
await wait(200);
assert.equal(await p.locator('.video-card').count(), 1);
await p.locator('.videos-search input').fill('zzzz');
await wait(200);
assert.equal(await p.locator('.videos-empty h2').innerText(), 'No matches');
await p.locator('.videos-clear').click();
await wait(200);
assert.equal(await p.locator('.video-card').count(), 1);

const firstCard = p.locator('.video-card').first();
await firstCard.hover();
await firstCard.locator('.video-card-menu-btn').click();
await p.locator('.video-card-menu button').filter({ hasText: 'Duplicate' }).click();
await wait(500);
console.log('cards after duplicate', await p.locator('.video-card').count());
assert.equal(await p.locator('.video-card').count(), 2);

const copyCard = p.locator('.video-card').filter({ hasText: 'copy' });
await copyCard.hover();
await copyCard.locator('.video-card-menu-btn').click();
p.once('dialog', dialog => dialog.accept());
await p.locator('.video-card-menu button').filter({ hasText: 'Delete' }).click();
await wait(500);
console.log('cards after delete', await p.locator('.video-card').count());
assert.equal(await p.locator('.video-card').count(), 1);
await p.reload({ waitUntil: 'networkidle' });
await wait(500);
assert.equal(await p.locator('.video-card').count(), 1);

// Mobile layout.
await p.setViewportSize({ width: 390, height: 844 });
await wait(500);
assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false);
await p.screenshot({ path: 'shots/videos-mobile-390.png' });

console.log('errors', errors);
assert.equal(errors.length, 0);
await browser.close();
console.log('VIDEO EDITOR E2E OK');
