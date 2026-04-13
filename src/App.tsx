import { useState, useEffect, useCallback } from 'react';
import { useI18n } from './i18n/context';
import type { Locale } from './i18n/context';
import { localeLabels } from './i18n/context';
import type { Resource, ScoredResource, UserRole, FamilyFilters, DonorFilters, VolunteerFilters, GeoLocation } from './types';
import { loadResources, geocodeZip, getUserLocation } from './services/dataLoader';
import { scoreFamilyMatch, scoreDonorMatch, scoreVolunteerMatch, rankResults } from './engine/scoring';
import FamilyView from './components/FamilyView';
import DonorView from './components/DonorView';
import VolunteerView from './components/VolunteerView';
import MapView from './components/MapView';

const DEFAULT_LOC: GeoLocation = { lat: 38.9072, lng: -77.0369 }; // DC center

export default function App() {
  const { locale, setLocale, t } = useI18n();
  const [role, setRole] = useState<UserRole>('family');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [zip, setZip] = useState('');
  const [userLoc, setUserLoc] = useState<GeoLocation | null>(null);
  const [searched, setSearched] = useState(false);
  const [maxDist, setMaxDist] = useState(25);
  const [results, setResults] = useState<ScoredResource[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Family filters
  const [familyFilters, setFamilyFilters] = useState<Omit<FamilyFilters, 'zip' | 'maxDistance'>>({
    foodTypes: [], dietaryNeeds: [], walkInOnly: false, languagePreference: '',
  });
  // Donor filters
  const [donorFilters, setDonorFilters] = useState<Omit<DonorFilters, 'zip' | 'maxDistance'>>({
    donationTypes: [], pickupNeeded: false, taxDeductibleOnly: false,
  });
  // Volunteer filters
  const [volunteerFilters, setVolunteerFilters] = useState<Omit<VolunteerFilters, 'zip' | 'maxDistance'>>({
    roles: [], requirementsFit: [],
  });

  // Load data on mount
  useEffect(() => {
    loadResources().then(r => { setResources(r); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const doSearch = useCallback((loc: GeoLocation) => {
    if (resources.length === 0) return;
    let scored: ScoredResource[];
    if (role === 'family') {
      scored = resources.map(r => scoreFamilyMatch(r, loc, { zip, maxDistance: maxDist, ...familyFilters }));
    } else if (role === 'donor') {
      scored = resources.map(r => scoreDonorMatch(r, loc, { zip, maxDistance: maxDist, ...donorFilters }));
    } else {
      scored = resources.map(r => scoreVolunteerMatch(r, loc, { zip, maxDistance: maxDist, ...volunteerFilters }));
    }
    setResults(rankResults(scored, maxDist, 15));
    setSearched(true);
    setSelectedId(null);
  }, [resources, role, zip, maxDist, familyFilters, donorFilters, volunteerFilters]);

  // Re-score when filters change (if already searched)
  useEffect(() => {
    if (userLoc && searched) doSearch(userLoc);
  }, [maxDist, familyFilters, donorFilters, volunteerFilters, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleZipSearch = async () => {
    if (!zip.trim()) return;
    const loc = await geocodeZip(zip.trim());
    if (loc) { setUserLoc(loc); doSearch(loc); }
    else { setUserLoc(DEFAULT_LOC); doSearch(DEFAULT_LOC); }
  };

  const handleGeolocate = async () => {
    try {
      const loc = await getUserLocation();
      setUserLoc(loc);
      setZip('');
      doSearch(loc);
    } catch {
      setUserLoc(DEFAULT_LOC);
      doSearch(DEFAULT_LOC);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleZipSearch(); };

  const roleColor = role === 'family' ? 'family' : role === 'donor' ? 'donor' : 'volunteer';

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <h1>{t.app.title}</h1>
          <span>{t.app.subtitle}</span>
        </div>
        <div className="header-right">
          <div className="lang-switcher">
            {(Object.keys(localeLabels) as Locale[]).map(l => (
              <button key={l} className={`lang-btn ${locale === l ? 'active' : ''}`} onClick={() => setLocale(l)}>
                {localeLabels[l]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <nav className="tab-nav">
        <button className={`tab-btn ${role === 'family' ? 'active-family' : ''}`} onClick={() => setRole('family')}>
          🍎 {t.nav.findFood}
        </button>
        <button className={`tab-btn ${role === 'donor' ? 'active-donor' : ''}`} onClick={() => setRole('donor')}>
          🤝 {t.nav.giveFood}
        </button>
        <button className={`tab-btn ${role === 'volunteer' ? 'active-volunteer' : ''}`} onClick={() => setRole('volunteer')}>
          ✋ {t.nav.volunteer}
        </button>
      </nav>

      {/* Main Content */}
      <div className="view-container">
        <div className="sidebar">
          {/* Search */}
          <div className="search-row">
            <input
              type="text"
              value={zip}
              onChange={e => setZip(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.common.zipPlaceholder}
              aria-label={t.common.zipPlaceholder}
            />
            <button className={`search-btn ${roleColor}`} onClick={handleZipSearch}>
              {t.common.search}
            </button>
            <button className="loc-btn" onClick={handleGeolocate} title={t.common.useMyLocation}>
              📍
            </button>
          </div>

          {/* Distance */}
          <div className="distance-row">
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-secondary)' }}>
              {t.common.maxDistance}:
            </label>
            <input
              type="range" min={5} max={50} step={5}
              value={maxDist}
              onChange={e => setMaxDist(Number(e.target.value))}
            />
            <span>{maxDist} {t.common.miles}</span>
          </div>

          {/* Role-specific filters */}
          {role === 'family' && (
            <FamilyView
              filters={familyFilters}
              setFilters={setFamilyFilters}
              results={results}
              loading={loading}
              searched={searched}
              selectedId={selectedId}
              onSelect={setSelectedId}
              roleColor={roleColor}
            />
          )}
          {role === 'donor' && (
            <DonorView
              filters={donorFilters}
              setFilters={setDonorFilters}
              results={results}
              loading={loading}
              searched={searched}
              selectedId={selectedId}
              onSelect={setSelectedId}
              roleColor={roleColor}
            />
          )}
          {role === 'volunteer' && (
            <VolunteerView
              filters={volunteerFilters}
              setFilters={setVolunteerFilters}
              results={results}
              loading={loading}
              searched={searched}
              selectedId={selectedId}
              onSelect={setSelectedId}
              roleColor={roleColor}
            />
          )}
        </div>

        {/* Map */}
        <div className="map-container">
          <MapView
            results={results}
            userLoc={userLoc}
            selectedId={selectedId}
            onSelect={setSelectedId}
            role={role}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p><strong>{t.app.title}</strong> | {t.footer.about}</p>
        <p>{t.footer.dataNote}</p>
        <p style={{ fontStyle: 'italic', opacity: 0.7 }}>{t.footer.disclaimer}</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>{t.footer.built}</p>
        <p style={{ marginTop: '0.3rem' }}>Contact us: <a href="mailto:bgao666@umd.edu">bgao666@umd.edu</a></p>
      </footer>
    </div>
  );
}
