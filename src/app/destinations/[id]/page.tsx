'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Clock,
  Car,
  Star,
  Sparkles,
  MapPin,
  Calendar,
  CloudSun,
  Navigation,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Info,
  Radio,
  TrendingUp,
  Activity,
  Layers,
  DoorOpen,
  Ticket,
} from 'lucide-react';
import { INITIAL_DESTINATIONS, INITIAL_PARKING_FACILITIES } from '@/lib/data/destinations-data';
import { CrowdBadge } from '@/ui/CrowdBadge';
import { HourlyTrendChart } from '@/components/charts/HourlyTrendChart';
import { ComparisonChart } from '@/components/charts/ComparisonChart';
import { CrowdMap } from '@/components/map/CrowdMap';
import { generateHourlyForecast, generateDailyForecast } from '@/lib/engines/prediction-engine';
import { calculateHaversineDistance, getCrowdBadgeInfo, formatTimeAgo } from '@/lib/utils';
import { DestinationCard } from '@/components/destinations/DestinationCard';
import { computeRealtimeCrowd } from '@/lib/engines/realtime-crowd-service';

export default function DestinationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const initialDestination = INITIAL_DESTINATIONS.find((d) => d.id === id || d.slug === id);

  // State for live updating destination
  const [destination, setDestination] = useState(initialDestination);
  const [liveSecondsAgo, setLiveSecondsAgo] = useState(2);

  // Live real-time tick interval
  useEffect(() => {
    if (!initialDestination) return;

    const interval = setInterval(() => {
      // Re-evaluate real-time crowd with small live tick
      const telemetry = computeRealtimeCrowd(initialDestination, new Date());
      setDestination((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentVisitors: telemetry.currentVisitors,
          cumulativeVisitorsToday: telemetry.cumulativeVisitorsToday,
          inflowRatePerMinute: telemetry.inflowRatePerMinute,
          outflowRatePerMinute: telemetry.outflowRatePerMinute,
          occupancyPercentage: telemetry.occupancyPercentage,
          waitTimeMinutes: telemetry.waitTimeMinutes,
          darshanQueues: telemetry.darshanQueues,
          gateStatuses: telemetry.gateStatuses,
          lastUpdated: new Date().toISOString(),
        };
      });
      setLiveSecondsAgo(0);
    }, 12000); // 12 seconds auto-update

    const clockInterval = setInterval(() => {
      setLiveSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, [initialDestination]);

  if (!destination) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Destination Not Found</h2>
        <p className="text-sm text-slate-500">The requested attraction does not exist in our telemetry catalog.</p>
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Destinations
        </Link>
      </div>
    );
  }

  // Parking facilities for this destination
  const parkingLots = INITIAL_PARKING_FACILITIES.filter((p) => p.destinationId === destination.id);

  // Hourly and daily predictions
  const hourlyData = generateHourlyForecast(destination);
  const dailyData = generateDailyForecast(destination);

  // Nearby alternatives within 180 km
  const alternatives = INITIAL_DESTINATIONS.filter((d) => d.id !== destination.id)
    .map((d) => ({
      ...d,
      distanceKm: calculateHaversineDistance(
        destination.latitude,
        destination.longitude,
        d.latitude,
        d.longitude
      ),
    }))
    .filter((d) => d.distanceKm <= 180)
    .sort((a, b) => a.occupancyPercentage - b.occupancyPercentage)
    .slice(0, 3);

  // Modal comparison state
  const [comparingWith, setComparingWith] = useState(alternatives[0] || null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const badgeInfo = getCrowdBadgeInfo(destination.crowdLevel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/destinations" className="hover:text-slate-800 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Destinations
          </Link>
          <span>/</span>
          <span className="text-slate-400">{destination.city}</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs">{destination.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live pulse indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Gate Telemetry ({liveSecondsAgo}s ago)</span>
          </div>

          {alternatives.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold hover:bg-teal-100 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Compare with Alternatives</span>
            </button>
          )}

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Directions</span>
          </a>
        </div>
      </div>

      {/* Hero Header with Photograph */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-[340px] sm:h-[420px] shadow-xl">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold shadow-md">
            {destination.category}
          </span>

          <CrowdBadge
            level={destination.crowdLevel}
            percentage={destination.occupancyPercentage}
            size="lg"
          />
        </div>

        {/* Bottom Hero Details */}
        <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              {destination.city}, {destination.state} {destination.district ? `(${destination.district})` : ''}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              {destination.rating} ({destination.reviewsCount.toLocaleString()} reviews)
            </span>
            <span>•</span>
            <span className="text-teal-300 font-medium">Opening: {destination.openingHours}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-3xl">
            {destination.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed line-clamp-2">
            {destination.description}
          </p>
        </div>
      </div>

      {/* REAL-TIME LIVE CROWD & DEVOTEE FOOTFALL METRICS (Requested by user) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: How many people visited today */}
        <div className="bg-white p-5 rounded-2xl border border-teal-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Visited Today So Far
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {destination.cumulativeVisitorsToday.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-500">persons</span>
          </p>
          <p className="text-[11px] text-teal-700 mt-1 font-medium flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Cumulative footfall since 04:00 AM opening
          </p>
        </div>

        {/* Metric 2: Instantaneous active visitors inside right now */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Currently Inside Premises
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {destination.currentVisitors.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-500">devotees</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Safe Max Capacity: <strong>{destination.capacity.toLocaleString()}</strong>
          </p>
        </div>

        {/* Metric 3: Live Inflow / Outflow Gate Speed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gate Inflow Speed
            </span>
            <DoorOpen className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-teal-700 mt-2">
            {destination.inflowRatePerMinute}{' '}
            <span className="text-xs font-semibold text-slate-500">people/min</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Outflow: <strong>{destination.outflowRatePerMinute} people/min</strong>
          </p>
        </div>

        {/* Metric 4: General Darshan Wait Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Darshan Wait Time
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">
            ~{destination.waitTimeMinutes}{' '}
            <span className="text-xs font-semibold text-slate-500">mins</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            General Sarva Darshan line
          </p>
        </div>
      </div>

      {/* Real-Time Darshan Queues & Gate Sensors Breakdown */}
      {destination.darshanQueues && destination.darshanQueues.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-teal-600" />
                <span>Live Darshan Queue Telemetry</span>
              </h3>
              <p className="text-xs text-slate-500">
                Real-time queue delays by ticket tier at {destination.name}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Sensor Triangulated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {destination.darshanQueues.map((q, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{q.type}</span>
                  <span className="text-xs font-extrabold text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {q.price}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 text-slate-800">
                  <span className="text-2xl font-black text-slate-900">~{q.waitTimeMinutes}</span>
                  <span className="text-xs font-semibold text-slate-500">minutes queue time</span>
                </div>
                {q.tokensAvailable !== undefined && (
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    ✓ ~{q.tokensAvailable} entry slots available now
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Gate status lines */}
          {destination.gateStatuses && destination.gateStatuses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Entry Gate Congestion Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {destination.gateStatuses.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-2xs"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        g.flowLevel === 'congested'
                          ? 'bg-rose-500'
                          : g.flowLevel === 'metered'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <p className="font-bold text-slate-900">{g.gateName}</p>
                      <p className="text-[11px] text-slate-500">{g.notes}</p>
                      <p className="text-[10px] text-teal-700 font-semibold mt-0.5">
                        Current Inflow: {g.currentInflowPerMinute} persons/min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real-time Status Card & Occupancy Meter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Occupancy gauge */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Live Occupancy Status
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {destination.occupancyPercentage}%{' '}
                  <span className="text-sm font-semibold text-slate-500">
                    ({destination.currentVisitors.toLocaleString()} / {destination.capacity.toLocaleString()})
                  </span>
                </h3>
              </div>
              <CrowdBadge level={destination.crowdLevel} size="md" />
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${badgeInfo.barColor}`}
                style={{ width: `${destination.occupancyPercentage}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {badgeInfo.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Updated {formatTimeAgo(destination.lastUpdated)}
              </span>
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                Data Source: <strong className="text-slate-700">{destination.dataSource}</strong>
              </span>
            </div>
          </div>

          {/* Wait time box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Est. Waiting Time
              </span>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                ~{destination.waitTimeMinutes}{' '}
                <span className="text-sm font-medium text-slate-500">mins</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Average queue delay at security/entry points.</p>
            </div>
            <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/60">
              <strong>Entry:</strong> {destination.entryFee}
            </div>
          </div>

          {/* Best Visit Windows */}
          <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Recommended Window
              </span>
              <p className="text-sm font-bold text-teal-950 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                {destination.bestTimeToVisit}
              </p>
              <p className="text-xs text-teal-800/80 mt-1">
                Lowest crowd volume and quickest entry access.
              </p>
            </div>
            <div className="text-xs text-teal-900 pt-2 border-t border-teal-200/60">
              <strong>Peak hours to avoid:</strong> {destination.peakHours}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly and Daily Trend Charts */}
      <div className="space-y-6">
        <HourlyTrendChart
          hourlyData={hourlyData}
          capacity={destination.capacity}
          destinationName={destination.name}
        />

        {/* 7-Day Outlook Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">7-Day Projected Footfall &amp; Weather</h3>
            <p className="text-xs text-slate-500">
              Weekly diurnal visitor forecast with predicted peak times and weather conditions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Date &amp; Day</th>
                  <th className="py-2.5 px-3">Weather</th>
                  <th className="py-2.5 px-3">Est. Daily Visitors</th>
                  <th className="py-2.5 px-3">Peak Density</th>
                  <th className="py-2.5 px-3">Crowd Level</th>
                  <th className="py-2.5 px-3">Recommended Visiting Slot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {dailyData.map((day) => (
                  <tr key={day.date} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {day.dayOfWeek}, {day.date.split('-').slice(1).join('/')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <CloudSun className="w-4 h-4 text-amber-500" />
                        {day.weatherForecast} ({day.temperatureCelsius}°C)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {day.expectedVisitors.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {day.peakOccupancyPercentage}%
                    </td>
                    <td className="py-3 px-3">
                      <CrowdBadge level={day.overallCrowdLevel} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-medium">
                      {day.bestTimeToVisit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Map & Parking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Location &amp; Access Map</h3>
            <span className="text-xs text-slate-400">
              Coordinates: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
            </span>
          </div>
          <CrowdMap
            destinations={[destination]}
            parkingFacilities={parkingLots}
            center={[destination.latitude, destination.longitude]}
            zoom={14}
            height="380px"
          />
        </div>

        {/* Parking facilities column */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Dedicated Parking Facilities</h3>

          {parkingLots.length > 0 ? (
            <div className="space-y-3">
              {parkingLots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{lot.name}</h4>
                      <p className="text-[11px] text-slate-500">{lot.address}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        lot.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lot.status === 'limited'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {lot.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available Spaces:</span>
                      <span className="font-bold text-slate-900">
                        {lot.availableSpaces} / {lot.totalSpaces}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Tariff: {lot.hourlyRate}</span>
                      <span>Walking: ~{lot.walkingDistanceMinutes} mins</span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate to Parking</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>Municipal parking available at nearby city center stands.</p>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Low-Crowd Alternatives */}
      {alternatives.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Dispersal Suggestions</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Calmer Attractions Near {destination.name}
              </h3>
              <p className="text-xs text-slate-500">
                Experience similar heritage and nature with significantly fewer crowds and open parking.
              </p>
            </div>

            <Link
              href={`/recommendations?benchmark=${destination.id}&city=${encodeURIComponent(destination.city)}`}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Explore All Alternatives</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {alternatives.map((alt) => (
              <DestinationCard key={alt.id} destination={alt} />
            ))}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && comparingWith && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Side-by-Side Attraction Comparison</span>
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 font-medium">Compare with:</span>
              <select
                value={comparingWith.id}
                onChange={(e) => {
                  const found = alternatives.find((a) => a.id === e.target.value);
                  if (found) setComparingWith(found);
                }}
                className="py-1 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
              >
                {alternatives.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.occupancyPercentage}% occupied)
                  </option>
                ))}
              </select>
            </div>

            <ComparisonChart destA={destination} destB={comparingWith} />

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Recommendation Insight:
              </p>
              <p>
                Visiting <strong>{comparingWith.name}</strong> will save you approximately{' '}
                <strong>{Math.max(0, destination.waitTimeMinutes - comparingWith.waitTimeMinutes)} minutes</strong> in
                queues, with{' '}
                <strong>{Math.abs(destination.occupancyPercentage - comparingWith.occupancyPercentage)}% lower crowd density</strong>.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <Link
                href={`/destinations/${comparingWith.id}`}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
              >
                View {comparingWith.name}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
