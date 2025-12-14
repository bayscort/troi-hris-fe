import React, { useState, useEffect } from 'react';
import { Driver } from '../../types/driver';
import { driverService } from '../../services/api';
import { AlertTriangle, Loader, X } from 'lucide-react';

interface DriverFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  driver?: Driver;
}

const DriverForm: React.FC<DriverFormProps> = ({ isOpen, onClose, onSave, driver }) => {
  const [formData, setFormData] = useState<Omit<Driver, 'id'>>({
    name: '',
    licenseNumber: ''
  });

  const [errors, setErrors] = useState<{
    name?: string;
    licenseNumber?: string;
  }>({});

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditMode = !!driver?.id;

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name,
        licenseNumber: driver.licenseNumber
      });
    }
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; licenseNumber?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Driver name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditMode && driver?.id) {
        await driverService.updateDriver(driver.id, { ...formData, id: driver.id });
        setSuccess('Driver updated successfully');
      } else {
        await driverService.createDriver(formData);
        setSuccess('Driver created successfully');
      }

      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} driver. Please try again.`);
      console.error('Error saving driver:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Driver' : 'Add New Driver'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
              <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
              {success}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter driver name"
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="Enter license number"
              className={`w-full px-3 py-2 border rounded-md ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.licenseNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.licenseNumber}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
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
              className="px-4 py-2 text-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update Driver' : 'Create Driver'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverForm;
