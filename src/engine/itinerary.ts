import type { ScoredPlace, DayItinerary } from '../types/travel';

export function buildItinerary(
  scoredPlaces: ScoredPlace[],
  scoredHotels: ScoredPlace[],
  scoredRestaurants: ScoredPlace[],
  numberOfDays: number
): DayItinerary[] {
  const days = Math.max(1, Math.min(7, numberOfDays));
  const itinerary: DayItinerary[] = [];

  // Prioritize non-Skip places first; fallback to next-best lower tier if needed
  const nonSkipPlaces = scoredPlaces.filter((p) => p.tier !== 'Skip');
  const skipPlaces = scoredPlaces.filter((p) => p.tier === 'Skip');
  const placePool: ScoredPlace[] = [...nonSkipPlaces, ...skipPlaces];

  // The hotel stay stays consistent across all days as the traveler's home base
  const topHotel = scoredHotels.length > 0 ? scoredHotels[0] : null;

  // Strict global exclusion sets to guarantee NO repeated attractions or dining spots
  const usedPlaceIds = new Set<string>();
  const usedRestaurantIds = new Set<string>();

  for (let day = 1; day <= days; day++) {
    // Current remaining unused places
    const available = placePool.filter((p) => !usedPlaceIds.has(p.item.id));

    // Anchor the day's primary geographic cluster to the top-scoring unused place
    const anchorPlace = available.length > 0 ? available[0] : null;
    const targetZone = anchorPlace?.item.locationZone || 'Central';

    /**
     * Pick a strictly unique place for a specific time slot:
     * 1. Same zone & matching preferred time of day
     * 2. Any zone & matching preferred time of day
     * 3. Same zone & any time of day
     * 4. Next highest-scoring unused place anywhere
     * If all unique places are exhausted, returns null (never repeats a place).
     */
    const pickPlace = (preferredTime: 'morning' | 'afternoon' | 'evening' | 'night'): ScoredPlace | null => {
      // 1. Same zone & matching preferred time
      let candidate = placePool.find(
        (p) =>
          !usedPlaceIds.has(p.item.id) &&
          (p.item.locationZone || 'Central') === targetZone &&
          p.item.bestTimeOfDay === preferredTime
      );

      // 2. Any zone & matching preferred time
      if (!candidate) {
        candidate = placePool.find(
          (p) => !usedPlaceIds.has(p.item.id) && p.item.bestTimeOfDay === preferredTime
        );
      }

      // 3. Same zone & any time
      if (!candidate) {
        candidate = placePool.find(
          (p) =>
            !usedPlaceIds.has(p.item.id) &&
            (p.item.locationZone || 'Central') === targetZone
        );
      }

      // 4. Next highest-scoring unused place anywhere
      if (!candidate) {
        candidate = placePool.find((p) => !usedPlaceIds.has(p.item.id));
      }

      if (candidate) {
        usedPlaceIds.add(candidate.item.id);
        return candidate;
      }

      return null;
    };

    const morning = pickPlace('morning');
    const afternoon = pickPlace('afternoon');
    let evening = pickPlace('evening');
    if (!evening) {
      evening = pickPlace('night');
    }

    // Restaurants for lunch and dinner: strictly unique selections across all days
    const availableRestaurantsForLunch = scoredRestaurants.filter(
      (r) => !usedRestaurantIds.has(r.item.id)
    );
    const lunchSpot = availableRestaurantsForLunch.length > 0 ? availableRestaurantsForLunch[0] : null;
    if (lunchSpot) {
      usedRestaurantIds.add(lunchSpot.item.id);
    }

    const availableRestaurantsForDinner = scoredRestaurants.filter(
      (r) => !usedRestaurantIds.has(r.item.id)
    );
    const dinnerSpot = availableRestaurantsForDinner.length > 0 ? availableRestaurantsForDinner[0] : null;
    if (dinnerSpot) {
      usedRestaurantIds.add(dinnerSpot.item.id);
    }

    // Dynamically name the day based on the actual picked places
    const dayPlaces = [morning, afternoon, evening].filter(Boolean) as ScoredPlace[];
    const uniqueZones = Array.from(
      new Set(dayPlaces.map((p) => p.item.locationZone).filter(Boolean))
    );
    const uniqueInterests = Array.from(
      new Set(dayPlaces.flatMap((p) => p.item.interests).filter(Boolean))
    );

    let themeZone = 'City Highlights';
    if (dayPlaces.length === 0) {
      themeZone = 'Leisure & Open Exploration';
    } else if (uniqueZones.length === 1 && uniqueZones[0]) {
      themeZone = `${uniqueZones[0]} Focus`;
    } else if (uniqueZones.length === 2) {
      themeZone = `${uniqueZones[0]} & ${uniqueZones[1]}`;
    } else if (uniqueInterests.length >= 2) {
      themeZone = `${uniqueInterests[0]} & ${uniqueInterests[1]} Highlights`;
    } else {
      themeZone = 'Mixed Exploration';
    }

    itinerary.push({
      dayNumber: day,
      themeZone,
      morning,
      afternoon,
      evening,
      lunchSpot,
      dinnerSpot,
      recommendedHotel: topHotel,
    });
  }

  return itinerary;
}
