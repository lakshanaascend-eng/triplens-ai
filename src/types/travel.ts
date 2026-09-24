export type Interest = 'beaches' | 'food' | 'nature' | 'culture' | 'nightlife' | 'peaceful spots';

export type CrowdLevel = 'low' | 'medium' | 'high';

export type PriceTier = 'budget' | 'moderate' | 'luxury';

export type ReviewTrend = 'rising' | 'falling' | 'stable';

export type BestTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type PlaceCategory = 'place' | 'hotel' | 'restaurant';

export type Tier = 'Must Visit' | 'Worth Visiting' | 'If Time Allows' | 'Skip';

export interface TravelItem {
  id: string;
  name: string;
  destination: string;
  city?: string;
  state?: string;
  category: PlaceCategory;
  rating: number; // e.g., 4.6
  reviewCount: number; // e.g., 2800
  sentimentScore: number; // 0.0 - 1.0 (historical positive sentiment ratio)
  recentSentimentScore: number; // 0.0 - 1.0 (recent reviews sentiment ratio)
  positiveTags: string[];
  negativeTags: string[];
  crowdLevel: CrowdLevel;
  priceTier: PriceTier;
  estimatedCostINR: number; // per person/night
  distanceMinutes: number; // transit time from hub in minutes
  recentReviewTrend: ReviewTrend;
  interests: Interest[];
  bestTimeOfDay: BestTimeOfDay;
  locationZone: string;
  description: string;
}

export interface UserPreferences {
  destination: string;
  numberOfDays: number;
  budgetINR: number;
  interests: Interest[];
  crowdTolerance: CrowdLevel;
  priorityWeights: {
    rating: number; // 1 to 5 or 0 to 100
    budget: number;
    distance: number;
    crowd: number;
  };
}

export interface RealityCheckResult {
  isFlagged: boolean;
  type: 'WARNING' | 'IMPROVING' | 'STABLE';
  historicalRating: number;
  recentScoreEquivalent: number;
  discrepancy: number;
  message: string;
}

export interface ScoredPlace {
  item: TravelItem;
  priorityScore: number; // 0 - 100
  tier: Tier;
  whyExplanation: string;
  topDrivers: string[];
  realityCheck: RealityCheckResult;
  factorScores: {
    quality: number; // 0 - 1
    budget: number; // 0 - 1
    distance: number; // 0 - 1
    crowd: number; // 0 - 1
    interestBonus: number; // multiplier factor
  };
}

export interface DayItinerary {
  dayNumber: number;
  themeZone: string;
  morning: ScoredPlace | null;
  afternoon: ScoredPlace | null;
  evening: ScoredPlace | null;
  lunchSpot: ScoredPlace | null;
  dinnerSpot: ScoredPlace | null;
  recommendedHotel: ScoredPlace | null;
}
