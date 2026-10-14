import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');

    let facilities = dataStore.getParkingFacilities();

    if (destinationId) {
      facilities = facilities.filter(f => f.destinationId === destinationId);
    }

    const totalSpaces = facilities.reduce((acc, f) => acc + f.totalSpaces, 0);
    const occupiedSpaces = facilities.reduce((acc, f) => acc + f.occupiedSpaces, 0);
    const availableSpaces = facilities.reduce((acc, f) => acc + f.availableSpaces, 0);

    return NextResponse.json({
      success: true,
      count: facilities.length,
      summary: {
        totalSpaces,
        occupiedSpaces,
        availableSpaces,
        overallOccupancyPercentage: Math.round((occupiedSpaces / (totalSpaces || 1)) * 100),
      },
      data: facilities,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
