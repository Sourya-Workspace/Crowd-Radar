import React from 'react';
import Link from 'next/link';
import { Destination } from '@/types';
import { CrowdBadge } from '@/ui/CrowdBadge';
import { Users, Clock, Car, Star, Sparkles, ArrowRight, Activity } from 'lucide-react';
import { getCrowdBadgeInfo } from '@/lib/utils';

interface DestinationCardProps {
  destination: Destination;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  const badgeInfo = getCrowdBadgeInfo(destination.crowdLevel);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Photograph with badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-lg shadow-sm">
            {destination.category}
          </span>
          <CrowdBadge level={destination.crowdLevel} percentage={destination.occupancyPercentage} size="sm" />
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-medium drop-shadow-sm truncate max-w-[200px]">
            {destination.city}, {destination.state}
          </span>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md font-semibold text-amber-300 flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{destination.rating}</span>
            <span className="text-white/70 text-[10px]">({(destination.reviewsCount / 1000).toFixed(0)}k)</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
            {destination.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {destination.description}
          </p>

          {/* Real-time Footfall Highlights */}
          {destination.cumulativeVisitorsToday > 0 && (
            <div className="mt-3 px-2.5 py-1.5 bg-teal-50/70 border border-teal-100 rounded-lg flex items-center justify-between text-[11px] text-teal-800 font-semibold">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                Visited today so far:
              </span>
              <span className="font-bold">{destination.cumulativeVisitorsToday.toLocaleString()} devotees</span>
            </div>
          )}

          {/* Occupancy Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Current Crowd Inside
              </span>
              <span className="font-bold text-slate-900">
                {destination.occupancyPercentage}% ({destination.currentVisitors.toLocaleString()})
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${badgeInfo.barColor}`}
                style={{ width: `${destination.occupancyPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Gate flow: {destination.inflowRatePerMinute || 24}/min</span>
              <span>Safe Cap: {destination.capacity.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Wait Time</p>
                <p className="font-bold text-slate-800">~{destination.waitTimeMinutes} mins</p>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Parking</p>
                <p className={`font-bold truncate ${destination.nearestParkingAvailable > 50 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {destination.nearestParkingAvailable} spots free
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
          <Link
            href={`/destinations/${destination.id}`}
            className="flex-1 text-center py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Live Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/recommendations?benchmark=${destination.id}&city=${encodeURIComponent(destination.city)}`}
            className="py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors flex items-center gap-1"
            title="Find less crowded alternative attractions nearby"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Alternatives</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
