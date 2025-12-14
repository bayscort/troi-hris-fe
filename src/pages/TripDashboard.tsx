import React, { useState, useEffect, useRef } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import ProfitLossChart from '../components/ProfitLossChart';
import { fetchDashboardData, fetchProfitLossPerDay } from '../services/api';
import LoadWeightHeatmap from '../components/LoadWeightHeatmap';
import { format } from 'date-fns';
import { formatCompactNumber } from '../utils/formatters';


interface ProfitLossPerDay {
  date: string;
  totalProfitLoss: number;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfitLosses: 0,
    revenueChangePercentage: 0,
    expenseChangePercentage: 0,
    profitLossChangePercentage: 0,
  });

  const [profitLossData, setProfitLossData] = useState<ProfitLossPerDay[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    key: 'selection',
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const startDateStr = dateRange.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : undefined;
        const endDateStr = dateRange.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : undefined;

        const [dashboardRes, profitLossRes] = await Promise.all([
          fetchDashboardData(startDateStr, endDateStr),
          fetchProfitLossPerDay(startDateStr, endDateStr),
        ]);

        setDashboardData({
          totalRevenue: dashboardRes.totalRevenue,
          totalExpenses: dashboardRes.totalExpenses,
          totalProfitLosses: dashboardRes.totalProfitLosses,
          revenueChangePercentage: dashboardRes.revenueChangePercentage,
          expenseChangePercentage: dashboardRes.expenseChangePercentage,
          profitLossChangePercentage: dashboardRes.profitLossChangePercentage,
        });

        setProfitLossData(profitLossRes);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dateRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({
      startDate: start,
      endDate: end,
      key: 'selection',
    });
    setActivePreset(`${days}`);
    setIsPickerOpen(false);
  };

  const handleReset = () => {
    setDateRange({
      startDate: undefined,
      endDate: undefined,
      key: 'selection',
    });
    setActivePreset(null);
    setIsPickerOpen(false);
  };

  const handleSelect = (ranges: any) => {
    if (ranges.selection.endDate < ranges.selection.startDate) {
      ranges.selection.endDate = ranges.selection.startDate;
    }
    setDateRange(ranges.selection);
    setActivePreset(null);
  };

  const formatDateRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return 'Semua Tanggal';
    }
    return `Dari ${dateRange.startDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} - ${dateRange.endDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;
  };

  if (loading) return <div className="text-center text-gray-600">Memuat...</div>;
  if (error) return <div className="text-center text-red-600">Error: {error}</div>;

  return (
    <div className="w-full bg-gray-50">
      <Header />

      <div className="px-8 pb-8">
        <div className="mb-6 relative" ref={pickerRef}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07] focus:outline-none focus:ring-2 focus:ring-[#ff8533]"
            >
              {formatDateRange()}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handlePreset(7)}
                className={`text-sm px-3 py-1 rounded-md border border-gray-300 ${activePreset === '7'
                  ? 'bg-[#ff8533] text-white border-[#ff6908]'
                  : 'text-gray-600 hover:text-[#ff6908] hover:border-[#ff6908]'
                  }`}
              >
                7 Hari Terakhir
              </button>
              <button
                onClick={() => handlePreset(30)}
                className={`text-sm px-3 py-1 rounded-md border border-gray-300 ${activePreset === '30'
                  ? 'bg-[#ff8533] text-white border-[#ff6908]'
                  : 'text-gray-600 hover:text-[#ff6908] hover:border-[#ff6908]'
                  }`}
              >
                30 Hari Terakhir
              </button>
              <button
                onClick={() => {
                  const start = new Date();
                  start.setDate(1);
                  setDateRange({ startDate: start, endDate: new Date(), key: 'selection' });
                  setActivePreset('month');
                  setIsPickerOpen(false);
                }}
                className={`text-sm px-3 py-1 rounded-md border border-gray-300 ${activePreset === 'month'
                  ? 'bg-[#ff8533] text-white border-[#ff6908]'
                  : 'text-gray-600 hover:text-[#ff6908] hover:border-[#ff6908]'
                  }`}
              >
                Bulan Ini
              </button>
              <button
                onClick={handleReset}
                className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:text-[#ff6908] hover:border-[#ff6908]"
              >
                Reset
              </button>
            </div>
          </div>
          {isPickerOpen && (
            <div className="absolute z-10 mt-2 bg-white shadow-lg rounded-md border border-gray-200">
              <DateRangePicker
                ranges={[{
                  ...dateRange,
                  startDate: dateRange.startDate ?? undefined,
                  endDate: dateRange.endDate ?? undefined,
                }]}
                onChange={handleSelect}
                maxDate={new Date()}
                showDateDisplay={false}
                rangeColors={['#ff6908']}
                className="rounded-md"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <MetricCard
            title="Total Pendapatan"
            fullValue={(dashboardData.totalRevenue ?? 0).toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
            value={`Rp ${formatCompactNumber(dashboardData.totalRevenue ?? 0)}`}
            valueClassName="text-m font-semibold"
            percentageChange={dashboardData?.revenueChangePercentage ?? 0}
            dateRange={formatDateRange()}
          />

          <MetricCard
            title="Total Pengeluaran"
            fullValue={(dashboardData.totalExpenses ?? 0).toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
            value={`Rp ${formatCompactNumber(dashboardData.totalExpenses ?? 0)}`}
            valueClassName="text-m font-semibold"
            percentageChange={dashboardData?.expenseChangePercentage ?? 0}
            dateRange={formatDateRange()}
          />

          <MetricCard
            title="Total Laba/Rugi"
            fullValue={(dashboardData.totalProfitLosses ?? 0).toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
            })}
            value={`Rp ${formatCompactNumber(Math.abs(dashboardData.totalProfitLosses ?? 0))}`}
            valueClassName="text-m font-semibold"
            percentageChange={dashboardData?.profitLossChangePercentage ?? 0}
            dateRange={formatDateRange()}
          />
        </div>
        <div className="mb-6">
          <ProfitLossChart data={profitLossData} />
        </div>
        <div className="mb-6">
          <LoadWeightHeatmap />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;