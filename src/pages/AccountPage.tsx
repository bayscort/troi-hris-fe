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
import { accountService, locationService } from '../services/api';
import { AccountResp } from '../types/account';
import AccountForm from '../components/account/AccountForm';
import AccountDetails from '../components/account/AccountDetails';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { Estate } from '../types/location';



const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountResp[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountResp[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<AccountResp | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { authState } = useAuth();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

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
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const data = await accountService.getAllAccounts();
        setAccounts(data);
        setFilteredAccounts(data);

        const es = await locationService.getAllEstates();
        setEstates(es);
        setError(null);
      } catch (err) {
        setError('Failed to fetch accounts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [refreshTrigger]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredAccounts(
      accounts.filter(d =>
        d.name.toLowerCase().includes(term)
      )
    );
    setCurrentPage(1);
  }, [searchTerm, accounts]);

  const handleSave = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedAccount(null);
    setRefreshTrigger(prev => prev + 1);
    setNotification({ message: 'Saved successfully', type: 'success' });
  };

  const handleDeleteClick = (account: AccountResp) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAccount?.id) return;
    setDeleteLoading(true);
    try {
      await accountService.deleteAccount(selectedAccount.id);
      setNotification({ message: 'Deleted successfully', type: 'success' });
      setRefreshTrigger(x => x + 1);
    } catch (e) {
      setNotification({ message: 'Failed to delete', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedAccount(null);
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

  const totalPages = Math.ceil(filteredAccounts.length / perPage);
  const currentAccounts = filteredAccounts.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        {hasPermission('account', 'CREATE') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
          >
            <Plus size={18} /> Add Account
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
            placeholder="Search account…"
            className="pl-10 pr-4 py-2 border rounded-md w-64 focus:ring-1 focus:ring-black focus:outline-none text-sm"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <button onClick={() => setRefreshTrigger(prev => prev + 1)} disabled={loading} className="text-sm px-3 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100">
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
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-6"><Loader size={20} className="animate-spin" /></td></tr>
            ) : error ? (
              <tr><td colSpan={4} className="text-center py-6 text-red-500">{error}</td></tr>
            ) : currentAccounts.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-6 text-gray-500">No accounts found.</td></tr>
            ) : (
              currentAccounts.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{d.id}</td>
                  <td className="px-4 py-3">{d.name}</td>
                  <td className="px-4 py-3">{d.accountType}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(d.balance)}
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    {hasPermission('account', 'READ') && (
                      <button onClick={() => { setSelectedAccount(d); setIsDetailOpen(true); }} className="text-gray-500 hover:text-black">
                        <Eye size={16} />
                      </button>
                    )}
                    {hasPermission('account', 'UPDATE') && (
                      <button onClick={() => { setSelectedAccount(d); setIsEditModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={16} />
                      </button>
                    )}
                    {hasPermission('account', 'DELETE') && (
                      <button onClick={() => handleDeleteClick(d)} className="text-red-500 hover:text-red-700">
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

      {filteredAccounts.length > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredAccounts.length)} of {filteredAccounts.length}</span>
          <div className="flex items-center gap-1">
            {renderPagination()}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <AccountForm isOpen onClose={() => setIsCreateModalOpen(false)} onSave={handleSave} estates={estates} />
      )}
      {isEditModalOpen && selectedAccount && (
        <AccountForm isOpen onClose={() => setIsEditModalOpen(false)} onSave={handleSave} account={selectedAccount} estates={estates} />
      )}
      {isDetailOpen && selectedAccount && (
        <AccountDetails
          isOpen
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsEditModalOpen(true);
          }}
          account={selectedAccount}
        />
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedAccount?.name || ''}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default AccountsPage;
