import React from 'react';
import { AccountResp } from '../../types/account';
import { BadgeCheck, X } from 'lucide-react';

interface AccountDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  account: AccountResp;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const AccountDetails: React.FC<AccountDetailsProps> = ({
  isOpen,
  onClose,
  onEdit,
  account,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Details</h2>

        <div className="flex gap-4 items-start mb-8">
          <div className="bg-orange-100 p-3 rounded-xl">
            <BadgeCheck size={36} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800">{account.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Balance:{' '}
              <span className="text-gray-700 font-medium">
                {formatCurrency(account.balance)}
              </span>
            </p>
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
            Edit Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;