import { useState, useRef, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import { CalendarRange, RefreshCcw } from 'lucide-react';
import { Contractor } from '../../../types/contractor';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface ContractorFilterProps {
  contractors: Contractor[];
  onFilterChange: (startDate: Date | null, endDate: Date | null, contractorIds?: number[]) => void;
}

export default function ContractorFilter({ onFilterChange }: ContractorFilterProps) {
  const [dateRange, setDateRange] = useState<any>([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleDateChange = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
    onFilterChange(startDate, endDate);

    if (startDate && endDate) {
      setShowPicker(false);
    }
  };

  const handleReset = () => {
    const resetRange = {
      startDate: null,
      endDate: null,
      key: 'selection',
    };
    setDateRange([resetRange]);
    onFilterChange(null, null);
    setShowPicker(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none text-sm"
          >
            <CalendarRange size={18} className="text-gray-500" />
            {dateRange[0].startDate && dateRange[0].endDate ? (
              <span>
                {formatDate(dateRange[0].startDate)} - {formatDate(dateRange[0].endDate)}
              </span>
            ) : (
              <span className="text-gray-400">Pilih rentang tanggal</span>
            )}
          </button>

          {showPicker && (
            <div ref={pickerRef} className="absolute z-50 mt-2 shadow-lg">
              <DateRangePicker
                onChange={handleDateChange}
                moveRangeOnFirstSelection={false}
                months={1}
                direction="vertical"
                ranges={dateRange}
                editableDateInputs={true}
                rangeColors={['#6366f1']}
              />
            </div>
          )}
        </div>

        <div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw size={18} className="text-gray-500" />
            <span className="text-sm font-medium">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
