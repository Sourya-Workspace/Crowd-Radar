import React from 'react';
import { CrowdLevel, MeasurementType, DataQualityStatus } from '@/types';
import { getCrowdBadgeInfo } from '@/lib/utils';

interface CrowdBadgeProps {
  level: CrowdLevel;
  percentage?: number | null;
  measurementType?: MeasurementType;
  dataQuality?: DataQualityStatus;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CrowdBadge: React.FC<CrowdBadgeProps> = ({
  level,
  percentage,
  measurementType = 'ESTIMATED',
  dataQuality,
  showDot = true,
  size = 'md',
  className = '',
}) => {
  const info = getCrowdBadgeInfo(level);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const isLive = measurementType === 'MEASURED' || dataQuality === 'VERIFIED_LIVE';
  const isUnavailable = measurementType === 'UNAVAILABLE';

  if (isUnavailable) {
    return (
      <span
        className={`inline-flex items-center rounded-full border bg-slate-100 text-slate-600 border-slate-300 ${sizeClasses[size]} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>Live Crowd Unavailable</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border ${info.badgeBg} ${sizeClasses[size]} ${className}`}
      title={
        isLive
          ? 'Measured: Direct telemetry from authorized turnstiles or municipal sensors.'
          : 'Estimated: Calculated from diurnal footfall model, day-of-week, and time-of-day.'
      }
    >
      {showDot && (
        <span className="relative flex">
          {level === 'very_high' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${info.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full ${info.dot} ${dotSizes[size]}`} />
        </span>
      )}

      <span>{info.label}</span>

      {percentage !== undefined && percentage !== null && (
        <span className="font-bold opacity-90">({percentage}%)</span>
      )}

      {/* Fidelity tag: LIVE vs EST */}
      <span
        className={`text-[9px] uppercase tracking-wider font-extrabold px-1 rounded ${
          isLive
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-200/80 text-slate-700'
        }`}
      >
        {isLive ? 'LIVE' : 'EST'}
      </span>
    </span>
  );
};
