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
  CheckCircle,
  Briefcase,
  UserMinus,
  MapPin
} from 'lucide-react';
import { employeeService } from '../services/api';
import { Employee } from '../types/employee';
// Asumsi Anda akan membuat komponen ini nanti
// import EmployeeForm from '../components/employee/EmployeeForm'; 
// import EmployeeDetails from '../components/employee/EmployeeDetails';
import { useAuth } from '../context/AuthContext';
// import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
// import OffboardModal from '../components/employee/OffboardModal'; // Modal khusus resign

const ActiveEmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isOffboardModalOpen, setIsOffboardModalOpen] = useState(false); // Ganti delete jadi Offboard

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { authState } = useAuth();

  // --- Pagination Logic (Sama persis dengan ClientPage) ---
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;
    const totalPages = Math.ceil(filteredEmployees.length / perPage);

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        &laquo;
      </button>
    );

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPageButton(i));
      }
    } else {
      pages.push(renderPageButton(1));
      if (startPage > 2) pages.push(<span key="start-ellipsis" className="px-2">…</span>);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(renderPageButton(i));
      }
      if (endPage < totalPages - 1) pages.push(<span key="end-ellipsis" className="px-2">…</span>);
      pages.push(renderPageButton(totalPages));
    }

    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        &raquo;
      </button>
    );

    return pages;
  };

  const renderPageButton = (i: number) => (
    <button
      key={i}
      onClick={() => setCurrentPage(i)}
      className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
    >
      {i}
    </button>
  );
  // -----------------------------------------------------

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        // Fetch khusus status DEPLOYED & INTERNAL (Active)
        const data = await employeeService.getEmployees('DEPLOYED'); 
        setEmployees(data);
        setFilteredEmployees(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch employees.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [refreshTrigger]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredEmployees(
      employees.filter(e =>
        e.fullName.toLowerCase().includes(term) || 
        e.employeeNumber.toLowerCase().includes(term) ||
        (e.currentClient && e.currentClient.toLowerCase().includes(term))
      )
    );
    setCurrentPage(1);
  }, [searchTerm, employees]);

  const handleSave = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    setRefreshTrigger(prev => prev + 1);
    setNotification({ message: 'Saved successfully', type: 'success' });
  };

  const handleOffboardClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsOffboardModalOpen(true);
  };

  const confirmOffboard = async (reason: string, date: string) => {
    if (!selectedEmployee?.id) return;
    setActionLoading(true);
    try {
      await employeeService.offboardEmployee(selectedEmployee.id, { reason, effectiveDate: date });
      setNotification({ message: 'Employee offboarded successfully', type: 'success' });
      setRefreshTrigger(x => x + 1);
    } catch (e) {
      setNotification({ message: 'Failed to offboard employee', type: 'error' });
    } finally {
      setActionLoading(false);
      setIsOffboardModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  const hasPermission = (menuName: string, permission: string): boolean => {
    // Logic permission disesuaikan
    // const menu = authState?.menus.find(m => m.name === menuName);
    // return menu ? menu.permissions.includes(permission) : false;
    return true; // Bypass for dev
  };

  useEffect(() => {
    if (notification) {
      const timeout = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [notification]);

  const totalPages = Math.ceil(filteredEmployees.length / perPage);
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-semibold">Active Employees</h1>
            <p className="text-gray-500 text-sm mt-1">Manage deployed employees and internal staff.</p>
        </div>
        
        {hasPermission('employee-management', 'CREATE') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07] transition-colors"
          >
            <Plus size={18} /> Onboard Employee
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
            placeholder="Search name, NIP, or client..."
            className="pl-10 pr-4 py-2 border rounded-md w-72 focus:ring-1 focus:ring-black focus:outline-none text-sm"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <button onClick={() => setRefreshTrigger(prev => prev + 1)} disabled={loading} className="text-sm px-3 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100">
          {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      <div className="border rounded-md overflow-hidden mb-6 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500 w-16">NIP</th>
              <th className="px-4 py-3 font-medium text-gray-700">Employee Name</th>
              <th className="px-4 py-3 font-medium text-gray-700">Current Placement</th>
              <th className="px-4 py-3 font-medium text-gray-700">Contact</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-center">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
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
            ) : currentEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  <p>No active employees found.</p>
                </td>
              </tr>
            ) : (
              currentEmployees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  {/* NIP */}
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {e.employeeNumber}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{e.fullName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                       ID: {e.identityNumber || '-'}
                    </div>
                  </td>

                  {/* Placement Info (Fitur Utama Outsourcing) */}
                  <td className="px-4 py-3">
                    {e.currentClient ? (
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-gray-900 font-medium">
                                <Briefcase size={14} className="text-orange-500" />
                                {e.currentClient}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 ml-0.5">
                                <MapPin size={12} />
                                {e.jobTitle || 'No Title'}
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 italic text-xs">Internal / No Placement</span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="text-gray-900 text-sm">
                      {e.email}
                    </div>
                    {e.phoneNumber && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {e.phoneNumber}
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                        ${e.status === 'DEPLOYED' 
                            ? 'bg-green-50 text-green-700 border border-green-100' 
                            : 'bg-blue-50 text-blue-700 border border-blue-100' // Internal
                        }`}
                    >
                      {e.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {hasPermission('employee-management', 'READ') && (
                        <button
                          onClick={() => {
                            setSelectedEmployee(e);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="View 360 Profile"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      
                      {hasPermission('employee-management', 'UPDATE') && (
                        <button
                          onClick={() => {
                            setSelectedEmployee(e);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {/* Tombol Khusus HRIS: Offboarding/Resign */}
                      {hasPermission('employee-management', 'DELETE') && (
                        <button
                          onClick={() => handleOffboardClick(e)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Offboard / Resign"
                        >
                          <UserMinus size={16} />
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

      {filteredEmployees.length > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredEmployees.length)} of {filteredEmployees.length}</span>
          <div className="flex items-center gap-1">
            {renderPagination()}
          </div>
        </div>
      )}

      {/* Modals Placeholders */}
      {isCreateModalOpen && (
        // Gunakan komponen EmployeeForm nanti
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Onboard New Employee</h2>
                <p>Form component goes here...</p>
                <button onClick={() => setIsCreateModalOpen(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
        </div>
      )}

      {/* Offboard Modal (Gantikan DeleteConfirmation) */}
      {isOffboardModalOpen && selectedEmployee && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white p-6 rounded-lg w-[400px]">
             <div className="flex items-center gap-3 text-red-600 mb-4">
                 <AlertTriangle size={24} />
                 <h2 className="text-xl font-bold">Confirm Offboarding</h2>
             </div>
             <p className="text-sm text-gray-600 mb-4">
                 Are you sure you want to offboard <b>{selectedEmployee.fullName}</b>? 
                 This will terminate their active placement and disable app access.
             </p>
             
             {/* Simple Form Placeholder for Reason */}
             <div className="space-y-3 mb-6">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Effective Date</label>
                    <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                    <select className="w-full border rounded px-2 py-1.5 text-sm">
                        <option>Resign</option>
                        <option>Contract Ended</option>
                        <option>Terminated</option>
                    </select>
                </div>
             </div>

             <div className="flex justify-end gap-2">
                 <button onClick={() => setIsOffboardModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Cancel</button>
                 <button 
                    onClick={() => confirmOffboard('Resign', new Date().toISOString())} 
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 text-sm"
                 >
                    {actionLoading && <Loader size={14} className="animate-spin" />}
                    Confirm Offboard
                 </button>
             </div>
         </div>
     </div>
      )}

    </div>
  );
};

export default ActiveEmployeesPage;