import { useState, useMemo, useEffect, useRef } from 'react';
import type {
  Interest,
  CrowdLevel,
  UserPreferences,
  ScoredPlace,
  DayItinerary,
  TravelItem,
} from './types/travel';
import { getItemsByDestination, DEMO_DESTINATIONS } from './data/destinations';
import { scoreAllDestinationItems } from './engine/scorer';
import { buildItinerary } from './engine/itinerary';
import { fetchLiveDestinationData } from './data/api';
import './styles/app.css';

import {
  Compass,
  Search,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  MapPin,
  Clock,
  IndianRupee,
  Users,
  Sliders,
  Calendar,
  Building2,
  Utensils,
  ChevronDown,
  ChevronUp,
  Palmtree,
  Coffee,
  Trees,
  Landmark,
  Music,
  HeartHandshake,
  Flame,
  ShieldAlert,
  Check,
  ArrowDown,
} from 'lucide-react';

const ALL_INTERESTS: { id: Interest; label: string; icon: typeof Palmtree }[] = [
  { id: 'beaches', label: 'Beaches', icon: Palmtree },
  { id: 'food', label: 'Food & Cafes', icon: Coffee },
  { id: 'nature', label: 'Nature & Hills', icon: Trees },
  { id: 'culture', label: 'Culture & Heritage', icon: Landmark },
  { id: 'nightlife', label: 'Nightlife & Clubs', icon: Music },
  { id: 'peaceful spots', label: 'Peaceful Spots', icon: HeartHandshake },
];

const DESTINATION_META: Record<string, { badge: string; desc: string }> = {
  Goa: { badge: '🏖️ Coastal Haven', desc: 'Beaches, Portuguese heritage & nightlife' },
  Munnar: { badge: '🍃 Hill Station', desc: 'Misty tea estates, waterfalls & wildlife' },
  Pondicherry: { badge: '🏛️ French Quarter', desc: 'Colonial lanes, serene beaches & cafes' },
};

interface TravelerPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  targetInterests: Interest[];
  crowdTolerance: CrowdLevel;
  priorityWeights: {
    rating: number;
    budget: number;
    distance: number;
    crowd: number;
  };
}

const TRAVELER_PRESETS: TravelerPreset[] = [
  {
    id: 'party-nightlife',
    name: 'Party & Nightlife',
    icon: '🎉',
    description: 'High energy, vibrant evening crowd, close to nightlife & dining',
    targetInterests: ['nightlife', 'food', 'beaches'],
    crowdTolerance: 'high',
    priorityWeights: { rating: 3, budget: 3, distance: 4, crowd: 5 },
  },
  {
    id: 'peaceful-secluded',
    name: 'Peaceful & Secluded',
    icon: '🌿',
    description: 'Low crowd, tranquil atmosphere, quality & comfort first',
    targetInterests: ['peaceful spots', 'nature'],
    crowdTolerance: 'low',
    priorityWeights: { rating: 5, budget: 2, distance: 2, crowd: 5 },
  },
  {
    id: 'nature-hills',
    name: 'Nature & Hills',
    icon: '⛰️',
    description: 'Scenic viewpoints, outdoor trails, relaxed pacing',
    targetInterests: ['nature', 'peaceful spots'],
    crowdTolerance: 'low',
    priorityWeights: { rating: 4, budget: 3, distance: 3, crowd: 4 },
  },
  {
    id: 'heritage-cafes',
    name: 'Heritage & Cafes',
    icon: '🏛️',
    description: 'Culture, historical landmarks, local dining & easy transit',
    targetInterests: ['culture', 'food'],
    crowdTolerance: 'medium',
    priorityWeights: { rating: 4, budget: 4, distance: 4, crowd: 3 },
  },
];

export function App() {
  // Input Form State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [destination, setDestination] = useState<string>('Goa');
  const [numberOfDays, setNumberOfDays] = useState<number>(3);
  const [budgetINR, setBudgetINR] = useState<number>(20000);
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([
    'beaches',
    'nightlife',
  ]);
  const [crowdTolerance, setCrowdTolerance] = useState<CrowdLevel>('high');
  const [priorityWeights, setPriorityWeights] = useState({
    rating: 4,
    budget: 5,
    distance: 3,
    crowd: 2,
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Active Tab for Results
  const [activeTab, setActiveTab] = useState<'places' | 'itinerary' | 'hotels' | 'dining'>(
    'places'
  );

  // Loading state
  const [isComputing, setIsComputing] = useState(true);
  const isMounted = useRef(false);

  const [items, setItems] = useState<TravelItem[]>([]);
  const [dataSource, setDataSource] = useState<'static' | 'api' | 'fallback' | 'curated'>('static');

  useEffect(() => {
    let active = true;
    setIsComputing(true);

    const loadData = async () => {
      const staticItems = getItemsByDestination(destination);
      let loadedItems: TravelItem[] = [];
      let source: 'static' | 'api' | 'fallback' | 'curated' = 'static';

      if (staticItems.length > 0) {
        loadedItems = staticItems;
        source = 'static';
      } else {
        const result = await fetchLiveDestinationData(destination);
        loadedItems = result.items;
        source = result.source;
      }

      if (active) {
        setItems(loadedItems);
        setDataSource(source);
        if (source === 'static') {
          setTimeout(() => { if (active) setIsComputing(false); }, 450);
        } else {
          setIsComputing(false);
        }

        // Reset selected interests to ones that exist for that destination
        const destInterests = Array.from(
          new Set(loadedItems.flatMap((item) => item.interests || []))
        ) as Interest[];

        if (destInterests.length > 0) {
          setSelectedInterests((prev) => {
            const valid = prev.filter((i) => destInterests.includes(i));
            // A hill station or any destination without previous interests defaults to valid destination interests
            return valid.length > 0 ? valid : destInterests.slice(0, 2);
          });
        }
        setActivePreset(null);
      }
    };

    loadData();

    return () => { active = false; };
  }, [destination]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (items.length === 0) return;
    setIsComputing(true);
    const timer = setTimeout(() => setIsComputing(false), 450);
    return () => clearTimeout(timer);
  }, [numberOfDays, budgetINR, selectedInterests, crowdTolerance, priorityWeights]);

  // Compute Results dynamically based on user preferences (LOGIC UNTOUCHED)
  const currentPreferences: UserPreferences = useMemo(() => {
    return {
      destination,
      numberOfDays,
      budgetINR,
      interests: selectedInterests,
      crowdTolerance,
      priorityWeights,
    };
  }, [
    destination,
    numberOfDays,
    budgetINR,
    selectedInterests,
    crowdTolerance,
    priorityWeights,
  ]);

  const { places, hotels, restaurants } = useMemo(() => {
    return scoreAllDestinationItems(items, currentPreferences);
  }, [items, currentPreferences]);

  const topRankedPlace = places.length > 0 ? places[0] : null;

  const itinerary: DayItinerary[] = useMemo(() => {
    return buildItinerary(places, hotels, restaurants, numberOfDays, items);
  }, [places, hotels, restaurants, numberOfDays, items]);

  // Group places by Tier
  const tieredPlaces = useMemo(() => {
    return {
      mustVisit: places.filter((p) => p.tier === 'Must Visit'),
      worthVisiting: places.filter((p) => p.tier === 'Worth Visiting'),
      ifTimeAllows: places.filter((p) => p.tier === 'If Time Allows'),
      skip: places.filter((p) => p.tier === 'Skip'),
    };
  }, [places]);

  // Form Handlers
  const handleInterestToggle = (interest: Interest) => {
    setActivePreset(null);
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleWeightChange = (key: keyof typeof priorityWeights, val: number) => {
    setActivePreset(null);
    setPriorityWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Quick Traveler Presets Helper: Keeps current destination intact, updates weights, crowd tolerance, and destination-appropriate interests
  const applyPreset = (presetId: string) => {
    const preset = TRAVELER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    setCrowdTolerance(preset.crowdTolerance);
    setPriorityWeights({ ...preset.priorityWeights });

    // Available interests in currently loaded destination items
    const availableInterests = Array.from(
      new Set(items.flatMap((item) => item.interests || []))
    ) as Interest[];

    if (availableInterests.length > 0) {
      const matched = preset.targetInterests.filter((i) => availableInterests.includes(i));
      if (matched.length > 0) {
        setSelectedInterests(matched);
      } else {
        // Fallback to top available destination interests if none match
        setSelectedInterests(availableInterests.slice(0, 2));
      }
    } else {
      setSelectedInterests([...preset.targetInterests]);
    }
  };

  return (
    <div className="app-container">

      {/* =========================================
          SITE NAV BAR
          ========================================= */}
      <nav className="site-nav" style={{ margin: '0 -24px' }}>
        <div className="site-nav-inner">
          <a className="nav-logo" href="#" onClick={(e) => e.preventDefault()}>
            <span className="nav-logo-mark">
              <Compass size={18} />
            </span>
            <span className="nav-wordmark">TripLens AI</span>
          </a>

          <ul className="nav-links">
            <li><a className="nav-link" href="#" onClick={(e) => e.preventDefault()}>Home</a></li>
            <li>
              <a
                className="nav-link"
                href="#form-panel"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                className="nav-link"
                href="#ranked-places-results"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('ranked-places-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Results
              </a>
            </li>
          </ul>

          <button
            type="button"
            className="nav-cta-btn"
            onClick={() => {
              const el = document.getElementById('form-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span>Try the Planner</span>
            <ArrowDown size={15} />
          </button>
        </div>
      </nav>

      {/* =========================================
          HERO SECTION (Two-Column Asymmetric)
          ========================================= */}
      <section className="hero-wrapper">
        {/* unused glow divs kept for CSS compatibility */}
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="hero-content">
          {/* ── LEFT: Text content ── */}
          <div className="hero-left">
            <div className="hero-top-badge">
              <Sparkles size={13} />
              <span>Explainable Travel Decision Engine</span>
            </div>

            <h1 className="hero-title">
              See through<br />the travel <em>hype.</em>
            </h1>

            <p className="hero-tagline">
              Real utility scores. Transparent math.
            </p>

            <p className="hero-difference-statement">
              Unlike generic 5-star review sites, TripLens calculates multi-factor utility scores to explain exactly <strong>WHY</strong> a place is ranked for your specific budget, vibe, and crowd tolerance.
            </p>

            <div className="hero-cta-wrap">
              <button
                type="button"
                className="hero-cta-btn"
                onClick={() => {
                  const el = document.getElementById('form-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <span>Plan My Trip</span>
                <ArrowDown size={16} />
              </button>
            </div>

            {/* 4-Tier strip */}
            <div className="hero-tiers-strip">
              <span className="tiers-strip-title">4-Tier System:</span>
              <div className="tiers-strip-chips">
                <span className="tier-strip-chip chip-must">🌟 Must Visit</span>
                <span className="tier-strip-chip chip-worth">👍 Worth Visiting</span>
                <span className="tier-strip-chip chip-time">⏱️ If Time Allows</span>
                <span className="tier-strip-chip chip-skip">⛔ Skip</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="hero-stats-row">
              <div className="hero-stat">
                <span className="hero-stat-num">56</span>
                <span className="hero-stat-label">Curated Destinations</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">400+</span>
                <span className="hero-stat-label">Places Analyzed</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">4</span>
                <span className="hero-stat-label">Tier Categories</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">100%</span>
                <span className="hero-stat-label">Transparent Math</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Dark Navy Live Preview Card ── */}
          <div className="hero-right">
            <div className="hero-preview-container">
              {/* Header */}
              <div className="hero-preview-header">
                <div className="preview-label-group">
                  <span className="preview-status-dot" />
                  <span>Live Decision Output Preview</span>
                </div>
                <span className="preview-sub-pill">
                  {topRankedPlace ? `Current #1 · ${destination}` : 'Live Output'}
                </span>
              </div>

              <div className="hero-preview-inner">
                {topRankedPlace ? (
                  <>
                    {/* Inset context box */}
                    <div className="preview-inset-box">
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.4)', marginBottom: 8 }}>
                        Engine output · {destination} · {places.length} places ranked
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(245,241,234,0.55)' }}>
                        Weights: Quality {priorityWeights.rating}/5 · Budget {priorityWeights.budget}/5 · Proximity {priorityWeights.distance}/5 · Crowd {priorityWeights.crowd}/5
                      </div>
                    </div>

                    {/* Divider pill */}
                    <div className="preview-divider-pill">
                      <div className="preview-divider-line" />
                      <span className="preview-divider-label">Top Ranked Result</span>
                      <div className="preview-divider-line" />
                    </div>

                    {/* Result card */}
                    <div className="hero-preview-card">
                      <div className="preview-card-top">
                        <div className="preview-place-info">
                          <h4 className="preview-place-name">{topRankedPlace.item.name}</h4>
                          <div className="preview-place-loc">
                            <MapPin size={12} color="rgba(245,241,234,0.4)" />
                            <span>{topRankedPlace.item.locationZone} · {topRankedPlace.item.distanceMinutes} mins</span>
                          </div>
                        </div>
                        <div className="preview-score-badge">
                          <div className="preview-score-circle">
                            <span className="preview-score-val">{topRankedPlace.priorityScore}</span>
                            <span className="preview-score-denom">/100</span>
                          </div>
                          <span className="preview-tier-pill">
                            {topRankedPlace.tier === 'Must Visit' ? '🌟 Must Visit'
                              : topRankedPlace.tier === 'Worth Visiting' ? '👍 Worth Visiting'
                              : topRankedPlace.tier === 'If Time Allows' ? '⏱️ If Time Allows'
                              : '⛔ Skip'}
                          </span>
                        </div>
                      </div>

                      {/* Stat chips grid */}
                      <div className="preview-stat-chips">
                        <div className="preview-stat-chip">
                          <span className="psc-label">Rating</span>
                          <span className="psc-value">⭐ {topRankedPlace.item.rating}★</span>
                        </div>
                        <div className="preview-stat-chip">
                          <span className="psc-label">Crowd</span>
                          <span className="psc-value"><Users size={11} /> {topRankedPlace.item.crowdLevel}</span>
                        </div>
                        <div className="preview-stat-chip">
                          <span className="psc-label">Est. Cost</span>
                          <span className="psc-value">₹{topRankedPlace.item.estimatedCostINR.toLocaleString()}</span>
                        </div>
                        <div className="preview-stat-chip">
                          <span className="psc-label">Trend</span>
                          <span className="psc-value"><TrendingUp size={11} /> {topRankedPlace.item.recentReviewTrend}</span>
                        </div>
                      </div>

                      {/* Why box */}
                      <div className="preview-why-box">
                        <Sparkles size={14} color="var(--coral)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <strong style={{ color: 'rgba(245,241,234,0.9)' }}>Why this place? </strong>
                          <span>{topRankedPlace.whyExplanation}</span>
                        </div>
                      </div>

                      {/* Reality check verdict */}
                      <div className="preview-reality-box">
                        {topRankedPlace.realityCheck.isFlagged ? (
                          <ShieldAlert size={14} color="#FDA4AF" style={{ flexShrink: 0, marginTop: 1 }} />
                        ) : topRankedPlace.realityCheck.type === 'IMPROVING' ? (
                          <TrendingUp size={14} color="var(--accent-teal-mid)" style={{ flexShrink: 0, marginTop: 1 }} />
                        ) : (
                          <CheckCircle2 size={14} color="rgba(245,241,234,0.4)" style={{ flexShrink: 0, marginTop: 1 }} />
                        )}
                        <div>
                          <strong style={{ color: topRankedPlace.realityCheck.isFlagged ? '#FDA4AF' : topRankedPlace.realityCheck.type === 'IMPROVING' ? 'var(--accent-teal-mid)' : 'rgba(245,241,234,0.5)' }}>
                            {topRankedPlace.realityCheck.isFlagged
                              ? '⚠️ RATING REALITY CHECK: '
                              : topRankedPlace.realityCheck.type === 'IMPROVING'
                              ? '📈 POSITIVE TREND: '
                              : '✓ STABLE: '}
                          </strong>
                          <span>{topRankedPlace.realityCheck.message}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 24, textAlign: 'center', color: 'rgba(245,241,234,0.4)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    Loading destination data...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK DESTINATION SELECTOR PILLS */}
      <div className="destination-search-container" style={{ margin: '0 auto 16px auto', maxWidth: 800 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: 13, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search a city or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 16, outline: 'none' }}
          />
        </div>
        <div className="destination-bar">
          {DEMO_DESTINATIONS.filter(d => !searchQuery || d.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
            DEMO_DESTINATIONS.filter(d => !searchQuery || d.toLowerCase().includes(searchQuery.toLowerCase())).map((d) => {
              const isActive = destination.toLowerCase() === d.toLowerCase();
              const meta = DESTINATION_META[d];
              return (
                <button
                  key={d}
                  type="button"
                  className={`dest-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setDestination(d)}
                >
                  <span>{meta?.badge || d}</span>
                  {isActive && <Check size={16} />}
                </button>
              );
            })
          ) : (
            <div style={{ padding: '16px', color: '#64748b', textAlign: 'center', width: '100%' }}>
              No matches — try a different city or state name
            </div>
          )}
        </div>
      </div>

      {/* QUICK PRESETS BAR */}
      <div className="presets-card">
        <span className="presets-label">
          <Flame size={15} style={{ display: 'inline', marginRight: 4, color: '#f59e0b' }} />
          Traveler Presets:
        </span>
        {TRAVELER_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn ${isActive ? 'active' : ''}`}
              onClick={() => applyPreset(preset.id)}
              title={preset.description}
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* INPUT FORM PANEL */}
      <section id="form-panel" className="form-panel">
        <div className="form-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2>
              <Sliders size={22} style={{ color: 'var(--coral)' }} />
              Configure Your Trip Preferences
            </h2>
            {dataSource === 'curated' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', background: 'var(--accent-teal)', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>Curated Data</span>
            )}
            {dataSource === 'fallback' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', background: 'var(--accent-amber-mid)', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>Fallback Data</span>
            )}
            {dataSource === 'api' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', background: 'var(--coral)', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>Live API</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
            Adjust weights and constraints. The engine recalculates rankings, explanations, and itineraries in real time.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Top Form Grid: Destination, Days, Budget */}
          <div className="form-grid-top">
            {/* Destination Select */}
            <div className="form-group">
              <label htmlFor="destination-select">
                <MapPin size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--coral)' }} />
                Target Destination
              </label>
              <select
                id="destination-select"
                className="select-control"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                {DEMO_DESTINATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Trip Duration */}
            <div className="form-group">
              <label htmlFor="days-input">
                <Calendar size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--coral)' }} />
                Trip Duration (Days)
              </label>
              <input
                id="days-input"
                className="input-control"
                type="number"
                min={1}
                max={7}
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(Math.max(1, Number(e.target.value)))}
              />
            </div>

            {/* Budget */}
            <div className="form-group">
              <label htmlFor="budget-input">
                <IndianRupee size={15} style={{ display: 'inline', marginRight: 6, color: 'var(--coral)' }} />
                Total Budget (₹)
              </label>
              <input
                id="budget-input"
                className="input-control"
                type="number"
                step={500}
                min={100}
                value={budgetINR}
                onChange={(e) => setBudgetINR(Math.max(0, Number(e.target.value)))}
              />
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                Estimated <strong>₹{Math.round(budgetINR / numberOfDays).toLocaleString()}</strong> / day
              </span>
            </div>
          </div>

          {/* Interests Multi-Select */}
          <div className="interests-container">
            <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              Your Key Interests (Select multiple to apply positive utility multipliers):
            </label>
            <div className="chips-wrap">
              {ALL_INTERESTS.map(({ id, label, icon: IconComponent }) => {
                const isSelected = selectedInterests.includes(id);
                return (
                  <div
                    key={id}
                    className={`chip ${isSelected ? 'active' : ''}`}
                    onClick={() => handleInterestToggle(id)}
                  >
                    <IconComponent size={16} />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crowd Tolerance Selector */}
          <div className="crowd-selector-wrap">
            <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              <Users size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--coral)' }} />
              Crowd Tolerance Level:
            </label>
            <div className="crowd-options-grid">
              <div
                className={`crowd-option-card ${crowdTolerance === 'low' ? 'selected' : ''}`}
                onClick={() => {
                  setActivePreset(null);
                  setCrowdTolerance('low');
                }}
              >
                <div className="crowd-card-title">
                  <span>🍃 Low Crowd</span>
                  {crowdTolerance === 'low' && <CheckCircle2 size={18} color="#4f46e5" />}
                </div>
                <div className="crowd-card-desc">
                  Prioritizes serene, uncrowded secluded gems. Heavy penalty applied to congested tourist hubs.
                </div>
              </div>

              <div
                className={`crowd-option-card ${crowdTolerance === 'medium' ? 'selected' : ''}`}
                onClick={() => {
                  setActivePreset(null);
                  setCrowdTolerance('medium');
                }}
              >
                <div className="crowd-card-title">
                  <span>⚖️ Medium Crowd</span>
                  {crowdTolerance === 'medium' && <CheckCircle2 size={18} color="#4f46e5" />}
                </div>
                <div className="crowd-card-desc">
                  Comfortable with well-known attractions, popular heritage spots, and moderate visitor traffic.
                </div>
              </div>

              <div
                className={`crowd-option-card ${crowdTolerance === 'high' ? 'selected' : ''}`}
                onClick={() => {
                  setActivePreset(null);
                  setCrowdTolerance('high');
                }}
              >
                <div className="crowd-card-title">
                  <span>🔥 High Crowd</span>
                  {crowdTolerance === 'high' && <CheckCircle2 size={18} color="#4f46e5" />}
                </div>
                <div className="crowd-card-desc">
                  Thrives in high-energy nightlife, bustling beachfront shacks, street markets, and social hubs.
                </div>
              </div>
            </div>
          </div>

          {/* Priority Weights Sliders */}
          <div className="sliders-box">
            <div className="sliders-title">
              <span>Decision Factor Importance Weights (1 = Low Priority, 5 = Top Priority):</span>
              <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>
                Adjusts relative weights in the normalization algorithm
              </span>
            </div>
            <div className="sliders-grid">
              <div className="slider-item">
                <label>
                  <span>Quality & Historical Rating</span>
                  <span className="slider-val">{priorityWeights.rating} / 5</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={priorityWeights.rating}
                  onChange={(e) => handleWeightChange('rating', Number(e.target.value))}
                />
              </div>

              <div className="slider-item">
                <label>
                  <span>Budget Fit Sensitivity</span>
                  <span className="slider-val">{priorityWeights.budget} / 5</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={priorityWeights.budget}
                  onChange={(e) => handleWeightChange('budget', Number(e.target.value))}
                />
              </div>

              <div className="slider-item">
                <label>
                  <span>Proximity / Minimum Travel Time</span>
                  <span className="slider-val">{priorityWeights.distance} / 5</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={priorityWeights.distance}
                  onChange={(e) => handleWeightChange('distance', Number(e.target.value))}
                />
              </div>

              <div className="slider-item">
                <label>
                  <span>Crowd Vibe Alignment</span>
                  <span className="slider-val">{priorityWeights.crowd} / 5</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={priorityWeights.crowd}
                  onChange={(e) => handleWeightChange('crowd', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Action Button: Directly after Decision Factors */}
          <div className="see-results-action-row">
            {!destination.trim() && (
              <span className="see-results-disabled-note">
                Please enter or select a destination to compute results
              </span>
            )}
            <button
              type="button"
              className="see-results-btn"
              disabled={!destination.trim()}
              onClick={() => {
                if (!destination.trim()) return;
                setIsComputing(true);
                setTimeout(() => {
                  setIsComputing(false);
                }, 250);
                const el = document.getElementById('results-section') || document.querySelector('.tabs-nav') || document.getElementById('ranked-places-results');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <span>See Results</span>
              <ArrowDown size={16} />
            </button>
          </div>
        </form>
      </section>

      {/* NAVIGATION TABS */}
      <nav id="results-section" className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'places' ? 'active' : ''}`}
          onClick={() => setActiveTab('places')}
        >
          <Compass size={18} />
          <span>Ranked Places & Tiers</span>
          <span className="tab-badge">{places.length}</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          <Calendar size={18} />
          <span>Day-by-Day Itinerary</span>
          <span className="tab-badge">{numberOfDays} Days</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`}
          onClick={() => setActiveTab('hotels')}
        >
          <Building2 size={18} />
          <span>Matched Hotels</span>
          <span className="tab-badge">{hotels.length}</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'dining' ? 'active' : ''}`}
          onClick={() => setActiveTab('dining')}
        >
          <Utensils size={18} />
          <span>Matched Restaurants</span>
          <span className="tab-badge">{restaurants.length}</span>
        </button>
      </nav>

      {/* TAB 1: PLACES & TIERS */}
      {activeTab === 'places' && (
        isComputing ? <ComputingPlaceholder /> :
        <section id="ranked-places-results">
          {/* Tier Distribution Summary Bar */}
          <div className="tier-summary-bar">
            <div className="tier-summary-item must">
              <span className="tier-summary-label">🌟 Must Visit</span>
              <span className="tier-summary-count">{tieredPlaces.mustVisit.length}</span>
            </div>
            <div className="tier-summary-item worth">
              <span className="tier-summary-label">👍 Worth Visiting</span>
              <span className="tier-summary-count">{tieredPlaces.worthVisiting.length}</span>
            </div>
            <div className="tier-summary-item time">
              <span className="tier-summary-label">⏱️ If Time Allows</span>
              <span className="tier-summary-count">{tieredPlaces.ifTimeAllows.length}</span>
            </div>
            <div className="tier-summary-item skip">
              <span className="tier-summary-label">⛔ Skip</span>
              <span className="tier-summary-count">{tieredPlaces.skip.length}</span>
            </div>
          </div>

          {/* TIER 1: MUST VISIT */}
          <TierSection
            tierType="must"
            title="🌟 Tier 1: Must Visit"
            subtitle="Top recommendations matching your priority factors and interests"
            places={tieredPlaces.mustVisit}
          />

          {/* TIER 2: WORTH VISITING */}
          <TierSection
            tierType="worth"
            title="👍 Tier 2: Worth Visiting"
            subtitle="Strong candidates with balanced utility scores across your preferences"
            places={tieredPlaces.worthVisiting}
          />

          {/* TIER 3: IF TIME ALLOWS */}
          <TierSection
            tierType="time"
            title="⏱️ Tier 3: If Time Allows"
            subtitle="Viable secondary stops if you have spare hours or are nearby"
            places={tieredPlaces.ifTimeAllows}
          />

          {/* TIER 4: SKIP */}
          <TierSection
            tierType="skip"
            title="⛔ Tier 4: Skip"
            subtitle="Not recommended for your current crowd tolerance, budget, or interest profile"
            places={tieredPlaces.skip}
          />
        </section>
      )}

      {/* TAB 2: ITINERARY */}
      {activeTab === 'itinerary' && (
        isComputing ? <ComputingPlaceholder /> :
        <section id="itinerary-results">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: 24, fontWeight: 800 }}>
              {numberOfDays}-Day Explainable Itinerary for {destination}
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Sequenced geographically by hub zones to minimize transit time, with paired local lunch & dinner spots and hotel stay.
            </p>
          </div>

          {itinerary.map((day) => {
            const hasAnyPlaces = Boolean(day.morning || day.afternoon || day.evening);
            return (
              <div key={day.dayNumber} className="itinerary-day-card">
                <div className="day-header">
                  <h3 className="day-title">
                    <Calendar size={20} className="day-icon" />
                    Day {day.dayNumber} — {day.themeZone}
                  </h3>
                  {day.recommendedHotel && (
                    <div className="hotel-base-pill">
                      <Building2 size={14} />
                      <span>
                        Stay: {day.recommendedHotel.item.name} ({day.recommendedHotel.priorityScore}/100)
                      </span>
                    </div>
                  )}
                </div>

                {!hasAnyPlaces && (
                  <div className="timeline-notice-card">
                    <Compass size={20} className="notice-icon" />
                    <div className="notice-content">
                      <h4 className="notice-title">Open Exploration & Leisure Day</h4>
                      <p className="notice-desc">
                        All top unique curated attractions for {destination} have been scheduled into earlier days. Use this day for leisurely wanderings, artisan shopping, or revisiting favorite vistas without repeated sightseeing.
                      </p>
                    </div>
                  </div>
                )}

                <div className="timeline-flow">
                  {/* Morning Slot */}
                  {day.morning ? (
                    <div className="timeline-slot">
                      <div className="timeline-dot" />
                      <div className="slot-inner">
                        <div className="slot-header">
                          <span className="slot-badge">🌅 Morning Highlight</span>
                          <span className="slot-score-tag">
                            Score: {day.morning.priorityScore}
                          </span>
                        </div>
                        <h4 className="slot-item-name">
                          {day.morning.item.name}{' '}
                          <span className="slot-meta">
                            ({day.morning.item.locationZone} • {day.morning.item.distanceMinutes}m)
                          </span>
                        </h4>
                        <p className="slot-reason">{day.morning.whyExplanation}</p>
                      </div>
                    </div>
                  ) : hasAnyPlaces ? (
                    <div className="timeline-slot leisure">
                      <div className="timeline-dot" />
                      <div className="slot-inner leisure-spot">
                        <div className="slot-header">
                          <span className="slot-badge">🌅 Morning Free Time</span>
                        </div>
                        <h4 className="slot-item-name">Relaxed Morning Pace</h4>
                        <p className="slot-reason">Fewer unique attractions remaining in this zone. Enjoy a leisurely breakfast or stroll around your stay.</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Lunch Break */}
                  {day.lunchSpot ? (
                    <div className="timeline-slot meal">
                      <div className="timeline-dot" />
                      <div className="slot-inner meal-spot">
                        <div className="slot-header">
                          <span className="slot-badge meal-badge">
                            🍽️ Lunch Recommendation
                          </span>
                          <span className="slot-cost-tag">
                            Est. ₹{day.lunchSpot.item.estimatedCostINR}
                          </span>
                        </div>
                        <h4 className="slot-item-name">{day.lunchSpot.item.name}</h4>
                        <p className="slot-reason">{day.lunchSpot.whyExplanation}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="timeline-slot meal leisure">
                      <div className="timeline-dot" />
                      <div className="slot-inner meal-spot leisure-meal">
                        <div className="slot-header">
                          <span className="slot-badge meal-badge">
                            🍽️ Midday Dining
                          </span>
                        </div>
                        <h4 className="slot-item-name">Local Culinary Discovery</h4>
                        <p className="slot-reason">All top curated restaurants scheduled. Explore nearby neighborhood cafes or authentic regional street food.</p>
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slot */}
                  {day.afternoon ? (
                    <div className="timeline-slot">
                      <div className="timeline-dot" />
                      <div className="slot-inner">
                        <div className="slot-header">
                          <span className="slot-badge">☀️ Afternoon Activity</span>
                          <span className="slot-score-tag">
                            Score: {day.afternoon.priorityScore}
                          </span>
                        </div>
                        <h4 className="slot-item-name">
                          {day.afternoon.item.name}{' '}
                          <span className="slot-meta">
                            ({day.afternoon.item.locationZone} • {day.afternoon.item.distanceMinutes}m)
                          </span>
                        </h4>
                        <p className="slot-reason">{day.afternoon.whyExplanation}</p>
                      </div>
                    </div>
                  ) : hasAnyPlaces ? (
                    <div className="timeline-slot leisure">
                      <div className="timeline-dot" />
                      <div className="slot-inner leisure-spot">
                        <div className="slot-header">
                          <span className="slot-badge">☀️ Afternoon Leisure</span>
                        </div>
                        <h4 className="slot-item-name">Self-Paced Exploration</h4>
                        <p className="slot-reason">Fewer unique high-scoring attractions available. Ideal time to browse local handicrafts, tea shops, or unwind.</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Evening / Night Slot */}
                  {day.evening ? (
                    <div className="timeline-slot">
                      <div className="timeline-dot" />
                      <div className="slot-inner">
                        <div className="slot-header">
                          <span className="slot-badge">🌆 Evening Experience</span>
                          <span className="slot-score-tag">
                            Score: {day.evening.priorityScore}
                          </span>
                        </div>
                        <h4 className="slot-item-name">
                          {day.evening.item.name}{' '}
                          <span className="slot-meta">
                            ({day.evening.item.locationZone} • {day.evening.item.distanceMinutes}m)
                          </span>
                        </h4>
                        <p className="slot-reason">{day.evening.whyExplanation}</p>
                      </div>
                    </div>
                  ) : hasAnyPlaces ? (
                    <div className="timeline-slot leisure">
                      <div className="timeline-dot" />
                      <div className="slot-inner leisure-spot">
                        <div className="slot-header">
                          <span className="slot-badge">🌆 Sunset & Evening Leisure</span>
                        </div>
                        <h4 className="slot-item-name">Sunset Views & Unwinding</h4>
                        <p className="slot-reason">Take in sunset viewpoints, leisurely strolls along the promenade, or enjoy hotel amenities.</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Dinner Spot */}
                  {day.dinnerSpot ? (
                    <div className="timeline-slot meal">
                      <div className="timeline-dot" />
                      <div className="slot-inner meal-spot">
                        <div className="slot-header">
                          <span className="slot-badge meal-badge">
                            🍷 Dinner Recommendation
                          </span>
                          <span className="slot-cost-tag">
                            Est. ₹{day.dinnerSpot.item.estimatedCostINR}
                          </span>
                        </div>
                        <h4 className="slot-item-name">{day.dinnerSpot.item.name}</h4>
                        <p className="slot-reason">{day.dinnerSpot.whyExplanation}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="timeline-slot meal leisure">
                      <div className="timeline-dot" />
                      <div className="slot-inner meal-spot leisure-meal">
                        <div className="slot-header">
                          <span className="slot-badge meal-badge">
                            🍷 Evening Dining
                          </span>
                        </div>
                        <h4 className="slot-item-name">Chef's Choice & Night Markets</h4>
                        <p className="slot-reason">Sample vibrant night market stalls or relax with an unhurried dinner at your hotel's in-house dining.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* TAB 3: HOTELS */}
      {activeTab === 'hotels' && (
        isComputing ? <ComputingPlaceholder /> :
        <section id="hotels-results">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: 24, fontWeight: 800 }}>
              Matched Accommodations in {destination}
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Scored based on comfort ratings, distance convenience, and total budget fit for ₹{budgetINR.toLocaleString()}.
            </p>
          </div>
          <div className="places-grid">
            {hotels.map((hotel) => (
              <PlaceCard key={hotel.item.id} scored={hotel} />
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: DINING */}
      {activeTab === 'dining' && (
        isComputing ? <ComputingPlaceholder /> :
        <section id="dining-results">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: 24, fontWeight: 800 }}>
              Matched Dining & Restaurants in {destination}
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Scored by regional culinary acclaim, budget suitability, and positive recent diner reviews.
            </p>
          </div>
          <div className="places-grid">
            {restaurants.map((rest) => (
              <PlaceCard key={rest.item.id} scored={rest} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Subcomponent: AI Computing / Loading Placeholder
function ComputingPlaceholder() {
  return (
    <div className="computing-placeholder">
      <div className="computing-header">
        <div className="computing-dots">
          <span className="computing-dot" />
          <span className="computing-dot" />
          <span className="computing-dot" />
        </div>
        <p className="computing-label">Analyzing destinations with your preferences…</p>
        <p className="computing-sub">Scoring utility factors · Checking sentiment trends · Building itinerary</p>
      </div>
      <div className="skeleton-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line w-60" />
            <div className="skeleton-line w-40" />
            <div className="skeleton-line w-80" />
            <div className="skeleton-line w-50" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Subcomponent: Tier Section
function TierSection({
  tierType,
  title,
  subtitle,
  places,
}: {
  tierType: 'must' | 'worth' | 'time' | 'skip';
  title: string;
  subtitle: string;
  places: ScoredPlace[];
}) {
  if (places.length === 0) return null;

  return (
    <div className="tier-section">
      <div className="tier-section-header">
        <h3 className={`tier-title ${tierType === 'must' ? 'must-visit' : tierType === 'worth' ? 'worth-visiting' : tierType === 'time' ? 'if-time-allows' : 'skip'}`}>
          {title} ({places.length})
        </h3>
        <span className="tier-desc">{subtitle}</span>
      </div>
      <div className="places-grid">
        {places.map((place) => (
          <PlaceCard key={place.item.id} scored={place} />
        ))}
      </div>
    </div>
  );
}

// Subcomponent: Place Card with Score, Explanation, Reality Card & Reality Check
export function PlaceCard({ scored }: { scored: ScoredPlace }) {
  const { item, priorityScore, tier, whyExplanation, realityCheck, factorScores, factorPoints } = scored;
  const [showMath, setShowMath] = useState(false);

  const tierClass =
    tier === 'Must Visit'
      ? 'tier-must'
      : tier === 'Worth Visiting'
      ? 'tier-worth'
      : tier === 'If Time Allows'
      ? 'tier-time'
      : 'tier-skip';

  return (
    <div data-testid="place-card" className={`place-card ${tierClass}`}>
      {/* Top Header */}
      <div className="card-top">
        <div className="card-title-group">
          <h4 data-testid="place-name" className="place-name">
            {item.name}
          </h4>
          <div className="place-loc-sub">
            <MapPin size={14} color="rgba(245,241,234,0.4)" />
            <span>
              {item.locationZone} • {item.distanceMinutes} mins from central hub
            </span>
          </div>
        </div>

        <div className="card-score-badge">
          <div className="score-badge-circle">
            <span data-testid="priority-score" className="score-number">
              {priorityScore}
            </span>
            <span className="score-denom">/100</span>
          </div>
          <span data-testid="tier-badge" className={`tier-pill ${tierClass}`}>
            {tier}
          </span>
        </div>
      </div>

      {/* Metadata Attributes Row */}
      <div className="attributes-row">
        <span className="attr-pill">
          ⭐ <strong>{item.rating}★</strong> ({item.reviewCount.toLocaleString()})
        </span>
        <span className="attr-pill">
          <Users size={13} /> Crowd: <strong>{item.crowdLevel}</strong>
        </span>
        <span className="attr-pill">
          <IndianRupee size={13} /> Est. <strong>₹{item.estimatedCostINR.toLocaleString()}</strong> ({item.priceTier})
        </span>
        <span className="attr-pill">
          <Clock size={13} /> Best: <strong>{item.bestTimeOfDay}</strong>
        </span>
        <span className="attr-pill">
          <TrendingUp size={13} /> Trend: <strong>{item.recentReviewTrend}</strong>
        </span>
      </div>

      {/* Step 3: Why this place explanation */}
      <div data-testid="why-explanation" className="why-box">
        <Sparkles size={18} className="why-icon" />
        <div style={{ width: '100%' }}>
          <strong style={{ color: 'rgba(245,241,234,0.9)' }}>Why this place? </strong>
          <span>{whyExplanation}</span>
          {factorPoints && (
            <div className="factor-breakdown-chips" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: 'rgba(13,148,136,0.18)', color: 'var(--accent-teal-mid)', border: '1px solid rgba(20,184,166,0.3)' }}>
                ⭐ Quality: +{factorPoints.quality} pts
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}>
                💰 Budget: +{factorPoints.budget} pts
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: 'rgba(232,93,63,0.18)', color: '#FBBBA8', border: '1px solid rgba(232,93,63,0.3)' }}>
                📍 Proximity: +{factorPoints.distance} pts
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: 'rgba(255,255,255,0.07)', color: 'rgba(245,241,234,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
                👥 Crowd Vibe: +{factorPoints.crowd} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Rating Reality Check Callout */}
      <div
        data-testid="reality-check"
        className={`reality-check-box ${
          realityCheck.isFlagged ? 'warning' : realityCheck.type === 'IMPROVING' ? 'improving' : 'stable'
        }`}
      >
        {realityCheck.isFlagged ? (
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 1, color: '#FDA4AF' }} />
        ) : realityCheck.type === 'IMPROVING' ? (
          <TrendingUp size={20} style={{ flexShrink: 0, marginTop: 1, color: 'var(--accent-teal-mid)' }} />
        ) : (
          <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: 1, color: 'rgba(245,241,234,0.35)' }} />
        )}
        <div>
          <strong data-testid="reality-check-status">
            {realityCheck.isFlagged
              ? '⚠️ RATING REALITY CHECK FLAGGED'
              : realityCheck.type === 'IMPROVING'
              ? '📈 POSITIVE TREND'
              : '✓ RATING REALITY CHECK'}
            {' '}
          </strong>
          <span data-testid="reality-check-message">{realityCheck.message}</span>
        </div>
      </div>

      {/* Reality Card: What people love / complain about */}
      <div data-testid="reality-card" className="reality-card-grid">
        <div>
          <div className="reality-card-col-title positive">
            <span>💚 What People Love:</span>
          </div>
          <ul className="tag-list">
            {item.positiveTags.map((tag, i) => (
              <li key={i} className="tag-item">
                <span className="tag-dot pos" />
                <span>{tag}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="reality-card-col-title negative">
            <span>🛑 What People Complain About:</span>
          </div>
          <ul className="tag-list">
            {item.negativeTags.map((tag, i) => (
              <li key={i} className="tag-item">
                <span className="tag-dot neg" />
                <span>{tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Inspect Math Accordion (Explainability Detail) */}
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="math-toggle-btn"
          onClick={() => setShowMath(!showMath)}
        >
          {showMath ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          <span>{showMath ? 'Hide Transparent Math Breakdown' : 'Inspect AI Scoring Math Breakdown'}</span>
        </button>

        {showMath && (
          <div className="math-details-box">
            <div className="math-row">
              <span>Normalized Rating + Sentiment Utility:</span>
              <strong>{factorScores.quality} / 1.0 {factorPoints ? `(→ +${factorPoints.quality} pts)` : ''}</strong>
            </div>
            <div className="math-row">
              <span>Budget Affordability Utility:</span>
              <strong>{factorScores.budget} / 1.0 {factorPoints ? `(→ +${factorPoints.budget} pts)` : ''}</strong>
            </div>
            <div className="math-row">
              <span>Transit / Proximity Utility:</span>
              <strong>{factorScores.distance} / 1.0 {factorPoints ? `(→ +${factorPoints.distance} pts)` : ''}</strong>
            </div>
            <div className="math-row">
              <span>Crowd Tolerance Fit:</span>
              <strong>{factorScores.crowd} / 1.0 {factorPoints ? `(→ +${factorPoints.crowd} pts)` : ''}</strong>
            </div>
            <div className="math-row">
              <span>Interest Match Multiplier:</span>
              <strong>{factorScores.interestBonus}x</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
