import { PlaceSearchResult, Destination } from '@/types';
import { INITIAL_DESTINATIONS } from '@/lib/data/destinations-data';
import { calculateHaversineDistance } from '@/lib/utils';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class PlacesService {
  private cache = new Map<string, CacheEntry<PlaceSearchResult[]>>();
  private detailCache = new Map<string, CacheEntry<any>>();

  /**
   * Search for tourist attractions using Google Places API (New)
   * Falls back to authentic verified local destination catalog if API key is not configured.
   */
  async searchPlaces(query: string, locationBias?: { lat: number; lng: number }): Promise<{
    results: PlaceSearchResult[];
    source: 'Google Places API (New)' | 'CrowdWise Verified Local Catalog';
    isLiveConnected: boolean;
  }> {
    const trimmed = query.trim().toLowerCase();
    const cacheKey = `search_${trimmed}_${locationBias?.lat || 0}_${locationBias?.lng || 0}`;

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        results: cached.data,
        source: cached.data[0]?.source || 'CrowdWise Verified Local Catalog',
        isLiveConnected: cached.data[0]?.isLiveConnected || false,
      };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.length > 20) {
      try {
        const bodyPayload: any = {
          textQuery: query,
          maxResultCount: 8,
          languageCode: 'en',
        };

        if (locationBias) {
          bodyPayload.locationBias = {
            circle: {
              center: { latitude: locationBias.lat, longitude: locationBias.lng },
              radius: 50000.0, // 50 km bias
            },
          };
        }

        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.photos',
          },
        });

        if (response.ok) {
          const json = await response.json();
          if (json.places && Array.isArray(json.places)) {
            const results: PlaceSearchResult[] = json.places.map((p: any) => ({
              placeId: p.id,
              name: p.displayName?.text || p.name || 'Tourist Attraction',
              formattedAddress: p.formattedAddress || '',
              latitude: p.location?.latitude || 0,
              longitude: p.location?.longitude || 0,
              rating: p.rating,
              userRatingCount: p.userRatingCount,
              types: p.types || [],
              isLiveConnected: true,
              source: 'Google Places API (New)',
            }));

            this.cache.set(cacheKey, { data: results, expiresAt: Date.now() + 300000 }); // 5 min TTL
            return {
              results,
              source: 'Google Places API (New)',
              isLiveConnected: true,
            };
          }
        }
      } catch (err) {
        console.warn('Google Places API call failed, using verified catalog fallback:', err);
      }
    }

    // Fallback search across authentic catalog
    const localMatches = INITIAL_DESTINATIONS.filter((d) => {
      const q = trimmed;
      return (
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        (d.district && d.district.toLowerCase().includes(q)) ||
        d.state.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    const results: PlaceSearchResult[] = (localMatches.length > 0 ? localMatches : INITIAL_DESTINATIONS.slice(0, 6)).map(
      (d) => ({
        placeId: `local-${d.id}`,
        name: d.name,
        formattedAddress: `${d.city}, ${d.district ? d.district + ', ' : ''}${d.state}, India`,
        latitude: d.latitude,
        longitude: d.longitude,
        rating: d.rating,
        userRatingCount: d.reviewsCount,
        category: d.category,
        photoUrl: d.imageUrl,
        isLiveConnected: false,
        source: 'CrowdWise Verified Local Catalog',
      })
    );

    this.cache.set(cacheKey, { data: results, expiresAt: Date.now() + 60000 });
    return {
      results,
      source: 'CrowdWise Verified Local Catalog',
      isLiveConnected: false,
    };
  }

  /**
   * Search nearby attractions given GPS coordinates
   */
  async searchNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number = 50000
  ): Promise<{
    results: PlaceSearchResult[];
    source: 'Google Places API (New)' | 'CrowdWise Verified Local Catalog';
    isLiveConnected: boolean;
  }> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.length > 20) {
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types',
          },
          body: JSON.stringify({
            includedTypes: ['tourist_attraction', 'historical_landmark', 'place_of_worship'],
            maxResultCount: 8,
            locationRestriction: {
              circle: {
                center: { latitude, longitude },
                radius: Math.min(50000, radiusMeters),
              },
            },
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.places && Array.isArray(json.places)) {
            const results: PlaceSearchResult[] = json.places.map((p: any) => ({
              placeId: p.id,
              name: p.displayName?.text || 'Attraction',
              formattedAddress: p.formattedAddress || '',
              latitude: p.location?.latitude || 0,
              longitude: p.location?.longitude || 0,
              rating: p.rating,
              userRatingCount: p.userRatingCount,
              types: p.types || [],
              isLiveConnected: true,
              source: 'Google Places API (New)',
            }));

            return {
              results,
              source: 'Google Places API (New)',
              isLiveConnected: true,
            };
          }
        }
      } catch (err) {
        console.warn('Google Places searchNearby failed, falling back to local distance calculation:', err);
      }
    }

    // Local Haversine proximity fallback
    const nearby = INITIAL_DESTINATIONS.map((d) => ({
      ...d,
      distanceKm: calculateHaversineDistance(latitude, longitude, d.latitude, d.longitude),
    }))
      .filter((d) => d.distanceKm <= radiusMeters / 1000)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 8);

    const results: PlaceSearchResult[] = nearby.map((d) => ({
      placeId: `local-${d.id}`,
      name: d.name,
      formattedAddress: `${d.city}, ${d.state}, India`,
      latitude: d.latitude,
      longitude: d.longitude,
      rating: d.rating,
      userRatingCount: d.reviewsCount,
      category: d.category,
      photoUrl: d.imageUrl,
      isLiveConnected: false,
      source: 'CrowdWise Verified Local Catalog',
    }));

    return {
      results,
      source: 'CrowdWise Verified Local Catalog',
      isLiveConnected: false,
    };
  }
}

export const placesService = new PlacesService();
