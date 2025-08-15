import React, { useEffect } from 'react';
import { citiesArray } from '../hooks/useMapState';

// Helper function to convert pace string to minutes per km
const paceToMinutesPerKm = (paceStr: string): number => {
  const [minutes, seconds] = paceStr.split(':').map(Number);
  return minutes + seconds / 60;
};

const RecordsGrid: React.FC = () => {
  useEffect(() => {
    // Prepare pace data
    const paceData = citiesArray.map(city => ({
      ...city,
      paceMinutesPerKm: paceToMinutesPerKm(city.pace || '0:00'),
    }));

    // Get min/max values for records
    const maxElevation = Math.max(...paceData.map(city => city.elevation || 0));
    const bestPace = Math.min(...paceData.map(city => city.paceMinutesPerKm));
    const bestPaceCity = paceData.find(city => city.paceMinutesPerKm === bestPace);
    const maxElevationCity = paceData.find(city => city.elevation === maxElevation);

    // Populate the DOM elements
    const maxElevationCityElement = document.getElementById('max-elevation-city');
    const maxElevationValueElement = document.getElementById('max-elevation-value');
    const bestPaceCityElement = document.getElementById('best-pace-city');
    const bestPaceValueElement = document.getElementById('best-pace-value');

    if (maxElevationCityElement) {
      maxElevationCityElement.textContent = maxElevationCity?.name || 'N/A';
    }
    if (maxElevationValueElement) {
      maxElevationValueElement.textContent = `${maxElevation}m de elevación`;
    }
    if (bestPaceCityElement) {
      bestPaceCityElement.textContent = bestPaceCity?.name || 'N/A';
    }
    if (bestPaceValueElement) {
      bestPaceValueElement.textContent = `${Math.floor(bestPace)}:${String(Math.round((bestPace % 1) * 60)).padStart(2, '0')} min/km`;
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default RecordsGrid;