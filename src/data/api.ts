import type { TravelItem, Interest } from '../types/travel';
import northIndiaData from './north-india.json';

// Fallback data to use if API fails or key is missing (Kept for structural integrity)
const FALLBACK_DATA: TravelItem[] = [
  {
    id: 'jaipur-p1',
    name: 'Amer Fort (Fallback)',
    destination: 'Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'place',
    rating: 4.8,
    reviewCount: 45000,
    sentimentScore: 0.95,
    recentSentimentScore: 0.96,
    recentReviewTrend: 'stable',
    positiveTags: ['Majestic architecture', 'Elephant rides', 'Stunning views'],
    negativeTags: ['Very crowded', 'Aggressive guides'],
    crowdLevel: 'high',
    priceTier: 'moderate',
    estimatedCostINR: 500,
    distanceMinutes: 30,
    interests: ['culture', 'peaceful spots'],
    bestTimeOfDay: 'morning',
    locationZone: 'Amer',
    description: 'Iconic hilltop fort complex built of red sandstone and marble.'
  }
];

export async function fetchLiveDestinationData(destination: string): Promise<{ items: TravelItem[], source: 'api' | 'fallback' | 'curated' }> {
  const apiKey = import.meta.env.VITE_PLACES_API_KEY;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // If there's an API key, we *could* fetch live data.
  // But per instructions, we are using curated hand-seeded data for North India instead,
  // while keeping this plumbing in place for future use.
  
  const query = destination.trim().toLowerCase();
  
  // Try to find the destination in our curated North India dataset
  const curatedItems = (northIndiaData as TravelItem[]).filter(
    item => item.destination.toLowerCase() === query || 
            item.city?.toLowerCase() === query ||
            item.state?.toLowerCase() === query
  );

  if (curatedItems.length > 0) {
    console.log(`[TripLens API] Found ${curatedItems.length} curated items for ${destination}.`);
    return { items: curatedItems, source: 'curated' };
  }

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.warn(`[TripLens API] No valid VITE_PLACES_API_KEY found. Returning fallback data for ${destination}.`);
    return { items: FALLBACK_DATA, source: 'fallback' };
  }

  // --- UNUSED LIVE API FETCH PATH ---
  try {
    console.log(`[TripLens API] Fetching live data from Google Places API for ${destination}...`);
    // Example endpoint for Text Search API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=top+places+to+visit+in+${encodeURIComponent(destination)}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results) {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

    // Mapping function to convert API response into existing South India schema
    const mappedItems: TravelItem[] = data.results.slice(0, 6).map((place: any, index: number) => {
      const rating = place.rating || 4.0;
      const reviewCount = place.user_ratings_total || 100;
      
      const sentimentScore = Math.max(0, Math.min(1, rating / 5.0 - 0.05));
      const mockInterests: Interest[] = ['culture'];
      if (place.types?.includes('park') || place.types?.includes('natural_feature')) mockInterests.push('nature');
      if (place.types?.includes('restaurant')) mockInterests.push('food');

      return {
        id: `live-${destination}-${index}`,
        name: place.name,
        destination: destination,
        city: destination,
        state: 'North India', // Placeholder state
        category: place.types?.includes('restaurant') ? 'restaurant' : (place.types?.includes('lodging') ? 'hotel' : 'place'),
        rating: rating,
        reviewCount: reviewCount,
        sentimentScore: sentimentScore,
        recentSentimentScore: sentimentScore, 
        recentReviewTrend: 'stable',
        positiveTags: ['Popular spot', 'Great atmosphere'], // Derived mock
        negativeTags: ['Can get crowded'], // Derived mock
        crowdLevel: reviewCount > 5000 ? 'high' : 'medium',
        priceTier: 'moderate',
        estimatedCostINR: 500,
        distanceMinutes: 15,
        interests: mockInterests,
        bestTimeOfDay: 'afternoon',
        locationZone: 'City Center',
        description: place.formatted_address || `Live API result for ${place.name}`
      };
    });

    return { items: mappedItems, source: 'api' };
  } catch (error) {
    console.error(`[TripLens API] Fetch failed:`, error);
    console.warn(`[TripLens API] Falling back to placeholder data for ${destination}.`);
    return { items: FALLBACK_DATA, source: 'fallback' };
  }
}
