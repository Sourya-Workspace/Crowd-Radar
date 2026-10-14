import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data-store';
import { crowdManager } from '@/lib/connectors/crowd-connectors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');

    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: 'destinationId parameter is required' },
        { status: 400 }
      );
    }

    const destination = dataStore.getDestinationById(destinationId);
    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination not found in catalog' },
        { status: 404 }
      );
    }

    const observation = await crowdManager.getObservation(destination);

    return NextResponse.json({
      success: true,
      data: observation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
