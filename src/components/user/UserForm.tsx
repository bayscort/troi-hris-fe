import React, { useEffect, useState } from 'react';
import { User, Role, UserCreate } from '../../types/user';
import { Estate } from '../../types/location';
import { userService } from '../../services/api';
import { AlertTriangle, CheckCircle, Loader, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User;
  roles: Role[];
  estates: Estate[];
}

const UserForm: React.FC<Props> = ({ isOpen, onClose, onSave, user, roles, estates }) => {
  const isEdit = !!user?.id;

  const [formData, setFormData] = useState<Omit<UserCreate, 'id'>>({
    name: '',
    username: '',
    password: '',
    roleId: roles[0]?.id ?? 0,
    estateId: estates[0]?.id ?? null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        name: user.name,
        username: user.username,
        password: '',
        roleId: user.role?.id ?? roles[0]?.id ?? 0,
        estateId: user.estate?.id ?? null,
      });
    } else if (!isEdit && roles.length > 0) {
      setFormData({
        name: '',
        username: '',
        password: '',
        roleId: roles[0]?.id ?? 0,
        estateId: null,
      });
    }
  }, [user, roles, isEdit]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        username: '',
        password: '',
        roleId: roles[0]?.id ?? 0,
        estateId: null,
      });
      setErrors({});
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, roles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'roleId'
          ? parseInt(value)
          : name === 'estateId'
            ? value === '' ? null : parseInt(value)
            : value,
    }));
  };


  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!isEdit && !formData.password) errs.password = 'Password is required';
    if (!formData.roleId) errs.roleId = 'Role is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEdit && user?.id) {
        await userService.updateUser(user.id, formData);
        setSuccess('User updated successfully');
      } else {
        await userService.createUser(formData);
        setSuccess('User created successfully');
      }

      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${isEdit ? 'update' : 'create'} user. Please try again.`);
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
            {isEdit ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-start">
              <CheckCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter user name"
              className={`w-full px-3 py-2 border rounded-md ${errors.username ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password{isEdit && (
                <span className="text-gray-400 text-sm ml-1">(leave blank to keep current)</span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.roleId ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.roleId && <p className="text-sm text-red-500 mt-1">{errors.roleId}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estate</label>
            <select
              name="estateId"
              value={formData.estateId ?? ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.estateId ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff832f]`}
            >
              <option value="">Select origin</option>
              {estates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.estateId && <p className="text-sm text-red-500 mt-1">{errors.estateId}</p>}

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
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Update User' : 'Create User'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
