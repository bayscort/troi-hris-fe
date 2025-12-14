import { useState } from 'react';
import ContractorReport from './ContractorReport';
import DriverReport from './DriverReport';
import VehicleReport from './VehicleReport';
import MillReport from './MillReport';
import AfdelingReport from './AfdelingReport';
import TripTypeReport from './TripTypeReport';

export default function CombineReport() {
    const [activeTab, setActiveTab] = useState<'tripType'|'mill' | 'afdeling' | 'contractor' | 'driver' | 'vehicle'>('mill');

    return (
        <div className="min-h-screen bg-white px-6 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex space-x-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('tripType')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'tripType' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        Trip Type
                    </button>
                    <button
                        onClick={() => setActiveTab('mill')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'mill' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        Destination
                    </button>
                    <button
                        onClick={() => setActiveTab('afdeling')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'afdeling' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        Origin
                    </button>
                    <button
                        onClick={() => setActiveTab('contractor')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'contractor' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        Contractor
                    </button>
                    <button
                        onClick={() => setActiveTab('driver')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'driver' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        Driver
                    </button>
                    <button
                        onClick={() => setActiveTab('vehicle')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'vehicle' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        Vehicle
                    </button>
                </div>

                <div>
                    {activeTab === 'tripType' && <TripTypeReport />}
                    {activeTab === 'mill' && <MillReport />}
                    {activeTab === 'afdeling' && <AfdelingReport />}
                    {activeTab === 'contractor' && <ContractorReport />}
                    {activeTab === 'driver' && <DriverReport />}
                    {activeTab === 'vehicle' && <VehicleReport />}
                </div>
            </div>
        </div>
    );
}
