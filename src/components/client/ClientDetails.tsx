import React from 'react';
import { Client } from '../../types/client';
import { 
  BadgeCheck, 
  X, 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Hash,
} from 'lucide-react';

interface ClientDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  client: Client;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  isOpen,
  onClose,
  onEdit,
  client,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden relative">
        
        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>

          <div className="flex gap-4 items-start">
            <div className="bg-orange-50 p-3 rounded-2xl flex-shrink-0">
              <Building2 size={32} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                <Hash size={14} />
                {client.code}
              </p>
              
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Active Status Badge */}
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  client.active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${client.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {client.active ? 'Active' : 'Inactive'}
                </span>

                {/* Internal Status Badge */}
                {client.isInternal && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1">
                    <BadgeCheck size={12} />
                    Internal Client
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 space-y-6">
          
          {/* Detail Item: Contact Person */}
          <div className="flex items-start gap-3">
            <div className="bg-gray-50 p-2 rounded-lg text-gray-500 mt-0.5">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Person</p>
              <p className="text-gray-800 font-medium mt-0.5">{client.contactPerson || '-'}</p>
            </div>
          </div>

          {/* Detail Item: Phone */}
          <div className="flex items-start gap-3">
            <div className="bg-gray-50 p-2 rounded-lg text-gray-500 mt-0.5">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Phone</p>
              <p className="text-gray-800 font-medium mt-0.5">{client.contactPhone || '-'}</p>
            </div>
          </div>

          {/* Detail Item: Address */}
          <div className="flex items-start gap-3">
            <div className="bg-gray-50 p-2 rounded-lg text-gray-500 mt-0.5">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
              <p className="text-gray-800 mt-0.5 leading-relaxed">
                {client.address || '-'}
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 flex justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition shadow-sm"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition shadow-md shadow-orange-200"
          >
            Edit Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;