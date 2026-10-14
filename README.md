# CrowdWise AI — Smarter Tourism & Crowd Management

> **"Explore More. Wait Less. Travel Smarter."**

CrowdWise AI is an intelligent, web-based smart-tourism and crowd-dispersal management platform built for tourists and municipal tourism authorities. It estimates crowd levels, predicts peak visiting periods, recommends less crowded alternatives, provides parking availability, and delivers traffic-aware route suggestions.

---

## 🌟 Key Upgrades & Core Capabilities

### 1. 👥 Real-World Footfall Telemetry Engine
- **Live Measured vs Estimated Data Transparency**:
  - `MEASURED`: Authorized venue turnstiles, barrier counters, or government tourism API feeds.
  - `ESTIMATED`: Scientifically modeled diurnal curve using time-of-day, day-of-week, holiday calendars, and carrying capacity.
  - `PREDICTED`: 24-hour hourly trajectory and 7-day outlook using moving-average algorithms.
  - `UNAVAILABLE`: Explicitly reported when no verified sensor feed exists; never fabricates headcount.
- **Detailed Pilgrim / Venue Telemetry** (e.g. *Sri Durga Malleswara Swamy Devasthanam, Vijayawada*):
  - **Total Visited Today**: Cumulative footfall tally calculated continuously from morning opening.
  - **Currently Inside**: Active headcount bounded by physical venue carrying capacity.
  - **Inflow / Outflow Velocity**: Live rate in persons/minute across turnstile lines.
  - **Queue Breakdown**: Multi-tier Darshan wait times (Sarva Darshan Free vs ₹100 / ₹300 Special Entry).
  - **Gate Influx Monitors**: Real-time throughput indicators across entry gates (Ghat Road, Om Turning, Mallikarjuna).

### 2. 🔍 Real Destination Search & Discovery (Google Places API New)
- **Server-Side Integration**:
  - Secure `/api/places/search` and `/api/places/nearby` endpoints.
  - Accesses Google Places API (New) using server-side credentials; keys are never leaked to client browsers.
  - Returns real destination names, addresses, latitude/longitude, place IDs, ratings, and user review totals.
  - Integrated 5-minute in-memory caching layer to eliminate duplicate queries and optimize API quotas.
- **High-Fidelity Verified Catalog Fallback**:
  - If `GOOGLE_MAPS_API_KEY` is not configured, automatically serves 20+ verified Indian attractions across Andhra Pradesh, Tamil Nadu, Karnataka, Telangana, and Uttar Pradesh.

### 3. 🚗 Traffic-Aware Routing & Kinematic Navigation (Google Routes API)
- **Live Traffic Integration**:
  - Secure `/api/routes` endpoint querying Google Routes API with `TRAFFIC_AWARE` computation.
  - Delivers real-time driving distance, typical travel duration, duration in current traffic, and turn-by-turn directions.
  - Empirical Kinematic Model fallback applying a 1.28x road tortuosity factor and diurnal peak congestion multipliers when external routing quotas are exhausted.

### 4. 🅿️ Smart Parking Telemetry (`/mobility`)
- Reusable parking provider architecture with explicit fidelity tags:
  - `VERIFIED_LIVE`: Direct operator turnstile barrier feeds (e.g., Indrakeeladri Ghat Road Complex, Alipiri Tollgate).
  - `ESTIMATED`: Diurnally modeled occupancy based on attraction visitor volume.
  - `UNKNOWN`: Labeled when no verified operator feed exists.
- Live available vs occupied parking bays, tariff rates, and EV charging readiness.

### 5. ✨ Explainable AI Alternative Recommender (`/recommendations`)
- Multi-factor deterministic scoring model (0 to 100):
  - **45% Crowd Reduction**: Strongly prioritizes low-occupancy sites.
  - **25% Proximity & Travel Distance**: Computes Haversine distance from origin.
  - **15% Quality & Visitor Rating**: Ensures authentic, high-quality experiences.
  - **15% Parking Availability**: Rewards destinations with ample verified bays.
- Supports regional origin selection: **Vijayawada, Guntur, Chilakaluripet, Bapatla, Ongole, Nellore, Ooty, Kodaikanal, Tiruvannamalai (Arunachalam)**, or device GPS coordinates.

### 6. 🗺️ Interactive Geographic Crowd Radar (Leaflet + OpenStreetMap)
- Custom color-coded pulsing SVG radar pins:
  - 🟢 **Low Crowd (< 40%)**
  - 🟡 **Moderate Crowd (40% - 64%)**
  - 🟠 **High Crowd (65% - 84%)**
  - 🔴 **Critical Crowd (≥ 85%)**
- Clickable popups with authentic location imagery, wait times, free parking bays, telemetry status, and direct navigation links.

### 7. 🛡️ Tourism Authority Command Center (`/authority`)
- Real-time capacity warnings, automated crowd diversion advisories, and incident triage (`Active` → `Investigating` → `Resolved`).
- Dynamic threshold adjustment sliders for warning and critical limits.
- One-click official CSV telemetry export for municipal dispatch and police control rooms.

---

## 🇮🇳 Monitored Regional & National Destinations

Includes authentic regional attractions and verified low-crowd alternatives:
- **Vijayawada**: Sri Durga Malleswara Swamy Temple (Kanaka Durga), Bhavani Island, Prakasam Barrage.
- **Palnadu / Chilakaluripet**: Sri Trikoteswara Swamy Temple (Kotappakonda).
- **Guntur**: Amaravati Maha Stupa & Dhyana Buddha Heritage Park.
- **Bapatla**: Suryalanka Coastal Beach, Bhavanarayana Swamy Temple.
- **Prakasam / Ongole**: Kothapatnam Beach, Sri Chennakesava Swamy Temple.
- **Nellore**: Sri Talpagiri Ranganatha Swamy Temple, Mypadu Beach.
- **The Nilgiris / Ooty**: Government Botanical Gardens & Doddabetta Peak.
- **Dindigul / Kodaikanal**: Kodaikanal Star Lake & Pillar Rocks.
- **Tiruvannamalai / Arunachalam**: Sri Annamalaiyar Temple & Girivalam Path.
- **Tirupati**: Sri Venkateswara Temple, Tirumala & Alipiri.
- **Hyderabad**: Charminar & Old City, Golconda Fort.
- **Visakhapatnam**: Ramakrishna (RK) Beach, Rushikonda Blue Flag Beach.
- **Varanasi**: Kashi Vishwanath Temple & Dashashwamedh Ghat.
- **Agra & Jaipur**: Taj Mahal, Mehtab Bagh, Amber Fort, Nahargarh Fort.

---

## 🔒 Data Integrity & Transparency Principles

1. **No Data Fabrication**: We never invent fake CCTV counts or unverified real-time numbers. Venues without connected sensors explicitly display *"Live crowd data unavailable"*.
2. **Clear Separation**: Live measured counts, mathematical estimates, and predictive models are distinctly tagged across every UI card, badge, and popup.
3. **Zero PII**: Aggregated footfall and bay counts only. No facial recognition, individual MAC-address sniffing, or personal tracking.

---

## 🔑 External API Configuration (Google Cloud Platform)

The platform runs 100% out of the box in **High-Fidelity Demo Mode** using authentic local models. To connect live Google Cloud APIs:

### 1. Enable Google Cloud APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and link an active billing account.
3. Navigate to **APIs & Services > Library** and enable:
   - **Places API (New)**
   - **Routes API**

### 2. Configure API Credentials & Restrictions
1. Navigate to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
2. **API Restrictions**: Under *API restrictions*, select *Restrict key* and choose ONLY:
   - `Places API (New)`
   - `Routes API`
3. **Application Restrictions**: Restrict access to your production server IP addresses.
4. **Quotas & Budgets**: Set daily quotas under *Quotas & System Limits* and establish Google Cloud Budget Alerts at 50%, 80%, and 100% to avoid unexpected charges.

### 3. Add to Environment
Copy `.env.example` to `.env.local` and set:
```bash
GOOGLE_MAPS_API_KEY=AIzaSy...your_actual_key_here
```
*(All Google API calls are strictly handled server-side in `/api/places` and `/api/routes`; your key is never exposed to client browsers).*

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```

### 3. Start Production Server
```bash
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Verification Test Suite
```bash
node test-suite.mjs
```

---

## 📁 Architecture Overview

```
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page with interactive hero, search & features
│   │   ├── dashboard/page.tsx     # National tourist overview dashboard with Recharts
│   │   ├── destinations/page.tsx  # Dual-mode directory: Monitored Catalog & Google Places API
│   │   ├── destinations/[id]/     # Deep-dive venue page: cumulative footfall, queue breakdown
│   │   ├── recommendations/       # Explainable AI Recommender with GPS & regional origins
│   │   ├── mobility/page.tsx      # Parking availability & Google Routes traffic calculator
│   │   ├── forecast/page.tsx      # 24h & 7-day crowd forecast analytics
│   │   ├── authority/page.tsx     # Command center, alert triage & official CSV export
│   │   ├── about/page.tsx         # Mathematical formulas, data policies & architecture
│   │   └── api/
│   │       ├── places/search/     # Google Places API (New) search endpoint
│   │       ├── places/nearby/     # Nearby attraction discovery endpoint
│   │       ├── routes/            # Traffic-aware driving routes endpoint
│   │       ├── crowd/status/      # Observation fidelity status endpoint
│   │       ├── destinations/      # Venue catalog & live footfall calculation
│   │       ├── recommendations/   # Multi-factor scoring endpoint
│   │       └── forecast/          # Predictive trajectory endpoint
│   ├── components/
│   │   ├── ui/CrowdBadge.tsx      # Visual badge with LIVE vs ESTIMATED indicator
│   │   ├── map/CrowdMapInner.tsx  # Leaflet map with telemetry popups & parking pins
│   │   └── ...
│   ├── lib/
│   │   ├── connectors/            # ICrowdDataProvider & sensor connectors
│   │   ├── services/
│   │   │   ├── places-service.ts  # Google Places API client with TTL caching
│   │   │   └── routes-service.ts  # Google Routes API client & kinematic fallback
│   │   ├── engines/
│   │   │   ├── realtime-crowd-service.ts # Real-time cumulative footfall & queue engine
│   │   │   ├── crowd-engine.ts           # Occupancy bounding & safety logic
│   │   │   └── recommendation-engine.ts  # Deterministic multi-factor recommender
│   │   └── data/destinations-data.ts     # Authentic Indian destination catalog
│   └── types/index.ts             # Complete TypeScript interfaces
├── .env.example                   # Secure environment configuration template
├── test-suite.mjs                 # Comprehensive automated verification suite
└── package.json
```
