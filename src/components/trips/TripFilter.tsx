import React, { useState, useRef, useEffect } from "react";
import Select, { OnChangeValue, MultiValue } from "react-select";
import { SlidersHorizontal, Calendar } from "lucide-react";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { Mill, Afdeling } from "../../types/location";
import { Driver } from "../../types/driver";
import { Vehicle } from "../../types/vehicle";
import { Contractor } from "../../types/contractor";
import { TripType } from "../../types/trip-type";

const formatNumberWithCommas = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '';
    return num.toLocaleString('id-ID');
};

const parseFormattedNumber = (str: string): number | null => {
    const numericString = str.replace(/\D/g, '');
    if (numericString === '') return null;
    return parseInt(numericString, 10);
};

type SelectOption = {
    value: string | number;
    label: string;
};

interface TripFilterProps {
    mills: Mill[];
    afdelings: Afdeling[];
    drivers: Driver[];
    vehicles: Vehicle[];
    contractors: Contractor[];
    tripTypes: TripType[];
    selectedMills: MultiValue<SelectOption>;
    setSelectedMills: (value: MultiValue<SelectOption>) => void;
    selectedAfdelings: MultiValue<SelectOption>;
    setSelectedAfdelings: (value: MultiValue<SelectOption>) => void;
    selectedDrivers: MultiValue<SelectOption>;
    setSelectedDrivers: (value: MultiValue<SelectOption>) => void;
    selectedVehicles: MultiValue<SelectOption>;
    setSelectedVehicles: (value: MultiValue<SelectOption>) => void;
    selectedContractors: MultiValue<SelectOption>;
    setSelectedContractors: (value: MultiValue<SelectOption>) => void;
    selectedTripTypes: MultiValue<SelectOption>;
    setSelectedTripTypes: (value: MultiValue<SelectOption>) => void;
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
    loadWeightMin: number | null;
    setLoadWeightMin: (weight: number | null) => void;
    loadWeightMax: number | null;
    setLoadWeightMax: (weight: number | null) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
}

const TripFilter: React.FC<TripFilterProps> = (props) => {
    const {
        mills, afdelings, drivers, vehicles, contractors, tripTypes,
        selectedMills, setSelectedMills,
        selectedAfdelings, setSelectedAfdelings,
        selectedDrivers, setSelectedDrivers,
        selectedVehicles, setSelectedVehicles,
        selectedContractors, setSelectedContractors,
        selectedTripTypes, setSelectedTripTypes,
        startDate, endDate, setStartDate, setEndDate,
        loadWeightMin, setLoadWeightMin,
        loadWeightMax, setLoadWeightMax,
        onApplyFilters, onClearFilters,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ startDate: startDate ?? undefined, endDate: endDate ?? undefined, key: "selection" });
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const NULL_FILTER_VALUE = 'IS_NULL';

    const createOption = (item: { id?: number | null, name: string }): SelectOption => ({ value: item.id ?? '', label: item.name });
    const createVehicleOption = (item: { id?: number | null, licensePlatNumber: string }): SelectOption => ({ value: item.id ?? '', label: item.licensePlatNumber });

    const noMillOption: SelectOption = { value: NULL_FILTER_VALUE, label: "No Mill" };
    const noAfdelingOption: SelectOption = { value: NULL_FILTER_VALUE, label: "No Afdeling" };
    const noDriverOption: SelectOption = { value: NULL_FILTER_VALUE, label: "No Driver" };
    const noVehicleOption: SelectOption = { value: NULL_FILTER_VALUE, label: "No Vehicle" };
    const noContractorOption: SelectOption = { value: NULL_FILTER_VALUE, label: "No Contractor" };
    const noTripTypeOption: SelectOption = { value: NULL_FILTER_VALUE, label: "No Trip Type" };

    const millOptions = [noMillOption, ...mills.map(createOption)];
    const afdelingOptions = [noAfdelingOption, ...afdelings.map(createOption)];
    const driverOptions = [noDriverOption, ...drivers.map(createOption)];
    const vehicleOptions = [noVehicleOption, ...vehicles.map(createVehicleOption)];
    const contractorOptions = [noContractorOption, ...contractors.map(createOption)];
    const tripTypeOptions = [noTripTypeOption, ...tripTypes.map(createOption)];


    const handleSelectChange = (
        setter: (value: MultiValue<SelectOption>) => void,
        selectedOptions: OnChangeValue<SelectOption, true>
    ) => {
        if (!selectedOptions || selectedOptions.length === 0) {
            setter([]);
            return;
        }
        const lastSelection = selectedOptions[selectedOptions.length - 1];
        if (lastSelection.value === NULL_FILTER_VALUE) {
            setter([lastSelection]);
        } else {
            setter(selectedOptions.filter(opt => opt.value !== NULL_FILTER_VALUE));
        }
    };

    useEffect(() => {
        setDateRange({ startDate: startDate ?? undefined, endDate: endDate ?? undefined, key: "selection" });
        if (!startDate && !endDate) setActivePreset(null);
    }, [startDate, endDate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setStartDate(start);
        setEndDate(end);
        setActivePreset(`${days}`);
        setIsDatePickerOpen(false);
    };
    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        setActivePreset(null);
    };
    const handleSelect = (ranges: any) => {
        const { startDate, endDate } = ranges.selection;
        setDateRange(ranges.selection);
        setStartDate(startDate);
        setEndDate(endDate);
        setActivePreset(null);
    };
    const formatDateRange = () => {
        if (!startDate || !endDate) return "Semua Tanggal";
        return `Dari ${format(startDate, "d MMM yyyy")} - ${format(endDate, "d MMM yyyy")}`;
    };


    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all text-sm"
            >
                <SlidersHorizontal size={16} className="text-gray-600" />
                <span className="text-gray-700 font-medium">Filter</span>
            </button>

            {isOpen && (
                <div className="mt-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm animate-fade-in-down">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <div className="relative" ref={datePickerRef}>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                    className="flex items-center gap-2 bg-[#ff6908] text-white px-3 py-1.5 rounded-md hover:bg-[#e55e07] focus:outline-none focus:ring-2 focus:ring-[#ff8533] text-sm"
                                >
                                    <Calendar size={16} /> {formatDateRange()}
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => handlePreset(7)} className={`text-xs px-2.5 py-1 rounded-md border ${activePreset === '7' ? 'bg-orange-100 text-[#ff6908] border-[#ff6908]' : 'text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]'}`}>7 Hari</button>
                                    <button onClick={() => handlePreset(30)} className={`text-xs px-2.5 py-1 rounded-md border ${activePreset === '30' ? 'bg-orange-100 text-[#ff6908] border-[#ff6908]' : 'text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]'}`}>30 Hari</button>
                                    <button onClick={handleReset} className="text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-md border border-gray-300 hover:border-gray-400">Reset</button>
                                </div>
                            </div>
                            {isDatePickerOpen && (
                                <div className="absolute z-10 mt-2 bg-white shadow-lg rounded-lg border border-gray-200">
                                    <DateRangePicker
                                        ranges={[{ ...dateRange, startDate: dateRange.startDate || new Date(), endDate: dateRange.endDate || new Date() }]}
                                        onChange={handleSelect}
                                        maxDate={new Date()}
                                        showDateDisplay={false}
                                        rangeColors={["#ff6908"]}
                                        className="rounded-lg"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tipe Trip</label>
                            <Select 
                                isMulti 
                                options={tripTypeOptions} 
                                value={selectedTripTypes} 
                                onChange={(val) => setSelectedTripTypes(val as MultiValue<SelectOption>)} 
                                styles={{ control: (base) => ({ ...base, borderRadius: 8, borderColor: "#e5e7eb" }) }} 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Destination</label>
                            <Select isMulti options={millOptions} value={selectedMills} onChange={(val) => handleSelectChange(setSelectedMills, val)} styles={{ control: (base) => ({ ...base, borderRadius: 8, borderColor: "#e5e7eb" }) }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Origin</label>
                            <Select isMulti options={afdelingOptions} value={selectedAfdelings} onChange={(val) => handleSelectChange(setSelectedAfdelings, val)} styles={{ control: (base) => ({ ...base, borderRadius: 8, borderColor: "#e5e7eb" }) }} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Load Weight (kg)</label>
                            <div className="flex items-center gap-2">
                                <input type="text" inputMode="numeric" placeholder="Min" value={formatNumberWithCommas(loadWeightMin)} onChange={(e) => setLoadWeightMin(parseFormattedNumber(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm" />
                                <span className="text-gray-500">-</span>
                                <input type="text" inputMode="numeric" placeholder="Max" value={formatNumberWithCommas(loadWeightMax)} onChange={(e) => setLoadWeightMax(parseFormattedNumber(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Drivers</label>
                            <Select isMulti options={driverOptions} value={selectedDrivers} onChange={(val) => handleSelectChange(setSelectedDrivers, val)} styles={{ control: (base) => ({ ...base, borderRadius: 8, borderColor: "#e5e7eb" }) }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Vehicles</label>
                            <Select isMulti options={vehicleOptions} value={selectedVehicles} onChange={(val) => handleSelectChange(setSelectedVehicles, val)} styles={{ control: (base) => ({ ...base, borderRadius: 8, borderColor: "#e5e7eb" }) }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Contractors</label>
                            <Select isMulti options={contractorOptions} value={selectedContractors} onChange={(val) => handleSelectChange(setSelectedContractors, val)} styles={{ control: (base) => ({ ...base, borderRadius: 8, borderColor: "#e5e7eb" }) }} />
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end gap-3">
                        <button onClick={onClearFilters} className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 shadow-sm text-sm font-medium text-gray-700 transition-colors">
                            Hapus Filter
                        </button>
                        <button onClick={onApplyFilters} className="px-4 py-2 rounded-md bg-[#ff6908] text-white hover:bg-[#e55e07] shadow-sm text-sm font-medium transition-colors">
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripFilter;