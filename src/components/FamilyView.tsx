import { useI18n } from '../i18n/context';
import type { FamilyFilters, ScoredResource } from '../types';
import ResultCard from './ResultCard';

const FOOD_TYPES = ['Groceries', 'Hot Meals', 'Fresh Produce', 'Canned Goods', 'Baby Food', 'Halal', 'Kosher'];
const DIETARY = ['Vegetarian', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free'];

interface Props {
  filters: Omit<FamilyFilters, 'zip' | 'maxDistance'>;
  setFilters: (f: Omit<FamilyFilters, 'zip' | 'maxDistance'>) => void;
  results: ScoredResource[];
  loading: boolean;
  searched: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  roleColor: string;
}

function toggleArray(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export default function FamilyView({ filters, setFilters, results, loading, searched, selectedId, onSelect, roleColor }: Props) {
  const { t } = useI18n();

  return (
    <>
      {/* Header */}
      <div className="sidebar-header">
        <h2>🍎 {t.family.title}</h2>
        <p>{t.family.description}</p>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <div className="filter-group" style={{ width: '100%' }}>
          <label>{t.family.foodTypes}</label>
          <div className="chip-group">
            {FOOD_TYPES.map(ft => (
              <button
                key={ft}
                className={`chip ${filters.foodTypes.includes(ft) ? 'selected' : ''}`}
                onClick={() => setFilters({ ...filters, foodTypes: toggleArray(filters.foodTypes, ft) })}
              >
                {ft}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group" style={{ width: '100%' }}>
          <label>{t.family.dietaryNeeds}</label>
          <div className="chip-group">
            {DIETARY.map(d => (
              <button
                key={d}
                className={`chip ${filters.dietaryNeeds.includes(d) ? 'selected' : ''}`}
                onClick={() => setFilters({ ...filters, dietaryNeeds: toggleArray(filters.dietaryNeeds, d) })}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.walkInOnly}
            onChange={e => setFilters({ ...filters, walkInOnly: e.target.checked })}
          />
          {t.family.walkInOnly}
        </label>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><p>{t.common.loading}</p></div>
      ) : !searched ? (
        <div className="welcome-banner">
          <h2>{t.family.title}</h2>
          <p>{t.app.tagline}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🔍</div><p>{t.common.noResults}</p></div>
      ) : (
        <>
          <div className="results-count">{results.length} {t.common.results}</div>
          <div className="results-list">
            {results.map((sr, i) => (
              <ResultCard
                key={sr.resource.id}
                sr={sr}
                rank={i + 1}
                role="family"
                roleColor={roleColor}
                selected={selectedId === sr.resource.id}
                onSelect={() => onSelect(selectedId === sr.resource.id ? null : sr.resource.id)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
