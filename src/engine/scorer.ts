import type {
  TravelItem,
  UserPreferences,
  ScoredPlace,
  RealityCheckResult,
  Tier,
  PlaceCategory,
} from '../types/travel';

/**
 * Step 1: Normalize metrics to 0 - 1 scale
 */
export function normalizeRating(rating: number): number {
  // Scale from 2.5 - 5.0 to 0 - 1
  return Math.max(0, Math.min(1, (rating - 2.5) / 2.5));
}

export function normalizeQuality(rating: number, sentimentScore: number): number {
  const normRating = normalizeRating(rating);
  const normSentiment = Math.max(0, Math.min(1, sentimentScore));
  return 0.65 * normRating + 0.35 * normSentiment;
}

export function normalizeDistance(distanceMinutes: number): number {
  // 0 mins -> 1.0, 90+ mins -> ~0.05
  return Math.max(0.05, Math.min(1.0, 1 - distanceMinutes / 90));
}

export function normalizeCrowd(
  crowdLevel: 'low' | 'medium' | 'high',
  userTolerance: 'low' | 'medium' | 'high'
): number {
  if (userTolerance === 'low') {
    if (crowdLevel === 'low') return 1.0;
    if (crowdLevel === 'medium') return 0.5;
    return 0.1; // high crowd penalized
  }
  if (userTolerance === 'medium') {
    if (crowdLevel === 'low') return 0.85;
    if (crowdLevel === 'medium') return 1.0;
    return 0.5;
  }
  // high crowd tolerance
  if (crowdLevel === 'low') return 0.7;
  if (crowdLevel === 'medium') return 0.9;
  return 1.0; // loves high energy / buzzing spots
}

export function normalizeCost(
  itemCost: number,
  category: PlaceCategory,
  userBudgetINR: number,
  days: number
): number {
  const dailyBudget = Math.max(10, userBudgetINR / Math.max(1, days));

  let expectedCategoryBudget = dailyBudget * 0.3; // places default
  if (category === 'hotel') expectedCategoryBudget = dailyBudget * 0.55;
  if (category === 'restaurant') expectedCategoryBudget = dailyBudget * 0.25;

  // If cost is within or below expected category budget, score near 1.0
  if (itemCost <= expectedCategoryBudget) {
    return Math.max(0.7, 1.0 - (itemCost / expectedCategoryBudget) * 0.2);
  }

  // If item exceeds category budget, decay score smoothly
  const ratio = itemCost / expectedCategoryBudget;
  return Math.max(0.05, Math.min(1.0, 1.0 / ratio));
}

/**
 * Step 4: Rating Reality Check calculation
 */
export function computeRealityCheck(item: TravelItem): RealityCheckResult {
  const recentScoreEquivalent = Number((item.recentSentimentScore * 5).toFixed(1));
  const discrepancy = Number((item.rating - recentScoreEquivalent).toFixed(2));

  // Flag if recent sentiment has notably dropped
  if (discrepancy >= 0.65 || (item.recentReviewTrend === 'falling' && discrepancy >= 0.4)) {
    const issues = item.negativeTags.slice(0, 2).join(', ');
    return {
      isFlagged: true,
      type: 'WARNING',
      historicalRating: item.rating,
      recentScoreEquivalent,
      discrepancy,
      message: `Rating Reality Check: Overall ${item.rating}★, but recent traveler reviews drop to ~${recentScoreEquivalent}★ (${item.recentReviewTrend}). Recent complaints note: "${issues}".`,
    };
  }

  // IMPROVING: recent sentiment must GENUINELY outperform historical rating.
  // The 'rising' trend label alone is not sufficient — the numbers must back it up.
  const recentLeadsBy = recentScoreEquivalent - item.rating;
  if (recentLeadsBy >= 0.2 || (item.recentReviewTrend === 'rising' && recentLeadsBy > 0)) {
    return {
      isFlagged: false,
      type: 'IMPROVING',
      historicalRating: item.rating,
      recentScoreEquivalent,
      discrepancy,
      message: `Trending Upward: Recent review sentiment (~${recentScoreEquivalent}★) outperforms the historical ${item.rating}★ rating.`,
    };
  }

  return {
    isFlagged: false,
    type: 'STABLE',
    historicalRating: item.rating,
    recentScoreEquivalent,
    discrepancy,
    message: `Consistent Quality: Recent traveler sentiment (~${recentScoreEquivalent}★) aligns with historical ratings.`,
  };
}

/**
 * Step 3: Explainable AI "Why this place?" driver generator
 */
type DriverType = 'interest' | 'quality' | 'crowd' | 'budget' | 'distance' | 'trend';

interface Driver {
  type: DriverType;
  score: number;
  label: string;
  shortLabel: string;
  context?: string;
}

export function generateWhyExplanation(
  item: TravelItem,
  prefs: UserPreferences,
  factors: {
    quality: number;
    budget: number;
    distance: number;
    crowd: number;
    interestBonus: number;
  },
  matchingInterests: string[]
): { explanation: string; topDrivers: string[] } {
  const driverCandidates: Driver[] = [];

  if (matchingInterests.length > 0) {
    driverCandidates.push({
      type: 'interest',
      score: 0.95 + matchingInterests.length * 0.1,
      label: `Matches your interest in ${matchingInterests.join(' & ')}`,
      shortLabel: `a strong match for ${matchingInterests.join(' & ')}`,
      context: matchingInterests.join(' & ')
    });
  }

  if (item.rating >= 4.3 || factors.quality >= 0.70) {
    driverCandidates.push({
      type: 'quality',
      score: factors.quality * (prefs.priorityWeights.rating / 5),
      label: `Top-tier historical rating (${item.rating}★) & reviews`,
      shortLabel: `a stellar ${item.rating}★ track record`,
      context: `${item.rating}★`
    });
  }

  const crowdDesc = item.crowdLevel === 'low'
    ? 'peaceful, uncrowded setting'
    : item.crowdLevel === 'medium'
    ? 'balanced, moderate visitor pace'
    : 'lively, buzzing energy';

  if (factors.crowd >= 0.75) {
    driverCandidates.push({
      type: 'crowd',
      score: factors.crowd * (prefs.priorityWeights.crowd / 5),
      label: `${crowdDesc.charAt(0).toUpperCase() + crowdDesc.slice(1)} fits your preference`,
      shortLabel: `an appealing ${crowdDesc}`,
      context: crowdDesc
    });
  }

  if (factors.budget >= 0.75) {
    driverCandidates.push({
      type: 'budget',
      score: factors.budget * (prefs.priorityWeights.budget / 5),
      label: `Comfortably within budget (est. ₹${item.estimatedCostINR.toLocaleString()})`,
      shortLabel: `an accommodating ₹${item.estimatedCostINR.toLocaleString()} price point`,
      context: `₹${item.estimatedCostINR.toLocaleString()}`
    });
  }

  if (item.distanceMinutes <= 35 || factors.distance >= 0.60) {
    driverCandidates.push({
      type: 'distance',
      score: factors.distance * (prefs.priorityWeights.distance / 5),
      label: `Short ${item.distanceMinutes}-min transit time from hub`,
      shortLabel: `a quick ${item.distanceMinutes}-min transit time`,
      context: `${item.distanceMinutes} mins`
    });
  }

  if (item.recentReviewTrend === 'rising') {
    driverCandidates.push({
      type: 'trend',
      score: 0.82,
      label: `Surging positive recent traveler reviews`,
      shortLabel: `rising recent review sentiment`,
      context: `review momentum`
    });
  }

  // Sort drivers by relative score
  driverCandidates.sort((a, b) => b.score - a.score);

  const idHash = item.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  if (driverCandidates.length === 0) {
    const fallbacks = [
      `Solid all-around performer across ratings, transit, and price point — a dependable itinerary fit.`,
      `Balanced metrics with no major drawbacks: reasonable transit, predictable cost, and respectable ratings.`,
      `A well-rounded inclusion that holds steady across comfort, distance, and budget.`
    ];
    return {
      explanation: fallbacks[idHash % fallbacks.length],
      topDrivers: [`Balanced option matching travel constraints`]
    };
  }

  let primary: Driver;
  let secondary: Driver | null = null;

  if (driverCandidates.length === 1) {
    primary = driverCandidates[0];
  } else {
    // Distribute the primary lead across qualifying factors so lower-tier and itinerary items
    // draw fairly from rating, proximity, crowd, trend, and budget instead of defaulting to budget.
    const primaryIdx = idHash % driverCandidates.length;
    primary = driverCandidates[primaryIdx];
    const secondaryIdx = (primaryIdx + 1) % driverCandidates.length;
    secondary = driverCandidates[secondaryIdx];
  }

  const topDrivers = secondary ? [primary.label, secondary.label] : [primary.label];

  let explanation = '';

  if (secondary) {
    // 6 distinct templates per lead type
    const sel = (idHash + Math.floor(idHash / 11)) % 6;

    switch (primary.type) {
      case 'quality':
        if (sel === 0) explanation = `${item.rating}★ across ${item.reviewCount.toLocaleString()} traveler reviews makes this a standout on sheer reputation — with ${secondary.shortLabel} as an added bonus.`;
        else if (sel === 1) explanation = `The numbers speak for themselves: ${item.rating}★ historical rating, backed by ${secondary.shortLabel}.`;
        else if (sel === 2) explanation = `Consistently strong traveler feedback (${item.rating}★) puts this among the most reliable stops in the area, further supported by ${secondary.shortLabel}.`;
        else if (sel === 3) explanation = `This outscores comparable options primarily on review depth (${item.rating}★) — with ${secondary.shortLabel} rounding out the profile.`;
        else if (sel === 4) explanation = `A proven favorite with a steady ${item.rating}★ average. Pairing that with ${secondary.shortLabel} makes it an easy recommendation.`;
        else explanation = `High customer satisfaction (${item.rating}★) anchors this recommendation, with ${secondary.shortLabel} completing the appeal.`;
        break;

      case 'distance':
        if (sel === 0) explanation = `Just ${item.distanceMinutes} minutes from the central hub — minimal travel friction, while still delivering ${secondary.shortLabel}.`;
        else if (sel === 1) explanation = `Proximity is the big win here: only a ${item.distanceMinutes}-min hop, reinforced by ${secondary.shortLabel}.`;
        else if (sel === 2) explanation = `An effortless addition to the itinerary at ${item.distanceMinutes} mins out, backed by ${secondary.shortLabel}.`;
        else if (sel === 3) explanation = `Keeps transit time to a minimum (${item.distanceMinutes}m transit) without compromising on ${secondary.shortLabel}.`;
        else if (sel === 4) explanation = `Strategically located just ${item.distanceMinutes} minutes away, making logistics smooth alongside ${secondary.shortLabel}.`;
        else explanation = `Low-transit stop (${item.distanceMinutes} mins) that slips conveniently into the route, combined with ${secondary.shortLabel}.`;
        break;

      case 'budget':
        if (sel === 0) explanation = `High value at est. ₹${item.estimatedCostINR.toLocaleString()} — leaves plenty of budget headroom while securing ${secondary.shortLabel}.`;
        else if (sel === 1) explanation = `Estimated at just ₹${item.estimatedCostINR.toLocaleString()}, this keeps expenses comfortably low alongside ${secondary.shortLabel}.`;
        else if (sel === 2) explanation = `An easy fit for your wallet (est. ₹${item.estimatedCostINR.toLocaleString()}) that doesn't skimp on ${secondary.shortLabel}.`;
        else if (sel === 3) explanation = `Priced gently at ₹${item.estimatedCostINR.toLocaleString()}, giving your daily budget breathing room while offering ${secondary.shortLabel}.`;
        else if (sel === 4) explanation = `At an estimated ₹${item.estimatedCostINR.toLocaleString()}, this delivers genuine cost efficiency combined with ${secondary.shortLabel}.`;
        else explanation = `Sensible price point of est. ₹${item.estimatedCostINR.toLocaleString()} makes this a practical choice without losing out on ${secondary.shortLabel}.`;
        break;

      case 'trend':
        if (sel === 0) explanation = `Recent review momentum is climbing here — early traveler feedback is outpacing older ratings, backed by ${secondary.shortLabel}.`;
        else if (sel === 1) explanation = `A well-timed pick with recent traveler sentiment on an upswing, plus ${secondary.shortLabel}.`;
        else if (sel === 2) explanation = `Positive recent buzz gives this an edge over older alternatives nearby, complemented by ${secondary.shortLabel}.`;
        else if (sel === 3) explanation = `Traveler sentiment has been steadily rising here, making it a timely stop alongside ${secondary.shortLabel}.`;
        else if (sel === 4) explanation = `Recent visitors report an improved experience — catching this on an upward trajectory pairs nicely with ${secondary.shortLabel}.`;
        else explanation = `Riding an encouraging wave of positive recent feedback, further validated by ${secondary.shortLabel}.`;
        break;

      case 'crowd':
        if (sel === 0) explanation = `A great atmosphere match with its ${primary.context}, backed by ${secondary.shortLabel}.`;
        else if (sel === 1) explanation = `The ${primary.context} hits your preferred tempo nicely, with ${secondary.shortLabel} ensuring a solid visit.`;
        else if (sel === 2) explanation = `Paces your day well with its ${primary.context}, supported by ${secondary.shortLabel}.`;
        else if (sel === 3) explanation = `Atmosphere is spot on with a ${primary.context}, reinforced by ${secondary.shortLabel}.`;
        else if (sel === 4) explanation = `Delivers exactly the ${primary.context} you specified, without giving up ${secondary.shortLabel}.`;
        else explanation = `Offers an inviting ${primary.context} that aligns with your style, alongside ${secondary.shortLabel}.`;
        break;

      case 'interest':
        if (sel === 0) explanation = `Directly caters to your passion for ${primary.context}, complemented by ${secondary.shortLabel}.`;
        else if (sel === 1) explanation = `Handpicked for your interest in ${primary.context} — and ${secondary.shortLabel} confirms it's a solid call.`;
        else if (sel === 2) explanation = `If exploring ${primary.context} is on your wishlist, this is a prime contender, further elevated by ${secondary.shortLabel}.`;
        else if (sel === 3) explanation = `Few stops align with ${primary.context} as cleanly as this one, with ${secondary.shortLabel} rounding out the appeal.`;
        else if (sel === 4) explanation = `Hits your ${primary.context} focus head-on, alongside ${secondary.shortLabel}.`;
        else explanation = `A natural centerpiece for ${primary.context} enthusiasts, reinforced by ${secondary.shortLabel}.`;
        break;
    }
  } else {
    // Single driver case: 3 distinct templates per type
    const sel = idHash % 3;
    switch (primary.type) {
      case 'quality':
        if (sel === 0) explanation = `${item.rating}★ across ${item.reviewCount.toLocaleString()} reviews — consistently reliable quality.`;
        else if (sel === 1) explanation = `A steady ${item.rating}★ track record is the defining reason to visit.`;
        else explanation = `Earns its spot on dependable visitor feedback (${item.rating}★).`;
        break;
      case 'distance':
        if (sel === 0) explanation = `Just ${item.distanceMinutes} minutes from the hub — as convenient as it gets for this area.`;
        else if (sel === 1) explanation = `Superb proximity (${item.distanceMinutes}m transit) makes this an effortless addition.`;
        else explanation = `A low-transit stop at only ${item.distanceMinutes} minutes away.`;
        break;
      case 'budget':
        if (sel === 0) explanation = `At est. ₹${item.estimatedCostINR.toLocaleString()}, this keeps trip expenses neatly in check.`;
        else if (sel === 1) explanation = `Budget-conscious choice (est. ₹${item.estimatedCostINR.toLocaleString()}) that protects your daily allowance.`;
        else explanation = `Gentle on the wallet at an estimated ₹${item.estimatedCostINR.toLocaleString()}.`;
        break;
      case 'trend':
        if (sel === 0) explanation = `Recent visitor reviews are pointing upward, making this a well-timed visit.`;
        else if (sel === 1) explanation = `Trending positively with recent travelers, setting it apart from stagnant competitors.`;
        else explanation = `Fresh review momentum makes this a smart inclusion right now.`;
        break;
      case 'crowd':
        if (sel === 0) explanation = `Atmosphere aligns directly with your preferred ${primary.context}.`;
        else if (sel === 1) explanation = `Delivers the exact ${primary.context} you requested.`;
        else explanation = `Selected for its natural ${primary.context}.`;
        break;
      case 'interest':
        if (sel === 0) explanation = `Squarely aligned with your interest in ${primary.context}.`;
        else if (sel === 1) explanation = `Selected primarily to satisfy your interest in ${primary.context}.`;
        else explanation = `A tailored match for ${primary.context}.`;
        break;
    }
  }

  return { explanation, topDrivers };
}

/**
 * Step 5: Assign 4 Tiers
 */
export function assignTier(score: number, hasFatalCrowdMismatch: boolean): Tier {
  if (hasFatalCrowdMismatch && score < 65) {
    return 'Skip';
  }
  if (score >= 78) return 'Must Visit';
  if (score >= 60) return 'Worth Visiting';
  if (score >= 45) return 'If Time Allows';
  return 'Skip';
}

/**
 * Step 2: Compute Priority Score and return ScoredPlace
 */
export function scoreTravelItem(item: TravelItem, prefs: UserPreferences): ScoredPlace {
  const normQualityVal = normalizeQuality(item.rating, item.sentimentScore);
  const normBudgetVal = normalizeCost(
    item.estimatedCostINR,
    item.category,
    prefs.budgetINR,
    prefs.numberOfDays
  );
  const normDistanceVal = normalizeDistance(item.distanceMinutes);
  const normCrowdVal = normalizeCrowd(item.crowdLevel, prefs.crowdTolerance);

  // Normalize user priority weights
  const wRating = Math.max(0.1, prefs.priorityWeights.rating);
  const wBudget = Math.max(0.1, prefs.priorityWeights.budget);
  const wDistance = Math.max(0.1, prefs.priorityWeights.distance);
  const wCrowd = Math.max(0.1, prefs.priorityWeights.crowd);
  const totalWeight = wRating + wBudget + wDistance + wCrowd;

  const nwRating = wRating / totalWeight;
  const nwBudget = wBudget / totalWeight;
  const nwDistance = wDistance / totalWeight;
  const nwCrowd = wCrowd / totalWeight;

  const baseUtility =
    nwRating * normQualityVal +
    nwBudget * normBudgetVal +
    nwDistance * normDistanceVal +
    nwCrowd * normCrowdVal;

  // Interest match multiplier
  const matchingInterests = item.interests.filter((i) => prefs.interests.includes(i));
  let interestBonus = 1.0;
  if (prefs.interests.length > 0) {
    if (matchingInterests.length > 0) {
      interestBonus = 1.0 + Math.min(0.35, matchingInterests.length * 0.18);
    } else {
      interestBonus = 0.82; // slight penalty for zero interest match when user selected interests
    }
  }

  // Check if there is a severe crowd mismatch (e.g., user wants strictly low crowd, but place is high crowd)
  const fatalCrowdMismatch = prefs.crowdTolerance === 'low' && item.crowdLevel === 'high';

  // Recent review trend adjustment (-3% for falling, +3% for rising)
  let trendMultiplier = 1.0;
  if (item.recentReviewTrend === 'rising') trendMultiplier = 1.03;
  if (item.recentReviewTrend === 'falling') trendMultiplier = 0.94;

  const finalUtility = baseUtility * interestBonus * trendMultiplier;
  let rawScore = finalUtility * 100;

  // Apply an asymptotic curve to prevent artificial clumping at exactly 100/100.
  // Maps raw scores above 85 softly towards a theoretical max of 100.
  if (rawScore > 85) {
    const excess = rawScore - 85;
    rawScore = 85 + (15 * excess) / (excess + 25);
  }

  const priorityScore = Math.max(1, Math.min(100, Math.round(rawScore)));

  const realityCheck = computeRealityCheck(item);
  const tier = assignTier(priorityScore, fatalCrowdMismatch);

  const factorScores = {
    quality: Number(normQualityVal.toFixed(2)),
    budget: Number(normBudgetVal.toFixed(2)),
    distance: Number(normDistanceVal.toFixed(2)),
    crowd: Number(normCrowdVal.toFixed(2)),
    interestBonus: Number(interestBonus.toFixed(2)),
  };

  const { explanation, topDrivers } = generateWhyExplanation(
    item,
    prefs,
    factorScores,
    matchingInterests
  );

  return {
    item,
    priorityScore,
    tier,
    whyExplanation: explanation,
    topDrivers,
    realityCheck,
    factorScores,
  };
}

/**
 * Score all items for a destination, grouped by category and sorted by score
 */
export function scoreAllDestinationItems(
  items: TravelItem[],
  prefs: UserPreferences
): {
  places: ScoredPlace[];
  hotels: ScoredPlace[];
  restaurants: ScoredPlace[];
} {
  const scored = items.map((item) => scoreTravelItem(item, prefs));

  // Sort descending by score
  const sorted = scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    places: sorted.filter((s) => s.item.category === 'place'),
    hotels: sorted.filter((s) => s.item.category === 'hotel'),
    restaurants: sorted.filter((s) => s.item.category === 'restaurant'),
  };
}
