import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = fs.readFileSync(path.join(__dirname, '../src/data/destinations.json'), 'utf8');
const items = JSON.parse(rawData);

function normalizeRating(rating) {
  return Math.max(0, Math.min(1, (rating - 2.5) / 2.5));
}

function normalizeQuality(rating, sentimentScore) {
  const normRating = normalizeRating(rating);
  const normSentiment = Math.max(0, Math.min(1, sentimentScore));
  return 0.65 * normRating + 0.35 * normSentiment;
}

function normalizeDistance(distanceMinutes) {
  return Math.max(0.05, Math.min(1.0, 1 - distanceMinutes / 90));
}

function normalizeCrowd(crowdLevel, userTolerance) {
  if (userTolerance === 'low') {
    if (crowdLevel === 'low') return 1.0;
    if (crowdLevel === 'medium') return 0.5;
    return 0.1;
  }
  if (userTolerance === 'medium') {
    if (crowdLevel === 'low') return 0.85;
    if (crowdLevel === 'medium') return 1.0;
    return 0.5;
  }
  if (crowdLevel === 'low') return 0.7;
  if (crowdLevel === 'medium') return 0.9;
  return 1.0;
}

function normalizeCost(itemCost, category, userBudgetINR, days) {
  const dailyBudget = Math.max(1000, userBudgetINR / Math.max(1, days));
  let expectedCategoryBudget = dailyBudget * 0.3;
  if (category === 'hotel') expectedCategoryBudget = dailyBudget * 0.55;
  if (category === 'restaurant') expectedCategoryBudget = dailyBudget * 0.25;

  if (itemCost <= expectedCategoryBudget) {
    return Math.max(0.7, 1.0 - (itemCost / expectedCategoryBudget) * 0.2);
  }
  const ratio = itemCost / expectedCategoryBudget;
  return Math.max(0.05, Math.min(1.0, 1.0 / ratio));
}

function computeRealityCheck(item) {
  const recentScoreEquivalent = Number((item.recentSentimentScore * 5).toFixed(1));
  const discrepancy = Number((item.rating - recentScoreEquivalent).toFixed(2));

  if (discrepancy >= 0.65 || (item.recentReviewTrend === 'falling' && discrepancy >= 0.4)) {
    const issues = item.negativeTags.slice(0, 2).join(', ');
    return {
      isFlagged: true,
      type: 'WARNING',
      message: `⚠️ Rating Reality Check: Overall ${item.rating}★, but recent reviews dropped to ~${recentScoreEquivalent}★ (${item.recentReviewTrend}). Recent complaints: "${issues}".`,
    };
  }

  if (recentScoreEquivalent - item.rating >= 0.4 || item.recentReviewTrend === 'rising') {
    return {
      isFlagged: false,
      type: 'IMPROVING',
      message: `📈 Rising Trend: Recent reviews (~${recentScoreEquivalent}★) exceed historical rating.`,
    };
  }

  return {
    isFlagged: false,
    type: 'STABLE',
    message: `✓ Consistent: Reviews remain stable.`,
  };
}

function assignTier(score, hasFatalCrowdMismatch) {
  if (hasFatalCrowdMismatch && score < 65) return 'Skip';
  if (score >= 78) return 'Must Visit';
  if (score >= 60) return 'Worth Visiting';
  if (score >= 45) return 'If Time Allows';
  return 'Skip';
}

function scoreTravelItem(item, prefs) {
  const normQualityVal = normalizeQuality(item.rating, item.sentimentScore);
  const normBudgetVal = normalizeCost(item.estimatedCostINR, item.category, prefs.budgetINR, prefs.numberOfDays);
  const normDistanceVal = normalizeDistance(item.distanceMinutes);
  const normCrowdVal = normalizeCrowd(item.crowdLevel, prefs.crowdTolerance);

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

  const matchingInterests = item.interests.filter((i) => prefs.interests.includes(i));
  let interestBonus = 1.0;
  if (prefs.interests.length > 0) {
    if (matchingInterests.length > 0) {
      interestBonus = 1.0 + Math.min(0.35, matchingInterests.length * 0.18);
    } else {
      interestBonus = 0.82;
    }
  }

  const fatalCrowdMismatch = prefs.crowdTolerance === 'low' && item.crowdLevel === 'high';

  let trendMultiplier = 1.0;
  if (item.recentReviewTrend === 'rising') trendMultiplier = 1.03;
  if (item.recentReviewTrend === 'falling') trendMultiplier = 0.94;

  const finalUtility = baseUtility * interestBonus * trendMultiplier;
  const priorityScore = Math.max(1, Math.min(100, Math.round(finalUtility * 100)));
  const realityCheck = computeRealityCheck(item);
  const tier = assignTier(priorityScore, fatalCrowdMismatch);

  return {
    item,
    priorityScore,
    tier,
    realityCheck,
  };
}

console.log('=== TEST 1: PROFILE A (Nightlife, Budget, High Crowd Tolerance) ===');
const profileA = {
  destination: 'Goa',
  numberOfDays: 3,
  budgetINR: 12000,
  interests: ['nightlife', 'beaches'],
  crowdTolerance: 'high',
  priorityWeights: { rating: 3, budget: 5, distance: 2, crowd: 2 },
};

const goaItems = items.filter((i) => i.destination === 'Goa' && i.category === 'place');
const resultsA = goaItems.map((i) => scoreTravelItem(i, profileA)).sort((a, b) => b.priorityScore - a.priorityScore);

resultsA.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r.tier}] ${r.item.name} - Score: ${r.priorityScore} (Flagged: ${r.realityCheck.isFlagged})`);
});

console.log('\n=== TEST 2: PROFILE B (Peaceful Spots, Nature, Low Crowd Tolerance, Luxury/High Budget) ===');
const profileB = {
  destination: 'Goa',
  numberOfDays: 3,
  budgetINR: 60000,
  interests: ['peaceful spots', 'nature'],
  crowdTolerance: 'low',
  priorityWeights: { rating: 5, budget: 1, distance: 2, crowd: 5 },
};

const resultsB = goaItems.map((i) => scoreTravelItem(i, profileB)).sort((a, b) => b.priorityScore - a.priorityScore);

resultsB.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r.tier}] ${r.item.name} - Score: ${r.priorityScore} (Flagged: ${r.realityCheck.isFlagged})`);
});

// Compare top places between A and B
console.log('\nVerification Check:');
console.log('Top place Profile A:', resultsA[0].item.name, 'Score:', resultsA[0].priorityScore);
console.log('Top place Profile B:', resultsB[0].item.name, 'Score:', resultsB[0].priorityScore);
console.log('Rank of Baga Beach in Profile A:', resultsA.findIndex(r => r.item.name.includes('Baga')) + 1);
console.log('Rank of Baga Beach in Profile B:', resultsB.findIndex(r => r.item.name.includes('Baga')) + 1);
console.log('Did rankings change?', resultsA[0].item.name !== resultsB[0].item.name ? 'YES (SUCCESS)' : 'NO (FAIL)');
