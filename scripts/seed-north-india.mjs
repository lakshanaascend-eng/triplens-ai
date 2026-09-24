import fs from 'fs';
import path from 'path';

// Define the cities to generate data for
const citiesData = [
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Udaipur', state: 'Rajasthan' },
  { city: 'Jodhpur', state: 'Rajasthan' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Agra', state: 'Uttar Pradesh' },
  { city: 'Varanasi', state: 'Uttar Pradesh' },
  { city: 'Rishikesh', state: 'Uttarakhand' },
  { city: 'Nainital', state: 'Uttarakhand' },
  { city: 'Manali', state: 'Himachal Pradesh' },
  { city: 'Shimla', state: 'Himachal Pradesh' },
  { city: 'Amritsar', state: 'Punjab' },
  { city: 'Srinagar', state: 'Jammu & Kashmir' },
];

// Helper to pick random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Helper to generate a random number within a range
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => (Math.random() * (max - min) + min);

const positivePool = ['Great atmosphere', 'Stunning architecture', 'Must visit', 'Very peaceful', 'Amazing views', 'Delicious food', 'Friendly staff', 'Clean and well-maintained', 'Historic and majestic', 'Beautiful scenery'];
const negativePool = ['Very crowded', 'A bit expensive', 'Hard to find parking', 'Long wait times', 'Noisy at times', 'Average service', 'Can get too hot during the day', 'Too touristy'];
const interestsPool = [['culture', 'heritage'], ['nature', 'peaceful spots'], ['food', 'nightlife'], ['culture', 'nature'], ['heritage', 'peaceful spots'], ['beaches'], ['food', 'peaceful spots']];
const crowdPool = ['low', 'medium', 'high'];
const pricePool = ['budget', 'moderate', 'luxury'];
const timePool = ['morning', 'afternoon', 'evening', 'night'];

const generateItemsForCity = (cityObj) => {
  const items = [];
  const { city, state } = cityObj;

  // Generate 3-4 Places
  const numPlaces = rand(3, 4);
  for (let i = 1; i <= numPlaces; i++) {
    const isNature = ['Manali', 'Shimla', 'Nainital', 'Srinagar'].includes(city);
    items.push({
      id: `${city.toLowerCase()}-p${i}`,
      name: `${city} ${isNature ? pick(['Valley Point', 'Hills View', 'Lake Promenade', 'Forest Reserve']) : pick(['Fort', 'Palace', 'Museum', 'Heritage Walk', 'Temple'])}`,
      destination: city,
      city: city,
      state: state,
      category: 'place',
      rating: parseFloat(randFloat(4.0, 4.9).toFixed(1)),
      reviewCount: rand(500, 50000),
      sentimentScore: parseFloat(randFloat(0.6, 0.95).toFixed(2)),
      recentSentimentScore: parseFloat(randFloat(0.5, 0.98).toFixed(2)),
      recentReviewTrend: pick(['improving', 'stable', 'declining']),
      positiveTags: [pick(positivePool), pick(positivePool)],
      negativeTags: [pick(negativePool)],
      crowdLevel: pick(crowdPool),
      priceTier: pick(pricePool),
      estimatedCostINR: rand(100, 1500),
      distanceMinutes: rand(5, 60),
      interests: isNature ? ['nature', 'peaceful spots'] : ['culture', 'heritage'],
      bestTimeOfDay: pick(timePool),
      locationZone: `${city} Central`,
      description: `A top rated attraction in ${city}, famous for its stunning features and rich history.`
    });
  }

  // Generate 2 Hotels
  for (let i = 1; i <= 2; i++) {
    items.push({
      id: `${city.toLowerCase()}-h${i}`,
      name: `${city} ${pick(['Grand', 'Palace', 'Resort', 'Boutique', 'Inn'])}`,
      destination: city,
      city: city,
      state: state,
      category: 'hotel',
      rating: parseFloat(randFloat(3.8, 4.9).toFixed(1)),
      reviewCount: rand(100, 5000),
      sentimentScore: parseFloat(randFloat(0.7, 0.95).toFixed(2)),
      recentSentimentScore: parseFloat(randFloat(0.6, 0.95).toFixed(2)),
      recentReviewTrend: pick(['improving', 'stable']),
      positiveTags: ['Comfortable rooms', 'Great service'],
      negativeTags: [pick(negativePool)],
      crowdLevel: pick(crowdPool),
      priceTier: pick(pricePool),
      estimatedCostINR: rand(1500, 15000),
      distanceMinutes: rand(5, 30),
      interests: ['peaceful spots'],
      bestTimeOfDay: 'evening',
      locationZone: `${city} Hub`,
      description: `A comfortable and well-reviewed accommodation option in ${city}.`
    });
  }

  // Generate 2 Restaurants
  for (let i = 1; i <= 2; i++) {
    items.push({
      id: `${city.toLowerCase()}-r${i}`,
      name: `${city} ${pick(['Dhaba', 'Cafe', 'Bistro', 'Spice', 'Kitchen'])}`,
      destination: city,
      city: city,
      state: state,
      category: 'restaurant',
      rating: parseFloat(randFloat(4.0, 4.8).toFixed(1)),
      reviewCount: rand(200, 8000),
      sentimentScore: parseFloat(randFloat(0.7, 0.95).toFixed(2)),
      recentSentimentScore: parseFloat(randFloat(0.7, 0.95).toFixed(2)),
      recentReviewTrend: pick(['improving', 'stable']),
      positiveTags: ['Delicious food', 'Authentic taste'],
      negativeTags: [pick(negativePool)],
      crowdLevel: pick(crowdPool),
      priceTier: pick(pricePool),
      estimatedCostINR: rand(300, 3000),
      distanceMinutes: rand(5, 20),
      interests: ['food'],
      bestTimeOfDay: pick(['afternoon', 'night']),
      locationZone: `${city} Food Street`,
      description: `Popular dining spot in ${city} serving local delicacies.`
    });
  }

  return items;
};

const allNorthIndiaItems = [];
citiesData.forEach(c => {
  allNorthIndiaItems.push(...generateItemsForCity(c));
});

const outputPath = path.join(process.cwd(), 'src', 'data', 'north-india.json');
fs.writeFileSync(outputPath, JSON.stringify(allNorthIndiaItems, null, 2));

console.log(`Successfully wrote ${allNorthIndiaItems.length} items to north-india.json`);
