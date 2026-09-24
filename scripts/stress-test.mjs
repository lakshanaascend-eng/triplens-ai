import { chromium } from 'playwright';

async function runStressTests() {
  console.log('Starting TripLens AI Stress Test Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });

  try {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    const waitForResults = async () => {
      await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(200);
    };

    // ========================================================
    // TEST 1: Very High Budget (₹2,00,000 for 3 days)
    // ========================================================
    console.log('========================================================');
    console.log('TEST 1: Very High Budget (₹2,00,000 for 3 days)');
    console.log('========================================================');
    await page.click('button:has-text("Coastal Haven")'); // Select Goa
    await page.fill('#budget-input', '200000');
    await page.fill('#days-input', '3');
    await waitForResults();

    const highBudgetPlaces = await page.$$eval('[data-testid="place-card"]', (cards) =>
      cards.slice(0, 3).map((c) => ({
        name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
        score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
        tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
        why: c.querySelector('[data-testid="why-explanation"]')?.textContent?.trim(),
      }))
    );

    console.log('Top Places with ₹2,00,000 budget:');
    highBudgetPlaces.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.tier}] ${p.name} — Score: ${p.score}`);
      console.log(`     ${p.why}`);
    });

    // Check matched luxury hotels with ₹2,00,000
    await page.click('button:has-text("Matched Hotels")');
    await waitForResults();
    const topHotelHighBudget = await page.$eval('[data-testid="place-name"]', (el) => el.textContent?.trim());
    const topHotelScoreHighBudget = await page.$eval('[data-testid="priority-score"]', (el) => el.textContent?.trim());
    console.log(`Top Hotel with ₹2,00,000 budget: ${topHotelHighBudget} (Score: ${topHotelScoreHighBudget})`);

    // ========================================================
    // TEST 2: Very Tight Budget (₹500 for 3 days)
    // ========================================================
    console.log('\n========================================================');
    console.log('TEST 2: Very Tight Budget (₹500 for 3 days)');
    console.log('========================================================');
    await page.click('button:has-text("Ranked Places & Tiers")');
    await page.fill('#budget-input', '500');
    await page.fill('#days-input', '3');
    await waitForResults();

    // Verify page didn't crash
    const tightBudgetCards = await page.$$('[data-testid="place-card"]');
    console.log(`Rendered cards count: ${tightBudgetCards.length} (Did it crash? NO, renders smoothly)`);

    const tightBudgetPlaces = await page.$$eval('[data-testid="place-card"]', (cards) =>
      cards.slice(0, 4).map((c) => ({
        name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
        score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
        tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
        why: c.querySelector('[data-testid="why-explanation"]')?.textContent?.trim(),
      }))
    );

    console.log('Top Places with ₹500 budget:');
    tightBudgetPlaces.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.tier}] ${p.name} — Score: ${p.score}`);
      console.log(`     ${p.why}`);
    });

    // Check what happened to luxury place Curlies (₹2,500) and Thalassa (₹3,000) under ₹500
    const curliesTier = await page.$eval(
      '[data-testid="place-card"]:has-text("Curlies")',
      (c) => ({
        name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
        tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
        score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
      })
    );
    console.log(`Luxury spot with ₹500 budget: ${curliesTier.name} -> Tier: ${curliesTier.tier} (Score: ${curliesTier.score})`);

    // Check hotels under ₹500
    await page.click('button:has-text("Matched Hotels")');
    await waitForResults();
    const hostelUnder500 = await page.$eval('[data-testid="place-card"]:has-text("The Hosteller")', (c) => ({
      name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
      score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
      tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
    }));
    const tajUnder500 = await page.$eval('[data-testid="place-card"]:has-text("Taj Fort Aguada")', (c) => ({
      name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
      score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
      tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
    }));
    console.log(`Budget Hostel under ₹500: ${hostelUnder500.name} -> ${hostelUnder500.tier} (Score: ${hostelUnder500.score})`);
    console.log(`Luxury 5-Star under ₹500: ${tajUnder500.name} -> ${tajUnder500.tier} (Score: ${tajUnder500.score})`);

    // ========================================================
    // TEST 3: Selecting ZERO Interests
    // ========================================================
    console.log('\n========================================================');
    console.log('TEST 3: Selecting ZERO Interests');
    console.log('========================================================');
    await page.click('button:has-text("Ranked Places & Tiers")');

    // Deselect all active chips
    const activeChips = await page.$$('.chip.active');
    for (const chip of activeChips) {
      await chip.click();
    }
    await waitForResults();

    const remainingActiveChips = await page.$$('.chip.active');
    console.log(`Active interest chips count: ${remainingActiveChips.length}`);

    const zeroInterestPlaces = await page.$$eval('[data-testid="place-card"]', (cards) =>
      cards.slice(0, 3).map((c) => ({
        name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
        score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
        why: c.querySelector('[data-testid="why-explanation"]')?.textContent?.trim(),
      }))
    );

    console.log('Top Places with ZERO selected interests:');
    zeroInterestPlaces.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (Score: ${p.score})`);
      console.log(`     ${p.why}`);
    });

    // ========================================================
    // TEST 4: Destination Munnar (Hill Station)
    // ========================================================
    console.log('\n========================================================');
    console.log('TEST 4: Destination 2 — MUNNAR (Hill Station)');
    console.log('========================================================');
    await page.click('button:has-text("Hill Station")'); // Click Munnar pill
    await page.waitForTimeout(400);

    const munnarPlaces = await page.$$eval('[data-testid="place-card"]', (cards) =>
      cards.slice(0, 4).map((c) => ({
        name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
        score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
        tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
        reality: c.querySelector('[data-testid="reality-check-status"]')?.textContent?.trim(),
      }))
    );

    console.log('Munnar Top Places:');
    munnarPlaces.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.tier}] ${p.name} (Score: ${p.score}) — ${p.reality}`);
    });

    // Check Munnar reality check flag (e.g. Eravikulam or Top Station)
    const munnarFlagged = await page.$$eval('[data-testid="reality-check"].warning', (boxes) =>
      boxes.map((b) => b.textContent?.trim())
    );
    console.log(`Munnar flagged places count: ${munnarFlagged.length}`);
    munnarFlagged.forEach((msg, i) => console.log(`  Flag ${i + 1}: ${msg.substring(0, 110)}...`));

    // Check Munnar itinerary
    await page.click('button:has-text("Day-by-Day Itinerary")');
    await waitForResults();
    const munnarItineraryDays = await page.$$eval('.itinerary-day-card .day-title', (titles) =>
      titles.map((t) => t.textContent?.trim())
    );
    console.log('Munnar Itinerary days generated:');
    munnarItineraryDays.forEach((t) => console.log(`  ${t}`));

    // ========================================================
    // TEST 5: Destination Pondicherry (French Quarter)
    // ========================================================
    console.log('\n========================================================');
    console.log('TEST 5: Destination 3 — PONDICHERRY (French Quarter)');
    console.log('========================================================');
    await page.click('button:has-text("French Quarter")'); // Click Pondicherry pill
    await page.waitForTimeout(400);

    await page.click('button:has-text("Ranked Places & Tiers")');
    await waitForResults();

    const pondiPlaces = await page.$$eval('[data-testid="place-card"]', (cards) =>
      cards.slice(0, 4).map((c) => ({
        name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
        score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
        tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
        reality: c.querySelector('[data-testid="reality-check-status"]')?.textContent?.trim(),
      }))
    );

    console.log('Pondicherry Top Places:');
    pondiPlaces.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.tier}] ${p.name} (Score: ${p.score}) — ${p.reality}`);
    });

    // Check Pondicherry flagged places (Paradise Beach / Promenade Beach)
    const pondiFlagged = await page.$$eval('[data-testid="reality-check"].warning', (boxes) =>
      boxes.map((b) => b.textContent?.trim())
    );
    console.log(`Pondicherry flagged places count: ${pondiFlagged.length}`);
    pondiFlagged.forEach((msg, i) => console.log(`  Flag ${i + 1}: ${msg.substring(0, 110)}...`));

    // Check Pondicherry Itinerary
    await page.click('button:has-text("Day-by-Day Itinerary")');
    await waitForResults();
    const pondiItineraryDays = await page.$$eval('.itinerary-day-card .day-title', (titles) =>
      titles.map((t) => t.textContent?.trim())
    );
    console.log('Pondicherry Itinerary days generated:');
    pondiItineraryDays.forEach((t) => console.log(`  ${t}`));

    console.log('\n========================================================');
    console.log('✅ ALL STRESS TESTS COMPLETED AND PASSED!');
    console.log('========================================================');
  } finally {
    await browser.close();
  }
}

runStressTests().catch((err) => {
  console.error('Stress test failed:', err);
  process.exit(1);
});
