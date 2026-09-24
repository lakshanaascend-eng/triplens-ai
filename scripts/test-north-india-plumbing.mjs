import { chromium } from 'playwright';

const runTests = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let passed = true;

  try {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');

    console.log('--- TEST 1: Fallback (Jaipur) ---');
    await page.selectOption('#destination-select', 'Jaipur');
    await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Check for fallback badge
    const badge = await page.locator('span:has-text("FALLBACK DATA")').isVisible();
    if (badge) {
      console.log('✅ Fallback badge visible');
    } else {
      console.error('❌ Fallback badge NOT visible');
      passed = false;
    }

    const jaipurItems = await page.$$('.place-card');
    if (jaipurItems.length > 0) {
      console.log(`✅ Jaipur fallback loaded correctly (${jaipurItems.length} items)`);
    } else {
      console.error(`❌ Jaipur fallback failed to load`);
      passed = false;
    }

    console.log('\n--- TEST 2: South India (Goa) ---');
    await page.selectOption('#destination-select', 'Goa');
    await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    const goaBadgeAPI = await page.locator('span:has-text("LIVE API DATA")').isVisible();
    const goaBadgeFallback = await page.locator('span:has-text("FALLBACK DATA")').isVisible();
    if (!goaBadgeAPI && !goaBadgeFallback) {
      console.log('✅ Goa properly identified as static (no badge)');
    } else {
      console.error('❌ Goa incorrectly showed API or Fallback badge');
      passed = false;
    }

    const goaItems = await page.$$('.place-card');
    if (goaItems.length > 0) {
      console.log(`✅ Goa loaded correctly (${goaItems.length} items)`);
    } else {
      console.error(`❌ Goa failed to load`);
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
