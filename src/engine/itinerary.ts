import type { ScoredPlace, DayItinerary } from '../types/travel';

export function buildItinerary(
  scoredPlaces: ScoredPlace[],
  scoredHotels: ScoredPlace[],
  scoredRestaurants: ScoredPlace[],
  numberOfDays: number
): DayItinerary[] {
  const days = Math.max(1, Math.min(7, numberOfDays));
  const itinerary: DayItinerary[] = [];

  // Filter out Skip places for the itinerary
  const candidatePlaces = scoredPlaces.filter((p) => p.tier !== 'Skip');
  // If not enough places, fallback to all places
  const pool = candidatePlaces.length >= days ? candidatePlaces : scoredPlaces;

  const topHotel = scoredHotels.length > 0 ? scoredHotels[0] : null;

  const usedPlaceIds = new Set<string>();

  for (let day = 1; day <= days; day++) {
    const available = pool.filter((p) => !usedPlaceIds.has(p.item.id));
    
    // Anchor the day's focus zone to the highest-ranked place currently available
    const anchorPlace = available.length > 0 ? available[0] : (pool.length > 0 ? pool[0] : null);
    const targetZone = anchorPlace?.item.locationZone || 'Central';

    const pickPlace = (preferredTime: 'morning' | 'afternoon' | 'evening' | 'night') => {
      let poolToUse = pool.filter(p => !usedPlaceIds.has(p.item.id) && (p.item.locationZone || 'Central') === targetZone);
      // Fallback to globally available if zone is exhausted
      if (poolToUse.length === 0) {
        poolToUse = pool.filter(p => !usedPlaceIds.has(p.item.id));
      }
      if (poolToUse.length === 0) return null;

      let pick = poolToUse.find(p => p.item.bestTimeOfDay === preferredTime) || poolToUse[0];
      if (pick) usedPlaceIds.add(pick.item.id);
      return pick;
    };

    let morning = pickPlace('morning');
    let afternoon = pickPlace('afternoon');
    let evening = pickPlace('evening');
    
    if (!evening) {
      evening = pickPlace('night');
    }

    // If day ran out of distinct places completely, cycle gracefully to avoid empty slots in UI
    if (!morning && pool.length > 0) morning = pool[(day * 3 - 3) % pool.length];
    if (!afternoon && pool.length > 1) afternoon = pool[(day * 3 - 2) % pool.length];
    if (!evening && pool.length > 2) evening = pool[(day * 3 - 1) % pool.length];

    // Restaurants for lunch and dinner
    const lunchSpot =
      scoredRestaurants.length > 0
        ? scoredRestaurants[(day - 1) % scoredRestaurants.length]
        : null;
    const dinnerSpot =
      scoredRestaurants.length > 1
        ? scoredRestaurants[day % scoredRestaurants.length]
        : lunchSpot;

    // Dynamically name the day based on the actual picked places
    const dayPlaces = [morning, afternoon, evening].filter(Boolean) as ScoredPlace[];
    const uniqueZones = Array.from(new Set(dayPlaces.map(p => p.item.locationZone).filter(Boolean)));
    const uniqueInterests = Array.from(new Set(dayPlaces.flatMap(p => p.item.interests).filter(Boolean)));

    let themeZone = 'City Highlights';
    if (uniqueZones.length === 1 && uniqueZones[0]) {
      // All places are in the same zone
      themeZone = `${uniqueZones[0]} Focus`;
    } else if (uniqueZones.length === 2) {
      // Spans exactly two zones
      themeZone = `${uniqueZones[0]} & ${uniqueZones[1]}`;
    } else if (uniqueInterests.length >= 2) {
      // 3+ zones, fallback to interest themes
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
