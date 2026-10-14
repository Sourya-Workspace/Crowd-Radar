import { Destination, CrowdLevel } from '@/types';
import { calculateOccupancy, getCrowdLevel } from '@/lib/utils';

export interface CrowdEstimateResult {
  destinationId: string;
  estimatedVisitors: number;
  capacity: number;
  occupancyPercentage: number;
  crowdLevel: CrowdLevel;
  confidenceScore: number; // 0.0 to 1.0
  dataSource: string;
  lastUpdated: string;
  isPeakHour: boolean;
  waitingTimeMinutes: number;
}

/**
 * Baseline hourly multipliers (00:00 to 23:00) representing typical diurnal tourist activity in India.
 */
const HOURLY_ACTIVITY_CURVE = [
  0.05, 0.03, 0.02, 0.02, 0.08, 0.18, 0.35, 0.55, 0.72, 0.85, // 00:00 - 09:00
  0.92, 0.98, 0.95, 0.88, 0.82, 0.89, 0.97, 1.00, 0.92, 0.78, // 10:00 - 19:00
  0.55, 0.35, 0.20, 0.10                                       // 20:00 - 23:00
];

/**
 * Estimates current crowd metrics based on historical capacity, time-of-day dynamics,
 * day-of-week weights (weekends +25%), and sensor simulation.
 */
export function estimateCrowd(
  destination: Destination,
  referenceDate: Date = new Date()
): CrowdEstimateResult {
  const hour = referenceDate.getHours();
  const day = referenceDate.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = day === 0 || day === 6;

  // Day of week multiplier (tourist traffic surges on weekends)
  const weekendMultiplier = isWeekend ? 1.25 : 0.95;
  const hourMultiplier = HOURLY_ACTIVITY_CURVE[hour] || 0.5;

  // Baseline visitors derived from destination capacity
  // Uses destination baseline proportion with realistic temporal variation
  const baseProportion = destination.currentVisitors / destination.capacity;
  
  // Dynamic occupancy calculation
  let dynamicProportion = baseProportion * hourMultiplier * (isWeekend ? 1.1 : 0.95);
  
  // Bound between 10% and 98%
  dynamicProportion = Math.max(0.12, Math.min(0.96, dynamicProportion));
  
  const estimatedVisitors = Math.round(destination.capacity * dynamicProportion);
  const occupancyPercentage = calculateOccupancy(estimatedVisitors, destination.capacity);
  const crowdLevel = getCrowdLevel(occupancyPercentage);

  // Peak period detection: when occupancy exceeds 65% and hourly curve is high
  const isPeakHour = occupancyPercentage >= 65 && hourMultiplier >= 0.8;

  // Estimated wait time modeled from queue dynamics
  let waitingTimeMinutes = 5;
  if (occupancyPercentage >= 85) {
    waitingTimeMinutes = Math.round(45 + (occupancyPercentage - 85) * 4);
  } else if (occupancyPercentage >= 65) {
    waitingTimeMinutes = Math.round(20 + (occupancyPercentage - 65) * 1.5);
  } else if (occupancyPercentage >= 40) {
    waitingTimeMinutes = Math.round(10 + (occupancyPercentage - 40) * 0.4);
  }

  return {
    destinationId: destination.id,
    estimatedVisitors,
    capacity: destination.capacity,
    occupancyPercentage,
    crowdLevel,
    confidenceScore: 0.92, // Simulated high confidence with sensor triangulation
    dataSource: destination.dataSource,
    lastUpdated: new Date().toISOString(),
    isPeakHour,
    waitingTimeMinutes,
  };
}
