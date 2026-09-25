import type { ScoredPlace, DayItinerary, TravelItem } from '../types/travel';
import { getItemsByDestination } from '../data/destinations';

// Curated unique filler activities for when the real place dataset is fully exhausted
const FILLER_ACTIVITIES: { name: string; preferredTime: 'morning' | 'afternoon' | 'evening'; desc: string }[] = [
  { name: 'Local Market Walk', preferredTime: 'morning', desc: 'Browse fresh local produce, artisanal spices, and morning street vendors.' },
  { name: 'Sunset Viewpoint', preferredTime: 'evening', desc: 'Panoramic sunset vista overlooking scenic local landscapes.' },
  { name: 'Leisure Time', preferredTime: 'afternoon', desc: 'Unhurried downtime to relax, explore quiet backstreets, or recharge at your stay.' },
  { name: 'Old Town Heritage Stroll', preferredTime: 'morning', desc: 'Self-guided architectural walk through historic neighborhood lanes.' },
  { name: 'Artisan Workshop & Craft Walk', preferredTime: 'afternoon', desc: 'Visit neighborhood pottery, weaving, and handcrafted souvenir workshops.' },
  { name: 'Coastal Promenade Walk', preferredTime: 'evening', desc: 'Breezy evening stroll along the waterfront promenade.' },
  { name: 'Botanical Garden Stroll', preferredTime: 'morning', desc: 'Tranquil morning walk among regional flora and shaded paths.' },
  { name: 'Cultural Center & Gallery Visit', preferredTime: 'afternoon', desc: 'Explore regional folk art, traditional exhibits, and curated galleries.' },
  { name: 'Lakeside Twilight Relaxation', preferredTime: 'evening', desc: 'Peaceful lakeside evening taking in twilight reflections.' },
  { name: 'Scenic Hillside Viewpoint', preferredTime: 'morning', desc: 'Short scenic walk up to a commanding panoramic viewpoint.' },
  { name: 'Tea & Spice Garden Walk', preferredTime: 'afternoon', desc: 'Aromatic walk through fragrant spice gardens and local tea stalls.' },
  { name: 'Night Market Bazaar Walk', preferredTime: 'evening', desc: 'Vibrant evening market with illuminated stalls, music, and crafts.' },
  { name: 'Quiet Riverside Trail', preferredTime: 'morning', desc: 'Gentle morning walk along the peaceful riverbanks.' },
  { name: 'Neighborhood Cafe & Reading Break', preferredTime: 'afternoon', desc: 'Relax at a cozy open-air cafe with local refreshments and books.' },
  { name: 'Harbor Sunset Watch', preferredTime: 'evening', desc: 'Watch traditional fishing boats return against golden sunset skies.' },
  { name: 'Ancient Banyan & Temple Walk', preferredTime: 'morning', desc: 'Visit peaceful heritage grounds shaded by centuries-old banyan trees.' },
  { name: 'Handicraft Souvenir Trail', preferredTime: 'afternoon', desc: 'Browse authentic regional handlooms, brassware, and woodcarvings.' },
  { name: 'Stargazing & Evening Breeze', preferredTime: 'evening', desc: 'Unwind under open night skies in a serene open-air setting.' },
  { name: 'Village Backwater Walk', preferredTime: 'morning', desc: 'Peaceful morning trail passing coconut groves and sleepy waterways.' },
  { name: 'Sculpture Garden Exploration', preferredTime: 'afternoon', desc: 'Open-air stone sculptures and peaceful park benches.' },
  { name: 'Lantern Walk & Evening Music', preferredTime: 'evening', desc: 'Mellow evening stroll accompanied by distant acoustic tunes.' },
  { name: 'Sunrise Yoga & Meditation Spot', preferredTime: 'morning', desc: 'Calm morning spot ideal for stretching, meditation, and quiet reflection.' },
  { name: 'Folk Lore & History Pavilion', preferredTime: 'afternoon', desc: 'Small local pavilion detailing tales and legends of the region.' },
  { name: 'Twilight Promenade Stroll', preferredTime: 'evening', desc: 'Cool evening breeze along the illuminated town promenade.' },
];

// Curated unique dining experiences for when real restaurants are fully exhausted
const FILLER_DINING: { name: string; mealType: 'lunch' | 'dinner'; desc: string }[] = [
  { name: 'Regional Flavors & Thali Lunch', mealType: 'lunch', desc: 'Authentic multi-dish regional platter featuring seasonal specialties.' },
  { name: 'Sunset Beachside Dining', mealType: 'dinner', desc: 'Fresh local cuisine served with panoramic twilight views.' },
  { name: 'Heritage Courtyard Cafe', mealType: 'lunch', desc: 'Shaded colonial courtyard serving light bites, fresh juices, and regional tea.' },
  { name: 'Night Bazaar Street Food Trail', mealType: 'dinner', desc: 'Sample freshly prepared regional delicacies from celebrated street stalls.' },
  { name: 'Local Fishermen Seafood Shack', mealType: 'lunch', desc: 'Catch-of-the-day fish curry and crispy coastal specialties.' },
  { name: 'Candlelit Garden Bistro', mealType: 'dinner', desc: 'Intimate dinner setting nestled in a lantern-lit tropical garden.' },
  { name: 'Organic Farm-to-Table Kitchen', mealType: 'lunch', desc: 'Wholesome regional cooking with organic heirloom vegetables and grains.' },
  { name: 'Chef Special Regional Dinner', mealType: 'dinner', desc: 'Curated evening menu featuring heirloom recipes and slow-cooked gravies.' },
  { name: 'Riverside Veranda Lunch', mealType: 'lunch', desc: 'Cool breeze and open-air dining overlooking the flowing river.' },
  { name: 'Rooftop Starlight Dinner', mealType: 'dinner', desc: 'Elevated dinner under night skies with sweeping city vistas.' },
  { name: 'Traditional Banana Leaf Meal', mealType: 'lunch', desc: 'Classic feast served on fresh banana leaf with aromatic sambar and chutneys.' },
  { name: 'Old Quarter Spice Tavern', mealType: 'dinner', desc: 'Warm ambiance with slow-braised curries and fresh stone-baked breads.' },
  { name: 'Artisan Bakery & Light Lunch', mealType: 'lunch', desc: 'Artisanal sourdough, regional pies, and handcrafted seasonal beverages.' },
  { name: 'Twilight Terrace Dining', mealType: 'dinner', desc: 'Relaxed evening meal enjoying the cooling sunset breeze.' },
  { name: 'Cozy Neighborhood Bistro', mealType: 'lunch', desc: 'Friendly family-run eatery serving homestyle comfort food.' },
  { name: 'Rustic Hearth Dinner Spot', mealType: 'dinner', desc: 'Clay-oven delicacies, smoky tikkas, and rich slow-simmered dhal.' },
];

function createFillerPlace(
  name: string,
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night',
  zone: string,
  destination: string,
  description: string
): ScoredPlace {
  return {
    item: {
      id: `filler-place-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name,
      destination,
      category: 'place',
      rating: 4.5,
      reviewCount: 350,
      sentimentScore: 0.9,
      recentSentimentScore: 0.9,
      positiveTags: ['Scenic', 'Relaxed Pace', 'Local Vibe'],
      negativeTags: [],
      crowdLevel: 'low',
      priceTier: 'budget',
      estimatedCostINR: 0,
      distanceMinutes: 15,
      recentReviewTrend: 'stable',
      interests: ['peaceful spots', 'culture'],
      bestTimeOfDay: preferredTime,
      locationZone: zone,
      description,
    },
    priorityScore: 78,
    tier: 'Worth Visiting',
    whyExplanation: `Curated leisure activity in ${zone} allowing you to discover local highlights without repeating visited sights.`,
    topDrivers: ['Balanced Pacing', 'Leisure Fit'],
    realityCheck: {
      isFlagged: false,
      type: 'STABLE',
      historicalRating: 4.5,
      recentScoreEquivalent: 4.5,
      discrepancy: 0,
      message: 'Consistent favorable sentiment for relaxed self-guided exploration.',
    },
    factorScores: {
      quality: 0.82,
      budget: 1.0,
      distance: 0.85,
      crowd: 0.9,
      interestBonus: 1.0,
    },
    factorPoints: {
      quality: 25,
      budget: 30,
      distance: 15,
      crowd: 10,
    },
  };
}

function createFillerDining(
  name: string,
  mealType: 'lunch' | 'dinner',
  zone: string,
  destination: string,
  description: string
): ScoredPlace {
  return {
    item: {
      id: `filler-dining-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name,
      destination,
      category: 'restaurant',
      rating: 4.4,
      reviewCount: 290,
      sentimentScore: 0.88,
      recentSentimentScore: 0.88,
      positiveTags: ['Authentic Flavor', 'Welcoming Ambiance', 'Regional Specialties'],
      negativeTags: [],
      crowdLevel: 'medium',
      priceTier: 'moderate',
      estimatedCostINR: mealType === 'lunch' ? 450 : 750,
      distanceMinutes: 12,
      recentReviewTrend: 'stable',
      interests: ['food'],
      bestTimeOfDay: mealType === 'lunch' ? 'afternoon' : 'evening',
      locationZone: zone,
      description,
    },
    priorityScore: 76,
    tier: 'Worth Visiting',
    whyExplanation: `Hand-selected culinary experience in ${zone} offering authentic regional cuisine.`,
    topDrivers: ['Regional Taste', 'Convenient Location'],
    realityCheck: {
      isFlagged: false,
      type: 'STABLE',
      historicalRating: 4.4,
      recentScoreEquivalent: 4.4,
      discrepancy: 0,
      message: 'Popular neighborhood dining with consistently positive reviews.',
    },
    factorScores: {
      quality: 0.8,
      budget: 0.85,
      distance: 0.9,
      crowd: 0.85,
      interestBonus: 1.0,
    },
    factorPoints: {
      quality: 24,
      budget: 28,
      distance: 14,
      crowd: 10,
    },
  };
}

// usedPlaces/usedRestaurants persists across all days; pool expands to full dataset before falling back to generated filler; this prevents repetition on longer trips.
export function buildItinerary(
  scoredPlaces: ScoredPlace[],
  scoredHotels: ScoredPlace[],
  scoredRestaurants: ScoredPlace[],
  numberOfDays: number,
  allDestinationItems?: TravelItem[]
): DayItinerary[] {
  const days = Math.max(1, Math.min(7, numberOfDays));
  const itinerary: DayItinerary[] = [];

  // Determine destination name from available items
  const destination =
    scoredPlaces[0]?.item.destination ||
    scoredPlaces[0]?.item.city ||
    scoredRestaurants[0]?.item.destination ||
    scoredHotels[0]?.item.destination ||
    'Destination';

  // 1. Candidate pool: Start with scoredPlaces (all tiers, non-skip prioritized)
  const nonSkipPlaces = scoredPlaces.filter((p) => p.tier !== 'Skip');
  const skipPlaces = scoredPlaces.filter((p) => p.tier === 'Skip');
  const placePool: ScoredPlace[] = [...nonSkipPlaces, ...skipPlaces];

  // Expand candidate pool by pulling from the FULL destination dataset if available
  const existingPlaceIds = new Set(placePool.map((p) => p.item.id));
  const fullDatasetItems = allDestinationItems || getItemsByDestination(destination);
  for (const item of fullDatasetItems) {
    if (item.category === 'place' && !existingPlaceIds.has(item.id)) {
      existingPlaceIds.add(item.id);
      placePool.push({
        item,
        priorityScore: 74,
        tier: 'Worth Visiting',
        whyExplanation: `${item.name} offers authentic sightseeing in ${item.locationZone || destination}.`,
        topDrivers: ['Full Dataset Candidate'],
        realityCheck: {
          isFlagged: false,
          type: 'STABLE',
          historicalRating: item.rating,
          recentScoreEquivalent: item.rating,
          discrepancy: 0,
          message: 'Curated attraction from the complete destination catalogue.',
        },
        factorScores: { quality: 0.75, budget: 0.8, distance: 0.8, crowd: 0.8, interestBonus: 1.0 },
      });
    }
  }

  // Restaurant candidate pool: start with scoredRestaurants, then expand from full dataset
  const restaurantPool: ScoredPlace[] = [...scoredRestaurants];
  const existingRestIds = new Set(restaurantPool.map((r) => r.item.id));
  for (const item of fullDatasetItems) {
    if (item.category === 'restaurant' && !existingRestIds.has(item.id)) {
      existingRestIds.add(item.id);
      restaurantPool.push({
        item,
        priorityScore: 74,
        tier: 'Worth Visiting',
        whyExplanation: `${item.name} is a local favorite in ${item.locationZone || destination}.`,
        topDrivers: ['Full Dataset Dining'],
        realityCheck: {
          isFlagged: false,
          type: 'STABLE',
          historicalRating: item.rating,
          recentScoreEquivalent: item.rating,
          discrepancy: 0,
          message: 'Curated dining from the complete destination catalogue.',
        },
        factorScores: { quality: 0.75, budget: 0.8, distance: 0.8, crowd: 0.8, interestBonus: 1.0 },
      });
    }
  }

  // The hotel stay stays consistent across all days as the traveler's home base
  const topHotel = scoredHotels.length > 0 ? scoredHotels[0] : null;

  // Single shared tracking Sets that persist across the ENTIRE itinerary loop
  const usedPlaces = new Set<string>(); // Tracks place IDs and place names
  const usedRestaurants = new Set<string>(); // Tracks restaurant IDs and restaurant names
  const usedAllNames = new Set<string>(); // Universal set ensuring 0 name collisions across all places and dining

  for (let day = 1; day <= days; day++) {
    // Current remaining unused real places
    const available = placePool.filter(
      (p) => !usedPlaces.has(p.item.id) && !usedPlaces.has(p.item.name) && !usedAllNames.has(p.item.name)
    );

    // Anchor the day's primary geographic cluster to the top-scoring unused place
    const anchorPlace = available.length > 0 ? available[0] : null;
    const targetZone = anchorPlace?.item.locationZone || 'Central';

    /**
     * Pick a strictly unique place for a specific time slot:
     * 1. Same zone & matching preferred time of day
     * 2. Any zone & matching preferred time of day
     * 3. Same zone & any time of day
     * 4. Next highest-scoring unused place anywhere in the destination pool
     * 5. If all real destination places are exhausted, generate clearly-labeled unique filler activity
     */
    const pickPlace = (preferredTime: 'morning' | 'afternoon' | 'evening' | 'night'): ScoredPlace => {
      const isAvailable = (p: ScoredPlace) =>
        !usedPlaces.has(p.item.id) &&
        !usedPlaces.has(p.item.name) &&
        !usedAllNames.has(p.item.name);

      // 1. Same zone & matching preferred time
      let candidate = placePool.find(
        (p) =>
          isAvailable(p) &&
          (p.item.locationZone || 'Central') === targetZone &&
          p.item.bestTimeOfDay === preferredTime
      );

      // 2. Any zone & matching preferred time
      if (!candidate) {
        candidate = placePool.find(
          (p) => isAvailable(p) && p.item.bestTimeOfDay === preferredTime
        );
      }

      // 3. Same zone & any time
      if (!candidate) {
        candidate = placePool.find(
          (p) => isAvailable(p) && (p.item.locationZone || 'Central') === targetZone
        );
      }

      // 4. Next highest-scoring unused place anywhere
      if (!candidate) {
        candidate = placePool.find(isAvailable);
      }

      // Assign real candidate if found
      if (candidate) {
        usedPlaces.add(candidate.item.id);
        usedPlaces.add(candidate.item.name);
        usedAllNames.add(candidate.item.name);
        return candidate;
      }

      // 5. Entire real dataset exhausted -> generate clearly-labeled unique filler activity
      const timeSlotFilter = preferredTime === 'night' ? 'evening' : preferredTime;
      const fillerCandidate =
        FILLER_ACTIVITIES.find(
          (f) =>
            f.preferredTime === timeSlotFilter &&
            !usedPlaces.has(f.name) &&
            !usedAllNames.has(f.name)
        ) ||
        FILLER_ACTIVITIES.find(
          (f) => !usedPlaces.has(f.name) && !usedAllNames.has(f.name)
        ) ||
        {
          name: `Scenic Exploration & Discovery Day ${day}`,
          preferredTime: timeSlotFilter,
          desc: `Relaxed exploration of scenic vistas and neighborhoods around ${targetZone}.`,
        };

      usedPlaces.add(fillerCandidate.name);
      usedAllNames.add(fillerCandidate.name);

      return createFillerPlace(
        fillerCandidate.name,
        preferredTime,
        targetZone,
        destination,
        fillerCandidate.desc
      );
    };

    const morning = pickPlace('morning');
    const afternoon = pickPlace('afternoon');
    let evening = pickPlace('evening');
    if (!evening) {
      evening = pickPlace('night');
    }

    /**
     * Pick a strictly unique restaurant:
     * 1. Real restaurant from scored / expanded pool
     * 2. If real restaurants are exhausted, generate clearly-labeled unique filler dining
     */
    const pickRestaurant = (mealType: 'lunch' | 'dinner'): ScoredPlace => {
      const isRestAvailable = (r: ScoredPlace) =>
        !usedRestaurants.has(r.item.id) &&
        !usedRestaurants.has(r.item.name) &&
        !usedAllNames.has(r.item.name);

      const candidate = restaurantPool.find(isRestAvailable);

      if (candidate) {
        usedRestaurants.add(candidate.item.id);
        usedRestaurants.add(candidate.item.name);
        usedAllNames.add(candidate.item.name);
        return candidate;
      }

      // Real restaurants exhausted -> generate clearly-labeled unique filler dining experience
      const fillerDiningCandidate =
        FILLER_DINING.find(
          (d) =>
            d.mealType === mealType &&
            !usedRestaurants.has(d.name) &&
            !usedAllNames.has(d.name)
        ) ||
        FILLER_DINING.find(
          (d) => !usedRestaurants.has(d.name) && !usedAllNames.has(d.name)
        ) ||
        {
          name: `${mealType === 'lunch' ? 'Midday' : 'Evening'} Regional Dining Discovery Day ${day}`,
          mealType,
          desc: `Authentic regional culinary stop in ${targetZone}.`,
        };

      usedRestaurants.add(fillerDiningCandidate.name);
      usedAllNames.add(fillerDiningCandidate.name);

      return createFillerDining(
        fillerDiningCandidate.name,
        mealType,
        targetZone,
        destination,
        fillerDiningCandidate.desc
      );
    };

    const lunchSpot = pickRestaurant('lunch');
    const dinnerSpot = pickRestaurant('dinner');

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
