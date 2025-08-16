import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { clsx } from 'clsx';
import { type City, citiesArray } from '../hooks/useMapState';
import { createMapOptions, handleMapError, setupResizeHandler, SPAIN_MAP_CONFIG, isMobileDevice } from '../utils/mapConfig';
import { generateRouteConnections, validateRouteConnections } from '../utils/routeUtils';

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
      
      // Use mobile zoom if on mobile device
      const initialZoom = isMobileDevice() ? SPAIN_MAP_CONFIG.mobileZoom : SPAIN_MAP_CONFIG.zoom;
      
      const mapOptions = createMapOptions(
        mapContainer.current,
        SPAIN_MAP_CONFIG.center,
        initialZoom
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
          addRouteConnections();
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

  const addRouteConnections = () => {
    if (!map.current) return;

    try {
      // Use static cities data directly
      const routeSegments = generateRouteConnections(citiesArray);

      console.log(`Adding ${routeSegments.length} route segments`);
      
      // Create GeoJSON from route segments
      const routeGeoJSON: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: routeSegments.map(segment => ({
          type: 'Feature',
          properties: {
            order: segment.order,
            fromCity: segment.from.name,
            toCity: segment.to.name
          },
          geometry: {
            type: 'LineString',
            coordinates: segment.coordinates
          }
        }))
      };

      // Add source
      map.current.addSource('journey-route-source', {
        type: 'geojson',
        data: routeGeoJSON
      });

      // Add layer
      map.current.addLayer({
        id: 'journey-route',
        type: 'line',
        source: 'journey-route-source',
        paint: {
          'line-color': '#FF8C00',
          'line-width': 3,
          'line-opacity': 0.8
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        }
      });

      console.log('Route connections added successfully');
      
    } catch (error) {
      console.error('Failed to add route connections:', error);
    }
  };

  const resetView = () => {
    // Use appropriate zoom level for current device
    const resetZoom = isMobileDevice() ? SPAIN_MAP_CONFIG.mobileZoom : SPAIN_MAP_CONFIG.zoom;
    
    map.current?.flyTo({
      center: SPAIN_MAP_CONFIG.center,
      zoom: resetZoom,
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
    </div>
  );
}