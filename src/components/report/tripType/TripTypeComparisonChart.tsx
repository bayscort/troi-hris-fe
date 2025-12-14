import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { TripTypeSummary } from '../../../types/trip-type';

interface TripTypeComparisonChartProps {
  summaries: TripTypeSummary[];
}

const COLORS: Record<string, string> = {
  profitLoss: '#fb923c',
  totalTrips: '#60a5fa',
  totalRevenue: '#34d399',
  totalExpenses: '#f87171',
  totalLoad: '#AB47BC',
};

const LABELS: Record<string, string> = {
  profitLoss: 'Profit / Loss',
  totalTrips: 'Total Trips',
  totalRevenue: 'Total Revenue',
  totalExpenses: 'Total Expenses',
  totalLoad: 'Total Load (ton)',
};

const formatCompactNumber = (value: number): string => {
  const formatter = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return formatter.format(value);
};

const formatFullCurrency = (value: number): string => {
  return value.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });
};

const formatTon = (value: number): string => {
  return value.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' t';
};

export default function TripTypeComparisonChart({ summaries }: TripTypeComparisonChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<string[]>(['profitLoss']);

  if (summaries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-muted p-8 h-64 flex items-center justify-center shadow-sm">
        <p className="text-sm text-gray-400 italic">Please select trip types to compare</p>
      </div>
    );
  }

  const toggleMetric = (metric: string) => {
    setActiveMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const data = summaries.map((summary) => ({
    name: summary.tripType.name,
    profitLoss: summary.profitLoss,
    totalRevenue: summary.totalRevenue,
    totalExpenses: summary.totalExpenses,
    totalTrips: summary.totalTrips,
    totalLoad: Number((summary.totalLoad / 1000).toFixed(2)),
    profitLossFormatted: `Rp ${formatCompactNumber(summary.profitLoss)}`,
    totalRevenueFormatted: `Rp ${formatCompactNumber(summary.totalRevenue)}`,
    totalExpensesFormatted: `Rp ${formatCompactNumber(summary.totalExpenses)}`,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm space-y-1">
        <div className="font-medium text-gray-700">{label}</div>
        {payload.map((item: any) => (
          <div key={item.dataKey} className="flex justify-between items-center text-gray-600 gap-4">
            <span className="font-medium" style={{ color: item.fill }}>
              {LABELS[item.dataKey] || item.dataKey}
            </span>
            <span className="font-semibold text-gray-800">
              {item.dataKey === 'totalTrips'
                ? item.value
                : item.dataKey === 'totalLoad'
                  ? formatTon(item.value)
                  : formatFullCurrency(item.value)
              }
            </span>
          </div>
        ))}
      </div>
    );
  };
    
  const yAxisLabel = () => {
    if (activeMetrics.length === 1 && activeMetrics[0] === 'totalLoad') {
      return 'Jumlah (ton)';
    }
    if (activeMetrics.length === 1 && activeMetrics[0] === 'totalTrips') {
      return 'Jumlah Trips';
    }
    return 'Jumlah (IDR)';
  };

  return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-4 space-y-2">
          <h2 className="text-base font-semibold text-gray-700">Trip Type Comparison Chart</h2>
          <div className="flex flex-wrap gap-2 pt-2">
            {Object.keys(LABELS).map((metric) => {
              const isActive = activeMetrics.includes(metric);
              return (
                <button
                  key={metric}
                  onClick={() => toggleMetric(metric)}
                  className={`px-4 py-1 rounded-full text-xs border transition ${isActive
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {LABELS[metric]}
                </button>
              );
            })}
          </div>
        </div>
  
        {activeMetrics.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-gray-400 italic">
            Please select at least one metric
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 20, bottom: 10 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCompactNumber(value as number)}
                label={{
                  value: yAxisLabel(),
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#9ca3af', fontSize: 12 },
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              {activeMetrics.map((metric) => (
                <Bar
                  key={metric}
                  dataKey={metric}
                  fill={COLORS[metric]}
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList
                    dataKey={
                      ['profitLoss', 'totalRevenue', 'totalExpenses'].includes(metric)
                        ? `${metric}Formatted`
                        : metric
                    }
                    position="top"
                    style={{ fill: '#374151', fontSize: 12 }}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    );
}