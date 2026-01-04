import React, { useState, useEffect, useCallback } from 'react';
import {
    AlertTriangle,
    Loader,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash,
    CheckCircle,
    Clock,
    Moon,
    Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// Pastikan path import service sesuai
import { shiftMasterService, clientService } from '../services/api';

// Import Component
import ShiftMasterForm from '../components/shift-master/ShiftMasterForm';
import ShiftMasterDetail from '../components/shift-master/ShiftMasterDetail';
import { ShiftMasterDTO } from '../types/shift-master';
import { Client } from '../types/client';

const ShiftMasterPage: React.FC = () => {
    // State Data
    const [shifts, setShifts] = useState<ShiftMasterDTO[]>([]);
    const [filteredShifts, setFilteredShifts] = useState<ShiftMasterDTO[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    // Filter State
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // UI State
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Modal Controls
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<ShiftMasterDTO | null>(null);

    const { authState } = useAuth();

    // --- 1. CORE DATA FETCHING FUNCTION ---
    const fetchData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            // Fetch Clients & Shifts secara paralel
            const [clientsData, shiftsData] = await Promise.all([
                clientService.getAllClients(),
                shiftMasterService.getAllShiftMasters()
            ]);

            setClients(clientsData);
            setShifts(shiftsData);

            // Auto select client pertama jika belum ada yang dipilih
            if (!selectedClientId && clientsData.length > 0) {
                // Prioritaskan client user saat ini jika ada, atau ambil yang pertama
                const defaultClient = clientsData[0];
                if (defaultClient?.id) {
                    setSelectedClientId(defaultClient.id);
                }
            }

            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [selectedClientId]); 

    // Initial Load
    useEffect(() => {
        fetchData();
    }, []); // Run once on mount

    // --- 2. FILTERING LOGIC ---
    useEffect(() => {
        let result = shifts;

        // Filter by Client
        if (selectedClientId) {
            result = result.filter(s => s.client.id === selectedClientId);
        }

        // Filter by Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(term) ||
                s.code.toLowerCase().includes(term)
            );
        }

        setFilteredShifts(result);
        setCurrentPage(1); // Reset pagination saat filter berubah
    }, [searchTerm, selectedClientId, shifts]);

    // --- 3. DELETE HANDLER ---
    const handleDeleteClick = (shift: ShiftMasterDTO) => {
        setSelectedShift(shift);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedShift?.id) return;
        
        setDeleteLoading(true);
        try {
            // Panggil API Delete yang sebenarnya
            await shiftMasterService.deleteShiftMaster(selectedShift.id);
            
            setNotification({ message: 'Shift deleted successfully', type: 'success' });
            
            // Refresh data tabel
            await fetchData(true); 
        } catch (e) {
            setNotification({ message: 'Failed to delete shift', type: 'error' });
        } finally {
            setDeleteLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedShift(null);
        }
    };

    // Helper Permission (Placeholder)
    const hasPermission = (menuName: string, permission: string): boolean => {
        // Implementasi real permission check di sini nanti
        return true; 
    };

    // Pagination Calculation
    const totalPages = Math.ceil(filteredShifts.length / perPage);
    const currentItems = filteredShifts.slice((currentPage - 1) * perPage, currentPage * perPage);

    // Notification Timer
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Shift Masters</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage working hours configuration.</p>
                </div>
                {hasPermission('shift_master', 'CREATE') && (
                    <button
                        onClick={() => { setSelectedShift(null); setIsCreateModalOpen(true); }}
                        className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07] transition-colors"
                    >
                        <Plus size={18} /> Add Shift
                    </button>
                )}
            </div>

            {/* Notifications */}
            {notification && (
                <div className={`mb-4 p-3 rounded-md flex gap-2 text-sm border items-center ${notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4">
                <div className="flex gap-3 w-full md:w-auto">
                    {/* Client Selector */}
                    <div className="relative">
                        <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="pl-3 pr-8 py-2 border rounded-md w-48 focus:ring-1 focus:ring-[#ff6908] focus:outline-none text-sm bg-white appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Select Client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search shift..."
                            className="pl-10 pr-4 py-2 border rounded-md w-64 focus:ring-1 focus:ring-[#ff6908] focus:outline-none text-sm"
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                </div>

                {/* Refresh Button */}
                <button 
                    onClick={() => fetchData(true)} 
                    disabled={loading} 
                    className="text-sm px-3 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div className="border rounded-md overflow-hidden mb-6 shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium text-gray-600">Shift Info</th>
                            <th className="px-4 py-3 font-medium text-gray-600">Schedule</th>
                            <th className="px-4 py-3 font-medium text-gray-600">Rules</th>
                            <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && shifts.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-10"><Loader size={24} className="animate-spin mx-auto text-gray-400" /></td></tr>
                        ) : error ? (
                            <tr><td colSpan={4} className="text-center py-6 text-red-500">{error}</td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-10 text-gray-500">No shifts found.</td></tr>
                        ) : (
                            currentItems.map(shift => (
                                <tr key={shift.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                                style={{ backgroundColor: shift.color || '#ccc' }}
                                            >
                                                {shift.code}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{shift.name}</div>
                                                <div className="text-xs text-gray-500">{shift.client.name}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        {shift.isDayOff ? (
                                            <span className="text-gray-400 italic flex items-center gap-1"><Clock size={12} /> Day Off</span>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-700 font-mono text-xs">
                                                <span>{shift.startTime ? shift.startTime.substring(0, 5) : '--:--'}</span>
                                                <span className="text-gray-400">➜</span>
                                                <span>{shift.endTime ? shift.endTime.substring(0, 5) : '--:--'}</span>
                                                {shift.isCrossDay && <Moon size={12} className="text-blue-500" />}
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {shift.isCrossDay && <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded border border-blue-100">Cross Day</span>}
                                            {shift.lateToleranceMinutes > 0 && <span className="px-2 py-0.5 text-[10px] bg-orange-50 text-orange-700 rounded border border-orange-100">Late: {shift.lateToleranceMinutes}m</span>}
                                            {shift.isDayOff && <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded border border-gray-200">Libur</span>}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {hasPermission('shift_master', 'READ') && (
                                                <button onClick={() => { setSelectedShift(shift); setIsDetailModalOpen(true); }} className="p-1 text-gray-400 hover:text-gray-800" title="View Detail">
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            {hasPermission('shift_master', 'UPDATE') && (
                                                <button onClick={() => { setSelectedShift(shift); setIsEditModalOpen(true); }} className="p-1 text-gray-400 hover:text-[#ff6908]" title="Edit">
                                                    <Pencil size={16} />
                                                </button>
                                            )}
                                            {hasPermission('shift_master', 'DELETE') && (
                                                <button onClick={() => handleDeleteClick(shift)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
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

            {/* Pagination */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Total {filteredShifts.length} items</span>
                <div className="flex gap-1">
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(c => c - 1)} 
                        className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">{currentPage}</span>
                    <button 
                        disabled={currentPage === totalPages || totalPages === 0} 
                        onClick={() => setCurrentPage(c => c + 1)} 
                        className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* --- INTEGRATED COMPONENTS --- */}

            {/* Create Modal */}
            <ShiftMasterForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                // Gunakan onSuccess untuk refresh data
                onSuccess={() => {
                    fetchData(true); 
                    setNotification({ message: 'Shift created successfully', type: 'success' });
                }}
                clientId={selectedClientId}
            />

            {/* Edit Modal */}
            <ShiftMasterForm
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedShift(null);
                }}
                onSuccess={() => {
                    fetchData(true);
                    setNotification({ message: 'Shift updated successfully', type: 'success' });
                }}
                clientId={selectedClientId}
                initialData={selectedShift}
            />

            {/* Detail Modal */}
            <ShiftMasterDetail
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setSelectedShift(null); }}
                data={selectedShift}
                onEdit={() => {
                    setIsDetailModalOpen(false);
                    setIsEditModalOpen(true);
                }}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={selectedShift ? `${selectedShift.name} (${selectedShift.code})` : ''}
                isLoading={deleteLoading}
            />
        </div>
    );
};

export default ShiftMasterPage;