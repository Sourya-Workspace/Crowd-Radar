import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data-store';
import { calculateHaversineDistance } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const destinationId = params.id;
    const destination = dataStore.getDestinationById(destinationId);

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }

    const parkingFacilities = dataStore.getParkingByDestination(destination.id);

    // Find nearby alternatives within 150 km
    const allDestinations = dataStore.getDestinations();
    const nearbyAlternatives = allDestinations
      .filter(d => d.id !== destination.id)
      .map(d => {
        const distanceKm = calculateHaversineDistance(
          destination.latitude,
          destination.longitude,
          d.latitude,
          d.longitude
        );
        return {
          ...d,
          distanceKm,
          occupancyDiff: d.occupancyPercentage - destination.occupancyPercentage,
        };
      })
      .filter(d => d.distanceKm <= 180)
      .sort((a, b) => a.occupancyPercentage - b.occupancyPercentage)
      .slice(0, 4);

    return NextResponse.json({
      success: true,
      data: {
        destination,
        parkingFacilities,
        nearbyAlternatives,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
