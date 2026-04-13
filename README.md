# NourishNet — DMV Food Resource Connector

NourishNet is a web application that connects communities to food resources across Maryland, Washington DC, and Virginia. It serves three distinct user groups through a unified platform:

- **Families** seeking food assistance can locate nearby pantries, distribution events, and meal programs.
- **Donors** who want to contribute food, money, or supplies can find organizations that match their giving preferences.
- **Volunteers** looking to donate their time can discover opportunities that fit their skills and schedule.

## Features

- **Interactive Map**: Leaflet-powered map with numbered markers, popups, and one-click Google Maps directions
- **Smart Matching**: Multi-factor scoring engine that ranks resources by proximity, relevance, and user preferences
- **Three User Modes**: Dedicated search and filter interfaces for families, donors, and volunteers
- **Multilingual**: Full UI translation in English, Spanish (Español), and German (Deutsch)
- **Live Data**: Real-time ingestion from DC Open Data ArcGIS API, merged with curated static data for 35+ DMV organizations
- **Mobile Responsive**: Fully usable on phones and tablets
- **Accessible**: Designed for users with limited technical literacy; clear visual hierarchy and simple navigation

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 6
- **Maps**: Leaflet / react-leaflet
- **Styling**: Plain CSS with CSS custom properties (no UI framework)
- **Data**: Static JSON + live DC GIS ArcGIS REST API
- **Geocoding**: Static zip code lookup (300+ DMV zips) with Nominatim API fallback
- **Deployment**: GitHub Pages via gh-pages

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
git clone https://github.com/binxingao666/nourish-net.git
cd nourish-net
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173/nourish-net/](http://localhost:5173/nourish-net/) in your browser.

### Production Build

```bash
npm run build
```

The built files will be in `dist/`.

### Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the project and pushes the `dist/` folder to the `gh-pages` branch.

## Architecture

```
src/
  main.tsx              — App entry point
  App.tsx               — Root component with state management, search, and layout
  types.ts              — TypeScript interfaces for all data models
  index.css             — Global styles with CSS custom properties
  i18n/
    context.tsx         — React Context for language switching
    en.ts / es.ts / de.ts — Full translation files
  engine/
    haversine.ts        — Great-circle distance calculation
    scoring.ts          — Multi-factor scoring for family/donor/volunteer matching
  services/
    dataLoader.ts       — Static + live data loading, geocoding, deduplication
  components/
    FamilyView.tsx      — Family search filters and results
    DonorView.tsx       — Donor search filters and results
    VolunteerView.tsx   — Volunteer search filters and results
    ResultCard.tsx      — Expandable result card with details and actions
    MapView.tsx         — Interactive Leaflet map with numbered markers
```

## Data Sources

| Source | Description | License |
|--------|-------------|---------|
| DC Open Data — CAFB Emergency Food Providers | Live ArcGIS REST API | CC BY 4.0 |
| Capital Area Food Bank | Food distribution centers in DC/MD/VA | Public |
| Maryland Food Bank | Pantries and programs across Maryland | Public |
| USDA SNAP Retailer Locator | SNAP-accepting retailers | Public |
| PG County Food Equity Council | Prince George's County pantry listings | Public |
| Montgomery County Food Council | MoCo food resources | Public |
| UMD Extension | Food access resource directory | Public |
| US Census / ACS | Demographic context | Public |

Resource data was compiled from public sources listed in the NAFSI Data Challenge data sources spreadsheet. For detailed attribution, see each resource's `sourceAttribution` field in `public/data/resources.json`.

## Scoring Algorithm

Each user type has a customized multi-factor scoring engine:

**Family Matching** (weights): Proximity 30%, Food Type 20%, Dietary 15%, Walk-in 10%, Language 10%, Services 15%

**Donor Matching** (weights): Proximity 35%, Donation Type 25%, Pickup 15%, Tax Deductible 10%, Need Urgency 15%

**Volunteer Matching** (weights): Proximity 35%, Role Match 30%, Requirements 15%, Schedule 20%

Proximity uses haversine distance with a 50-mile maximum radius and linear decay.

## Prompt Engineering

See [PROMPTS.md](./PROMPTS.md) for the complete set of prompts used to build this application with Kiro.

## Author

**Binxin Gao** (bgao666@umd.edu)

## License

MIT

---

Built for the **NAFSI 2026 Data Challenge** — NourishNet Track.
