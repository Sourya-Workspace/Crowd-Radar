import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id;
    const body = await request.json();
    const { action, officerName, status, incidentNotes } = body;

    let updatedAlert = null;

    if (action === 'acknowledge') {
      updatedAlert = dataStore.acknowledgeAlert(alertId, officerName || 'Duty Tourism Officer');
    } else if (status) {
      updatedAlert = dataStore.updateAlertStatus(alertId, status, incidentNotes);
    }

    if (!updatedAlert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
      message: `Alert ${alertId} updated successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
