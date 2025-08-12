import React from 'react';
import { clsx } from 'clsx';
import { type City } from '../hooks/useMapState';


interface MapMarkerProps {
  city: City;
  isSelected: boolean;
  onClick: (city: City) => void;
}

export default function MapMarker({ city, isSelected, onClick }: MapMarkerProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(city);
  };

  return (
    <div
      className={clsx(
        // Base styling - minimalist approach
        'relative flex items-center justify-center cursor-pointer select-none',
        'transform-gpu transition-all duration-300 ease-out will-change-transform',
        // Size and shape - clean circular design
        'w-10 h-10 rounded-full',
        // Background with gradient for depth
        'bg-gradient-to-br from-primary via-primary to-primary-dark',
        // Border - subtle but defined
        'border-2 border-black shadow-lg shadow-black/40',
        // Hover states - smooth scaling
        'hover:scale-110 hover:shadow-xl hover:shadow-primary/30',
        // Selected state
        isSelected && [
          'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-black',
          'shadow-xl shadow-primary/40 z-50'
        ],
        // Text styling
        'text-black font-bold text-sm',
        // Performance optimizations
        'backface-hidden perspective-1000'
      )}
      onClick={handleClick}
      style={{
        // Ensure smooth transforms
        transformOrigin: 'center center',
      }}
      aria-label={`City ${city.order_number}: ${city.name}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(city);
        }
      }}
    >
      {/* Inner glow effect for selected state */}
      {isSelected && (
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm animate-pulse" />
      )}
      
      {/* Number display */}
      <span className="relative z-10 font-extrabold tracking-tight">
        {city.order_number}
      </span>

      {/* Subtle outer ring for depth */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
    </div>
  );
}

