import React from 'react';
import { Vehicle } from '../../types/vehicle';
import { Truck, IdCard, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  vehicle: Vehicle;
}

const VehicleDetails: React.FC<Props> = ({
  isOpen,
  onClose,
  onEdit,
  vehicle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vehicle Details</h2>

        <div className="flex gap-4 mb-8">
          <div className="bg-orange-100 p-3 rounded-xl">
            <Truck size={36} className="text-orange-500" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-400">ID: {vehicle.id}</div>
            <div className="text-xl font-semibold text-gray-800">{vehicle.licensePlatNumber}</div>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <IdCard size={16} />
              <span className="capitalize">{vehicle.vehicleType.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition"
          >
            Edit Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
