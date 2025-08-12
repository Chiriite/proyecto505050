import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { clsx } from 'clsx';
import { type City, citiesArray } from '../hooks/useMapState';
import { createMapOptions, handleMapError, setupResizeHandler, SPAIN_MAP_CONFIG } from '../utils/mapConfig';

interface SpainMapProps {
  onCitySelect?: (city: City) => void;
}

export default function SpainMap({ onCitySelect }: SpainMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize cities (replace with Supabase fetch)
  useEffect(() => {
    setCities(citiesArray);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      console.log('Initializing map...');
      console.log('Cities available:', cities.length);
      
      const mapOptions = createMapOptions(
        mapContainer.current,
        SPAIN_MAP_CONFIG.center,
        SPAIN_MAP_CONFIG.zoom
      );
      
      map.current = new maplibregl.Map(mapOptions as maplibregl.MapOptions);

      // Enhanced error handling with fallback
      map.current.on('error', (e) => {
        handleMapError(e, map.current, setMapError);
      });

      // Simple map load handler
      map.current.on('load', () => {
        if (map.current) {
          console.log('Map loaded successfully');
          if (cities.length > 0) {
            addCityMarkers();
          }
        }
      });

      // Setup resize handler
      const cleanupResize = setupResizeHandler(map.current);

      return () => {
        cleanupResize();
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Failed to initialize map');
    }
  }, []);

  // Add markers when cities are loaded
  useEffect(() => {
    if (map.current && cities.length > 0) {
      console.log('Adding city markers...');
      addCityMarkers();
    }
  }, [cities]);

  const handleMarkerClick = (city: City) => {
    // First, fly to the city with smooth animation
    map.current?.flyTo({
      center: [city.longitude, city.latitude],
      zoom: 8,
      duration: 1000,
      curve: 1.2, // Smooth curved animation
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // Smooth ease-in-out
    });

    // Then navigate to city detail page after a short delay
    setTimeout(() => {
      window.location.href = `/c/${city.id}`;
    }, 600); // Navigate during the zoom animation for smoothness

    // Optional callback for external handling
    onCitySelect?.(city);
  };

  const addCityMarkers = () => {
    if (!map.current) return;

    cities.forEach((city) => {
      // Create React marker container
      const markerContainer = document.createElement('div');
      markerContainer.style.cssText = `
        transform-style: preserve-3d;
        backface-visibility: hidden;
        will-change: transform;
        pointer-events: auto;
      `;
      
      // Create marker with optimized DOM structure
      markerContainer.innerHTML = `
        <div class="
          relative flex items-center justify-center cursor-pointer select-none 
          transform-gpu transition-all duration-300 ease-out will-change-transform
          w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-primary-dark
          border-2 border-black shadow-lg shadow-black/40
          hover:scale-110 hover:shadow-xl hover:shadow-primary/30
          text-black font-bold text-sm backface-hidden
        ">
          <span class="relative z-10 font-extrabold tracking-tight">${city.order_number}</span>
          <div class="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
        </div>
      `;
      
      markerContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        handleMarkerClick(city);
      });

      // Create MapLibre marker with performance optimizations
      new maplibregl.Marker({
        element: markerContainer,
        anchor: 'center',
        offset: [0, 0]
      })
        .setLngLat([city.longitude, city.latitude])
        .addTo(map.current!);
    });
  };

  const resetView = () => {
    map.current?.flyTo({
      center: SPAIN_MAP_CONFIG.center,
      zoom: SPAIN_MAP_CONFIG.zoom,
      duration: 1000
    });
  };

  if (mapError) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-background text-white">
        <div className="text-center p-8">
          <p className="text-error mb-2 text-lg font-semibold">Map Error:</p>
          <p className="text-text-muted mb-4">{mapError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary text-black rounded-lg hover:bg-primary-hover transition-colors font-medium"
          >
            Reload Page
          </button>
          <p className="text-text-muted text-sm mt-4">
            If the problem persists, check your internet connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
        {/* Map Container */}
        <div 
          ref={mapContainer} 
          className="w-full h-full"
        />
      
      {/* Map Controls */}
      <div className="absolute top-6 right-6 z-[1000]">
        <button 
          onClick={resetView}
          className={clsx(
            'group relative overflow-hidden',
            'bg-black/90 border border-white/20 text-white',
            'w-12 h-12 rounded-xl backdrop-blur-2xl',
            'transition-all duration-300 ease-out',
            'hover:bg-black hover:border-primary hover:scale-105',
            'active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black',
            'shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-primary/20'
          )}
          aria-label="Reset map view"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}