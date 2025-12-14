import React from 'react';
import { Squircle } from 'lucide-react';

interface HeatmapCellProps {
  value: number;
  max: number;
}

const HeatmapCell: React.FC<HeatmapCellProps> = ({ value, max }) => {
  const intensity = value / max;
  const getColor = () => {
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 0.2) return 'bg-[#ff8533]';
    if (intensity < 0.4) return 'bg-[#ff8533]';
    if (intensity < 0.6) return 'bg-[#ff6908]';
    if (intensity < 0.8) return 'bg-[#ffa257]';
    return 'bg-[#ff832f]';
  };

  return (
    <div 
      className={`${getColor()} w-10 h-10 rounded-md flex items-center justify-center relative group cursor-pointer`}
    >
      {value > 0 && (
        <div className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 -top-8">
          {value} orders
        </div>
      )}
      {value > 200 && (
        <span className="text-xs text-white font-medium">{value}</span>
      )}
    </div>
  );
};

const OrdersHeatmap = () => {
  const heatmapData = [
    { time: '9am', days: [0, 0, 0, 0, 0, 0, 0] },
    { time: '10am', days: [0, 10, 20, 30, 10, 0, 0] },
    { time: '11am', days: [20, 40, 60, 120, 60, 30, 20] },
    { time: '12pm', days: [40, 100, 180, 250, 150, 80, 40] },
    { time: '1pm', days: [60, 120, 200, 230, 180, 100, 60] },
    { time: '2pm', days: [40, 80, 150, 180, 120, 60, 30] },
    { time: '3pm', days: [20, 40, 90, 120, 80, 40, 20] },
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxValue = 250;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-800 font-medium">Orders by time</h3>
        <div className="flex items-center text-xs text-gray-500">
          <div className="mr-2 flex items-center">
            <span className="inline-block w-2 h-2 bg-gray-100 mr-1"></span>
            <span>0</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-[#ff832f] mr-1"></span>
            <span>2500</span>
          </div>
          <button className="ml-4">
            <Squircle size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="flex flex-col justify-between mr-2">
          {heatmapData.map((row, i) => (
            <div key={i} className="h-10 flex items-center text-sm text-gray-500">{row.time}</div>
          ))}
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-7 gap-2">
            {heatmapData.map((row, rowIndex) => (
              row.days.map((value, colIndex) => (
                <HeatmapCell 
                  key={`${rowIndex}-${colIndex}`} 
                  value={value} 
                  max={maxValue} 
                />
              ))
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {daysOfWeek.map((day, i) => (
              <div key={i} className="text-xs text-gray-500 text-center">{day}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersHeatmap;
