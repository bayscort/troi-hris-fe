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
import { roleService } from '../services/api';
import { Role } from '../types/role';
import RoleForm from '../components/role/RoleForm';
import RoleDetails from '../components/role/RoleDetails';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';


const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
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
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { authState } = useAuth();

  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const data = await roleService.getAllRoles();
        setRoles(data);
        setFilteredRoles(data);
        setError(null);
      } catch {
        setError('Failed to fetch roles.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [refreshTrigger]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredRoles(
      roles.filter(role => role.name.toLowerCase().includes(term))
    );
    setCurrentPage(1);
  }, [searchTerm, roles]);

  const handleSave = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedRole(null);
    setRefreshTrigger(x => x + 1);
    setNotification({ message: 'Saved successfully', type: 'success' });
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRole?.id) return;
    setDeleteLoading(true);
    try {
      await roleService.deleteRole(selectedRole.id);
      setNotification({ message: 'Deleted successfully', type: 'success' });
      setRefreshTrigger(x => x + 1);
    } catch (e) {
      setNotification({ message: 'Failed to delete', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
    }
  };

  useEffect(() => {
    if (notification) {
      const tm = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(tm);
    }
  }, [notification]);

  const totalPages = Math.ceil(filteredRoles.length / perPage);
  const cur = filteredRoles.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Roles</h1>
        {hasPermission('role', 'CREATE') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
          >
            <Plus size={18} /> Add Role
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
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search role…" className="pl-10 pr-4 py-2 border rounded-md w-64 focus:ring-1 focus:ring-black focus:outline-none text-sm" />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <button onClick={() => setRefreshTrigger(x => x + 1)} disabled={loading} className="text-sm px-3 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100">
          {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      <div className="border rounded-md overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Role Name</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-6"><Loader size={20} className="animate-spin" /></td></tr>
            ) : error ? (
              <tr><td colSpan={3} className="text-center py-6 text-red-500">{error}</td></tr>
            ) : cur.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-6 text-gray-500">No roles found.</td></tr>
            ) : (
              cur.map(role => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{role.id}</td>
                  <td className="px-4 py-3">{role.name}</td>

                  <td className="px-4 py-3 flex justify-end gap-2">
                    {hasPermission('role', 'READ') && (
                      <button onClick={() => { setSelectedRole(role); setIsDetailOpen(true); }} className="text-gray-500 hover:text-black">
                        <Eye size={16} />
                      </button>
                    )}
                    {hasPermission('role', 'UPDATE') && (
                      <button onClick={() => { setSelectedRole(role); setIsEditModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={16} />
                      </button>
                    )}
                    {hasPermission('role', 'DELETE') && (
                      <button onClick={() => handleDeleteClick(role)} className="text-red-500 hover:text-red-700">
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

      {filteredRoles.length > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredRoles.length)} of {filteredRoles.length}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded-md border text-sm ${currentPage === p ? 'bg-[#ff6908] text-white' : 'bg-white text-gray-700 hover:bg-[#e55e07]'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <RoleForm isOpen onClose={() => setIsCreateModalOpen(false)} onSave={handleSave} />
      )}
      {isEditModalOpen && selectedRole && (
        <RoleForm isOpen onClose={() => setIsEditModalOpen(false)} onSave={handleSave} role={selectedRole} />
      )}
      {isDetailOpen && selectedRole && (
        <RoleDetails isOpen onClose={() => setIsDetailOpen(false)} onEdit={() => {
          setIsDetailOpen(false);
          setIsEditModalOpen(true);
        }} role={selectedRole} />
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedRole?.name || ''}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default RolesPage;
