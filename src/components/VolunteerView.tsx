import { useI18n } from '../i18n/context';
import type { VolunteerFilters, VolunteerRole, ScoredResource } from '../types';
import ResultCard from './ResultCard';

const ROLES: VolunteerRole[] = ['food-sorting', 'delivery-driver', 'kitchen-helper', 'event-coordinator', 'intake-assistant', 'warehouse', 'gardening'];

interface Props {
  filters: Omit<VolunteerFilters, 'zip' | 'maxDistance'>;
  setFilters: (f: Omit<VolunteerFilters, 'zip' | 'maxDistance'>) => void;
  results: ScoredResource[];
  loading: boolean;
  searched: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  roleColor: string;
}

function toggleRole(arr: VolunteerRole[], val: VolunteerRole): VolunteerRole[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export default function VolunteerView({ filters, setFilters, results, loading, searched, selectedId, onSelect, roleColor }: Props) {
  const { t } = useI18n();

  return (
    <>
      <div className="sidebar-header">
        <h2>✋ {t.volunteer.title}</h2>
        <p>{t.volunteer.description}</p>
      </div>

      <div className="filters-panel">
        <div className="filter-group" style={{ width: '100%' }}>
          <label>{t.volunteer.roles}</label>
          <div className="chip-group">
            {ROLES.map(r => (
              <button
                key={r}
                className={`chip ${filters.roles.includes(r) ? 'selected-volunteer' : ''}`}
                onClick={() => setFilters({ ...filters, roles: toggleRole(filters.roles, r) })}
              >
                {t.volunteer.roleTypes[r]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><p>{t.common.loading}</p></div>
      ) : !searched ? (
        <div className="welcome-banner">
          <h2>{t.volunteer.title}</h2>
          <p>{t.volunteer.description}</p>
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
                role="volunteer"
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
