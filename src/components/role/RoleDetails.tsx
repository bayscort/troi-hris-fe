import React from 'react';
import { Role } from '../../types/role';
import { BadgeCheck, X } from 'lucide-react';

interface RoleDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  role: Role;
}

const RoleDetails: React.FC<RoleDetailsProps> = ({ isOpen, onClose, onEdit, role }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Role Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <BadgeCheck className="text-[#ff6908]" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800">{role.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Role ID: <span className="text-gray-700 font-medium">{role.id}</span></p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
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
            Edit Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleDetails;
