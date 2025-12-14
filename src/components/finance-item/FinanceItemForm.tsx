import React, { useState, useEffect } from 'react';
import { FinanceItem } from '../../types/finance-item';
import { financeItemService } from '../../services/api';
import { AlertTriangle, Loader, X } from 'lucide-react';

interface FinanceItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  financeItem?: FinanceItem;
}

const FinanceItemForm: React.FC<FinanceItemFormProps> = ({ isOpen, onClose, onSave, financeItem }) => {
  const [formData, setFormData] = useState<Omit<FinanceItem, 'id'>>({
    name: '',
    code: '',
    description: '',
    active: true,
    itemCategory: 'CONTRACTOR_PAYMENT',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    description?: string;
    itemCategory?: string;
  }>({});

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditMode = !!financeItem?.id;

  useEffect(() => {
    if (financeItem) {
      setFormData({
        name: financeItem.name,
        code: financeItem.code,
        description: financeItem.description,
        active: financeItem.active,
        itemCategory: financeItem.itemCategory,
      });
    }
  }, [financeItem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    if (error) setError(null);
    if (success) setSuccess(null);
  };


  const validateForm = (): boolean => {
    const newErrors: {
      name?: string; code?: string; description?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Finance Item name is required';
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
      if (isEditMode && financeItem?.id) {
        await financeItemService.updateFinanceItem(financeItem.id, { ...formData, id: financeItem.id });
        setSuccess('Finance Item updated successfully');
      } else {
        await financeItemService.createFinanceItem(formData);
        setSuccess('Finance Item created successfully');
      }

      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} financeItem. Please try again.`);
      console.error('Error saving financeItem:', err);
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
            {isEditMode ? 'Edit Finance Item' : 'Add New Finance Item'}
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
              Finance Item Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Finance Item Name"
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <select
              id="itemCategory"
              name="itemCategory"
              value={formData.itemCategory}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-white ${errors.itemCategory ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            >
              <option value="CONTRACTOR_PAYMENT">Pembayaran Anemer</option>
              <option value="CASH">Kas</option>
              <option value="BANK">Bank</option>
              <option value="LIABILITY">Kewajiban</option>
              <option value="EXPENSE">Biaya</option>
              <option value="TRUCK_EXPENSE">Biaya Truk</option>
              <option value="POK_EXPENSE">Biaya POK</option>
              <option value="OTHER_PLANTATION_EXPENSE">Biaya Lain-Lain Kebun</option>
              <option value="PLANTATION_OFFICE_EXPENSE">Biaya Kantor Kebun</option>
              <option value="OTHER_EXPENSE">Beban Lain - Lain</option>
            </select>
            {errors.itemCategory && <p className="mt-1 text-sm text-red-500">{errors.itemCategory}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter Code"
              className={`w-full px-3 py-2 border rounded-md ${errors.code ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter Description"
              className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
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
                <span>{isEditMode ? 'Update Finance Item' : 'Create Finance Item'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceItemForm;
