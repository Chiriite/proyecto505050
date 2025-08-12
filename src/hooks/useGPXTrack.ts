import { useState, useEffect } from 'react';

// Calculate distance between coordinates using Haversine formula
function calculateDistance(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1];
    const [lon2, lat2] = coordinates[i];
    
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
               Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    totalDistance += R * c;
  }
  
  return Math.round(totalDistance * 100) / 100;
}

export interface GPXTrack {
  id: string;
  name: string;
  coordinates: [number, number][]; // [longitude, latitude]
  distance: number;
  elevation?: number[];
}

export function useGPXTrack(gpxUrl: string) {
  const [track, setTrack] = useState<GPXTrack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function parseGPX() {
      try {
        const response = await fetch(gpxUrl);
        const gpxText = await response.text();
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxText, 'text/xml');
        
        // Extraer coordenadas del track
        const trackPoints = gpxDoc.querySelectorAll('trkpt');
        const coordinates: [number, number][] = [];
        
        trackPoints.forEach(point => {
          const lat = parseFloat(point.getAttribute('lat') || '0');
          const lon = parseFloat(point.getAttribute('lon') || '0');
          coordinates.push([lon, lat]);
        });

        setTrack({
          id: gpxUrl,
          name: gpxDoc.querySelector('name')?.textContent || 'Track',
          coordinates,
          distance: calculateDistance(coordinates)
        });
      } catch (error) {
        console.error('Error parsing GPX:', error);
      } finally {
        setLoading(false);
      }
    }

    parseGPX();
  }, [gpxUrl]);

  return { track, loading };
}
