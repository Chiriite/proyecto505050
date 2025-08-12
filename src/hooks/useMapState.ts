import { useState, useEffect } from 'react';
import type { City } from '../components/MapMarker';

// Mock cities data - will be replaced with Supabase data
export const mockCities: City[] = [
  { id: 1, name: "Madrid", order_number: 1, latitude: 40.4168, longitude: -3.7038, run_date: "2023-01-15", distance_km: 10.5 },
  { id: 2, name: "Barcelona", order_number: 2, latitude: 41.3851, longitude: 2.1734, run_date: "2023-02-20", distance_km: 12.3 },
  { id: 3, name: "Valencia", order_number: 3, latitude: 39.4699, longitude: -0.3763, run_date: "2023-03-10", distance_km: 8.7 },
  { id: 4, name: "Sevilla", order_number: 4, latitude: 37.3891, longitude: -5.9845, run_date: "2023-04-05", distance_km: 9.2 },
  { id: 5, name: "Bilbao", order_number: 5, latitude: 43.2627, longitude: -2.9253, run_date: "2023-05-12", distance_km: 11.8 }
];

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedCityId?: number;
}

// Global map state management
let globalMapState: MapState = {
  center: [-3.7038, 40.4168], // Madrid center
  zoom: 5.8
};

const subscribers = new Set<(state: MapState) => void>();

export const useMapState = () => {
  const [mapState, setMapState] = useState<MapState>(globalMapState);

  useEffect(() => {
    const updateState = (newState: MapState) => {
      setMapState(newState);
    };

    subscribers.add(updateState);

    return () => {
      subscribers.delete(updateState);
    };
  }, []);

  const updateMapState = (updates: Partial<MapState>) => {
    globalMapState = { ...globalMapState, ...updates };
    subscribers.forEach(callback => callback(globalMapState));
  };

  const getCityById = (id: number): City | undefined => {
    return mockCities.find(city => city.id === id);
  };

  const getNextCity = (currentId: number): City | undefined => {
    const currentCity = getCityById(currentId);
    if (!currentCity) return undefined;
    
    const nextOrderNumber = currentCity.order_number + 1;
    return mockCities.find(city => city.order_number === nextOrderNumber);
  };

  const getPreviousCity = (currentId: number): City | undefined => {
    const currentCity = getCityById(currentId);
    if (!currentCity) return undefined;
    
    const prevOrderNumber = currentCity.order_number - 1;
    return mockCities.find(city => city.order_number === prevOrderNumber);
  };

  const navigateToCity = (cityId: number, smooth = true): MapState => {
    const city = getCityById(cityId);
    if (!city) return mapState;

    const newState: MapState = {
      center: [city.longitude, city.latitude],
      zoom: 8,
      selectedCityId: cityId
    };

    updateMapState(newState);
    return newState;
  };

  const resetToOverview = (): MapState => {
    const newState: MapState = {
      center: [-3.7038, 40.4168],
      zoom: 5.8,
      selectedCityId: undefined
    };

    updateMapState(newState);
    return newState;
  };

  return {
    mapState,
    updateMapState,
    getCityById,
    getNextCity,
    getPreviousCity,
    navigateToCity,
    resetToOverview,
    cities: mockCities
  };
};