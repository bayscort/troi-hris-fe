import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Download, Search, 
  Loader, Calendar, Filter, AlertCircle 
} from 'lucide-react';
import { clientService, clientSiteService, rosterService } from '../services/api'; 
import { Client } from '../types/client';
import { ClientSite } from '../types/client-site';
import { EmployeeRosterRow } from '../types/roster';

const ShiftRosterPage: React.FC = () => {
  // --- STATE ---
  // Master Data
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<ClientSite[]>([]);
  
  // Filters
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date()); // State untuk Bulan yang dipilih
  const [searchTerm, setSearchTerm] = useState('');

  // Data Roster
  const [rosterData, setRosterData] = useState<EmployeeRosterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HELPER: DATE MANIPULATION ---
  
  // Mendapatkan Start & End Date untuk bulan yang dipilih
  const { startDateStr, endDateStr, daysInMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Hari pertama & terakhir bulan ini
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // Tgl 0 bulan depan = Tgl terakhir bulan ini

    // Generate Array Tanggal (untuk Header Table)
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
            dateString: d.toISOString().split('T')[0], // "2026-01-01"
            dayNum: d.getDate(),
            dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }), // "Sen", "Sel"
            isWeekend: d.getDay() === 0 || d.getDay() === 6 // 0=Sun, 6=Sat
        });
    }

    // Format YYYY-MM-DD untuk API
    // Note: Kita pakai toLocaleDateString('en-CA') agar formatnya YYYY-MM-DD sesuai zona waktu lokal user
    const format = (d: Date) => {
        const offset = d.getTimezoneOffset();
        const date = new Date(d.getTime() - (offset*60*1000));
        return date.toISOString().split('T')[0];
    };

    return {
        startDateStr: format(start),
        endDateStr: format(end),
        daysInMonth: days
    };
  }, [currentDate]);

  // --- EFFECTS ---

  // 1. Load Clients
  useEffect(() => {
    clientService.getAllClients().then(data => {
        setClients(data);
        // Tambahkan || '' di sini
        if (data.length > 0) setSelectedClientId(data[0].id || '');
    });
  }, []);

  // 2. Load Sites saat Client berubah
  useEffect(() => {
    if (!selectedClientId) {
        setSites([]);
        return;
    }
    clientSiteService.getClientSiteByClientId(selectedClientId).then(data => {
        setSites(data);
        // Tambahkan || '' di sini juga
        if (data.length > 0) setSelectedSiteId(data[0].id || '');
        else setSelectedSiteId('');
    });
  }, [selectedClientId]);

  // 3. LOAD ROSTER MATRIX (REAL API CALL)
  useEffect(() => {
    if (!selectedSiteId) return;

    const fetchRoster = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await rosterService.getMatrix(
                selectedSiteId,
                startDateStr,
                endDateStr
            );
            setRosterData(data.rows);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data jadwal.");
        } finally {
            setLoading(false);
        }
    };

    fetchRoster();
  }, [selectedSiteId, startDateStr, endDateStr]);

  // --- HANDLERS ---
  
  const handleMonthChange = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const filteredRows = rosterData.filter(row => 
    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.nik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      
      {/* 1. HEADER & CONTROLS */}
      <div className="p-5 border-b flex flex-col gap-4 bg-white z-20">
         <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Shift Roster</h1>
                <p className="text-sm text-gray-500">Monthly schedule view & realization.</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50 text-gray-700">
                <Download size={16}/> Export Excel
            </button>
         </div>

         <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
            {/* Filter Client */}
            <div className="relative">
                <select 
                    value={selectedClientId} 
                    onChange={e => setSelectedClientId(e.target.value)}
                    className="border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-[#ff6908] focus:outline-none w-48"
                >
                    <option value="" disabled>Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Filter Site */}
            <div className="relative">
                 <select 
                    value={selectedSiteId} 
                    onChange={e => setSelectedSiteId(e.target.value)}
                    disabled={!selectedClientId}
                    className="border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-[#ff6908] focus:outline-none w-48 disabled:bg-gray-100 disabled:text-gray-400"
                >
                    <option value="">Select Site</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            
            <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block"></div>
            
            {/* Month Navigator */}
            <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm">
                <button onClick={() => handleMonthChange(-1)} className="p-1.5 hover:bg-gray-100 text-gray-600 border-r"><ChevronLeft size={16}/></button>
                <div className="px-4 font-medium text-sm w-36 text-center text-gray-700 flex items-center justify-center gap-2">
                    <Calendar size={14} className="text-gray-400"/>
                    {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => handleMonthChange(1)} className="p-1.5 hover:bg-gray-100 text-gray-600 border-l"><ChevronRight size={16}/></button>
            </div>
         </div>
      </div>

      {/* 2. ERROR STATE */}
      {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle size={20}/>
              <span>{error}</span>
          </div>
      )}

      {/* 3. MATRIX TABLE AREA */}
      <div className="flex-1 overflow-hidden relative w-full">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
                 <Loader size={40} className="animate-spin mb-4 text-[#ff6908]"/>
                 <p>Loading roster data...</p>
             </div>
          ) : !selectedSiteId ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                 <Filter size={48} className="mb-4 text-gray-300"/>
                 <p>Please select a Client Site to view the roster.</p>
             </div>
          ) : (
             <div className="h-full overflow-auto border-t border-gray-200">
                <table className="border-collapse text-sm min-w-full">
                    
                    {/* TABLE HEADER (Dates) */}
                    <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                        <tr>
                            {/* Sticky Employee Search Column */}
                            <th className="sticky left-0 z-30 bg-gray-50 border-r border-b p-2 min-w-[280px] text-left align-bottom shadow-[4px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center gap-2 text-gray-500 bg-white border rounded px-2 py-1.5">
                                    <Search size={14}/>
                                    <input 
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search employee..." 
                                        className="bg-transparent outline-none w-full text-xs"
                                    />
                                </div>
                            </th>
                            
                            {/* Date Columns */}
                            {daysInMonth.map(d => (
                                <th 
                                    key={d.dateString} 
                                    className={`border-b border-r min-w-[50px] p-2 text-center ${d.isWeekend ? 'bg-red-50/50' : ''}`}
                                >
                                    <div className={`text-[10px] uppercase font-bold ${d.isWeekend ? 'text-red-500' : 'text-gray-500'}`}>
                                        {d.dayName}
                                    </div>
                                    <div className={`text-lg font-medium leading-none mb-1 ${d.isWeekend ? 'text-red-700' : 'text-gray-700'}`}>
                                        {d.dayNum}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* TABLE BODY (Employees) */}
                    <tbody className="divide-y divide-gray-100">
                        {filteredRows.map(row => (
                            <tr key={row.employeeId} className="hover:bg-gray-50 transition-colors group">
                                
                                {/* Sticky Employee Info */}
                                <td className="sticky left-0 z-10 bg-white border-r border-b p-3 group-hover:bg-gray-50 transition-colors shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-orange-100 text-[#ff6908] flex items-center justify-center text-xs font-bold shrink-0">
                                            {row.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 truncate" title={row.name}>{row.name}</div>
                                            <div className="text-xs text-gray-500 flex gap-2">
                                                <span>{row.nik}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="truncate max-w-[120px]" title={row.jobPosition}>{row.jobPosition}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Shift Cells */}
                                {daysInMonth.map(d => {
                                    // Akses map O(1)
                                    const schedule = row.schedules[d.dateString];
                                    
                                    return (
                                        <td key={d.dateString} className={`border-r border-b p-1 text-center h-16 w-14 align-middle ${d.isWeekend ? 'bg-red-50/20' : ''}`}>
                                            {schedule ? (
                                                <div 
                                                    className="w-full h-full rounded flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative shadow-sm text-white"
                                                    style={{ 
                                                        backgroundColor: schedule.isOff ? '#f3f4f6' : schedule.color,
                                                        color: schedule.isOff ? '#9ca3af' : '#fff',
                                                        border: schedule.isOff ? '1px solid #e5e7eb' : 'none'
                                                    }}
                                                    title={`${schedule.shiftName} (${schedule.startTime} - ${schedule.endTime})`}
                                                >
                                                    <span className="font-bold text-xs">{schedule.shiftCode}</span>
                                                    
                                                    {/* Status Indicator (Untuk Realisasi Absensi) */}
                                                    {schedule.status === 'LATE' && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" title="Late"></div>
                                                    )}
                                                </div>
                                            ) : (
                                                // Empty State
                                                <div className="w-full h-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-10"></div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan={daysInMonth.length + 1} className="py-8 text-center text-gray-500">
                                    No employees found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
          )}
      </div>
      
      {/* 4. FOOTER LEGEND */}
      <div className="border-t p-3 bg-gray-50 flex gap-6 text-xs text-gray-600 justify-end">
          <span className="font-bold mr-2 text-gray-400">LEGEND:</span>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm"></div> Late Attendance</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#4CAF50] rounded"></div> Shift Pagi</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#1976D2] rounded"></div> Shift Malam</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div> Off / Libur</div>
      </div>

    </div>
  );
};

export default ShiftRosterPage;