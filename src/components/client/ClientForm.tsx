import React, { useState, useEffect } from 'react';
import { Client } from '../../types/client';
import { clientService } from '../../services/api';
import { AlertTriangle, Loader, X } from 'lucide-react';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  client?: Client;
}

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSave, client }) => {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    code: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    isInternal: false,
    active: true,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    address?: string;
    contactPerson?: string;
    contactPhone?: string;
  }>({});

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditMode = !!client?.id;

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        code: client.code,
        address: client.address,
        contactPerson: client.contactPerson,
        contactPhone: client.contactPhone,
        isInternal: client.isInternal,
        active: client.active,
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; code?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Client code is required';
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
      if (isEditMode && client?.id) {
        await clientService.updateClient(client.id, { ...formData, id: client.id });
        setSuccess('Client updated successfully');
      } else {
        await clientService.createClient(formData);
        setSuccess('Client created successfully');
      }

      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} client. Please try again.`);
      console.error('Error saving client:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Client' : 'Add New Client'}
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

          {/* NAME */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter client name"
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* CODE */}
          <div className="mb-6">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Client Code*
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter client code"
              className={`w-full px-3 py-2 border rounded-md ${errors.code ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          {/* ADDRESS */}
          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Client Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter client address"
              className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {/* Perbaikan: Menggunakan errors.address, bukan errors.code */}
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          {/* CONTACT PERSON */}
          <div className="mb-6">
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
              Client Contact Person
            </label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Enter client contact person"
              className={`w-full px-3 py-2 border rounded-md ${errors.contactPerson ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
             {/* Perbaikan: Menggunakan errors.contactPerson */}
            {errors.contactPerson && (
              <p className="mt-1 text-sm text-red-500">{errors.contactPerson}</p>
            )}
          </div>

          {/* CONTACT PHONE */}
          <div className="mb-6">
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Client Contact Phone
            </label>
            <input
              type="text"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="Enter client contact phone"
              className={`w-full px-3 py-2 border rounded-md ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
             {/* Perbaikan: Menggunakan errors.contactPhone */}
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>
            )}
          </div>

          {/* BARU: IS INTERNAL CHECKBOX */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isInternal"
                name="isInternal"
                checked={formData.isInternal}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="isInternal" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer select-none">
                Is Internal Client
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Check this box if the client belongs to internal organization.
            </p>
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
              className="px-4 py-2 text-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:bg-orange-300"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader size={16} className="animate-spin mr-2" />
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <span>{isEditMode ? 'Update Client' : 'Create Client'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;