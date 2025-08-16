import { type City } from '../hooks/useMapState';

export interface RouteSegment {
  id: string;
  from: City;
  to: City;
  coordinates: [number, number][];
  order: number;
}

/**
 * Generate direct line connections between cities in chronological order
 */
export function generateRouteConnections(cities: City[]): RouteSegment[] {
  const sortedCities = [...cities].sort((a, b) => a.order_number - b.order_number);
  const segments: RouteSegment[] = [];

  for (let i = 0; i < sortedCities.length - 1; i++) {
    const from = sortedCities[i];
    const to = sortedCities[i + 1];

    segments.push({
      id: `route-${from.order_number}-${to.order_number}`,
      from,
      to,
      coordinates: [
        [from.longitude, from.latitude],
        [to.longitude, to.latitude]
      ],
      order: from.order_number
    });
  }

  return segments;
}

/**
 * Validate route data integrity
 */
export function validateRouteConnections(cities: City[], segments: RouteSegment[]): boolean {
  const sortedCities = [...cities].sort((a, b) => a.order_number - b.order_number);
  
  if (segments.length !== sortedCities.length - 1) {
    console.warn(`Expected ${sortedCities.length - 1} segments, got ${segments.length}`);
    return false;
  }

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const expectedFrom = sortedCities[i];
    const expectedTo = sortedCities[i + 1];

    if (segment.from.id !== expectedFrom.id || segment.to.id !== expectedTo.id) {
      console.warn(`Segment ${i} connection mismatch`);
      return false;
    }
  }

  return true;
}