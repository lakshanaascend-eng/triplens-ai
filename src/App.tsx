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
  ShieldAlert,
  Flame,
  Target,
  Map,
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
      if (staticItems.length > 0) {
        if (active) {
          setItems(staticItems);
          setDataSource('static');
          setTimeout(() => { if (active) setIsComputing(false); }, 450);
        }
        return;
      }

      const result = await fetchLiveDestinationData(destination);
      if (active) {
        setItems(result.items);
        setDataSource(result.source);
        setIsComputing(false);
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

  const itinerary: DayItinerary[] = useMemo(() => {
    return buildItinerary(places, hotels, restaurants, numberOfDays);
  }, [places, hotels, restaurants, numberOfDays]);

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
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleWeightChange = (key: keyof typeof priorityWeights, val: number) => {
    setPriorityWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Quick Preset Helper
  const applyPreset = (presetName: string) => {
    if (presetName === 'goa-party') {
      setDestination('Goa');
      setNumberOfDays(3);
      setBudgetINR(15000);
      setSelectedInterests(['nightlife', 'beaches', 'food']);
      setCrowdTolerance('high');
      setPriorityWeights({ rating: 3, budget: 5, distance: 3, crowd: 1 });
    } else if (presetName === 'goa-peace') {
      setDestination('Goa');
      setNumberOfDays(3);
      setBudgetINR(45000);
      setSelectedInterests(['peaceful spots', 'nature', 'beaches']);
      setCrowdTolerance('low');
      setPriorityWeights({ rating: 5, budget: 1, distance: 2, crowd: 5 });
    } else if (presetName === 'munnar-nature') {
      setDestination('Munnar');
      setNumberOfDays(4);
      setBudgetINR(25000);
      setSelectedInterests(['nature', 'peaceful spots']);
      setCrowdTolerance('low');
      setPriorityWeights({ rating: 5, budget: 3, distance: 2, crowd: 4 });
    } else if (presetName === 'pondi-culture') {
      setDestination('Pondicherry');
      setNumberOfDays(2);
      setBudgetINR(18000);
      setSelectedInterests(['culture', 'food', 'peaceful spots']);
      setCrowdTolerance('medium');
      setPriorityWeights({ rating: 4, budget: 3, distance: 4, crowd: 3 });
    }
  };

  return (
    <div className="app-container">
      {/* =========================================
          HERO SECTION
          ========================================= */}
      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section className="hero-wrapper">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="hero-content">
          <div className="hero-top-badge">
            <Sparkles size={15} color="#a5b4fc" />
            <span>EXPLAINABLE TRAVEL DECISION ENGINE</span>
          </div>

          <h1 className="hero-title">
            TripLens AI
          </h1>

          <p className="hero-tagline">
            See through the travel hype.
          </p>

          <p className="hero-difference-statement">
            Unlike generic 5-star review sites, TripLens calculates multi-factor utility scores to explain exactly <strong>WHY</strong> a place is ranked for your specific budget, vibe, and crowd tolerance.
          </p>

          {/* 3 Short Feature Highlights */}
          <div className="hero-features-row">
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <Target size={20} />
              </div>
              <div className="hero-feature-text">
                <div className="feature-title">Explainable Rankings</div>
                <div className="feature-desc">Reveals exactly why each place fits your personal priorities</div>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon alert">
                <ShieldAlert size={20} />
              </div>
              <div className="hero-feature-text">
                <div className="feature-title">Rating Reality Check</div>
                <div className="feature-desc">Catches when recent traveler sentiment disagrees with historical stars</div>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <Map size={20} />
              </div>
              <div className="hero-feature-text">
                <div className="feature-title">Pan-India Coverage</div>
                <div className="feature-desc">50+ curated destinations across North & South India</div>
              </div>
            </div>
          </div>

          {/* 4-Tier Visual System Strip */}
          <div className="hero-tiers-strip">
            <span className="tiers-strip-title">4-Tier System:</span>
            <div className="tiers-strip-chips">
              <span className="tier-strip-chip chip-must">🌟 Must Visit (90–100)</span>
              <span className="tier-strip-chip chip-worth">👍 Worth Visiting (75–89)</span>
              <span className="tier-strip-chip chip-time">⏱️ If Time Allows (60–74)</span>
              <span className="tier-strip-chip chip-skip">⛔ Skip (&lt;60)</span>
            </div>
          </div>

          {/* Visual Example / Output Preview Mockup */}
          <div className="hero-preview-container">
            <div className="hero-preview-header">
              <div className="preview-label-group">
                <Sparkles size={14} color="#818cf8" />
                <span className="preview-label">Live Decision Output Preview</span>
              </div>
              <span className="preview-sub-pill">What TripLens Generates</span>
            </div>

            <div className="hero-preview-card">
              <div className="preview-card-top">
                <div className="preview-place-info">
                  <h4 className="preview-place-name">Baga Beach, North Goa</h4>
                  <div className="preview-place-loc">
                    <MapPin size={13} color="#94a3b8" />
                    <span>Calangute Hub • 15 mins transit</span>
                  </div>
                </div>
                <div className="preview-score-badge">
                  <div className="preview-score-circle">
                    <span className="preview-score-val">92</span>
                    <span className="preview-score-denom">/100</span>
                  </div>
                  <span className="preview-tier-pill">🌟 Must Visit</span>
                </div>
              </div>

              <div className="preview-attributes-row">
                <span className="preview-attr-pill">⭐ <strong>4.6★</strong> (18,400 reviews)</span>
                <span className="preview-attr-pill"><Users size={12} /> Crowd: <strong>High</strong></span>
                <span className="preview-attr-pill"><IndianRupee size={12} /> Est. <strong>₹1,200</strong></span>
                <span className="preview-attr-pill"><TrendingUp size={12} /> Trend: <strong>Stable</strong></span>
              </div>

              <div className="preview-why-box">
                <Sparkles size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: '#0369a1' }}>Why this place? </strong>
                  <span>Ranked #1 for you: Matches your beachfront & nightlife interests with lively evening crowd energy while staying comfortably inside your budget.</span>
                </div>
              </div>

              <div className="preview-reality-box">
                <ShieldAlert size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: '#e11d48' }}>⚠️ RATING REALITY CHECK FLAGGED: </strong>
                  <span>Recent sentiment dropped 14% due to peak-season taxi congestion — visit before 6 PM to beat the rush.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Obvious Call to Action */}
          <div className="hero-cta-wrap">
            <button
              type="button"
              className="hero-cta-btn"
              onClick={() => {
                const el = document.getElementById('form-panel');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <span>Plan My Trip</span>
              <ArrowDown size={18} />
            </button>
            <span className="hero-cta-note">Instant AI ranking & geo-sequenced itineraries · 100% transparent math</span>
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
        <button
          type="button"
          className="preset-btn"
          onClick={() => applyPreset('goa-party')}
        >
          Preset 1: Goa Party & Nightlife (High crowd, Budget focus)
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => applyPreset('goa-peace')}
        >
          Preset 2: Goa Serenity & Secluded (Low crowd, Peaceful spots)
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => applyPreset('munnar-nature')}
        >
          Preset 3: Munnar Mountain Nature
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => applyPreset('pondi-culture')}
        >
          Preset 4: Pondicherry Heritage & Cafes
        </button>
      </div>

      {/* INPUT FORM PANEL */}
      <section id="form-panel" className="form-panel">
        <div className="form-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2>
              <Sliders size={22} style={{ color: '#4f46e5' }} />
              Configure Your Trip Preferences
            </h2>
            {dataSource === 'curated' && (
              <span style={{ fontSize: 11, background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>CURATED DATA</span>
            )}
            {dataSource === 'fallback' && (
              <span style={{ fontSize: 11, background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>FALLBACK DATA</span>
            )}
            {dataSource === 'api' && (
              <span style={{ fontSize: 11, background: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>LIVE API</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Adjust weights and constraints. The engine recalculates rankings, explanations, and itineraries in real time.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Top Form Grid: Destination, Days, Budget */}
          <div className="form-grid-top">
            {/* Destination Select */}
            <div className="form-group">
              <label htmlFor="destination-select">
                <MapPin size={15} style={{ display: 'inline', marginRight: 6, color: '#4f46e5' }} />
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
                <Calendar size={15} style={{ display: 'inline', marginRight: 6, color: '#4f46e5' }} />
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
                <IndianRupee size={15} style={{ display: 'inline', marginRight: 6, color: '#4f46e5' }} />
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
              <span style={{ fontSize: 12.5, color: '#64748b', display: 'block', marginTop: 4 }}>
                Estimated <strong>₹{Math.round(budgetINR / numberOfDays).toLocaleString()}</strong> / day
              </span>
            </div>
          </div>

          {/* Interests Multi-Select */}
          <div className="interests-container">
            <label style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
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
            <label style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              <Users size={16} style={{ display: 'inline', marginRight: 6, color: '#4f46e5' }} />
              Crowd Tolerance Level:
            </label>
            <div className="crowd-options-grid">
              <div
                className={`crowd-option-card ${crowdTolerance === 'low' ? 'selected' : ''}`}
                onClick={() => setCrowdTolerance('low')}
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
                onClick={() => setCrowdTolerance('medium')}
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
                onClick={() => setCrowdTolerance('high')}
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
        </form>
      </section>

      {/* NAVIGATION TABS */}
      <nav className="tabs-nav">
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

          {itinerary.map((day) => (
            <div key={day.dayNumber} className="itinerary-day-card">
              <div className="day-header">
                <h3 className="day-title">
                  <Calendar size={22} color="#4f46e5" />
                  Day {day.dayNumber} — {day.themeZone}
                </h3>
                {day.recommendedHotel && (
                  <div className="hotel-base-pill">
                    <Building2 size={15} />
                    <span>
                      Stay: {day.recommendedHotel.item.name} ({day.recommendedHotel.priorityScore}/100)
                    </span>
                  </div>
                )}
              </div>

              <div className="timeline-flow">
                {/* Morning Slot */}
                {day.morning && (
                  <div className="timeline-slot">
                    <div className="timeline-dot" />
                    <div className="slot-inner">
                      <div className="slot-header">
                        <span className="slot-badge">🌅 Morning Highlight</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#4f46e5' }}>
                          Score: {day.morning.priorityScore}
                        </span>
                      </div>
                      <h4 className="slot-item-name">
                        {day.morning.item.name}{' '}
                        <span style={{ fontSize: 13, fontWeight: 'normal', color: '#64748b' }}>
                          ({day.morning.item.locationZone} • {day.morning.item.distanceMinutes}m)
                        </span>
                      </h4>
                      <p className="slot-reason">{day.morning.whyExplanation}</p>
                    </div>
                  </div>
                )}

                {/* Lunch Break */}
                {day.lunchSpot && (
                  <div className="timeline-slot meal">
                    <div className="timeline-dot" />
                    <div className="slot-inner meal-spot">
                      <div className="slot-header">
                        <span className="slot-badge" style={{ color: '#b45309' }}>
                          🍽️ Lunch Recommendation
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#b45309' }}>
                          Est. ₹{day.lunchSpot.item.estimatedCostINR}
                        </span>
                      </div>
                      <h4 className="slot-item-name">{day.lunchSpot.item.name}</h4>
                      <p className="slot-reason">{day.lunchSpot.whyExplanation}</p>
                    </div>
                  </div>
                )}

                {/* Afternoon Slot */}
                {day.afternoon && (
                  <div className="timeline-slot">
                    <div className="timeline-dot" />
                    <div className="slot-inner">
                      <div className="slot-header">
                        <span className="slot-badge">☀️ Afternoon Activity</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#4f46e5' }}>
                          Score: {day.afternoon.priorityScore}
                        </span>
                      </div>
                      <h4 className="slot-item-name">
                        {day.afternoon.item.name}{' '}
                        <span style={{ fontSize: 13, fontWeight: 'normal', color: '#64748b' }}>
                          ({day.afternoon.item.locationZone} • {day.afternoon.item.distanceMinutes}m)
                        </span>
                      </h4>
                      <p className="slot-reason">{day.afternoon.whyExplanation}</p>
                    </div>
                  </div>
                )}

                {/* Evening / Night Slot */}
                {day.evening && (
                  <div className="timeline-slot">
                    <div className="timeline-dot" />
                    <div className="slot-inner">
                      <div className="slot-header">
                        <span className="slot-badge">🌆 Evening Experience</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#4f46e5' }}>
                          Score: {day.evening.priorityScore}
                        </span>
                      </div>
                      <h4 className="slot-item-name">
                        {day.evening.item.name}{' '}
                        <span style={{ fontSize: 13, fontWeight: 'normal', color: '#64748b' }}>
                          ({day.evening.item.locationZone} • {day.evening.item.distanceMinutes}m)
                        </span>
                      </h4>
                      <p className="slot-reason">{day.evening.whyExplanation}</p>
                    </div>
                  </div>
                )}

                {/* Dinner Spot */}
                {day.dinnerSpot && (
                  <div className="timeline-slot meal">
                    <div className="timeline-dot" />
                    <div className="slot-inner meal-spot">
                      <div className="slot-header">
                        <span className="slot-badge" style={{ color: '#b45309' }}>
                          🍷 Dinner Recommendation
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#b45309' }}>
                          Est. ₹{day.dinnerSpot.item.estimatedCostINR}
                        </span>
                      </div>
                      <h4 className="slot-item-name">{day.dinnerSpot.item.name}</h4>
                      <p className="slot-reason">{day.dinnerSpot.whyExplanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
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
            <MapPin size={14} color="#64748b" />
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
          <strong style={{ color: '#0369a1' }}>Why this place? </strong>
          <span>{whyExplanation}</span>
          {factorPoints && (
            <div className="factor-breakdown-chips" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1' }}>
                ⭐ Quality: +{factorPoints.quality} pts
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#dcfce7', color: '#15803d' }}>
                💰 Budget: +{factorPoints.budget} pts
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#fef9c3', color: '#854d0e' }}>
                📍 Proximity: +{factorPoints.distance} pts
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#fce7f3', color: '#9d174d' }}>
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
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 1, color: '#e11d48' }} />
        ) : realityCheck.type === 'IMPROVING' ? (
          <TrendingUp size={20} style={{ flexShrink: 0, marginTop: 1, color: '#16a34a' }} />
        ) : (
          <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: 1, color: '#64748b' }} />
        )}
        <div>
          <strong data-testid="reality-check-status">
            {realityCheck.isFlagged
              ? '⚠️ RATING REALITY CHECK FLAGGED'
              : realityCheck.type === 'IMPROVING'
              ? '📈 POSITIVE TREND'
              : '✓ RATING REALITY CHECK'}
            :{' '}
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
