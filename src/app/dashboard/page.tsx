'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Compass,
  AlertTriangle,
  Car,
  TrendingDown,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { INITIAL_DESTINATIONS, INITIAL_PARKING_FACILITIES, INITIAL_ALERTS } from '@/lib/data/destinations-data';
import { StatCard } from '@/components/ui/StatCard';
import { CrowdBadge } from '@/ui/CrowdBadge';
import { CrowdDistributionChart } from '@/components/charts/CrowdDistributionChart';
import { HourlyTrendChart } from '@/components/charts/HourlyTrendChart';
import { CrowdMap } from '@/components/map/CrowdMap';
import { generateHourlyForecast } from '@/lib/engines/prediction-engine';
import { DestinationCard } from '@/components/destinations/DestinationCard';

export default function DashboardPage() {
  const [destinations, setDestinations] = useState(INITIAL_DESTINATIONS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrowdFilter, setSelectedCrowdFilter] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [isSimulating, setIsSimulating] = useState(false);

  // Compute aggregate metrics
  const totalDestinations = destinations.length;
  const totalVisitors = destinations.reduce((sum, d) => sum + d.currentVisitors, 0);
  const highCrowdCount = destinations.filter(d => d.crowdLevel === 'high' || d.crowdLevel === 'very_high').length;
  const lowCrowdCount = destinations.filter(d => d.crowdLevel === 'low').length;
  const availableParking = INITIAL_PARKING_FACILITIES.reduce((sum, p) => sum + p.availableSpaces, 0);

  // Distinct cities
  const cities = Array.from(new Set(destinations.map(d => d.city)));

  // Filtered destinations
  const filteredDestinations = destinations.filter(d => {
    if (selectedCategory !== 'All' && d.category !== selectedCategory) return false;
    if (selectedCity !== 'All' && d.city !== selectedCity) return false;
    if (selectedCrowdFilter === 'Low' && d.crowdLevel !== 'low') return false;
    if (selectedCrowdFilter === 'Moderate' && d.crowdLevel !== 'moderate') return false;
    if (selectedCrowdFilter === 'High' && (d.crowdLevel !== 'high' && d.crowdLevel !== 'very_high')) return false;
    return true;
  });

  // Top critical alerts for the banner
  const activeAlerts = INITIAL_ALERTS.filter(a => a.status !== 'resolved');

  // Hourly trend for the top destination (Taj Mahal or highest crowd)
  const topDestination = destinations.find(d => d.id === 'taj-mahal-agra') || destinations[0];
  const hourlyData = generateHourlyForecast(topDestination);

  // Recommended alternatives (low crowd sites)
  const recommendedAlternatives = destinations.filter(d => d.isAlternativeTo || d.crowdLevel === 'low').slice(0, 3);

  // Simulate dynamic refresh
  const handleRefreshData = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setDestinations(prev =>
        prev.map(d => {
          const delta = (Math.random() * 4 - 2) / 100;
          const newVisitors = Math.min(
            d.capacity,
            Math.max(Math.round(d.capacity * 0.1), Math.round(d.currentVisitors * (1 + delta)))
          );
          const newOccupancy = Math.round((newVisitors / d.capacity) * 100);
          return {
            ...d,
            currentVisitors: newVisitors,
            occupancyPercentage: newOccupancy,
            lastUpdated: new Date().toISOString(),
          };
        })
      );
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tourist Live Crowd Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ● Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time footfall intelligence, peak forecasts, and low-crowd alternative routes across India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshData}
            disabled={isSimulating}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            title="Fetch latest sensor readings"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Updating...' : 'Sync Sensor Feed'}</span>
          </button>

          <Link
            href="/recommendations"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommendations</span>
          </Link>
        </div>
      </div>

      {/* Critical Crowd Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600 flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-900">
                  {activeAlerts[0].title}
                </h3>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full uppercase">
                  {activeAlerts[0].severity}
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                {activeAlerts[0].message}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs font-medium text-rose-900">
                <span>Action: {activeAlerts[0].recommendedAction}</span>
                <Link
                  href="/authority"
                  className="text-rose-700 hover:text-rose-900 font-bold underline flex items-center gap-1"
                >
                  Authority View &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Monitored Sites"
          value={totalDestinations}
          subtitle="Indian tourism hubs"
          icon={Compass}
          variant="teal"
        />
        <StatCard
          title="Active Visitors"
          value={totalVisitors.toLocaleString()}
          subtitle="Estimated inside sites"
          icon={Users}
          variant="default"
          trend={{ value: '+4.2%', isPositive: false }}
        />
        <StatCard
          title="High Crowd Sites"
          value={highCrowdCount}
          subtitle="Over 65% capacity"
          icon={AlertTriangle}
          variant="rose"
        />
        <StatCard
          title="Calm Alternatives"
          value={lowCrowdCount}
          subtitle="Under 40% capacity"
          icon={TrendingDown}
          variant="emerald"
        />
        <StatCard
          title="Free Parking Bays"
          value={availableParking.toLocaleString()}
          subtitle="At monitored lots"
          icon={Car}
          variant="amber"
          trend={{ value: 'Ample', isNeutral: true }}
        />
      </div>

      {/* Interactive Map & Distribution Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Map (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Geographic Crowd Density
              </h2>
              <p className="text-xs text-slate-500">
                Pulsing red markers indicate safe capacity threshold exceedances.
              </p>
            </div>
            <Link
              href="/mobility"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Explore Routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CrowdMap
            destinations={filteredDestinations}
            parkingFacilities={INITIAL_PARKING_FACILITIES}
            height="420px"
          />
        </div>

        {/* Charts Column (1 col) */}
        <div className="space-y-6">
          <CrowdDistributionChart destinations={destinations} />

          {/* Quick Peak Period Callout */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Upcoming Peak Windows</h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                Weekend Forecast
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Peak congestion predicted between <span className="font-bold text-slate-800">4:00 PM – 7:30 PM</span> today at major pilgrimage sites.
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-800">Taj Mahal, Agra</span>
                <span className="text-rose-600 font-bold">91% (Critical)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-800">Tirumala Tirupati</span>
                <span className="text-rose-600 font-bold">88% (Surge)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-800">Calangute Beach, Goa</span>
                <span className="text-orange-600 font-bold">86% (High)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Trend Chart for Focus Destination */}
      <div>
        <HourlyTrendChart
          hourlyData={hourlyData}
          capacity={topDestination.capacity}
          destinationName={topDestination.name}
        />
      </div>

      {/* Recommended Low-Crowd Alternative Attractions */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Dispersion Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Top Recommended Low-Crowd Alternatives
            </h2>
            <p className="text-xs text-slate-500">
              Less congested attractions matching your interests with ample parking and shorter wait times.
            </p>
          </div>
          <Link
            href="/recommendations"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>Run Custom Recommendation Algorithm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedAlternatives.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </div>
    </div>
  );
}
