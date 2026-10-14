'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Download,
  FileSpreadsheet,
  Lock,
  Unlock,
  Radio,
  FileText,
  Clock,
  Car,
  TrendingUp,
  MapPin,
  RefreshCw,
  Bell,
  Send,
} from 'lucide-react';
import { INITIAL_DESTINATIONS, INITIAL_ALERTS, INITIAL_PARKING_FACILITIES } from '@/lib/data/destinations-data';
import { CrowdAlert, AuthoritySettings } from '@/types';
import { CrowdBadge } from '@/ui/CrowdBadge';
import { CrowdMap } from '@/components/map/CrowdMap';
import { formatTimeAgo } from '@/lib/utils';

export default function AuthorityPage() {
  // Demo Mode Authorization Switch
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [officialName, setOfficialName] = useState('Officer R. V. Sharma (Tourism Command)');
  const [alerts, setAlerts] = useState<CrowdAlert[]>(INITIAL_ALERTS);

  // Settings state
  const [settings, setSettings] = useState<AuthoritySettings>({
    capacityWarningThreshold: 75,
    capacityCriticalThreshold: 85,
    autoAlertsEnabled: true,
    alertRecipients: 'control.room@tourism.gov.in, dist.collector@gov.in',
    authorityDepartment: 'Integrated Smart Tourism & Traffic Command Centre',
    lastUpdated: new Date().toISOString(),
  });

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'incidents' | 'settings'>('alerts');

  // Selected alert for detail / notes modal
  const [selectedAlert, setSelectedAlert] = useState<CrowdAlert | null>(null);
  const [incidentNoteText, setIncidentNoteText] = useState('');

  // Acknowledge alert
  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'investigating',
              acknowledgedBy: officialName,
              acknowledgedAt: new Date().toISOString(),
            }
          : a
      )
    );
  };

  // Change alert status
  const handleStatusChange = (alertId: string, newStatus: 'active' | 'investigating' | 'resolved') => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
  };

  // Save incident note
  const handleSaveIncidentNote = () => {
    if (!selectedAlert) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id ? { ...a, incidentNotes: incidentNoteText } : a
      )
    );
    setSelectedAlert(null);
    setIncidentNoteText('');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Alert ID',
      'Destination',
      'Severity',
      'Status',
      'Occupancy %',
      'Timestamp',
      'Acknowledged By',
      'Incident Notes',
    ];
    const rows = alerts.map((a) => [
      `"${a.id}"`,
      `"${a.destinationName}"`,
      `"${a.severity.toUpperCase()}"`,
      `"${a.status.toUpperCase()}"`,
      `"${a.occupancyPercentage}%"`,
      `"${a.timestamp}"`,
      `"${a.acknowledgedBy || 'Unacknowledged'}"`,
      `"${(a.incidentNotes || a.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crowdwise-authority-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const criticalSites = INITIAL_DESTINATIONS.filter(
    (d) => d.occupancyPercentage >= settings.capacityCriticalThreshold
  );
  const warningSites = INITIAL_DESTINATIONS.filter(
    (d) =>
      d.occupancyPercentage >= settings.capacityWarningThreshold &&
      d.occupancyPercentage < settings.capacityCriticalThreshold
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header bar with demo authentication toggle */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-rose-100 text-rose-700">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Government &amp; Tourism Authority Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tourism Authority Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {settings.authorityDepartment} • Real-Time Safety &amp; Crowd Dispersal Control
          </p>
        </div>

        {/* Demo Mode Authority Badge & Toggle */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${isAuthenticated ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <div>
              <p className="font-bold text-slate-800">
                {isAuthenticated ? 'Official Session Active' : 'Restricted Public Mode'}
              </p>
              <p className="text-[10px] text-slate-400">{officialName}</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthenticated(!isAuthenticated)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              isAuthenticated
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isAuthenticated ? (
              <>
                <Lock className="w-3.5 h-3.5" /> Demo Sign Out
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" /> Enable Demo Authority
              </>
            )}
          </button>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Official Access Protected</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Authority Dashboard is reserved for tourism boards, municipal police, and incident response personnel.
          </p>
          <button
            onClick={() => setIsAuthenticated(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow"
          >
            Switch to Authority Mode (Demo)
          </button>
        </div>
      ) : (
        <>
          {/* Key Operations KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Monitored Zones</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{INITIAL_DESTINATIONS.length} Sites</p>
              <p className="text-xs text-slate-500 mt-0.5">100% telemetry online</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
              <span className="text-[11px] font-semibold text-rose-600 uppercase">Critical Overcrowding</span>
              <p className="text-2xl font-extrabold text-rose-700 mt-1">{criticalSites.length} Locations</p>
              <p className="text-xs text-rose-600/80 mt-0.5">&ge; {settings.capacityCriticalThreshold}% safe capacity</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
              <span className="text-[11px] font-semibold text-amber-700 uppercase">Approaching Capacity</span>
              <p className="text-2xl font-extrabold text-amber-800 mt-1">{warningSites.length} Locations</p>
              <p className="text-xs text-amber-700/80 mt-0.5">{settings.capacityWarningThreshold}% – {settings.capacityCriticalThreshold}% occupancy</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Action Alerts</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {alerts.filter((a) => a.status === 'active').length} Unresolved
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                {alerts.filter((a) => a.status === 'resolved').length} Resolved today
              </p>
            </div>
          </div>

          {/* Quick Action Bar: Tabs & CSV Download */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'alerts'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Crowd Alerts ({alerts.filter((a) => a.status !== 'resolved').length})
              </button>

              <button
                onClick={() => setActiveTab('incidents')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'incidents'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Incident Log
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Threshold Config
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Incident Report (CSV)</span>
            </button>
          </div>

          {/* TAB CONTENT: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Active Real-Time Overcrowding Notifications
                </h3>
                <span className="text-xs text-slate-400">Auto-generated from sensor occupancy thresholds</span>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => {
                  const severityBadge = {
                    critical: 'bg-rose-100 text-rose-800 border-rose-200',
                    warning: 'bg-amber-100 text-amber-800 border-amber-200',
                    info: 'bg-sky-100 text-sky-800 border-sky-200',
                  };

                  const statusBadge = {
                    active: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
                    investigating: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
                    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
                  };

                  return (
                    <div
                      key={alert.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              severityBadge[alert.severity]
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900">
                            {alert.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full border uppercase ${
                              statusBadge[alert.status]
                            }`}
                          >
                            Status: {alert.status}
                          </span>
                          <span className="text-slate-400">
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 space-y-1">
                        <p className="font-semibold text-slate-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          Recommended Protocol:
                        </p>
                        <p className="text-slate-600 pl-4">{alert.recommendedAction}</p>
                      </div>

                      {alert.incidentNotes && (
                        <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900">
                          <strong>Incident Log:</strong> {alert.incidentNotes}
                        </div>
                      )}

                      {/* Official Action Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-slate-500">
                          {alert.acknowledgedBy ? (
                            <span>Acknowledged by <strong>{alert.acknowledgedBy}</strong></span>
                          ) : (
                            <span className="text-rose-600 font-medium">⚠️ Awaiting Acknowledgement</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {alert.status === 'active' && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
                            >
                              Acknowledge &amp; Investigate
                            </button>
                          )}

                          {alert.status !== 'resolved' && (
                            <button
                              onClick={() => handleStatusChange(alert.id, 'resolved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                            >
                              Mark Resolved
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedAlert(alert);
                              setIncidentNoteText(alert.incidentNotes || '');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Add / Edit Notes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT: INCIDENT LOG */}
          {activeTab === 'incidents' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Historical Incident &amp; Action Log</h3>
                <p className="text-xs text-slate-500">Official log of surge interventions, gate closures, and VMS diversions</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">Alert ID</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Notes &amp; Interventions</th>
                      <th className="py-2.5 px-3">Acknowledged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {alerts.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{a.id}</td>
                        <td className="py-3 px-3 font-semibold">{a.destinationName}</td>
                        <td className="py-3 px-3 uppercase font-bold text-xs">
                          <span
                            className={
                              a.severity === 'critical'
                                ? 'text-rose-600'
                                : a.severity === 'warning'
                                ? 'text-amber-600'
                                : 'text-sky-600'
                            }
                          >
                            {a.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 uppercase font-semibold text-[11px]">{a.status}</td>
                        <td className="py-3 px-3 max-w-xs truncate text-slate-600">
                          {a.incidentNotes || a.recommendedAction}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{a.acknowledgedBy || 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: THRESHOLD SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 max-w-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Capacity Alert Thresholds</h3>
                <p className="text-xs text-slate-500">
                  Configure real-time trigger percentages for automated incident notifications
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Warning Surge Threshold (Amber)</span>
                    <span className="font-bold text-amber-700">{settings.capacityWarningThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="80"
                    value={settings.capacityWarningThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, capacityWarningThreshold: Number(e.target.value) })
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Alerts duty officers to prepare secondary holding zones and dispatch shuttle buses.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Critical Overcrowding Threshold (Red)</span>
                    <span className="font-bold text-rose-700">{settings.capacityCriticalThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="75"
                    max="95"
                    value={settings.capacityCriticalThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, capacityCriticalThreshold: Number(e.target.value) })
                    }
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Triggers gate metering, pedestrian flow restrictions, and roadside VMS diversion warnings.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Control Room Notification Emails
                  </label>
                  <input
                    type="text"
                    value={settings.alertRecipients}
                    onChange={(e) => setSettings({ ...settings, alertRecipients: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      alert('Authority thresholds updated successfully in active session.');
                    }}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow"
                  >
                    Save Threshold Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Incident Notes Modal */}
          {selectedAlert && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Record Incident Log Note
                  </h3>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Target Site: {selectedAlert.destinationName}
                  </p>
                  <p className="text-[11px] text-slate-500">Alert ID: {selectedAlert.id}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intervention Log Notes
                  </label>
                  <textarea
                    rows={4}
                    value={incidentNoteText}
                    onChange={(e) => setIncidentNoteText(e.target.value)}
                    placeholder="Enter dispatch notes, barrier deployments, or diversion route actions..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveIncidentNote}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
