'use client';

import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { DestinationCategory, CrowdLevel } from '@/types';

interface DestinationFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedCrowdLevel: string;
  onCrowdLevelChange: (level: string) => void;
  selectedRating: number;
  onRatingChange: (rating: number) => void;
  cities: string[];
  totalResults: number;
  onResetFilters: () => void;
}

const CATEGORIES: (string | DestinationCategory)[] = [
  'All Categories',
  'Temples & Religious',
  'Beaches',
  'Hill Stations',
  'Historical Monuments',
  'Nature & Wildlife',
  'Museums & Cultural',
];

export const DestinationFilter: React.FC<DestinationFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCity,
  onCityChange,
  selectedCrowdLevel,
  onCrowdLevelChange,
  selectedRating,
  onRatingChange,
  cities,
  totalResults,
  onResetFilters,
}) => {
  const hasActiveFilters =
    searchQuery ||
    (selectedCategory && selectedCategory !== 'All Categories') ||
    (selectedCity && selectedCity !== 'All Cities') ||
    (selectedCrowdLevel && selectedCrowdLevel !== 'any') ||
    selectedRating > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Top search & dropdown bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search attractions by name, city, tag or keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-sm placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="All Cities">All Cities &amp; Regions</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Crowd Level Filter */}
        <div className="w-full md:w-44">
          <select
            value={selectedCrowdLevel}
            onChange={(e) => onCrowdLevelChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="any">Any Crowd Level</option>
            <option value="low">🟢 Low Crowd (&lt;40%)</option>
            <option value="moderate">🟡 Moderate (40-64%)</option>
            <option value="high">🟠 High (65-84%)</option>
            <option value="very_high">🔴 Critical (≥85%)</option>
          </select>
        </div>

        {/* Minimum Rating */}
        <div className="w-full md:w-36">
          <select
            value={selectedRating}
            onChange={(e) => onRatingChange(parseFloat(e.target.value))}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-xs font-medium text-slate-700 bg-white"
          >
            <option value={0}>All Ratings</option>
            <option value={4.5}>★ 4.5 &amp; above</option>
            <option value={4.7}>★ 4.7 &amp; above</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat || (cat === 'All Categories' && !selectedCategory);
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat === 'All Categories' ? '' : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Filter Summary & Reset Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <p>
          Showing <span className="font-bold text-slate-800">{totalResults}</span> destinations
        </p>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
