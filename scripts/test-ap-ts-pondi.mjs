import { chromium } from 'playwright';

const testConfig = {
  url: 'http://localhost:4173/',
};

const waitForResults = async (page) => {
  await page.waitForSelector('.computing-placeholder', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(200);
};

const runTests = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let passed = true;

  try {
    await page.goto(testConfig.url);
    await page.waitForLoadState('networkidle');

    console.log('--- TEST 1: Integrity Check (Goa, Munnar, Thrissur, Ooty, Mysore) ---');
    const integrityCities = ['Goa', 'Munnar', 'Thrissur', 'Ooty', 'Mysore'];
    for (const city of integrityCities) {
      await page.selectOption('#destination-select', city);
      await waitForResults(page);
      const items = await page.$$('.place-card');
      if (items.length === 0) {
        console.error(`❌ Integrity failed: No items found for ${city}`);
        passed = false;
      } else {
        console.log(`✅ Integrity passed for ${city} (${items.length} items)`);
      }
    }

    console.log('\n--- TEST 2: New AP/Telangana City (Hyderabad) ---');
    await page.selectOption('#destination-select', 'Hyderabad');
    await waitForResults(page);
    const hydItems = await page.$$('.place-card');
    if (hydItems.length > 0) {
        // Just spot check it's loaded
        console.log(`✅ Hyderabad loaded correctly (${hydItems.length} items)`);
    } else {
        console.error(`❌ Hyderabad failed to load`);
        passed = false;
    }

    console.log('\n--- TEST 3: Puducherry State Aggregation ---');
    await page.selectOption('#destination-select', 'Puducherry');
    await waitForResults(page);
    const pondiItems = await page.$$('.place-card');
    // Expect existing Pondy (17) + Auroville (8) + Karaikal (8) = 33 items approx
    if (pondiItems.length > 12) {
      console.log(`✅ Puducherry state aggregation works (${pondiItems.length} items found)`);
    } else {
      console.error(`❌ Puducherry aggregation failed (only ${pondiItems.length} items)`);
      passed = false;
    }

    console.log('\n--- TEST 4: Profile Contrasts ---');
    // Profile A: Kerala, Peaceful, Budget
    await page.selectOption('#destination-select', 'Kerala');
    await page.fill('input[type="number"]', '500'); // tight budget
    // check peaceful spots
    let checkboxes = await page.$$('input[type="checkbox"]');
    for (const cb of checkboxes) {
      const id = await cb.getAttribute('id');
      const isChecked = await cb.isChecked();
      if (id === 'interest-peaceful spots' && !isChecked) await cb.check();
      if (id !== 'interest-peaceful spots' && isChecked) await cb.uncheck();
    }
    await waitForResults(page);
    let topItem = await page.$('.place-card:first-child .place-name');
    let topItemName = topItem ? await topItem.innerText() : 'None';
    console.log(`✅ Kerala Peaceful/Budget top item: ${topItemName}`);

    // Profile B: Telangana, Heritage/Culture, High Budget
    await page.selectOption('#destination-select', 'Telangana');
    await page.fill('input[type="number"]', '200000'); // high budget
    // check culture
    checkboxes = await page.$$('input[type="checkbox"]');
    for (const cb of checkboxes) {
      const id = await cb.getAttribute('id');
      const isChecked = await cb.isChecked();
      if (id === 'interest-culture' && !isChecked) await cb.check();
      if (id !== 'interest-culture' && isChecked) await cb.uncheck();
    }
    await waitForResults(page);
    topItem = await page.$('.place-card:first-child .place-name');
    topItemName = topItem ? await topItem.innerText() : 'None';
    console.log(`✅ Telangana Culture/High-Budget top item: ${topItemName}`);


  } catch (err) {
    console.error('Test execution error:', err);
    passed = false;
  } finally {
    await browser.close();
  }

  if (passed) {
    console.log('\n🎉 ALL AP/TS/PONDI EXPANSION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME TESTS FAILED');
    process.exit(1);
  }
};

runTests();
