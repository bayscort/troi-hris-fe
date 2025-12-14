import React, { useState, useEffect } from 'react';
import {
  fetchRolePermissions,
  fetchAllMenus,
  fetchAllPermissions,
} from '../services/api';
import {
  RoleWithMenus,
  AllMenu,
  AllPermission,
} from '../types/role-menu-permission';
import LoadingSpinner from '../components/LoadingSpinner';
import EditRolePermission from '../components/EditRolePermission';
import { Check, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const RolePermissionsPage: React.FC = () => {
  const [rolePermissions, setRolePermissions] = useState<RoleWithMenus[]>([]);
  const [allMenus, setAllMenus] = useState<AllMenu[]>([]);
  const [allPermissions, setAllPermissions] = useState<AllPermission[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<{ [key: number]: boolean }>({});
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { authState } = useAuth();

  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolePermissionsData, menusData, permissionsData] = await Promise.all([
        fetchRolePermissions(),
        fetchAllMenus(),
        fetchAllPermissions(),
      ]);
      setRolePermissions(rolePermissionsData);
      setAllMenus(menusData);
      setAllPermissions(permissionsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch role permissions');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoleExpansion = (roleId: number) => {
    setExpandedRoles((prev) => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  const handleEditRole = (roleId: number) => setEditingRoleId(roleId);
  const handleCloseEdit = () => {
    setEditingRoleId(null);
    fetchData();
  };

  const isPermissionAssigned = (
    _roleId: number,
    menuId: number,
    permissionId: number,
    roleItem: RoleWithMenus
  ) => {
    const menu = roleItem.menuList.find((m) => m.id === menuId);
    return menu?.permissionList.some((p) => p.id === permissionId) || false;
  };

  const commonOperationTypes = ['READ', 'CREATE', 'UPDATE', 'DELETE'];

  if (loading) return <div className="p-6"><LoadingSpinner /></div>;
  if (error)
    return (
      <div className="p-6">
        <div className="border rounded-md p-4 bg-red-50 text-red-600">
          {error}
          <button
            onClick={fetchData}
            className="mt-4 bg-[#ff6908] text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  if (editingRoleId)
    return (
      <div className="p-6">
        <EditRolePermission roleId={editingRoleId.toString()} onClose={handleCloseEdit} />
      </div>
    );

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Role Permissions</h1>
        <p className="text-sm text-gray-500 mt-1">Manage role access for system menus and actions</p>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Role ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Menu Count</th>
              <th className="px-4 py-3 font-medium">Permissions</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rolePermissions.map((roleItem) => {
              const totalPermissions = roleItem.menuList.reduce((t, m) => t + m.permissionList.length, 0);
              const isExpanded = expandedRoles[roleItem.role.id] || false;
              return (
                <React.Fragment key={roleItem.role.id}>
                  <tr
                    className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleRoleExpansion(roleItem.role.id)}
                  >
                    <td className="px-4 py-3">{roleItem.role.id}</td>
                    <td className="px-4 py-3 font-medium">{roleItem.role.name}</td>
                    <td className="px-4 py-3">{roleItem.menuList.length}</td>
                    <td className="px-4 py-3">{totalPermissions}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-2">
                        {hasPermission('role-permission-configuration', 'UPDATE') && (

                          <button
                            className="text-[#ff6908] hover:text-[#b94d06]"
                            onClick={() => handleEditRole(roleItem.role.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-gray-500 hover:text-black">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-6 py-4">
                        <h3 className="text-sm font-semibold mb-4">
                          Permissions for <span className="text-gray-700">{roleItem.role.name}</span>
                        </h3>
                        <div className="space-y-4">
                          {allMenus.map((menu) => (
                            <div key={menu.id} className="bg-white border rounded-md p-4">
                              <h4 className="font-medium mb-3 capitalize text-sm">{menu.name}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {commonOperationTypes.map((operation) => {
                                  const permissions = allPermissions.filter((p) => p.operation === operation);
                                  return permissions.map((permission) => {
                                    const isAssigned = isPermissionAssigned(
                                      roleItem.role.id,
                                      menu.id,
                                      permission.id,
                                      roleItem
                                    );
                                    return (
                                      <div
                                        key={`${menu.id}-${permission.id}`}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md border text-xs font-medium
                                          ${isAssigned
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-100 text-gray-500 border-gray-200'}
                                        `}
                                      >
                                        <span>{permission.operation}</span>
                                        {isAssigned && <Check className="w-4 h-4" />}
                                      </div>
                                    );
                                  });
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolePermissionsPage;
