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
  const distances = data.filter(city => city.distance_km).map(city => city.distance_km!);
  const times = data.filter(city => city.time).map(city => city.timeMinutes);
  const paces = data.filter(city => city.pace).map(city => city.paceMinutesPerKm);
  const elevations = data.filter(city => city.elevation).map(city => city.elevation!);
  const humidity = data.filter(city => city.humidity).map(city => city.humidity!);
  
  return {
    avgDistance: distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0,
    avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    avgPace: paces.length > 0 ? paces.reduce((a, b) => a + b, 0) / paces.length : 0,
    avgElevation: elevations.length > 0 ? elevations.reduce((a, b) => a + b, 0) / elevations.length : 0,
    avgHumidity: humidity.length > 0 ? humidity.reduce((a, b) => a + b, 0) / humidity.length : 0,
  };
};

const SimplifiedStatsCharts: React.FC = () => {
  const chartData = prepareChartData();
  const averages = calculateAverages();
  
  // CSS to remove chart focus outline
  const chartStyle = {
    outline: 'none',
    border: 'none'
  } as React.CSSProperties;
  
  // Get min/max values for records
  const maxElevation = Math.max(...chartData.map(city => city.elevation || 0));
  const bestPace = Math.min(...chartData.map(city => city.paceMinutesPerKm));
  const bestPaceCity = chartData.find(city => city.paceMinutesPerKm === bestPace);
  const maxElevationCity = chartData.find(city => city.elevation === maxElevation);
  
  // For pace heatmap
  const minPace = Math.min(...chartData.map(city => city.paceMinutesPerKm));
  const maxPaceValue = Math.max(...chartData.map(city => city.paceMinutesPerKm));

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* Valores Promedios */}
      <div className="bg-black/60 rounded-xl md:rounded-2xl border border-gray-800/40 p-4 md:p-8 backdrop-blur-sm shadow-xl shadow-black/60">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full mr-2 md:mr-3"></div>
          Valores Promedios
        </h3>
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          <div className="text-center p-3 md:p-0">
            <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
              {Math.floor(averages.avgTime / 60)}h {String(Math.round(averages.avgTime % 60)).padStart(2, '0')}min
            </div>
            <div className="text-xs md:text-sm text-gray-300">Tiempo Medio</div>
          </div>
          <div className="text-center p-3 md:p-0">
            <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
              {Math.floor(averages.avgPace)}:{String(Math.round((averages.avgPace % 1) * 60)).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm text-gray-300">Ritmo Medio (min/km)</div>
          </div>
          <div className="text-center p-3 md:p-0">
            <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
              {Math.round(averages.avgElevation)}
            </div>
            <div className="text-xs md:text-sm text-gray-300">Desnivel Medio (m)</div>
          </div>
          <div className="text-center p-3 md:p-0">
            <div className="text-xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
              {averages.avgHumidity.toFixed(1)}%
            </div>
            <div className="text-xs md:text-sm text-gray-300">Humedad Media</div>
          </div>
        </div>
      </div>

      {/* Gráfica de Tiempos */}
      <div className="bg-black/60 rounded-xl md:rounded-2xl border border-gray-800/40 p-4 md:p-8 backdrop-blur-sm shadow-xl shadow-black/60">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full mr-2 md:mr-3"></div>
          Gráfica de Tiempos
        </h3>
        <div className="h-64 md:h-96 [&_*]:!outline-none [&_*]:!border-0">
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
                  backgroundColor: '#374151', 
                  border: '1px solid #4B5563',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                }}
                formatter={(value: any) => [
                  `${Math.floor(value / 60)}:${String(Math.round(value % 60)).padStart(2, '0')}`,
                  'Tiempo'
                ]}
                labelFormatter={(label) => {
                  const city = chartData.find(c => c.orderNumber === label);
                  return city ? city.name : `Ciudad ${label}`;
                }}
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

      {/* Gráfica de la Elevación */}
      <div className="bg-black/60 rounded-xl md:rounded-2xl border border-gray-800/40 p-4 md:p-8 backdrop-blur-sm shadow-xl shadow-black/60">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full mr-2 md:mr-3"></div>
          Gráfica del desnivel
        </h3>
        <div className="h-64 md:h-96 [&_*]:!outline-none [&_*]:!border-0">
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
                  backgroundColor: '#374151', 
                  border: '1px solid #4B5563',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                }}
                formatter={(value: any) => [`${value}m`, 'Elevación']}
                labelFormatter={(label) => {
                  const city = chartData.find(c => c.orderNumber === label);
                  return city ? city.name : `Ciudad ${label}`;
                }}
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

      {/* Correlación Elevación-Ritmo */}
      <div className="bg-black/60 rounded-xl md:rounded-2xl border border-gray-800/40 p-4 md:p-8 backdrop-blur-sm shadow-xl shadow-black/60">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full mr-2 md:mr-3"></div>
          Correlación Desnivel-Ritmo
        </h3>
        <div className="h-64 md:h-96 [&_*]:!outline-none [&_*]:!border-0">
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
                  backgroundColor: '#374151 !important', 
                  border: '1px solid #4B5563 !important',
                  borderRadius: '12px !important',
                  color: '#FFFFFF !important',
                  fontSize: '14px !important',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3) !important',
                  zIndex: 1000
                }}
                content={(props) => {
                  if (props.active && props.payload && props.payload[0]) {
                    const data = props.payload[0].payload;
                    return (
                      <div style={{
                        backgroundColor: '#374151',
                        border: '1px solid #4B5563',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        padding: '8px 12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                      }}>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{data.name}</p>
                        <p style={{ margin: '2px 0', color: '#FF8C00' }}>Desnivel: {data.elevation}m</p>
                        <p style={{ margin: '2px 0', color: '#3B82F6' }}>
                          Ritmo: {Math.floor(data.paceMinutesPerKm)}:{String(Math.round((data.paceMinutesPerKm % 1) * 60)).padStart(2, '0')} min/km
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
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