import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { citiesArray } from '../hooks/useMapState';

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 60 + minutes + seconds / 60;
};

// Helper function to convert pace string to minutes per km
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

// Calculate statistics
const calculateStats = () => {
  const data = prepareChartData();
  const temperatures = data.filter(city => city.temperature).map(city => city.temperature!);
  const humidities = data.filter(city => city.humidity).map(city => city.humidity!);
  const elevations = data.filter(city => city.elevation).map(city => city.elevation!);
  
  return {
    avgTemperature: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
    avgHumidity: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0,
    avgElevation: elevations.length > 0 ? elevations.reduce((a, b) => a + b, 0) / elevations.length : 0,
    maxTemperature: Math.max(...temperatures),
    minTemperature: Math.min(...temperatures),
    maxHumidity: Math.max(...humidities),
    minHumidity: Math.min(...humidities)
  };
};

// Color palette for charts
const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const StatsCharts: React.FC = () => {
  const chartData = prepareChartData();
  const stats = calculateStats();

  return (
    <div className="space-y-12">
      {/* Performance Over Time Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Rendimiento a lo largo del tiempo</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="orderNumber" 
              label={{ value: 'Orden de Ciudad', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Tiempo (minutos)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              label={{ value: 'Pace (min/km)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'timeMinutes' ? `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}` : value,
                name === 'timeMinutes' ? 'Tiempo' : name === 'paceMinutesPerKm' ? 'Pace' : name
              ]}
              labelFormatter={(label) => `Ciudad ${label}`}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="timeMinutes" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Tiempo"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="paceMinutesPerKm" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Pace"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Temperature and Humidity Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Temperatura y Humedad por Ciudad</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="orderNumber" 
              label={{ value: 'Orden de Ciudad', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              label={{ value: 'Humedad (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'temperature' ? `${value}°C` : `${value}%`,
                name === 'temperature' ? 'Temperatura' : 'Humedad'
              ]}
              labelFormatter={(label) => `Ciudad ${label}`}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="temperature" 
              stackId="1"
              stroke="#F59E0B" 
              fill="#FEF3C7"
              name="Temperatura"
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="humidity" 
              stackId="2"
              stroke="#06B6D4" 
              fill="#CFFAFE"
              name="Humedad"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Elevation Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Elevación por Ciudad</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="orderNumber" 
              label={{ value: 'Orden de Ciudad', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Elevación (metros)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any) => [`${value}m`, 'Elevación']}
              labelFormatter={(label) => `Ciudad ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="elevation" 
              fill="#8B5CF6"
              name="Elevación"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Time Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribución de Tiempos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="orderNumber" 
                label={{ value: 'Orden de Ciudad', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Tiempo (minutos)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any) => [
                  `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`,
                  'Tiempo'
                ]}
                labelFormatter={(label) => `Ciudad ${label}`}
              />
              <Bar 
                dataKey="timeMinutes" 
                fill="#EF4444"
                name="Tiempo"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pace Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribución de Pace</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="orderNumber" 
                label={{ value: 'Orden de Ciudad', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any) => [
                  `${Math.floor(value)}:${String(Math.round((value % 1) * 60)).padStart(2, '0')}`,
                  'Pace'
                ]}
                labelFormatter={(label) => `Ciudad ${label}`}
              />
              <Bar 
                dataKey="paceMinutesPerKm" 
                fill="#84CC16"
                name="Pace"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weather Correlation */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Correlación Temperatura vs Humedad</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="temperature" 
              name="Temperatura"
              label={{ value: 'Temperatura (°C)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="number" 
              dataKey="humidity" 
              name="Humedad"
              label={{ value: 'Humedad (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'temperature' ? `${value}°C` : `${value}%`,
                name === 'temperature' ? 'Temperatura' : 'Humedad'
              ]}
            />
            <Legend />
            <Scatter 
              name="Ciudades" 
              data={chartData.filter(city => city.temperature && city.humidity)} 
              fill="#6366F1"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">Mejor Tiempo</h4>
          <div className="text-3xl font-bold text-blue-600">
            {(() => {
              const bestTime = Math.min(...chartData.map(city => city.timeMinutes));
              const city = chartData.find(city => city.timeMinutes === bestTime);
              return city ? city.name : 'N/A';
            })()}
          </div>
          <p className="text-blue-600 text-sm">
            {(() => {
              const bestTime = Math.min(...chartData.map(city => city.timeMinutes));
              return `${Math.floor(bestTime / 60)}:${String(bestTime % 60).padStart(2, '0')}`;
            })()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-2">Mejor Pace</h4>
          <div className="text-3xl font-bold text-green-600">
            {(() => {
              const bestPace = Math.min(...chartData.map(city => city.paceMinutesPerKm));
              const city = chartData.find(city => city.paceMinutesPerKm === bestPace);
              return city ? city.name : 'N/A';
            })()}
          </div>
          <p className="text-green-600 text-sm">
            {(() => {
              const bestPace = Math.min(...chartData.map(city => city.paceMinutesPerKm));
              return `${Math.floor(bestPace)}:${String(Math.round((bestPace % 1) * 60)).padStart(2, '0')}`;
            })()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-purple-800 mb-2">Mayor Elevación</h4>
          <div className="text-3xl font-bold text-purple-600">
            {(() => {
              const maxElevation = Math.max(...chartData.map(city => city.elevation || 0));
              const city = chartData.find(city => city.elevation === maxElevation);
              return city ? city.name : 'N/A';
            })()}
          </div>
          <p className="text-purple-600 text-sm">
            {(() => {
              const maxElevation = Math.max(...chartData.map(city => city.elevation || 0));
              return `${maxElevation}m`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCharts;
