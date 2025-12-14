import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Eye, Loader, Plus, RefreshCw, Search, Pencil } from 'lucide-react';
import { FundRequest } from '../types/fund-request';
import { FinanceItem } from '../types/finance-item';
import { financeItemService, fundRequestService } from '../services/api';
import FundRequestForm from '../components/fund-request/FundRequestForm';
import FundRequestDetails from '../components/fund-request/FundRequestDetails';
import { useAuth } from '../context/AuthContext';
import ApprovalActionModal from '../components/fund-request/ApprovalActionModal';
import FundRequestApprovalSection from '../components/fund-request/FundRequestApprovalSection';


const FundRequestPage: React.FC = () => {
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([]);
  const [financeItems, setFinanceItems] = useState<FinanceItem[]>([]);
  const [filteredFundRequests, setFilteredFundRequests] = useState<FundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedFundRequest, setSelectedFundRequest] = useState<FundRequest | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { authState } = useAuth();

  const [approvalRequests, setApprovalRequests] = useState<FundRequest[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(true);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'approve' | 'reject';
    fundRequest: FundRequest;
  } | null>(null);

  const approvalDetails = useMemo(() => {
    const role = localStorage.getItem('role');
    switch (role) {
      case 'STAFF':
        return { stage: 'ACKNOWLEDGED_BY_STAFF_OPS', label: 'Acknowledge' };
      case 'MANAGER OPS':
        return { stage: 'APPROVED_BY_MANAGER_OPS', label: 'Approve' };
      case 'FINANCE':
        return { stage: 'REVIEWED_BY_FINANCE', label: 'Review' };
      case 'MANAGER FIN':
        return { stage: 'APPROVED_BY_MANAGER_FIN', label: 'Approve' };
      case 'DIRECTOR':
        return { stage: 'APPROVED_BY_DIRECTOR', label: 'Approve' };
      default:
        return { stage: '', label: 'Approve' };
    }
  }, []);

  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [frs, fis] = await Promise.all([
          fundRequestService.getAllFundRequests(),
          financeItemService.getAllFinanceItems()
        ]);
        setFundRequests(frs);
        setFinanceItems(fis);
        setFilteredFundRequests(frs);
        setError(null);
      } catch (e) {
        setError('Failed loading data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchApprovalRequests = async () => {
      const role = localStorage.getItem('role');
      if (!role) {
        setApprovalLoading(false);
        return;
      }

      setApprovalLoading(true);
      try {
        const data = await fundRequestService.getFundRequestsByRole(role);
        setApprovalRequests(data);
        setApprovalError(null);
      } catch (e) {
        console.error("Failed to fetch approval requests:", e);
        setApprovalError('Failed to load requests awaiting your approval.');
      } finally {
        setApprovalLoading(false);
      }
    };

    fetchApprovalRequests();
  }, [refreshTrigger]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredFundRequests(
      fundRequests.filter(fr =>
        fr.fundRequestCode.toLowerCase().includes(term) ||
        fr.fundRequestItemList.some(item =>
          item.description.toLowerCase().includes(term) ||
          item.financeItem.name.toLowerCase().includes(term)
        )
      )
    );
    setCurrentPage(1);
  }, [searchTerm, fundRequests]);

  const renderStatusBadge = (fr: FundRequest) => {
    const lastLog = fr.fundRequestApprovalLogList?.length
      ? [...fr.fundRequestApprovalLogList].sort((a, b) => new Date(b.stageTimestamp).getTime() - new Date(a.stageTimestamp).getTime())[0]
      : null;

    const status = lastLog?.approvalStage || 'DRAFT';

    let colorClass = '';
    let label = '';

    switch (status) {
      case 'SUBMITTED_BY_ADMIN_OPS':
        colorClass = 'bg-gray-200 text-gray-800';
        label = 'Submitted';
        break;
      case 'ACKNOWLEDGED_BY_STAFF_OPS':
        colorClass = 'bg-yellow-100 text-yellow-800';
        label = 'Acknowledged';
        break;
      case 'APPROVED_BY_MANAGER_OPS':
        colorClass = 'bg-blue-100 text-blue-800';
        label = 'Approved by Manager Ops';
        break;
      case 'REVIEWED_BY_FINANCE':
        colorClass = 'bg-purple-100 text-purple-800';
        label = 'Reviewed by Finance';
        break;
      case 'APPROVED_BY_MANAGER_FIN':
        colorClass = 'bg-green-100 text-green-800';
        label = 'Approved by Manager Fin';
        break;
      case 'APPROVED_BY_DIRECTOR':
        colorClass = 'bg-green-200 text-green-900';
        label = 'Approved by Director';
        break;
      case 'REJECTED':
        colorClass = 'bg-red-100 text-red-800';
        label = 'Rejected';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-600';
        label = status;
        break;
    }

    return (
      <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${colorClass}`}>
        {label}
      </span>
    );
  };


  const handleSave = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedFundRequest(null);
    setRefreshTrigger(x => x + 1);
    setNotification({ message: 'Saved successfully', type: 'success' });
  };

  useEffect(() => {
    if (notification) {
      const tm = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(tm);
    }
  }, [notification]);

  const handleApprovalSubmit = async (notes: string) => {
    if (!currentAction) return;

    setActionInProgress(true);
    try {
      const payload = {
        approvalStage: currentAction.type === 'approve' ? approvalDetails.stage : 'REJECTED',
        stageTimestamp: null,
        notes: notes || 'N/A',
        fundRequestId: currentAction.fundRequest.id,
      };

      await fundRequestService.createApprovalLog(payload);

      setNotification({ message: 'Action submitted successfully!', type: 'success' });
      setRefreshTrigger(x => x + 1);
      setIsApprovalModalOpen(false);
      setCurrentAction(null);
    } catch (error) {
      console.error('Failed to submit approval:', error);
      setNotification({ message: 'Failed to submit action.', type: 'error' });
    } finally {
      setActionInProgress(false);
    }
  };

  const totalPages = Math.ceil(filteredFundRequests.length / perPage);
  const cur = filteredFundRequests.slice((currentPage - 1) * perPage, currentPage * perPage);


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
            className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
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
          className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1 ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
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
            className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
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
          className={`px-3 py-1 rounded-md border text-sm ${currentPage === totalPages ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
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


  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Fund Requests</h1>
        {hasPermission('fund-request', 'CREATE') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
          >
            <Plus size={18} /> Add Fund Request
          </button>
        )}
      </div>

      <FundRequestApprovalSection
        approvalRequests={approvalRequests}
        loading={approvalLoading}
        error={approvalError}
        onApprove={(fr) => {
          setCurrentAction({ type: 'approve', fundRequest: fr });
          setIsApprovalModalOpen(true);
        }}
        onReject={(fr) => {
          setCurrentAction({ type: 'reject', fundRequest: fr });
          setIsApprovalModalOpen(true);
        }}
        onView={(fr) => {
          setSelectedFundRequest(fr);
          setIsDetailOpen(true);
        }}
        onEdit={(fr) => {
          setSelectedFundRequest(fr);
          setIsEditModalOpen(true);
        }}
        canEdit={hasPermission('fund-request', 'UPDATE')}
        approvalLabel={approvalDetails.label}
      />

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
            placeholder="Search all fund requests…"
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
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Total Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-6"><Loader size={20} className="animate-spin inline-block" /></td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-6 text-red-500">{error}</td></tr>
            ) : cur.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">No fund requests found.</td></tr>
            ) : (
              cur.map(fr => (
                <tr key={fr.id} className="hover:bg-gray-50 border-b last:border-b-0">
                  <td className="px-4 py-3">{fr.id}</td>
                  <td className="px-4 py-3">{fr.fundRequestCode}</td>
                  <td className="px-4 py-3">{fr.date}</td>
                  <td className="px-4 py-3">{fr.totalAmount ? fr.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) : 'N/A'}</td>
                  <td className="px-4 py-3">
                    {renderStatusBadge(fr)}
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    {hasPermission('fund-request', 'READ') && (
                      <button onClick={() => { setSelectedFundRequest(fr); setIsDetailOpen(true); }} className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-100">
                        <Eye size={16} />
                      </button>
                    )}
                    {hasPermission('fund-request', 'UPDATE') && (
                      <button onClick={() => { setSelectedFundRequest(fr); setIsEditModalOpen(true); }} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50">
                        <Pencil size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredFundRequests.length > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredFundRequests.length)} of {filteredFundRequests.length}</span>
          <div className="flex items-center gap-1">
            {renderPagination()}
          </div>
        </div>
      )}

      {isCreateModalOpen && <FundRequestForm isOpen onClose={() => setIsCreateModalOpen(false)} onSave={handleSave} financeItems={financeItems} />}
      {isEditModalOpen && selectedFundRequest && <FundRequestForm isOpen onClose={() => setIsEditModalOpen(false)} onSave={handleSave} fundRequest={selectedFundRequest} financeItems={financeItems} />}
      {isDetailOpen && selectedFundRequest && <FundRequestDetails isOpen onClose={() => setIsDetailOpen(false)} onEdit={() => { setIsDetailOpen(false); setIsEditModalOpen(true); }} fundRequest={selectedFundRequest} />}

      {currentAction && (
        <ApprovalActionModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          onSubmit={handleApprovalSubmit}
          actionType={currentAction.type}
          actionLabel={currentAction.type === 'approve' ? approvalDetails.label : 'Reject'}
          fundRequestCode={currentAction.fundRequest.fundRequestCode}
          loading={actionInProgress}
        />
      )}
    </div>
  );
};

export default FundRequestPage;