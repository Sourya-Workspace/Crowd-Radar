'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Users,
  Compass,
  BarChart3,
  Car,
  ShieldAlert,
  ArrowRight,
  Search,
  CheckCircle2,
  TrendingDown,
  Navigation,
  Activity,
  MapPin,
  Clock,
} from 'lucide-react';
import { INITIAL_DESTINATIONS, INITIAL_PARKING_FACILITIES } from '@/lib/data/destinations-data';
import { DestinationCard } from '@/components/destinations/DestinationCard';
import { CrowdMap } from '@/components/map/CrowdMap';
import { CrowdBadge } from '@/ui/CrowdBadge';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/destinations');
    }
  };

  // Select top featured destinations (showing contrast between high crowd vs calm alternative)
  const featured = INITIAL_DESTINATIONS.slice(0, 6);

  const totalVisitors = INITIAL_DESTINATIONS.reduce((sum, d) => sum + d.currentVisitors, 0);
  const totalParkingFree = INITIAL_PARKING_FACILITIES.reduce((sum, p) => sum + p.availableSpaces, 0);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-teal-50/60 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span>Next-Gen Smart Tourism Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Travel Smarter. <br />
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Beat the Crowds.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CrowdWise AI predicts peak visiting hours, detects overcrowding before you arrive, recommends peaceful nearby alternatives, and guides you to available parking.
            </p>

            {/* Quick Destination Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-6 flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Where do you want to explore? (e.g. Tirupati, Agra, Goa, Vizag)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none placeholder:text-slate-400 text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/destinations"
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore All Destinations</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-teal-600" />
                <span>View Live Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Counter */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-700">18</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Monitored Heritage Sites</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalVisitors.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Active Monitored Visitors</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {totalParkingFree.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Free Parking Slots</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">93.2%</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Prediction Confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Real-Time Geographic Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Interactive National Crowd Radar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Click on any destination marker to inspect real-time crowd occupancy, wait times, and open parking lots.
            </p>
          </div>
          <Link
            href="/mobility"
            className="mt-4 md:mt-0 text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Open Fullscreen Mobility Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <CrowdMap
          destinations={INITIAL_DESTINATIONS}
          parkingFacilities={INITIAL_PARKING_FACILITIES}
          height="460px"
        />
      </section>

      {/* How CrowdWise AI Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
            Smart Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            How CrowdWise AI Solves Overcrowding
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A closed-loop intelligence system that balances tourist footfall across major attractions and hidden gem alternatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="text-3xl font-extrabold text-teal-600/30 absolute top-4 right-4">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Live Crowd Estimation
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitors visitor densities against safe capacity thresholds using IoT sensors, gate counters, and simulated diurnal footfall models.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="text-3xl font-extrabold text-teal-600/30 absolute top-4 right-4">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Peak Period Prediction
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates hourly rush curves and 7-day visitor surges using historical moving averages to recommend optimal low-crowd arrival windows.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="text-3xl font-extrabold text-teal-600/30 absolute top-4 right-4">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              AI Alternative Matching
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recommends nearby lesser-known attractions matching your category and travel distance with up to 60% lower crowd density.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="text-3xl font-extrabold text-teal-600/30 absolute top-4 right-4">
              04
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Parking &amp; Smart Routes
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides real-time parking slot availability and direct navigation links to minimize traffic congestion in heritage zones.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Destinations Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Current Telemetry
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Featured Monitored Destinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time crowd statuses across iconic Indian pilgrimage centers, beaches, and monuments.
            </p>
          </div>
          <Link
            href="/destinations"
            className="mt-4 sm:mt-0 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>View All 18 Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="bg-slate-900 text-white py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-md">
              Comprehensive Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Dual-Purpose Platform: For Visitors &amp; Authorities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Delivering seamless experiences for travelers while giving city planners actionable crowd dispersal mechanisms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">
                Explainable Alternative Scoring
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Our recommendation engine uses a deterministic multi-factor model balancing crowd reduction, travel distance, visitor ratings, and parking availability.
              </p>
              <Link
                href="/recommendations"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>Try Recommendation Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">
                High-Fidelity Hourly Predictions
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Evaluated against held-out samples with a 6.8% Mean Absolute Percentage Error (MAPE). Displays peak overcrowding alerts before queues build.
              </p>
              <Link
                href="/forecast"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Explore Forecast Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">
                Authority Command Center
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Enables municipal officials to acknowledge capacity alerts, log incident notes, adjust surge thresholds, and download official CSV reports.
              </p>
              <Link
                href="/authority"
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Open Authority Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Explore Without the Queues?
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              Find serene alternatives, plan your visit during calm hours, and make travel relaxing again.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/recommendations"
                className="px-6 py-3 bg-white text-teal-900 rounded-xl text-sm font-bold shadow hover:bg-teal-50 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>Find My Next Destination</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-teal-900/60 hover:bg-teal-900 text-white border border-teal-400/30 rounded-xl text-sm font-semibold transition-colors"
              >
                <span>Explore Live Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
