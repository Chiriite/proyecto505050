import maplibregl from 'maplibre-gl';

export interface MapStyleConfig {
  version: 8;
  sources: {
    'dark-tiles': {
      type: 'raster';
      tiles: string[];
      tileSize: number;
      attribution: string;
      maxzoom: number;
    };
    'fallback-dark': {
      type: 'raster';
      tiles: string[];
      tileSize: number;
      attribution: string;
      maxzoom: number;
    };
  };
  layers: Array<{
    id: string;
    type: 'background' | 'raster';
    source?: string;
    minzoom?: number;
    maxzoom?: number;
    paint: Record<string, any>;
  }>;
  glyphs: string;
}

export interface MapOptions {
  container: HTMLElement;
  style: string | MapStyleConfig; // Support both style URL and custom config
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  attributionControl: boolean;
  renderWorldCopies: boolean;
  maxTileCacheSize: number;
}

/**
 * MapTiler configuration
 */
export const MAPTILER_CONFIG = {
  styleUrl: 'https://api.maptiler.com/maps/0198a408-3d96-785a-9355-2fab1729ecd0/style.json?key=PKcheI2Ze8DCtQWsmDGF',
  attribution: '© MapTiler © OpenStreetMap contributors'
};

/**
 * Primary MapTiler dark style - vector-based with excellent visual quality
 */
export const createMapTilerStyle = (): string => {
  return MAPTILER_CONFIG.styleUrl;
};

/**
 * Fallback raster-based map style configuration for reliability
 */
export const createFallbackMapStyle = (): MapStyleConfig => ({
  version: 8,
  sources: {
    'dark-tiles': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, © CartoDB',
      maxzoom: 19
    },
    'fallback-dark': {
      type: 'raster',
      tiles: [
        'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© Stadia Maps, © OpenMapTiles © OpenStreetMap contributors',
      maxzoom: 20
    }
  },
  layers: [
    {
      id: 'dark-background',
      type: 'background',
      paint: {
        'background-color': '#0a0a0a'
      }
    },
    {
      id: 'dark-tiles',
      type: 'raster',
      source: 'dark-tiles',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.9,
        'raster-brightness-min': 0.1,
        'raster-brightness-max': 0.5,
        'raster-contrast': 0.4,
        'raster-saturation': -0.4
      }
    }
  ],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
});

/**
 * Create map style with MapTiler as primary and fallback support
 */
export const createMapStyle = (useFallback = false): string | MapStyleConfig => {
  return useFallback ? createFallbackMapStyle() : createMapTilerStyle();
};

/**
 * Create base map options with shared configuration
 */
export const createMapOptions = (
  container: HTMLElement,
  center: [number, number],
  zoom: number,
  customOptions?: Partial<MapOptions> & { useFallback?: boolean }
): MapOptions => {
  const { useFallback = false, ...otherOptions } = customOptions || {};
  
  return {
    container,
    style: createMapStyle(useFallback),
    center,
    zoom,
    pitch: 0,
    bearing: 0,
    attributionControl: false,
    renderWorldCopies: false,
    maxTileCacheSize: 50,
    ...otherOptions
  };
};

/**
 * Enhanced error handling for map failures with MapTiler fallback strategy
 */
export const handleMapError = (
  e: any,
  map: maplibregl.Map | null,
  onError: (message: string) => void
): void => {
  console.error('Map error:', e);
  
  // Check if it's a MapTiler style loading error
  if (e.error && (e.error.message?.includes('maptiler') || e.error.message?.includes('style') || e.sourceId)) {
    console.log('MapTiler style failed, switching to fallback raster tiles...');
    
    try {
      // Replace the entire style with fallback configuration
      const fallbackStyle = createFallbackMapStyle();
      map?.setStyle(fallbackStyle as any);
      
      console.log('Successfully switched to fallback raster style');
      
      // Wait for style to load then add any additional error handling
      map?.once('styledata', () => {
        console.log('Fallback style loaded successfully');
      });
      
    } catch (fallbackError) {
      console.error('Fallback style also failed:', fallbackError);
      onError('Failed to load map. Please check your internet connection.');
    }
  } 
  // Handle traditional raster tile failures
  else if (e.error && e.error.message && e.error.message.includes('dark-tiles')) {
    console.log('Switching to secondary fallback tiles...');
    
    try {
      // Remove failed source and add fallback
      if (map?.getSource('dark-tiles')) {
        map.removeLayer('dark-tiles');
        map.removeSource('dark-tiles');
      }
      
      // Add fallback layer
      map?.addLayer({
        id: 'fallback-dark-layer',
        type: 'raster',
        source: 'fallback-dark',
        minzoom: 0,
        maxzoom: 20,
        paint: {
          'raster-opacity': 0.9,
          'raster-brightness-min': 0.1,
          'raster-brightness-max': 0.5,
          'raster-contrast': 0.4,
          'raster-saturation': -0.4
        }
      });
      
      console.log('Secondary fallback tiles loaded successfully');
    } catch (fallbackError) {
      console.error('All fallback options failed:', fallbackError);
      onError('Failed to load map tiles. Please check your internet connection.');
    }
  } else {
    onError('Failed to load map');
  }
};

/**
 * Shared resize handler setup
 */
export const setupResizeHandler = (map: maplibregl.Map): (() => void) => {
  const handleResize = () => {
    if (map) {
      map.resize();
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * Spain map specific configuration
 */
export const SPAIN_MAP_CONFIG = {
  center: [-3.7038, 40.4168] as [number, number],
  zoom: 5.8
};

/**
 * City detail map specific zoom level
 */
export const CITY_DETAIL_ZOOM = 13;