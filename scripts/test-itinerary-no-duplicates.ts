import { getItemsByDestination } from '../src/data/destinations';
import { scoreAllDestinationItems } from '../src/engine/scorer';
import { buildItinerary } from '../src/engine/itinerary';
import type { UserPreferences } from '../src/types/travel';

const destinationsToTest = ['Goa', 'Munnar', 'Pondicherry'];
const testDays = [1, 3, 5, 7];

console.log('═══════════════════════════════════════════════════════════════════════');
console.log('       TRIPLENS AI: DAY-BY-DAY ITINERARY UNIQUENESS TEST               ');
console.log('═══════════════════════════════════════════════════════════════════════\n');

let allPassed = true;

for (const dest of destinationsToTest) {
  console.log(`\n▶ Testing Destination: "${dest}"`);
  const items = getItemsByDestination(dest);

  const preferences: UserPreferences = {
    destination: dest,
    numberOfDays: 7,
    budgetINR: 25000,
    interests: ['beaches', 'food', 'nature', 'culture', 'peaceful spots'],
    crowdTolerance: 'medium',
    priorityWeights: { rating: 4, budget: 5, distance: 3, crowd: 2 },
  };

  const { places, hotels, restaurants } = scoreAllDestinationItems(items, preferences);

  for (const days of testDays) {
    const itinerary = buildItinerary(places, hotels, restaurants, days, items);

    // Extract all assigned place names (morning, afternoon, evening) and restaurant names (lunchSpot, dinnerSpot)
    const assignedItems: { day: number; slot: string; name: string }[] = [];
    const allNames: string[] = [];

    for (const day of itinerary) {
      if (day.morning?.item?.name) {
        assignedItems.push({ day: day.dayNumber, slot: 'morning', name: day.morning.item.name });
        allNames.push(day.morning.item.name);
      }
      if (day.afternoon?.item?.name) {
        assignedItems.push({ day: day.dayNumber, slot: 'afternoon', name: day.afternoon.item.name });
        allNames.push(day.afternoon.item.name);
      }
      if (day.evening?.item?.name) {
        assignedItems.push({ day: day.dayNumber, slot: 'evening', name: day.evening.item.name });
        allNames.push(day.evening.item.name);
      }
      if (day.lunchSpot?.item?.name) {
        assignedItems.push({ day: day.dayNumber, slot: 'lunchSpot', name: day.lunchSpot.item.name });
        allNames.push(day.lunchSpot.item.name);
      }
      if (day.dinnerSpot?.item?.name) {
        assignedItems.push({ day: day.dayNumber, slot: 'dinnerSpot', name: day.dinnerSpot.item.name });
        allNames.push(day.dinnerSpot.item.name);
      }
    }

    // Check for duplicates
    const counts = new Map<string, number>();
    const duplicates: string[] = [];
    for (const name of allNames) {
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    for (const [name, count] of counts.entries()) {
      if (count > 1) {
        duplicates.push(`${name} (repeated ${count}x)`);
      }
    }

    const expectedSlots = days * 5; // 3 places + 2 restaurants per day
    const hasZeroDuplicates = duplicates.length === 0 && allNames.length === new Set(allNames).size;
    const hasAllSlotsFilled = allNames.length === expectedSlots;

    if (hasZeroDuplicates && hasAllSlotsFilled) {
      console.log(
        `  ✅ [${days} Days] PASSED: ${allNames.length}/${expectedSlots} slots filled, ZERO duplicates across places & restaurants.`
      );
    } else {
      allPassed = false;
      console.error(
        `  ❌ [${days} Days] FAILED! Found duplicates:`,
        duplicates,
        `Total slots filled: ${allNames.length}/${expectedSlots}`
      );
    }

    // Print sample of day 1 and last day assignments
    if (days === 7) {
      console.log('     Detailed Day-by-Day Assignments for 7-Day Trip:');
      for (const day of itinerary) {
        console.log(
          `       Day ${day.dayNumber} [${day.themeZone}]: Morning: "${day.morning?.item.name}" | Lunch: "${day.lunchSpot?.item.name}" | Afternoon: "${day.afternoon?.item.name}" | Evening: "${day.evening?.item.name}" | Dinner: "${day.dinnerSpot?.item.name}"`
        );
      }
    }
  }
}

console.log('\n═══════════════════════════════════════════════════════════════════════');
if (allPassed) {
  console.log('🎉 ALL TESTS PASSED: 1, 3, 5, and 7-day itineraries have ZERO duplicates!');
} else {
  console.error('❌ SOME TESTS FAILED: Duplicate attractions or restaurants detected.');
  process.exit(1);
}
console.log('═══════════════════════════════════════════════════════════════════════\n');
