import React, { useState, useEffect } from 'react';
import {
  User, Building2, Briefcase, Key,
  ArrowRight, ArrowLeft, CheckCircle,
  AlertTriangle, Loader, Wand2
} from 'lucide-react';

import {
  clientService,
  employeeService,
  roleService,
  deploymentService,
  clientSiteService,
  jobPositionService
} from '../services/api';

import { Client } from '../types/client';
import { DeployEmployeeRequest, EmploymentType } from '../types/deployment';
import { ClientSite } from '../types/client-site';
import { JobPosition } from '../types/job-position';
import { Role } from '../types/user';

// Initial State kosong
const initialForm: DeployEmployeeRequest = {
  employeeId: '',
  clientId: '',
  clientSiteId: null,
  jobPositionId: '',
  jobTitle: '',
  employeeIdAtClient: '',
  employmentType: 'PKWT',
  startDate: new Date().toISOString().split('T')[0],
  endDate: null,
  basicSalary: 0,
  username: '',
  password: '',
  roleId: ''
};

const DeploymentPage: React.FC = () => {
  // --- STATE ---
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DeployEmployeeRequest>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Master Data List
  const [employees, setEmployees] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // UI Helper State
  const [salaryDisplay, setSalaryDisplay] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [empData, clientData, roleData] = await Promise.all([
          employeeService.getEmployees("BENCH"),
          clientService.getAllClients(),
          roleService.getAllRoles()
        ]);
        setEmployees(empData);
        setClients(clientData);
        setRoles(roleData);
      } catch (err) {
        setErrorMessage("Failed to load master data. Please check connection.");
      }
    };
    loadMasterData();
  }, []);

  // --- CASCADING LOAD (Client Changed) ---
  useEffect(() => {
    if (!formData.clientId) {
      setSites([]);
      setJobs([]);
      return;
    }

    // Reset child fields
    setFormData(prev => ({
      ...prev,
      clientSiteId: null,
      jobPositionId: '',
      jobTitle: '' // Reset job title juga
    }));

    const loadClientDetails = async () => {
      try {
        const [sitesData, jobsData] = await Promise.all([
          clientSiteService.getClientSiteByClientId(formData.clientId),
          jobPositionService.getJobPositionByClientId(formData.clientId)
        ]);
        setSites(sitesData);
        setJobs(jobsData);
      } catch (err) {
        console.error(err);
      }
    };
    loadClientDetails();
  }, [formData.clientId]);

  // --- HANDLERS ---

  const handleNext = () => {
    // Simple Validation per Step
    if (step === 1 && !formData.employeeId) return alert("Please select an employee");
    if (step === 2 && (!formData.clientId || !formData.jobPositionId)) return alert("Client and Position are required");
    if (step === 3 && (!formData.startDate || !formData.basicSalary)) return alert("Start Date and Salary are required");

    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  // Auto-fill Job Title saat Job Position Master dipilih
  const handleJobPositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedJob = jobs.find(j => j.id === selectedId);

    setFormData(prev => ({
      ...prev,
      jobPositionId: selectedId,
      jobTitle: selectedJob ? selectedJob.title : prev.jobTitle // Auto-fill
    }));
  };

  // Format Salary (Visual Rp)
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus karakter non-digit
    const val = e.target.value.replace(/\D/g, '');
    const numVal = Number(val);

    setFormData(prev => ({ ...prev, basicSalary: numVal }));
    setSalaryDisplay(numVal.toLocaleString('id-ID'));
  };

  // Logic Auto-Generate User
  const generateCredentials = () => {
    const emp = employees.find(e => e.id === formData.employeeId);
    if (!emp) return;

    // Username: firstname.lastname (lowercase, remove spaces)
    const rawName = emp.name || emp.fullName || 'user';
    const cleanName = rawName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 100);
    const username = `${cleanName}${randomSuffix}`;

    // Password: random 8 chars
    const password = Math.random().toString(36).slice(-8);

    setFormData(prev => ({ ...prev, username, password }));
  };

  // FINAL SUBMIT
  const handleSubmit = async () => {
    if (!formData.username || !formData.password || !formData.roleId) {
      return alert("Username, Password, and Role are required");
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await deploymentService.deploy(formData);
      setIsSuccess(true);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Deployment failed. Check conflict or connection.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER SUCCESS STATE ---
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 bg-white">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Deployment Successful!</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Employee has been placed and a user account has been created.
        </p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border w-full max-w-sm">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2">Credentials Created:</p>
          <div className="flex justify-between text-sm mb-1">
            <span>Username:</span>
            <span className="font-mono font-medium">{formData.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Password:</span>
            <span className="font-mono font-medium">{formData.password}</span>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2 bg-[#ff6908] text-white rounded-lg hover:bg-[#e55e07]"
        >
          Deploy Another Employee
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden font-sans">

      {/* HEADER WIZARD */}
      <div className="bg-white border-b px-8 py-5 shadow-sm z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-6">New Employee Deployment</h1>

          {/* Stepper */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-[#ff6908] -z-0 transition-all duration-500 ease-in-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>

            {[
              { id: 1, label: "Employee", icon: User },
              { id: 2, label: "Location", icon: Building2 },
              { id: 3, label: "Contract", icon: Briefcase },
              { id: 4, label: "Access", icon: Key }
            ].map((item) => {
              const isActive = step >= item.id;
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 border-2 ${isActive ? 'bg-[#ff6908] border-[#ff6908] text-white shadow-lg shadow-orange-100' : 'bg-white border-gray-300 text-gray-400'}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-[#ff6908]' : 'text-gray-400'}`}>{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 w-full px-4">
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertTriangle size={20} />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-auto text-sm hover:underline">Dismiss</button>
          </div>
        </div>
      )}

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[400px]">

          {/* STEP 1: SELECT EMPLOYEE */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-[#ff6908] pl-3">Who are you deploying?</h2>

              <div className="space-y-4 max-w-lg">
                <label className="block text-sm font-medium text-gray-700">Select Employee</label>
                <select
                  className="w-full border-gray-300 rounded-lg p-3 border focus:ring-2 focus:ring-[#ff6908] focus:outline-none transition-shadow"
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                >
                  <option value="">-- Choose from Active List --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || emp.fullName}
                    </option>
                  ))}
                </select>

                {formData.employeeId && (
                  <div className="bg-blue-50 p-4 rounded-lg flex gap-4 items-start border border-blue-100 mt-4">
                    <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold">
                      {employees.find(e => e.id === formData.employeeId)?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Selected Employee</p>
                      <p className="text-sm text-gray-600">ID: {employees.find(e => e.id === formData.employeeId)?.nik}</p>
                      <p className="text-xs text-green-600 mt-1 font-medium bg-green-100 px-2 py-0.5 rounded inline-block">Ready to Deploy</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & POSITION */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-[#ff6908] pl-3">Placement Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Company *</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908]"
                    value={formData.clientId}
                    onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Location</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908] disabled:bg-gray-100"
                    value={formData.clientSiteId || ''}
                    onChange={e => setFormData({ ...formData, clientSiteId: e.target.value || null })}
                    disabled={!formData.clientId}
                  >
                    <option value="">Head Office / Default</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Position (Master) *</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908] disabled:bg-gray-100"
                    value={formData.jobPositionId}
                    onChange={handleJobPositionChange}
                    disabled={!formData.clientId}
                  >
                    <option value="">Select Position</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title (Specific on Contract)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908] focus:outline-none"
                    value={formData.jobTitle}
                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Senior Security Guard"
                  />
                  <p className="text-xs text-gray-400 mt-1">This title will appear on the employee's ID card.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID at Client</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908] focus:outline-none"
                    value={formData.employeeIdAtClient || ''}
                    onChange={e => setFormData({ ...formData, employeeIdAtClient: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONTRACT */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-[#ff6908] pl-3">Employment Contract</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908]"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908]"
                    value={formData.endDate || ''}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908]"
                    value={formData.employmentType}
                    onChange={e => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                  >
                    <option value="PKWT">PKWT (Contract)</option>
                    <option value="PKWTT">PKWTT (Permanent)</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">Rp</span>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2.5 pl-10 focus:ring-[#ff6908] focus:outline-none font-mono"
                      value={salaryDisplay}
                      onChange={handleSalaryChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ACCESS */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-[#ff6908] pl-3">App Access & Credentials</h2>

              <div className="space-y-6 max-w-lg">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex gap-3">
                  <Key className="text-yellow-600 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Create User Account</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      The employee will use these credentials to log in to the HRIS Mobile App.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={generateCredentials}
                    className="text-xs flex items-center gap-1 text-[#ff6908] hover:text-[#e55e07] font-medium"
                  >
                    <Wand2 size={12} /> Auto-Generate Credentials
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908] bg-gray-50"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-[#ff6908]"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Role *</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#ff6908]"
                    value={formData.roleId}
                    onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="bg-white border-t p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 1 || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex items-center gap-2">
            {/* Indicator Steps */}
            <span className="text-xs text-gray-400 font-medium mr-4">Step {step} of 4</span>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-[#ff6908] text-white font-medium hover:bg-[#e55e07] disabled:opacity-70 transition-colors shadow-lg shadow-orange-200"
              >
                {isLoading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Confirm Deployment
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DeploymentPage;