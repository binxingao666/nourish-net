# NourishNet Prompt Engineering Log

These prompts were used to build NourishNet, a food resource connector for the Maryland/DC/Virginia region. Each prompt was entered sequentially in Kiro, with the output reviewed and refined between steps.

---

## Prompt 1: Project Initialization & Architecture

```
Create a new React 18 + TypeScript web application using Vite as the build tool.
The app is called "NourishNet" and its purpose is to connect three user groups
with food resources in the Maryland, DC, and Virginia (DMV) area:

1. Families seeking food assistance — they need to find nearby food pantries,
   distribution events, meal programs, and shelters that serve food.
2. Donors who want to give food, money, or supplies — they need to find
   organizations accepting donations near them.
3. Volunteers who want to donate their time — they need to find organizations
   with volunteer opportunities that match their skills and schedule.

Technical requirements:
- React 18 with TypeScript and Vite 6
- Leaflet maps via react-leaflet for an interactive map view
- CSS (no UI framework) — clean, accessible, modern design
- Deploy to GitHub Pages using the gh-pages npm package
- Base path: /nourish-net/
- Three-tab navigation: "Find Food", "Give/Donate", "Volunteer"
- Sidebar with search, filters, and results on the left; map on the right
- Mobile responsive (stack vertically on small screens)
- Multilingual support for English, Spanish, and German via React Context

Set up the project structure with:
  src/types.ts — all TypeScript interfaces
  src/engine/ — scoring and matching logic
  src/services/ — data loading and geocoding
  src/i18n/ — translations and language context
  src/components/ — all UI components
  public/data/ — static JSON data files

Install dependencies: react, react-dom, leaflet, react-leaflet, @types/leaflet,
gh-pages. Configure tsconfig for strict mode with bundler module resolution.
```

---

## Prompt 2: Data Layer & Scoring Engine

```
Now build the data layer and matching engine for NourishNet.

DATA FILES:
Create public/data/resources.json with 35+ real food organizations in the DMV
area. Each resource must have fields supporting all three user types:
- Core: id, organizationName, address, lat, lng, city, state, zip, phone,
  email, website, operatingHours, category
- Family fields: foodTypes, eligibilityRequirements, servicesOffered,
  dietaryOptions, languages, walkIn
- Donor fields: acceptsDonations, donationTypes (non-perishable, fresh-produce,
  prepared-meals, monetary, clothing, hygiene), donationDropOff, donationPickUp,
  donationHours, taxDeductible, donationNeeds
- Volunteer fields: acceptsVolunteers, volunteerRoles (food-sorting,
  delivery-driver, kitchen-helper, event-coordinator, intake-assistant,
  warehouse, gardening), volunteerSchedule, volunteerRequirements,
  volunteerContact

Include real organizations: Capital Area Food Bank, Maryland Food Bank, DC
Central Kitchen, Bread for the City, Martha's Table, Manna Food Center, AFAC,
Food for Others, SOME, Shepherd's Table, Nourish Now, Catholic Charities DC,
and 20+ more DMV organizations with realistic data.

Create public/data/zipcodes.json with 130+ DMV zip codes mapped to lat/lng.

LIVE DATA:
In src/services/dataLoader.ts, fetch live data from the DC Open Data ArcGIS
REST API endpoint for Capital Area Food Bank Emergency Food Providers:
https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Public_Safety_WebMercator/MapServer/26/query
Merge live results with static data, deduplicate by org name + address.
Fall back to static data silently if the live fetch fails (8-second timeout).

Also implement: geocodeZip() using static lookup with Nominatim fallback, and
getUserLocation() via browser geolocation API.

SCORING ENGINE:
In src/engine/scoring.ts, implement three scoring functions:

1. scoreFamilyMatch: proximity (0.30), food type match (0.20), dietary match
   (0.15), walk-in score (0.10), language match (0.10), services breadth (0.15)
2. scoreDonorMatch: proximity (0.35), donation type alignment (0.25),
   pickup convenience (0.15), tax deductible (0.10), need urgency (0.15)
3. scoreVolunteerMatch: proximity (0.35), role match (0.30), requirements
   fit (0.15), schedule flexibility (0.20)

Proximity uses haversine distance with 50-mile max radius and linear decay.
rankResults() filters by max distance, sorts by score desc then distance asc,
returns top 15.
```

---

## Prompt 3: Complete UI Implementation

```
Build all UI components for NourishNet with a warm, accessible design.

HEADER: Green gradient banner with app name, subtitle, and a pill-shaped
language switcher (English | Español | Deutsch) in the top right.

TAB NAVIGATION: Three tabs below header, each with an emoji icon:
- 🍎 Find Food (green active state)
- 🤝 Give/Donate (blue active state)
- ✋ Volunteer (purple active state)

SIDEBAR (left panel, 420px):
- Search bar: ZIP code input + Search button (colored per active tab) +
  📍 geolocation button
- Distance slider: 5-50 miles range with label
- Role-specific filter chips:
  * Family: food type chips + dietary need chips + walk-in checkbox
  * Donor: donation type chips + pickup checkbox + tax-deductible checkbox
  * Volunteer: role type chips
- Results list: scrollable, showing ResultCards

RESULT CARD: Compact card with:
- Numbered rank badge (colored per role)
- Organization name + category badge
- Match percentage + distance
- Walk-in status indicator
- Tag chips (food types / donation types / volunteer roles)
- Expandable details section on click: full address, hours, eligibility,
  dietary options, languages, action buttons
- Action buttons: Get Directions (Google Maps link), Call, Visit Website, Email

MAP (right panel, flex-1):
- Leaflet with OpenStreetMap tiles
- Numbered markers matching result ranks, colored per role
- Home marker (🏠 orange) at user location
- Popup with org name, address, hours, directions link
- Selected marker scales up with z-index boost
- Map recenters when user searches a new location

FOOTER: Dark background with data source credits and disclaimer.

Design language:
- Color-coded per role: green (family), blue (donor), purple (volunteer)
- 12px border radius, subtle shadows, smooth transitions
- Accessible to users with limited tech literacy
- All UI strings come from the i18n context (already built)
```

---

## Prompt 4: Deployment & Documentation

```
Finalize NourishNet for deployment and create all documentation.

1. Create .github/workflows/deploy.yml for automated GitHub Pages deployment
   on push to main. Use Node 20, npm ci, npm run build, deploy dist/ to
   gh-pages branch using peaceiris/actions-gh-pages@v4.

2. Create a comprehensive README.md with:
   - Project overview and screenshots description
   - Three user groups served
   - Tech stack
   - Getting started: prerequisites, installation, development, build
   - Deployment instructions
   - Data sources and attribution
   - Architecture overview
   - License

3. Add a .gitignore for node_modules, dist, and editor files.

4. Ensure the production build works: npm run build should complete with
   zero errors and produce a working dist/ folder.

5. Verify that the app:
   - Loads static data + attempts live DC GIS fetch
   - Correctly scores and ranks results for all three user types
   - Displays results on map with numbered markers
   - Supports language switching (EN/ES/DE)
   - Is responsive on mobile
```

---

## Reproduction Instructions

To reproduce this application using Kiro:

1. Open Kiro and create a new project
2. Enter **Prompt 1** to scaffold the project structure
3. Enter **Prompt 2** to build the data layer and engine
4. Enter **Prompt 3** to create all UI components
5. Enter **Prompt 4** to finalize deployment and docs
6. Run `npm install && npm run dev` to start the development server
7. Run `npm run build` to create the production build
8. Run `npm run deploy` to deploy to GitHub Pages

Each prompt builds on the previous output. Allow Kiro to complete each step
before entering the next prompt. Minor manual adjustments may be needed for
import paths or CSS fine-tuning between steps.
