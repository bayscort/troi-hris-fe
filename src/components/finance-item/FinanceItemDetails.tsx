import React from 'react';
import { FinanceItem } from '../../types/finance-item';
import { BadgeCheck, X } from 'lucide-react';

interface FinanceItemDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  financeItem: FinanceItem;
}

const FinanceItemDetails: React.FC<FinanceItemDetailsProps> = ({
  isOpen,
  onClose,
  onEdit,
  financeItem,
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

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Finance Item Details</h2>

        <div className="flex gap-4 items-start mb-8">
          <div className="bg-orange-100 p-3 rounded-xl">
            <BadgeCheck size={36} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800">{financeItem.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Code:{' '}
              <span className="text-gray-700 font-medium">{financeItem.code}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Description:{' '}
              <span className="text-gray-700 font-medium">{financeItem.description}</span>
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
            Edit Finance Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceItemDetails;