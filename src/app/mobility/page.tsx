'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  LocateFixed,
  Route as RouteIcon,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_DESTINATIONS, INITIAL_PARKING_FACILITIES } from '@/lib/data/destinations-data';
import { CrowdMap } from '@/components/map/CrowdMap';
import { calculateHaversineDistance, formatTimeAgo } from '@/lib/utils';
import { CITY_COORDINATES } from '@/lib/engines/recommendation-engine';
import { RouteInformation } from '@/types';
import Link from 'next/link';

export default function MobilityPage() {
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('kanaka-durga-vijayawada');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Routing calculation state
  const [originCity, setOriginCity] = useState<string>('Guntur');
  const [customOriginCoords, setCustomOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [routeInfo, setRouteInfo] = useState<RouteInformation | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  const selectedDestination =
    INITIAL_DESTINATIONS.find((d) => d.id === selectedDestinationId) || INITIAL_DESTINATIONS[0];

  const destinationFacilities = INITIAL_PARKING_FACILITIES.filter(
    (p) => p.destinationId === selectedDestination.id
  );

  // Alternative destination with ample parking
  const alternativeWithParking = INITIAL_DESTINATIONS.filter(
    (d) => d.id !== selectedDestination.id && d.nearestParkingAvailable > 150
  )
    .map((d) => ({
      ...d,
      distKm: calculateHaversineDistance(
        selectedDestination.latitude,
        selectedDestination.longitude,
        d.latitude,
        d.longitude
      ),
    }))
    .sort((a, b) => b.nearestParkingAvailable - a.nearestParkingAvailable)[0];

  const totalParkingSlots = INITIAL_PARKING_FACILITIES.reduce((acc, f) => acc + f.totalSpaces, 0);
  const totalFreeSlots = INITIAL_PARKING_FACILITIES.reduce((acc, f) => acc + f.availableSpaces, 0);

  // Route calculation function
  const handleCalculateRoute = async () => {
    setIsCalculatingRoute(true);

    const originLat = customOriginCoords?.lat || CITY_COORDINATES[originCity]?.lat || 16.3067;
    const originLng = customOriginCoords?.lng || CITY_COORDINATES[originCity]?.lon || 80.4365;

    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: {
            lat: originLat,
            lng: originLng,
            label: customOriginCoords ? 'My Live Location' : originCity,
          },
          destination: {
            lat: selectedDestination.latitude,
            lng: selectedDestination.longitude,
            label: selectedDestination.name,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setRouteInfo(json.data);
      }
    } catch (err) {
      console.error('Failed to calculate route:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  useEffect(() => {
    handleCalculateRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDestinationId, originCity, customOriginCoords]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomOriginCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not retrieve current location.');
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1.5">
            <Car className="w-3.5 h-3.5" />
            <span>Smart Urban Mobility &amp; Routes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Traffic Routing &amp; Smart Parking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Traffic-aware driving itineraries powered by Google Routes API with live turnstile parking feeds.
          </p>
        </div>

        {/* Data Integrity Pill */}
        <div className="bg-white text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>
            <strong>Fidelity:</strong> Live telemetry when connected; transparent estimates elsewhere.
          </span>
        </div>
      </div>

      {/* Aggregate Parking Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Monitored Facilities</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{INITIAL_PARKING_FACILITIES.length} Lots</p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Available Parking Bays</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{totalFreeSlots.toLocaleString()} Slots</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Capacity Monitored</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalParkingSlots.toLocaleString()} Bays</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Navigation className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Traffic Routing Computation Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <RouteIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Traffic-Aware Route Calculator</h3>
              <p className="text-xs text-slate-500">Computes real-time driving duration with traffic delay modeling</p>
            </div>
          </div>

          {routeInfo && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                routeInfo.isLiveTraffic
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${routeInfo.isLiveTraffic ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{routeInfo.provider}</span>
            </span>
          )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Origin Starting Point</label>
              <button
                type="button"
                onClick={handleUseGPS}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <LocateFixed className="w-3 h-3" />
                <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
              </button>
            </div>

            {customOriginCoords ? (
              <div className="flex items-center justify-between py-2 px-3 rounded-xl border border-teal-300 bg-teal-50/50 text-teal-900 font-bold">
                <span>Live GPS ({customOriginCoords.lat.toFixed(2)}, {customOriginCoords.lng.toFixed(2)})</span>
                <button
                  onClick={() => setCustomOriginCoords(null)}
                  className="text-[10px] text-teal-700 underline"
                >
                  Reset to City
                </button>
              </div>
            ) : (
              <select
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 font-medium text-slate-800 bg-white"
              >
                <option value="Guntur">Guntur, AP</option>
                <option value="Vijayawada">Vijayawada, AP</option>
                <option value="Chilakaluripet">Chilakaluripet, AP</option>
                <option value="Bapatla">Bapatla, AP</option>
                <option value="Ongole">Ongole, AP</option>
                <option value="Nellore">Nellore, AP</option>
                <option value="Tirupati">Tirupati, AP</option>
                <option value="Visakhapatnam">Visakhapatnam, AP</option>
                <option value="Chennai">Chennai, TN</option>
                <option value="Ooty">Ooty, TN</option>
                <option value="Kodaikanal">Kodaikanal, TN</option>
                <option value="Tiruvannamalai (Arunachalam)">Tiruvannamalai (Arunachalam)</option>
                <option value="Hyderabad">Hyderabad, TS</option>
                <option value="Bengaluru">Bengaluru, KA</option>
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Destination Tourist Site</label>
            <select
              value={selectedDestinationId}
              onChange={(e) => setSelectedDestinationId(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
            >
              {INITIAL_DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.city})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCalculateRoute}
              disabled={isCalculatingRoute}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isCalculatingRoute ? 'Calculating...' : 'Recalculate Route'}</span>
            </button>
          </div>
        </div>

        {/* Route Results Display */}
        {routeInfo && (
          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Driving Distance</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{routeInfo.distanceKm} km</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Duration</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  ~{routeInfo.durationInTrafficMinutes || routeInfo.durationMinutes} mins
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Traffic Status</span>
                <p className="text-sm font-bold text-emerald-700 mt-1 uppercase">
                  {routeInfo.trafficCondition} Traffic
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-center">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${customOriginCoords?.lat || CITY_COORDINATES[originCity]?.lat || 16.3067},${customOriginCoords?.lng || CITY_COORDINATES[originCity]?.lon || 80.4365}&destination=${selectedDestination.latitude},${selectedDestination.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Start Turn-by-Turn</span>
                </a>
              </div>
            </div>

            {routeInfo.warnings && routeInfo.warnings.length > 0 && (
              <p className="text-[11px] text-amber-800 flex items-center gap-1 pt-1">
                <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>{routeInfo.warnings[0]}</span>
              </p>
            )}

            {/* Turn by turn guidance steps */}
            {routeInfo.steps && routeInfo.steps.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-xs font-bold text-slate-700 mb-1.5">Route Guidance Segments:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                  {routeInfo.steps.map((s, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-slate-200/80">
                      <p className="font-semibold text-slate-800">{s.instruction}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">{s.distance} • ~{s.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Map & Dedicated Lots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fullscreen style Map (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Parking Lots &amp; Navigation Markers
            </h3>
            <span className="text-xs text-slate-400">
              Blue markers represent designated parking facilities
            </span>
          </div>

          <CrowdMap
            destinations={[selectedDestination]}
            parkingFacilities={INITIAL_PARKING_FACILITIES}
            center={[selectedDestination.latitude, selectedDestination.longitude]}
            zoom={13}
            height="460px"
          />
        </div>

        {/* Selected Destination Parking Facilities (1 col) */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            Parking for {selectedDestination.name}
          </h3>

          {destinationFacilities.length > 0 ? (
            <div className="space-y-3">
              {destinationFacilities.map((facility) => {
                const isSelected = selectedFacilityId === facility.id;
                const statusColors = {
                  available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  limited: 'bg-amber-100 text-amber-800 border-amber-200',
                  full: 'bg-rose-100 text-rose-800 border-rose-200',
                };

                return (
                  <div
                    key={facility.id}
                    onClick={() => setSelectedFacilityId(facility.id)}
                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{facility.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{facility.address}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          statusColors[facility.status]
                        }`}
                      >
                        {facility.status}
                      </span>
                    </div>

                    {/* Capacity meter */}
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Available:</span>
                        <span className="font-bold text-slate-900">
                          {facility.availableSpaces} / {facility.totalSpaces} ({facility.occupancyPercentage}% full)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            facility.occupancyPercentage > 85
                              ? 'bg-rose-500'
                              : facility.occupancyPercentage > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${facility.occupancyPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                        <span>Tariff: {facility.hourlyRate}</span>
                        <span>Walking: ~{facility.walkingDistanceMinutes} mins</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Updated {formatTimeAgo(facility.lastUpdated)}</span>
                      {facility.hasEvCharging && (
                        <span className="flex items-center gap-1 text-teal-700 font-semibold">
                          <Zap className="w-3 h-3" /> EV Charging Ready
                        </span>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> Google Maps
                      </a>
                      <a
                        href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${facility.latitude}%2C${facility.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        title="Open in OpenStreetMap"
                      >
                        <ExternalLink className="w-3 h-3" /> OSM
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>Municipal parking available at nearby city center stands.</p>
            </div>
          )}
        </div>
      </div>

      {/* Alternative Destination with nearby parking callout */}
      {alternativeWithParking && (
        <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={alternativeWithParking.imageUrl}
                alt={alternativeWithParking.name}
                className="w-16 h-16 rounded-xl object-cover border border-teal-200"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Ample Parking Alternative
                </span>
                <h4 className="font-bold text-base text-slate-900 mt-1">
                  Consider {alternativeWithParking.name}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Located in {alternativeWithParking.city} with{' '}
                  <strong className="text-emerald-700">
                    {alternativeWithParking.nearestParkingAvailable} open parking bays
                  </strong>{' '}
                  and only {alternativeWithParking.occupancyPercentage}% crowd density.
                </p>
              </div>
            </div>

            <Link
              href={`/destinations/${alternativeWithParking.id}`}
              className="self-start md:self-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-1.5"
            >
              <span>View Route &amp; Destination</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
