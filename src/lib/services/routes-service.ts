import { RouteInformation } from '@/types';
import { calculateHaversineDistance } from '@/lib/utils';

interface LatLng {
  lat: number;
  lng: number;
  label?: string;
}

class RoutesService {
  private cache = new Map<string, { route: RouteInformation; expiresAt: number }>();

  async computeRoute(origin: LatLng, destination: LatLng): Promise<RouteInformation> {
    const cacheKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}->${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.route;
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Try Google Routes API if key is present
    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.length > 20) {
      try {
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'routes.duration,routes.distanceMeters,routes.legs.duration,routes.legs.distanceMeters,routes.legs.steps,routes.warnings',
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: origin.lat,
                  longitude: origin.lng,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: destination.lat,
                  longitude: destination.lng,
                },
              },
            },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
            departureTime: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const route = json.routes?.[0];

          if (route) {
            const distanceMeters = route.distanceMeters || 0;
            const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
            const durationSec = parseInt(route.duration?.replace('s', '') || '0', 10);
            const durationMinutes = Math.round(durationSec / 60);

            // Traffic delay analysis
            const leg = route.legs?.[0];
            const steps = (leg?.steps || []).slice(0, 5).map((s: any) => ({
              instruction: s.navigationInstruction?.maneuver || 'Continue on route',
              distance: `${Math.round((s.distanceMeters || 0) / 100) / 10} km`,
              duration: `${Math.round(parseInt(s.staticDuration?.replace('s', '') || '0', 10) / 60)} mins`,
            }));

            const result: RouteInformation = {
              origin,
              destination,
              distanceMeters,
              distanceKm,
              durationSeconds: durationSec,
              durationMinutes,
              durationInTrafficMinutes: durationMinutes,
              hasTrafficData: true,
              trafficCondition: durationMinutes > 60 ? 'moderate' : 'low',
              provider: 'Google Routes API',
              isLiveTraffic: true,
              steps: steps.length > 0 ? steps : undefined,
              warnings: route.warnings || [],
            };

            this.cache.set(cacheKey, { route: result, expiresAt: Date.now() + 600000 }); // 10 min TTL
            return result;
          }
        }
      } catch (err) {
        console.warn('Google Routes API request failed, falling back to traffic-modeled kinematic routing:', err);
      }
    }

    // Kinematic model fallback (with road tortuosity and diurnal traffic curve)
    const straightDist = calculateHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    // Road factor: Indian highways and ghat roads average ~1.28x straight line
    const roadDistanceKm = Math.round(straightDist * 1.28 * 10) / 10;
    const distanceMeters = Math.round(roadDistanceKm * 1000);

    // Diurnal traffic factor: rush hours (08:30-11:30 and 16:30-20:00) add 25%-35% delay
    const hour = new Date().getHours();
    const isRushHour = (hour >= 8 && hour <= 11) || (hour >= 16 && hour <= 20);
    const avgSpeedKmH = isRushHour ? 40 : 52;

    const baseDurationMinutes = Math.round((roadDistanceKm / 50) * 60);
    const durationInTrafficMinutes = Math.round((roadDistanceKm / avgSpeedKmH) * 60);

    const fallbackRoute: RouteInformation = {
      origin,
      destination,
      distanceMeters,
      distanceKm: roadDistanceKm,
      durationSeconds: durationInTrafficMinutes * 60,
      durationMinutes: baseDurationMinutes,
      durationInTrafficMinutes,
      hasTrafficData: false,
      trafficCondition: isRushHour ? 'moderate' : 'low',
      provider: 'Kinematic Model (Demo)',
      isLiveTraffic: false,
      warnings: [
        'Live Google traffic data unavailable (API key not configured in .env.local). Displaying estimated kinematic travel duration.',
      ],
      steps: [
        {
          instruction: 'Proceed from origin along primary highway/arterial route',
          distance: `${Math.round(roadDistanceKm * 0.4)} km`,
          duration: `${Math.round(durationInTrafficMinutes * 0.35)} mins`,
        },
        {
          instruction: 'Follow state highway towards destination gateway',
          distance: `${Math.round(roadDistanceKm * 0.4)} km`,
          duration: `${Math.round(durationInTrafficMinutes * 0.45)} mins`,
        },
        {
          instruction: 'Arrive at dedicated pilgrim parking facility',
          distance: `${Math.round(roadDistanceKm * 0.2)} km`,
          duration: `${Math.round(durationInTrafficMinutes * 0.2)} mins`,
        },
      ],
    };

    this.cache.set(cacheKey, { route: fallbackRoute, expiresAt: Date.now() + 60000 });
    return fallbackRoute;
  }
}

export const routesService = new RoutesService();
