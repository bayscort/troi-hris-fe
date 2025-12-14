import React from 'react';
import { User } from '../../types/user';
import { UserCheck2Icon, BadgeCheck, X, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  user: User;
}

const UserDetails: React.FC<Props> = ({ isOpen, onClose, onEdit, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="bg-orange-100 rounded-full p-3">
              <UserCheck2Icon className="text-[#ff6908]" size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">User ID: <span className="text-gray-700 font-medium">{user.id}</span></p>
              <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                <span>{user.username}</span>
              </div>


              {user.role && (
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <BadgeCheck size={16} className="text-gray-400" />
                  <span>ROLE: {user.role.name}</span>
                </div>
              )}
              {user.estate && (
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span>Estate: {user.estate.name}</span>
                </div>
              )}
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
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
