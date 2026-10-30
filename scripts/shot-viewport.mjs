import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:5173/';
const out = process.argv[3] || 'shots/landing.png';
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 1000);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
page.on('requestfailed', req => errors.push('REQFAIL: ' + req.url() + ' ' + req.failure()?.errorText));
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => errors.push('NAV: ' + e.message));
await page.waitForTimeout(2500);
await page.screenshot({ path: out, fullPage: false });
console.log('TITLE:', await page.title());
console.log('BODY:', (await page.locator('body').innerText()).slice(0, 500).replace(/\n/g, ' | '));
console.log('ERRORS:', JSON.stringify(errors.slice(0, 20), null, 2));
console.log('SHOT:', out);
await browser.close();
