'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INITIAL_DESTINATIONS } from '@/lib/data/destinations-data';
import { DestinationCard } from '@/components/destinations/DestinationCard';
import { DestinationFilter } from '@/components/destinations/DestinationFilter';
import { MapPin, SlidersHorizontal, Sparkles, Globe, Search, ExternalLink, Compass, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PlaceSearchResult, Destination } from '@/types';

function DestinationsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [activeTab, setActiveTab] = useState<'monitored' | 'places'>('monitored');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCrowdLevel, setSelectedCrowdLevel] = useState('any');
  const [selectedRating, setSelectedRating] = useState(0);

  // Google Places Live Search State
  const [placesQuery, setPlacesQuery] = useState(initialSearch || 'Kanaka Durga Temple Vijayawada');
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesResults, setPlacesResults] = useState<PlaceSearchResult[]>([]);
  const [placesSource, setPlacesSource] = useState<string>('');
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [nearbyResults, setNearbyResults] = useState<{ [key: string]: PlaceSearchResult[] }>({});
  const [loadingNearbyFor, setLoadingNearbyFor] = useState<string | null>(null);

  // Sync if URL query params change
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
      setPlacesQuery(initialSearch);
    }
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  const cities = useMemo(() => {
    return Array.from(new Set(INITIAL_DESTINATIONS.map((d) => d.city))).sort();
  }, []);

  // Filtered logic for monitored catalog
  const filtered = useMemo(() => {
    return INITIAL_DESTINATIONS.filter((d) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesCity = d.city.toLowerCase().includes(q);
        const matchesState = d.state.toLowerCase().includes(q);
        const matchesDesc = d.description.toLowerCase().includes(q);
        const matchesTag = d.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesState && !matchesDesc && !matchesTag) {
          return false;
        }
      }

      // Category
      if (
        selectedCategory &&
        selectedCategory !== 'All Categories' &&
        d.category !== selectedCategory
      ) {
        return false;
      }

      // City
      if (selectedCity && selectedCity !== 'All Cities' && d.city !== selectedCity) {
        return false;
      }

      // Crowd Level
      if (selectedCrowdLevel && selectedCrowdLevel !== 'any' && d.crowdLevel !== selectedCrowdLevel) {
        return false;
      }

      // Rating
      if (selectedRating > 0 && d.rating < selectedRating) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedCity, selectedCrowdLevel, selectedRating]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('All Cities');
    setSelectedCrowdLevel('any');
    setSelectedRating(0);
  };

  // Google Places API search handler
  const handleExecutePlacesSearch = async (queryText?: string) => {
    const q = (queryText || placesQuery).trim();
    if (!q) return;

    setPlacesLoading(true);
    setPlacesError(null);
    try {
      const res = await fetch(`/api/places/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPlacesResults(data.data);
        setPlacesSource(data.source || 'Google Places API (New)');
      } else {
        setPlacesError(data.error || 'Failed to search places');
      }
    } catch (err: any) {
      setPlacesError(err.message || 'Network error querying Places API');
    } finally {
      setPlacesLoading(false);
    }
  };

  // Nearby discovery handler
  const handleDiscoverNearby = async (place: PlaceSearchResult) => {
    setLoadingNearbyFor(place.placeId);
    try {
      const res = await fetch(`/api/places/nearby?lat=${place.latitude}&lng=${place.longitude}&radius=30000`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNearbyResults((prev) => ({
          ...prev,
          [place.placeId]: data.data.filter((p: PlaceSearchResult) => p.name !== place.name),
        }));
      }
    } catch (err) {
      console.error('Failed to discover nearby:', err);
    } finally {
      setLoadingNearbyFor(null);
    }
  };

  // Helper to find if place matches any monitored destination
  const findMonitoredMatch = (name: string, lat: number, lng: number): Destination | undefined => {
    const cleanName = name.toLowerCase();
    return INITIAL_DESTINATIONS.find((d) => {
      if (d.name.toLowerCase().includes(cleanName) || cleanName.includes(d.name.toLowerCase())) return true;
      const dLat = Math.abs(d.latitude - lat);
      const dLng = Math.abs(d.longitude - lng);
      return dLat < 0.05 && dLng < 0.05;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Smart Tourism Directory &amp; Real Search</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Tourist Destinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse monitored attractions across India with real-time footfall telemetry, or query any Indian location via Google Places API (New).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recommendations"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Alternative Finder</span>
          </Link>
        </div>
      </div>

      {/* Directory Mode Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('monitored')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'monitored'
              ? 'bg-slate-900 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4 text-teal-400" />
          <span>Monitored Telemetry Catalog ({INITIAL_DESTINATIONS.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('places');
            if (placesResults.length === 0) {
              handleExecutePlacesSearch();
            }
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'places'
              ? 'bg-teal-700 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-300" />
          <span>Google Places API (New) Real Search</span>
        </button>
      </div>

      {/* TAB 1: Monitored Catalog */}
      {activeTab === 'monitored' && (
        <div className="space-y-6">
          {/* Filter Component */}
          <DestinationFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            selectedCrowdLevel={selectedCrowdLevel}
            onCrowdLevelChange={setSelectedCrowdLevel}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            cities={cities}
            totalResults={filtered.length}
            onResetFilters={handleResetFilters}
          />

          {/* Quick link to Places search if user typed something */}
          {searchQuery && (
            <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-teal-900">
                Want to search for <strong>&quot;{searchQuery}&quot;</strong> beyond our monitored catalog using Google Places API?
              </span>
              <button
                onClick={() => {
                  setPlacesQuery(searchQuery);
                  setActiveTab('places');
                  handleExecutePlacesSearch(searchQuery);
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search with Google Places</span>
              </button>
            </div>
          )}

          {/* Destination Cards Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filtered.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 my-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching destinations found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn&apos;t find any attractions matching your current filter criteria in the monitored catalog.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => {
                    setPlacesQuery(searchQuery || 'Vijayawada Temple');
                    setActiveTab('places');
                    handleExecutePlacesSearch(searchQuery || 'Vijayawada Temple');
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Search Google Places API</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Google Places API Live Search */}
      {activeTab === 'places' && (
        <div className="space-y-6">
          {/* Places Search Input Box */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search any Indian attraction, temple, beach, or monument (e.g. Kanaka Durga, Kotappakonda, Suryalanka, Arunachalam)..."
                  value={placesQuery}
                  onChange={(e) => setPlacesQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecutePlacesSearch()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-sm placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => handleExecutePlacesSearch()}
                disabled={placesLoading}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {placesLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Querying Places API...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Real Attraction</span>
                  </>
                )}
              </button>
            </div>

            {/* Source status banner */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Data Source:</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-mono text-[11px] border border-emerald-200">
                  {placesSource || 'Google Places API (New) / Verified Local Fallback'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transparent Data Policy: Venues without direct sensor feeds are labeled &quot;Live crowd data unavailable&quot;.
              </p>
            </div>
          </div>

          {placesError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{placesError}</span>
            </div>
          )}

          {/* Places Results Grid */}
          {placesResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Places API Search Results ({placesResults.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {placesResults.map((place) => {
                  const monitoredMatch = findMonitoredMatch(place.name, place.latitude, place.longitude);
                  const nearby = nearbyResults[place.placeId];

                  return (
                    <div
                      key={place.placeId}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                    >
                      <div className="p-5 space-y-3">
                        {/* Status Header */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                            {place.source}
                          </span>

                          {monitoredMatch ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              {monitoredMatch.measurementType === 'MEASURED' ? 'LIVE TELEMETRY' : 'ESTIMATED'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <ShieldAlert className="w-3 h-3" />
                              Live crowd unavailable
                            </span>
                          )}
                        </div>

                        {/* Title & Address */}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1">{place.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{place.formattedAddress}</p>
                        </div>

                        {/* GPS Coordinates & Rating */}
                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                          <span className="font-mono text-[11px] text-slate-500">
                            {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E
                          </span>
                          {place.rating && (
                            <span className="font-semibold text-amber-600 flex items-center gap-1">
                              ★ {place.rating} {place.userRatingCount ? `(${place.userRatingCount.toLocaleString()})` : ''}
                            </span>
                          )}
                        </div>

                        {/* Telemetry or Limitation Explanation */}
                        {monitoredMatch ? (
                          <div className="bg-teal-50/70 border border-teal-200/70 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Active Headcount:</span>
                              <span className="font-bold text-teal-900">{monitoredMatch.currentVisitors.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Visited Today:</span>
                              <span className="font-bold text-teal-900">{monitoredMatch.cumulativeVisitorsToday.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Occupancy:</span>
                              <span className="font-bold text-teal-800">{monitoredMatch.occupancyPercentage}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5">
                            <div className="text-[11px] text-slate-500 leading-relaxed">
                              No authorized live camera or turnstile counter is currently linked for this venue.
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                              <span className="text-slate-600">Regional Diurnal Estimate:</span>
                              <span className="font-semibold text-slate-800">~42% Moderate</span>
                            </div>
                          </div>
                        )}

                        {/* Nearby Attractions Accordion if fetched */}
                        {nearby && nearby.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                              Nearby Attractions ({nearby.length}):
                            </span>
                            <div className="space-y-1.5">
                              {nearby.slice(0, 3).map((item) => (
                                <div
                                  key={item.placeId}
                                  className="text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                                >
                                  <span className="font-medium text-slate-800 truncate pr-2">{item.name}</span>
                                  {item.rating && <span className="text-amber-600 shrink-0 text-[11px]">★ {item.rating}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-2">
                        {monitoredMatch ? (
                          <Link
                            href={`/destinations/${monitoredMatch.id}`}
                            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <span>View Live Headcount Dashboard</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleDiscoverNearby(place)}
                            disabled={loadingNearbyFor === place.placeId}
                            className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Compass className="w-3.5 h-3.5 text-teal-600" />
                            <span>
                              {loadingNearbyFor === place.placeId ? 'Discovering Nearby...' : 'Discover Nearby Attractions'}
                            </span>
                          </button>
                        )}

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/mobility?destLat=${place.latitude}&destLng=${place.longitude}&destName=${encodeURIComponent(place.name)}`}
                            className="flex-1 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold text-center transition-colors"
                          >
                            Traffic &amp; Route
                          </Link>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors flex items-center justify-center"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
          Loading destinations...
        </div>
      }
    >
      <DestinationsContent />
    </Suspense>
  );
}

