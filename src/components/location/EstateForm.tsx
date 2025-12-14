import React, { useState } from 'react';
import { Estate } from '../../types/location';
import { Plus, Save, Trash2 } from 'lucide-react';

interface EstateFormProps {
  initialData?: Estate;
  onSubmit: (estate: Estate) => void;
  isLoading: boolean;
}

const DEFAULT_ESTATE: Estate = {
  name: '',
  afdelingList: [
    {
      name: '',
      blockList: [
        {
          name: ''
        }
      ],
      estateName: ''
    }
  ]
};

const EstateForm: React.FC<EstateFormProps> = ({
  initialData,
  onSubmit,
  isLoading
}) => {
  const [estate, setEstate] = useState<Estate>(initialData || DEFAULT_ESTATE);

  const handleEstateNameChange = (value: string) => {
    setEstate(prev => ({ ...prev, name: value }));
  };

  const handleAfdelingNameChange = (index: number, value: string) => {
    const updatedAfdelings = [...estate.afdelingList];
    updatedAfdelings[index] = { ...updatedAfdelings[index], name: value };
    setEstate(prev => ({ ...prev, afdelingList: updatedAfdelings }));
  };

  const handleBlockNameChange = (afdelingIndex: number, blockIndex: number, value: string) => {
    const updatedAfdelings = [...estate.afdelingList];
    const updatedBlocks = [...updatedAfdelings[afdelingIndex].blockList];
    updatedBlocks[blockIndex] = { ...updatedBlocks[blockIndex], name: value };
    updatedAfdelings[afdelingIndex] = { ...updatedAfdelings[afdelingIndex], blockList: updatedBlocks };
    setEstate(prev => ({ ...prev, afdelingList: updatedAfdelings }));
  };

  const addAfdeling = () => {
    setEstate(prev => ({
      ...prev,
      afdelingList: [
        ...prev.afdelingList,
        {
          name: '',
          blockList: [{ name: '' }],
          estateName: prev.name
        }
      ]
    }));
  };

  const addBlock = (afdelingIndex: number) => {
    const updatedAfdelings = [...estate.afdelingList];
    updatedAfdelings[afdelingIndex] = {
      ...updatedAfdelings[afdelingIndex],
      blockList: [...updatedAfdelings[afdelingIndex].blockList, { name: '' }]
    };
    setEstate(prev => ({ ...prev, afdelingList: updatedAfdelings }));
  };

  const removeBlock = (afdelingIndex: number, blockIndex: number) => {
    const updatedAfdelings = [...estate.afdelingList];
    const updatedBlocks = updatedAfdelings[afdelingIndex].blockList.filter((_, i) => i !== blockIndex);
    updatedAfdelings[afdelingIndex] = { ...updatedAfdelings[afdelingIndex], blockList: updatedBlocks };
    setEstate(prev => ({ ...prev, afdelingList: updatedAfdelings }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(estate);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estate Name
        </label>
        <input
          type="text"
          value={estate.name}
          onChange={(e) => handleEstateNameChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff832f]"
          placeholder="Enter estate name"
          required
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Afdelings</h3>
          <button
            type="button"
            onClick={addAfdeling}
            className="flex items-center text-sm text-[#ff6908] hover:text-[#b94d06]"
          >
            <Plus size={16} className="mr-1" />
            Add Afdeling
          </button>
        </div>

        {estate.afdelingList.map((afdeling, afdelingIndex) => (
          <div key={afdelingIndex} className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex-1 mr-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Afdeling Name
                </label>
                <input
                  type="text"
                  value={afdeling.name}
                  onChange={(e) => handleAfdelingNameChange(afdelingIndex, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff832f]"
                  placeholder="Enter afdeling name"
                  required
                />
              </div>
            </div>


            <div className="pl-4 border-l-2 border-[#ff8533]">
              <div className="flex justify-between items-center mb-3 mt-4">
                <h4 className="text-md font-medium text-gray-700">Blocks</h4>
                <button
                  type="button"
                  onClick={() => addBlock(afdelingIndex)}
                  className="flex items-center text-xs text-[#ff6908] hover:text-[#b94d06]"
                >
                  <Plus size={14} className="mr-1" />
                  Add Block
                </button>
              </div>

              {afdeling.blockList.map((block, blockIndex) => (
                <div key={blockIndex} className="flex items-center mb-3">
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={block.name}
                      onChange={(e) => handleBlockNameChange(afdelingIndex, blockIndex, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff832f]"
                      placeholder="Enter block name"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBlock(afdelingIndex, blockIndex)}
                    className="text-red-500 hover:text-red-700"
                    disabled={afdeling.blockList.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
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
              Save Estate
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EstateForm;
