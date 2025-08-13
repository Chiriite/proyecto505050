import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { clsx } from 'clsx';
import type { City } from '../hooks/useMapState';
import { createMapOptions, handleMapError, setupResizeHandler, CITY_DETAIL_ZOOM } from '../utils/mapConfig';
import { useGPXTrack } from '../hooks/useGPXTrack';
import PhotoGallery from './PhotoGallery';
import StatItem from './StatItem';
import { TimeIcon, PaceIcon, ElevationIcon, HumidityIcon } from './StatIcons';

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
      
      // Solo incluir las fotos que sabemos que existen
      // Puedes ajustar esto según qué fotos estén disponibles para cada ciudad
      const localPhotos: CityPhoto[] = [];
      
      // Agregar fotos solo si están disponibles
      if (cityId === '49' || cityId === '50') {
        // Estas ciudades tienen 3 fotos
        localPhotos.push(
          { id: '1', photo_url: `/images/${cityId}/1.webp`, caption: `Imagen 1 de ${city.name}` },
          { id: '2', photo_url: `/images/${cityId}/2.webp`, caption: `Imagen 2 de ${city.name}` },
          { id: '3', photo_url: `/images/${cityId}/3.webp`, caption: `Imagen 3 de ${city.name}` }
        );
      } else {
        // Otras ciudades pueden tener menos fotos
        localPhotos.push(
          { id: '1', photo_url: `/images/${cityId}/1.webp`, caption: `Imagen 1 de ${city.name}` },
          { id: '2', photo_url: `/images/${cityId}/2.webp`, caption: `Imagen 2 de ${city.name}` }
        );
      }
      
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
          <div 
            className="h-[42vh]" 
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
              <div className="flex flex-col items-center p-6 border-b border-white/10">
                <div className="w-12 h-1 bg-white/10 mb-4 rounded-full"></div>

                <div className="flex w-full items-center justify-between">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {city.name}
                  </h1>
                  <div className="inline-flex items-center px-3 py-1 rounded-lg bg-[#FF8C00]/20 border border-[#FF8C00]/30">
                    <p><span className="font-bold text-[#FF8C00]">{city.order_number}</span> / 50</p>
                  </div>
                </div>

                <div className="flex items-start w-full text-white/50">                  
                  <span>
                    {new Date(city.run_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full py-4">
                {city.time && (
                  <StatItem
                    icon={<TimeIcon />}
                    label="Tiempo"
                    value={city.time}
                  />
                )}

                {city.pace && (
                  <StatItem
                    icon={<PaceIcon />}
                    label="Ritmo"
                    value={`${city.pace} /km`}
                  />
                )}

                {typeof city.elevation !== 'undefined' && (
                  <StatItem
                    icon={<ElevationIcon />}
                    label="Desnivel"
                    value={`${city.elevation}m`}
                  />
                )}

                {typeof city.humidity !== 'undefined' && (
                  <StatItem
                    icon={<HumidityIcon />}
                    label="Humedad"
                    value={`${city.humidity}%`}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="px-6 pb-6 mt-2">
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
                        <div className="font-medium">{nextCity.name}</div>
                      </div>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <div className="text-white/40 text-sm italic">Final</div>
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
                <h3 className="text-xl font-medium text-center text-white mb-4">Fotos en {city.name}</h3>
                
                <PhotoGallery photos={cityPhotos} cityName={city.name} /> 
                
                <p className="text-white/70 leading-relaxed text-md text-center">
                  Contenido de Strava <a href="https://www.strava.com/athletes/41291884" target="_blank" rel="noopener noreferrer" className="text-[#FF8C00] hover:underline">@pitufollow</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}