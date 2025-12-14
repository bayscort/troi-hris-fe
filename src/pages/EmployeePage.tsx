// import React, { useState, useEffect } from 'react';
// import {
//   AlertTriangle,
//   Eye,
//   Loader,
//   Pencil,
//   Plus,
//   RefreshCw,
//   Search,
//   Trash,
//   CheckCircle
// } from 'lucide-react';
// import { employeeService } from '../services/api';
// import { Employee } from '../types/employee';
// import EmployeeForm from '../components/employees/EmployeeForm';
// import EmployeeDetails from '../components/employees/EmployeeDetails';
// import { useAuth } from '../context/AuthContext';
// import DeleteConfirmationModal from '../components/DeleteConfirmationModal';



// const EmployeesPage: React.FC = () => {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const perPage = 10;

//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

//   const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   const { authState } = useAuth();

//   const renderPagination = () => {
//     const pages = [];
//     const maxVisiblePages = 3;

//     const startPage = Math.max(2, currentPage - 1);
//     const endPage = Math.min(totalPages - 1, currentPage + 1);

//     pages.push(
//       <button
//         key="prev"
//         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//         disabled={currentPage === 1}
//         className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
//       >
//         &laquo;
//       </button>
//     );

//     if (totalPages <= maxVisiblePages + 2) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(
//           <button
//             key={i}
//             onClick={() => setCurrentPage(i)}
//             className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
//               }`}
//           >
//             {i}
//           </button>
//         );
//       }
//     } else {
//       pages.push(
//         <button
//           key={1}
//           onClick={() => setCurrentPage(1)}
//           className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1 ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
//             }`}
//         >
//           1
//         </button>
//       );

//       if (startPage > 2) {
//         pages.push(<span key="start-ellipsis" className="px-2">…</span>);
//       }

//       for (let i = startPage; i <= endPage; i++) {
//         pages.push(
//           <button
//             key={i}
//             onClick={() => setCurrentPage(i)}
//             className={`px-3 py-1 rounded-md border text-sm ${currentPage === i ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
//               }`}
//           >
//             {i}
//           </button>
//         );
//       }

//       if (endPage < totalPages - 1) {
//         pages.push(<span key="end-ellipsis" className="px-2">…</span>);
//       }

//       pages.push(
//         <button
//           key={totalPages}
//           onClick={() => setCurrentPage(totalPages)}
//           className={`px-3 py-1 rounded-md border text-sm ${currentPage === totalPages ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
//             }`}
//         >
//           {totalPages}
//         </button>
//       );
//     }

//     pages.push(
//       <button
//         key="next"
//         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//         disabled={currentPage === totalPages}
//         className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
//       >
//         &raquo;
//       </button>
//     );

//     return pages;
//   };



//   useEffect(() => {
//     const fetchEmployees = async () => {
//       setLoading(true);
//       try {
//         const data = await employeeService.getAllEmployees();
//         setEmployees(data);
//         setFilteredEmployees(data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch employees.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, [refreshTrigger]);

//   useEffect(() => {
//     const term = searchTerm.toLowerCase();
//     setFilteredEmployees(
//       employees.filter(d =>
//         d.name.toLowerCase().includes(term)
//       )
//     );
//     setCurrentPage(1);
//   }, [searchTerm, employees]);

//   const handleSave = () => {
//     setIsCreateModalOpen(false);
//     setIsEditModalOpen(false);
//     setSelectedEmployee(null);
//     setRefreshTrigger(prev => prev + 1);
//     setNotification({ message: 'Saved successfully', type: 'success' });
//   };

//   const handleDeleteClick = (employee: Employee) => {
//     setSelectedEmployee(employee);
//     setIsDeleteModalOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedEmployee?.id) return;
//     setDeleteLoading(true);
//     try {
//       await employeeService.deleteEmployee(selectedEmployee.id);
//       setNotification({ message: 'Deleted successfully', type: 'success' });
//       setRefreshTrigger(x => x + 1);
//     } catch (e) {
//       setNotification({ message: 'Failed to delete', type: 'error' });
//     } finally {
//       setDeleteLoading(false);
//       setIsDeleteModalOpen(false);
//       setSelectedEmployee(null);
//     }
//   };

//   const hasPermission = (menuName: string, permission: string): boolean => {
//     const menu = authState?.menus.find(m => m.name === menuName);
//     return menu ? menu.permissions.includes(permission) : false;
//   };

//   useEffect(() => {
//     if (notification) {
//       const timeout = setTimeout(() => setNotification(null), 4000);
//       return () => clearTimeout(timeout);
//     }
//   }, [notification]);

//   const totalPages = Math.ceil(filteredEmployees.length / perPage);
//   const currentEmployees = filteredEmployees.slice((currentPage - 1) * perPage, currentPage * perPage);

//   return (
//     <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold">Employees</h1>
//         {hasPermission('employee', 'CREATE') && (
//           <button
//             onClick={() => setIsCreateModalOpen(true)}
//             className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
//           >
//             <Plus size={18} /> Add Employee
//           </button>
//         )}
//       </div>

//       {notification && (
//         <div className={`mb-4 p-3 rounded-md flex gap-2 text-sm border ${notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
//           {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
//           <span>{notification.message}</span>
//         </div>
//       )}

//       <div className="flex justify-between items-center mb-4">
//         <div className="relative">
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={e => setSearchTerm(e.target.value)}
//             placeholder="Search employee…"
//             className="pl-10 pr-4 py-2 border rounded-md w-64 focus:ring-1 focus:ring-black focus:outline-none text-sm"
//           />
//           <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
//         </div>
//         <button onClick={() => setRefreshTrigger(prev => prev + 1)} disabled={loading} className="text-sm px-3 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100">
//           {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
//           Refresh
//         </button>
//       </div>

//       <div className="border rounded-md overflow-hidden mb-6">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 text-left">
//             <tr>
//               <th className="px-4 py-3 font-medium">ID</th>
//               <th className="px-4 py-3 font-medium">Name</th>
//               <th className="px-4 py-3 font-medium">License Number</th>
//               <th className="px-4 py-3 font-medium text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan={4} className="text-center py-6"><Loader size={20} className="animate-spin" /></td></tr>
//             ) : error ? (
//               <tr><td colSpan={4} className="text-center py-6 text-red-500">{error}</td></tr>
//             ) : currentEmployees.length === 0 ? (
//               <tr><td colSpan={4} className="text-center py-6 text-gray-500">No employees found.</td></tr>
//             ) : (
//               currentEmployees.map(d => (
//                 <tr key={d.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3">{d.id}</td>
//                   <td className="px-4 py-3">{d.name}</td>
//                   <td className="px-4 py-3">{d.licenseNumber}</td>
//                   <td className="px-4 py-3 flex justify-end gap-2">
//                     {hasPermission('employee', 'READ') && (
//                       <button onClick={() => { setSelectedEmployee(d); setIsDetailOpen(true); }} className="text-gray-500 hover:text-black">
//                         <Eye size={16} />
//                       </button>
//                     )}
//                     {hasPermission('employee', 'UPDATE') && (
//                       <button onClick={() => { setSelectedEmployee(d); setIsEditModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
//                         <Pencil size={16} />
//                       </button>
//                     )}
//                     {hasPermission('employee', 'DELETE') && (
//                       <button onClick={() => handleDeleteClick(d)} className="text-red-500 hover:text-red-700">
//                         <Trash size={16} />
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {filteredEmployees.length > 0 && (
//         <div className="flex justify-between items-center text-sm">
//           <span>Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredEmployees.length)} of {filteredEmployees.length}</span>
//           <div className="flex items-center gap-1">
//             {renderPagination()}
//           </div>
//         </div>
//       )}

//       {isCreateModalOpen && (
//         <EmployeeForm isOpen onClose={() => setIsCreateModalOpen(false)} onSave={handleSave} />
//       )}
//       {isEditModalOpen && selectedEmployee && (
//         <EmployeeForm isOpen onClose={() => setIsEditModalOpen(false)} onSave={handleSave} employee={selectedEmployee} />
//       )}
//       {isDetailOpen && selectedEmployee && (
//         <EmployeeDetails
//           isOpen
//           onClose={() => setIsDetailOpen(false)}
//           onEdit={() => {
//             setIsDetailOpen(false);
//             setIsEditModalOpen(true);
//           }}
//           employee={selectedEmployee}
//         />
//       )}
//       <DeleteConfirmationModal
//         isOpen={isDeleteModalOpen}
//         onClose={() => setIsDeleteModalOpen(false)}
//         onConfirm={confirmDelete}
//         itemName={selectedEmployee?.name || ''}
//         isLoading={deleteLoading}
//       />
//     </div>
//   );
// };

// export default EmployeesPage;
