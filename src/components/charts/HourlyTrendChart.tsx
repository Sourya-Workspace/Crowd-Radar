'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { HourlyForecast } from '@/types';

interface HourlyTrendChartProps {
  hourlyData: HourlyForecast[];
  capacity?: number;
  destinationName?: string;
}

export const HourlyTrendChart: React.FC<HourlyTrendChartProps> = ({
  hourlyData,
  capacity = 50000,
  destinationName,
}) => {
  const chartData = hourlyData.map((d) => ({
    hour: d.hourLabel,
    expected: d.expectedVisitors,
    historical: d.historicalAverage,
    occupancy: d.occupancyPercentage,
    isPeak: d.isPeakHour,
  }));

  const capacityThreshold = Math.round(capacity * 0.85);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            {destinationName ? `${destinationName} — ` : ''}Hourly Footfall & Peak Forecast
          </h3>
          <p className="text-xs text-slate-500">
            24-hour projected visitor volume vs historical baseline
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-teal-600 inline-block"></span>
            <span>Predicted Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block"></span>
            <span>Historical Avg</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="hour"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1">
                        Time: {label}
                      </p>
                      <p className="text-teal-400 font-medium">
                        Predicted: {data.expected.toLocaleString()} visitors ({data.occupancy}%)
                      </p>
                      <p className="text-slate-400">
                        Historical: {data.historical.toLocaleString()} avg
                      </p>
                      {data.isPeak && (
                        <span className="inline-block px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[10px] font-bold mt-1">
                          ⚠️ Peak Overcrowding Expected
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={capacityThreshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: '85% Capacity Limit',
                fill: '#ef4444',
                fontSize: 10,
                position: 'top',
              }}
            />
            <Area
              type="monotone"
              dataKey="expected"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#visitorGradient)"
            />
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
