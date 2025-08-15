import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { citiesArray } from '../hooks/useMapState';

// Helper functions
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 60 + minutes + seconds / 60;
};

const paceToMinutesPerKm = (paceStr: string): number => {
  const [minutes, seconds] = paceStr.split(':').map(Number);
  return minutes + seconds / 60;
};

// Prepare data for charts
const prepareChartData = () => {
  return citiesArray.map(city => ({
    ...city,
    timeMinutes: timeToMinutes(city.time || '0:00:00'),
    paceMinutesPerKm: paceToMinutesPerKm(city.pace || '0:00'),
    orderNumber: city.order_number
  }));
};

// Calculate average values
const calculateAverages = () => {
  const data = prepareChartData();
  const distances = data.filter(city => city.distance).map(city => city.distance!);
  const times = data.filter(city => city.time).map(city => city.timeMinutes);
  const paces = data.filter(city => city.pace).map(city => city.paceMinutesPerKm);
  const elevations = data.filter(city => city.elevation).map(city => city.elevation!);
  
  return {
    avgDistance: distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0,
    avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    avgPace: paces.length > 0 ? paces.reduce((a, b) => a + b, 0) / paces.length : 0,
    avgElevation: elevations.length > 0 ? elevations.reduce((a, b) => a + b, 0) / elevations.length : 0,
  };
};

// Get pace color for heatmap based on performance
const getPaceColor = (pace: number, minPace: number, maxPace: number) => {
  const normalizedPace = (pace - minPace) / (maxPace - minPace);
  
  if (normalizedPace < 0.2) return '#10B981'; // Green - excellent
  if (normalizedPace < 0.4) return '#F59E0B'; // Yellow - good
  if (normalizedPace < 0.6) return '#FF8C00'; // Orange - average
  if (normalizedPace < 0.8) return '#EF4444'; // Red - poor
  return '#7F1D1D'; // Dark red - very poor
};

const SimplifiedStatsCharts: React.FC = () => {
  const chartData = prepareChartData();
  const averages = calculateAverages();
  
  // Get min/max values for records
  const maxElevation = Math.max(...chartData.map(city => city.elevation || 0));
  const bestPace = Math.min(...chartData.map(city => city.paceMinutesPerKm));
  const bestPaceCity = chartData.find(city => city.paceMinutesPerKm === bestPace);
  const maxElevationCity = chartData.find(city => city.elevation === maxElevation);
  
  // For pace heatmap
  const minPace = Math.min(...chartData.map(city => city.paceMinutesPerKm));
  const maxPaceValue = Math.max(...chartData.map(city => city.paceMinutesPerKm));

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Valores Promedios */}
      <div className="bg-black/60 rounded-xl md:rounded-2xl border border-gray-800/40 p-4 md:p-8 backdrop-blur-sm shadow-xl shadow-black/60">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full mr-2 md:mr-3"></div>
          Valores Promedios
        </h3>
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          <div className="text-center p-3 md:p-0">
            <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
              {averages.avgDistance.toFixed(1)}
            </div>
            <div className="text-xs md:text-sm text-gray-300">Distancia Media (km)</div>
          </div>
          <div className="text-center p-3 md:p-0">
            <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
              {Math.floor(averages.avgTime / 60)}:{String(Math.round(averages.avgTime % 60)).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm text-gray-300">Tiempo Medio</div>
          </div>
          <div className="text-center p-3 md:p-0">
            <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
              {Math.floor(averages.avgPace)}:{String(Math.round((averages.avgPace % 1) * 60)).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm text-gray-300">Ritmo Medio</div>
          </div>
          <div className="text-center p-3 md:p-0">
            <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
              {Math.round(averages.avgElevation)}
            </div>
            <div className="text-xs md:text-sm text-gray-300">Elevación Media (m)</div>
          </div>
        </div>
      </div>

      {/* Gráfica de la Elevación */}
      <div className="bg-black/60 rounded-xl md:rounded-2xl border border-gray-800/40 p-4 md:p-8 backdrop-blur-sm shadow-xl shadow-black/60">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full mr-2 md:mr-3"></div>
          Gráfica de la Elevación
        </h3>
        <div className="h-64 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF8C00" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="orderNumber" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#9CA3AF' }}
                axisLine={{ stroke: '#9CA3AF' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#9CA3AF' }}
                axisLine={{ stroke: '#9CA3AF' }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                  fontSize: '14px'
                }}
                formatter={(value: any) => [`${value}m`, 'Elevación']}
                labelFormatter={(label) => `Ciudad ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="#FF8C00" 
                strokeWidth={2}
                fill="url(#elevationGradient)"
                dot={false}
                activeDot={{ fill: '#FF8C00', strokeWidth: 2, r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Gráfica de Tiempos */}
      <div className="bg-black/60 rounded-xl md:rounded-2xl border border-gray-800/40 p-4 md:p-8 backdrop-blur-sm shadow-xl shadow-black/60">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full mr-2 md:mr-3"></div>
          Gráfica de Tiempos
        </h3>
        <div className="h-64 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="orderNumber" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#9CA3AF' }}
                axisLine={{ stroke: '#9CA3AF' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#9CA3AF' }}
                axisLine={{ stroke: '#9CA3AF' }}
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                  fontSize: '14px'
                }}
                formatter={(value: any) => [
                  `${Math.floor(value / 60)}:${String(Math.round(value % 60)).padStart(2, '0')}`,
                  'Tiempo'
                ]}
                labelFormatter={(label) => `Ciudad ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="timeMinutes" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlación Elevación-Ritmo */}
      <div className="bg-black/60 rounded-xl md:rounded-2xl border border-gray-800/40 p-4 md:p-8 backdrop-blur-sm shadow-xl shadow-black/60">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full mr-2 md:mr-3"></div>
          Correlación Elevación-Ritmo
        </h3>
        <div className="h-64 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="elevation" 
                name="Elevación"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#9CA3AF' }}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <YAxis 
                type="number" 
                dataKey="paceMinutesPerKm" 
                name="Ritmo"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#9CA3AF' }}
                axisLine={{ stroke: '#9CA3AF' }}
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                  fontSize: '14px'
                }}
                formatter={(value: any, name: string) => [
                  name === 'elevation' ? `${value}m` : `${Math.floor(value)}:${String(Math.round((value % 1) * 60)).padStart(2, '0')}`,
                  name === 'elevation' ? 'Elevación' : 'Ritmo'
                ]}
              />
              <Scatter 
                name="Ciudades" 
                data={chartData.filter(city => city.elevation && city.paceMinutesPerKm)} 
                fill="#FF8C00"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default SimplifiedStatsCharts;