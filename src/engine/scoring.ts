import { haversineDistance } from './haversine';
import type {
  Resource, ScoredResource, GeoLocation,
  FamilyFilters, DonorFilters, VolunteerFilters,
} from '../types';

const MAX_DISTANCE = 50; // miles

function proximityScore(dist: number): number {
  if (dist >= MAX_DISTANCE) return 0;
  return 1 - dist / MAX_DISTANCE;
}

// ── Family scoring ──

export function scoreFamilyMatch(
  resource: Resource,
  userLoc: GeoLocation,
  filters: FamilyFilters
): ScoredResource {
  const dist = haversineDistance(userLoc.lat, userLoc.lng, resource.lat, resource.lng);

  const proxScore = proximityScore(dist);

  // Food type match
  let foodScore = 1;
  if (filters.foodTypes.length > 0) {
    const matched = filters.foodTypes.filter(ft =>
      resource.foodTypes.some(rf => rf.toLowerCase().includes(ft.toLowerCase()))
    ).length;
    foodScore = filters.foodTypes.length > 0 ? matched / filters.foodTypes.length : 1;
  }

  // Dietary match
  let dietScore = 1;
  if (filters.dietaryNeeds.length > 0) {
    const matched = filters.dietaryNeeds.filter(dn =>
      resource.dietaryOptions.some(ro => ro.toLowerCase().includes(dn.toLowerCase()))
    ).length;
    dietScore = matched / filters.dietaryNeeds.length;
  }

  // Walk-in bonus
  const walkInScore = filters.walkInOnly ? (resource.walkIn ? 1 : 0) : 1;

  // Language match
  let langScore = 1;
  if (filters.languagePreference && filters.languagePreference !== 'en') {
    langScore = resource.languages.some(l =>
      l.toLowerCase().includes(filters.languagePreference.toLowerCase())
    ) ? 1 : 0.5;
  }

  // Services breadth bonus
  const servicesScore = Math.min(resource.servicesOffered.length / 5, 1);

  const score =
    0.30 * proxScore +
    0.20 * foodScore +
    0.15 * dietScore +
    0.10 * walkInScore +
    0.10 * langScore +
    0.15 * servicesScore;

  return { resource, score, distanceMiles: dist };
}

// ── Donor scoring ──

export function scoreDonorMatch(
  resource: Resource,
  userLoc: GeoLocation,
  filters: DonorFilters
): ScoredResource {
  const dist = haversineDistance(userLoc.lat, userLoc.lng, resource.lat, resource.lng);

  if (!resource.acceptsDonations) {
    return { resource, score: 0, distanceMiles: dist };
  }

  const proxScore = proximityScore(dist);

  // Donation type alignment
  let typeScore = 1;
  if (filters.donationTypes.length > 0) {
    const matched = filters.donationTypes.filter(dt =>
      resource.donationTypes.includes(dt)
    ).length;
    typeScore = matched / filters.donationTypes.length;
  }

  // Convenience factors
  const pickupScore = filters.pickupNeeded ? (resource.donationPickUp ? 1 : 0.2) : 1;
  const taxScore = filters.taxDeductibleOnly ? (resource.taxDeductible ? 1 : 0) : 1;

  // Need urgency (longer donationNeeds text = more specific need)
  const needScore = resource.donationNeeds.length > 0 ? 1 : 0.5;

  const score =
    0.35 * proxScore +
    0.25 * typeScore +
    0.15 * pickupScore +
    0.10 * taxScore +
    0.15 * needScore;

  return { resource, score, distanceMiles: dist };
}

// ── Volunteer scoring ──

export function scoreVolunteerMatch(
  resource: Resource,
  userLoc: GeoLocation,
  filters: VolunteerFilters
): ScoredResource {
  const dist = haversineDistance(userLoc.lat, userLoc.lng, resource.lat, resource.lng);

  if (!resource.acceptsVolunteers) {
    return { resource, score: 0, distanceMiles: dist };
  }

  const proxScore = proximityScore(dist);

  // Role match
  let roleScore = 1;
  if (filters.roles.length > 0) {
    const matched = filters.roles.filter(r => resource.volunteerRoles.includes(r)).length;
    roleScore = matched / filters.roles.length;
  }

  // Requirements fit
  const reqScore = resource.volunteerRequirements.length === 0 ? 1 :
    Math.max(0.3, 1 - resource.volunteerRequirements.length * 0.15);

  // Schedule availability (more flexible = higher)
  const schedScore = resource.volunteerSchedule.toLowerCase().includes('flexible') ? 1 :
    resource.volunteerSchedule.length > 0 ? 0.7 : 0.5;

  const score =
    0.35 * proxScore +
    0.30 * roleScore +
    0.15 * reqScore +
    0.20 * schedScore;

  return { resource, score, distanceMiles: dist };
}

// ── Rank & filter ──

export function rankResults(
  scored: ScoredResource[],
  maxDistance: number,
  topN: number = 10
): ScoredResource[] {
  return scored
    .filter(s => s.distanceMiles <= maxDistance && s.score > 0)
    .sort((a, b) => b.score - a.score || a.distanceMiles - b.distanceMiles)
    .slice(0, topN);
}
