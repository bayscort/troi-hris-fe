import React, { useState, useEffect } from 'react';
import { 
  Users, CheckSquare, Square, 
  ArrowRight, Loader, AlertCircle 
} from 'lucide-react';
import { clientService, shiftPatternService, employeeService, clientSiteService, jobPositionService, assignmentShiftService } from '../services/api'; 

import { Client } from '../types/client';
import { ShiftPattern } from '../types/shift-pattern';
import { EmployeeRow, BulkAssignRequest } from '../types/assigment-shift';
import { ClientSite } from '../types/client-site';
import { JobPosition } from '../types/job-position';

const ShiftAssignmentPage: React.FC = () => {

  // --- STATE ---
  
  // Master Data Lists
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<ClientSite[]>([]); 
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]); 
  const [patterns, setPatterns] = useState<ShiftPattern[]>([]);
  
  // Table Data
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  
  // Filters Selection
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [selectedJobPositionId, setSelectedJobPositionId] = useState<string>(''); // New State
  
  // Selection (Checkbox)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  
  // Modal & UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignConfig, setAssignConfig] = useState<{ patternId: string; date: string }>({
    patternId: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // --- EFFECTS ---

  // 1. Load Clients (Initial Load)
  useEffect(() => {
    const fetchClients = async () => {
        try {
            const data = await clientService.getAllClients(); // Pastikan nama method sesuai API Anda
            setClients(data);
            // Auto select client pertama jika ada
            if (!selectedClientId && data.length > 0) {
                // Prioritaskan client user saat ini jika ada, atau ambil yang pertama
                const defaultClient = data[0];
                if (defaultClient?.id) {
                    setSelectedClientId(defaultClient.id);
                }
            }
        } catch (error) {
            console.error("Failed to load clients", error);
        }
    };
    fetchClients();
  }, []);

  // 2. Load Metadata (Sites, Jobs, Patterns) saat Client Berubah
  useEffect(() => {
    if(!selectedClientId) {
        setSites([]);
        setJobPositions([]);
        setPatterns([]);
        return;
    }
    
    const loadClientMetadata = async () => {
        setLoading(true);
        try {
            // Reset child filters ketika parent (Client) berubah
            setSelectedSiteId('');
            setSelectedJobPositionId('');
            setEmployees([]);

            // Parallel Fetching untuk performa
            const [sitesData, jobsData, patternsData] = await Promise.all([
                clientSiteService.getClientSiteByClientId(selectedClientId),
                jobPositionService.getJobPositionByClientId(selectedClientId),
                shiftPatternService.getByClient(selectedClientId)
            ]);

            setSites(sitesData);
            setJobPositions(jobsData);
            setPatterns(patternsData);
            
            if (!selectedClientId && sitesData.length > 0) {
                const defaultClient = sitesData[0];
                if (defaultClient?.id) {
                    setSelectedSiteId(defaultClient.id);
                }
            }

        } catch (error) {
            console.error("Failed to load client metadata", error);
        } finally {
            setLoading(false);
        }
    };
    loadClientMetadata();
  }, [selectedClientId]);

  // 3. Load Employees saat Site atau Job Position Berubah
  useEffect(() => {
    // Site ID biasanya wajib untuk query employee placement
    if(!selectedSiteId && !selectedJobPositionId) {
        setEmployees([]);
        return;
    }

    const loadEmployees = async () => {
        setLoading(true);
        try {
            // Panggil API dengan parameter Site ID dan Job Position ID (Optional)
            const employeesData = await employeeService.getActiveBySite(
                selectedSiteId, 
                selectedJobPositionId
            );
            setEmployees(employeesData);
            
            // Reset selection checkbox saat data tabel berubah
            setSelectedEmployeeIds(new Set());
        } catch (error) {
            console.error("Failed to load employees", error);
        } finally {
            setLoading(false);
        }
    };

    loadEmployees();
  }, [selectedSiteId, selectedJobPositionId]);

  // --- HANDLERS ---

  const toggleSelectAll = () => {
    if (selectedEmployeeIds.size === employees.length && employees.length > 0) {
      setSelectedEmployeeIds(new Set());
    } else {
      setSelectedEmployeeIds(new Set(employees.map(e => e.employeeId)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSet = new Set(selectedEmployeeIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedEmployeeIds(newSet);
  };

  const handleBulkAssign = async () => {
    if (!assignConfig.patternId) return alert("Please select a pattern");
    
    setAssigning(true);
    try {

        console.log('EMPLOYEES RAW:', employees);
console.log('SELECTED IDS:', Array.from(selectedEmployeeIds));


        const payload: BulkAssignRequest = {
            employeeIds: Array.from(selectedEmployeeIds),
            shiftPatternId: assignConfig.patternId,
            effectiveDate: assignConfig.date
        };


        console.log("Mengirim Assignment:", payload);

        // Call API Real
        await assignmentShiftService.bulkAssign(payload);
                
        // Simulate Delay
        await new Promise(r => setTimeout(r, 1000));
        
        alert(`Successfully assigned pattern to ${selectedEmployeeIds.size} employees!`);
        setIsModalOpen(false);
        setSelectedEmployeeIds(new Set()); 
        
        // Optional: Refresh data employee
        // setRefreshTrigger(prev => prev + 1); 
    } catch (e) {
        alert("Failed to assign.");
    } finally {
        setAssigning(false);
    }
  };

  const isAllSelected = employees.length > 0 && selectedEmployeeIds.size === employees.length;

  return (
    <div className="p-8 flex-1 bg-white h-full overflow-hidden flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Shift Assignments</h1>
        <p className="text-sm text-gray-500 mt-1">Assign rotating patterns to employees in bulk.</p>
      </div>

      {/* FILTERS AREA */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 items-end">
        
        {/* 1. Client Filter */}
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Client</label>
            <select 
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-48 px-3 py-2 bg-white border rounded-md text-sm focus:ring-[#ff6908] focus:outline-none"
            >
                <option value="" disabled>Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        
        {/* 2. Site Filter (Dependent on Client) */}
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Client Site</label>
            <select 
                value={selectedSiteId}
                onChange={e => setSelectedSiteId(e.target.value)}
                disabled={!selectedClientId}
                className="w-48 px-3 py-2 bg-white border rounded-md text-sm focus:ring-[#ff6908] focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
                <option value="">Select Site</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>

        {/* 3. Job Position Filter (Dependent on Client) */}
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Job Position</label>
            <select 
                value={selectedJobPositionId}
                onChange={e => setSelectedJobPositionId(e.target.value)}
                disabled={!selectedClientId}
                className="w-48 px-3 py-2 bg-white border rounded-md text-sm focus:ring-[#ff6908] focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
                <option value="">All Positions</option>
                {jobPositions.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
        </div>

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <Users size={16}/>
            <span>Found <strong>{employees.length}</strong> active employees</span>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 overflow-auto border rounded-lg shadow-sm relative">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-medium sticky top-0 z-10">
                <tr>
                    <th className="px-4 py-3 w-12 text-center">
                        <button onClick={toggleSelectAll} disabled={employees.length === 0} className="flex items-center justify-center">
                            {isAllSelected ? <CheckSquare size={18} className="text-[#ff6908]"/> : <Square size={18} className="text-gray-400"/>}
                        </button>
                    </th>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Job Position</th>
                    <th className="px-4 py-3">Current Pattern</th>
                    <th className="px-4 py-3 text-right">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={5} className="text-center py-20 text-gray-400">Loading data...</td></tr>
                ) : employees.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-20 text-gray-400">No employees found in this site.</td></tr>
                ) : employees.map(emp => {
                    const isSelected = selectedEmployeeIds.has(emp.employeeId);
                    return (
                        <tr 
                            key={emp.employeeId} 
                            onClick={() => toggleSelectOne(emp.employeeId)}
                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                        >
                            <td className="px-4 py-3 text-center">
                                {isSelected ? <CheckSquare size={18} className="text-[#ff6908]"/> : <Square size={18} className="text-gray-300"/>}
                            </td>
                            <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{emp.name}</div>
                                <div className="text-xs text-gray-500">{emp.nik}</div>
                            </td>
                            <td className="px-4 py-3">{emp.jobPositionName}</td>
                            <td className="px-4 py-3">
                                {emp.currentPatternName !== '-' ? (
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs border border-blue-100 font-medium">
                                        {emp.currentPatternName}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 italic text-xs">No active pattern</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs border border-green-100">Active</span>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

      {/* FLOATING ACTION BAR */}
      {selectedEmployeeIds.size > 0 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-4 z-20">
              <span className="text-sm font-medium">{selectedEmployeeIds.size} Employees selected</span>
              <div className="h-4 w-px bg-gray-600"></div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-sm font-bold text-[#ff6908] hover:text-white transition-colors"
              >
                  Assign Pattern <ArrowRight size={16}/>
              </button>
          </div>
      )}

      {/* MODAL ASSIGNMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-lg">Assign Shift Pattern</h3>
                    <p className="text-sm text-gray-500">Apply to {selectedEmployeeIds.size} selected employees</p>
                </div>
                
                <div className="p-6 space-y-4">
                    {/* Pattern Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Pattern</label>
                        <select 
                            value={assignConfig.patternId}
                            onChange={e => setAssignConfig({...assignConfig, patternId: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-[#ff6908] focus:outline-none"
                        >
                            <option value="">-- Choose Pattern --</option>
                            {patterns.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.cycleDays} days cycle)</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {patterns.find(p => p.id === assignConfig.patternId)?.items?.length || 0} shift items defined in this pattern.
                        </p>
                    </div>

                    {/* Date Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective Start Date</label>
                        <input 
                            type="date"
                            value={assignConfig.date}
                            onChange={e => setAssignConfig({...assignConfig, date: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-[#ff6908] focus:outline-none"
                        />
                        <div className="flex gap-2 mt-2 p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                             <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                             <span>Schedule will be auto-generated for 30 days starting from this date. Existing future schedules might be overwritten.</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button 
                        onClick={handleBulkAssign} 
                        disabled={assigning}
                        className="px-4 py-2 bg-[#ff6908] text-white text-sm font-medium rounded hover:bg-[#e55e07] disabled:opacity-50 flex items-center gap-2"
                    >
                        {assigning && <Loader size={14} className="animate-spin"/>}
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ShiftAssignmentPage;