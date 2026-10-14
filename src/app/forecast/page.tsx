'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Filter,
  ShieldCheck,
  CloudSun,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';
import { INITIAL_DESTINATIONS } from '@/lib/data/destinations-data';
import {
  generateHourlyForecast,
  generateDailyForecast,
  getPredictionEvaluation,
} from '@/lib/engines/prediction-engine';
import { HourlyTrendChart } from '@/components/charts/HourlyTrendChart';
import { ComparisonChart } from '@/components/charts/ComparisonChart';
import { CrowdBadge } from '@/ui/CrowdBadge';
import Link from 'next/link';

export default function ForecastPage() {
  const [selectedDestinationId, setSelectedDestinationId] = useState('taj-mahal-agra');
  const [compareDestinationId, setCompareDestinationId] = useState('mehtab-bagh-agra');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const selectedDestination =
    INITIAL_DESTINATIONS.find((d) => d.id === selectedDestinationId) || INITIAL_DESTINATIONS[0];
  const compareDestination =
    INITIAL_DESTINATIONS.find((d) => d.id === compareDestinationId) || INITIAL_DESTINATIONS[1];

  const hourlyData = generateHourlyForecast(selectedDestination, new Date(selectedDate));
  const dailyData = generateDailyForecast(selectedDestination, new Date(selectedDate));
  const evaluation = getPredictionEvaluation();

  // Peak overcrowding hours
  const peakHours = hourlyData.filter((h) => h.isPeakHour);
  const calmHours = hourlyData.filter((h) => h.recommendedToVisit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Diurnal Predictive Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Crowd Forecast &amp; Peak Period Predictor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Projected visitor volumes using weighted time-of-week diurnal footfall baselines and moving-average queue curves.
          </p>
        </div>

        {/* Model Evaluation pill */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Evaluated Accuracy</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                {evaluation.confidencePercentage}% Confidence
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              MAPE: {evaluation.meanAbsolutePercentageError}% across {evaluation.historicalSampleSize} sample records
            </p>
          </div>
        </div>
      </div>

      {/* Selector Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Select Destination
            </label>
            <select
              value={selectedDestinationId}
              onChange={(e) => setSelectedDestinationId(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
            >
              {INITIAL_DESTINATIONS.map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.name} ({dest.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Forecast Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Compare With Alternative
          </label>
          <select
            value={compareDestinationId}
            onChange={(e) => setCompareDestinationId(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white w-full"
          >
            {INITIAL_DESTINATIONS.filter((d) => d.id !== selectedDestinationId).map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.name} ({dest.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Peak Warnings & Best Windows Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Peak Overcrowding Alert */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Projected Overcrowding Windows</span>
            </h3>
            <span className="text-[10px] font-bold uppercase bg-rose-200/80 text-rose-800 px-2 py-0.5 rounded-full">
              High Traffic Risk
            </span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            Based on historical visitor surges, crowd occupancy is projected to exceed{' '}
            <strong>65% safe capacity</strong> during the following intervals:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {peakHours.length > 0 ? (
              peakHours.map((h) => (
                <span
                  key={h.hour}
                  className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg text-xs font-bold shadow-sm"
                >
                  {h.hourLabel} ({h.occupancyPercentage}%)
                </span>
              ))
            ) : (
              <span className="text-xs text-rose-700">No critical peaks projected for this date.</span>
            )}
          </div>
        </div>

        {/* Recommended Low-Crowd Slots */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Visiting Windows</span>
            </h3>
            <span className="text-[10px] font-bold uppercase bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded-full">
              Optimal Experience
            </span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Enjoy minimal queue delays and pleasant access during these daylight visiting slots:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {calmHours.length > 0 ? (
              calmHours.map((h) => (
                <span
                  key={h.hour}
                  className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold shadow-sm"
                >
                  {h.hourLabel} ({h.occupancyPercentage}%)
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-700">Early morning entry before 07:30 AM recommended.</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Hourly Chart */}
      <div>
        <HourlyTrendChart
          hourlyData={hourlyData}
          capacity={selectedDestination.capacity}
          destinationName={selectedDestination.name}
        />
      </div>

      {/* Destination Comparison Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComparisonChart destA={selectedDestination} destB={compareDestination} />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Comparison Takeaway</h4>
            <p className="text-xs text-slate-500 mt-1">
              Comparing footfall dynamics between your chosen sites
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-semibold text-slate-800">{selectedDestination.name}</p>
                <p className="text-slate-500 mt-0.5">
                  Occupancy: <strong>{selectedDestination.occupancyPercentage}%</strong> • Wait: ~{selectedDestination.waitTimeMinutes}m
                </p>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
                <p className="font-semibold text-teal-900">{compareDestination.name}</p>
                <p className="text-teal-700 mt-0.5">
                  Occupancy: <strong>{compareDestination.occupancyPercentage}%</strong> • Wait: ~{compareDestination.waitTimeMinutes}m
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/destinations/${compareDestination.id}`}
            className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold text-center transition-colors block"
          >
            Explore {compareDestination.name}
          </Link>
        </div>
      </div>

      {/* 7-Day Outlook */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">7-Day Visitor Outlook</h3>
            <p className="text-xs text-slate-500">Day-by-day footfall predictions and weather expectations</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            30-Day Moving Baseline
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {dailyData.map((d) => (
            <div
              key={d.date}
              className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center space-y-2 hover:bg-slate-100/80 transition-colors"
            >
              <p className="text-[11px] font-bold text-slate-500 uppercase">{d.dayOfWeek.slice(0, 3)}</p>
              <p className="text-xs font-semibold text-slate-800">{d.date.split('-').slice(1).join('/')}</p>
              <div className="py-1">
                <CrowdBadge level={d.overallCrowdLevel} percentage={d.peakOccupancyPercentage} size="sm" />
              </div>
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <CloudSun className="w-3 h-3 text-amber-500" />
                {d.temperatureCelsius}°C
              </p>
              <p className="text-[10px] text-teal-700 font-semibold truncate" title={d.bestTimeToVisit}>
                Best: {d.bestTimeToVisit.split('(')[0]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
