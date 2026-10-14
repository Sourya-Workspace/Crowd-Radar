'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Destination } from '@/types';

interface CrowdDistributionChartProps {
  destinations: Destination[];
}

export const CrowdDistributionChart: React.FC<CrowdDistributionChartProps> = ({ destinations }) => {
  const counts = {
    low: destinations.filter((d) => d.crowdLevel === 'low').length,
    moderate: destinations.filter((d) => d.crowdLevel === 'moderate').length,
    high: destinations.filter((d) => d.crowdLevel === 'high').length,
    very_high: destinations.filter((d) => d.crowdLevel === 'very_high').length,
  };

  const data = [
    { name: 'Low (<40%)', value: counts.low, color: '#10b981' },
    { name: 'Moderate (40-64%)', value: counts.moderate, color: '#f59e0b' },
    { name: 'High (65-84%)', value: counts.high, color: '#f97316' },
    { name: 'Critical (≥85%)', value: counts.very_high, color: '#ef4444' },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Crowd Level Distribution</h3>
          <p className="text-xs text-slate-500">Breakdown of monitored tourist sites</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
          {destinations.length} Sites
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [`${val} Destinations`, 'Volume']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
