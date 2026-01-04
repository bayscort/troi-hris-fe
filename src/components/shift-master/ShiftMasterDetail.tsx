import React from 'react';
import { X, Building2, Moon } from 'lucide-react';
import { ShiftMasterDTO } from '../../types/shift-master';

interface ShiftMasterDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  data: ShiftMasterDTO | null;
}

const ShiftMasterDetail: React.FC<ShiftMasterDetailProps> = ({
  isOpen,
  onClose,
  onEdit,
  data,
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header with Color Indicator */}
        <div className="relative px-6 py-6 border-b">
           <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start gap-4">
            <div 
                className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: data.color || '#4CAF50' }}
            >
                {data.code}
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Building2 size={14}/>
                    <span>{data.client?.name}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
                {data.isDayOff ? (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold border border-gray-200">
                        Day Off
                    </span>
                ) : (
                     <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
                        Active Shift
                    </span>
                )}
                
                {data.isCrossDay && (
                     <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100 flex items-center gap-1">
                        <Moon size={12}/> Cross Day
                    </span>
                )}
            </div>

            {/* Time Schedule */}
            {!data.isDayOff && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">Time Schedule</h3>
                    <div className="flex justify-between items-center text-gray-800">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Start Time</p>
                            <p className="text-2xl font-semibold font-mono">{data.startTime ? data.startTime.substring(0,5) : '--:--'}</p>
                        </div>
                        <div className="h-px bg-orange-300 w-12 mx-2"></div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">End Time</p>
                            <p className="text-2xl font-semibold font-mono">{data.endTime ? data.endTime.substring(0,5) : '--:--'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Configuration Rules */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 border-l-4 border-[#ff6908] pl-2">Configuration Rules</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md bg-gray-50">
                        <p className="text-xs text-gray-500">Late Tolerance</p>
                        <p className="font-medium text-gray-900">{data.lateToleranceMinutes} Minutes</p>
                    </div>
                    <div className="p-3 border rounded-md bg-gray-50">
                        <p className="text-xs text-gray-500">Clock-In Window</p>
                        <p className="font-medium text-gray-900">{data.clockInWindowMinutes} Min Before</p>
                    </div>
                </div>
            </div>

             {/* Client Info Detail */}
             {data.client && (
                <div>
                     <h3 className="text-sm font-semibold text-gray-900 mb-2">Client Details</h3>
                     <p className="text-sm text-gray-600">{data.client.address || 'No address'}</p>
                     <p className="text-sm text-gray-600 mt-1">Contact: {data.client.contactPerson} ({data.client.contactPhone})</p>
                </div>
             )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                Close
             </button>
             <button onClick={() => { onEdit(); }} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors shadow-sm">
                Edit Configuration
             </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftMasterDetail;