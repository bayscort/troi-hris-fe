import { useState } from 'react';
import BaseEmployeeList from './BaseEmployeeList';
import { EmployeeCategory } from '../types/employee';

type TabKey = 'ALL' | 'ACTIVE' | 'TALENT_POOL';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'All Employees' },
  { key: 'ACTIVE', label: 'Active Employees' },
  { key: 'TALENT_POOL', label: 'Talent Pool' },
];

export default function CombineEmployee() {
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TAB HEADER */}
        <div className="flex gap-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 py-2 text-sm font-medium transition
                ${activeTab === tab.key
                  ? 'border-b-2 border-[#ff6908] text-[#ff6908]'
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <BaseEmployeeList
          category={activeTab as EmployeeCategory}
          showAddButton={activeTab === 'ALL'}
        />

      </div>
    </div>
  );
}
