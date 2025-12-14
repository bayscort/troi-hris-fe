import React, { useState, useEffect } from 'react';
import { Role } from '../../types/role';
import { roleService } from '../../services/api';
import { AlertTriangle, Loader, X } from 'lucide-react';

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  role?: Role;
}

const RoleForm: React.FC<RoleFormProps> = ({ isOpen, onClose, onSave, role }) => {
  const [formData, setFormData] = useState<Omit<Role, 'id'>>({
    name: '',
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    licenseNumber?: string;
  }>({});
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const isEditMode = !!role?.id;
  
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name
      });
    }
  }, [role]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    if (error) setError(null);
    if (success) setSuccess(null);
  };
  
  const validateForm = (): boolean => {
    const newErrors: { name?: string; licenseNumber?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditMode && role?.id) {
        await roleService.updateRole(role.id, { ...formData, id: role.id });
        setSuccess('Role updated successfully');
      } else {
        await roleService.createRole(formData);
        setSuccess('Role created successfully');
      }
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} role. Please try again.`);
      console.error('Error saving role:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Role' : 'Add New Role'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
              <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
              {success}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Role Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter role name"
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update Role' : 'Create Role'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
