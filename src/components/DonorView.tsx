import { useI18n } from '../i18n/context';
import type { DonorFilters, DonationType, ScoredResource } from '../types';
import ResultCard from './ResultCard';

const DONATION_TYPES: DonationType[] = ['non-perishable', 'fresh-produce', 'prepared-meals', 'monetary', 'clothing', 'hygiene'];

interface Props {
  filters: Omit<DonorFilters, 'zip' | 'maxDistance'>;
  setFilters: (f: Omit<DonorFilters, 'zip' | 'maxDistance'>) => void;
  results: ScoredResource[];
  loading: boolean;
  searched: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  roleColor: string;
}

function toggleDonationType(arr: DonationType[], val: DonationType): DonationType[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export default function DonorView({ filters, setFilters, results, loading, searched, selectedId, onSelect, roleColor }: Props) {
  const { t } = useI18n();

  return (
    <>
      <div className="sidebar-header">
        <h2>🤝 {t.donor.title}</h2>
        <p>{t.donor.description}</p>
      </div>

      <div className="filters-panel">
        <div className="filter-group" style={{ width: '100%' }}>
          <label>{t.donor.donationType}</label>
          <div className="chip-group">
            {DONATION_TYPES.map(dt => (
              <button
                key={dt}
                className={`chip ${filters.donationTypes.includes(dt) ? 'selected-donor' : ''}`}
                onClick={() => setFilters({ ...filters, donationTypes: toggleDonationType(filters.donationTypes, dt) })}
              >
                {t.donor.types[dt]}
              </button>
            ))}
          </div>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.pickupNeeded}
            onChange={e => setFilters({ ...filters, pickupNeeded: e.target.checked })}
          />
          {t.donor.pickupNeeded}
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.taxDeductibleOnly}
            onChange={e => setFilters({ ...filters, taxDeductibleOnly: e.target.checked })}
          />
          {t.donor.taxDeductible}
        </label>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><p>{t.common.loading}</p></div>
      ) : !searched ? (
        <div className="welcome-banner">
          <h2>{t.donor.title}</h2>
          <p>{t.donor.description}</p>
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
                role="donor"
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
