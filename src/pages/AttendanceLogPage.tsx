import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Calendar,
  Loader,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { DateRangePicker } from "react-date-range";
import { format, addHours } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { attendanceService } from "../services/api";
import { AttendanceResponse, VerificationStatus } from "../types/attendance";

// Helper to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get start and end of current month
const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
};

const AttendanceLogPage: React.FC = () => {
  const { start: defaultStart, end: defaultEnd } = getMonthRange();

  // State
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Date Range State
  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(defaultEnd);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: defaultStart,
    endDate: defaultEnd,
    key: "selection"
  });
  const [activePreset, setActivePreset] = useState<string | null>("month");
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Fetch attendance data
  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getAttendanceListAll(
        formatDateLocal(startDate),
        formatDateLocal(endDate)
      );
      setAttendanceData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when date range changes
  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate]);

  // Click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Date handlers
  const handlePreset = (type: string) => {
    const now = new Date();
    let start: Date, end: Date;

    switch (type) {
      case "7":
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 7);
        break;
      case "30":
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 30);
        break;
      case "month":
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
    }

    setStartDate(start);
    setEndDate(end);
    setDateRange({ startDate: start, endDate: end, key: "selection" });
    setActivePreset(type);
    setIsDatePickerOpen(false);
  };

  const handleSelect = (ranges: any) => {
    const { startDate: start, endDate: end } = ranges.selection;
    setDateRange(ranges.selection);
    setStartDate(start);
    setEndDate(end);
    setActivePreset(null);
  };

  const formatDateRange = () => {
    return `${format(startDate, "d MMM yyyy")} - ${format(endDate, "d MMM yyyy")}`;
  };

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return attendanceData;
    const term = searchTerm.toLowerCase();
    return attendanceData.filter(item =>
      item.employeeName.toLowerCase().includes(term) ||
      (item.location && item.location.toLowerCase().includes(term))
    );
  }, [attendanceData, searchTerm]);

  // Stats calculations
  const stats = useMemo(() => {
    const total = filteredData.length;
    const verified = filteredData.filter(a => a.status === 'VERIFIED').length;
    const pending = filteredData.filter(a => a.status === 'PENDING').length;
    const rejected = filteredData.filter(a => a.status === 'REJECTED').length;

    return [
      { label: "Total Records", value: total, bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
      { label: "Verified", value: verified, bg: "bg-green-50", text: "text-green-600", icon: CheckCircle },
      { label: "Pending", value: pending, bg: "bg-yellow-50", text: "text-yellow-600", icon: AlertCircle },
      { label: "Rejected", value: rejected, bg: "bg-red-50", text: "text-red-600", icon: XCircle },
    ];
  }, [filteredData]);

  // Status badge
  const getStatusBadge = (status: VerificationStatus) => {
    const config = {
      VERIFIED: { bg: "bg-green-100", text: "text-green-700", label: "Verified" },
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
    };
    const { bg, text, label } = config[status] || config.PENDING;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  // Format time
  const formatTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "-";
    try {
      const date = new Date(dateTimeStr);
      const wibDate = addHours(date, 7);
      return format(wibDate, "HH:mm");
    } catch {
      return "-";
    }
  };

  // Format hours
  const formatHours = (hours: number | null) => {
    if (hours === null || hours === undefined) return "-";
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Attendance Log</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor daily employee attendance and check-in activity
            </p>
          </div>
          <button
            onClick={fetchAttendance}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-3" ref={datePickerRef}>
            <span className="text-sm font-medium text-gray-600">Date Range:</span>

            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-lg hover:bg-[#e55e07] focus:outline-none focus:ring-2 focus:ring-[#ff8533] text-sm font-medium shadow-sm"
            >
              <Calendar size={16} />
              {formatDateRange()}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => handlePreset("month")}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${activePreset === "month"
                  ? "bg-orange-100 text-[#ff6908] border-[#ff6908]"
                  : "text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]"
                  }`}
              >
                This Month
              </button>
              <button
                onClick={() => handlePreset("7")}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${activePreset === "7"
                  ? "bg-orange-100 text-[#ff6908] border-[#ff6908]"
                  : "text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]"
                  }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handlePreset("30")}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${activePreset === "30"
                  ? "bg-orange-100 text-[#ff6908] border-[#ff6908]"
                  : "text-gray-600 border-gray-300 hover:border-[#ff6908] hover:text-[#ff6908]"
                  }`}
              >
                Last 30 Days
              </button>
            </div>

            {isDatePickerOpen && (
              <div className="absolute z-50 mt-2 bg-white shadow-xl rounded-xl border border-gray-200 top-[280px]">
                <DateRangePicker
                  ranges={[dateRange]}
                  onChange={handleSelect}
                  maxDate={new Date()}
                  showDateDisplay={false}
                  rangeColors={["#ff6908"]}
                  className="rounded-xl"
                />
                <div className="p-3 border-t flex justify-end">
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="px-4 py-2 bg-[#ff6908] text-white rounded-lg text-sm font-medium hover:bg-[#e55e07]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`rounded-xl border border-gray-100 p-4 ${item.bg}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <Icon size={18} className={item.text} />
                </div>
                <span className="text-2xl font-semibold text-gray-900 mt-2 block">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee name or location..."
              className="w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6908] focus:border-transparent"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl border p-16 flex flex-col items-center justify-center">
            <Loader size={40} className="animate-spin text-[#ff6908] mb-4" />
            <p className="text-gray-500">Loading attendance data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed bg-white p-16 text-center">
            <div className="text-4xl mb-3">🗂️</div>
            <h3 className="text-base font-semibold text-gray-900">
              No attendance data
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `No records found for "${searchTerm}"`
                : "Attendance records will appear here once data is available."}
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Employee</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Check In</th>
                    <th className="px-4 py-3 text-left font-medium">Check Out</th>
                    <th className="px-4 py-3 text-left font-medium">Total Hours</th>
                    <th className="px-4 py-3 text-left font-medium">Location</th>
                    <th className="px-4 py-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ff6908] flex items-center justify-center text-xs font-bold">
                            {item.employeeName}
                          </div>
                          <span className="font-medium text-gray-900">{item.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.date ? format(new Date(item.date), "dd MMM yyyy") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Clock size={14} className="text-green-500" />
                          {formatTime(item.checkInTime)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Clock size={14} className="text-red-500" />
                          {formatTime(item.checkOutTime)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {formatHours(item.totalHours)}
                      </td>
                      <td className="px-4 py-3">
                        {item.location ? (
                          <div className="flex items-start gap-1.5 text-gray-600">
                            <MapPin size={14} className="text-gray-400 mt-0.5 min-w-[14px]" />
                            <span className="break-words min-w-[200px]" title={item.location}>
                              {item.location}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
              Showing {filteredData.length} records
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AttendanceLogPage;
