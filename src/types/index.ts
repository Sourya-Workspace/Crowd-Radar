export type DestinationCategory =
  | 'Temples & Religious'
  | 'Beaches'
  | 'Hill Stations'
  | 'Historical Monuments'
  | 'Nature & Wildlife'
  | 'Museums & Cultural';

export type CrowdLevel = 'low' | 'moderate' | 'high' | 'very_high';

export type MeasurementType = 'MEASURED' | 'ESTIMATED' | 'PREDICTED' | 'UNAVAILABLE';
export type DataQualityStatus = 'VERIFIED_LIVE' | 'CALCULATED_ESTIMATE' | 'STALE' | 'UNAVAILABLE';
export type ParkingDataQuality = 'VERIFIED_LIVE' | 'ESTIMATED' | 'UNKNOWN';

export interface CrowdObservation {
  destinationId: string;
  measurementType: MeasurementType;
  dataQuality: DataQualityStatus;
  providerName: string;
  isLiveVerified: boolean;
  visitorCount: number | null; // null when unavailable!
  capacity: number | null;     // null when unverified!
  occupancyPercentage: number | null;
  crowdLevel: CrowdLevel;
  observationTimestamp: string;
  freshnessSeconds: number;
  methodologyNotes: string;
  limitations: string[];
}

export interface DarshanQueue {
  type: string;
  price: string;
  waitTimeMinutes: number;
  tokensAvailable?: number;
  status: 'open' | 'metered' | 'slots_exhausted';
}

export interface GateStatus {
  gateName: string;
  flowLevel: 'smooth' | 'metered' | 'congested';
  currentInflowPerMinute: number;
  notes: string;
}

export interface Destination {
  id: string;
  placeId?: string; // Google Places ID when connected
  name: string;
  slug: string;
  city: string;
  district?: string;
  state: string;
  region: string;
  latitude: number;
  longitude: number;
  category: DestinationCategory;
  description: string;
  imageUrl: string;
  verifiedPhotoCredit?: string;
  capacity: number;
  currentVisitors: number;
  cumulativeVisitorsToday: number;
  inflowRatePerMinute: number;
  outflowRatePerMinute: number;
  occupancyPercentage: number;
  crowdLevel: CrowdLevel;
  measurementType: MeasurementType;
  dataQuality: DataQualityStatus;
  providerName: string;
  rating: number;
  reviewsCount: number;
  waitTimeMinutes: number;
  nearestParkingName: string;
  nearestParkingAvailable: number;
  nearestParkingCapacity: number;
  parkingDataQuality: ParkingDataQuality;
  dataSource: string;
  lastUpdated: string;
  peakHours: string;
  bestTimeToVisit: string;
  tags: string[];
  entryFee: string;
  openingHours: string;
  darshanQueues?: DarshanQueue[];
  gateStatuses?: GateStatus[];
  isAlternativeTo?: string;
  alternativeReason?: string;
}

export interface ParkingFacility {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  occupancyPercentage: number;
  status: 'available' | 'limited' | 'full';
  dataQuality: ParkingDataQuality;
  providerName: string;
  hourlyRate: string;
  isCovered: boolean;
  hasEvCharging: boolean;
  lastUpdated: string;
  walkingDistanceMinutes: number;
}

export interface RouteInformation {
  origin: { lat: number; lng: number; label?: string };
  destination: { lat: number; lng: number; label?: string };
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  durationInTrafficMinutes: number | null;
  hasTrafficData: boolean;
  trafficCondition: 'low' | 'moderate' | 'heavy' | 'unknown';
  provider: 'Google Routes API' | 'OpenRouteService / OSRM' | 'Kinematic Model (Demo)';
  isLiveTraffic: boolean;
  warnings?: string[];
  steps?: { instruction: string; distance: string; duration: string }[];
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  rating?: number;
  userRatingCount?: number;
  category?: string;
  photoUrl?: string;
  isLiveConnected: boolean;
  source: 'Google Places API (New)' | 'CrowdWise Verified Local Catalog';
}

export interface HourlyForecast {
  hour: number;
  hourLabel: string;
  historicalAverage: number;
  expectedVisitors: number;
  occupancyPercentage: number;
  crowdLevel: CrowdLevel;
  isPeakHour: boolean;
  recommendedToVisit: boolean;
  forecastConfidence: number;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  expectedVisitors: number;
  peakOccupancyPercentage: number;
  overallCrowdLevel: CrowdLevel;
  peakTimeWindow: string;
  bestTimeToVisit: string;
  weatherForecast: string;
  temperatureCelsius: number;
}

export interface CrowdAlert {
  id: string;
  destinationId: string;
  destinationName: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  occupancyPercentage: number;
  recommendedAction: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  incidentNotes?: string;
}

export interface RecommendationRequest {
  startingLocation: string;
  startingLat?: number;
  startingLon?: number;
  preferredCategory?: string;
  maxDistanceKm: number;
  maxCrowdLevel?: string;
  travelDate: string;
  travelTime: string;
  isFamilyFriendly?: boolean;
  budgetPreference?: 'budget' | 'moderate' | 'luxury' | 'any';
}

export interface RecommendationItem {
  destination: Destination;
  distanceKm: number;
  estimatedTravelMinutes: number;
  travelTimeInTrafficMinutes?: number | null;
  hasTrafficData?: boolean;
  matchScore: number;
  whyRecommended: string[];
  bestSuggestedArrival: string;
  crowdDifferenceVsBenchmark?: number;
  isLessCrowded: boolean;
  parkingSummary: string;
  measurementType: MeasurementType;
}

export interface AuthoritySettings {
  capacityWarningThreshold: number;
  capacityCriticalThreshold: number;
  autoAlertsEnabled: boolean;
  alertRecipients: string;
  authorityDepartment: string;
  lastUpdated: string;
}
