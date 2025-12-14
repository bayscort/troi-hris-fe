import React, { useEffect, useState } from 'react';
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
import { User, Role } from '../types/user';
import { Estate } from '../types/location';
import { userService, roleService, locationService } from '../services/api';
import UserForm from '../components/user/UserForm';
import UserDetails from '../components/user/UserDetails';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { authState } = useAuth();

  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [us, rs, es] = await Promise.all([
          userService.getAllUsers(),
          roleService.getAllRoles(),
          locationService.getAllEstates()
        ]);
        setUsers(us);
        setRoles(rs);
        setEstates(es);
        setFilteredUsers(us);
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
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(v =>
        (v.name?.toLowerCase() ?? '').includes(term) ||
        (v.role?.name?.toLowerCase() ?? '').includes(term)
      )
    );
    setCurrentPage(1);
  }, [searchTerm, users]);

  const handleSave = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setRefreshTrigger(x => x + 1);
    setNotification({ message: 'Saved successfully', type: 'success' });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser?.id) return;
    setDeleteLoading(true);
    try {
      await userService.deleteUser(selectedUser.id);
      setNotification({ message: 'Deleted successfully', type: 'success' });
      setRefreshTrigger(x => x + 1);
    } catch (e) {
      setNotification({ message: 'Failed to delete', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    if (notification) {
      const tm = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(tm);
    }
  }, [notification]);

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const cur = filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        {hasPermission('user', 'CREATE') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
          >
            <Plus size={18} /> Add User
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
            placeholder="Search user…"
            className="pl-10 pr-4 py-2 border rounded-md w-64 focus:ring-1 focus:ring-black focus:outline-none text-sm"
          />
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Estate</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-6"><Loader size={20} className="animate-spin" /></td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-6 text-red-500">{error}</td></tr>
            ) : cur.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">No users found.</td></tr>
            ) : (
              cur.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{v.id}</td>
                  <td className="px-4 py-3">{v.name}</td>
                  <td className="px-4 py-3">{v.role?.name}</td>
                  <td className="px-4 py-3">{v.estate?.name || '-'}</td>

                  <td className="px-4 py-3 flex justify-end gap-2">
                    {hasPermission('user', 'READ') && (
                      <button onClick={() => { setSelectedUser(v); setIsDetailOpen(true); }} className="text-gray-500 hover:text-black">
                        <Eye size={16} />
                      </button>
                    )}
                    {hasPermission('user', 'UPDATE') && (
                      <button onClick={() => { setSelectedUser(v); setIsEditModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={16} />
                      </button>
                    )}
                    {hasPermission('user', 'DELETE') && (
                      <button onClick={() => handleDeleteClick(v)} className="text-red-500 hover:text-red-700">
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

      {filteredUsers.length > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>
            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredUsers.length)} of {filteredUsers.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded-md border text-sm ${currentPage === p
                  ? 'bg-[#ff6908] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <UserForm isOpen onClose={() => setIsCreateModalOpen(false)} onSave={handleSave} roles={roles} estates={estates} />
      )}
      {isEditModalOpen && selectedUser && (
        <UserForm isOpen onClose={() => setIsEditModalOpen(false)} onSave={handleSave} user={selectedUser} roles={roles} estates={estates} />
      )}
      {isDetailOpen && selectedUser && (
        <UserDetails isOpen onClose={() => setIsDetailOpen(false)} onEdit={() => {
          setIsDetailOpen(false); setIsEditModalOpen(true);
        }} user={selectedUser} />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedUser?.name || ''}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default UsersPage;
