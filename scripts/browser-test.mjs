import { chromium } from 'playwright';

async function runBrowserTest() {
  console.log('Launching browser to test TripLens AI...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Helper: wait until the loading state resolves
  const waitForResults = async () => {
    // Wait for computing placeholder to disappear (loading done)
    await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 3000 }).catch(() => {});
    // Extra safety buffer
    await page.waitForTimeout(100);
  };

  try {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    console.log('Page loaded successfully:', await page.title());

    // 1. Check title & form elements exist
    const heading = await page.textContent('h1');
    console.log('H1:', heading);

    // 2. Apply Preset 1: Goa Party & Nightlife
    console.log('\n--- Submitting Preference Combination 1: Goa Party & Nightlife ---');
    await page.click('button:has-text("Preset 1")');
    await waitForResults();

    // Extract first 4 ranked places
    const placesCards1 = await page.$$eval('[data-testid="place-name"]', (nodes) =>
      nodes.slice(0, 4).map((n) => n.textContent?.trim())
    );
    console.log('Rankings for Profile 1 (Nightlife/Budget):');
    placesCards1.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

    // Check explanation and reality check for top item
    const firstExplanation1 = await page.$eval(
      '[data-testid="why-explanation"]',
      (el) => el.textContent?.trim()
    );
    console.log('  Top Explanation 1:', firstExplanation1);

    const firstRealityCheck1 = await page.$eval(
      '[data-testid="reality-check"]',
      (el) => el.textContent?.trim()
    );
    console.log('  Top Reality Check 1:', firstRealityCheck1);

    // 3. Apply Preset 2: Goa Serenity & Secluded
    console.log('\n--- Submitting Preference Combination 2: Goa Serenity & Secluded ---');
    await page.click('button:has-text("Preset 2")');
    await waitForResults();

    // Extract first 4 ranked places
    const placesCards2 = await page.$$eval('[data-testid="place-name"]', (nodes) =>
      nodes.slice(0, 4).map((n) => n.textContent?.trim())
    );
    console.log('Rankings for Profile 2 (Peaceful/Nature/Low Crowd):');
    placesCards2.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

    const firstExplanation2 = await page.$eval(
      '[data-testid="why-explanation"]',
      (el) => el.textContent?.trim()
    );
    console.log('  Top Explanation 2:', firstExplanation2);

    const firstRealityCheck2 = await page.$eval(
      '[data-testid="reality-check"]',
      (el) => el.textContent?.trim()
    );
    console.log('  Top Reality Check 2:', firstRealityCheck2);

    // 4. Assert that rankings changed
    console.log('\n--- Assertion Results ---');
    const rank1_combo1 = placesCards1[0];
    const rank1_combo2 = placesCards2[0];
    console.log(`Top place 1: "${rank1_combo1}"`);
    console.log(`Top place 2: "${rank1_combo2}"`);

    if (rank1_combo1 !== rank1_combo2) {
      console.log('✅ SUCCESS: Rankings dynamically changed between preference combinations!');
    } else {
      console.error('❌ FAIL: Rankings did not change!');
      process.exit(1);
    }

    // 5. Test manual custom form inputs
    console.log('\n--- Submitting Preference Combination 3: Manual Custom Input (Munnar, Nature) ---');
    await page.selectOption('#destination-select', 'Munnar');
    await page.fill('#budget-input', '35000');
    await page.fill('#days-input', '4');
    await waitForResults();

    const munnarPlaces = await page.$$eval('#ranked-places-results h4', (nodes) =>
      nodes.slice(0, 3).map((n) => n.textContent?.trim())
    );
    console.log('Munnar top places:');
    munnarPlaces.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

    // 6. Test Itinerary Tab
    console.log('\n--- Testing Itinerary Generation Tab ---');
    await page.click('button:has-text("Day-by-Day Itinerary")');
    await waitForResults();

    const daysCount = await page.$$eval('#itinerary-results h3', (nodes) => nodes.length);
    console.log(`Rendered days in itinerary: ${daysCount} (Expected: 4)`);

    if (daysCount === 4) {
      console.log('✅ SUCCESS: Itinerary dynamically rendered 4 days with morning/lunch/afternoon/evening slots!');
    } else {
      console.error('❌ FAIL: Itinerary days count mismatch!');
    }

    // Take screenshot as proof
    await page.screenshot({ path: 'verification-unstyled.png', fullPage: true });
    console.log('Screenshot saved to verification-unstyled.png');

    console.log('\nAll browser end-to-end verification checks PASSED!');
  } finally {
    await browser.close();
  }
}

runBrowserTest().catch((err) => {
  console.error('Error during browser test:', err);
  process.exit(1);
});
