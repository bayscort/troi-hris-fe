import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Loader,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash
} from 'lucide-react';
import { contractorService } from '../services/api';
import { Contractor } from '../types/contractor';
import ContractorForm from '../components/contractor/ContractorForm';
import ContractorDetails from '../components/contractor/ContractorDetails';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';



const ContractorsPage: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const perPage = 10;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

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


  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  useEffect(() => {
    const fetchContractors = async () => {
      setLoading(true);
      try {
        const data = await contractorService.getAllContractors();
        setContractors(data);
        setFilteredContractors(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch contractors. Please try again later.');
        console.error('Error fetching contractors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContractors();
  }, [refreshTrigger]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredContractors(
      contractors.filter(c =>
        c.name.toLowerCase().includes(term)
      )
    );
    setCurrentPage(1);
  }, [searchTerm, contractors]);

  const totalPages = Math.ceil(filteredContractors.length / perPage);
  const currentContractors = filteredContractors.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleContractorSaved = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedContractor(null);
    setRefreshTrigger(prev => prev + 1);
    setNotification({ message: 'Saved successfully', type: 'success' });
  };

  const handleDeleteClick = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedContractor?.id) return;
    setDeleteLoading(true);
    try {
      await contractorService.deleteContractor(selectedContractor.id);
      setNotification({ message: 'Deleted successfully', type: 'success' });
      setRefreshTrigger(x => x + 1);
    } catch (e) {
      setNotification({ message: 'Failed to delete', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedContractor(null);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Contractors</h1>
        {hasPermission('contractor', 'CREATE') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
          >
            <Plus size={18} /> Add Contractor
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
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search contractor..."
            className="pl-10 pr-4 py-2 border rounded-md w-64 focus:ring-1 focus:ring-black focus:outline-none text-sm"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <button
          onClick={() => setRefreshTrigger(x => x + 1)}
          disabled={loading}
          className="text-sm px-3 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      <div className="border rounded-md overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-6"><Loader size={20} className="animate-spin" /></td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-6 text-red-500">{error}</td></tr>
            ) : currentContractors.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">No contractors found.</td></tr>
            ) : (
              currentContractors.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{c.id}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.phoneNumber}</td>

                  <td className="px-4 py-3 flex justify-end gap-2">
                    {hasPermission('contractor', 'READ') && (
                      <button onClick={() => { setSelectedContractor(c); setIsDetailsModalOpen(true); }} className="text-gray-500 hover:text-black">
                        <Eye size={16} />
                      </button>
                    )}
                    {hasPermission('contractor', 'UPDATE') && (
                      <button onClick={() => { setSelectedContractor(c); setIsEditModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={16} />
                      </button>
                    )}
                    {hasPermission('contractor', 'DELETE') && (
                      <button onClick={() => handleDeleteClick(c)} className="text-red-500 hover:text-red-700">
                        <Trash size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredContractors.length > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredContractors.length)} of {filteredContractors.length}</span>
          <div className="flex items-center gap-1">
            {renderPagination()}
          </div>
        </div>

      )}

      {isCreateModalOpen && (
        <ContractorForm isOpen onClose={() => setIsCreateModalOpen(false)} onSave={handleContractorSaved} />
      )}
      {isEditModalOpen && selectedContractor && (
        <ContractorForm isOpen onClose={() => setIsEditModalOpen(false)} onSave={handleContractorSaved} contractor={selectedContractor} />
      )}
      {isDetailsModalOpen && selectedContractor && (
        <ContractorDetails
          isOpen
          onClose={() => setIsDetailsModalOpen(false)}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsEditModalOpen(true);
          }}
          contractor={selectedContractor}
        />
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedContractor?.name || ''}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ContractorsPage;
