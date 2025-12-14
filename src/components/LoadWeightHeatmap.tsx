
import React, { useState, useEffect } from 'react';
import { fetchHeatmapData } from '../services/api';

interface HeatmapData {
  month: number;
  day: number;
  avgLoadWeight: number;
}

const LoadWeightHeatmap: React.FC = () => {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(2025);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        setLoading(true);
        setError(null);
        const heatmapData = await fetchHeatmapData(selectedYear);
        setData(heatmapData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHeatmapData();
  }, [selectedYear]);

  const getMaxValue = () => {
    return Math.max(...data.map(item => item.avgLoadWeight));
  };

  const getIntensityColor = (value: number) => {
    if (value === 0) return '#f3f4f6';
    
    const maxValue = getMaxValue();
    const intensity = value / maxValue;
    
    const lightColor = [219, 234, 254];
    const darkColor = [30, 58, 138];
    
    const r = Math.round(lightColor[0] + (darkColor[0] - lightColor[0]) * intensity);
    const g = Math.round(lightColor[1] + (darkColor[1] - lightColor[1]) * intensity);
    const b = Math.round(lightColor[2] + (darkColor[2] - lightColor[2]) * intensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const formatWeight = (weight: number) => {
    if (weight === 0) return 'No data';
    return `${weight.toLocaleString('id-ID')} kg`;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64 text-red-600">
          Error loading heatmap: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Load Weight Heatmap</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
            Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-12 gap-2 min-w-max">
          {monthNames.map((month, monthIndex) => (
            <div key={month} className="flex flex-col items-center">
              <div className="text-xs font-medium text-gray-600 mb-2 h-4">
                {month}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getDaysInMonth(monthIndex + 1, selectedYear) }, (_, dayIndex) => {
                  const day = dayIndex + 1;
                  const dataPoint = data.find(d => d.month === monthIndex + 1 && d.day === day);
                  const value = dataPoint?.avgLoadWeight || 0;
                  
                  return (
                    <div
                      key={day}
                      className="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md"
                      style={{ backgroundColor: getIntensityColor(value) }}
                      title={`${month} ${day}, ${selectedYear}: ${formatWeight(value)}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-gray-600">
          Daily average load weight for {selectedYear}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">Less</span>
          <div className="flex space-x-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-sm"
                style={{ 
                  backgroundColor: intensity === 0 ? '#f3f4f6' : getIntensityColor(intensity * getMaxValue()) 
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">More</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs text-gray-600">Average Load</div>
          <div className="text-sm font-semibold text-gray-900">
            {Math.round(
              data.reduce((sum, d) => sum + d.avgLoadWeight, 0) / data.filter(d => d.avgLoadWeight > 0).length
            ).toLocaleString('id-ID')} kg
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Peak Load</div>
          <div className="text-sm font-semibold text-gray-900">
            {Math.round(getMaxValue()).toLocaleString('id-ID')} kg
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadWeightHeatmap;