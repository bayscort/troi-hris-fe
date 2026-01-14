import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Eye,
  Loader,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash,
  CheckCircle
} from 'lucide-react';
import { clientService } from '../services/api';
import { Client } from '../types/client';
import ClientForm from '../components/client/ClientForm';
import ClientDetails from '../components/client/ClientDetails';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';



const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'internal' | 'external'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { authState } = useAuth();

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
      >
        &laquo;
      </button>
    );

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1 ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
        >
          1
        </button>
      );

      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-2">…</span>);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            {i}
          </button>
        );
      }

      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-2">…</span>);
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 rounded-md border text-sm ${currentPage === totalPages ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
      >
        &raquo;
      </button>
    );

    return pages;
  };



  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const data = await clientService.getAllClients();
        setClients(data);
        setFilteredClients(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch clients.');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [refreshTrigger]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();

    setFilteredClients(
      clients.filter(d => {
        const matchSearch =
          d.name.toLowerCase().includes(term);

        const matchType =
          typeFilter === 'all'
            ? true
            : typeFilter === 'internal'
              ? d.isInternal
              : !d.isInternal;

        const matchStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'active'
              ? d.active
              : !d.active;

        return matchSearch && matchType && matchStatus;
      })
    );

    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, clients]);

  const handleSave = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedClient(null);
    setRefreshTrigger(prev => prev + 1);
    setNotification({ message: 'Saved successfully', type: 'success' });
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedClient?.id) return;
    setDeleteLoading(true);
    try {
      await clientService.deleteClient(selectedClient.id);
      setNotification({ message: 'Deleted successfully', type: 'success' });
      setRefreshTrigger(x => x + 1);
    } catch (e) {
      setNotification({ message: 'Failed to delete', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedClient(null);
    }
  };

  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  useEffect(() => {
    if (notification) {
      const timeout = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [notification]);

  const totalPages = Math.ceil(filteredClients.length / perPage);
  const currentClients = filteredClients.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        {hasPermission('client-directory', 'CREATE') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
          >
            <Plus size={18} /> Add Client
          </button>
        )}
      </div>

      {notification && (
        <div className={`mb-4 p-3 rounded-md flex gap-2 text-sm border ${notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search client…"
              className="pl-10 pr-4 py-2 border rounded-md w-64 text-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="all">All Types</option>
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={() => setRefreshTrigger(p => p + 1)}
          className="px-3 py-2 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-100"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      <div className="border rounded-md overflow-hidden mb-6 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Client Info</th>
              <th className="px-4 py-3 font-medium text-gray-700">Contact</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-center">Type</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-center">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                {/* Update colSpan menjadi 6 karena jumlah kolom bertambah */}
                <td colSpan={6} className="text-center py-6">
                  <div className="flex justify-center items-center text-orange-500">
                    <Loader size={20} className="animate-spin mr-2" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-red-500 bg-red-50">
                  {error}
                </td>
              </tr>
            ) : currentClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 flex-col">
                  <p>No clients found.</p>
                </td>
              </tr>
            ) : (
              currentClients.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  {/* Name & Code Combined for cleaner look */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{d.name}</div>
                    <div className="text-xs text-gray-500 bg-gray-100 inline-block px-1.5 rounded mt-0.5">
                      {d.code}
                    </div>
                  </td>

                  {/* Contact Person & Phone */}
                  <td className="px-4 py-3">
                    <div className="text-gray-900 text-sm">
                      {d.contactPerson || '-'}
                    </div>
                    {d.contactPhone && (
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        📞 {d.contactPhone}
                      </div>
                    )}
                  </td>

                  {/* Is Internal Badge */}
                  <td className="px-4 py-3 text-center">
                    {d.isInternal ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        Internal
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                        External
                      </span>
                    )}
                  </td>

                  {/* Active Status */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${d.active
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${d.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {hasPermission('client-directory', 'READ') && (
                        <button
                          onClick={() => {
                            setSelectedClient(d);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {hasPermission('client-directory', 'UPDATE') && (
                        <button
                          onClick={() => {
                            setSelectedClient(d);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Client"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {hasPermission('client-directory', 'DELETE') && (
                        <button
                          onClick={() => handleDeleteClick(d)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Client"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredClients.length > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredClients.length)} of {filteredClients.length}</span>
          <div className="flex items-center gap-1">
            {renderPagination()}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <ClientForm isOpen onClose={() => setIsCreateModalOpen(false)} onSave={handleSave} />
      )}
      {isEditModalOpen && selectedClient && (
        <ClientForm isOpen onClose={() => setIsEditModalOpen(false)} onSave={handleSave} client={selectedClient} />
      )}
      {isDetailOpen && selectedClient && (
        <ClientDetails
          isOpen
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsEditModalOpen(true);
          }}
          client={selectedClient}
        />
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedClient?.name || ''}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ClientsPage;
