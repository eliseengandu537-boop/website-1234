import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

await fs.mkdir('artifacts/browser', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
context.setDefaultTimeout(15000);
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
const response = await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
assert.equal(response.status(), 200);
await page.evaluate(() => document.fonts.ready);
async function loadContentImages() {
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(element => element.decode());
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}
await loadContentImages();
await page.screenshot({ path: 'artifacts/browser/desktop-hero.png' });
await page.screenshot({ path: 'artifacts/browser/desktop-full.png', fullPage: true });
for (const width of [1440, 1024, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 900 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Horizontal overflow at ${width}px`);
}
await page.setViewportSize({ width: 1440, height: 1000 });
const brokenAnchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.querySelector(a.getAttribute('href'))).map(a => a.getAttribute('href')));
assert.deepEqual(brokenAnchors, []);
const services = ['Back to its best.', 'Start with the right insight.', 'Every component counts.', 'Made to your requirements.'];
for (let i = 0; i < services.length; i++) {
  await page.locator(`[data-service="${i}"]`).click();
  assert.equal(await page.locator('#service-title').textContent(), services[i]);
  assert.equal(await page.locator('[data-service][aria-expanded="true"]').count(), 1);
}
await page.locator('#service-enquiry').click();
assert.equal(await page.locator('#enquiry-dialog').isVisible(), true);
assert.equal(await page.locator('[name="service"]').inputValue(), 'Precision machining');
await page.locator('#enquiry-form button[type=submit]').click();
assert.equal(await page.locator('#enquiry-result').isVisible(), false);
await page.locator('[name=name]').fill('Test Visitor');
await page.locator('[name=company]').fill('Engineering QA');
await page.locator('[name=email]').fill('test@example.com');
await page.locator('[name=details]').fill('Please assess our HPH pump.');
await page.evaluate(() => { window.copiedEnquiry = ''; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copiedEnquiry = text; } }, configurable: true }); });
await page.locator('#enquiry-form button[type=submit]').click();
assert.equal(await page.locator('#enquiry-result').isVisible(), true);
await page.locator('#copy-enquiry').click();
assert.match(await page.evaluate(() => window.copiedEnquiry), /Please assess our HPH pump/);
await page.keyboard.press('Escape');
assert.equal(await page.locator('#enquiry-dialog').isVisible(), false);
assert.equal(await page.evaluate(() => document.body.classList.contains('dialog-open')), false);
await page.locator('[data-gallery]').first().click();
assert.equal(await page.locator('#gallery-dialog').isVisible(), true);
assert.equal(await page.locator('#gallery-image').evaluate(image => image.complete && image.naturalWidth > 0), true);
await page.keyboard.press('Escape');
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
await page.locator('.menu-toggle').click();
assert.equal(await page.locator('#mobile-nav').isVisible(), true);
await page.locator('#mobile-nav a[href="#expertise"]').click();
assert.equal(await page.locator('#mobile-nav').isVisible(), false);
await loadContentImages();
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: 'artifacts/browser/mobile-hero.png' });
await page.screenshot({ path: 'artifacts/browser/mobile-full.png', fullPage: true });
const images = await page.locator('main img').evaluateAll(images => images.map(image => ({ src: image.getAttribute('src'), width: image.naturalWidth, alt: image.alt })));
assert.equal(images.every(image => image.width > 0 && image.alt.length > 0), true, JSON.stringify(images));
assert.deepEqual(errors, []);
const fonts = await page.evaluate(() => ({ manrope: document.fonts.check('500 16px Manrope'), dmSans: document.fonts.check('400 16px "DM Sans"') }));
const motionContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
motionContext.setDefaultTimeout(15000);
const motionPage = await motionContext.newPage();
console.log('Checking animated scroll behaviour…');
motionPage.on('pageerror', error => errors.push(error.message));
await motionPage.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
assert.equal(await motionPage.locator('html').evaluate(element => element.classList.contains('js-motion')), true);
await motionPage.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
await motionPage.waitForFunction(() => document.querySelector('.site-header').classList.contains('is-scrolled'));
assert.ok(await motionPage.evaluate(() => parseFloat(document.documentElement.style.getPropertyValue('--hero-shift')) > 0));
assert.ok(await motionPage.evaluate(() => parseFloat(document.documentElement.style.getPropertyValue('--scroll-progress')) > 0));
assert.equal(await motionPage.locator('.site-header').evaluate(element => getComputedStyle(element).position), 'fixed');
console.log('Parallax, sticky navigation and reading progress passed.');
await motionPage.locator('#industries').scrollIntoViewIfNeeded();
await motionPage.waitForFunction(() => [...document.querySelectorAll('.industry-card')].every(card => card.classList.contains('visible')));
assert.equal(await motionPage.locator('.industry-card.reveal').count(), 4);
console.log('Staggered industry card reveals passed.');
await motionPage.locator('.process-steps').scrollIntoViewIfNeeded();
await motionPage.waitForFunction(() => parseFloat(document.documentElement.style.getPropertyValue('--process-progress')) > 0);
await motionPage.emulateMedia({ reducedMotion: 'reduce' });
await motionPage.waitForFunction(() => !document.documentElement.classList.contains('js-motion'));
assert.equal(await motionPage.locator('.hero-video, .hero-image').first().evaluate(element => getComputedStyle(element).transform), 'none');
assert.deepEqual(errors, []);
console.log(JSON.stringify({ status: 'passed', viewports: [1440, 1024, 768, 390, 320], checks: ['No horizontal overflow', 'Internal anchors', 'All service selectors', 'Enquiry validation and service preselection', 'Email enquiry generation and copy fallback', 'Dialog Escape handling', 'Gallery image loading', 'Mobile navigation', 'All content images loaded', 'No JavaScript errors', 'Hero scroll parallax', 'Fixed glass header', 'Reading progress', 'Staggered card reveals', 'Process scroll line', 'Live reduced-motion preference'], fonts }, null, 2));
} finally { await browser.close(); }
