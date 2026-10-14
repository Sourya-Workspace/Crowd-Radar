const BASE_URL = 'http://localhost:3000';

async function fetchUrl(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, headers: res.headers, text, json };
}

async function runTests() {
  console.log('=======================================================');
  console.log('🧪 RUNNING CROWDWISE AI VERIFICATION SUITE');
  console.log('=======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}\n   Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Vijayawada Temple Real-Time Telemetry
  await test('Real-Time Data: Kanaka Durga Temple Vijayawada Footfall', async () => {
    const res = await fetchUrl('/api/destinations/kanaka-durga-vijayawada');
    if (res.status !== 200 || !res.json?.success) {
      throw new Error(`Failed to fetch Vijayawada temple details (status: ${res.status})`);
    }
    const dest = res.json.data.destination;
    console.log(`   [Vijayawada Live] Visited today: ${dest.cumulativeVisitorsToday.toLocaleString()} devotees`);
    console.log(`   [Vijayawada Live] Currently inside: ${dest.currentVisitors.toLocaleString()} / ${dest.capacity.toLocaleString()} (${dest.occupancyPercentage}%)`);
    console.log(`   [Vijayawada Live] Gate inflow speed: ${dest.inflowRatePerMinute} persons/min | Outflow: ${dest.outflowRatePerMinute} persons/min`);
    console.log(`   [Vijayawada Live] Wait time: ~${dest.waitTimeMinutes} mins`);
    
    if (!dest.cumulativeVisitorsToday || dest.cumulativeVisitorsToday <= 0) {
      throw new Error(`Missing cumulative visitors today`);
    }
    if (!dest.currentVisitors || dest.currentVisitors <= 0) {
      throw new Error(`Missing current visitors`);
    }
    if (!dest.darshanQueues || dest.darshanQueues.length === 0) {
      throw new Error(`Missing darshan queue breakdown`);
    }
  });

  // 2. Regional destinations
  const checkDestinations = [
    { id: 'kotappakonda-temple', name: 'Kotappakonda (Chilakaluripet)' },
    { id: 'amaravati-stupa-guntur', name: 'Amaravati Stupa (Guntur)' },
    { id: 'suryalanka-beach-bapatla', name: 'Suryalanka Beach (Bapatla)' },
    { id: 'kothapatnam-beach-ongole', name: 'Kothapatnam Beach (Ongole)' },
    { id: 'ranganathaswamy-mypadu-nellore', name: 'Ranganatha Swamy (Nellore)' },
    { id: 'ooty-botanical-doddabetta', name: 'Ooty (Nilgiris)' },
    { id: 'kodaikanal-lake-pillars', name: 'Kodaikanal' },
    { id: 'arunachalam-temple', name: 'Arunachalam (Tiruvannamalai)' },
  ];

  for (const item of checkDestinations) {
    await test(`Destination Active: ${item.name}`, async () => {
      const res = await fetchUrl(`/api/destinations/${item.id}`);
      if (res.status !== 200 || !res.json?.success) {
        throw new Error(`Failed to fetch ${item.name}`);
      }
      const d = res.json.data.destination;
      if (!d.name || d.occupancyPercentage === undefined) {
        throw new Error(`Invalid destination data for ${item.name}`);
      }
    });
  }

  // 3. Recommendation engine with regional cities as starting points
  const testCities = ['Guntur', 'Ongole', 'Chilakaluripet', 'Bapatla', 'Nellore', 'Ooty', 'Kodaikanal'];

  for (const city of testCities) {
    await test(`Recommendation Engine from ${city}`, async () => {
      const res = await fetchUrl('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startingLocation: city,
          maxDistanceKm: 200,
          preferredCategory: 'All',
        }),
      });
      if (res.status !== 200 || !res.json?.success) {
        throw new Error(`Recommendation failed for ${city}`);
      }
      if (res.json.data.length === 0) {
        throw new Error(`Expected recommendations from ${city}`);
      }
    });
  }

  // 4. Google Places API (New) Search Endpoint
  await test('Places API Search: Kanaka Durga Temple', async () => {
    const res = await fetchUrl('/api/places/search?query=Kanaka+Durga+Vijayawada');
    if (res.status !== 200 || !res.json?.success) {
      throw new Error(`Places search failed with status ${res.status}`);
    }
    if (!Array.isArray(res.json.data) || res.json.data.length === 0) {
      throw new Error('Places search returned empty results array');
    }
    const first = res.json.data[0];
    console.log(`   [Places Result] ${first.name} (${first.formattedAddress}) [Source: ${res.json.source}]`);
    if (!first.name || !first.latitude || !first.longitude) {
      throw new Error('Invalid place result coordinates or name');
    }
  });

  // 5. Google Places API Nearby Discovery Endpoint
  await test('Places Nearby Discovery: Near Vijayawada Indrakeeladri', async () => {
    const res = await fetchUrl('/api/places/nearby?lat=16.5168&lng=80.6083&radius=50000');
    if (res.status !== 200 || !res.json?.success) {
      throw new Error(`Nearby discovery failed with status ${res.status}`);
    }
    if (!Array.isArray(res.json.data) || res.json.data.length === 0) {
      throw new Error('Places nearby discovery returned empty results array');
    }
    console.log(`   [Nearby Count] Discovered ${res.json.count} attractions nearby`);
  });

  // 6. Traffic-Aware Routes API Endpoint
  await test('Traffic-Aware Routes API: Guntur to Vijayawada Temple', async () => {
    const res = await fetchUrl('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: 16.3067, lng: 80.4365, label: 'Guntur' },
        destination: { lat: 16.5168, lng: 80.6083, label: 'Kanaka Durga Temple' },
      }),
    });
    if (res.status !== 200 || !res.json?.success) {
      throw new Error(`Routes API failed with status ${res.status}`);
    }
    const route = res.json.data;
    console.log(`   [Route Result] Distance: ${route.distanceKm} km, Duration: ~${route.durationInTrafficMinutes || route.durationMinutes} mins [Provider: ${route.provider}]`);
    if (!route.distanceKm || route.distanceKm <= 0) {
      throw new Error('Invalid route distance computed');
    }
  });

  // 7. Crowd Observation Status Endpoint
  await test('Crowd Status API: Telemetry Observation Integrity', async () => {
    const res = await fetchUrl('/api/crowd/status?destinationId=kanaka-durga-vijayawada');
    if (res.status !== 200 || !res.json?.success) {
      throw new Error(`Crowd status API failed with status ${res.status}`);
    }
    const obs = res.json.data;
    console.log(`   [Observation Status] Type: ${obs.measurementType}, Quality: ${obs.dataQuality}, Provider: ${obs.providerName}`);
    if (!obs.measurementType || !obs.providerName) {
      throw new Error('Missing observation measurement type or provider');
    }
  });

  // 8. Core Frontend Pages
  const pages = ['/', '/destinations', '/destinations/kanaka-durga-vijayawada', '/recommendations', '/mobility', '/forecast', '/authority', '/about', '/dashboard'];
  for (const page of pages) {
    await test(`Page Render: ${page}`, async () => {
      const res = await fetchUrl(page);
      if (res.status !== 200) {
        throw new Error(`Page ${page} failed with status ${res.status}`);
      }
    });
  }

  console.log('\n=======================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================================');

  if (failed > 0) process.exit(1);
}

runTests();
