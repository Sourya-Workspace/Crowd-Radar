'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Destination } from '@/types';

interface ComparisonChartProps {
  destA: Destination;
  destB: Destination;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ destA, destB }) => {
  const data = [
    {
      metric: 'Occupancy %',
      [destA.name]: destA.occupancyPercentage,
      [destB.name]: destB.occupancyPercentage,
    },
    {
      metric: 'Est. Wait (Mins)',
      [destA.name]: destA.waitTimeMinutes,
      [destB.name]: destB.waitTimeMinutes,
    },
    {
      metric: 'Parking Occupancy %',
      [destA.name]: Math.round(
        ((destA.nearestParkingCapacity - destA.nearestParkingAvailable) /
          (destA.nearestParkingCapacity || 1)) *
          100
      ),
      [destB.name]: Math.round(
        ((destB.nearestParkingCapacity - destB.nearestParkingAvailable) /
          (destB.nearestParkingCapacity || 1)) *
          100
      ),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="mb-4">
        <h4 className="font-bold text-slate-900 text-sm">Direct Metric Comparison</h4>
        <p className="text-xs text-slate-500">
          Comparing {destA.name} with alternative {destB.name}
        </p>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="metric" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey={destA.name} fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey={destB.name} fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
