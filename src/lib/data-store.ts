import {
  Destination,
  ParkingFacility,
  CrowdAlert,
  AuthoritySettings,
} from '@/types';
import {
  INITIAL_DESTINATIONS,
  INITIAL_PARKING_FACILITIES,
  INITIAL_ALERTS,
} from '@/lib/data/destinations-data';
import { calculateOccupancy, getCrowdLevel } from '@/lib/utils';
import { computeRealtimeCrowd } from '@/lib/engines/realtime-crowd-service';

class DataStore {
  private destinations: Destination[] = [...INITIAL_DESTINATIONS];
  private parkingFacilities: ParkingFacility[] = [...INITIAL_PARKING_FACILITIES];
  private alerts: CrowdAlert[] = [...INITIAL_ALERTS];
  private authoritySettings: AuthoritySettings = {
    capacityWarningThreshold: 75,
    capacityCriticalThreshold: 85,
    autoAlertsEnabled: true,
    alertRecipients: 'control.room@tourism.gov.in, dist.collector@gov.in',
    authorityDepartment: 'Integrated Smart Tourism & Traffic Command Centre',
    lastUpdated: new Date().toISOString(),
  };

  constructor() {
    this.refreshRealtimeTelemetry();
  }

  public refreshRealtimeTelemetry(): void {
    const now = new Date();
    this.destinations = this.destinations.map((d) => {
      const live = computeRealtimeCrowd(d, now);
      return {
        ...d,
        currentVisitors: live.currentVisitors,
        cumulativeVisitorsToday: live.cumulativeVisitorsToday,
        inflowRatePerMinute: live.inflowRatePerMinute,
        outflowRatePerMinute: live.outflowRatePerMinute,
        occupancyPercentage: live.occupancyPercentage,
        crowdLevel: getCrowdLevel(live.occupancyPercentage),
        waitTimeMinutes: live.waitTimeMinutes,
        darshanQueues: live.darshanQueues,
        gateStatuses: live.gateStatuses,
        lastUpdated: now.toISOString(),
      };
    });
  }

  public getDestinations(): Destination[] {
    this.refreshRealtimeTelemetry();
    return this.destinations;
  }

  public getDestinationById(id: string): Destination | undefined {
    this.refreshRealtimeTelemetry();
    return this.destinations.find(
      (d) => d.id === id || d.slug === id
    );
  }

  public getParkingFacilities(): ParkingFacility[] {
    return this.parkingFacilities;
  }

  public getParkingByDestination(destinationId: string): ParkingFacility[] {
    return this.parkingFacilities.filter((p) => p.destinationId === destinationId);
  }

  public getAlerts(): CrowdAlert[] {
    return [...this.alerts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public acknowledgeAlert(alertId: string, officerName: string): CrowdAlert | null {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return null;

    alert.status = 'investigating';
    alert.acknowledgedBy = officerName || 'Duty Tourism Officer';
    alert.acknowledgedAt = new Date().toISOString();
    return alert;
  }

  public updateAlertStatus(
    alertId: string,
    status: 'active' | 'investigating' | 'resolved',
    incidentNotes?: string
  ): CrowdAlert | null {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return null;

    alert.status = status;
    if (incidentNotes !== undefined) {
      alert.incidentNotes = incidentNotes;
    }
    return alert;
  }

  public getAuthoritySettings(): AuthoritySettings {
    return this.authoritySettings;
  }

  public updateAuthoritySettings(settings: Partial<AuthoritySettings>): AuthoritySettings {
    this.authoritySettings = {
      ...this.authoritySettings,
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    return this.authoritySettings;
  }

  public exportAlertsCSV(): string {
    const headers = [
      'Alert ID',
      'Destination',
      'Severity',
      'Status',
      'Occupancy %',
      'Timestamp',
      'Acknowledged By',
      'Incident Notes',
    ];
    const rows = this.alerts.map((a) => [
      `"${a.id}"`,
      `"${a.destinationName}"`,
      `"${a.severity.toUpperCase()}"`,
      `"${a.status.toUpperCase()}"`,
      `"${a.occupancyPercentage}%"`,
      `"${a.timestamp}"`,
      `"${a.acknowledgedBy || 'Unacknowledged'}"`,
      `"${(a.incidentNotes || a.message || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public triggerLiveSimulation(): void {
    this.refreshRealtimeTelemetry();
  }
}

export const dataStore = new DataStore();
