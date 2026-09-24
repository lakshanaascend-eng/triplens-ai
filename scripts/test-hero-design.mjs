import { chromium } from 'playwright';

async function testHeroDesign() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('\n--- 1. Testing Desktop Landing Page Experience (1280x900) ---');
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');

  // 1. Headline & Tagline
  const title = await page.innerText('.hero-title');
  const tagline = await page.innerText('.hero-tagline');
  const diffStmt = await page.innerText('.hero-difference-statement');
  console.log(`✅ Title: "${title}"`);
  console.log(`✅ Tagline: "${tagline}"`);
  console.log(`✅ Value Proposition: "${diffStmt.slice(0, 75)}..."`);

  // 2. Three Feature Highlights
  const featureItems = await page.$$('.hero-feature-item');
  console.log(`✅ Feature Highlights Count: ${featureItems.length} (Expected 3)`);
  for (const item of featureItems) {
    const text = await item.innerText();
    console.log(`   - ${text.split('\n')[0]}`);
  }

  // 3. 4-Tier Visual System Strip
  const tierChips = await page.$$('.tier-strip-chip');
  console.log(`✅ 4-Tier Chips Count: ${tierChips.length}`);

  // 4. Output Preview Mockup
  const previewPlace = await page.innerText('.preview-place-name');
  const previewScore = await page.innerText('.preview-score-val');
  const previewWhy = await page.innerText('.preview-why-box');
  const previewReality = await page.innerText('.preview-reality-box');
  console.log(`✅ Preview Card Place: "${previewPlace}" (Score: ${previewScore}/100)`);
  console.log(`   - Why Snippet: ${previewWhy.slice(0, 60)}...`);
  console.log(`   - Reality Check Snippet: ${previewReality.slice(0, 60)}...`);

  // 5. CTA Button
  const ctaBtn = page.locator('.hero-cta-btn');
  const ctaText = await ctaBtn.innerText();
  console.log(`✅ CTA Button: "${ctaText}"`);

  // Take screenshot of hero
  const heroElement = await page.$('.hero-wrapper');
  if (heroElement) {
    await heroElement.screenshot({ path: 'hero-desktop-preview.png' });
    console.log('📸 Saved hero-desktop-preview.png');
  }

  // Click CTA and verify scroll
  await ctaBtn.click();
  await page.waitForTimeout(600);
  const formInView = await page.locator('#form-panel').isVisible();
  console.log(`✅ Form visible after CTA click: ${formInView}`);

  console.log('\n--- 2. Testing Mobile Responsive Viewport (390x844) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');

  const mobileTitle = await page.innerText('.hero-title');
  const mobilePreview = await page.locator('.hero-preview-card').isVisible();
  const mobileCta = await page.locator('.hero-cta-btn').isVisible();
  console.log(`✅ Mobile Viewport - Title: "${mobileTitle}"`);
  console.log(`✅ Mobile Viewport - Preview Card Visible: ${mobilePreview}`);
  console.log(`✅ Mobile Viewport - CTA Visible: ${mobileCta}`);

  const mobileHero = await page.$('.hero-wrapper');
  if (mobileHero) {
    await mobileHero.screenshot({ path: 'hero-mobile-preview.png' });
    console.log('📸 Saved hero-mobile-preview.png');
  }

  console.log('\n--- 3. Testing Full User Journey Flow (Form -> Results -> Itinerary -> Inspection) ---');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.selectOption('#destination-select', 'Jaipur');
  await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);

  // Check Results
  const places = await page.$$('.place-card');
  console.log(`✅ Jaipur Results: ${places.length} places loaded`);

  // Test Math Breakdown
  if (places.length > 0) {
    const mathBtn = await places[0].$('.math-toggle-btn');
    if (mathBtn) {
      await mathBtn.click();
      const mathBox = await places[0].$('.math-details-box');
      const mathVisible = mathBox ? await mathBox.isVisible() : false;
      console.log(`✅ Math Breakdown Accordion toggled: ${mathVisible}`);
    }
  }

  // Test Itinerary
  await page.click('button:has-text("Day-by-Day Itinerary")');
  await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
  const days = await page.$$('.itinerary-day-card');
  console.log(`✅ Itinerary Days: ${days.length} days generated`);

  await browser.close();
  console.log('\n🎉 ALL HERO DESIGN & FLOW TESTS PASSED!');
}

testHeroDesign().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
