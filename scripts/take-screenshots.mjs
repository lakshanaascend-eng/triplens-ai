import { chromium } from 'playwright';

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });

  await page.goto('http://localhost:4173');
  await page.waitForLoadState('networkidle');

  // 1. Capture Places view with Profile 1 (Goa Party & Nightlife)
  await page.click('button:has-text("Preset 1")');
  await page.waitForTimeout(400);

  // Expand math breakdown on first card
  const mathBtn = await page.$('.math-toggle-btn');
  if (mathBtn) await mathBtn.click();
  await page.waitForTimeout(200);

  await page.screenshot({ path: 'screenshot-places.png', fullPage: true });
  console.log('Saved screenshot-places.png');

  // 2. Capture Itinerary view
  await page.click('button:has-text("Day-by-Day Itinerary")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshot-itinerary.png', fullPage: true });
  console.log('Saved screenshot-itinerary.png');

  // 3. Capture Profile 2 (Goa Serenity) Places view to show dramatic re-ranking
  await page.click('button:has-text("Ranked Places & Tiers")');
  await page.waitForTimeout(200);
  await page.click('button:has-text("Preset 2")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshot-serenity.png', fullPage: true });
  console.log('Saved screenshot-serenity.png');

  await browser.close();
}

captureScreenshots().catch(console.error);
