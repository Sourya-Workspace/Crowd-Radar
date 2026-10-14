import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CrowdLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates safe occupancy percentage bounded between 0% and 100%+
 */
export function calculateOccupancy(visitors: number, capacity: number): number {
  if (!capacity || capacity <= 0) return 0;
  if (!visitors || visitors < 0) return 0;
  return Math.min(Math.round((visitors / capacity) * 100), 100);
}

/**
 * Crowd classification standard:
 * - Low: below 40%
 * - Moderate: 40% to below 65%
 * - High: 65% to below 85%
 * - Very High: 85% and above
 */
export function getCrowdLevel(occupancy: number): CrowdLevel {
  if (occupancy < 40) return 'low';
  if (occupancy < 65) return 'moderate';
  if (occupancy < 85) return 'high';
  return 'very_high';
}

export function getCrowdBadgeInfo(level: CrowdLevel) {
  switch (level) {
    case 'low':
      return {
        label: 'Low Crowd',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        barColor: 'bg-emerald-500',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        description: 'Pleasant visiting conditions with negligible wait times.',
      };
    case 'moderate':
      return {
        label: 'Moderate Crowd',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        barColor: 'bg-amber-500',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        description: 'Normal visitor volume. Moderate wait times at ticket counters.',
      };
    case 'high':
      return {
        label: 'High Crowd',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        barColor: 'bg-orange-500',
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        description: 'Elevated congestion. Parking and entry queues expected.',
      };
    case 'very_high':
    default:
      return {
        label: 'Very High / Critical',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        barColor: 'bg-rose-500',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
        description: 'Destination nearing or exceeding safe capacity. Alternative attractions advised.',
      };
  }
}

/**
 * Great-circle distance between two GPS coordinates in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}
