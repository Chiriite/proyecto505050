import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { clsx } from 'clsx';

// Mock data structure - replace with Supabase integration
interface City {
  id: number;
  name: string;
  order_number: number;
  latitude: number;
  longitude: number;
  run_date: string;
  distance_km?: number;
  description?: string;
}

interface SpainMapProps {
  onCitySelect?: (city: City) => void;
}

// Mock cities data - replace with Supabase data
const mockCities: City[] = [
  { id: 1, name: "Madrid", order_number: 1, latitude: 40.4168, longitude: -3.7038, run_date: "2023-01-15", distance_km: 10.5 },
  { id: 2, name: "Barcelona", order_number: 2, latitude: 41.3851, longitude: 2.1734, run_date: "2023-02-20", distance_km: 12.3 },
  { id: 3, name: "Valencia", order_number: 3, latitude: 39.4699, longitude: -0.3763, run_date: "2023-03-10", distance_km: 8.7 },
  { id: 4, name: "Sevilla", order_number: 4, latitude: 37.3891, longitude: -5.9845, run_date: "2023-04-05", distance_km: 9.2 },
  { id: 5, name: "Bilbao", order_number: 5, latitude: 43.2627, longitude: -2.9253, run_date: "2023-05-12", distance_km: 11.8 }
];

export default function SpainMap({ onCitySelect }: SpainMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Initialize cities (replace with Supabase fetch)
  useEffect(() => {
    setCities(mockCities);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
      },
      center: [-3.7038, 40.4168], // Madrid center
      zoom: 5.8,
      pitch: 0,
      bearing: 0
    });

    // Apply dark theme to map
    map.current.on('load', () => {
      if (map.current) {
        // Invert colors for dark theme effect
        map.current.setPaintProperty('osm-tiles', 'raster-brightness-min', 0);
        map.current.setPaintProperty('osm-tiles', 'raster-brightness-max', 0.3);
        map.current.setPaintProperty('osm-tiles', 'raster-contrast', 0.2);
        
        addCityMarkers();
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [cities]);

  const addCityMarkers = () => {
    if (!map.current) return;

    cities.forEach((city) => {
      // Create custom marker element with Tailwind classes
      const el = document.createElement('div');
      el.className = clsx(
        'w-9 h-9 bg-primary text-black border-3 border-text-primary',
        'rounded-full flex items-center justify-center font-bold text-sm cursor-pointer',
        'transition-all duration-300 ease-in-out shadow-glow',
        'hover:scale-110 hover:shadow-glow-lg hover:border-primary'
      );
      el.textContent = city.order_number.toString();
      
      // Add click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedCity(city);
        onCitySelect?.(city);
        
        // Fly to city location
        map.current?.flyTo({
          center: [city.longitude, city.latitude],
          zoom: 8,
          duration: 1000
        });
      });

      // Create and add marker
      new maplibregl.Marker(el)
        .setLngLat([city.longitude, city.latitude])
        .addTo(map.current!);
    });
  };

  const resetView = () => {
    setSelectedCity(null);
    map.current?.flyTo({
      center: [-3.7038, 40.4168],
      zoom: 5.8,
      duration: 1000
    });
  };

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-5 right-5 z-[1000]">
        <button 
          onClick={resetView}
          className={clsx(
            'bg-black/80 border border-primary text-text-primary p-3 rounded-lg',
            'backdrop-blur-xl transition-all duration-200 ease-in-out',
            'hover:bg-black/90 hover:border-primary-hover hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black'
          )}
          aria-label="Reset map view"
        >
          🔄
        </button>
      </div>

      {/* Selected City Info Panel */}
      {selectedCity && (
        <div className={clsx(
          'absolute bottom-5 left-5 bg-black/90 border border-primary rounded-xl p-5 min-w-[280px]',
          'backdrop-blur-2xl z-[1000] shadow-glow',
          'md:bottom-5 md:left-5',
          'max-md:left-4 max-md:right-4 max-md:bottom-4 max-md:min-w-0'
        )}>
          {/* Close Button */}
          <button 
            onClick={() => setSelectedCity(null)}
            className={clsx(
              'absolute top-2.5 right-4 bg-transparent border-none text-text-primary text-lg cursor-pointer',
              'opacity-70 transition-opacity duration-200 hover:opacity-100',
              'focus:outline-none focus:opacity-100'
            )}
            aria-label="Close city info"
          >
            ✕
          </button>
          
          {/* City Information */}
          <h3 className="text-primary text-xl font-semibold mb-3 pr-6">
            {selectedCity.name}
          </h3>
          
          <p className="text-primary font-medium text-sm mb-2">
            Run #{selectedCity.order_number}
          </p>
          
          <p className="text-text-primary text-sm mb-2">
            {new Date(selectedCity.run_date).toLocaleDateString()}
          </p>
          
          {selectedCity.distance_km && (
            <p className="text-text-primary text-sm mb-2">
              {selectedCity.distance_km} km
            </p>
          )}
          
          {selectedCity.description && (
            <p className="text-text-muted text-sm leading-relaxed mt-3">
              {selectedCity.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}