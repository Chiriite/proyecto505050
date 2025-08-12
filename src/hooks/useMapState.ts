import { useState, useEffect } from 'react';

export interface City {
  id: number;
  name: string;
  order_number: number;
  latitude: number;
  longitude: number;
  run_date: string;
  distance_km?: number;
  description?: string;
  time?: string;
  pace?: string;
  elevation?: number;
  temperature?: number;
  humidity?: number;
}

export const citiesArray: City[] = [
  { id: 1, name: "Tenerife", order_number: 1, latitude: 28.4667980, longitude: -16.2469180, run_date: "2025-06-22", distance_km: 50, time: "4:35:34", pace: "5:31", elevation: 72, temperature: 20, humidity: 80 },
  { id: 2, name: "Gran Canaria", order_number: 2, latitude: 28.1559750, longitude: -15.4322660, run_date: "2025-06-23", distance_km: 50, time: "4:59:46", pace: "6:00", elevation: 590, temperature: 19, humidity: 82 },
  { id: 3, name: "Sevilla", order_number: 3, latitude: 37.3704450, longitude: -5.9875070, run_date: "2025-06-24", distance_km: 50, time: "4:31:50", pace: "5:26", elevation: 72, temperature: 20, humidity: 85 },
  { id: 4, name: "Córdoba", order_number: 4, latitude: 37.8888140, longitude: -4.7874490, run_date: "2025-06-25", distance_km: 50, time: "4:31:40", pace: "5:26", elevation: 213, temperature: 17, humidity: 87 },
  { id: 5, name: "Jaén", order_number: 5, latitude: 37.7864710, longitude: -3.7903380, run_date: "2025-06-26", distance_km: 50, time: "4:26:52", pace: "5:20", elevation: 644, temperature: 19, humidity: 60 },
  { id: 6, name: "Almería", order_number: 6, latitude: 36.8156660, longitude: -2.4343310, run_date: "2025-06-27", distance_km: 50, time: "4:17:37", pace: "5:09", elevation: 33, temperature: 23, humidity: 56},
  { id: 7, name: "Granada", order_number: 7, latitude: 37.1627440, longitude: -3.6102840, run_date: "2025-06-28", distance_km: 50, time: "4:12:35", pace: "5:03", elevation: 198, temperature: 21, humidity: 50},


  
  { id: 8, name: "Málaga", order_number: 8, latitude: 36.721262, longitude: -4.421443, run_date: "2025-06-29", distance_km: 50, time: "4:20:15", pace: "5:12", elevation: 12, temperature: 22, humidity: 65},
  { id: 9, name: "Cádiz", order_number: 9, latitude: 36.5219, longitude: -6.2783, run_date: "2025-06-30", distance_km: 50, time: "4:15:30", pace: "5:06", elevation: 11, temperature: 24, humidity: 70},
  { id: 10, name: "Huelva", order_number: 10, latitude: 37.25808, longitude: -6.95231, run_date: "2025-07-01", distance_km: 50, time: "4:21:40", pace: "5:14", elevation: 18, temperature: 23, humidity: 68},
  { id: 11, name: "Badajoz", order_number: 11, latitude: 38.87689, longitude: -6.97162, run_date: "2025-07-02", distance_km: 50, time: "4:29:10", pace: "5:23", elevation: 185, temperature: 25, humidity: 55},
  { id: 12, name: "Cáceres", order_number: 12, latitude: 39.4764810, longitude: -6.3722420, run_date: "2025-07-03", distance_km: 50, time: "4:33:05", pace: "5:28", elevation: 459, temperature: 26, humidity: 50},
  { id: 13, name: "Salamanca", order_number: 13, latitude: 40.9650000, longitude: -5.6638890, run_date: "2025-07-04", distance_km: 50, time: "4:38:20", pace: "5:34", elevation: 798, temperature: 24, humidity: 45},
  { id: 14, name: "Ávila", order_number: 14, latitude: 40.6558330, longitude: -4.6975000, run_date: "2025-07-05", distance_km: 50, time: "4:45:15", pace: "5:42", elevation: 1131, temperature: 21, humidity: 48},
  { id: 15, name: "Segovia", order_number: 15, latitude: 40.9416670, longitude: -4.1088890, run_date: "2025-07-06", distance_km: 50, time: "4:42:50", pace: "5:39", elevation: 1002, temperature: 20, humidity: 52},
  { id: 16, name: "Soria", order_number: 16, latitude: 41.7645000, longitude: -2.4646000, run_date: "2025-07-07", distance_km: 50, time: "4:47:30", pace: "5:45", elevation: 1063, temperature: 18, humidity: 55},
  { id: 17, name: "Burgos", order_number: 17, latitude: 42.34075, longitude: -3.70205, run_date: "2025-07-08", distance_km: 50, time: "4:50:10", pace: "5:48", elevation: 856, temperature: 17, humidity: 60},
  { id: 18, name: "Palencia", order_number: 18, latitude: 42.0000000, longitude: -4.5333330, run_date: "2025-07-09", distance_km: 50, time: "4:53:50", pace: "5:52", elevation: 749, temperature: 19, humidity: 58},
  { id: 19, name: "Valladolid", order_number: 19, latitude: 41.6522510, longitude: -4.7237240, run_date: "2025-07-10", distance_km: 50, time: "4:51:25", pace: "5:50", elevation: 698, temperature: 21, humidity: 55},
  { id: 20, name: "Zamora", order_number: 20, latitude: 41.5000000, longitude: -5.7500000, run_date: "2025-07-11", distance_km: 50, time: "4:49:00", pace: "5:47", elevation: 652, temperature: 22, humidity: 57},
  { id: 21, name: "León", order_number: 21, latitude: 42.6000000, longitude: -5.5833330, run_date: "2025-07-12", distance_km: 50, time: "4:55:10", pace: "5:54", elevation: 837, temperature: 19, humidity: 62},
  { id: 22, name: "Orense", order_number: 22, latitude: 42.3333330, longitude: -7.8666670, run_date: "2025-07-13", distance_km: 50, time: "4:58:30", pace: "5:58", elevation: 132, temperature: 20, humidity: 65},
  { id: 23, name: "Vigo", order_number: 23, latitude: 42.2333330, longitude: -8.7166670, run_date: "2025-07-14", distance_km: 50, time: "5:02:15", pace: "6:02", elevation: 28, temperature: 21, humidity: 70},
  { id: 24, name: "Coruña", order_number: 24, latitude: 43.3704380, longitude: -8.3960530, run_date: "2025-07-15", distance_km: 50, time: "5:05:00", pace: "6:06", elevation: 21, temperature: 18, humidity: 75},
  { id: 25, name: "Lugo", order_number: 25, latitude: 43.00980, longitude: -7.55564, run_date: "2025-07-16", distance_km: 50, time: "5:08:45", pace: "6:10", elevation: 465, temperature: 17, humidity: 80},
  { id: 26, name: "Oviedo", order_number: 26, latitude: 43.3601930, longitude: -5.8447600, run_date: "2025-07-17", distance_km: 50, time: "5:12:30", pace: "6:15", elevation: 248, temperature: 16, humidity: 85},
  { id: 27, name: "Santander", order_number: 27, latitude: 43.4623190, longitude: -3.8099890, run_date: "2025-07-18", distance_km: 50, time: "5:10:15", pace: "6:12", elevation: 15, temperature: 18, humidity: 88},
  { id: 28, name: "Bilbao", order_number: 28, latitude: 43.26194, longitude: -2.93542, run_date: "2025-07-19", distance_km: 50, time: "5:07:40", pace: "6:09", elevation: 19, temperature: 19, humidity: 82},
  { id: 29, name: "San Sebastián", order_number: 29, latitude: 43.3213030, longitude: -1.9829910, run_date: "2025-07-20", distance_km: 50, time: "5:04:50", pace: "6:06", elevation: 15, temperature: 20, humidity: 80},
  { id: 30, name: "Vitoria", order_number: 30, latitude: 42.8468750, longitude: -2.6738980, run_date: "2025-07-21", distance_km: 50, time: "5:01:30", pace: "6:02", elevation: 525, temperature: 18, humidity: 75},
  { id: 31, name: "Logroño", order_number: 31, latitude: 42.466315, longitude: -2.4394405, run_date: "2025-07-22", distance_km: 50, time: "4:58:20", pace: "5:58", elevation: 384, temperature: 21, humidity: 65},
  { id: 32, name: "Pamplona", order_number: 32, latitude: 42.8166670, longitude: -1.6500000, run_date: "2025-07-23", distance_km: 50, time: "4:55:00", pace: "5:54", elevation: 449, temperature: 22, humidity: 60},
  { id: 33, name: "Huesca", order_number: 33, latitude: 42.14063, longitude: -0.40887, run_date: "2025-07-24", distance_km: 50, time: "4:51:30", pace: "5:50", elevation: 488, temperature: 24, humidity: 55},
  { id: 34, name: "Teruel", order_number: 34, latitude: 40.3421300, longitude: -1.1064500, run_date: "2025-07-25", distance_km: 50, time: "4:48:15", pace: "5:46", elevation: 915, temperature: 23, humidity: 50},
  { id: 35, name: "Zaragoza", order_number: 35, latitude: 41.6488230, longitude: -0.8890850, run_date: "2025-07-26", distance_km: 50, time: "4:45:00", pace: "5:42", elevation: 200, temperature: 27, humidity: 45},
  { id: 36, name: "Madrid", order_number: 36, latitude: 40.416775, longitude: -3.703790, run_date: "2025-07-27", distance_km: 50, time: "4:42:20", pace: "5:39", elevation: 667, temperature: 28, humidity: 40},
  { id: 37, name: "Guadalajara", order_number: 37, latitude: 40.6300000, longitude: -3.1666670, run_date: "2025-07-28", distance_km: 50, time: "4:39:45", pace: "5:36", elevation: 708, temperature: 29, humidity: 38},
  { id: 38, name: "Cuenca", order_number: 38, latitude: 40.0700000, longitude: -2.1333330, run_date: "2025-07-29", distance_km: 50, time: "4:37:10", pace: "5:33", elevation: 946, temperature: 27, humidity: 42},
  { id: 39, name: "Toledo", order_number: 39, latitude: 39.8666670, longitude: -4.0333330, run_date: "2025-07-30", distance_km: 50, time: "4:34:50", pace: "5:30", elevation: 529, temperature: 30, humidity: 35},
  { id: 40, name: "Ciudad Real", order_number: 40, latitude: 38.8985426, longitude: -3.6333151, run_date: "2025-07-31", distance_km: 50, time: "4:32:30", pace: "5:28", elevation: 628, temperature: 31, humidity: 33},
  { id: 41, name: "Albacete", order_number: 41, latitude: 38.98963, longitude: -1.84879, run_date: "2025-08-01", distance_km: 50, time: "4:30:15", pace: "5:25", elevation: 686, temperature: 32, humidity: 30},
  { id: 42, name: "Murcia", order_number: 42, latitude: 37.9833330, longitude: -1.1333330, run_date: "2025-08-02", distance_km: 50, time: "4:28:00", pace: "5:22", elevation: 43, temperature: 33, humidity: 35},
  { id: 43, name: "Alicante", order_number: 43, latitude: 38.3459960, longitude: -0.4906850, run_date: "2025-08-03", distance_km: 50, time: "4:25:40", pace: "5:19", elevation: 10, temperature: 31, humidity: 45},
  { id: 44, name: "Valencia", order_number: 44, latitude: 39.4697500, longitude: -0.3773900, run_date: "2025-08-04", distance_km: 50, time: "4:23:25", pace: "5:16", elevation: 15, temperature: 30, humidity: 50},
  { id: 45, name: "Castellón", order_number: 45, latitude: 40.2408, longitude: -0.0742, run_date: "2025-08-05", distance_km: 50, time: "4:21:00", pace: "5:13", elevation: 30, temperature: 29, humidity: 55},
  { id: 46, name: "Palma Mallorca", order_number: 46, latitude: 39.5666670, longitude: 2.6500000, run_date: "2025-08-06", distance_km: 50, time: "4:18:45", pace: "5:10", elevation: 13, temperature: 28, humidity: 60},
  { id: 47, name: "Tarragona", order_number: 47, latitude: 41.1189420, longitude: 1.2444590, run_date: "2025-08-07", distance_km: 50, time: "4:16:30", pace: "5:08", elevation: 68, temperature: 27, humidity: 62},
  { id: 48, name: "Lleida", order_number: 48, latitude: 41.61878, longitude: 0.57472, run_date: "2025-08-08", distance_km: 50, time: "4:14:15", pace: "5:05", elevation: 155, temperature: 26, humidity: 60},
  { id: 49, name: "Girona", order_number: 49, latitude: 41.98318, longitude: 2.82460, run_date: "2025-08-09", distance_km: 50, time: "4:12:00", pace: "5:02", elevation: 76, temperature: 25, humidity: 65},
  { id: 50, name: "Barcelona", order_number: 50, latitude: 41.3888, longitude: 2.15899, run_date: "2025-08-10", distance_km: 50, time: "4:10:00", pace: "5:00", elevation: 12, temperature: 24, humidity: 70}
];

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedCityId?: number;
}

// Global map state management
let globalMapState: MapState = {
  center: [-3.7038, 40.4168], 
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
    return citiesArray.find(city => city.id === id);
  };

  const getNextCity = (currentId: number): City | undefined => {
    const currentCity = getCityById(currentId);
    if (!currentCity) return undefined;
    
    const nextOrderNumber = currentCity.order_number + 1;
    return citiesArray.find(city => city.order_number === nextOrderNumber);
  };

  const getPreviousCity = (currentId: number): City | undefined => {
    const currentCity = getCityById(currentId);
    if (!currentCity) return undefined;
    
    const prevOrderNumber = currentCity.order_number - 1;
    return citiesArray.find(city => city.order_number === prevOrderNumber);
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
    cities: citiesArray
  };
};