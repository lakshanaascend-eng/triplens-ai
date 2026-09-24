import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const destinationsPath = path.resolve(__dirname, '../src/data/destinations.json');

const existingData = JSON.parse(fs.readFileSync(destinationsPath, 'utf-8'));
console.log(`Loaded ${existingData.length} existing items.`);

// Guard: remove any previous AP/Telangana/Auroville/Karaikal runs; keep all existing states intact
const baseData = existingData.filter(
  (item) =>
    item.state !== 'Andhra Pradesh' &&
    item.state !== 'Telangana' &&
    !['Auroville', 'Karaikal'].includes(item.destination)
);
console.log(`Preserved ${baseData.length} core items.`);

// ─── ANDHRA PRADESH ────────────────────────────────────────────────────────────
const andhraCities = [
  // 1. Visakhapatnam (Vizag)
  {
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    places: [
      {
        name: 'RK Beach & Visakha War Memorial',
        category: 'place', rating: 4.6, reviewCount: 28000,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'stable',
        positiveTags: ['Sweeping Bay of Bengal coastline', 'Submarine INS Kursura Museum', 'Evening laser fountain show'],
        negativeTags: ['Crowded weekends', 'Parking scarce near war memorial'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 60,
        distanceMinutes: 8, interests: ['beaches', 'culture', 'nightlife'],
        bestTimeOfDay: 'evening', locationZone: 'Beach Road Promenade',
        description: 'Vizag\'s iconic seafront boulevard lined with monuments, submarine museum, and sparkling evening fountains.'
      },
      {
        name: 'Araku Valley Tribal Museum & Borra Caves',
        category: 'place', rating: 4.8, reviewCount: 14500,
        sentimentScore: 0.94, recentSentimentScore: 0.95, recentReviewTrend: 'rising',
        positiveTags: ['Million-year-old stalactite cave formations', 'Scenic Kirandul toy train journey', 'Tribal craft heritage museum'],
        negativeTags: ['3-hour drive from Vizag', 'Monsoon road closures'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 400,
        distanceMinutes: 120, interests: ['nature', 'culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Eastern Ghats Highlands',
        description: 'Dramatic stalactite limestone caverns 700m above sea level, flanked by coffee estates and adivasi art villages.'
      },
      {
        name: 'Simhachalam Temple Varahaswamy Sacred Hilltop',
        category: 'place', rating: 4.7, reviewCount: 18000,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'stable',
        positiveTags: ['11th-century Kalinga architecture temple', 'Annual Chandana Yatra sandal paste ritual', 'Hilltop jungle panorama'],
        negativeTags: ['Steep foothill parking', 'Long queues on festival days'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 40,
        distanceMinutes: 22, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Simhachalam Hill',
        description: 'Rare 11th-century temple where Lord Narasimha is worshipped as Varaha for most of the year except Akshaya Tritiya.'
      },
      {
        name: 'Yarada Beach & Dolphin\'s Nose Lighthouse Cliff',
        category: 'place', rating: 4.7, reviewCount: 9800,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['Secluded cove between two hills', 'Stunning Dolphin\'s Nose headland silhouette', 'Crystal clear shallow waters'],
        negativeTags: ['Narrow road access with very limited parking', 'No food stalls on beach'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 50,
        distanceMinutes: 30, interests: ['beaches', 'nature', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Southern Coastline',
        description: 'Pristine crescent beach shielded by twin rocky cliffs, offering calm waters and dramatic Dolphin\'s Nose headland views.'
      }
    ],
    hotels: [
      {
        name: 'The Park Visakhapatnam Oceanfront',
        category: 'hotel', rating: 4.7, reviewCount: 3200,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['Stunning Bay of Bengal balcony views', 'Infinity pool on the seafront', 'Chic contemporary Novotel-class design'],
        negativeTags: ['Busy lobby during conference seasons'],
        crowdLevel: 'medium', priceTier: 'luxury', estimatedCostINR: 6500,
        distanceMinutes: 10, interests: ['beaches', 'food', 'nightlife'],
        bestTimeOfDay: 'afternoon', locationZone: 'Beach Road',
        description: 'Sleek oceanfront luxury property with commanding Bay of Bengal views and a vibrant rooftop bar scene.'
      },
      {
        name: 'Novotel Visakhapatnam Convention Centre',
        category: 'hotel', rating: 4.6, reviewCount: 2400,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'stable',
        positiveTags: ['Largest convention space on East coast', 'Lagoon pool and Ayurvedic spa', 'Direct beach access walkway'],
        negativeTags: ['Premium tariff', 'Convention rush on weekdays'],
        crowdLevel: 'medium', priceTier: 'luxury', estimatedCostINR: 5800,
        distanceMinutes: 12, interests: ['peaceful spots', 'beaches'],
        bestTimeOfDay: 'afternoon', locationZone: 'Beach Road North',
        description: 'Modern convention resort with lagoon pools, beachside walkways, and comprehensive wellness facilities.'
      }
    ],
    restaurants: [
      {
        name: 'Bamboo Bay Seafood Grill Vizag',
        category: 'restaurant', rating: 4.6, reviewCount: 6800,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['Open bamboo deck over the sea', 'Mud crab pepper fry & Andhra fish curry', 'Coconut palm canopy ambiance'],
        negativeTags: ['Busy weekend reservations', 'Outdoor section hot in summer noon'],
        crowdLevel: 'high', priceTier: 'moderate', estimatedCostINR: 700,
        distanceMinutes: 9, interests: ['food', 'beaches', 'nightlife'],
        bestTimeOfDay: 'evening', locationZone: 'Rushikonda Beach Zone',
        description: 'Beloved seafront bamboo restaurant celebrated for fire-roasted crab, fiery Andhra prawn curries, and ocean breezes.'
      },
      {
        name: 'Kirti Pure Veg Andhra Kitchen',
        category: 'restaurant', rating: 4.5, reviewCount: 9200,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Authentic spicy Andhra thali on banana leaf', 'Gongura pacchadi and jaggery rice pudding', 'Budget-friendly unlimited meals'],
        negativeTags: ['Brisk turnover dining hall', 'Busy weekend lunch rush'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 200,
        distanceMinutes: 6, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Jagadamba Junction',
        description: 'Beloved Vizag vegetarian staple serving piping hot unlimited Andhra thali with signature gongura chutney and rice payasam.'
      }
    ]
  },

  // 2. Vijayawada
  {
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    places: [
      {
        name: 'Kanaka Durga Temple & Indrakeeladri Hill',
        category: 'place', rating: 4.9, reviewCount: 38000,
        sentimentScore: 0.97, recentSentimentScore: 0.98, recentReviewTrend: 'rising',
        positiveTags: ['Patron goddess of Andhra Pradesh', 'Breathtaking Krishna River sunset view', 'Sacred hill temple illuminated nightly'],
        negativeTags: ['Massive crowds during Navaratri festival', 'Long queue management system required'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 50,
        distanceMinutes: 8, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Indrakeeladri Peak',
        description: 'One of the most visited temples in India, enshrining the presiding deity of Vijayawada atop a sacred Krishna riverside hill.'
      },
      {
        name: 'Prakasam Barrage & Krishna River Boat Cruise',
        category: 'place', rating: 4.5, reviewCount: 16000,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Iconic illuminated 1.2km engineering barrage', 'Serene river boat rides at dusk', 'Soft sand islands with boating'],
        negativeTags: ['Heavy vehicle traffic on barrage road', 'Boat rides restricted during floods'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 100,
        distanceMinutes: 5, interests: ['culture', 'peaceful spots', 'nature'],
        bestTimeOfDay: 'evening', locationZone: 'Krishna Riverfront',
        description: 'Historic 1,223-metre barrage across the Krishna River, transformed into a luminous evening promenade with river boat cruises.'
      },
      {
        name: 'Undavalli Rock-Cut Cave Temples (5th Century)',
        category: 'place', rating: 4.7, reviewCount: 11000,
        sentimentScore: 0.92, recentSentimentScore: 0.93, recentReviewTrend: 'stable',
        positiveTags: ['4-storey monolithic rock-cut Buddhist and Hindu caves', 'Magnificent 5th-century reclining Vishnu', 'Riverside cliff location'],
        negativeTags: ['Unmarked path to upper caves', '7km from central Vijayawada'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 25,
        distanceMinutes: 20, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Undavalli Village',
        description: 'Remarkable 5th-century four-storey monolithic excavation featuring a majestic reclining Ananthasayana Vishnu and Buddhist relics.'
      },
      {
        name: 'Bhavani Island & Eco Adventure Resort',
        category: 'place', rating: 4.6, reviewCount: 14000,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'rising',
        positiveTags: ['Largest river island resort in India', 'Cable car and zip line adventure', 'Lush Krishna River ecosystem picnic grounds'],
        negativeTags: ['Ferry and activity bookings sell out weekends', 'Hot midday on open island'],
        crowdLevel: 'high', priceTier: 'moderate', estimatedCostINR: 350,
        distanceMinutes: 12, interests: ['nature', 'nightlife', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Krishna River Island',
        description: 'Verdant mid-river island resort reached by scenic cable car, offering zip lines, boating, and lush Krishna riverine ecology.'
      }
    ],
    hotels: [
      {
        name: 'Taj Gateway Hotel Vijayawada',
        category: 'hotel', rating: 4.7, reviewCount: 2800,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['Prime location near Krishna riverfront', 'Signature Andhra cuisine restaurant', 'Outdoor pool and spa'],
        negativeTags: ['Bustling city traffic around hotel'],
        crowdLevel: 'medium', priceTier: 'luxury', estimatedCostINR: 5800,
        distanceMinutes: 7, interests: ['culture', 'food'],
        bestTimeOfDay: 'afternoon', locationZone: 'MG Road',
        description: 'Elegant IHCL-managed city hotel featuring regional Andhra cuisine, poolside relaxation, and seamless access to temple and river.'
      },
      {
        name: 'Accord Metropolitan Vijayawada',
        category: 'hotel', rating: 4.4, reviewCount: 2100,
        sentimentScore: 0.86, recentSentimentScore: 0.87, recentReviewTrend: 'stable',
        positiveTags: ['Centrally located business hotel', 'Rooftop pool with city skyline view', 'Reliable Andhra and continental breakfast'],
        negativeTags: ['Older wing has dated furnishings'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 3200,
        distanceMinutes: 5, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Besant Road',
        description: 'Conveniently located mid-scale hotel offering rooftop pool views and easy access to Vijayawada\'s cultural and commercial heart.'
      }
    ],
    restaurants: [
      {
        name: 'Hotel Swarna Palace Andhra Meals',
        category: 'restaurant', rating: 4.6, reviewCount: 12000,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['Famous Vijayawada-style Andhra meals', 'Rich gongura mutton and pappu charu lentil soup', 'Ghee-laden unlimited rice meals on leaf'],
        negativeTags: ['Very busy at lunch', 'Basic seating arrangement'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 180,
        distanceMinutes: 5, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Governorpet',
        description: 'Iconic Vijayawada dining institution delivering traditional Andhra meals with legendary gongura mutton and crispy vadiyalu.'
      },
      {
        name: 'Babai Hotel Pesarattu & Upma Breakfast',
        category: 'restaurant', rating: 4.6, reviewCount: 8500,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'stable',
        positiveTags: ['Crispy pesarattu (green moong dosa) perfection', 'Ginger chutney and upma stuffed variant', 'Andhra morning breakfast ritual'],
        negativeTags: ['Very crowded from 7-9 AM', 'Only breakfast and morning tiffin'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 130,
        distanceMinutes: 4, interests: ['food', 'culture'],
        bestTimeOfDay: 'morning', locationZone: 'Eluru Road',
        description: 'Legendary dawn breakfast spot famed for golden crispy pesarattu paired with aromatic ginger chutney — a Vijayawada morning ritual.'
      }
    ]
  },

  // 3. Tirupati
  {
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    places: [
      {
        name: 'Tirumala Venkateswara Temple (Balaji)',
        category: 'place', rating: 5.0, reviewCount: 120000,
        sentimentScore: 0.99, recentSentimentScore: 0.99, recentReviewTrend: 'rising',
        positiveTags: ['Richest and most visited pilgrimage temple on Earth', 'Spectacular Dravidian gopuram on seven hills', 'Sacred Tirumala forest reserve ascent'],
        negativeTags: ['Requires advance online booking for darshan', 'Several hours of queue even with token'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 300,
        distanceMinutes: 35, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Tirumala Hills',
        description: 'The world\'s most visited place of worship, enshrining Lord Venkateswara atop the sacred Tirumala hills, drawing 100,000 pilgrims daily.'
      },
      {
        name: 'Sri Padmavathi Ammavari Devi Temple Tiruchanur',
        category: 'place', rating: 4.8, reviewCount: 32000,
        sentimentScore: 0.96, recentSentimentScore: 0.97, recentReviewTrend: 'stable',
        positiveTags: ['Consort deity of Lord Venkateswara', 'Manageable smaller pilgrimage crowd', 'Beautiful lotus pond and sculpted architecture'],
        negativeTags: ['Camera fee at entrance', 'Festival season congestion'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 40,
        distanceMinutes: 10, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Tiruchanur',
        description: 'Revered shakti temple dedicated to Goddess Padmavathi, visited by pilgrims proceeding to or returning from Tirumala.'
      },
      {
        name: 'Talakona Waterfalls Forest Eco Trek',
        category: 'place', rating: 4.7, reviewCount: 12000,
        sentimentScore: 0.92, recentSentimentScore: 0.93, recentReviewTrend: 'rising',
        positiveTags: ['Tallest waterfall in Andhra Pradesh (270 ft)', 'Sri Venkateswara National Park trekking', 'Medicinal herb forest trails'],
        negativeTags: ['60km drive from Tirupati town', 'Entry restricted to daytime only'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 200,
        distanceMinutes: 75, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Sri Venkateswara NP',
        description: 'The highest waterfall in Andhra Pradesh at 270 feet, cascading through pristine biosphere forest with endemic herbal medicinal plants.'
      },
      {
        name: 'Chandragiri Fort Palace Heritage Museum',
        category: 'place', rating: 4.6, reviewCount: 9500,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'stable',
        positiveTags: ['11th-century Vijayanagara dynasty fort palace', 'Evening son et lumière sound and light show', 'Panoramic hilltop views of Tirupati'],
        negativeTags: ['Shows only on selected evenings', '11km from town center'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 60,
        distanceMinutes: 20, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'evening', locationZone: 'Chandragiri Village',
        description: 'Imposing 11th-century citadel featuring a royal palace, tower, and an atmospheric sound-and-light show recounting Vijayanagara history.'
      }
    ],
    hotels: [
      {
        name: 'Marriott Tirupati Luxury Pilgrimage Retreat',
        category: 'hotel', rating: 4.8, reviewCount: 3600,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'rising',
        positiveTags: ['5-star quality in pilgrimage city', 'Pure veg and non-veg restaurant options', 'Pre-darshan pilgrim concierge assistance'],
        negativeTags: ['Premium pricing', 'Can be booked out during Brahmotsavam'],
        crowdLevel: 'medium', priceTier: 'luxury', estimatedCostINR: 7000,
        distanceMinutes: 8, interests: ['culture', 'food'],
        bestTimeOfDay: 'afternoon', locationZone: 'RC Road',
        description: 'Tirupati\'s finest luxury hotel blending five-star hospitality with dedicated pilgrim services and concierge for Tirumala darshan planning.'
      },
      {
        name: 'Bliss Hotel Tirupati Comfort Pilgrims',
        category: 'hotel', rating: 4.5, reviewCount: 2600,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Clean comfortable rooms near railway station', 'Dedicated prasadam laddu storage', 'Helpful pilgrimage coordination desk'],
        negativeTags: ['Standard rooms are compact', 'Parking limited'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 3400,
        distanceMinutes: 5, interests: ['culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Station Road',
        description: 'Reliable mid-range pilgrim hotel near Tirupati station with coordinated Tirumala bus and darshan booking assistance.'
      }
    ],
    restaurants: [
      {
        name: 'Tirupati Laddu Prasadam Bhojanasala TTD',
        category: 'restaurant', rating: 4.8, reviewCount: 25000,
        sentimentScore: 0.96, recentSentimentScore: 0.97, recentReviewTrend: 'rising',
        positiveTags: ['Sacred TTD venkateswara laddu GI-tagged prasadam', 'Wholesome free annadanam satvik meals', 'Deep spiritual dining experience'],
        negativeTags: ['Queue required for free anna daanam', 'Laddu only available post-darshan'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 50,
        distanceMinutes: 38, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Tirumala Main Temple',
        description: 'The legendary Tirumala Tirupati Devasthanams annadanam hall serving sacred free satvik meals and the iconic GI-tagged jaggery laddu.'
      },
      {
        name: 'Minerva Grand Restaurant Tirupati',
        category: 'restaurant', rating: 4.5, reviewCount: 5800,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Multi-cuisine Andhra and North Indian buffet', 'Fresh sweet pongal and kesari desserts', 'Air-conditioned family hall'],
        negativeTags: ['Busy at lunch and festival season'],
        crowdLevel: 'high', priceTier: 'moderate', estimatedCostINR: 380,
        distanceMinutes: 6, interests: ['food'],
        bestTimeOfDay: 'afternoon', locationZone: 'TP Area',
        description: 'Well-regarded city-centre restaurant serving reliable Andhra, South Indian, and continental buffet meals for pilgrims and tourists alike.'
      }
    ]
  },

  // 4. Araku Valley
  {
    city: 'Araku Valley',
    state: 'Andhra Pradesh',
    places: [
      {
        name: 'Araku Coffee Plantation & Padmapuram Gardens',
        category: 'place', rating: 4.8, reviewCount: 11000,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'rising',
        positiveTags: ['GI-tagged premium Araku Valley organic coffee', 'Terraced botanical gardens with 200 species', 'Tribal agro-ecology walks'],
        negativeTags: ['1200m altitude cold in winter mornings', 'Remote 115km from Vizag'],
        crowdLevel: 'low', priceTier: 'moderate', estimatedCostINR: 300,
        distanceMinutes: 15, interests: ['nature', 'culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Padmapuram Hillside',
        description: 'Lush terraced botanical park where India\'s globally acclaimed specialty Araku organic coffee beans are grown by indigenous tribes.'
      },
      {
        name: 'Borra Caves Stalactite & Stalagmite Cathedral',
        category: 'place', rating: 4.8, reviewCount: 18500,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'rising',
        positiveTags: ['Largest natural caves in India (1.5km deep)', 'Million-year-old mineral formations in vivid colours', 'Natural Shiva lingam shaped stalactite'],
        negativeTags: ['Narrow cave passages can feel claustrophobic', 'Tour timing strictly supervised'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 100,
        distanceMinutes: 30, interests: ['nature', 'culture', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Borra Village',
        description: 'India\'s largest cave system at 705m altitude with spectacular million-year-old stalactite cathedral formations and a natural Shiva lingam.'
      },
      {
        name: 'Tribal Museum & Dumbriguda Waterfall Trail',
        category: 'place', rating: 4.6, reviewCount: 7200,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'stable',
        positiveTags: ['Rich Kondh and Koya indigenous artifact collection', 'Verdant ghats waterfall nature walk', 'Authentic tribal handloom textiles'],
        negativeTags: ['Museum closed on Mondays', 'Limited signage in English'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 80,
        distanceMinutes: 10, interests: ['culture', 'nature', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Araku Town Centre',
        description: 'Immersive museum celebrating indigenous Eastern Ghats tribal cultures with handloom textiles, ritual art, and ethnobotanical exhibits.'
      },
      {
        name: 'Katiki Waterfalls & Gosthani River Forest',
        category: 'place', rating: 4.7, reviewCount: 8400,
        sentimentScore: 0.92, recentSentimentScore: 0.93, recentReviewTrend: 'rising',
        positiveTags: ['Secluded 50-foot forest cascade', 'Unspoiled rainforest ecosystem', 'Natural rock pool perfect for cool dip'],
        negativeTags: ['Rough jungle path requires trekking shoes', 'Best visited Oct-Feb; lean in summer'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 80,
        distanceMinutes: 22, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Bheemunipatnam Forest',
        description: 'Hidden 50-foot waterfall plunging into a natural rock pool inside thick Eastern Ghats shola forest — a hiker\'s secluded paradise.'
      }
    ],
    hotels: [
      {
        name: 'Haritha Valley Resort APTDC Araku',
        category: 'hotel', rating: 4.5, reviewCount: 2800,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Official APTDC resort in pristine valley setting', 'Affordable and spacious cottages', 'Tribal cultural evening performances'],
        negativeTags: ['Basic amenities', 'Advance booking essential'],
        crowdLevel: 'low', priceTier: 'moderate', estimatedCostINR: 3200,
        distanceMinutes: 5, interests: ['nature', 'culture', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Araku Valley Centre',
        description: 'Official state tourism resort amid coffee and bamboo forests, offering tribal cultural evenings and scenic valley views at fair prices.'
      },
      {
        name: 'Jungle Bells Resort Araku Eco Cottage',
        category: 'hotel', rating: 4.6, reviewCount: 1400,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'rising',
        positiveTags: ['Eco bamboo cottages in coffee plantation', 'Morning tribal chai and birdsong', 'Organic farm-to-table meals'],
        negativeTags: ['No TV in rooms (digital detox)', 'Remote forest driveway'],
        crowdLevel: 'low', priceTier: 'moderate', estimatedCostINR: 2800,
        distanceMinutes: 12, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Ananthagiri Plantation',
        description: 'Eco-friendly bamboo cottage resort nestled in an organic coffee grove offering farm-fresh meals and authentic tribal forest living.'
      }
    ],
    restaurants: [
      {
        name: 'Araku Bamboo Chicken & Tribal Feast',
        category: 'restaurant', rating: 4.7, reviewCount: 4200,
        sentimentScore: 0.92, recentSentimentScore: 0.93, recentReviewTrend: 'rising',
        positiveTags: ['Legendary bamboo-tube slow-cooked chicken', 'Fresh turmeric and forest herb seasoning', 'Open-air roadside tribal kitchen setting'],
        negativeTags: ['Preparation takes 30-40 minutes for bamboo dish', 'Open air — occasional smoke from fire'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 280,
        distanceMinutes: 8, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Highway Tribal Stretch',
        description: 'Famous roadside tribal kitchen slow-cooking whole chicken inside fresh green bamboo over open fire — an Araku culinary pilgrimage.'
      },
      {
        name: 'Araku Coffee House & Barista Lab',
        category: 'restaurant', rating: 4.6, reviewCount: 3100,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['World-class GI-tagged Araku single-origin pour overs', 'Cold brew concentrate and espresso flights', 'Scenic valley terrace seating'],
        negativeTags: ['Premium coffee pricing compared to mass brands'],
        crowdLevel: 'low', priceTier: 'moderate', estimatedCostINR: 320,
        distanceMinutes: 5, interests: ['food', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Araku Town',
        description: 'Specialty coffee lab serving internationally acclaimed Araku valley single-origin brews with guided sensory tasting sessions.'
      }
    ]
  },

  // 5. Rajahmundry
  {
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    places: [
      {
        name: 'Godavari River Ghats & Boat Cruise Papikondalu',
        category: 'place', rating: 4.7, reviewCount: 22000,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['Spectacular Godavari river gorge cruise between mountains', 'Sacred temple-studded ghats', 'Tribal Koya villages en route'],
        negativeTags: ['Boat cruise is a full-day commitment (8 hours)', 'Busy on weekends and festival season'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 800,
        distanceMinutes: 10, interests: ['nature', 'culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Godavari Ghat',
        description: 'Majestic full-day river cruise through the spectacular Papikondalu gorge flanked by 1200m forested cliffs on the sacred Godavari.'
      },
      {
        name: 'Dattareya Swami Temple & Ancient Tree Banyan Walk',
        category: 'place', rating: 4.6, reviewCount: 9800,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'stable',
        positiveTags: ['Peaceful riverside temple with 800-year-old banyan tree', 'Traditional Shiva linga and gopuram', 'Evening aarti on Godavari banks'],
        negativeTags: ['Entry restricted to Hindus inside sanctum'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 30,
        distanceMinutes: 6, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'evening', locationZone: 'Godavari Ghats',
        description: 'Ancient riverside Shaivite shrine beside a centuries-old banyan where evening aarti rituals illuminate the sacred Godavari banks.'
      },
      {
        name: 'ISKCON Rajahmundry Temple & Spiritual Campus',
        category: 'place', rating: 4.7, reviewCount: 14000,
        sentimentScore: 0.92, recentSentimentScore: 0.93, recentReviewTrend: 'stable',
        positiveTags: ['Architecturally stunning white marble Vaishnava temple', 'Daily Bhagavata discourse and harinam sankirtana', 'Prasadam restaurant on campus'],
        negativeTags: ['Modest traditional dress expected inside', 'Located 5km from Rajahmundry centre'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 50,
        distanceMinutes: 12, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Sathya Sai Nagar',
        description: 'Grand Vaishnava spiritual campus built in white marble, famous for its daily devotional programs and prasadam dining experience.'
      },
      {
        name: 'Kadiam Rose Nurseries & Horticulture Walk',
        category: 'place', rating: 4.5, reviewCount: 6800,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'rising',
        positiveTags: ['Asia\'s largest nursery hub with 50+ varieties', 'Fragrant rose fields and bonsai galleries', 'Seasonal flower festivals'],
        negativeTags: ['10km from Rajahmundry town', 'Peak fragrance best in January-February'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 80,
        distanceMinutes: 25, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Kadiam Village',
        description: 'Asia\'s biggest wholesale nursery village blooming with thousands of rose varieties, ornamental plants, and rare bonsai specimens.'
      }
    ],
    hotels: [
      {
        name: 'Godavari Grand Hotel & Spa Rajahmundry',
        category: 'hotel', rating: 4.6, reviewCount: 2200,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'stable',
        positiveTags: ['River-view suites with Godavari vistas', 'Rooftop pool overlooking the mighty river', 'In-house Andhra cuisine restaurant'],
        negativeTags: ['Weekday conference crowd'],
        crowdLevel: 'medium', priceTier: 'luxury', estimatedCostINR: 5200,
        distanceMinutes: 8, interests: ['peaceful spots', 'food'],
        bestTimeOfDay: 'afternoon', locationZone: 'River Road',
        description: 'Riverside luxury hotel offering Godavari-view suites, a scenic rooftop pool, and a celebrated Andhra cuisine restaurant.'
      },
      {
        name: 'Rajam Hotel Heritage Courtyard Rajahmundry',
        category: 'hotel', rating: 4.4, reviewCount: 1600,
        sentimentScore: 0.86, recentSentimentScore: 0.87, recentReviewTrend: 'stable',
        positiveTags: ['Heritage courtyard architecture', 'Budget-friendly central location', 'Convenient access to ghats and temples'],
        negativeTags: ['Some rooms face internal courtyard (no outside view)', 'Older plumbing fixtures'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 2800,
        distanceMinutes: 5, interests: ['culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Main Road Central',
        description: 'Heritage property near the ghats offering courtyard rooms and quick walking access to Rajahmundry\'s temples and riverside promenades.'
      }
    ],
    restaurants: [
      {
        name: 'Godavari Kitchen Riverfront Andhra Feast',
        category: 'restaurant', rating: 4.6, reviewCount: 7400,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['Fresh Godavari river fish curry (Rohu and Catla)', 'Unlimited Andhra banana leaf meals', 'Open verandah overlooking the river'],
        negativeTags: ['Fish availability depends on river season'],
        crowdLevel: 'high', priceTier: 'moderate', estimatedCostINR: 450,
        distanceMinutes: 9, interests: ['food', 'nature'],
        bestTimeOfDay: 'afternoon', locationZone: 'Godavari Ghat Road',
        description: 'Renowned riverside kitchen serving fresh daily-caught Godavari fish curries, spicy chutneys, and unlimited banana leaf Andhra meals.'
      },
      {
        name: 'Naidu Tiffin Centre Pesarattu',
        category: 'restaurant', rating: 4.5, reviewCount: 5100,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Crispy pesarattu and upma tiffin staples', 'Strong Andhra filter coffee with chicory', 'Old-school Rajahmundry breakfast atmosphere'],
        negativeTags: ['Tiffin only until 11 AM', 'No frills decor'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 120,
        distanceMinutes: 4, interests: ['food', 'culture'],
        bestTimeOfDay: 'morning', locationZone: 'Innerspet Junction',
        description: 'Beloved dawn tiffin centre where locals start the day with piping hot pesarattu, idli vada, and strong chicory filter coffee.'
      }
    ]
  }
];

// ─── TELANGANA ─────────────────────────────────────────────────────────────────
const telanganaCities = [
  // 1. Hyderabad
  {
    city: 'Hyderabad',
    state: 'Telangana',
    places: [
      {
        name: 'Charminar & Laad Bazaar Heritage Walk',
        category: 'place', rating: 4.7, reviewCount: 58000,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['1591 Qutb Shahi victory arch with four minarets', 'Dazzling bangles and pearls in Laad Bazaar', 'Evening illuminated silhouette'],
        negativeTags: ['Congested auto-rickshaw traffic around base', 'Narrow bazaar lanes overwhelm during Ramzan'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 30,
        distanceMinutes: 8, interests: ['culture', 'food', 'nightlife'],
        bestTimeOfDay: 'evening', locationZone: 'Old City',
        description: 'Hyderabad\'s defining 1591 icon — a four-minareted victory arch framing the incandescent Laad Bazaar pearl and bangle markets.'
      },
      {
        name: 'Golconda Fort & Sound & Light Show',
        category: 'place', rating: 4.8, reviewCount: 42000,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'rising',
        positiveTags: ['Qutb Shahi diamond trading fort with acoustic clap trick', 'Spectacular evening 1-hour dramatized light show', 'Panoramic city view from Bala Hisar'],
        negativeTags: ['Steep fort climb in heat', 'Long evening show queue at gate'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 100,
        distanceMinutes: 20, interests: ['culture', 'nightlife', 'peaceful spots'],
        bestTimeOfDay: 'evening', locationZone: 'Ibrahim Bagh',
        description: 'Massive 14th-century diamond-era fortress famed for its acoustic whisper dome and a mesmerizing nightly dramatized sound-and-light show.'
      },
      {
        name: 'Hussain Sagar Lake Tank Bund & Buddha Statue',
        category: 'place', rating: 4.6, reviewCount: 34000,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'stable',
        positiveTags: ['World\'s largest monolithic rock Buddha (18m)', 'Necklace Road evening leisure promenade', 'Speed boat rides to island and back'],
        negativeTags: ['Speedboat timings limited to daytime', 'Tank Bund can get very hot midday'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 120,
        distanceMinutes: 10, interests: ['culture', 'peaceful spots', 'nightlife'],
        bestTimeOfDay: 'evening', locationZone: 'Hussain Sagar',
        description: 'Hyderabad\'s vast man-made lake anchored by a colossal 450-tonne monolithic Buddha statue on a mid-lake island.'
      },
      {
        name: 'Qutb Shahi Tombs Heritage & Persian Garden',
        category: 'place', rating: 4.7, reviewCount: 16000,
        sentimentScore: 0.92, recentSentimentScore: 0.93, recentReviewTrend: 'rising',
        positiveTags: ['Seven magnificent onion dome royal mausoleums', 'Aga Khan Trust restored Persian garden', 'UNESCO tentative world heritage site'],
        negativeTags: ['1km walk between scattered tombs in heat', 'Photography tickets extra'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 25,
        distanceMinutes: 22, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Ibrahim Bagh Complex',
        description: 'Elegantly restored necropolis of seven Qutb Shahi sultans set in Persian char-bagh gardens with onion-domed grey granite mausoleums.'
      }
    ],
    hotels: [
      {
        name: 'Taj Falaknuma Palace Hyderabad',
        category: 'hotel', rating: 4.9, reviewCount: 6200,
        sentimentScore: 0.98, recentSentimentScore: 0.99, recentReviewTrend: 'rising',
        positiveTags: ['Former Nizam\'s private palace converted to hotel', 'Iconic 300-ft scorpion-shaped royal estate', 'Butler service and horse-drawn carriage arrival'],
        negativeTags: ['Ultra-luxury price tier', 'Remote hilltop location requires car'],
        crowdLevel: 'low', priceTier: 'luxury', estimatedCostINR: 18000,
        distanceMinutes: 14, interests: ['culture', 'food', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Engine Bowli Hill',
        description: 'One of the world\'s finest palace hotels — the Nizam\'s private scorpion-shaped hilltop estate offering unparalleled Deccan-era royal luxury.'
      },
      {
        name: 'ITC Kohenur Bengaluru Luxury Convention',
        category: 'hotel', rating: 4.8, reviewCount: 4100,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'stable',
        positiveTags: ['Gleaming glass tower overlooking HITEC City skyline', 'World-class Kaya Kalpa spa', 'Dum Pukht biryani restaurant on property'],
        negativeTags: ['Very premium pricing', 'Corporate HITEC City feels business-heavy'],
        crowdLevel: 'medium', priceTier: 'luxury', estimatedCostINR: 9500,
        distanceMinutes: 16, interests: ['food', 'nightlife'],
        bestTimeOfDay: 'afternoon', locationZone: 'HITEC City Skyline',
        description: 'Spectacular glass skyscraper luxury hotel overlooking Hyderabad\'s technology corridor with the legendary Dum Pukht fine-dining restaurant.'
      }
    ],
    restaurants: [
      {
        name: "Shah Ghouse Hyderabadi Biryani Tolichowki",
        category: 'restaurant', rating: 4.7, reviewCount: 28000,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['The gold standard of Hyderabadi dum biryani since 1956', 'Richly spiced mutton and fragrant Basmati cooked in sealed handi', 'Haleem and mirchi ka salan sides'],
        negativeTags: ['Legendary queues from 7 PM onwards', 'Parking very limited on road'],
        crowdLevel: 'high', priceTier: 'moderate', estimatedCostINR: 450,
        distanceMinutes: 18, interests: ['food', 'culture', 'nightlife'],
        bestTimeOfDay: 'night', locationZone: 'Tolichowki',
        description: 'The benchmark of Hyderabadi biryani culture — a 70-year-old institution serving fragrant dum-sealed mutton biryani with miraculous consistency.'
      },
      {
        name: 'Paradise Restaurant Original Secunderabad Biryani',
        category: 'restaurant', rating: 4.7, reviewCount: 32000,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'stable',
        positiveTags: ['1953 Secunderabad flagship that built the biryani legacy', 'Chicken and mutton biryani with raita and salan', 'Multiple city outlets — original branch most prized'],
        negativeTags: ['Weekend evening wait of 30-45 minutes', 'Some say consistent but not transcendent anymore'],
        crowdLevel: 'high', priceTier: 'moderate', estimatedCostINR: 400,
        distanceMinutes: 12, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Secunderabad MG Road',
        description: 'The most iconic biryani brand in Hyderabad, feeding the city since 1953 with legendary dum-cooked chicken and mutton masterpieces.'
      }
    ]
  },

  // 2. Warangal
  {
    city: 'Warangal',
    state: 'Telangana',
    places: [
      {
        name: 'Warangal Fort & Kakatiya Kala Thoranam Gateway',
        category: 'place', rating: 4.7, reviewCount: 14000,
        sentimentScore: 0.92, recentSentimentScore: 0.93, recentReviewTrend: 'rising',
        positiveTags: ['12th-century Kakatiya dynasty capital fort', 'Majestic 12m ornate stone gateway panels', 'UNESCO tentative heritage nomination'],
        negativeTags: ['Scattered ruins require walking 2km', 'Limited shade in open granite complex'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 25,
        distanceMinutes: 8, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Hanamkonda',
        description: 'Capital citadel of the powerful Kakatiya Empire featuring four ornate monolithic granite gateway gateways of exquisite 13th-century craftsmanship.'
      },
      {
        name: 'Thousand Pillar Temple Hanamkonda',
        category: 'place', rating: 4.8, reviewCount: 18000,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'rising',
        positiveTags: ['1163 CE Kakatiya star-shaped temple masterpiece', '1000 carved basalt stone pillars', 'Trikuta (three shrine) Shiva Vishnu Surya dedication'],
        negativeTags: ['Open-air temple hot in summer', 'Photography fee'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 30,
        distanceMinutes: 12, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Hanamkonda',
        description: 'Architectural jewel of Kakatiya craftsmanship — a 12th-century star-shaped trikuta temple with 1000 beautifully carved basalt stone columns.'
      },
      {
        name: 'Ramappa Temple (Rudreswara UNESCO World Heritage)',
        category: 'place', rating: 4.9, reviewCount: 22000,
        sentimentScore: 0.97, recentSentimentScore: 0.98, recentReviewTrend: 'rising',
        positiveTags: ['UNESCO World Heritage inscription 2021', 'Floating lightweight brick shikhara', 'Exquisite Kakatiya Nataraja bracket figures'],
        negativeTags: ['77km from Warangal requires half-day excursion', 'Minimal refreshment stalls nearby'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 40,
        distanceMinutes: 90, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Palampet Village',
        description: 'India\'s newest UNESCO World Heritage temple — a 13th-century Kakatiya masterpiece renowned for floating bricks and supreme sculptural brackets.'
      },
      {
        name: 'Pakhal Lake & Eturnagaram Wildlife Sanctuary',
        category: 'place', rating: 4.6, reviewCount: 9200,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'stable',
        positiveTags: ['12th-century man-made lake surrounded by forest', 'Tiger and leopard reserve habitat', 'Boating on pristine woodland lake'],
        negativeTags: ['60km from Warangal town', 'Wildlife sightings require early safari'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 150,
        distanceMinutes: 75, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Warangal Forest Zone',
        description: 'Ancient 12th-century irrigation lake set within dense tiger reserve forest, renowned for boating, birdwatching, and rare wildlife sightings.'
      }
    ],
    hotels: [
      {
        name: 'Hotel Ratna Warangal Heritage',
        category: 'hotel', rating: 4.4, reviewCount: 1800,
        sentimentScore: 0.86, recentSentimentScore: 0.87, recentReviewTrend: 'stable',
        positiveTags: ['Comfortable rooms near Thousand Pillar Temple', 'Reliable multicuisine restaurant', 'Helpful front desk for local sightseeing coordination'],
        negativeTags: ['Modest mid-range property'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 2800,
        distanceMinutes: 10, interests: ['culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Hanamkonda Main Road',
        description: 'Convenient mid-range stay near Warangal\'s main cultural attractions, offering clean rooms and reliable Telangana cuisine.'
      },
      {
        name: 'Kakatiya Grand Hotel Warangal',
        category: 'hotel', rating: 4.5, reviewCount: 2100,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'rising',
        positiveTags: ['Well-appointed business hotel with rooftop', 'Heritage-inspired Kakatiya decor', 'On-site Telangana and Andhra cuisine'],
        negativeTags: ['City centre traffic'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 3200,
        distanceMinutes: 6, interests: ['culture', 'food'],
        bestTimeOfDay: 'afternoon', locationZone: 'Subedari Main',
        description: 'Smart city hotel with Kakatiya heritage motifs, rooftop dining, and easy proximity to Warangal\'s UNESCO heritage treasures.'
      }
    ],
    restaurants: [
      {
        name: 'Kakatiya Mess Jowar Roti & Telangana Thali',
        category: 'restaurant', rating: 4.6, reviewCount: 7200,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['Authentic Telangana jowar roti meals', 'Spicy mutton curry and gongura pachadi', 'Rustic village-style clay pot serving'],
        negativeTags: ['Functional basic dining hall', 'Very spicy — not for mild palates'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 160,
        distanceMinutes: 5, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Hanamkonda Bazaar',
        description: 'Authentic Telangana rural kitchen serving unlimited sorghum roti thali with lamb and chicken in incendiary clay pot preparations.'
      },
      {
        name: 'Sri Venkateshwara Tiffins Warangal',
        category: 'restaurant', rating: 4.4, reviewCount: 5800,
        sentimentScore: 0.87, recentSentimentScore: 0.88, recentReviewTrend: 'stable',
        positiveTags: ['Soft idli vada and crispy rava dosa', 'Strong traditional filter coffee with frothy milk', 'Reliable morning tiffin since 1980'],
        negativeTags: ['Tables limited, queuing expected at peak'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 130,
        distanceMinutes: 7, interests: ['food'],
        bestTimeOfDay: 'morning', locationZone: 'Railway Station Road',
        description: 'Dependable morning tiffin establishment near Warangal station, beloved since 1980 for consistent idlis, vadas, and filter coffee.'
      }
    ]
  },

  // 3. Nagarjuna Sagar
  {
    city: 'Nagarjuna Sagar',
    state: 'Telangana',
    places: [
      {
        name: 'Nagarjuna Sagar Dam & Reservoir Cruise',
        category: 'place', rating: 4.7, reviewCount: 19000,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'stable',
        positiveTags: ['World\'s largest masonry dam (1967)', 'Expansive blue reservoir between forested hills', 'Nagarjunakonda island boat cruise'],
        negativeTags: ['Ferry timings strictly limited', 'Very hot in summer months'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 200,
        distanceMinutes: 5, interests: ['nature', 'culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Dam Site',
        description: 'One of the world\'s largest masonry dams impounding the Krishna River — a majestic engineering feat surrounded by forested ridges.'
      },
      {
        name: 'Nagarjunakonda Archaeological Island Museum',
        category: 'place', rating: 4.8, reviewCount: 12000,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'rising',
        positiveTags: ['3rd-century Buddhist stupas rebuilt on reservoir island', 'Rare Ikshvaku dynasty sculpture gallery', 'Peaceful sacred island accessed by boat'],
        negativeTags: ['Boat timings restrictive (10 AM and 2 PM only)', 'Accessible only by 45-minute ferry'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 300,
        distanceMinutes: 20, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Nagarjunakonda Island',
        description: 'Submerged ancient Ikshvaku Buddhist capital rebuilt on a mid-reservoir island, housing rare 3rd-century AD stupa and sculpture museums.'
      },
      {
        name: 'Ethipothala Waterfall & Crocodile Sanctuary',
        category: 'place', rating: 4.5, reviewCount: 8400,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['70-foot triple cascade waterfall', 'Government-run gharial and mugger crocodile sanctuary', 'Lush riparian riverside forest'],
        negativeTags: ['11km from dam site', 'Best flow Oct-Jan; lean in summer'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 100,
        distanceMinutes: 18, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Macherla Forest',
        description: 'A 70-foot three-tiered cascade followed by a riverside crocodile sanctuary home to critically endangered Gharial and Mugger crocodiles.'
      },
      {
        name: 'Anupu Buddhist Stupa & Apsidal Chaitya Site',
        category: 'place', rating: 4.5, reviewCount: 6200,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Rare intact 2nd-century BC apsidal chaitya hall', 'Sunken monastic ruins', 'Peaceful serene heritage site'],
        negativeTags: ['Minimal interpretation boards in English', 'Remote dirt track access'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 20,
        distanceMinutes: 12, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Anupu Shore',
        description: 'Rare 2nd-century BC Buddhist monastic site rebuilt near the reservoir bank featuring an apsidal worship hall and votive pillars.'
      }
    ],
    hotels: [
      {
        name: 'Punnami Nagarjuna Sagar TSDCL Resort',
        category: 'hotel', rating: 4.4, reviewCount: 2400,
        sentimentScore: 0.86, recentSentimentScore: 0.87, recentReviewTrend: 'stable',
        positiveTags: ['Official state tourism resort near dam', 'Swimming pool overlooking the reservoir', 'Telangana cuisine restaurant on site'],
        negativeTags: ['Ageing basic facilities', 'Limited room inventory'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 3000,
        distanceMinutes: 3, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Dam Road',
        description: 'Telangana state tourism resort fronting the massive dam reservoir with pool, lawns, and organised boat tour assistance.'
      },
      {
        name: 'Vijay Vihar Island View Hotel',
        category: 'hotel', rating: 4.3, reviewCount: 1200,
        sentimentScore: 0.84, recentSentimentScore: 0.85, recentReviewTrend: 'stable',
        positiveTags: ['Reservoir views from budget-friendly rooms', 'Warm family-run hospitality', 'Boating coordination help'],
        negativeTags: ['Basic property, limited amenities'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 1800,
        distanceMinutes: 6, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Sailaguttapalli',
        description: 'Simple family-run budget hotel with pleasant reservoir views and helpful owners who coordinate dam and island boat tours.'
      }
    ],
    restaurants: [
      {
        name: 'Sagar Spice Traditional Andhra-Telangana Kitchen',
        category: 'restaurant', rating: 4.5, reviewCount: 3800,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Fresh Krishna river fish curry (Rohu and Catla)', 'Unlimited Telangana thali with jowar roti', 'Home-style rustic ambiance'],
        negativeTags: ['Limited hours (closes 3 PM)', 'No air conditioning'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 220,
        distanceMinutes: 7, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Town Centre',
        description: 'Homely kitchen dishing out fresh Krishna river fish curries and traditional Telangana thalis to hungry dam and island visitors.'
      },
      {
        name: 'Dam View Canteen & Snack Bar',
        category: 'restaurant', rating: 4.2, reviewCount: 2200,
        sentimentScore: 0.82, recentSentimentScore: 0.83, recentReviewTrend: 'stable',
        positiveTags: ['Convenient location right at dam viewing area', 'Quick tiffin, chai and snacks', 'Breezy outdoor terrace by the reservoir'],
        negativeTags: ['Basic canteen quality', 'Limited menu options'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 120,
        distanceMinutes: 2, interests: ['food', 'nature'],
        bestTimeOfDay: 'afternoon', locationZone: 'Dam Viewpoint',
        description: 'No-frills tourist canteen right at the dam viewpoint serving quick chai, snacks, and light meals with a breezy reservoir backdrop.'
      }
    ]
  },

  // 4. Karimnagar
  {
    city: 'Karimnagar',
    state: 'Telangana',
    places: [
      {
        name: 'Elgandal Fort & Manair River Island',
        category: 'place', rating: 4.6, reviewCount: 8900,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'stable',
        positiveTags: ['14th-century Bahmani fort on natural river island', 'Boats crossing to the island are thrilling', 'Panoramic Manair river views from battlements'],
        negativeTags: ['Ferry from riverbank to fort island', 'Minimal heritage signage'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 80,
        distanceMinutes: 18, interests: ['culture', 'nature', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Manair River Island',
        description: 'Dramatic 14th-century Bahmani dynasty fort standing on a natural river island, accessed by a scenic boat crossing on the Manair River.'
      },
      {
        name: 'Karimnagar Silver Filigree Craft Village',
        category: 'place', rating: 4.6, reviewCount: 7200,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['GI-tagged Karimnagar silver filigree jewellery', 'Live artisans weaving intricate silver wire patterns', 'Traditional Telangana craft heritage walk'],
        negativeTags: ['Workshop visits need advance coordination', 'Showroom closed on Sundays'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 50,
        distanceMinutes: 8, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Artisan Quarter',
        description: 'Home of Telangana\'s GI-tagged silver filigree craft, where skilled artisans weave intricate threadwork into delicate jewellery and motifs.'
      },
      {
        name: 'Ujwala Park & Manair Dam Reservoir Garden',
        category: 'place', rating: 4.4, reviewCount: 11000,
        sentimentScore: 0.86, recentSentimentScore: 0.87, recentReviewTrend: 'stable',
        positiveTags: ['Lush landscaped garden along Manair reservoir', 'Children\'s water park and boating', 'Evening musical fountain show'],
        negativeTags: ['Crowded on weekends and public holidays', 'Commercial park pricing'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 100,
        distanceMinutes: 6, interests: ['nature', 'nightlife'],
        bestTimeOfDay: 'evening', locationZone: 'Manair Riverside',
        description: 'Vibrant riverside recreation park featuring boating, children\'s rides, and a musical illuminated fountain popular with local families.'
      },
      {
        name: 'Kondagattu Anjaneya Swami Forest Temple',
        category: 'place', rating: 4.7, reviewCount: 16000,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['Ancient Hanuman shrine atop forested hilltop', 'Breathtaking sunrise views over Deccan plateau', 'Tribal natural forest sanctuary'],
        negativeTags: ['500 steps steep climb', '35km from Karimnagar town'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 40,
        distanceMinutes: 50, interests: ['culture', 'nature', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Kondagattu Hills',
        description: 'Revered forested hilltop Hanuman shrine offering sweeping Deccan plateau sunrise views and a sacred tribal forest pilgrimage.'
      }
    ],
    hotels: [
      {
        name: 'Hotel Kakatiya Residency Karimnagar',
        category: 'hotel', rating: 4.5, reviewCount: 1900,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'stable',
        positiveTags: ['Centrally located comfortable hotel', 'Multi-cuisine restaurant with Telangana specialties', 'Swimming pool and gym'],
        negativeTags: ['City center traffic noise'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 3000,
        distanceMinutes: 5, interests: ['culture', 'food'],
        bestTimeOfDay: 'afternoon', locationZone: 'Collectorate Road',
        description: 'Comfortable mid-tier business hotel in the heart of Karimnagar with reliable Telangana cuisine and modern amenities.'
      },
      {
        name: 'Crystal Inn Karimnagar Budget Comfort',
        category: 'hotel', rating: 4.3, reviewCount: 1400,
        sentimentScore: 0.84, recentSentimentScore: 0.85, recentReviewTrend: 'stable',
        positiveTags: ['Budget-friendly clean rooms near railway station', 'Helpful staff for local travel', 'Early morning tiffin on site'],
        negativeTags: ['Basic standard of furnishings'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 1800,
        distanceMinutes: 4, interests: ['culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Station Road',
        description: 'Clean and affordable budget hotel close to Karimnagar railway station, suitable for short pilgrimage and heritage visits.'
      }
    ],
    restaurants: [
      {
        name: 'Ulavacharu Regional Biryani & Telangana Meals',
        category: 'restaurant', rating: 4.6, reviewCount: 6800,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['Signature ulavacharu (horse gram rasam) biryani', 'Mutton and chicken dry curries with jowar roti', 'Regional Karimnagar culinary heritage'],
        negativeTags: ['Very spicy — intense heat profile', 'Service can be slow at peak hours'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 200,
        distanceMinutes: 6, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Main Chowk',
        description: 'Local culinary landmark famous for ulavacharu biryani — a rare horse-gram-rasam infused biryani unique to Telangana\'s Karimnagar region.'
      },
      {
        name: 'Srisailam Hotel Tiffin & South Indian Meals',
        category: 'restaurant', rating: 4.4, reviewCount: 4100,
        sentimentScore: 0.86, recentSentimentScore: 0.87, recentReviewTrend: 'stable',
        positiveTags: ['Classic pesarattu, idli vada breakfasts', 'Filter coffee and afternoon meals', 'Budget-friendly reliable daily tiffin'],
        negativeTags: ['Simple environment', 'Closes by 3 PM for evening'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 130,
        distanceMinutes: 5, interests: ['food'],
        bestTimeOfDay: 'morning', locationZone: 'Manakondur Road',
        description: 'Trusty family tiffin centre delivering consistent pesarattu, idli-vada breakfasts, and afternoon meals since the mid-1990s.'
      }
    ]
  }
];

// ─── PUDUCHERRY — additional cities (Auroville + Karaikal) ─────────────────────
const pondicities = [
  // Auroville
  {
    city: 'Auroville',
    state: 'Puducherry',
    places: [
      {
        name: 'Matrimandir Meditation Chamber & Amphitheatre',
        category: 'place', rating: 4.9, reviewCount: 22000,
        sentimentScore: 0.97, recentSentimentScore: 0.98, recentReviewTrend: 'rising',
        positiveTags: ['Iconic golden sphere meditation centre', 'Crystal globe 70cm diameter inner chamber', 'Serene Universal Township green campus'],
        negativeTags: ['Advance online passes required weeks ahead', 'No photography inside meditation chamber'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 50,
        distanceMinutes: 8, interests: ['peaceful spots', 'culture'],
        bestTimeOfDay: 'morning', locationZone: 'Auroville Centre',
        description: 'Golden spherical meditation sanctuary at the heart of Auroville — the world\'s largest intentional township experiment in human unity.'
      },
      {
        name: 'Auroville Visitors Centre & Earth Institute',
        category: 'place', rating: 4.6, reviewCount: 16000,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'stable',
        positiveTags: ['Documentary films on universal township experiment', 'Handicraft gallery and boutique store', 'Organic farm and sustainable architecture displays'],
        negativeTags: ['Documentary shows fixed timings', 'Limited parking on approach road'],
        crowdLevel: 'medium', priceTier: 'budget', estimatedCostINR: 30,
        distanceMinutes: 5, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Visitors Complex',
        description: 'Gateway hub to Auroville featuring multimedia exhibits on its founding vision, sustainable Earth architecture, and diverse community life.'
      },
      {
        name: 'Solitude Farm & Forest School Eco Retreat',
        category: 'place', rating: 4.7, reviewCount: 7400,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['Certified organic permaculture food forest', 'Sunrise yoga and guided forest bathing', 'Holistic community healing workshops'],
        negativeTags: ['Must book sessions in advance', 'Session times are fixed morning slots'],
        crowdLevel: 'low', priceTier: 'moderate', estimatedCostINR: 600,
        distanceMinutes: 14, interests: ['nature', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Auroville Farmland',
        description: 'An organic permaculture sanctuary offering guided forest walks, holistic yoga sessions, and farm-to-table sustainability workshops.'
      },
      {
        name: 'Promenade Plage & Quiet Auroville Beach',
        category: 'place', rating: 4.6, reviewCount: 9800,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'stable',
        positiveTags: ['Serene uncrowded shoreline away from Pondicherry town', 'Casuarina-shaded long beach walk', 'Sunrise yoga and quiet meditation hours'],
        negativeTags: ['No commercial stalls or beach facilities', 'Patchy road approach'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 20,
        distanceMinutes: 18, interests: ['beaches', 'peaceful spots', 'nature'],
        bestTimeOfDay: 'morning', locationZone: 'Auroville Coast',
        description: 'A pristine secluded shoreline north of Pondicherry where Auroville residents practice sunrise meditation and quiet nature immersion.'
      }
    ],
    hotels: [
      {
        name: 'Svaram Eco Village Guest House Auroville',
        category: 'hotel', rating: 4.6, reviewCount: 1400,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['Eco bamboo and mud brick village-style accommodation', 'Organic communal breakfast in the garden', 'Cycling distances to Matrimandir'],
        negativeTags: ['Intentionally minimal digital connectivity', 'Booking well in advance essential'],
        crowdLevel: 'low', priceTier: 'moderate', estimatedCostINR: 2400,
        distanceMinutes: 8, interests: ['peaceful spots', 'nature'],
        bestTimeOfDay: 'afternoon', locationZone: 'Auroville Farmland Zone',
        description: 'Eco-sensitive guesthouse built with sustainable materials, offering communal organic meals and complete digital detox immersion.'
      },
      {
        name: 'Dune Eco Village & Spa Pondicherry Coast',
        category: 'hotel', rating: 4.8, reviewCount: 2200,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'rising',
        positiveTags: ['Thatched eco villas directly on the beach', 'Holistic Ayurvedic spa with certified therapists', 'Organic farm restaurant on property'],
        negativeTags: ['High eco-luxury pricing', 'Remote beachfront access'],
        crowdLevel: 'low', priceTier: 'luxury', estimatedCostINR: 8500,
        distanceMinutes: 20, interests: ['beaches', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Chunnambar Beachfront',
        description: 'Award-winning sustainable beachfront resort with thatched eco villas, Ayurvedic spa, and a celebrated organic farm-to-table kitchen.'
      }
    ],
    restaurants: [
      {
        name: 'Auro Kitchen Farm-to-Table Organic Eatery',
        category: 'restaurant', rating: 4.7, reviewCount: 4800,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'rising',
        positiveTags: ['100% organic produce from Auroville farms', 'Creative seasonal salads and grain bowls', 'Communal dining philosophy'],
        negativeTags: ['Fixed meal time slots only', 'Vegan and vegetarian only (no meat)'],
        crowdLevel: 'low', priceTier: 'moderate', estimatedCostINR: 550,
        distanceMinutes: 6, interests: ['food', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'Auroville Inner Ring',
        description: 'An inspirational farm-to-table restaurant sourcing entirely from certified Auroville organic farms and presenting vibrant seasonal menus.'
      },
      {
        name: 'Bread & Chocolate Auroville Artisan Bakery',
        category: 'restaurant', rating: 4.6, reviewCount: 5600,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'stable',
        positiveTags: ['French-style artisan sourdough and croissants', 'Rich Belgian chocolate tarts and cakes', 'Outdoor bohemian garden cafe setting'],
        negativeTags: ['Popular — sells out by 10 AM on weekends', 'Busy weekend brunch crowd'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 500,
        distanceMinutes: 7, interests: ['food', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Auroville Boutique Row',
        description: 'The most beloved artisan bakery-cafe in Auroville, celebrated for hand-crafted sourdoughs, French pastries, and Belgian chocolate creations.'
      }
    ]
  },

  // Karaikal
  {
    city: 'Karaikal',
    state: 'Puducherry',
    places: [
      {
        name: 'Karaikal Ammaiyar Temple Ancient Shaivite Shrine',
        category: 'place', rating: 4.7, reviewCount: 12000,
        sentimentScore: 0.93, recentSentimentScore: 0.94, recentReviewTrend: 'stable',
        positiveTags: ['6th-century shrine of the Nayanmara saint Karaikkal Ammaiyar', 'Rare female Shaivite saint monument', 'Serene granite courtyard and tank'],
        negativeTags: ['Modest dress code enforced', 'Limited signage in English'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 20,
        distanceMinutes: 6, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Temple Town Core',
        description: 'Ancient shrine dedicated to Karaikkal Ammaiyar — one of the 63 Nayanmars, a 6th-century woman saint who renounced worldly life for Shiva.'
      },
      {
        name: 'Karaikal Beach & Old French Lighthouse',
        category: 'place', rating: 4.5, reviewCount: 9800,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'rising',
        positiveTags: ['Quiet unspoiled Bay of Bengal beach', 'Historic 1840 French colonial lighthouse', 'Sunrise sea fishing boat launches'],
        negativeTags: ['Basic beach infrastructure', 'Strong rip currents prohibit sea swimming'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 30,
        distanceMinutes: 8, interests: ['beaches', 'culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Karaikal Coastline',
        description: 'A quiet coastal town beach with an evocative 1840 French colonial lighthouse, popular for pre-dawn fishing and sunrise walks.'
      },
      {
        name: 'Thirunallar Dharbaranyeswara Temple',
        category: 'place', rating: 4.8, reviewCount: 18000,
        sentimentScore: 0.95, recentSentimentScore: 0.96, recentReviewTrend: 'rising',
        positiveTags: ['Saturn (Shani) affliction remedy pilgrimage temple', 'Rare sacred pond with dark cleansing waters', 'Ancient Chola temple architecture'],
        negativeTags: ['Very heavy crowds on Saturdays', '30-minute wait for the ablution tank rituals'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 50,
        distanceMinutes: 18, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Thirunallar Village',
        description: 'The most revered temple for Saturn (Shani) propitiation in South India, drawing thousands seeking liberation from Shani dosha.'
      },
      {
        name: 'Vedaranyam Salt Marsh & Flamingo Sanctuary',
        category: 'place', rating: 4.6, reviewCount: 5400,
        sentimentScore: 0.90, recentSentimentScore: 0.91, recentReviewTrend: 'rising',
        positiveTags: ['Seasonal flamingo and pelican flocks', 'Gandhi\'s Dandi march historical salt pan site', 'Pristine coastal brackish lagoon ecology'],
        negativeTags: ['45km drive from Karaikal town', 'Flamingo visits seasonal (Oct-Jan)'],
        crowdLevel: 'low', priceTier: 'budget', estimatedCostINR: 80,
        distanceMinutes: 55, interests: ['nature', 'culture', 'peaceful spots'],
        bestTimeOfDay: 'morning', locationZone: 'Pichavaram-Vedaranyam Delta',
        description: 'Historically significant Gandhi Dandi March salt pan site that transforms into a pink flamingo sanctuary in the winter migration months.'
      }
    ],
    hotels: [
      {
        name: 'Hotel Trans Karaikal Seaside Comfort',
        category: 'hotel', rating: 4.4, reviewCount: 1600,
        sentimentScore: 0.86, recentSentimentScore: 0.87, recentReviewTrend: 'stable',
        positiveTags: ['Clean comfortable rooms near beach promenade', 'On-site restaurant with Tamil-French cuisine', 'Accessible pilgrimage hotel'],
        negativeTags: ['Modest property with basic amenities'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 2600,
        distanceMinutes: 6, interests: ['culture', 'beaches'],
        bestTimeOfDay: 'afternoon', locationZone: 'Karaikal Main Road',
        description: 'Dependable mid-range hotel near Karaikal\'s beach and temples, popular with pilgrims visiting Thirunallar and heritage seekers.'
      },
      {
        name: 'Le Bougainvillea Heritage Villa Karaikal',
        category: 'hotel', rating: 4.5, reviewCount: 900,
        sentimentScore: 0.88, recentSentimentScore: 0.89, recentReviewTrend: 'rising',
        positiveTags: ['Restored French colonial bungalow', 'Lush tropical garden with bougainvillea', 'Intimate boutique hospitality'],
        negativeTags: ['Very limited rooms — book early', 'No pool or major leisure facilities'],
        crowdLevel: 'low', priceTier: 'moderate', estimatedCostINR: 3200,
        distanceMinutes: 10, interests: ['culture', 'peaceful spots'],
        bestTimeOfDay: 'afternoon', locationZone: 'French Heritage Zone',
        description: 'Intimate colonial heritage bungalow adorned with bougainvillea, offering the quiet charm of Karaikal\'s French-era architecture.'
      }
    ],
    restaurants: [
      {
        name: 'Nadodi Thalir Tamil Coastal Kitchen',
        category: 'restaurant', rating: 4.6, reviewCount: 3800,
        sentimentScore: 0.91, recentSentimentScore: 0.92, recentReviewTrend: 'rising',
        positiveTags: ['Fresh Bay of Bengal tuna and squid curries', 'Tangy tamarind-based Karaikal fish gravy', 'Coastal village ambiance with bamboo mats'],
        negativeTags: ['Fish availability varies by catch season'],
        crowdLevel: 'medium', priceTier: 'moderate', estimatedCostINR: 400,
        distanceMinutes: 7, interests: ['food', 'culture'],
        bestTimeOfDay: 'afternoon', locationZone: 'Fishermen\'s Colony',
        description: 'Authentic coastal kitchen serving same-day-caught Bay of Bengal seafood in traditional Karaikal tamarind and coconut milk preparations.'
      },
      {
        name: 'Pondicherry Biryani House & Sweet Shop Karaikal',
        category: 'restaurant', rating: 4.4, reviewCount: 4200,
        sentimentScore: 0.86, recentSentimentScore: 0.87, recentReviewTrend: 'stable',
        positiveTags: ['Aromatic Karaikal-style mutton biryani', 'Sweet pongal and milk halwa for dessert', 'Budget-friendly family meals'],
        negativeTags: ['Simple dining hall environment'],
        crowdLevel: 'high', priceTier: 'budget', estimatedCostINR: 220,
        distanceMinutes: 5, interests: ['food'],
        bestTimeOfDay: 'afternoon', locationZone: 'Bus Stand Road',
        description: 'Popular budget biryani house serving fragrant Karaikal-style mutton dum biryani and traditional Tamil sweets to local families.'
      }
    ]
  }
];

// ─── Build final item array ─────────────────────────────────────────────────────
const generatedItems = [];

function buildItems(citiesArr) {
  citiesArr.forEach(({ city, state, places, hotels, restaurants }) => {
    const code = city.toLowerCase().replace(/[^a-z0-9]/g, '');
    places.forEach((p, i) => {
      generatedItems.push({
        id: `${code}-p${i + 1}`, name: p.name, destination: city, city, state,
        category: p.category, rating: p.rating, reviewCount: p.reviewCount,
        sentimentScore: p.sentimentScore, recentSentimentScore: p.recentSentimentScore,
        recentReviewTrend: p.recentReviewTrend, positiveTags: p.positiveTags,
        negativeTags: p.negativeTags, crowdLevel: p.crowdLevel, priceTier: p.priceTier,
        estimatedCostINR: p.estimatedCostINR, distanceMinutes: p.distanceMinutes,
        interests: p.interests, bestTimeOfDay: p.bestTimeOfDay,
        locationZone: p.locationZone, description: p.description
      });
    });
    hotels.forEach((h, i) => {
      generatedItems.push({
        id: `${code}-h${i + 1}`, name: h.name, destination: city, city, state,
        category: h.category, rating: h.rating, reviewCount: h.reviewCount,
        sentimentScore: h.sentimentScore, recentSentimentScore: h.recentSentimentScore,
        recentReviewTrend: h.recentReviewTrend, positiveTags: h.positiveTags,
        negativeTags: h.negativeTags, crowdLevel: h.crowdLevel, priceTier: h.priceTier,
        estimatedCostINR: h.estimatedCostINR, distanceMinutes: h.distanceMinutes,
        interests: h.interests, bestTimeOfDay: h.bestTimeOfDay,
        locationZone: h.locationZone, description: h.description
      });
    });
    restaurants.forEach((r, i) => {
      generatedItems.push({
        id: `${code}-r${i + 1}`, name: r.name, destination: city, city, state,
        category: r.category, rating: r.rating, reviewCount: r.reviewCount,
        sentimentScore: r.sentimentScore, recentSentimentScore: r.recentSentimentScore,
        recentReviewTrend: r.recentReviewTrend, positiveTags: r.positiveTags,
        negativeTags: r.negativeTags, crowdLevel: r.crowdLevel, priceTier: r.priceTier,
        estimatedCostINR: r.estimatedCostINR, distanceMinutes: r.distanceMinutes,
        interests: r.interests, bestTimeOfDay: r.bestTimeOfDay,
        locationZone: r.locationZone, description: r.description
      });
    });
  });
}

buildItems(andhraCities);
buildItems(telanganaCities);
buildItems(pondicities);

console.log(`Generated ${generatedItems.length} new items.`);
const finalData = [...baseData, ...generatedItems];
console.log(`Total dataset: ${finalData.length} items.`);
fs.writeFileSync(destinationsPath, JSON.stringify(finalData, null, 2), 'utf-8');
console.log('Successfully wrote updated destinations.json.');
