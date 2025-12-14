import React from 'react';
import { Mill } from '../../types/location';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';

interface MillListProps {
  mills: Mill[];
  onEdit: (mill: Mill) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const MillList: React.FC<MillListProps> = ({
  mills,
  onEdit,
  onDelete,
  onView,
  isLoading,
  hasPermission
}) => {
  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">

      {isLoading ? (
        <div className="text-center py-6">
          <svg className="animate-spin h-8 w-8 text-[#ff6908] mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" />
          </svg>
          <p className="text-gray-600">Loading destinations...</p>
        </div>
      ) : mills.length === 0 ? (
        <div className="text-center py-6 text-gray-500">No destinations found.</div>
      ) : (
        <div className="border rounded-md overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mills.map((mill) => (
                <tr key={mill.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{mill.id}</td>
                  <td className="px-4 py-3">{mill.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {hasPermission("READ") && (

                        <button onClick={() => mill.id && onView(mill.id)} className="text-gray-500 hover:text-black" title="View">
                          <ChevronRight size={16} />
                        </button>
                      )}
                      {hasPermission("UPDATE") && (

                        <button onClick={() => onEdit(mill)} className="text-blue-600 hover:text-blue-800" title="Edit">
                          <Pencil size={16} />
                        </button>
                      )}
                      {hasPermission("DELETE") && (

                        <button onClick={() => mill.id && onDelete(mill.id)} className="text-red-500 hover:text-red-700" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MillList;
