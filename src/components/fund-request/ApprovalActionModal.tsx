import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
  actionType: 'approve' | 'reject';
  actionLabel: string;
  fundRequestCode: string;
  loading: boolean;
}

const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  actionType,
  actionLabel,
  fundRequestCode,
  loading,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const isApprove = actionType === 'approve';
  const Icon = isApprove ? CheckCircle : AlertTriangle;

  const handleSubmit = () => {
    onSubmit(notes);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
          >
            <X size={20} className="text-gray-400" />
          </button>
          
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl ${
              isApprove 
                ? 'bg-emerald-50 border border-emerald-100' 
                : 'bg-red-50 border border-red-100'
            }`}>
              <Icon size={20} className={isApprove ? 'text-emerald-600' : 'text-red-600'} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                {actionLabel} Request
              </h3>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                You are about to {actionLabel.toLowerCase()} fund request{' '}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 ml-1">
                  {fundRequestCode}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-3">
                Notes <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Add any relevant notes or comments here..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {notes.length}/500
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 ${
                  isApprove
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-200 active:bg-emerald-700'
                    : 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-200 active:bg-red-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Icon size={16} />
                    <span>{actionLabel}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalActionModal;