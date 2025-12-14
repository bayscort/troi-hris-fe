import { useState } from 'react';
import TripDashboard from './TripDashboard';
import FinanceDashboard from './FinanceDashboard';

export default function CombineDashboard() {
    const [activeTab, setActiveTab] = useState<'trip-dashboard' | 'finance-dashboard'>('trip-dashboard');

    return (
        <div className="min-h-screen bg-white px-6 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex space-x-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('trip-dashboard')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'trip-dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        TRIP
                    </button>
                    <button
                        onClick={() => setActiveTab('finance-dashboard')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'finance-dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        FINANCE
                    </button>
                </div>

                <div>
                    {activeTab === 'trip-dashboard' && <TripDashboard />}
                    {activeTab === 'finance-dashboard' && <FinanceDashboard />}
                </div>
            </div>
        </div>
    );
}
