import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { CircleAlert, Info, Loader, Save, X, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { tripService, referenceService } from '../../services/api';
import { Trip, TripCreateDto } from '../../types/trip';
import { Mill, Estate, Afdeling } from '../../types/location';
import { Driver } from '../../types/driver';
import { Vehicle } from '../../types/vehicle';
import { Contractor } from '../../types/contractor';
import { ActionMeta, SingleValue } from 'react-select';
import { TripType } from '../../types/trip-type';


interface TripFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  trip?: Trip;
}

const formatNumberWithSeparators = (value: string): string => {
  const cleanValue = value.replace(/[^0-9-]/g, '');
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumber = (value: string): number => {
  return parseFloat(value.replace(/[^0-9-]/g, '')) || 0;
};

const TripForm: React.FC<TripFormProps> = ({ isOpen, onClose, onSave, trip }) => {
  const [formData, setFormData] = useState<TripCreateDto>({
    date: new Date().toISOString().split('T')[0],
    tripTypeId: 0,
    millId: 0,
    afdelingId: 0,
    loadWeightKg: 1,
    ptpnRate: 274,
    contractorRate: 190,
    driverId: 0,
    vehicleId: 0,
    contractorId: 0,
    travelAllowance: 0,
    loadingFee: 0,
    consumptionFee: 0,
    additionalFee1: 0,
    additionalFee2: 0,
    additionalFee3: 0
  });

  const [showAdditionalFees, setShowAdditionalFees] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);
  const [rateError, setRateError] = useState<string | null>(null);

  const [mills, setMills] = useState<Mill[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [selectedEstate, setSelectedEstate] = useState<Estate | null>(null);
  const [afdelings, setAfdelings] = useState<Afdeling[]>([]);
  const [selectedAfdeling, setSelectedAfdeling] = useState<Afdeling | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);

  const [financialSummary, setFinancialSummary] = useState({
    ptpnTotal: 0,
    contractorTotal: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0
  });

  useEffect(() => {
    const fetchReferenceData = async () => {
      setLoading(true);
      try {
        const [estatesData, millsData, driversData, vehiclesData, contractorsData, tripTypesData] = await Promise.all([
          referenceService.getAllEstates(),
          referenceService.getAllMills(),
          referenceService.getAllDrivers(),
          referenceService.getAllVehicles(),
          referenceService.getAllContractors(),
          referenceService.getAllTripTypes()
        ]);

        setEstates(estatesData);
        setMills(millsData);
        setDrivers(driversData);
        setVehicles(vehiclesData);
        setContractors(contractorsData);
        setTripTypes(tripTypesData);

        setError(null);
      } catch (err) {
        console.error('Error fetching reference data:', err);
        setError('Failed to load reference data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (trip) {
      const estate = estates.find(e =>
        e.afdelingList.some(a => a.id === trip.afdeling.id)
      ) || null;

      setSelectedEstate(estate);
      if (estate) {
        setAfdelings(estate.afdelingList);
      }

      const afdeling = estate?.afdelingList.find(a => a.id === trip.afdeling.id) || null;
      setSelectedAfdeling(afdeling);

      setFormData({
        date: trip.date,
        tripTypeId: trip.tripType?.id ?? 0,
        estateId: estate?.id,
        millId: trip.mill?.id ?? 0,
        afdelingId: trip.afdeling?.id ?? 0,
        driverId: trip.driver?.id ?? 0,
        vehicleId: trip.vehicle?.id ?? 0,
        contractorId: trip.contractor?.id ?? 0,
        loadWeightKg: trip.loadWeightKg,
        ptpnRate: trip.ptpnRate,
        contractorRate: trip.contractorRate,
        travelAllowance: trip.travelAllowance,
        loadingFee: trip.loadingFee,
        consumptionFee: trip.consumptionFee,
        additionalFee1: trip.additionalFee1 || 0,
        additionalFee2: trip.additionalFee2 || 0,
        additionalFee3: trip.additionalFee3 || 0,
      });

      if (trip.additionalFee1 > 0 || trip.additionalFee2 > 0 || trip.additionalFee3 > 0) {
        setShowAdditionalFees(true);
      }

    } else {
      if (estates.length > 0) {
        const firstEstate = estates[0];
        setSelectedEstate(firstEstate);
        setAfdelings(firstEstate.afdelingList);

        if (firstEstate.afdelingList.length > 0) {
          setSelectedAfdeling(firstEstate.afdelingList[0]);
          setFormData(prev => ({
            ...prev,
            date: new Date().toISOString().split('T')[0],
            estateId: firstEstate.id,
            afdelingId: firstEstate.afdelingList[0]?.id ?? 0,
          }));
        }
      }
    }
  }, [trip, estates, mills, drivers, vehicles, contractors]);

  useEffect(() => {
    const ptpnTotal = formData.loadWeightKg * formData.ptpnRate;
    const contractorTotal = formData.loadWeightKg * formData.contractorRate;
    const grossProfit = ptpnTotal - contractorTotal;
    const totalExpenses = formData.travelAllowance +
      formData.loadingFee +
      formData.consumptionFee +
      formData.additionalFee1 +
      formData.additionalFee2 +
      formData.additionalFee3;
    const netProfit = grossProfit - totalExpenses;

    setFinancialSummary({
      ptpnTotal,
      contractorTotal,
      grossProfit,
      totalExpenses,
      netProfit
    });
  }, [formData]);


  const handleSelectChange = (
    selectedOption: SingleValue<{ value: number | undefined; label: string }>,
    actionMeta: ActionMeta<{ value: number | undefined; label: string }>
  ) => {
    const name = actionMeta.name;
    if (!name) return;
    const value = selectedOption ? selectedOption.value ?? 0 : 0;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEstateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estateId = parseInt(e.target.value);
    const estate = estates.find(e => e.id === estateId) || null;

    setSelectedEstate(estate);
    setSelectedAfdeling(null);
    if (estate) {
      setAfdelings(estate.afdelingList);
      setFormData({
        ...formData,
        estateId: estate.id,
        afdelingId: 0
      });
    }
  };

  const handleAfdelingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const afdelingId = parseInt(e.target.value);
    const afdeling = afdelings.find(a => a.id === afdelingId) || null;

    setSelectedAfdeling(afdeling);
    setFormData({
      ...formData,
      afdelingId: afdelingId
    });
    if (afdelingId && formData.millId) {
      fetchRateConfiguration(formData.millId, afdelingId);
    }
  };

  const fetchRateConfiguration = async (millId: number, afdelingId: number) => {
    setLoadingRates(true);
    setRateError(null);
    try {
      const rateConfig = await referenceService.getActiveRateConfiguration(millId, afdelingId);
      setFormData(prevData => ({
        ...prevData,
        ptpnRate: rateConfig.ptpnRate,
        contractorRate: rateConfig.contractorRate
      }));
    } catch (err) {
      console.error('Error fetching rate configuration:', err);
      setRateError('Failed to fetch rate configuration. Using default rates.');
    } finally {
      setLoadingRates(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'tripTypeId' || name === 'millId') {
      const idValue = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: idValue
      }));

      if (name === 'millId' && idValue && formData.afdelingId) {
        fetchRateConfiguration(idValue, formData.afdelingId);
      }

      return;
    }

    if (['loadWeightKg', 'travelAllowance', 'loadingFee', 'consumptionFee', 'additionalFee1', 'additionalFee2', 'additionalFee3'].includes(name)) {
      const rawValue = parseNumber(value);
      setFormData({
        ...formData,
        [name]: rawValue,
      });
    } else if (['ptpnRate', 'contractorRate'].includes(name)) {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (trip?.id) {
        await tripService.updateTrip(trip.id, formData);
      } else {
        await tripService.createTrip(formData);
      }
      onSave();
      setError(null);
    } catch (err) {
      console.error('Error saving trip:', err);
      setError('Failed to save trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.date && formData.millId && selectedEstate?.id && formData.afdelingId;
      case 2:
        return formData.driverId && formData.vehicleId && formData.contractorId;
      case 3:
        return formData.loadWeightKg >= 1 && formData.ptpnRate >= 0 && formData.contractorRate >= 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const driverOptions = drivers.map(driver => ({ value: driver.id, label: driver.name }));
  const vehicleOptions = vehicles.map(vehicle => ({ value: vehicle.id, label: vehicle.licensePlatNumber }));
  const contractorOptions = contractors.map(contractor => ({ value: contractor.id, label: contractor.name }));

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.35rem',
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '&:hover': {
        borderColor: '#d1d5db',
      },
    }),
    option: (provided: any, state: { isSelected: any; isFocused: any; }) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#ff6908' : state.isFocused ? '#ffe3c2' : 'white',
      color: state.isSelected ? 'white' : '#111827',
      '&:active': {
        backgroundColor: '#ff6908',
      },
    }),
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden font-sans">        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-b from-gray-50 to-white">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          {trip ? 'Edit Trip' : 'Create New Trip'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <X size={20} />
        </button>
      </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-muted p-6 border-r border-border">
            <p className="text-sm text-muted-foreground mb-6 font-medium">
              Complete the steps to create your trip
            </p>
            <div className="space-y-4">
              {[
                { step: 1, label: 'Trip Info' },
                { step: 2, label: 'Driver & Vehicle' },
                { step: 3, label: 'Pricing & Fees' },
                { step: 4, label: 'Summary' },
              ].map(({ step, label }) => (
                <div key={step} className="flex items-center gap-3 group">
                  <div
                    className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
            ${currentStep === step
                        ? 'bg-[#ff6908] text-white'
                        : currentStep > step
                          ? 'bg-orange-100 text-[#ff6908]'
                          : 'bg-gray-200 text-gray-400'
                      }
            transition-all duration-200
          `}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${currentStep === step
                      ? 'text-foreground'
                      : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>


          <div className="flex-1 p-8 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader size={32} className="animate-spin text-[#ff6908]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <CircleAlert size={20} />
                    {error}
                  </div>
                )}

                {currentStep === 1 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Trip Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Trip</label>
                        <select
                          name="tripTypeId"
                          value={formData.tripTypeId}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                        >
                          <option value="">Pilih Tipe Trip</option>
                          {tripTypes.map(tt => (
                            <option key={tt.id} value={tt.id}>{tt.name}</option>
                          ))}
                        </select>

                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                        <select
                          name="millId"
                          value={formData.millId}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                        >
                          <option value="">Select Destination</option>
                          {mills.map(mill => (
                            <option key={mill.id} value={mill.id}>{mill.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                          <select
                            name="estateId"
                            value={selectedEstate?.id || ""}
                            onChange={handleEstateChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                          >
                            <option value="">Select Origin</option>
                            {estates.map(estate => (
                              <option key={estate.id} value={estate.id}>{estate.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Origin</label>
                          <select
                            name="afdelingId"
                            value={formData.afdelingId}
                            onChange={handleAfdelingChange}
                            required
                            disabled={!selectedEstate}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 bg-white shadow-sm"
                          >
                            <option value="">Select Sub-Origin</option>
                            {afdelings.map(afdeling => (
                              <option key={afdeling.id} value={afdeling.id}>{afdeling.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {selectedAfdeling && selectedAfdeling.blockList && selectedAfdeling.blockList.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Info size={16} className="text-[#ff6908]" />
                            <p className="text-sm font-medium text-gray-700">Available Blocks</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedAfdeling.blockList.map(block => (
                              <div key={block.id} className="bg-[#ffe3c2] px-3 py-1.5 rounded-full border border-[#ff8533] text-xs text-[#e55e07] font-medium">
                                {block.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Transportation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                        <Select
                          name="driverId"
                          options={driverOptions}
                          value={driverOptions.find(opt => opt.value === formData.driverId)}
                          onChange={handleSelectChange}
                          isClearable
                          isSearchable
                          placeholder="Select a driver"
                          styles={customSelectStyles}
                          required
                        />
                        {drivers.find(d => d.id === formData.driverId)?.licenseNumber && (
                          <p className="mt-2 text-xs text-gray-500">
                            License: {drivers.find(d => d.id === formData.driverId)?.licenseNumber}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                        <Select
                          name="vehicleId"
                          options={vehicleOptions}
                          value={vehicleOptions.find(opt => opt.value === formData.vehicleId)}
                          onChange={handleSelectChange}
                          isClearable
                          isSearchable
                          placeholder="Select a vehicle"
                          styles={customSelectStyles}
                          required
                        />
                        {vehicles.find(v => v.id === formData.vehicleId)?.vehicleType && (
                          <p className="mt-2 text-xs text-gray-500">
                            Type: {vehicles.find(v => v.id === formData.vehicleId)?.vehicleType}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contractor</label>
                        <Select
                          name="contractorId"
                          options={contractorOptions}
                          value={contractorOptions.find(opt => opt.value === formData.contractorId)}
                          onChange={handleSelectChange}
                          isClearable
                          isSearchable
                          placeholder="Select a contractor"
                          styles={customSelectStyles}
                          required
                        />
                        {contractors.find(c => c.id === formData.contractorId)?.phoneNumber && (
                          <p className="mt-2 text-xs text-gray-500">
                            Phone: {contractors.find(c => c.id === formData.contractorId)?.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Cargo & Pricing</h3>
                    {(formData.millId && formData.afdelingId) && (
                      <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${loadingRates ? 'bg-blue-50' : rateError ? 'bg-red-50' : 'bg-green-50'}`}>
                        {loadingRates ? (
                          <>
                            <Loader size={18} className="text-blue-500 animate-spin mt-0.5" />
                            <div>
                              <p className="text-blue-700 font-medium">Loading rate configuration...</p>
                              <p className="text-blue-600 text-sm">Fetching rates for the selected mill and afdeling.</p>
                            </div>
                          </>
                        ) : rateError ? (
                          <>
                            <CircleAlert size={18} className="text-red-500 mt-0.5" />
                            <div>
                              <p className="text-red-700 font-medium">Rate configuration error</p>
                              <p className="text-red-600 text-sm">{rateError}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Info size={18} className="text-green-500 mt-0.5" />
                            <div>
                              <p className="text-green-700 font-medium">Rate configuration loaded</p>
                              <p className="text-green-600 text-sm">Using rates for {mills.find(m => m.id === formData.millId)?.name} and {afdelings.find(a => a.id === formData.afdelingId)?.name}</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                      {[1, 2].includes(formData.tripTypeId) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Load Weight (kg)
                          </label>
                          <input
                            type="text"
                            name="loadWeightKg"
                            value={formatNumberWithSeparators(String(formData.loadWeightKg))}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="1"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                          />
                        </div>
                      )}


                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {[1, 2].includes(formData.tripTypeId)
                            ? 'Rate (per kg)'
                            : 'Rate (per trip)'
                          }


                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="ptpnRate"
                            value={formData.ptpnRate}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="1"
                            disabled={true}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-gray-50 shadow-sm"
                          />
                          {loadingRates && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader size={16} className="text-gray-400 animate-spin" />
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {formData.millId && formData.afdelingId ? 'Auto-filled from rate configuration' : 'Select destination and sub-origin to auto-fill'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {[1, 2].includes(formData.tripTypeId)
                            ? 'Contractor Rate (per kg)'
                            : 'Contractor Rate (per trip)'
                          }


                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="contractorRate"
                            value={formData.contractorRate}
                            onChange={handleInputChange}
                            required
                            min="0"
                            disabled={false}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-gray-50 shadow-sm"
                          />
                          {loadingRates && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader size={16} className="text-gray-400 animate-spin" />
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {formData.millId && formData.afdelingId ? 'Auto-filled from rate configuration' : 'Select destination and sub-origin to auto-fill'}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Expenses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Travel Allowance (Rp)</label>
                        <input
                          type="text"
                          name="travelAllowance"
                          value={formatNumberWithSeparators(String(formData.travelAllowance))}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="1000"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loading Fee (Rp)</label>
                        <input
                          type="text"
                          name="loadingFee"
                          value={formatNumberWithSeparators(String(formData.loadingFee))}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="1000"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Allowance (Rp)</label>
                        <input
                          type="text"
                          name="consumptionFee"
                          value={formatNumberWithSeparators(String(formData.consumptionFee))}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="1000"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAdditionalFees(!showAdditionalFees)}
                        className="flex items-center gap-2 text-sm font-medium text-[#ff832f] hover:text-[#e66a1a] transition-colors duration-200"
                      >
                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${showAdditionalFees ? 'rotate-180' : ''}`} />
                        {showAdditionalFees ? 'Hide Additional Fees' : 'Add More Fees'}
                      </button>
                    </div>
                    {showAdditionalFees && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Fee 1 (Rp)</label>
                          <input
                            type="text"
                            name="additionalFee1"
                            value={formatNumberWithSeparators(String(formData.additionalFee1))}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Fee 2 (Rp)</label>
                          <input
                            type="text"
                            name="additionalFee2"
                            value={formatNumberWithSeparators(String(formData.additionalFee2))}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Fee 3 (Rp)</label>
                          <input
                            type="text"
                            name="additionalFee3"
                            value={formatNumberWithSeparators(String(formData.additionalFee3))}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff832f] transition-all duration-200 bg-white shadow-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Summary</h3>
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <p>Date: {formData.date}</p>
                          <p>Destination: {mills.find(m => m.id === formData.millId)?.name}</p>
                          <p>Origin: {estates.find(e => e.id === selectedEstate?.id)?.name}</p>
                          <p>Sub-Origin: {afdelings.find(a => a.id === formData.afdelingId)?.name}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Transportation</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <p>Driver: {drivers.find(d => d.id === formData.driverId)?.name}</p>
                          <p>Vehicle: {vehicles.find(v => v.id === formData.vehicleId)?.licensePlatNumber}</p>
                          <p>Contractor: {contractors.find(c => c.id === formData.contractorId)?.name}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Cargo & Pricing</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">

                          {[1, 2].includes(formData.tripTypeId) && (
                            <p>
                              Load Weight: {formatNumberWithSeparators(formData.loadWeightKg.toString())} kg
                            </p>
                          )}


                          <p>
                            Rate: {formData.ptpnRate}
                            {[1, 2].includes(formData.tripTypeId) ? ' /kg' : ' /trip'}
                          </p>

                          <p>
                            Contractor Rate: {formData.contractorRate}
                            {[1, 2].includes(formData.tripTypeId) ? ' /kg' : ' /trip'}
                          </p>


                          <p>Travel Allowance: {formatCurrency(formData.travelAllowance)}</p>
                          <p>Loading Fee: {formatCurrency(formData.loadingFee)}</p>
                          <p>Meal Allowance: {formatCurrency(formData.consumptionFee)}</p>
                          {formData.additionalFee1 > 0 && <p>Additional Fee 1: {formatCurrency(formData.additionalFee1)}</p>}
                          {formData.additionalFee2 > 0 && <p>Additional Fee 2: {formatCurrency(formData.additionalFee2)}</p>}
                          {formData.additionalFee3 > 0 && <p>Additional Fee 3: {formatCurrency(formData.additionalFee3)}</p>}
                        </div>
                      </div>
                      {(formData.loadWeightKg >= 1 && formData.ptpnRate >= 0 && formData.contractorRate >= 0) && (
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4">Financial Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div>
                              <p className="text-sm text-gray-600">PTPN Revenue</p>
                              <p className="font-semibold text-gray-800">{formatCurrency(financialSummary.ptpnTotal)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Contractor Payment</p>
                              <p className="font-semibold text-gray-800">{formatCurrency(financialSummary.contractorTotal)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Gross Profit</p>
                              <p className="font-semibold text-green-600">{formatCurrency(financialSummary.grossProfit)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Expenses</p>
                              <p className="font-semibold text-gray-800">{formatCurrency(financialSummary.totalExpenses)}</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-600">Net Profit</p>
                              <p className={`text-base font-semibold ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(financialSummary.netProfit)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-muted flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            Cancel
          </button>

          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-1.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid() || loading}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${!isStepValid() || loading
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-[#ff6908] text-white hover:bg-[#e55e07]'
                }`}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || loading}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${saving || loading
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-[#ff6908] text-white hover:bg-[#e55e07]'
                }`}
            >
              {saving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Trip
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default TripForm;