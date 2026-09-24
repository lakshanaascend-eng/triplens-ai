# TripLens AI 🧭
### Explainable AI Travel Decision Engine

> **See through the travel hype.** TripLens uses multi-factor utility scoring, cross-references recent review sentiment against historical ratings, and explains the *exact drivers* behind every recommendation — no black boxes.

**Live demo:** `http://localhost:4173` · Built with Vite + React + TypeScript · 100% client-side

---

## What It Does

Most travel apps show you a list sorted by star rating. TripLens does something fundamentally different:

1. **You configure your priorities** — rate how much you care about quality, budget fit, proximity, and crowd vibe on 1–5 sliders.
2. **The engine computes a personalised utility score** for every place, hotel, and restaurant at a destination, applying your interest tags as multipliers.
3. **Every recommendation is explained** — "Ranked high because it matches your interest in beaches & nightlife, alongside comfortably within your ₹15,000 budget."
4. **A Rating Reality Check** flags places where recent traveller sentiment has diverged significantly from the historical star rating — so you don't get burned by a once-great spot that's now overcrowded or declining.
5. **A geo-sequenced day itinerary** clusters top-ranked places by location zone and time of day to minimise transit time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (Vite) |
| Styling | Plain CSS custom properties — no Tailwind, no UI library |
| Icons | `lucide-react` |
| Data | Local JSON seed file (54 entities across 3 destinations) |
| Scoring | Pure TypeScript, in-browser, zero API calls |
| Testing | Node.js logic tests + Playwright E2E browser tests |

---

## Scoring Algorithm

All logic lives in [`src/engine/scorer.ts`](src/engine/scorer.ts). Here's the full chain:

### Step 1 — Normalise each factor to \[0, 1\]

| Factor | Formula |
|---|---|
| **Quality** | `0.65 × normRating + 0.35 × sentimentScore` |
| **Budget fit** | Exponential decay based on how `estimatedCostINR` compares to `dailyBudget ÷ category_fraction` |
| **Proximity** | `max(0.05, 1 − distanceMinutes / 90)` |
| **Crowd match** | Lookup table: `(placeCrowdLevel, userCrowdTolerance)` → score in `{0.0, 0.5, 0.75, 0.9, 1.0}` |

### Step 2 — Weighted base utility

```
priority weights → softmax-normalise → Σ (weight_k × utility_k)
```

The user's four sliders (1–5) are normalised so they always sum to 1 before the dot product.

### Step 3 — Interest multiplier

```
interestBonus = 1.0 + min(0.35, matchCount × 0.18)   # each matching interest adds 18%, capped at +35%
             = 0.82   # if interests are selected but zero match (mismatch penalty)
             = 1.0    # if no interests selected (neutral)
```

### Step 4 — Trend multiplier

| `recentReviewTrend` | Multiplier |
|---|---|
| `rising` | × 1.03 |
| `stable` | × 1.00 |
| `falling` | × 0.94 |

### Step 5 — Final score

```
finalScore = round(baseUtility × interestBonus × trendMultiplier × 100)
```

### Tier Assignment

| Score | Tier |
|---|---|
| ≥ 78 | 🌟 Must Visit |
| ≥ 60 | 👍 Worth Visiting |
| ≥ 45 | ⏱️ If Time Allows |
| < 45 | ⛔ Skip |

> A fatal crowd mismatch (place is `high` crowd, user wants `low`) can force a place to **Skip** regardless of score.

---

## Rating Reality Check

For every place, TripLens compares its **historical star rating** (`rating`) with **recent traveller sentiment** (`recentSentimentScore`, scaled to ★):

```
discrepancy = historicalRating − recentEquivalent

⚠️ FLAG WARNING  if discrepancy ≥ 0.65
⚠️ FLAG WARNING  if trend = 'falling' AND discrepancy ≥ 0.4
📈 FLAG IMPROVING if recentEquivalent − rating ≥ 0.4 OR trend = 'rising'
```

This catches places whose Google rating hasn't caught up with a recent drop in quality — the kind of thing that ruins a trip.

---

## Seed Data

Over **243 travel entities** are seeded in [`src/data/destinations.json`](src/data/destinations.json) across Goa, Puducherry, Kerala, Tamil Nadu, and Karnataka:

| Destination / Region | Places | Hotels | Restaurants | Notes |
|---|---|---|---|---|
| 🏖️ Goa | 11 | 4 | 4 | Beaches, nightlife, colonial heritage |
| 🏛️ Pondicherry | 9 | 4 | 4 | French Quarter, spirituality, seaside promenade |
| 🌴 **Kerala (9 Cities)** | **41** | **20** | **20** | **State search aggregates all 9 cities** |
| 🍃 Munnar | 9 | 4 | 4 | Tea estates, waterfalls, misty peaks |
| 🚣 Alleppey | 4 | 2 | 2 | Backwaters, houseboats, Marari beach |
| ⚓ Kochi | 4 | 2 | 2 | Chinese fishing nets, Kathakali, Fort Kochi |
| ⛰️ Wayanad | 4 | 2 | 2 | Earthen dam, Edakkal caves, Chembra trek |
| 🐅 Thekkady | 4 | 2 | 2 | Periyar wildlife, spice gardens, Kalaripayattu |
| 🏖️ Kovalam | 4 | 2 | 2 | Crescent beaches, lighthouse, clifftops |
| 🌊 Varkala | 4 | 2 | 2 | Red sandstone cliffs, Papanasam, cafes |
| 🪷 Kumarakom | 4 | 2 | 2 | Vembanad lake, bird sanctuary, village life |
| 🛕 Thrissur | 4 | 2 | 2 | Cultural capital, Vadakkunnathan, Pooram |
| 🛕 **Tamil Nadu (8 Cities)** | **32** | **16** | **16** | **State search aggregates all 8 cities** |
| 🚂 Ooty | 4 | 2 | 2 | Nilgiri toy train, Doddabetta, botanical gardens |
| 🌆 Chennai | 4 | 2 | 2 | Marina beach, Kapaleeshwarar, San Thome |
| 🏛️ Madurai | 4 | 2 | 2 | Meenakshi Amman, Thirumalai Nayakkar palace |
| 🧘 Coimbatore | 4 | 2 | 2 | Adiyogi Shiva, Marudhamalai, Siruvani waterfalls |
| 🌲 Kodaikanal | 4 | 2 | 2 | Kodai lake, Pillar rocks, Bryant park |
| 🌊 Rameswaram | 4 | 2 | 2 | Ramanathaswamy temple, Dhanushkodi ghost town |
| 🌅 Kanyakumari | 4 | 2 | 2 | Vivekananda rock, Triveni Sangam, Padmanabhapuram |
| 🗿 Mahabalipuram | 4 | 2 | 2 | Shore Temple, Pancha Rathas, Arjuna's Penance |
| 🐘 **Karnataka (8 Cities)** | **32** | **16** | **16** | **State search aggregates all 8 cities** |
| 🌳 Bangalore | 4 | 2 | 2 | Lalbagh, Cubbon Park, microbreweries |
| 👑 Mysore | 4 | 2 | 2 | Mysore Palace illumination, Chamundi hill |
| ☕ Coorg | 4 | 2 | 2 | Abbey Falls, Raja's Seat, Namdroling Golden Temple |
| 🏛️ Hampi | 4 | 2 | 2 | Virupaksha, Stone Chariot, Matanga hill sunrise |
| ⛰️ Chikmagalur | 4 | 2 | 2 | Mullayanagiri peak, Baba Budan Giri, coffee estates |
| 🏖️ Gokarna | 4 | 2 | 2 | Om Beach, Kudle beach, Mahabaleshwar temple |
| 🛕 Udupi | 4 | 2 | 2 | Sri Krishna Matha, Malpe & St. Mary's Islands |
| 🪨 Badami | 4 | 2 | 2 | 6th-century rock cut cave temples, Agastya lake |

Each entity carries: `name`, `city`, `state`, `destination`, `category`, `rating`, `reviewCount`, `sentimentScore`, `recentSentimentScore`, `recentReviewTrend`, `positiveTags`, `negativeTags`, `crowdLevel`, `priceTier`, `estimatedCostINR`, `distanceMinutes`, `interests`, `bestTimeOfDay`, `locationZone`, `description`.

### Two-Level Matching Engine
- **City-level match**: Direct query matches any specific city (e.g., `Mysore`, `Ooty`, `Thrissur`, `Hampi`, `Kochi`).
- **State-level aggregation**: Searching `Kerala`, `Tamil Nadu`, or `Karnataka` dynamically aggregates and ranks all entities within that entire state simultaneously.

---

## Running Locally

```bash
# Install dependencies
npm install

# Dev server (hot reload)
npm run dev

# Production build + preview
npm run build
npm run preview -- --port 4173
```

### Tests

```bash
# Logic-only scoring tests (no browser)
node scripts/verify.mjs

# Full Playwright E2E browser tests
node scripts/browser-test.mjs

# Edge-case stress tests (₹500 budget, ₹2L budget, zero interests, all 3 destinations)
node scripts/stress-test.mjs
```

---

## Key Design Decisions

- **No hardcoded output** — every recommendation is computed in real time from the user's slider values and interest selections. Change a single slider and every score, explanation, tier, and itinerary slot recalculates.
- **Explainability first** — the "Why this place?" callout and the "Inspect AI Scoring Math Breakdown" accordion show exactly which factors drove a score, not just the final number.
- **Reality Check over raw ratings** — distinguishes between a place's reputation and its current experience, catching post-peak or seasonally degraded spots.
- **Geo-sequenced itinerary** — places are clustered by `locationZone` and `bestTimeOfDay` (morning / afternoon / evening) to build a day plan that minimises backtracking, not just ranking order.
- **Graceful edge cases** — tested with ₹500 total budget (no crash, cheap spots rise), ₹2,00,000 budget (luxury resorts rise), and zero interests selected (pure objective ranking).

---

## Project Structure

```
triplens-ai/
├── public/
│   └── favicon.svg              # Compass SVG favicon
├── src/
│   ├── data/
│   │   ├── destinations.json    # 54-entity seed dataset
│   │   └── destinations.ts      # Data access helpers
│   ├── engine/
│   │   ├── scorer.ts            # Core scoring + reality check + tier logic
│   │   └── itinerary.ts         # Day-by-day itinerary sequencer
│   ├── types/
│   │   └── travel.ts            # TypeScript interfaces
│   ├── styles/
│   │   └── app.css              # Custom CSS (responsive, no framework)
│   └── App.tsx                  # React UI — form, tabs, cards
├── scripts/
│   ├── verify.mjs               # Node scoring logic tests
│   ├── browser-test.mjs         # Playwright E2E tests
│   └── stress-test.mjs          # Edge case tests
└── index.html
```

---

*Built for demo purposes. All place data is seeded for illustration — not a live travel API.*
