import React, { useEffect, useState } from 'react';
import { Vehicle, Contractor, VehicleCreate } from '../../types/vehicle';
import { vehicleService } from '../../services/api';
import { AlertTriangle, CheckCircle, Loader, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  vehicle?: Vehicle;
  contractors: Contractor[];
}

const VehicleForm: React.FC<Props> = ({ isOpen, onClose, onSave, vehicle, contractors }) => {
  const isEdit = !!vehicle?.id;

  const [formData, setFormData] = useState<Omit<VehicleCreate, 'id'>>({
    licensePlatNumber: '',
    vehicleType: 'CAR',
    contractorId: contractors[0]?.id ?? 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && vehicle) {
      setFormData({
        licensePlatNumber: vehicle.licensePlatNumber,
        vehicleType: vehicle.vehicleType,
        contractorId: vehicle.contractor?.id ?? contractors[0]?.id ?? 0,
      });
    }
  }, [vehicle, contractors, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'contractorId' ? parseInt(value) : value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.licensePlatNumber.trim()) errs.licensePlatNumber = 'License plate is required';
    if (!formData.vehicleType) errs.vehicleType = 'Vehicle type is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEdit && vehicle?.id) {
        await vehicleService.updateVehicle(vehicle.id, formData);
        setSuccess('Vehicle updated successfully');
      } else {
        await vehicleService.createVehicle(formData);
        setSuccess('Vehicle created successfully');
      }

      setTimeout(() => {
        onSave();
      }, 1000);
    } catch {
      setError(`Failed to ${isEdit ? 'update' : 'create'} vehicle.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl border w-full max-w-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 text-sm space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex gap-2">
              <AlertTriangle size={16} /> <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 flex gap-2">
              <CheckCircle size={16} /> <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">License Plate *</label>
            <input
              type="text"
              name="licensePlatNumber"
              value={formData.licensePlatNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${errors.licensePlatNumber ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.licensePlatNumber && (
              <p className="text-red-500 mt-1">{errors.licensePlatNumber}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">Vehicle Type *</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="CAR">Car</option>
              <option value="TRUCK">Truck</option>
              <option value="MOTORCYCLE">Motorcycle</option>
            </select>
            {errors.vehicleType && <p className="text-red-500 mt-1">{errors.vehicleType}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Vehicle' : 'Create Vehicle'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;
