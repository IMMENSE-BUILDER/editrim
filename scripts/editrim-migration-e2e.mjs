import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';

/**
 * Rename migration audit. Seeds the previous brand's localStorage keys and
 * IndexedDB databases, boots the renamed app, and checks that every design,
 * brand, theme, video project, photo session and media record moved across.
 */

const base = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  localStorage.clear();
  localStorage.setItem('vellum_theme_v1', 'dark');
  localStorage.setItem('vellum.brand.v1', JSON.stringify({ name: 'Legacy brand', colors: ['#2440F0'] }));
  localStorage.setItem('vellum_video_projects_v1', JSON.stringify([{ id: 'video_legacy', name: 'Legacy video' }]));
  localStorage.setItem('vellum_photo_session_v1', JSON.stringify({ name: 'Legacy photo', settings: {} }));

  const open = (name, version, upgrade) => new Promise((resolve, reject) => {
    const request = version ? indexedDB.open(name, version) : indexedDB.open(name);
    if (upgrade) request.onupgradeneeded = () => upgrade(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const put = (db, store, value, key) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    if (key === undefined) tx.objectStore(store).put(value);
    else tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  const assets = await open('vellum-assets', 1, db => db.createObjectStore('assets', { keyPath: 'id' }));
  await put(assets, 'assets', { id: 'asset_legacy', name: 'legacy.png', blob: new Blob(['legacy'], { type: 'image/png' }) });
  assets.close();

  const photo = await open('vellum-photo-source', 1, db => db.createObjectStore('source'));
  await put(photo, 'source', new Blob(['photo'], { type: 'image/png' }), 'current');
  photo.close();

  const video = await open('vellum-video-media', 1, db => db.createObjectStore('media'));
  await put(video, 'media', new Blob(['video'], { type: 'video/webm' }), 'media_legacy');
  video.close();
});

await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);

const state = await page.evaluate(async () => {
  const readDb = (name, store) => new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(store)) { db.close(); resolve(null); return; }
      const tx = db.transaction(store, 'readonly');
      const storeRef = tx.objectStore(store);
      const keys = storeRef.getAllKeys();
      const all = storeRef.getAll();
      tx.oncomplete = () => { db.close(); resolve({ keys: keys.result, count: all.result.length }); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
    request.onerror = () => resolve(null);
  });

  return {
    theme: document.documentElement.dataset.theme,
    themeNew: localStorage.getItem('editrim_theme_v1'),
    themeOld: localStorage.getItem('vellum_theme_v1'),
    brand: localStorage.getItem('editrim.brand.v1'),
    video: localStorage.getItem('editrim_video_projects_v1'),
    photoSession: localStorage.getItem('editrim_photo_session_v1'),
    oldKeys: Object.keys(localStorage).filter(key => key.startsWith('vellum')),
    databases: (await indexedDB.databases()).map(db => db.name).sort(),
    assets: await readDb('editrim-assets', 'assets'),
    photo: await readDb('editrim-photo-source', 'source'),
    videoMedia: await readDb('editrim-video-media', 'media'),
    brandText: document.querySelector('.home-brand span')?.textContent ?? null,
    title: document.title,
  };
});
console.log(JSON.stringify(state, null, 2));

assert.equal(state.theme, 'dark', 'legacy dark theme survives the rename');
assert.equal(state.themeNew, 'dark');
assert.equal(state.themeOld, null);
assert.equal(state.oldKeys.length, 0, 'no legacy localStorage keys remain');
assert.ok(state.brand?.includes('Legacy brand'), 'brand kit migrated');
assert.ok(state.video?.includes('Legacy video'), 'video project index migrated');
assert.ok(state.photoSession?.includes('Legacy photo'), 'photo session migrated');
assert.ok(!state.databases.includes('vellum-assets'), 'old assets db removed');
assert.ok(!state.databases.includes('vellum-photo-source'), 'old photo db removed');
assert.ok(!state.databases.includes('vellum-video-media'), 'old video db removed');
assert.deepEqual(state.assets?.keys, ['asset_legacy'], 'asset record migrated');
assert.deepEqual(state.photo?.keys, ['current'], 'photo source migrated');
assert.deepEqual(state.videoMedia?.keys, ['media_legacy'], 'video media migrated');
assert.equal(state.assets?.count, 1);
assert.equal(state.photo?.count, 1);
assert.equal(state.videoMedia?.count, 1);
assert.equal(state.brandText, 'Editrim', 'dashboard wordmark is Editrim');
assert.ok(state.title.includes('Editrim'), 'document title is Editrim');

await page.screenshot({ path: 'shots/editrim-migration-dashboard.png' });
console.log('errors', errors);
assert.equal(errors.length, 0);
fs.mkdirSync('shots', { recursive: true });
await browser.close();
console.log('EDITRIM MIGRATION OK');
