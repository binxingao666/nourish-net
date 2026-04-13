import { useState } from 'react';
import { useI18n } from '../i18n/context';
import type { ScoredResource, UserRole } from '../types';

interface Props {
  sr: ScoredResource;
  rank: number;
  role: UserRole;
  roleColor: string;
  selected: boolean;
  onSelect: () => void;
}

export default function ResultCard({ sr, rank, role, selected, onSelect }: Props) {
  const { t } = useI18n();
  const { resource: r, score, distanceMiles } = sr;
  const [expanded, setExpanded] = useState(false);

  const pct = Math.round(score * 100);
  const dist = distanceMiles.toFixed(1);
  const catLabel = t.categories[r.category] || r.category;

  const rankClass = `card-rank rank-${role}`;
  const scoreClass = `card-score score-${role}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}`;

  const handleClick = () => {
    onSelect();
    setExpanded(!expanded);
  };

  return (
    <div className={`result-card ${selected ? 'highlighted' : ''}`} onClick={handleClick}>
      <div className="card-header">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <div className={rankClass}>{rank}</div>
          <div>
            <div className="card-title">{r.organizationName}</div>
            <span className="card-category">{catLabel}</span>
          </div>
        </div>
        <span className={scoreClass}>{pct}% {t.common.matchScore}</span>
      </div>

      <div className="card-meta">
        <span className="card-meta-item">📍 {dist} {t.common.milesAway}</span>
        <span className="card-meta-item">🕐 {r.operatingHours}</span>
        {r.walkIn && <span className="card-meta-item">✅ {t.common.walkIn}</span>}
      </div>

      {/* Role-specific tags */}
      <div className="card-tags">
        {role === 'family' && r.foodTypes.slice(0, 4).map(ft => (
          <span key={ft} className="card-tag">{ft}</span>
        ))}
        {role === 'donor' && r.donationTypes.slice(0, 4).map(dt => (
          <span key={dt} className="card-tag">{t.donor.types[dt] || dt}</span>
        ))}
        {role === 'volunteer' && r.volunteerRoles.slice(0, 4).map(vr => (
          <span key={vr} className="card-tag">{t.volunteer.roleTypes[vr] || vr}</span>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="card-details">
          <dl>
            <dt>📍 {t.common.services}</dt>
            <dd>{r.address}</dd>

            {role === 'family' && (
              <>
                <dt>{t.family.foodAvailable}</dt>
                <dd>{r.foodTypes.join(', ') || 'Contact for details'}</dd>
                {r.dietaryOptions.length > 0 && (
                  <><dt>{t.family.dietary}</dt><dd>{r.dietaryOptions.join(', ')}</dd></>
                )}
                {r.eligibilityRequirements.length > 0 && (
                  <><dt>{t.family.eligibility}</dt><dd>{r.eligibilityRequirements.join(', ')}</dd></>
                )}
                {r.languages.length > 0 && (
                  <><dt>{t.family.languages}</dt><dd>{r.languages.join(', ')}</dd></>
                )}
                {r.servicesOffered.length > 0 && (
                  <><dt>{t.common.services}</dt><dd>{r.servicesOffered.join(', ')}</dd></>
                )}
              </>
            )}

            {role === 'donor' && (
              <>
                {r.donationNeeds && (<><dt>{t.donor.currentNeeds}</dt><dd>{r.donationNeeds}</dd></>)}
                <dt>{t.donor.donationHours}</dt><dd>{r.donationHours || r.operatingHours}</dd>
                <dt>{t.common.services}</dt>
                <dd>
                  {r.donationDropOff && <span>✅ {t.donor.dropOff}  </span>}
                  {r.donationPickUp && <span>✅ {t.donor.pickUp}  </span>}
                  {r.taxDeductible && <span>✅ {t.donor.taxInfo}</span>}
                </dd>
              </>
            )}

            {role === 'volunteer' && (
              <>
                <dt>{t.volunteer.roles}</dt><dd>{r.volunteerRoles.map(vr => t.volunteer.roleTypes[vr] || vr).join(', ')}</dd>
                <dt>{t.volunteer.schedule}</dt><dd>{r.volunteerSchedule || 'Contact for details'}</dd>
                {r.volunteerRequirements.length > 0 && (
                  <><dt>{t.volunteer.volunteerReqs}</dt><dd>{r.volunteerRequirements.join(', ')}</dd></>
                )}
                {r.volunteerContact && (
                  <><dt>{t.volunteer.contact}</dt><dd>{r.volunteerContact}</dd></>
                )}
              </>
            )}
          </dl>

          <div className="card-actions">
            <a className="card-action-btn primary" href={directionsUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              🗺️ {t.common.directions}
            </a>
            {r.phone && (
              <a className="card-action-btn secondary" href={`tel:${r.phone}`} onClick={e => e.stopPropagation()}>
                📞 {t.common.call}
              </a>
            )}
            {r.website && (
              <a className="card-action-btn secondary" href={r.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                🌐 {t.common.visitWebsite}
              </a>
            )}
            {r.email && (
              <a className="card-action-btn secondary" href={`mailto:${r.email}`} onClick={e => e.stopPropagation()}>
                ✉️ {t.common.email}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
