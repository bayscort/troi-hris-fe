import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Loader, Layers, Calendar, AlertCircle } from 'lucide-react';
import ShiftPatternForm from '../components/shift-pattern/ShiftPatternForm';
import { 
  shiftPatternService, 
  clientService, 
  shiftMasterService 
} from '../services/api'; 
import { ShiftPattern, CreatePatternRequest, BulkPatternItemsRequest } from '../types/shift-pattern';
import { ShiftMasterDTO } from '../types/shift-master';
import { Client } from '../types/client';

const ShiftPatternPage: React.FC = () => {
  // --- STATE ---
  const [patterns, setPatterns] = useState<ShiftPattern[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [availableShifts, setAvailableShifts] = useState<ShiftMasterDTO[]>([]);
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. Fetch Clients saat mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clientService.getAllClients();
        setClients(data);
        // Auto-select client pertama jika ada
        if (data.length > 0 && !selectedClientId) {
  setSelectedClientId(data[0].id || '');
}
      } catch (err) {
        console.error("Failed to fetch clients", err);
        setError("Gagal memuat data Client.");
      }
    };
    fetchClients();
  }, []);

  // 2. Fetch Patterns & Shifts saat Client berubah
  useEffect(() => {
    if (!selectedClientId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Parallel Request agar lebih cepat
        const [patternData, shiftData] = await Promise.all([
          shiftPatternService.getByClient(selectedClientId),
          shiftMasterService.getByClient(selectedClientId)
        ]);

        setPatterns(patternData);
        setAvailableShifts(shiftData);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data Pattern atau Shift.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClientId, refreshTrigger]);

  // 3. Handle Save (Create Header -> Add Items)
  const handleSavePattern = async (header: CreatePatternRequest, items: BulkPatternItemsRequest['items']) => {
    setLoading(true); // Tampilkan loading global atau di form
    try {
      // Step A: Create Header
      // Backend return UUID string
      const patternId = await shiftPatternService.create(header);
      
      // Step B: Bulk Insert Items
      await shiftPatternService.addItems({
        patternId: patternId,
        items: items
      });

      // Step C: Success & Refresh
      setIsFormOpen(false);
      setRefreshTrigger(prev => prev + 1); // Trigger useEffect ke-2 untuk reload data
      alert("Pattern successfully created!"); // Bisa ganti toast notification
    } catch (e) {
      console.error(e);
      alert("Failed to create pattern. Please check the logs.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Filtering Logic (Client Side)
  const filteredPatterns = patterns.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 h-full font-sans">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-semibold">Shift Patterns</h1>
                <p className="text-gray-500 text-sm mt-1">Design rotating work schedules and cycles.</p>
            </div>
            <button 
                onClick={() => setIsFormOpen(true)}
                disabled={!selectedClientId}
                className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Plus size={18} /> New Pattern
            </button>
        </div>

        {/* ERROR ALERT */}
        {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle size={20}/>
                <span>{error}</span>
            </div>
        )}

        {/* CONTROLS (Filter & Search) */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Client Dropdown */}
            <div className="relative">
                <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="pl-3 pr-8 py-2 border rounded-md w-64 focus:ring-1 focus:ring-[#ff6908] focus:outline-none bg-white appearance-none cursor-pointer"
                >
                    <option value="" disabled>Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            
            {/* Search Input */}
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search patterns..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-md w-64 focus:ring-1 focus:ring-[#ff6908] focus:outline-none"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {/* Refresh Button */}
            <button 
                onClick={() => setRefreshTrigger(prev => prev + 1)} 
                disabled={loading}
                className="px-3 py-2 border rounded-md hover:bg-gray-50 text-gray-600 ml-auto"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>

        {/* GRID CONTENT */}
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                 <Loader size={40} className="animate-spin mb-4"/>
                 <p>Loading patterns...</p>
             </div>
        ) : filteredPatterns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Layers className="mb-3 text-gray-300" size={48}/>
                <p className="font-medium">No shift patterns found.</p>
                <p className="text-sm text-gray-400">Select a client or create a new pattern.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {filteredPatterns.map(pattern => (
                    <div key={pattern.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-gray-300 transition-all bg-white flex flex-col h-full">
                        
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={pattern.name}>{pattern.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">ID: {pattern.id.substring(0,8)}...</p>
                            </div>
                            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded font-medium border border-orange-100 whitespace-nowrap">
                                {pattern.cycleDays} Days Cycle
                            </span>
                        </div>
                        
                        {/* Sequence Visual Preview */}
                        <div className="mt-auto">
                            <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-wider">Sequence Preview</p>
                            <div className="flex flex-wrap gap-1.5">
                                {pattern.items.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        title={`Day ${item.daySequence}: ${item.shiftName} (${item.startTime}-${item.endTime})`}
                                        className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-help hover:scale-110 transition-transform"
                                        style={{ backgroundColor: item.shiftColor || '#ccc' }}
                                    >
                                        {item.shiftCode}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                             <Calendar size={14}/>
                             <span>Repeats automatically</span>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* CREATE MODAL FORM */}
        <ShiftPatternForm 
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSavePattern}
            clientId={selectedClientId}
            availableShifts={availableShifts}
            isLoading={loading}
        />
    </div>
  );
};

export default ShiftPatternPage;