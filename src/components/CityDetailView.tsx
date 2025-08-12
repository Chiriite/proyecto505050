import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { clsx } from 'clsx';
import type { City } from '../hooks/useMapState';
import { createMapOptions, handleMapError, setupResizeHandler, CITY_DETAIL_ZOOM } from '../utils/mapConfig';
import { useGPXTrack } from '../hooks/useGPXTrack';
import PhotoGallery from './PhotoGallery';

interface CityDetailViewProps {
  city: City;
  nextCity?: City;
  prevCity?: City;
}

interface CityPhoto {
  id: string;
  photo_url: string;
  caption?: string;
}

export default function CityDetailView({ city, nextCity, prevCity }: CityDetailViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cityPhotos, setCityPhotos] = useState<CityPhoto[]>([]);
  const [storyContent, setStoryContent] = useState<string>('');

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

  // Cargar track GPX basado en el city ID
  const { track, loading: trackLoading } = useGPXTrack(`/tracks/${city.id}.gpx`);

  useEffect(() => {
    const loadLocalPhotos = () => {
      const cityId = city.id.toString();
      const availableImages = ['1', '2', '3'];
      
      const localPhotos: CityPhoto[] = availableImages.map((imageNum) => ({
        id: imageNum,
        photo_url: `/images/${cityId}/${imageNum}.webp`,
        caption: `Imagen ${imageNum} de ${city.name}`
      }));
      
      setCityPhotos(localPhotos);
    };
    
    loadLocalPhotos();
    
    // Mock story content
    const mockStory = `My running journey through ${city.name} was truly memorable. The city's unique blend of history and modernity created the perfect backdrop for this adventure. Every step revealed new sights, sounds, and experiences that made this run special.`;
    setStoryContent(mockStory);
  }, [city.id, city.name]);

  // Add GPX track when track data becomes available
  useEffect(() => {
    if (map.current && track && !trackLoading) {
      addGPXTrack();
    }
  }, [track, trackLoading, map.current]);

  const addGPXTrack = () => {
    if (!map.current || !track) return;

    try {
      // Remove existing track if it exists
      if (map.current.getLayer('gpx-track-line')) {
        map.current.removeLayer('gpx-track-line');
      }
      if (map.current.getSource('gpx-track')) {
        map.current.removeSource('gpx-track');
      }

      // Agregar fuente del track GPX
      map.current.addSource('gpx-track', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: track.coordinates
          }
        }
      });

      // Agregar capa del track
      map.current.addLayer({
        id: 'gpx-track-line',
        type: 'line',
        source: 'gpx-track',
        paint: {
          'line-color': '#f97316',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });

      // Centrar el mapa en el track completo con padding adaptativo
      if (track.coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        
        // Extender los bounds para incluir todos los puntos del track
        track.coordinates.forEach(coord => {
          bounds.extend(coord);
        });
        
        const isMobile = window.innerWidth < 768; 
        
        // Padding adaptativo según dispositivo
        const padding = isMobile 
          ? { top: 100, bottom: 320, left: 50, right: 50 }
          : { top: 50, bottom: 50, left: 320, right: 50 };
        
        // Ajustar el zoom y centrar para mostrar todo el track
        map.current.fitBounds(bounds, {
          padding,
          duration: 1000,
          essential: true
        });
      }

      console.log('GPX track added successfully:', track.name, 'Distance:', track.distance, 'km');
    } catch (error) {
      console.error('Error adding GPX track:', error);
    }
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
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-primary">Loading {city.name}...</p>
          </div>
        </div>
      )}

      {/* Fixed Map Container */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full touch-pan-x touch-pan-y touch-pinch-zoom"
        style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
      />

      {/* Map Controls */}
      <div className="absolute top-6 right-6 z-[1000] space-y-3">
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

      {/* Unified Scrollable Content Panel */}
      <div className="absolute inset-x-0 md:inset-x-auto md:left-0 md:w-96 bottom-0 max-h-[85vh] overflow-y-auto z-[1500] overscroll-behavior-contain"
           style={{ touchAction: 'pan-y' }}
      >
        <div className="bg-gradient-to-t from-black via-black/98 to-transparent md:bg-gradient-to-r md:from-black md:via-black/98 md:to-transparent">
          {/* Spacer for initial positioning - shows map content */}
          <div 
            className="h-[45vh]" 
            style={{ 
              pointerEvents: 'none',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
            onTouchStart={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            onTouchEnd={(e) => e.preventDefault()}
          ></div>
          
          {/* City Information Panel */}
          <div className="px-6 mb-6">
            <div className="bg-black/95 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl shadow-black/60 overflow-hidden"
                 onTouchStart={(e) => e.stopPropagation()}
                 onTouchMove={(e) => e.stopPropagation()}
                 onTouchEnd={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {city.name}
                    </h1>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF8C00]/20 border border-[#FF8C00]/30">
                      <span className="text-[#FF8C00] font-semibold text-sm">
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
                  <svg className="w-5 h-5 mr-3 text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
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
                    <svg className="w-5 h-5 mr-3 text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        'bg-[#FF8C00]/10 border-[#FF8C00]/20 text-[#FF8C00]',
                        'hover:bg-[#FF8C00]/20 hover:border-[#FF8C00]/30',
                        'transition-all duration-200 group'
                      )}
                    >
                      <div className="text-right mr-2">
                        <div className="text-xs text-[#FF8C00]/70">Next</div>
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

          {/* Story Section with Photo Gallery Preview */}
          <div className="px-6 pb-8">
            <div className="bg-black/95 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl shadow-black/60 overflow-hidden"
                 onTouchStart={(e) => e.stopPropagation()}
                 onTouchMove={(e) => e.stopPropagation()}
                 onTouchEnd={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-4">My Experience in {city.name}</h3>
                
                {/* Photo Gallery Preview - Shows partial content to indicate more */}
                <div className="mb-6 relative">
                  <PhotoGallery photos={cityPhotos} cityName={city.name} />
                  {/* Subtle indication that there's more content */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full"></div>
                </div>
                
                <p className="text-white/70 leading-relaxed text-lg mb-6">
                  {storyContent || `Discover the story of my running journey through ${city.name}. Each step through this beautiful city was an adventure, exploring its unique character and discovering new perspectives along the way.`}
                </p>
                
                {/* Additional Info */}
                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/80">
                    <svg className="w-5 h-5 text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Run #{city.order_number}</span>
                  </div>
                  {city.distance_km && (
                    <div className="flex items-center gap-2 text-white/80">
                      <svg className="w-5 h-5 text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-medium">{city.distance_km} km</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}