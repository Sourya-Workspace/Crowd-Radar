'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Car,
  Clock,
  Compass,
  CheckCircle2,
  Sliders,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Navigation,
  LocateFixed,
} from 'lucide-react';
import { INITIAL_DESTINATIONS } from '@/lib/data/destinations-data';
import { getRankedRecommendations, CITY_COORDINATES } from '@/lib/engines/recommendation-engine';
import { RecommendationRequest, RecommendationItem } from '@/types';
import { CrowdBadge } from '@/ui/CrowdBadge';
import Link from 'next/link';

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const benchmarkId = searchParams.get('benchmark') || undefined;
  const initialCity = searchParams.get('city') || 'Vijayawada';

  // Form State
  const [startingLocation, setStartingLocation] = useState(initialCity);
  const [startingLat, setStartingLat] = useState<number | undefined>(undefined);
  const [startingLon, setStartingLon] = useState<number | undefined>(undefined);
  const [preferredCategory, setPreferredCategory] = useState('All');
  const [maxDistanceKm, setMaxDistanceKm] = useState(150);
  const [maxCrowdLevel, setMaxCrowdLevel] = useState('any');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [travelTime, setTravelTime] = useState('10:00 AM');
  const [isFamilyFriendly, setIsFamilyFriendly] = useState(true);
  const [budgetPreference, setBudgetPreference] = useState<'any' | 'budget' | 'moderate' | 'luxury'>('any');
  const [isLocating, setIsLocating] = useState(false);

  // Benchmark destination to replace
  const benchmarkDest = benchmarkId
    ? INITIAL_DESTINATIONS.find((d) => d.id === benchmarkId)
    : undefined;

  // Results state
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Browser Geolocation Detection
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStartingLat(pos.coords.latitude);
        setStartingLon(pos.coords.longitude);
        setStartingLocation(`Live Device GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not access your location. Please select a city from the list.');
      },
      { timeout: 8000 }
    );
  };

  const runRecommendationEngine = () => {
    setIsLoading(true);
    setTimeout(() => {
      const request: RecommendationRequest = {
        startingLocation,
        startingLat,
        startingLon,
        preferredCategory,
        maxDistanceKm,
        maxCrowdLevel,
        travelDate,
        travelTime,
        isFamilyFriendly,
        budgetPreference,
      };

      const results = getRankedRecommendations(
        INITIAL_DESTINATIONS,
        request,
        benchmarkDest?.id
      );

      setRecommendations(results);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    runRecommendationEngine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [benchmarkId, startingLat, startingLon, startingLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable AI Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Intelligent Low-Crowd Attraction Recommender
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Enter your current starting city or use live GPS to calculate actual travel distances, live gate telemetry, and discover peaceful alternatives across Andhra Pradesh, Tamil Nadu, and all India.
        </p>
      </div>

      {/* Benchmark comparison callout if user came from a crowded destination card */}
      {benchmarkDest && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={benchmarkDest.imageUrl}
              alt={benchmarkDest.name}
              className="w-14 h-14 rounded-xl object-cover border border-amber-200"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Finding Alternatives For:
              </span>
              <h4 className="font-bold text-sm text-slate-900">{benchmarkDest.name}</h4>
              <p className="text-xs text-slate-600">
                Current Occupancy: <strong className="text-rose-600">{benchmarkDest.occupancyPercentage}%</strong> • Wait Time: ~{benchmarkDest.waitTimeMinutes} mins
              </p>
            </div>
          </div>
          <Link
            href="/recommendations"
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline self-start sm:self-auto"
          >
            Clear Benchmark
          </Link>
        </div>
      )}

      {/* Grid: Left filter controls / Right ranked results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Preference Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Starting Point &amp; Preferences</span>
            </h3>
            <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
              GPS Enabled
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Starting Location with GPS Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Starting Location / City
                </label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
                >
                  <LocateFixed className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
                </button>
              </div>

              <select
                value={startingLocation}
                onChange={(e) => {
                  setStartingLocation(e.target.value);
                  setStartingLat(undefined);
                  setStartingLon(undefined);
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs font-medium text-slate-800 bg-white"
              >
                <optgroup label="Andhra Pradesh Hubs">
                  <option value="Vijayawada">Vijayawada (NTR)</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Chilakaluripet">Chilakaluripet (Palnadu)</option>
                  <option value="Bapatla">Bapatla (Coastal)</option>
                  <option value="Ongole">Ongole (Prakasam)</option>
                  <option value="Nellore">Nellore (SPSR)</option>
                  <option value="Tirupati">Tirupati</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Araku">Araku Valley</option>
                  <option value="Srisailam">Srisailam</option>
                  <option value="Kakinada">Kakinada</option>
                  <option value="Rajahmundry">Rajahmundry</option>
                  <option value="Kurnool">Kurnool</option>
                  <option value="Kadapa">Kadapa</option>
                  <option value="Anantapur">Anantapur</option>
                </optgroup>

                <optgroup label="Tamil Nadu &amp; Hill Stations">
                  <option value="Ooty">Ooty (Udhagamandalam)</option>
                  <option value="Kodaikanal">Kodaikanal</option>
                  <option value="Tiruvannamalai (Arunachalam)">Tiruvannamalai (Arunachalam)</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Rameshwaram">Rameshwaram</option>
                </optgroup>

                <optgroup label="Karnataka &amp; Kerala">
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mysuru">Mysuru</option>
                  <option value="Hampi">Hampi</option>
                  <option value="Munnar">Munnar (Kerala)</option>
                  <option value="Kochi">Kochi</option>
                </optgroup>

                <optgroup label="Telangana &amp; Pan-India">
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Goa (Calangute)">Goa (Calangute)</option>
                  <option value="Agra">Agra</option>
                  <option value="Varanasi">Varanasi</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                </optgroup>
              </select>
            </div>

            {/* Preferred Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preferred Category
              </label>
              <select
                value={preferredCategory}
                onChange={(e) => setPreferredCategory(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="All">All Categories</option>
                <option value="Temples & Religious">Temples &amp; Religious</option>
                <option value="Beaches">Beaches</option>
                <option value="Hill Stations">Hill Stations</option>
                <option value="Historical Monuments">Historical Monuments</option>
                <option value="Nature & Wildlife">Nature &amp; Wildlife</option>
                <option value="Museums & Cultural">Museums &amp; Cultural</option>
              </select>
            </div>

            {/* Max Travel Distance Slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Maximum Travel Distance</span>
                <span className="text-teal-700 font-bold">{maxDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="450"
                step="10"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10 km (Local)</span>
                <span>450 km (Regional)</span>
              </div>
            </div>

            {/* Preferred Crowd Level */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maximum Acceptable Crowd
              </label>
              <select
                value={maxCrowdLevel}
                onChange={(e) => setMaxCrowdLevel(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="any">Any (Rank by lowest crowd)</option>
                <option value="low">🟢 Only Low Crowd (&lt;40%)</option>
                <option value="moderate">🟡 Moderate or lower (&lt;65%)</option>
              </select>
            </div>

            {/* Visit Date & Time */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Time</label>
                <select
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                >
                  <option value="08:00 AM">08:00 AM (Morning)</option>
                  <option value="10:00 AM">10:00 AM (Forenoon)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="05:00 PM">05:00 PM (Evening)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={isFamilyFriendly}
                  onChange={(e) => setIsFamilyFriendly(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Family Friendly &amp; Senior Accessible</span>
              </label>
            </div>

            <button
              onClick={runRecommendationEngine}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Computing Scores...' : 'Recalculate Recommendations'}</span>
            </button>
          </div>
        </div>

        {/* Ranked Recommendations Column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ranked Alternative Attractions
              </h2>
              <p className="text-xs text-slate-500">
                Measured from <strong className="text-slate-800">{startingLocation}</strong>
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
              {recommendations.length} Matches Found
            </span>
          </div>

          {/* List of Recommendation Cards */}
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((item, idx) => (
                <div
                  key={item.destination.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5"
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-full md:w-52 h-44 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                    <img
                      src={item.destination.imageUrl}
                      alt={item.destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold">
                        #{idx + 1} Best Match
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <CrowdBadge
                        level={item.destination.crowdLevel}
                        percentage={item.destination.occupancyPercentage}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Information & Explainability breakdown */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
                            {item.destination.category} • {item.destination.city} ({item.destination.state})
                          </span>
                          <h3 className="font-bold text-base text-slate-900 leading-tight">
                            {item.destination.name}
                          </h3>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right flex-shrink-0">
                          <div className="px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider">Score</p>
                            <p className="text-lg font-black">{item.matchScore}</p>
                          </div>
                        </div>
                      </div>

                      {/* Travel Metrics Chips */}
                      <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1 font-medium">
                          <Compass className="w-3.5 h-3.5 text-slate-400" />
                          {item.distanceKm} km away
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          ~{item.estimatedTravelMinutes} mins drive
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-1 font-semibold border border-emerald-200">
                          <Car className="w-3.5 h-3.5 text-emerald-600" />
                          {item.destination.nearestParkingAvailable} free spots
                        </span>
                      </div>

                      {/* Real-time footfall indicator */}
                      {item.destination.cumulativeVisitorsToday > 0 && (
                        <div className="mt-2 text-[11px] text-teal-800 font-semibold bg-teal-50/70 p-1.5 rounded-lg border border-teal-100">
                          ⚡ Real-time: {item.destination.cumulativeVisitorsToday.toLocaleString()} devotees visited today • {item.destination.currentVisitors.toLocaleString()} currently inside
                        </div>
                      )}

                      {/* Explainability: "Why this was recommended" */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <p className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          Why CrowdWise AI recommends this:
                        </p>
                        <ul className="space-y-0.5 text-slate-600 pl-4 list-disc text-[11px] leading-relaxed">
                          {item.whyRecommended.map((reason, rIdx) => (
                            <li key={rIdx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Action links */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Best arrival: <strong className="text-slate-800">{item.bestSuggestedArrival}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${item.destination.latitude},${item.destination.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="Open GPS Navigation"
                        >
                          <Navigation className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/destinations/${item.destination.id}`}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Explore Site</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Compass className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Alternative Attractions in Range</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your maximum travel distance limit or choose &quot;All Categories&quot; to uncover more hidden gems.
              </p>
              <button
                onClick={() => {
                  setMaxDistanceKm(350);
                  setPreferredCategory('All');
                  setMaxCrowdLevel('any');
                  runRecommendationEngine();
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold"
              >
                Expand Search Radius to 350 km
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
          Loading AI Recommendations...
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
