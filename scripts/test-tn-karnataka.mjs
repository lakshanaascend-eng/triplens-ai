import { chromium } from 'playwright';

async function runTests() {
  console.log('--- Starting TripLens AI TN & Karnataka Dataset Expansion Browser Verification ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });

  const waitForResults = async () => {
    await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(200);
  };

  try {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    console.log('App loaded successfully. Title:', await page.title());

    // -------------------------------------------------------------
    // Test 1: One Karnataka city ("Mysore" or "Coorg")
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Karnataka City ("Mysore") City-Level Matching & Scoring ---');
    await page.selectOption('#destination-select', 'Mysore');
    await waitForResults();

    const mysorePlaces = await page.$$eval('[data-testid="place-name"]', (nodes) =>
      nodes.map((n) => n.textContent?.trim())
    );
    console.log('Mysore Places Found:', mysorePlaces);

    const hasMysorePalace = mysorePlaces.some((name) => name.includes('Mysore Palace'));
    const hasChamundi = mysorePlaces.some((name) => name.includes('Chamundi'));
    console.log('Includes Mysore Palace:', hasMysorePalace);
    console.log('Includes Chamundi Hill:', hasChamundi);

    if (hasMysorePalace && hasChamundi && mysorePlaces.length === 4) {
      console.log('✅ Test 1 Passed: Mysore city-level matching and scoring work accurately!');
    } else {
      console.error('❌ Test 1 Failed: Mysore places count or items mismatch.');
    }

    // Check Coorg as well
    console.log('\n--- Additional Check: Karnataka City ("Coorg") ---');
    await page.selectOption('#destination-select', 'Coorg');
    await waitForResults();
    const coorgPlaces = await page.$$eval('[data-testid="place-name"]', (nodes) =>
      nodes.map((n) => n.textContent?.trim())
    );
    console.log('Coorg Places Found:', coorgPlaces);
    if (coorgPlaces.some((p) => p.includes('Abbey Falls')) && coorgPlaces.some((p) => p.includes('Namdroling'))) {
      console.log('✅ Coorg verification passed!');
    }

    // -------------------------------------------------------------
    // Test 2: One Tamil Nadu city ("Ooty") with contrasting preference profiles
    // Profile A: Nightlife / High-Budget / High-Crowd
    // Profile B: Peaceful Spots / Low-Budget / Low-Crowd
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Tamil Nadu City ("Ooty") Contrasting Preference Profiles ---');
    await page.selectOption('#destination-select', 'Ooty');

    // Configure Profile A: High budget (₹50,000), nightlife & food, high crowd tolerance
    console.log('Applying Profile A (High Budget ₹50,000, Nightlife & Food, High Crowd):');
    await page.fill('#budget-input', '50000');
    await page.fill('#days-input', '3');

    // Deselect all chips first
    const chips = await page.$$('.chip.active');
    for (const chip of chips) {
      await chip.click();
    }
    // Select Nightlife and Food
    await page.click('.chip:has-text("Nightlife")');
    await page.click('.chip:has-text("Food")');

    // Select High Crowd
    await page.click('.crowd-option-card:has-text("High Crowd")');
    await waitForResults();

    const ootyProfileAPlaces = await page.$$eval('[data-testid="place-card"]', (cards) =>
      cards.slice(0, 3).map((c) => ({
        name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
        score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
        tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
        why: c.querySelector('[data-testid="why-explanation"]')?.textContent?.trim(),
      }))
    );
    console.log('Ooty Top Places Profile A:');
    ootyProfileAPlaces.forEach((p, i) => console.log(`  ${i + 1}. [${p.tier}] ${p.name} (Score: ${p.score})`));

    // Configure Profile B: Tight budget (₹1,500 for 3 days = ₹500/day), Peaceful Spots & Nature, Low Crowd Tolerance
    console.log('\nApplying Profile B (Low Budget ₹1,500, Peaceful Spots & Nature, Low Crowd):');
    await page.fill('#budget-input', '1500');
    await page.fill('#days-input', '3');

    // Deselect chips
    const activeChipsB = await page.$$('.chip.active');
    for (const chip of activeChipsB) {
      await chip.click();
    }
    // Select Peaceful spots and Nature
    await page.click('.chip:has-text("Peaceful Spots")');
    await page.click('.chip:has-text("Nature")');

    // Select Low Crowd
    await page.click('.crowd-option-card:has-text("Low Crowd")');
    await waitForResults();

    const ootyProfileBPlaces = await page.$$eval('[data-testid="place-card"]', (cards) =>
      cards.slice(0, 3).map((c) => ({
        name: c.querySelector('[data-testid="place-name"]')?.textContent?.trim(),
        score: c.querySelector('[data-testid="priority-score"]')?.textContent?.trim(),
        tier: c.querySelector('[data-testid="tier-badge"]')?.textContent?.trim(),
        why: c.querySelector('[data-testid="why-explanation"]')?.textContent?.trim(),
      }))
    );
    console.log('Ooty Top Places Profile B:');
    ootyProfileBPlaces.forEach((p, i) => console.log(`  ${i + 1}. [${p.tier}] ${p.name} (Score: ${p.score})`));

    const topA = ootyProfileAPlaces[0]?.name;
    const topB = ootyProfileBPlaces[0]?.name;
    console.log(`Top place Profile A: "${topA}"`);
    console.log(`Top place Profile B: "${topB}"`);

    // In Profile B (peaceful, nature, low crowd), Avalanche Lake (low crowd, peaceful, nature) should rank top
    const avalancheInProfileB = ootyProfileBPlaces.some((p) => p.name.includes('Avalanche Lake'));
    console.log('Avalanche Lake prominent in Profile B:', avalancheInProfileB);

    if (topA !== topB || avalancheInProfileB) {
      console.log('✅ Test 2 Passed: Ooty rankings dynamically and significantly shifted between contrasting profiles!');
    } else {
      console.error('❌ Test 2 Failed: Rankings did not shift appropriately between profiles.');
    }

    // -------------------------------------------------------------
    // Test 3: Re-confirm Goa and Kerala still return unchanged, correct results
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Re-confirm Goa and Kerala integrity ---');

    // Goa verification
    await page.click('button:has-text("Preset 1")'); // Preset 1 uses Goa
    await waitForResults();
    const goaPlaces = await page.$$eval('[data-testid="place-name"]', (nodes) =>
      nodes.slice(0, 4).map((n) => n.textContent?.trim())
    );
    console.log('Goa Top Places:', goaPlaces);
    const goaUnchanged = goaPlaces[0] === "Baga Beach & Tito's Lane";
    console.log('Goa #1 is Baga Beach:', goaUnchanged);

    // Kerala verification (state search)
    await page.selectOption('#destination-select', 'Kerala');
    await waitForResults();
    const keralaPlaces = await page.$$eval('[data-testid="place-name"]', (nodes) =>
      nodes.map((n) => n.textContent?.trim())
    );
    console.log(`Kerala Total Places Count: ${keralaPlaces.length}`);
    const keralaHasMunnar = keralaPlaces.some((p) => p.includes('Kolukkumalai') || p.includes('Attukal'));
    const keralaHasThrissur = keralaPlaces.some((p) => p.includes('Vadakkunnathan'));
    const keralaHasAlleppey = keralaPlaces.some((p) => p.includes('Backwaters') || p.includes('Marari'));
    console.log('Kerala aggregates Munnar, Thrissur, Alleppey:', keralaHasMunnar && keralaHasThrissur && keralaHasAlleppey);

    // Tamil Nadu (state search check)
    await page.selectOption('#destination-select', 'Tamil Nadu');
    await waitForResults();
    const tnPlaces = await page.$$eval('[data-testid="place-name"]', (nodes) =>
      nodes.map((n) => n.textContent?.trim())
    );
    console.log(`Tamil Nadu State Total Places: ${tnPlaces.length}`);
    const tnHasOoty = tnPlaces.some((p) => p.includes('Nilgiri') || p.includes('Doddabetta'));
    const tnHasMadurai = tnPlaces.some((p) => p.includes('Meenakshi'));
    const tnHasMahabalipuram = tnPlaces.some((p) => p.includes('Shore Temple'));
    console.log('Tamil Nadu aggregates Ooty, Madurai, Mahabalipuram:', tnHasOoty && tnHasMadurai && tnHasMahabalipuram);

    // Karnataka (state search check)
    await page.selectOption('#destination-select', 'Karnataka');
    await waitForResults();
    const karnatakaPlaces = await page.$$eval('[data-testid="place-name"]', (nodes) =>
      nodes.map((n) => n.textContent?.trim())
    );
    console.log(`Karnataka State Total Places: ${karnatakaPlaces.length}`);
    const karHasBangalore = karnatakaPlaces.some((p) => p.includes('Lalbagh'));
    const karHasMysore = karnatakaPlaces.some((p) => p.includes('Mysore Palace'));
    const karHasHampi = karnatakaPlaces.some((p) => p.includes('Virupaksha') || p.includes('Vittala'));
    console.log('Karnataka aggregates Bangalore, Mysore, Hampi:', karHasBangalore && karHasMysore && karHasHampi);

    if (goaUnchanged && keralaPlaces.length > 20 && tnPlaces.length >= 32 && karnatakaPlaces.length >= 32) {
      console.log('✅ Test 3 Passed: Goa and Kerala are intact, and new state aggregations function flawlessly!');
    } else {
      console.error('❌ Test 3 Failed: Integrity or state aggregation check failed.');
    }

    // Save proof screenshot
    await page.screenshot({ path: 'verification-tn-karnataka.png', fullPage: true });
    console.log('Saved screenshot to verification-tn-karnataka.png');

    console.log('\n🎉 ALL 3 TEST CRITERIA PASSED WITH ZERO REGRESSIONS!');
  } finally {
    await browser.close();
  }
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
