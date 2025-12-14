import { useState } from 'react';
import ReceiptReport from './ReceiptReport';
import ExpenditureReport from './ExpenditureReport';

export default function CombineReport() {
    const [activeTab, setActiveTab] = useState<'receipt' | 'expenditure'>('receipt');

    return (
        <div className="min-h-screen bg-white px-6 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex space-x-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('receipt')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'receipt' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        Receipt
                    </button>
                    <button
                        onClick={() => setActiveTab('expenditure')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'expenditure' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        Expenditure
                    </button>
                </div>

                <div>
                    {activeTab === 'receipt' && <ReceiptReport />}
                    {activeTab === 'expenditure' && <ExpenditureReport />}
                </div>
            </div>
        </div>
    );
}
