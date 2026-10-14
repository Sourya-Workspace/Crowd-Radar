import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data-store';
import {
  generateHourlyForecast,
  generateDailyForecast,
  getPredictionEvaluation,
} from '@/lib/engines/prediction-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId') || 'taj-mahal-agra';
    const compareId = searchParams.get('compareId');

    const primaryDest = dataStore.getDestinationById(destinationId);
    if (!primaryDest) {
      return NextResponse.json(
        { success: false, error: 'Primary destination not found' },
        { status: 404 }
      );
    }

    const hourly = generateHourlyForecast(primaryDest);
    const daily = generateDailyForecast(primaryDest);
    const evaluation = getPredictionEvaluation();

    let comparison = null;
    if (compareId) {
      const compareDest = dataStore.getDestinationById(compareId);
      if (compareDest) {
        comparison = {
          destination: compareDest,
          hourly: generateHourlyForecast(compareDest),
          daily: generateDailyForecast(compareDest),
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        destination: primaryDest,
        hourly,
        daily,
        evaluation,
        comparison,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
