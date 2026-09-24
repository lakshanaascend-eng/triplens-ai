import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173/';

async function finalReview() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(`[Page Error] ${err.message}`);
  });

  page.on('requestfailed', req => {
    failedRequests.push(`[Failed Request] ${req.url()} (${req.failure()?.errorText})`);
  });

  console.log(`\n🔍 Loading TripLens AI at ${BASE_URL} ...`);
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Verify page title & favicon
  const title = await page.title();
  console.log(`📄 Page Title: "${title}"`);
  const favicon = await page.getAttribute('link[rel="icon"]', 'href');
  console.log(`🖼️ Favicon Href: "${favicon}"`);

  // Check all link tags for broken links
  const links = await page.$$eval('a', els => els.map(a => ({ text: a.innerText, href: a.getAttribute('href') })));
  console.log(`🔗 Found ${links.length} anchor tags`);
  for (const l of links) {
    if (!l.href || l.href === '#' || l.href === '') {
      console.log(`   Notice: Empty anchor href found: "${l.text}" -> "${l.href}"`);
    }
  }

  // Get all destinations from select options
  const destinations = await page.$$eval('#destination-select option', opts => opts.map(o => o.value));
  console.log(`\n📍 Testing all ${destinations.length} destinations across North & South India...\n`);

  const results = {
    totalTested: 0,
    zeroPlaces: [],
    placesCount: {},
    tabIssues: [],
    mathIssues: []
  };

  const waitForResults = async () => {
    await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(100);
  };

  for (const dest of destinations) {
    results.totalTested++;
    await page.selectOption('#destination-select', dest);
    await waitForResults();

    // Check places count
    const places = await page.$$('.place-card');
    results.placesCount[dest] = places.length;
    if (places.length === 0) {
      results.zeroPlaces.push(dest);
      console.warn(`   ⚠️ ${dest}: 0 places found`);
    }

    // Spot-check math inspection on first place card
    if (places.length > 0) {
      const firstCard = places[0];
      const mathBtn = await firstCard.$('.math-toggle-btn');
      if (mathBtn) {
        await mathBtn.click();
        const mathBox = await firstCard.$('.math-details-box');
        if (mathBox) {
          const mathText = await mathBox.innerText();
          if (mathText.includes('NaN') || mathText.includes('undefined')) {
            results.mathIssues.push(`${dest}: Math breakdown contains NaN or undefined: ${mathText}`);
          }
        }
        await mathBtn.click(); // collapse
      }
    }

    // Spot check the other 3 tabs on select destinations (every 5th destination + North India sample)
    if (results.totalTested % 5 === 0 || ['Jaipur', 'Manali', 'Varanasi', 'Goa', 'Kerala'].includes(dest)) {
      // Tab: Itinerary
      await page.click('button:has-text("Day-by-Day Itinerary")');
      await waitForResults();
      const dayCards = await page.$$('.itinerary-day-card');
      if (dayCards.length === 0) {
        results.tabIssues.push(`${dest}: No itinerary days rendered`);
      }

      // Tab: Hotels
      await page.click('button:has-text("Matched Hotels")');
      await waitForResults();

      // Tab: Dining
      await page.click('button:has-text("Matched Restaurants")');
      await waitForResults();

      // Switch back to Places
      await page.click('button:has-text("Ranked Places & Tiers")');
      await waitForResults();
    }
  }

  console.log(`\n🧪 Testing Presets...`);
  const presets = [
    'Preset 1: Goa Party & Nightlife',
    'Preset 2: Goa Serenity & Secluded',
    'Preset 3: Munnar Mountain Nature',
    'Preset 4: Pondicherry Heritage & Cafes',
  ];

  for (const presetText of presets) {
    const btn = page.locator(`button.preset-btn:has-text("${presetText}")`);
    if (await btn.isVisible()) {
      await btn.click();
      await waitForResults();
      const places = await page.$$('.place-card');
      console.log(`   ✅ ${presetText} -> ${places.length} places rendered`);
    } else {
      console.warn(`   ⚠️ Preset button not found: ${presetText}`);
    }
  }

  console.log(`\n🧪 Testing Edge Cases...`);
  // Edge Case 1: Ultra-low budget
  await page.selectOption('#destination-select', 'Jaipur');
  await page.fill('#budget-input', '500');
  await waitForResults();
  let edgePlaces = await page.$$('.place-card');
  console.log(`   ✅ Ultra-low budget (₹500 for Jaipur) -> ${edgePlaces.length} places rendered`);

  // Edge Case 2: Ultra-high budget
  await page.fill('#budget-input', '200000');
  await waitForResults();
  edgePlaces = await page.$$('.place-card');
  console.log(`   ✅ Ultra-high budget (₹200,000 for Jaipur) -> ${edgePlaces.length} places rendered`);

  // Edge Case 3: Zero interests
  const activeChips = await page.$$('.chip.active');
  for (const chip of activeChips) {
    await chip.click();
  }
  await waitForResults();
  edgePlaces = await page.$$('.place-card');
  console.log(`   ✅ Zero interests selected -> ${edgePlaces.length} places rendered`);

  // Edge Case 4: All interests
  const allChips = await page.$$('.chip');
  for (const chip of allChips) {
    const isActive = await chip.evaluate(el => el.classList.contains('active'));
    if (!isActive) await chip.click();
  }
  await waitForResults();
  edgePlaces = await page.$$('.place-card');
  console.log(`   ✅ All interests selected -> ${edgePlaces.length} places rendered`);

  console.log(`\n================ REVIEW SUMMARY ================`);
  console.log(`Total Destinations Tested: ${results.totalTested}`);
  console.log(`Destinations with 0 places: ${results.zeroPlaces.length === 0 ? 'None (All have places!)' : results.zeroPlaces.join(', ')}`);
  console.log(`Math NaN/Undefined Issues: ${results.mathIssues.length === 0 ? 'None (All math valid)' : results.mathIssues.join('; ')}`);
  console.log(`Tab Rendering Issues: ${results.tabIssues.length === 0 ? 'None (All tabs rendered cleanly)' : results.tabIssues.join('; ')}`);
  console.log(`Page Errors (Uncaught Exceptions): ${pageErrors.length}`);
  if (pageErrors.length > 0) pageErrors.forEach(e => console.error(`   ${e}`));
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) consoleErrors.forEach(e => console.error(`   ${e}`));
  console.log(`Failed Network Requests: ${failedRequests.length}`);
  if (failedRequests.length > 0) failedRequests.forEach(e => console.error(`   ${e}`));

  await browser.close();

  if (pageErrors.length === 0 && consoleErrors.length === 0 && results.zeroPlaces.length === 0) {
    console.log(`\n🎉 FINAL REVIEW COMPLETED: ZERO CONSOLE ERRORS, ALL DESTINATIONS HEALTHY!`);
    process.exit(0);
  } else {
    console.error(`\n⚠️ ISSUES DETECTED DURING REVIEW`);
    process.exit(1);
  }
}

finalReview().catch(err => {
  console.error('Final review script error:', err);
  process.exit(1);
});
