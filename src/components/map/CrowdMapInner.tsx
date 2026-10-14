'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Destination, ParkingFacility } from '@/types';
import { CrowdBadge } from '@/ui/CrowdBadge';
import Link from 'next/link';
import { Navigation, Car, Users, Clock, ExternalLink, Info, ShieldCheck } from 'lucide-react';

interface CrowdMapInnerProps {
  destinations?: Destination[];
  parkingFacilities?: ParkingFacility[];
  center?: [number, number];
  zoom?: number;
  selectedDestinationId?: string;
  onSelectDestination?: (id: string) => void;
  height?: string;
}

// Custom icon creator
const createCrowdIcon = (occupancy: number, isSelected: boolean = false, isLive: boolean = false) => {
  let color = '#10b981'; // low
  let pulseColor = 'rgba(16, 185, 129, 0.4)';
  if (occupancy >= 85) {
    color = '#ef4444'; // critical
    pulseColor = 'rgba(239, 68, 68, 0.5)';
  } else if (occupancy >= 65) {
    color = '#f97316'; // high
    pulseColor = 'rgba(249, 115, 22, 0.4)';
  } else if (occupancy >= 40) {
    color = '#f59e0b'; // moderate
    pulseColor = 'rgba(245, 158, 11, 0.4)';
  }

  const size = isSelected ? 40 : 32;
  const pulseAnim = occupancy >= 65 ? 'animation: pulse 2s infinite;' : '';
  const borderStyle = isLive ? '3px solid #10b981' : '2.5px solid #ffffff';

  return L.divIcon({
    className: 'custom-crowd-pin',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${pulseColor}; ${pulseAnim}"></div>
        <div style="width: ${size - 8}px; height: ${size - 8}px; border-radius: 50%; background: ${color}; border: ${borderStyle}; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
          ${occupancy}%
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const createParkingIcon = () => {
  return L.divIcon({
    className: 'custom-parking-pin',
    html: `
      <div style="width: 24px; height: 24px; border-radius: 6px; background: #0284c7; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
        P
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function CrowdMapInner({
  destinations = [],
  parkingFacilities = [],
  center = [15.5, 79.5],
  zoom = 7,
  selectedDestinationId,
  onSelectDestination,
  height = '500px',
}: CrowdMapInnerProps) {
  return (
    <div style={{ height, width: '100%' }} className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeMapView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Destination Markers */}
        {destinations.map((dest) => {
          const isSelected = dest.id === selectedDestinationId;
          const isLive = dest.measurementType === 'MEASURED' || dest.dataQuality === 'VERIFIED_LIVE';

          return (
            <Marker
              key={dest.id}
              position={[dest.latitude, dest.longitude]}
              icon={createCrowdIcon(dest.occupancyPercentage, isSelected, isLive)}
              eventHandlers={{
                click: () => {
                  if (onSelectDestination) {
                    onSelectDestination(dest.id);
                  }
                },
              }}
            >
              <Popup className="crowdwise-popup">
                <div className="p-1 min-w-[260px] max-w-[290px]">
                  <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2 bg-slate-100">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 right-1.5">
                      <CrowdBadge
                        level={dest.crowdLevel}
                        percentage={dest.occupancyPercentage}
                        measurementType={dest.measurementType}
                        size="sm"
                      />
                    </div>
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                        {dest.city}, {dest.state}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    {dest.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {dest.category}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg mb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Active Visitors:
                      </span>
                      <span className="font-semibold text-slate-900">
                        {dest.currentVisitors.toLocaleString()} / {dest.capacity.toLocaleString()}
                      </span>
                    </div>

                    {dest.cumulativeVisitorsToday > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-teal-800">
                        <span>Visited Today:</span>
                        <span className="font-bold">{dest.cumulativeVisitorsToday.toLocaleString()} persons</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Queue Delay:
                      </span>
                      <span className="font-semibold text-amber-700">
                        ~{dest.waitTimeMinutes} mins
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-slate-400" /> Parking:
                      </span>
                      <span className={`font-semibold ${dest.nearestParkingAvailable > 50 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {dest.nearestParkingAvailable} free spots
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Source:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]" title={dest.dataSource}>
                        {dest.dataSource}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/destinations/${dest.id}`}
                      className="flex-1 text-center py-1.5 px-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      View Live Details
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center justify-center"
                      title="Open Directions in Google Maps"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Parking Markers */}
        {parkingFacilities.map((park) => (
          <Marker
            key={park.id}
            position={[park.latitude, park.longitude]}
            icon={createParkingIcon()}
          >
            <Popup>
              <div className="p-1 min-w-[210px]">
                <div className="flex items-center gap-1.5 text-sky-700 font-semibold text-xs mb-1">
                  <Car className="w-4 h-4" /> Parking Facility
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-0.5">
                  {park.name}
                </h4>
                <p className="text-[11px] text-slate-500 mb-2">
                  Serving: {park.destinationName}
                </p>

                <div className="bg-sky-50 p-2 rounded text-xs mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Available:</span>
                    <span className="font-bold text-emerald-700">
                      {park.availableSpaces} / {park.totalSpaces}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Tariff: {park.hourlyRate}</span>
                    <span>{park.hasEvCharging ? '⚡ EV Ready' : ''}</span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${park.latitude},${park.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 w-full py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-medium"
                >
                  <Navigation className="w-3 h-3" /> Navigate to Parking
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md text-xs max-w-[240px]">
        <div className="font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
          <span>Crowd Levels</span>
          <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 rounded">
            Live Radar
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>&lt; 40% Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>40-64% Mod</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span>65-84% High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>&ge; 85% Critical</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border-2 border-emerald-500"></span> LIVE: Measured
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border border-slate-400"></span> EST: Model
          </span>
        </div>
      </div>
    </div>
  );
}
