import React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

const stats = [
  {
    label: "Total People",
    value: 126,
    trend: "+15%",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    label: "Absent",
    value: 10,
    trend: "-15%",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
  {
    label: "On Time",
    value: 122,
    trend: "+10%",
    bg: "bg-green-50",
    text: "text-green-600",
  },
  {
    label: "Late Check-in",
    value: 4,
    trend: "+11%",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
];

const AttendanceLogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Attendance
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor daily employee attendance and check-in activity
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border border-gray-100 p-4 ${item.bg}`}
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </span>
                <span className={`text-xs font-medium ${item.text}`}>
                  {item.trend} vs last week
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border p-2 hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>

            <span className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
              Today
            </span>

            <button className="rounded-lg border p-2 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>

          <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            <Calendar size={16} />
            Pick date
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search employee..."
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <button className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50">
            Sort: New Employees
          </button>

          <button className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50">
            Designation
          </button>

          <button className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50">
            More Filters
          </button>
        </div>

        {/* Empty State */}
        <div className="rounded-xl border border-dashed bg-white p-16 text-center">
          <div className="text-4xl mb-3">🗂️</div>
          <h3 className="text-base font-semibold text-gray-900">
            No attendance data
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Attendance records will appear here once data is available.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AttendanceLogPage;
