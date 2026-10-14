import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore } from '@/lib/data-store';
import { getRankedRecommendations } from '@/lib/engines/recommendation-engine';
import { RecommendationRequest } from '@/types';

export const dynamic = 'force-dynamic';

const recommendationSchema = z.object({
  startingLocation: z.string().min(1, 'Starting location is required'),
  startingLat: z.number().optional(),
  startingLon: z.number().optional(),
  preferredCategory: z.string().optional(),
  maxDistanceKm: z.number().min(5).max(1000).default(100),
  maxCrowdLevel: z.string().optional(),
  travelDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  travelTime: z.string().default('10:00 AM'),
  isFamilyFriendly: z.boolean().optional(),
  budgetPreference: z.enum(['budget', 'moderate', 'luxury', 'any']).optional(),
  benchmarkDestinationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = recommendationSchema.parse(body);

    const allDestinations = dataStore.getDestinations();
    const recommendations = getRankedRecommendations(
      allDestinations,
      validated as RecommendationRequest,
      validated.benchmarkDestinationId
    );

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      query: validated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
