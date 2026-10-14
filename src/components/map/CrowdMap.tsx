'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Destination, ParkingFacility } from '@/types';
import { MapPin } from 'lucide-react';

interface CrowdMapProps {
  destinations?: Destination[];
  parkingFacilities?: ParkingFacility[];
  center?: [number, number];
  zoom?: number;
  selectedDestinationId?: string;
  onSelectDestination?: (id: string) => void;
  height?: string;
}

const DynamicMap = dynamic(() => import('./CrowdMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center border border-slate-200 text-slate-400 animate-pulse">
      <MapPin className="w-10 h-10 mb-2 text-teal-600 animate-bounce" />
      <p className="text-sm font-medium text-slate-600">Loading Interactive Crowd Map...</p>
      <p className="text-xs text-slate-400 mt-1">Fetching OpenStreetMap coordinates and live sensor data</p>
    </div>
  ),
});

export const CrowdMap: React.FC<CrowdMapProps> = (props) => {
  return <DynamicMap {...props} />;
};
