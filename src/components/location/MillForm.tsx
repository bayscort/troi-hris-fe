import React, { useState } from 'react';
import { Mill } from '../../types/location';
import { Save } from 'lucide-react';

interface MillFormProps {
  initialData?: Mill;
  onSubmit: (mill: Mill) => void;
  isLoading: boolean;
}

const DEFAULT_MILL: Mill = {
  name: ''
};

const MillForm: React.FC<MillFormProps> = ({ 
  initialData, 
  onSubmit,
  isLoading
}) => {
  const [mill, setMill] = useState<Mill>(initialData || DEFAULT_MILL);

  const handleMillNameChange = (value: string) => {
    setMill(prev => ({ ...prev, name: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(mill);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mill Name
        </label>
        <input
          type="text"
          value={mill.name}
          onChange={(e) => handleMillNameChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff832f]"
          placeholder="Enter mill name"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-[#ff6908] text-white rounded-md hover:bg-[#e55e07] focus:outline-none focus:ring-2 focus:ring-[#ff832f] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Mill
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MillForm;
