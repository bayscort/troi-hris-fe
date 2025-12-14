import React, { useState, useEffect } from 'react';
import { Afdeling, Mill, Estate } from '../../types/location';
import { Save } from 'lucide-react';
import { locationApi } from '../../services/api';

interface RateConfigurationFormProps {
  afdelings: Afdeling[];
  mills: Mill[];
  onSubmit: (rateConfig: any) => void;
  isLoading: boolean;
}

const RateConfigurationForm: React.FC<RateConfigurationFormProps> = ({
  mills,
  onSubmit,
  isLoading
}) => {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [selectedEstateId, setSelectedEstateId] = useState<number | ''>('');
  const [filteredAfdelings, setFilteredAfdelings] = useState<Afdeling[]>([]);
  const [selectedAfdelingId, setSelectedAfdelingId] = useState<number | ''>('');
  const [selectedMillId, setSelectedMillId] = useState<number | ''>('');
  const [ptpnRate, setPtpnRate] = useState<number | ''>('');
  const [contractorRate, setContractorRate] = useState<number | ''>('');
  const [isLoadingEstates, setIsLoadingEstates] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    estate?: string;
    afdeling?: string;
    mill?: string;
    ptpnRate?: string;
    contractorRate?: string;
  }>({});

  useEffect(() => {
    const fetchEstates = async () => {
      setIsLoadingEstates(true);
      try {
        const estatesData = await locationApi.getAllEstates();
        setEstates(estatesData);
      } catch (error) {
        console.error('Failed to fetch estates:', error);
      } finally {
        setIsLoadingEstates(false);
      }
    };

    fetchEstates();
  }, []);

  useEffect(() => {
    if (selectedEstateId === '') {
      setFilteredAfdelings([]);
      setSelectedAfdelingId('');
      return;
    }

    const estate = estates.find(e => e.id === selectedEstateId);
    if (estate) {
      setFilteredAfdelings(estate.afdelingList);
      setSelectedAfdelingId('');
    }
  }, [selectedEstateId, estates]);

  const validateForm = (): boolean => {
    const errors: {
      estate?: string;
      afdeling?: string;
      mill?: string;
      ptpnRate?: string;
      contractorRate?: string;
    } = {};

    if (!selectedEstateId) {
      errors.estate = 'Estate selection is required';
    }

    if (!selectedAfdelingId) {
      errors.afdeling = 'Afdeling selection is required';
    }

    if (!selectedMillId) {
      errors.mill = 'Mill selection is required';
    }

    if (ptpnRate === '') {
      errors.ptpnRate = 'PTPN rate is required';
    }

    if (contractorRate === '') {
      errors.contractorRate = 'Anemer rate is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedAfdeling = filteredAfdelings.find(a => a.id === selectedAfdelingId);
    const selectedMill = mills.find(m => m.id === selectedMillId);

    const rateConfig = {
      afdeling: selectedAfdeling,
      mill: selectedMill,
      ptpnRate: Number(ptpnRate),
      contractorRate: Number(contractorRate)
    };

    onSubmit(rateConfig);
  };

  const handleRateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | ''>>
  ) => {
    const value = e.target.value;

    if (value === '') {
      setter('');
    } else {
      const numberValue = parseFloat(value);
      setter(numberValue);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            Origin <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedEstateId}
            onChange={(e) => setSelectedEstateId(e.target.value ? Number(e.target.value) : '')}
            disabled={isLoadingEstates}
            className={`rounded-xl px-4 py-2 border text-sm ${formErrors.estate ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-[#ff832f] disabled:bg-gray-100`}
          >
            <option value="">Select Origin</option>
            {estates.map((estate) => (
              <option key={estate.id} value={estate.id}>
                {estate.name}
              </option>
            ))}
          </select>
          {formErrors.estate && <p className="text-sm text-red-600">{formErrors.estate}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            Sub-Origin <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedAfdelingId}
            onChange={(e) => setSelectedAfdelingId(e.target.value ? Number(e.target.value) : '')}
            disabled={!selectedEstateId || filteredAfdelings.length === 0}
            className={`rounded-xl px-4 py-2 border text-sm ${formErrors.afdeling ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-[#ff832f] disabled:bg-gray-100`}
          >
            <option value="">Select Sub-Origin</option>
            {filteredAfdelings.map((afdeling) => (
              <option key={afdeling.id} value={afdeling.id}>
                {afdeling.name}
              </option>
            ))}
          </select>
          {formErrors.afdeling && <p className="text-sm text-red-600">{formErrors.afdeling}</p>}
          {selectedEstateId && filteredAfdelings.length === 0 && (
            <p className="text-sm text-yellow-600">No afdelings found for this estate</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            Destination <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedMillId}
            onChange={(e) => setSelectedMillId(e.target.value ? Number(e.target.value) : '')}
            className={`rounded-xl px-4 py-2 border text-sm ${formErrors.mill ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-[#ff832f]`}
          >
            <option value="">Select Destination</option>
            {mills.map((mill) => (
              <option key={mill.id} value={mill.id}>
                {mill.name}
              </option>
            ))}
          </select>
          {formErrors.mill && <p className="text-sm text-red-600">{formErrors.mill}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            Rate <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={ptpnRate}
            onChange={(e) => handleRateChange(e, setPtpnRate)}
            step="any"
            min="0"
            className={`rounded-xl px-4 py-2 border text-sm ${formErrors.ptpnRate ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-[#ff832f]`}
            placeholder="Enter rate"
          />
          {formErrors.ptpnRate && <p className="text-sm text-red-600">{formErrors.ptpnRate}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            Contractor Rate <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={contractorRate}
            onChange={(e) => handleRateChange(e, setContractorRate)}
            step="any"
            min="0"
            className={`rounded-xl px-4 py-2 border text-sm ${formErrors.contractorRate ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-[#ff832f]`}
            placeholder="Enter rate"
          />
          {formErrors.contractorRate && <p className="text-sm text-red-600">{formErrors.contractorRate}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#ff6908] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#e55e07] focus:ring-2 focus:ring-[#ff832f] disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RateConfigurationForm;
