import React, { useState, useEffect } from 'react';
import { Account, AccountResp } from '../../types/account';
import { accountService } from '../../services/api';
import { AlertTriangle, Loader, X } from 'lucide-react';
import { Estate } from '../../types/location';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  account?: AccountResp;
  estates: Estate[];

}

const AccountForm: React.FC<AccountFormProps> = ({ isOpen, onClose, onSave, account, estates }) => {
  const isEditMode = !!account?.id;

  const getInitialFormData = (): Omit<Account, 'id'> => ({
    name: '',
    balance: 0,
    accountType: 'BANK',
    estateId: estates[0]?.id ?? null,
  });

  const [formData, setFormData] = useState<Omit<Account, 'id'>>(getInitialFormData());

  const [errors, setErrors] = useState<{ name?: string; balance?: string; accountType?: string; estateId?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setFormData({
          name: account.name,
          balance: account.balance,
          accountType: account.accountType || 'BANK',
          estateId: account.estate?.id ?? null,

        });
      } else {
        setFormData(getInitialFormData());
      }
      setErrors({});
      setError(null);
      setSuccess(null);
      setLoading(false);
    }
  }, [account, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; balance?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Account name is required';
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
      if (isEditMode && account?.id) {
        await accountService.updateAccount(account.id, { ...formData, id: account.id });
        setSuccess('Account updated successfully');
      } else {
        await accountService.createAccount(formData);
        setSuccess('Account created successfully');
      }
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} account. Please try again.`);
      console.error('Error saving account:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Account' : 'Add New Account'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type*
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-white ${errors.accountType ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            >
              <option value="BANK">BANK</option>
              <option value="CASH">CASH</option>
            </select>
            {errors.accountType && <p className="mt-1 text-sm text-red-500">{errors.accountType}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estate</label>
            <select
              name="estateId"
              value={formData.estateId ?? ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.estateId ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            >
              <option value="">Select origin</option>
              {estates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.estateId && <p className="text-sm text-red-500 mt-1">{errors.estateId}</p>}

          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter account name"
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {!isEditMode && (
            <div className="mb-6">
              <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                Initial Balance
              </label>
              <input
                disabled
                type="number"
                id="balance"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                placeholder="Enter initial balance"
                className={`w-full px-3 py-2 border rounded-md ${errors.balance ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
              />
              {errors.balance && <p className="mt-1 text-sm text-red-500">{errors.balance}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {isEditMode ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
