import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

interface HeatmapChartProps {
  data: {
    day: number;
    month: number;
    avgLoadWeight: number;
  }[];
  year: number;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, year }) => {
  const parsedData = data.map(item => ({
    date: `${year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`,
    count: item.avgLoadWeight === 0 ? null : item.avgLoadWeight,
  }));

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Average Load Weight Heatmap</h2>
      <CalendarHeatmap
        startDate={new Date(`${year}-01-01`)}
        endDate={new Date(`${year}-12-31`)}
        values={parsedData}
        classForValue={(value) => {
          if (!value || value.count === null) return 'color-empty';
          if (value.count < 1000) return 'color-scale-1';
          if (value.count < 5000) return 'color-scale-2';
          if (value.count < 7500) return 'color-scale-3';
          return 'color-scale-4';
        }}
        tooltipDataAttrs={(value) => {
          if (!value?.date) return {};
          
          return {
            'data-tooltip': `${value.date} — ${value.count ?? 0} kg`,
          } as any;
        }}
        showWeekdayLabels
      />
    </div>
  );
};

export default HeatmapChart;