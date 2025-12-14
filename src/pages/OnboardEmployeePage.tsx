import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader, User, Briefcase } from "lucide-react";
import { OnboardEmployeeRequest } from "../types/employee";
import { employeeService, roleService } from "../services/api";
import { Role } from "../types/role";

const OnboardEmployeePage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const [formData, setFormData] = useState<OnboardEmployeeRequest>({
    fullName: "",
    employeeNumber: "",
    identityNumber: "",
    email: "",
    phoneNumber: "",
    address: "",
    username: "",
    password: "",
    roleId: "",
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error("Failed to load roles");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await employeeService.onboardEmployee(formData);
      navigate("/talent-pool");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to onboard employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#f7f7f5] min-h-screen">
      {/* HEADER */}
      <div className="max-w-3xl mx-auto flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-md transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-600" />
        </button>

        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Onboard New Employee
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Register a new resource including user access setup.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        )}

        {/* PERSONAL INFO BLOCK */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <User size={20} className="text-[#ff6908]" />
              Personal Information
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Basic details identifying the employee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">NIP *</label>
              <input
                type="text"
                name="employeeNumber"
                required
                value={formData.employeeNumber}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">KTP Number *</label>
              <input
                type="text"
                name="identityNumber"
                required
                maxLength={16}
                value={formData.identityNumber}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone *</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              <textarea
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* NEW BLOCK: USER CREATION */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <Briefcase size={20} className="text-[#ff6908]" />
              User Setup
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create login credentials and assign system role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Username *</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Select Role *</label>
              <select
                name="roleId"
                required
                value={formData.roleId}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
              >
                <option value="">-- Choose Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-lg border bg-white hover:bg-gray-100 text-gray-700 text-sm transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-[#ff6908] text-white text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-[#e55e07] transition disabled:opacity-60"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
            Submit Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardEmployeePage;
