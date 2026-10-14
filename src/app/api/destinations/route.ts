import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data-store';
import { CrowdLevel, DestinationCategory } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const category = searchParams.get('category') as DestinationCategory | null;
    const city = searchParams.get('city');
    const crowdLevel = searchParams.get('crowdLevel') as CrowdLevel | null;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : null;

    let destinations = dataStore.getDestinations();

    if (search) {
      destinations = destinations.filter(
        d =>
          d.name.toLowerCase().includes(search) ||
          d.city.toLowerCase().includes(search) ||
          d.state.toLowerCase().includes(search) ||
          d.description.toLowerCase().includes(search) ||
          d.tags.some(t => t.toLowerCase().includes(search))
      );
    }

    if (category && category !== ('All' as any) && category !== ('All Categories' as any)) {
      destinations = destinations.filter(d => d.category === category);
    }

    if (city && city !== 'All Cities') {
      destinations = destinations.filter(d => d.city.toLowerCase() === city.toLowerCase());
    }

    if (crowdLevel && crowdLevel !== ('any' as any)) {
      destinations = destinations.filter(d => d.crowdLevel === crowdLevel);
    }

    if (minRating) {
      destinations = destinations.filter(d => d.rating >= minRating);
    }

    return NextResponse.json({
      success: true,
      count: destinations.length,
      data: destinations,
      meta: {
        lastSimulatedAt: new Date().toISOString(),
        dataSource: 'CrowdWise AI Aggregated Tourism Engine',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
