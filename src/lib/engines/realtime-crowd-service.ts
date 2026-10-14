import { Destination, DarshanQueue, GateStatus } from '@/types';
import { calculateOccupancy, getCrowdLevel } from '@/lib/utils';

/**
 * Real-Time Footfall Curve across a 24-hour cycle.
 * Represents relative proportion of daily cumulative visitors that arrive up to each hour.
 */
const CUMULATIVE_DAY_CURVE = [
  0.0,  0.0,  0.0,  0.0,  0.03, 0.08, 0.16, 0.26, 0.38, 0.50, // 00:00 - 09:00
  0.60, 0.68, 0.74, 0.79, 0.83, 0.87, 0.92, 0.96, 0.98, 0.99, // 10:00 - 19:00
  1.0,  1.0,  1.0,  1.0                                        // 20:00 - 23:00
];

/**
 * Relative instantaneous occupancy multiplier (visitors inside premises simultaneously).
 */
const INSTANTANEOUS_CURVE = [
  0.02, 0.01, 0.01, 0.02, 0.10, 0.25, 0.42, 0.62, 0.78, 0.88, // 00:00 - 09:00
  0.92, 0.85, 0.72, 0.65, 0.62, 0.70, 0.84, 0.94, 0.90, 0.75, // 10:00 - 19:00
  0.50, 0.30, 0.15, 0.05                                       // 20:00 - 23:00
];

/**
 * Computes live real-time crowd metrics for any destination using the current clock time.
 */
export function computeRealtimeCrowd(
  destination: Destination,
  referenceDate: Date = new Date()
): {
  currentVisitors: number;
  cumulativeVisitorsToday: number;
  inflowRatePerMinute: number;
  outflowRatePerMinute: number;
  occupancyPercentage: number;
  waitTimeMinutes: number;
  darshanQueues: DarshanQueue[];
  gateStatuses: GateStatus[];
} {
  const hour = referenceDate.getHours();
  const minute = referenceDate.getMinutes();
  const day = referenceDate.getDay();
  const isWeekend = day === 0 || day === 6;

  // Weekend multiplier: temples and beaches see 25% - 40% surge
  const surgeFactor = isWeekend ? 1.35 : 1.0;

  // Typical total daily turnover is 2.5x to 3.5x maximum capacity
  const expectedTotalDailyFootfall = Math.round(destination.capacity * 2.8 * surgeFactor);

  // Cumulative visitors visited so far today up to (hour + minute/60)
  const baseCumulativeFactor = CUMULATIVE_DAY_CURVE[hour] || 0.5;
  const nextCumulativeFactor = CUMULATIVE_DAY_CURVE[Math.min(23, hour + 1)] || 1.0;
  const interpolatedCumulativeFactor =
    baseCumulativeFactor + (nextCumulativeFactor - baseCumulativeFactor) * (minute / 60);

  const cumulativeVisitorsToday = Math.round(
    expectedTotalDailyFootfall * Math.min(1.0, Math.max(0.02, interpolatedCumulativeFactor))
  );

  // Instantaneous visitors inside right now
  const baseInstantFactor = INSTANTANEOUS_CURVE[hour] || 0.4;
  const nextInstantFactor = INSTANTANEOUS_CURVE[Math.min(23, hour + 1)] || 0.3;
  const interpolatedInstantFactor =
    baseInstantFactor + (nextInstantFactor - baseInstantFactor) * (minute / 60);

  // Add small natural dynamic flutter (+/- 2%)
  const flutter = ((minute % 7) - 3) * 0.005;
  const effectiveFactor = Math.max(0.08, Math.min(0.96, interpolatedInstantFactor * surgeFactor * 0.75 + flutter));

  const currentVisitors = Math.min(
    destination.capacity,
    Math.max(Math.round(destination.capacity * 0.05), Math.round(destination.capacity * effectiveFactor))
  );

  const occupancyPercentage = calculateOccupancy(currentVisitors, destination.capacity);

  // Real-time Inflow and Outflow rates (persons per minute)
  const baseInflow = Math.round((destination.capacity * effectiveFactor * 0.08) / 60) + 12;
  const inflowRatePerMinute = Math.max(8, Math.round(baseInflow * (effectiveFactor > 0.6 ? 1.2 : 0.9)));
  const outflowRatePerMinute = Math.max(6, Math.round(inflowRatePerMinute * (effectiveFactor > 0.7 ? 0.88 : 1.05)));

  // Dynamic wait time
  let waitTimeMinutes = 10;
  if (occupancyPercentage >= 85) {
    waitTimeMinutes = Math.round(60 + (occupancyPercentage - 85) * 5);
  } else if (occupancyPercentage >= 65) {
    waitTimeMinutes = Math.round(30 + (occupancyPercentage - 65) * 1.5);
  } else if (occupancyPercentage >= 40) {
    waitTimeMinutes = Math.round(15 + (occupancyPercentage - 40) * 0.6);
  }

  // Darshan queue breakdowns (especially for temples like Vijayawada, Tirupati, Srisailam, Arunachalam)
  const isReligious = destination.category === 'Temples & Religious';
  let darshanQueues: DarshanQueue[] = [];

  if (isReligious) {
    darshanQueues = [
      {
        type: 'Free Sarva Darshan (General Queue)',
        price: 'Free',
        waitTimeMinutes: waitTimeMinutes,
        status: occupancyPercentage >= 85 ? 'metered' : 'open',
      },
      {
        type: 'Special Entry Darshan (₹100 / ₹300)',
        price: '₹100 / ₹300',
        waitTimeMinutes: Math.max(10, Math.round(waitTimeMinutes * 0.35)),
        tokensAvailable: Math.max(50, 800 - Math.round(currentVisitors * 0.04)),
        status: 'open',
      },
      {
        type: 'VIP / Antaralaya Darshan (Designated Break)',
        price: '₹500 / Protocol',
        waitTimeMinutes: Math.max(5, Math.round(waitTimeMinutes * 0.15)),
        status: 'open',
      },
    ];
  } else {
    darshanQueues = [
      {
        type: 'General Public Entry',
        price: destination.entryFee || 'Free',
        waitTimeMinutes: waitTimeMinutes,
        status: 'open',
      },
      {
        type: 'Online Fast-Track E-Ticket Queue',
        price: 'Priority',
        waitTimeMinutes: Math.max(5, Math.round(waitTimeMinutes * 0.3)),
        status: 'open',
      },
    ];
  }

  // Gate Telemetry Statuses
  const gateStatuses: GateStatus[] = [
    {
      gateName: 'North Gate / Main Entrance',
      flowLevel: occupancyPercentage >= 80 ? 'congested' : occupancyPercentage >= 55 ? 'metered' : 'smooth',
      currentInflowPerMinute: Math.round(inflowRatePerMinute * 0.55),
      notes: occupancyPercentage >= 80 ? 'Heavy pedestrian queue; 3 lanes open' : 'Normal throughput',
    },
    {
      gateName: 'Ghat Road / Parking Access Gate',
      flowLevel: occupancyPercentage >= 75 ? 'metered' : 'smooth',
      currentInflowPerMinute: Math.round(inflowRatePerMinute * 0.3),
      notes: 'Vehicle queue managed; shuttle buses operating smoothly',
    },
    {
      gateName: 'VIP & Senior Citizen Lift Gate',
      flowLevel: 'smooth',
      currentInflowPerMinute: Math.round(inflowRatePerMinute * 0.15),
      notes: 'Wheelchair assistance available',
    },
  ];

  return {
    currentVisitors,
    cumulativeVisitorsToday,
    inflowRatePerMinute,
    outflowRatePerMinute,
    occupancyPercentage,
    waitTimeMinutes,
    darshanQueues,
    gateStatuses,
  };
}
