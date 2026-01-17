import React, { useState, useEffect } from 'react';
import { X, Save, ArrowRight } from 'lucide-react';
import { CreatePatternRequest, BulkPatternItemsRequest } from '../../types/shift-pattern';
import { ShiftMasterDTO } from '../../types/shift-master';

interface ShiftPatternFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (header: CreatePatternRequest, items: BulkPatternItemsRequest['items']) => Promise<void>;
  clientId: string;
  availableShifts: ShiftMasterDTO[];
  isLoading?: boolean;
}

const ShiftPatternForm: React.FC<ShiftPatternFormProps> = ({
  isOpen, onClose, onSave, clientId, availableShifts, isLoading
}) => {
  // State Header
  const [name, setName] = useState('');
  const [cycleDays, setCycleDays] = useState<number>(3);

  // State Items: Array of Shift IDs based on cycleDays
  // Index 0 = Day 1, Index 1 = Day 2, dst.
  const [sequence, setSequence] = useState<(string | null)[]>([]);

  // Init sequence array saat cycleDays berubah
  useEffect(() => {
    setSequence(prev => {
      const newArr = new Array(cycleDays).fill(null);
      for (let i = 0; i < Math.min(prev.length, cycleDays); i++) {
        newArr[i] = prev[i];
      }
      return newArr;
    });
  }, [cycleDays]);

  const handleShiftSelect = (index: number, shiftId: string) => {
    const newSeq = [...sequence];
    newSeq[index] = shiftId;
    setSequence(newSeq);
  };

  const handleSubmit = async () => {
    // Validation
    if (!name) return alert("Pattern Name is required");
    if (sequence.some(s => s === null)) return alert("Please assign a shift to every day in the cycle.");

    const headerReq: CreatePatternRequest = {
      clientId,
      name,
      cycleDays
    };

    const itemsReq = sequence.map((shiftId, idx) => ({
      daySequence: idx + 1, // 1-based index
      shiftMasterId: shiftId as string
    }));

    await onSave(headerReq, itemsReq);
  };

  const getShiftColor = (shiftId: string | null) => {
    if (!shiftId) return '#eee';
    const shift = availableShifts.find(s => s.id === shiftId);
    return shift?.color || '#ccc';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Create Shift Pattern</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Step 1: Config */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pattern Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Security 4 Group (2P-2M-2L)"
                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-[#ff6908] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cycle Days (Total Hari)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={cycleDays}
                onChange={e => setCycleDays(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-[#ff6908] focus:outline-none"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Step 2: Visual Builder */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Sequence Builder</label>
              <span className="text-xs text-gray-500">Assign a shift for each day in the cycle</span>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max pb-2">
                {sequence.map((selectedShiftId, index) => (
                  <div key={index} className="flex items-center">
                    {/* Day Card */}
                    <div className="w-40 flex flex-col gap-2 p-3 bg-white border rounded-lg shadow-sm relative group hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Day {index + 1}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getShiftColor(selectedShiftId) }}
                        />
                      </div>

                      <select
                        value={selectedShiftId || ''}
                        onChange={(e) => handleShiftSelect(index, e.target.value)}
                        className="w-full text-sm border-gray-300 rounded focus:ring-[#ff6908] border p-1"
                      >
                        <option value="">Select...</option>
                        {availableShifts.map(s => (
                          <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                        ))}
                      </select>

                      {/* Time Preview */}
                      {selectedShiftId && (
                        <div className="text-[10px] text-gray-400 text-center">
                          {availableShifts.find(s => s.id === selectedShiftId)?.startTime.substring(0, 5)} -
                          {availableShifts.find(s => s.id === selectedShiftId)?.endTime.substring(0, 5)}
                        </div>
                      )}
                    </div>

                    {/* Connector Arrow (Not on last item) */}
                    {index < sequence.length - 1 && (
                      <ArrowRight size={16} className="text-gray-300 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff6908] text-white rounded-md text-sm hover:bg-[#e55e07] disabled:opacity-50"
          >
            {isLoading ? <span className="animate-spin">⏳</span> : <Save size={16} />}
            Save Pattern
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftPatternForm;