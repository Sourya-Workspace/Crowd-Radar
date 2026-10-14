import { NextRequest, NextResponse } from 'next/server';
import { placesService } from '@/lib/services/places-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!, 10) : 50000;

    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: 'Valid latitude and longitude are required' },
        { status: 400 }
      );
    }

    const result = await placesService.searchNearby(lat, lng, radius);

    return NextResponse.json({
      success: true,
      count: result.results.length,
      data: result.results,
      source: result.source,
      isLiveConnected: result.isLiveConnected,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
