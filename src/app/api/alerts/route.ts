import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const alerts = dataStore.getAlerts();
    const settings = dataStore.getAuthoritySettings();

    const stats = {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => a.status === 'active').length,
      investigatingAlerts: alerts.filter(a => a.status === 'investigating').length,
      resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    };

    return NextResponse.json({
      success: true,
      stats,
      settings,
      data: alerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { capacityWarningThreshold, capacityCriticalThreshold, autoAlertsEnabled, alertRecipients } = body;

    const updated = dataStore.updateAuthoritySettings({
      ...(capacityWarningThreshold !== undefined && { capacityWarningThreshold }),
      ...(capacityCriticalThreshold !== undefined && { capacityCriticalThreshold }),
      ...(autoAlertsEnabled !== undefined && { autoAlertsEnabled }),
      ...(alertRecipients !== undefined && { alertRecipients }),
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
