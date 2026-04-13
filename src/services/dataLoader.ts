import type { Resource, ZipCodeEntry } from '../types';

let resourcesCache: Resource[] | null = null;
let zipCache: Map<string, ZipCodeEntry> | null = null;

const DC_GIS_URL =
  'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Public_Safety_WebMercator/MapServer/26/query' +
  '?where=1%3D1&outFields=AGENCY_NAM,ADDRESS,LATITUDE,LONGITUDE,KIDS_CAFE,COMMUNITY,WEEKEND_BA,FAMILY_MAR,GROCERY_PL,PROGRAM' +
  '&outSR=4326&f=json&resultRecordCount=500';

interface DcGisFeature {
  attributes: {
    AGENCY_NAM: string;
    ADDRESS: string;
    LATITUDE: number;
    LONGITUDE: number;
    KIDS_CAFE: string;
    COMMUNITY: string;
    WEEKEND_BA: string;
    FAMILY_MAR: string;
    GROCERY_PL: string;
    PROGRAM: string;
  };
}

function mapDcGisToResource(feat: DcGisFeature, idx: number): Resource {
  const a = feat.attributes;
  const foodTypes: string[] = [];
  if (a.GROCERY_PL === 'Y') foodTypes.push('Groceries');
  if (a.KIDS_CAFE === 'Y') foodTypes.push('Kids Meals');
  if (a.COMMUNITY === 'Y') foodTypes.push('Community Meals');
  if (a.WEEKEND_BA === 'Y') foodTypes.push('Weekend Bags');
  if (a.FAMILY_MAR === 'Y') foodTypes.push('Family Market');
  if (foodTypes.length === 0) foodTypes.push('Emergency Food');

  const programs = (a.PROGRAM || '').split(',').map(s => s.trim()).filter(Boolean);

  return {
    id: `dcgis-${idx}`,
    organizationName: a.AGENCY_NAM || 'DC Food Provider',
    address: a.ADDRESS || '',
    lat: a.LATITUDE,
    lng: a.LONGITUDE,
    city: 'Washington',
    state: 'DC',
    zip: '',
    phone: '',
    email: '',
    website: 'https://opendata.dc.gov',
    operatingHours: 'Varies; contact organization',
    category: 'pantry',
    foodTypes,
    eligibilityRequirements: programs.length > 0 ? programs : ['Open to all'],
    servicesOffered: foodTypes,
    dietaryOptions: [],
    languages: ['English'],
    walkIn: true,
    acceptsDonations: true,
    donationTypes: ['non-perishable'],
    donationDropOff: true,
    donationPickUp: false,
    donationHours: 'During operating hours',
    taxDeductible: true,
    donationNeeds: 'Non-perishable food items',
    acceptsVolunteers: true,
    volunteerRoles: ['food-sorting'],
    volunteerSchedule: 'Contact for availability',
    volunteerRequirements: [],
    volunteerContact: '',
    sourceAttribution: 'DC Open Data (CC BY 4.0)',
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

async function fetchLiveData(): Promise<Resource[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(DC_GIS_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const json = await resp.json();
    if (!json.features) return [];
    return (json.features as DcGisFeature[])
      .filter(f => f.attributes.LATITUDE && f.attributes.LONGITUDE)
      .map((f, i) => mapDcGisToResource(f, i));
  } catch {
    console.warn('Live DC GIS fetch failed, using static data only');
    return [];
  }
}

function dedup(resources: Resource[]): Resource[] {
  const seen = new Set<string>();
  return resources.filter(r => {
    const key = `${r.organizationName.toLowerCase().trim()}|${r.address.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function loadResources(): Promise<Resource[]> {
  if (resourcesCache) return resourcesCache;

  const [staticResp, liveResources] = await Promise.all([
    fetch(import.meta.env.BASE_URL + 'data/resources.json').then(r => r.json()),
    fetchLiveData(),
  ]);

  const staticResources: Resource[] = staticResp;
  resourcesCache = dedup([...staticResources, ...liveResources]);
  return resourcesCache;
}

export async function loadZipCodes(): Promise<Map<string, ZipCodeEntry>> {
  if (zipCache) return zipCache;
  const resp = await fetch(import.meta.env.BASE_URL + 'data/zipcodes.json');
  const data: ZipCodeEntry[] = await resp.json();
  zipCache = new Map(data.map(z => [z.zip, z]));
  return zipCache;
}

export async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  const zips = await loadZipCodes();
  const entry = zips.get(zip);
  if (entry) return { lat: entry.lat, lng: entry.lng };

  // Fallback: Nominatim
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`,
      { headers: { 'User-Agent': 'NourishNet/1.0' } }
    );
    const data = await resp.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch { /* ignore */ }

  return null;
}

export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000 }
    );
  });
}
