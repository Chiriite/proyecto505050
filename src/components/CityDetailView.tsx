import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { clsx } from 'clsx';
import type { City } from './MapMarker';
import { createMapOptions, handleMapError, setupResizeHandler, CITY_DETAIL_ZOOM } from '../utils/mapConfig';

interface CityDetailViewProps {
  city: City;
  nextCity?: City;
  prevCity?: City;
}

export default function CityDetailView({ city, nextCity, prevCity }: CityDetailViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map focused on the city
  useEffect(() => {
    if (!mapContainer.current || map.current || !city) return;

    try {
      console.log('Initializing city detail map for:', city.name);
      
      const mapOptions = createMapOptions(
        mapContainer.current,
        [city.longitude, city.latitude],
        CITY_DETAIL_ZOOM
      );
      
      map.current = new maplibregl.Map(mapOptions as maplibregl.MapOptions);

      // Enhanced error handling with fallback
      map.current.on('error', (e) => {
        handleMapError(e, map.current, (message) => {
          setMapError(message);
          setIsLoading(false);
        });
      });

      // Map load handler
      map.current.on('load', () => {
        if (map.current) {
          console.log('City detail map loaded successfully');
          addCityMarker();
          setIsLoading(false);
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
      console.error('Failed to initialize city detail map:', error);
      setMapError('Failed to initialize map');
      setIsLoading(false);
    }
  }, [city]);

  const addCityMarker = () => {
    if (!map.current) return;

    // Create a prominent marker for the current city
    const markerContainer = document.createElement('div');
    markerContainer.innerHTML = `
      <div class="
        relative flex items-center justify-center cursor-pointer select-none
        w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary to-primary-dark
        border-3 border-white shadow-2xl shadow-primary/40
        text-black font-extrabold text-lg
        animate-pulse
      ">
        <span class="relative z-10">${city.order_number}</span>
        <div class="absolute inset-0 rounded-full bg-primary/30 blur-lg animate-ping"></div>
      </div>
    `;

    // Add marker to map
    new maplibregl.Marker({
      element: markerContainer,
      anchor: 'center'
    })
      .setLngLat([city.longitude, city.latitude])
      .addTo(map.current!);
  };

  const navigateToCity = (targetCity: City) => {
    // Store navigation intent for smooth transition
    sessionStorage.setItem('fromCityId', city.id.toString());
    window.location.href = `/c/${targetCity.id}`;
  };

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="text-error mb-4 text-lg font-semibold">Map Error:</p>
          <p className="text-text-muted mb-4">{mapError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary text-black rounded-lg hover:bg-primary-hover transition-colors font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-primary">Loading {city.name}...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />

      {/* City Information Panel */}
      <div className="absolute inset-x-6 bottom-6 md:inset-x-auto md:bottom-6 md:left-6 md:w-96">
        <div className="bg-black/95 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {city.name}
                </h1>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                  <span className="text-primary font-semibold text-sm">
                    Run #{city.order_number}
                  </span>
                </div>
              </div>
              <div className="text-right text-white/60 text-sm">
                <div>{city.order_number}/50</div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center text-white/80">
              <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {new Date(city.run_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            {city.distance_km && (
              <div className="flex items-center text-white/80">
                <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{city.distance_km} kilometers</span>
              </div>
            )}

            {city.description && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-white/70 leading-relaxed">
                  {city.description}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between">
              {prevCity ? (
                <button
                  onClick={() => navigateToCity(prevCity)}
                  data-nav="prev"
                  className={clsx(
                    'flex items-center px-4 py-2 rounded-lg border',
                    'bg-white/5 border-white/10 text-white/80',
                    'hover:bg-white/10 hover:border-white/20 hover:text-white',
                    'transition-all duration-200 group'
                  )}
                >
                  <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-white/50">Previous</div>
                    <div className="font-medium">{prevCity.name}</div>
                  </div>
                </button>
              ) : (
                <div></div>
              )}

              {nextCity ? (
                <button
                  onClick={() => navigateToCity(nextCity)}
                  data-nav="next"
                  className={clsx(
                    'flex items-center px-4 py-2 rounded-lg border',
                    'bg-primary/10 border-primary/20 text-primary',
                    'hover:bg-primary/20 hover:border-primary/30',
                    'transition-all duration-200 group'
                  )}
                >
                  <div className="text-right mr-2">
                    <div className="text-xs text-primary/70">Next</div>
                    <div className="font-medium">{nextCity.name}</div>
                  </div>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div className="text-white/40 text-sm italic">Final destination</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-6 right-6 z-[1000] space-y-3">
        {/* Zoom Controls */}
        <div className="bg-black/90 border border-white/20 rounded-lg backdrop-blur-2xl shadow-lg overflow-hidden">
          <button 
            onClick={() => map.current?.zoomIn()}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-b border-white/10"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button 
            onClick={() => map.current?.zoomOut()}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}