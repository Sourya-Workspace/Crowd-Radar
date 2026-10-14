import { Destination, RecommendationRequest, RecommendationItem, CrowdLevel } from '@/types';
import { calculateHaversineDistance } from '@/lib/utils';

// Comprehensive Indian city coordinates for search and geo-proximity matching
export const CITY_COORDINATES: Record<string, { lat: number; lon: number; state: string }> = {
  // Andhra Pradesh Cities & Towns (Requested by user)
  'Vijayawada': { lat: 16.5062, lon: 80.6480, state: 'Andhra Pradesh' },
  'Guntur': { lat: 16.3067, lon: 80.4365, state: 'Andhra Pradesh' },
  'Chilakaluripet': { lat: 16.0892, lon: 80.1672, state: 'Andhra Pradesh' },
  'Bapatla': { lat: 15.9042, lon: 80.4674, state: 'Andhra Pradesh' },
  'Ongole': { lat: 15.5057, lon: 80.0499, state: 'Andhra Pradesh' },
  'Nellore': { lat: 14.4426, lon: 79.9865, state: 'Andhra Pradesh' },
  'Tirupati': { lat: 13.6288, lon: 79.4192, state: 'Andhra Pradesh' },
  'Visakhapatnam': { lat: 17.6868, lon: 83.2185, state: 'Andhra Pradesh' },
  'Araku': { lat: 18.3333, lon: 82.8667, state: 'Andhra Pradesh' },
  'Srisailam': { lat: 16.0741, lon: 78.8682, state: 'Andhra Pradesh' },
  'Kakinada': { lat: 16.9891, lon: 82.2475, state: 'Andhra Pradesh' },
  'Rajahmundry': { lat: 17.0005, lon: 81.8040, state: 'Andhra Pradesh' },
  'Kurnool': { lat: 15.8281, lon: 78.0373, state: 'Andhra Pradesh' },
  'Kadapa': { lat: 14.4673, lon: 78.8242, state: 'Andhra Pradesh' },
  'Anantapur': { lat: 14.6819, lon: 77.6006, state: 'Andhra Pradesh' },
  'Eluru': { lat: 16.7107, lon: 81.0952, state: 'Andhra Pradesh' },
  'Machilipatnam': { lat: 16.1875, lon: 81.1389, state: 'Andhra Pradesh' },
  'Tenali': { lat: 16.2437, lon: 80.6400, state: 'Andhra Pradesh' },
  'Chirala': { lat: 15.8246, lon: 80.3522, state: 'Andhra Pradesh' },
  'Narasaraopet': { lat: 16.2359, lon: 80.0495, state: 'Andhra Pradesh' },

  // Tamil Nadu (Requested: Ooty, Kodaikanal, Arunachalam, etc.)
  'Ooty': { lat: 11.4168, lon: 76.7118, state: 'Tamil Nadu' },
  'Kodaikanal': { lat: 10.2381, lon: 77.4892, state: 'Tamil Nadu' },
  'Tiruvannamalai (Arunachalam)': { lat: 12.2319, lon: 79.0677, state: 'Tamil Nadu' },
  'Chennai': { lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  'Madurai': { lat: 9.9252, lon: 78.1198, state: 'Tamil Nadu' },
  'Coimbatore': { lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu' },
  'Rameshwaram': { lat: 9.2876, lon: 79.3129, state: 'Tamil Nadu' },
  'Kanyakumari': { lat: 8.0883, lon: 77.5385, state: 'Tamil Nadu' },

  // Telangana
  'Hyderabad': { lat: 17.3850, lon: 78.4867, state: 'Telangana' },
  'Warangal': { lat: 17.9689, lon: 79.5941, state: 'Telangana' },

  // Karnataka
  'Bengaluru': { lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  'Mysuru': { lat: 12.2958, lon: 76.6394, state: 'Karnataka' },
  'Hampi': { lat: 15.3350, lon: 76.4600, state: 'Karnataka' },
  'Coorg': { lat: 12.4244, lon: 75.7382, state: 'Karnataka' },

  // Kerala
  'Munnar': { lat: 10.0889, lon: 77.0595, state: 'Kerala' },
  'Kochi': { lat: 9.9312, lon: 76.2673, state: 'Kerala' },
  'Wayanad': { lat: 11.6854, lon: 76.1320, state: 'Kerala' },

  // Goa
  'Goa (Calangute)': { lat: 15.5439, lon: 73.7553, state: 'Goa' },
  'Goa (Palolem)': { lat: 15.0100, lon: 74.0232, state: 'Goa' },

  // North, Central & West India
  'Agra': { lat: 27.1767, lon: 78.0081, state: 'Uttar Pradesh' },
  'Varanasi': { lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh' },
  'Jaipur': { lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  'Udaipur': { lat: 24.5854, lon: 73.7125, state: 'Rajasthan' },
  'Rishikesh': { lat: 30.0869, lon: 78.2676, state: 'Uttarakhand' },
  'Manali': { lat: 32.2432, lon: 77.1892, state: 'Himachal Pradesh' },
  'Shimla': { lat: 31.1048, lon: 77.1734, state: 'Himachal Pradesh' },
  'Amritsar': { lat: 31.6340, lon: 74.8723, state: 'Punjab' },
  'Delhi': { lat: 28.6139, lon: 77.2090, state: 'Delhi' },
  'Mumbai': { lat: 19.0760, lon: 72.8777, state: 'Maharashtra' },
  'Pune': { lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  'Kolkata': { lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
};

export function getRankedRecommendations(
  destinations: Destination[],
  request: RecommendationRequest,
  benchmarkDestinationId?: string
): RecommendationItem[] {
  // Resolve user starting coordinates
  let startLat = request.startingLat;
  let startLon = request.startingLon;

  if (startLat === undefined || startLon === undefined) {
    const matchedCityKey = Object.keys(CITY_COORDINATES).find(
      (c) =>
        request.startingLocation.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(request.startingLocation.toLowerCase())
    );
    if (matchedCityKey) {
      startLat = CITY_COORDINATES[matchedCityKey].lat;
      startLon = CITY_COORDINATES[matchedCityKey].lon;
    } else {
      // Default to Vijayawada / central AP coordinates
      startLat = 16.5062;
      startLon = 80.6480;
    }
  }

  const benchmark = benchmarkDestinationId
    ? destinations.find((d) => d.id === benchmarkDestinationId)
    : undefined;

  const results: RecommendationItem[] = [];

  for (const dest of destinations) {
    // 1. Exclude the original destination if specified
    if (benchmarkDestinationId && dest.id === benchmarkDestinationId) {
      continue;
    }

    // 2. Calculate distance
    const distKm = calculateHaversineDistance(startLat, startLon, dest.latitude, dest.longitude);

    // Filter by max distance
    if (request.maxDistanceKm > 0 && distKm > request.maxDistanceKm) {
      continue;
    }

    // Filter by category
    if (
      request.preferredCategory &&
      request.preferredCategory !== 'All' &&
      request.preferredCategory !== 'All Categories' &&
      dest.category !== request.preferredCategory
    ) {
      continue;
    }

    // Filter by maximum acceptable crowd level
    if (request.maxCrowdLevel && request.maxCrowdLevel !== 'any') {
      const levelRank: Record<CrowdLevel, number> = {
        low: 1,
        moderate: 2,
        high: 3,
        very_high: 4,
      };
      const reqRank = levelRank[request.maxCrowdLevel as CrowdLevel] || 4;
      const destRank = levelRank[dest.crowdLevel];
      if (destRank > reqRank) {
        continue;
      }
    }

    // Multi-factor explainable score: (0 to 100)
    // A. Crowd Score (Weight: 45%) - lower crowd = higher score
    const crowdScore = Math.max(0, 100 - dest.occupancyPercentage);

    // B. Distance Score (Weight: 25%)
    const maxDist = request.maxDistanceKm || 200;
    const distanceScore = Math.max(0, 100 - (distKm / maxDist) * 100);

    // C. Rating Score (Weight: 15%)
    const ratingScore = Math.max(0, ((dest.rating - 3.5) / 1.5) * 100);

    // D. Parking Availability Score (Weight: 15%)
    const parkingScore =
      dest.nearestParkingCapacity > 0
        ? Math.min(100, (dest.nearestParkingAvailable / dest.nearestParkingCapacity) * 100 * 2)
        : 50;

    const matchScore = Math.round(
      crowdScore * 0.45 + distanceScore * 0.25 + ratingScore * 0.15 + parkingScore * 0.15
    );

    // Compute crowd difference vs benchmark
    let crowdDifferenceVsBenchmark: number | undefined = undefined;
    let isLessCrowded = false;

    if (benchmark) {
      crowdDifferenceVsBenchmark = dest.occupancyPercentage - benchmark.occupancyPercentage;
      isLessCrowded = crowdDifferenceVsBenchmark < 0;
    } else {
      isLessCrowded = dest.occupancyPercentage < 65;
    }

    // Estimated travel time in minutes (assuming 50 km/h average)
    const estimatedTravelMinutes = Math.round((distKm / 50) * 60 + 10);

    // Build explainable reasons
    const whyRecommended: string[] = [];

    if (benchmark && crowdDifferenceVsBenchmark !== undefined && crowdDifferenceVsBenchmark < 0) {
      whyRecommended.push(
        `${Math.abs(crowdDifferenceVsBenchmark)}% lower crowd density compared to ${benchmark.name}.`
      );
    } else if (dest.crowdLevel === 'low') {
      whyRecommended.push(`Currently peaceful with only ${dest.occupancyPercentage}% safe capacity occupied.`);
    } else if (dest.crowdLevel === 'moderate') {
      whyRecommended.push(`Comfortable visitor flow with short ~${dest.waitTimeMinutes}m waiting time.`);
    }

    if (distKm <= 35) {
      whyRecommended.push(`Short travel distance: only ${distKm} km away (~${estimatedTravelMinutes} mins drive).`);
    } else {
      whyRecommended.push(`Within your requested travel radius (${distKm} km from starting point).`);
    }

    if (dest.nearestParkingAvailable > 100) {
      whyRecommended.push(`Ample parking: ~${dest.nearestParkingAvailable} available bays at ${dest.nearestParkingName}.`);
    } else if (dest.nearestParkingAvailable > 20) {
      whyRecommended.push(`Parking available at ${dest.nearestParkingName} (${dest.nearestParkingAvailable} bays free).`);
    }

    if (dest.cumulativeVisitorsToday > 0) {
      whyRecommended.push(`Real-time telemetry: ${dest.cumulativeVisitorsToday.toLocaleString()} devotees visited today.`);
    }

    results.push({
      destination: dest,
      distanceKm: distKm,
      estimatedTravelMinutes,
      matchScore,
      whyRecommended,
      bestSuggestedArrival: dest.bestTimeToVisit,
      crowdDifferenceVsBenchmark,
      isLessCrowded,
      parkingSummary: `${dest.nearestParkingAvailable} free spots at ${dest.nearestParkingName}`,
      measurementType: dest.measurementType || 'ESTIMATED',
    });
  }

  // Rank by matchScore descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}
