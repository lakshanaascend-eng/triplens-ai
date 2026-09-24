import { chromium } from 'playwright';

const runTests = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let passed = true;

  try {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');

    console.log('--- TEST 1: North India Curated Data (Jaipur, Manali, Varanasi) ---');
    const cities = ['Jaipur', 'Manali', 'Varanasi'];
    for (const city of cities) {
      await page.selectOption('#destination-select', city);
      await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);

      const badge = await page.locator('span:has-text("CURATED DATA")').isVisible();
      if (badge) {
        console.log(`✅ ${city}: Curated badge visible`);
      } else {
        console.error(`❌ ${city}: Curated badge NOT visible`);
        passed = false;
      }

      const items = await page.$$('.place-card');
      if (items.length > 0) {
        console.log(`✅ ${city} loaded correctly (${items.length} places)`);
      } else {
        console.error(`❌ ${city} failed to load places`);
        passed = false;
      }
    }

    console.log('\n--- TEST 2: South India Static (Kerala) ---');
    await page.selectOption('#destination-select', 'Kerala');
    await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    const curatedBadge = await page.locator('span:has-text("CURATED DATA")').isVisible();
    const fallbackBadge = await page.locator('span:has-text("FALLBACK DATA")').isVisible();
    const apiBadge = await page.locator('span:has-text("LIVE API")').isVisible();
    if (!curatedBadge && !fallbackBadge && !apiBadge) {
      console.log('✅ Kerala properly identified as static (no badge)');
    } else {
      console.error('❌ Kerala incorrectly showed a data badge');
      passed = false;
    }

    const keralaItems = await page.$$('.place-card');
    if (keralaItems.length > 0) {
      console.log(`✅ Kerala loaded correctly (${keralaItems.length} places)`);
    } else {
      console.error(`❌ Kerala failed to load`);
      passed = false;
    }

  } catch (err) {
    console.error('Test error:', err);
    passed = false;
  } finally {
    await browser.close();
  }

  if (passed) {
    console.log('\n🎉 ALL TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME TESTS FAILED');
    process.exit(1);
  }
};

runTests();
