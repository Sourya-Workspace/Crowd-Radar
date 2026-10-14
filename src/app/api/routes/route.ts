import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routesService } from '@/lib/services/routes-service';

export const dynamic = 'force-dynamic';

const routeRequestSchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
    label: z.string().optional(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    label: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = routeRequestSchema.parse(body);

    const routeInfo = await routesService.computeRoute(validated.origin, validated.destination);

    return NextResponse.json({
      success: true,
      data: routeInfo,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid route coordinates', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
