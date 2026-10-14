import { CrowdObservation, Destination, CrowdLevel, MeasurementType, DataQualityStatus } from '@/types';
import { calculateOccupancy, getCrowdLevel } from '@/lib/utils';
import { computeRealtimeCrowd } from '@/lib/engines/realtime-crowd-service';

export interface ICrowdDataProvider {
  name: string;
  isAuthorizedLive: boolean;
  fetchCrowdObservation(destination: Destination): Promise<CrowdObservation | null>;
}

/**
 * 1. Government Tourism Feed Connector
 * Connects to authorized state/municipal tourism department feeds when credentials exist.
 */
export class GovernmentTourismFeedConnector implements ICrowdDataProvider {
  public name = 'Government Tourism & Endowments Live Feed';
  public isAuthorizedLive = true;

  async fetchCrowdObservation(destination: Destination): Promise<CrowdObservation | null> {
    const apiUrl = process.env.GOV_TOURISM_API_URL;
    const apiKey = process.env.GOV_TOURISM_API_KEY;

    if (!apiUrl || !apiKey) {
      // Not configured in environment
      return null;
    }

    try {
      const response = await fetch(`${apiUrl}/destinations/${destination.id}/headcount`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'X-Provider-Client': 'CrowdWise-AI-Agent',
        },
        next: { revalidate: 30 },
      });

      if (!response.ok) return null;

      const data = await response.json();
      const count = Number(data.activeVisitors);
      const capacity = Number(data.verifiedCapacity) || destination.capacity;
      const occupancy = calculateOccupancy(count, capacity);

      return {
        destinationId: destination.id,
        measurementType: 'MEASURED',
        dataQuality: 'VERIFIED_LIVE',
        providerName: this.name,
        isLiveVerified: true,
        visitorCount: count,
        capacity: capacity,
        occupancyPercentage: occupancy,
        crowdLevel: getCrowdLevel(occupancy),
        observationTimestamp: data.timestamp || new Date().toISOString(),
        freshnessSeconds: Math.round((Date.now() - new Date(data.timestamp || Date.now()).getTime()) / 1000),
        methodologyNotes: 'Direct API telemetry from authorized Municipal Tourism Portal turnstiles.',
        limitations: [],
      };
    } catch {
      return null;
    }
  }
}

/**
 * 2. Venue Turnstile / IoT Counter Connector
 * Connects to approved venue physical sensors or automated gate counters.
 */
export class VenueCounterConnector implements ICrowdDataProvider {
  public name = 'Authorized Venue IoT Gate Counter';
  public isAuthorizedLive = true;

  async fetchCrowdObservation(destination: Destination): Promise<CrowdObservation | null> {
    const apiKey = process.env.VENUE_COUNTER_API_KEY;
    const endpoint = process.env.VENUE_COUNTER_ENDPOINT;

    if (!apiKey || !endpoint) {
      return null;
    }

    try {
      const response = await fetch(`${endpoint}?siteId=${destination.id}`, {
        headers: { 'X-Sensor-Key': apiKey },
      });
      if (!response.ok) return null;
      const data = await response.json();

      const count = Number(data.inCount) - Number(data.outCount);
      const capacity = destination.capacity;
      const occupancy = calculateOccupancy(count, capacity);

      return {
        destinationId: destination.id,
        measurementType: 'MEASURED',
        dataQuality: 'VERIFIED_LIVE',
        providerName: this.name,
        isLiveVerified: true,
        visitorCount: Math.max(0, count),
        capacity: capacity,
        occupancyPercentage: occupancy,
        crowdLevel: getCrowdLevel(occupancy),
        observationTimestamp: new Date().toISOString(),
        freshnessSeconds: 15,
        methodologyNotes: 'Aggregated net in/out count from authorized optical turnstile barrier sensors.',
        limitations: [],
      };
    } catch {
      return null;
    }
  }
}

/**
 * 3. Synthetic Diurnal Estimator
 * Transparent fallback module: explicitly marks observations as ESTIMATED.
 * Never claims to be verified live measurements.
 */
export class SyntheticDiurnalEstimator implements ICrowdDataProvider {
  public name = 'CrowdWise Diurnal Estimator (Calculated)';
  public isAuthorizedLive = false;

  async fetchCrowdObservation(destination: Destination): Promise<CrowdObservation> {
    const realtime = computeRealtimeCrowd(destination, new Date());

    return {
      destinationId: destination.id,
      measurementType: 'ESTIMATED',
      dataQuality: 'CALCULATED_ESTIMATE',
      providerName: this.name,
      isLiveVerified: false,
      visitorCount: realtime.currentVisitors,
      capacity: destination.capacity,
      occupancyPercentage: realtime.occupancyPercentage,
      crowdLevel: getCrowdLevel(realtime.occupancyPercentage),
      observationTimestamp: new Date().toISOString(),
      freshnessSeconds: 0,
      methodologyNotes:
        'Calculated based on time-of-day diurnal curve, day-of-week multipliers, and regional baseline tourist patterns.',
      limitations: [
        'No active authorized IoT sensor is currently connected for this venue.',
        'Sudden unannounced event crowds or VIP visits may cause deviation from calculation.',
        'Calculated figures should be used as guidance, not certified real-time headcount.',
      ],
    };
  }
}

/**
 * Crowd Data Orchestrator
 * Checks authorized live providers first, falling back transparently to estimation.
 */
class CrowdManager {
  private liveProviders: ICrowdDataProvider[] = [
    new GovernmentTourismFeedConnector(),
    new VenueCounterConnector(),
  ];
  private fallbackEstimator = new SyntheticDiurnalEstimator();

  // In-memory observation cache with 30-second TTL
  private cache = new Map<string, { observation: CrowdObservation; expiresAt: number }>();

  async getObservation(destination: Destination): Promise<CrowdObservation> {
    const cached = this.cache.get(destination.id);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.observation;
    }

    // Try live connectors
    for (const provider of this.liveProviders) {
      try {
        const live = await provider.fetchCrowdObservation(destination);
        if (live) {
          this.cache.set(destination.id, { observation: live, expiresAt: Date.now() + 30000 });
          return live;
        }
      } catch {
        // Continue to next provider
      }
    }

    // Transparently fall back to calculated estimate
    const estimated = await this.fallbackEstimator.fetchCrowdObservation(destination);
    this.cache.set(destination.id, { observation: estimated, expiresAt: Date.now() + 20000 });
    return estimated;
  }
}

export const crowdManager = new CrowdManager();
