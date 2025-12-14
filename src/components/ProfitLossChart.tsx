import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface Props {
  data: {
    date: string;
    totalProfitLoss: number;
  }[];
}

const ProfitLossChart: React.FC<Props> = ({ data }) => {
  const minValue = Math.min(...data.map((d) => d.totalProfitLoss), 0);
  const maxValue = Math.max(...data.map((d) => d.totalProfitLoss), 0);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Grafik Laba/Rugi Harian</h2>
        <p className="text-sm text-gray-500 text-center">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Grafik Laba/Rugi Harian</h2>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
              })
            }
          />
          <YAxis
            width={100}
            domain={[minValue * 1.1, maxValue * 1.1]}
            tickFormatter={(value) =>
              new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(value)
            }
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              fontSize: '13px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              padding: '10px 12px',
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
              }).format(value)
            }
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            }
            cursor={{ stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '3 3' }}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{ fontSize: '13px', color: '#4b5563' }}
          />
          <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="totalProfitLoss"
            name="Laba/Rugi"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: '#fff', stroke: '#10b981', strokeWidth: 1.5 }}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={800}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitLossChart;
