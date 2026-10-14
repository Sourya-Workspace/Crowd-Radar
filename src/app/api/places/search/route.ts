import { NextRequest, NextResponse } from 'next/server';
import { placesService } from '@/lib/services/places-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const locationBias = lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
    const result = await placesService.searchPlaces(query, locationBias);

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
