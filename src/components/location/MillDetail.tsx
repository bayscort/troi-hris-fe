import React from 'react';
import { Mill } from '../../types/location';
import { ArrowLeft, Pencil } from 'lucide-react';

interface MillDetailProps {
  mill: Mill;
  onBack: () => void;
  onEdit: (mill: Mill) => void;
  isLoading: boolean;
}

const MillDetail: React.FC<MillDetailProps> = ({
  mill,
  onBack,
  onEdit,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <svg className="animate-spin h-6 w-6 text-[#ff6908] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading mill details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-md transition"
            title="Back"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{mill.name}</h1>
            {mill.id && (
              <p className="text-sm text-gray-500 mt-1">ID: {mill.id}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onEdit(mill)}
          className="inline-flex items-center text-sm font-medium text-[#e55e07] bg-[#fff2e5] hover:bg-[#ffe8d3] px-3 py-1.5 rounded-md transition"
        >
          <Pencil size={16} className="mr-2" />
          Edit Mill
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-md font-medium text-gray-800 mb-4">Mill Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Name</p>
            <p className="font-medium text-gray-800">{mill.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">ID</p>
            <p className="font-medium text-gray-800">
              {mill.id || 'Not assigned'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MillDetail;
