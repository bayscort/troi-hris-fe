import React, { useState, useEffect } from 'react';
import { fetchRolePermissions, fetchAllMenus, fetchAllPermissions, updateRolePermissions } from '../services/api';
import { RoleWithMenus, MenuPermission, AllMenu, AllPermission } from '../types/role-menu-permission';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { toast } from 'react-toastify';

interface EditRolePermissionProps {
  roleId: string;
  onClose: () => void;
}

const EditRolePermission: React.FC<EditRolePermissionProps> = ({ roleId, onClose }) => {
  const [roleData, setRoleData] = useState<RoleWithMenus | null>(null);
  const [allMenus, setAllMenus] = useState<AllMenu[]>([]);
  const [allPermissions, setAllPermissions] = useState<AllPermission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<{ [menuId: string]: string[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [rolePermissionsData, menusData, permissionsData] = await Promise.all([
          fetchRolePermissions(),
          fetchAllMenus(),
          fetchAllPermissions()
        ]);
        
        setAllMenus(menusData);
        setAllPermissions(permissionsData);
        
        const role = rolePermissionsData.find((r: RoleWithMenus) => r.role.id === (roleId || ''));
        
        if (role) {
          setRoleData(role);
          
          const initialPermissions: { [menuId: string]: string[] } = {};
          interface MenuWithPermissions {
            id: string;
            permissionList: { id: string }[];
          }

          const roleMenuList: MenuWithPermissions[] = role.menuList;

          roleMenuList.forEach((menu: MenuWithPermissions) => {
            initialPermissions[menu.id] = menu.permissionList.map((p: { id: string }) => p.id);
          });
          
          setSelectedPermissions(initialPermissions);
          setError(null);
        } else {
          setError('Role not found');
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  const handlePermissionChange = (menuId: string, permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const updatedPermissions = { ...prev };
      
      if (!updatedPermissions[menuId]) {
        updatedPermissions[menuId] = [];
      }
      
      if (checked) {
        if (!updatedPermissions[menuId].includes(permissionId)) {
          updatedPermissions[menuId] = [...updatedPermissions[menuId], permissionId];
        }
      } else {
        updatedPermissions[menuId] = updatedPermissions[menuId].filter(
          (id) => id !== permissionId
        );
      }
      
      return updatedPermissions;
    });
  };

  const isPermissionSelected = (menuId: string, permissionId: string) => {
    return selectedPermissions[menuId]?.includes(permissionId) || false;
  };

  const handleSubmit = async () => {
    if (!roleData) return;
    
    try {
      setSaving(true);
      
      const menuPermissions: MenuPermission[] = Object.entries(selectedPermissions).map(
        ([menuId, permissionIds]) => ({
          menuId: menuId,
          permissionIds,
        })
      );
      
      await updateRolePermissions(roleData.role.id, menuPermissions);
      
      toast.success('Role permissions updated successfully');
      onClose();
    } catch (err) {
      console.error('Error updating role permissions:', err);
      toast.error('Failed to update role permissions');
    } finally {
      setSaving(false);
    }
  };

  const commonOperationTypes = ['READ', 'CREATE', 'UPDATE', 'DELETE'];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !roleData) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-red-500">{error || 'Role data not available'}</p>
        <button
          onClick={onClose}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ff6908] hover:bg-[#e55e07] focus:outline-none"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Edit Role Permissions: {roleData.role.name}</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ff6908] hover:bg-[#e55e07] focus:outline-none ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="space-y-8">
          {allMenus.map((menu) => (
            <div key={menu.id} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 capitalize">{menu.name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {commonOperationTypes.map((operation) => {
                  const operationPermissions = allPermissions.filter(
                    p => p.operation === operation
                  );
                  
                  if (operationPermissions.length === 0) return null;
                  
                  return (
                    <div key={`${menu.id}-${operation}`} className="bg-white p-4 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">{operation}</h4>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {operationPermissions.map((permission) => {
                          const isSelected = isPermissionSelected(menu.id, permission.id);
                          
                          return (
                            <div
                              key={permission.id}
                              onClick={() => handlePermissionChange(menu.id, permission.id, !isSelected)}
                              className={`
                                flex items-center gap-2 p-3 rounded-md border transition-all duration-200 permission-toggle cursor-pointer
                                ${isSelected 
                                  ? 'bg-green-50 border-green-200 text-green-700' 
                                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                                }
                              `}
                            >
                              <div className={`
                                flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center
                                ${isSelected ? 'bg-green-100' : 'bg-gray-200'}
                              `}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{permission.name || `${menu.name} ${operation}`}</p>
                                {permission.description && (
                                  <p className="text-xs opacity-70">{permission.description}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditRolePermission;