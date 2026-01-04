import React, { useState, useEffect } from 'react';
import { X, Save, Clock, AlertCircle } from 'lucide-react';
import { ShiftMasterDTO, CreateShiftMasterRequest } from '../../types/shift-master';
// Pastikan ClientDTO diimport atau didefinisikan jika ada type khususnya
import { shiftMasterService, clientService } from '../../services/api'; 

interface ShiftMasterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  initialData?: ShiftMasterDTO | null;
  // clientId prop mungkin masih berguna sebagai default, tapi sekarang bisa dipilih via dropdown
  defaultClientId?: string; 
}

const ShiftMasterForm: React.FC<ShiftMasterFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  defaultClientId,
}) => {
  // --- STATE ---
  const [formData, setFormData] = useState<CreateShiftMasterRequest>({
    clientId: defaultClientId || '',
    code: '',
    name: '',
    startTime: '',
    endTime: '',
    isCrossDay: false,
    isDayOff: false,
    lateToleranceMinutes: 0,
    clockInWindowMinutes: 60,
    color: '#4CAF50',
  });

  const [clients, setClients] = useState<any[]>([]); // State untuk list client
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateShiftMasterRequest, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- EFFECT: Load Clients ---
  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      // Sesuaikan nama method dengan yang ada di api.ts Anda
      // Contoh: const response = await clientService.getAll();
      // Asumsi response.data adalah array client
      const response = await clientService.getAllClients(); 
      setClients(response); 
    } catch (error) {
      console.error("Failed to load clients", error);
      setApiError("Failed to load client list.");
    } finally {
      setIsLoadingClients(false);
    }
  };

  // --- EFFECT: Set Form Data on Edit/Create ---
  useEffect(() => {
    setApiError(null); 
    setErrors({});

    if (initialData) {
      // EDIT MODE
      setFormData({
        clientId: initialData.client.id, // Ambil ID dari object client di initialData
        code: initialData.code,
        name: initialData.name,
        startTime: initialData.startTime ? initialData.startTime.substring(0, 5) : '',
        endTime: initialData.endTime ? initialData.endTime.substring(0, 5) : '',
        isCrossDay: initialData.isCrossDay,
        isDayOff: initialData.isDayOff,
        lateToleranceMinutes: initialData.lateToleranceMinutes,
        clockInWindowMinutes: initialData.clockInWindowMinutes,
        color: initialData.color || '#4CAF50',
      });
    } else {
      // CREATE MODE
      setFormData({
        clientId: defaultClientId || '',
        code: '',
        name: '',
        startTime: '',
        endTime: '',
        isCrossDay: false,
        isDayOff: false,
        lateToleranceMinutes: 0,
        clockInWindowMinutes: 60,
        color: '#4CAF50',
      });
    }
  }, [initialData, defaultClientId, isOpen]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = parseInt(value) || 0;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof CreateShiftMasterRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: any = {};
    if (!formData.clientId) newErrors.clientId = 'Client is required';
    if (!formData.code) newErrors.code = 'Code is required';
    if (!formData.name) newErrors.name = 'Shift name is required';
    
    if (!formData.isDayOff) {
      if (!formData.startTime) newErrors.startTime = 'Start time required';
      if (!formData.endTime) newErrors.endTime = 'End time required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      if (initialData && initialData.id) {
        await shiftMasterService.updateShiftMaster(initialData.id, formData);
      } else {
        await shiftMasterService.createShiftMaster(formData);
      }
      onSuccess(); 
      onClose();   
    } catch (error: any) {
      console.error("Failed to save shift:", error);
      setApiError(error.response?.data?.message || error.message || "An error occurred while saving data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? 'Edit Shift Master' : 'Create New Shift'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            
            {/* API Error Alert */}
            {apiError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded flex gap-2 items-start border border-red-200">
                <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                <span>{apiError}</span>
              </div>
            )}

            {/* Row 0: Client Dropdown (NEW) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                disabled={isSubmitting || isLoadingClients}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff6908] bg-white ${errors.clientId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">-- Select Client --</option>
                {isLoadingClients ? (
                  <option disabled>Loading clients...</option>
                ) : (
                  clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))
                )}
              </select>
              {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId}</p>}
            </div>

            {/* Row 1: Code & Color */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. S1"
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff6908] ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                 <div className="flex items-center gap-2">
                   <input 
                      type="color" 
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="h-9 w-full cursor-pointer rounded border border-gray-300 p-1"
                   />
                 </div>
              </div>
            </div>

            {/* Row 2: Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. Morning Shift Regular"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff6908] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <hr className="border-gray-100" />

            {/* Row 3: Day Off Logic */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <input
                type="checkbox"
                id="isDayOff"
                name="isDayOff"
                checked={formData.isDayOff}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 text-[#ff6908] focus:ring-[#ff6908] border-gray-300 rounded"
              />
              <label htmlFor="isDayOff" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Set as Day Off (Libur)
              </label>
            </div>

            {/* Time Settings (Disabled if Day Off) */}
            <div className={`space-y-4 transition-opacity ${formData.isDayOff ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff6908] ${errors.startTime ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <Clock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff6908] ${errors.endTime ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <Clock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCrossDay"
                  name="isCrossDay"
                  checked={formData.isCrossDay}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-[#ff6908] focus:ring-[#ff6908] border-gray-300 rounded"
                />
                <label htmlFor="isCrossDay" className="text-sm text-gray-600 cursor-pointer select-none">
                  Is Cross Day? (Ends on next day)
                </label>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Tolerance Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Late Tolerance (Min)</label>
                <input
                  type="number"
                  name="lateToleranceMinutes"
                  value={formData.lateToleranceMinutes}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff6908]"
                />
                <p className="text-xs text-gray-400 mt-1">Minutes allowed before counted as late.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clock-In Window (Min)</label>
                <input
                  type="number"
                  name="clockInWindowMinutes"
                  value={formData.clockInWindowMinutes}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff6908]"
                />
                <p className="text-xs text-gray-400 mt-1">Minutes before shift start check-in opens.</p>
              </div>
            </div>
            
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting} 
            className="flex items-center gap-2 px-4 py-2 bg-[#ff6908] text-white rounded-md text-sm font-medium hover:bg-[#e55e07] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Shift
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftMasterForm;