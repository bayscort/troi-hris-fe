import React from 'react';
import { Estate } from '../../types/location';
import { ArrowLeft, Pencil } from 'lucide-react';

interface EstateDetailProps {
  estate: Estate;
  onBack: () => void;
  onEdit: (estate: Estate) => void;
  isLoading: boolean;
}

const EstateDetail: React.FC<EstateDetailProps> = ({
  estate,
  onBack,
  onEdit,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <svg className="animate-spin h-6 w-6 text-[#ff6908] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Loading estate details...</span>
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
            <h1 className="text-xl font-semibold text-gray-800">{estate.name}</h1>
            {estate.id && (
              <p className="text-sm text-gray-500 mt-1">ID: {estate.id}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onEdit(estate)}
          className="inline-flex items-center text-sm font-medium text-[#e55e07] bg-[#fff2e5] hover:bg-[#ffe8d3] px-3 py-1.5 rounded-md transition"
        >
          <Pencil size={16} className="mr-2" />
          Edit Estate
        </button>
      </div>

      <div className="space-y-6">
        {estate.afdelingList.map((afdeling) => (
          <div
            key={afdeling.id || afdeling.name}
            className="border border-gray-200 rounded-lg p-5"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-md font-medium text-gray-800">{afdeling.name}</h2>
                {afdeling.id && (
                  <p className="text-xs text-gray-500">ID: {afdeling.id}</p>
                )}
              </div>
              <div className="bg-[#fff2e5] text-[#e55e07] text-xs px-2 py-0.5 rounded-full font-medium">
                {afdeling.blockList.length} Blocks
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {afdeling.blockList.map((block) => (
                <div
                  key={block.id || block.name}
                  className="rounded-md border border-gray-100 bg-gray-50 p-4"
                >
                  <h3 className="text-sm font-medium text-gray-700">{block.name}</h3>
                  {block.id && (
                    <p className="text-xs text-gray-400 mt-1">ID: {block.id}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstateDetail;