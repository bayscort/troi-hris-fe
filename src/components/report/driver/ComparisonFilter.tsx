import { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import { DateRangePicker } from 'react-date-range';
import { CalendarRange, Filter, RefreshCcw } from 'lucide-react';
import { Driver } from '../../../types/driver';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface ComparisonFilterProps {
  drivers: Driver[];
  onFilterChange: (startDate: Date | null, endDate: Date | null, driverIds: number[]) => void;
}

interface DriverOption {
  value: number;
  label: string;
}

export default function ComparisonFilter({ drivers, onFilterChange }: ComparisonFilterProps) {
  const [selectedDrivers, setSelectedDrivers] = useState<DriverOption[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<any>([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);

  const driverOptions: DriverOption[] = drivers
    .filter(driver => driver.id !== undefined)
    .map(driver => ({
      value: driver.id as number,
      label: driver.name,
    }));

  const handleDriverChange = (selectedOptions: any) => {
    const options = selectedOptions as DriverOption[];
    setSelectedDrivers(options);
    const { startDate, endDate } = dateRange[0];
    onFilterChange(startDate, endDate, options.map(option => option.value));
  };

  const handleDateChange = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    const updated = [ranges.selection];
    setDateRange(updated);
    if (startDate && endDate) {
      onFilterChange(startDate, endDate, selectedDrivers.map(v => v.value));
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
    setSelectedDrivers([]);
    onFilterChange(null, null, []);
    setShowPicker(false);
  };

  const formatDate = (date: Date | null) =>
    date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) : '';

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
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-4 items-end">
        <div className="flex flex-col gap-1 relative w-full max-w-xs">
          <label className="text-sm font-medium text-gray-700">Date Range</label>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm w-full text-left"
          >
            <CalendarRange size={18} className="text-gray-500" />
            {dateRange[0].startDate && dateRange[0].endDate ? (
              <span>
                {formatDate(dateRange[0].startDate)} – {formatDate(dateRange[0].endDate)}
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
                ranges={dateRange}
                months={1}
                direction="vertical"
                editableDateInputs={true}
                rangeColors={['#6366f1']}
              />
            </div>
          )}
        </div>

        <div className="w-full">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Select Drivers to Compare</label>
          <div className="relative">
            <Select
              isMulti
              name="drivers"
              options={driverOptions}
              value={selectedDrivers}
              onChange={handleDriverChange}
              placeholder="Select drivers..."
              classNamePrefix="select"
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: '0.5rem',
                  padding: '0.1rem',
                  boxShadow: 'none',
                  borderColor: '#e5e7eb',
                  paddingLeft: '2.5rem',
                  '&:hover': {
                    borderColor: '#d1d5db'
                  }
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: '#EEF2FF',
                  borderRadius: '0.25rem'
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: '#ff6908'
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: '#ff6908',
                  '&:hover': {
                    backgroundColor: '#E0E7FF',
                    color: '#4338CA'
                  }
                })
              }}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <Filter size={18} />
            </div>
          </div>
        </div>


        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCcw size={18} className="text-gray-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
