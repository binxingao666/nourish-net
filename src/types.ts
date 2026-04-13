export type UserRole = 'family' | 'donor' | 'volunteer';
export type UtilityAccess = 'oven-stove' | 'microwave-only' | 'none';
export type DonationType = 'non-perishable' | 'fresh-produce' | 'prepared-meals' | 'monetary' | 'clothing' | 'hygiene';
export type VolunteerRole = 'food-sorting' | 'delivery-driver' | 'kitchen-helper' | 'event-coordinator' | 'intake-assistant' | 'warehouse' | 'gardening';

export interface Resource {
  id: string;
  organizationName: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  operatingHours: string;
  category: 'food_bank' | 'pantry' | 'soup_kitchen' | 'mobile_market' | 'community_garden' | 'shelter' | 'government';

  // Family fields
  foodTypes: string[];
  eligibilityRequirements: string[];
  servicesOffered: string[];
  dietaryOptions: string[];
  languages: string[];
  walkIn: boolean;

  // Donor fields
  acceptsDonations: boolean;
  donationTypes: DonationType[];
  donationDropOff: boolean;
  donationPickUp: boolean;
  donationHours: string;
  taxDeductible: boolean;
  donationNeeds: string;

  // Volunteer fields
  acceptsVolunteers: boolean;
  volunteerRoles: VolunteerRole[];
  volunteerSchedule: string;
  volunteerRequirements: string[];
  volunteerContact: string;

  // Meta
  sourceAttribution: string;
  lastUpdated: string;
}

export interface ZipCodeEntry {
  zip: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export interface ScoredResource {
  resource: Resource;
  score: number;
  distanceMiles: number;
}

export interface FamilyFilters {
  zip: string;
  maxDistance: number;
  foodTypes: string[];
  dietaryNeeds: string[];
  walkInOnly: boolean;
  languagePreference: string;
}

export interface DonorFilters {
  zip: string;
  maxDistance: number;
  donationTypes: DonationType[];
  pickupNeeded: boolean;
  taxDeductibleOnly: boolean;
}

export interface VolunteerFilters {
  zip: string;
  maxDistance: number;
  roles: VolunteerRole[];
  requirementsFit: string[];
}

export interface GeoLocation {
  lat: number;
  lng: number;
}
