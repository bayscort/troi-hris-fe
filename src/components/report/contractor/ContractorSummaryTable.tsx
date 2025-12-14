import { useState, Fragment } from 'react';
import { ContractorSummary } from '../../../types/contractor';
import { ArrowDown, ArrowUp, ChevronDown, Truck, CarFront } from 'lucide-react';

interface ContractorSummaryTableProps {
  summaries: ContractorSummary[];
  loading: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function ContractorSummaryTable({ summaries, loading }: ContractorSummaryTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const handleToggleRow = (contractorId: number) => {
    setExpandedRowId(prevId => (prevId === contractorId ? null : contractorId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff832f]"></div>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-center h-32">
        <p className="text-gray-500">No contractor data available for the selected period</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Trips</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaries.map((summary) => {
              const contractor = summary.contractor;
              const isProfitable = summary.profitLoss >= 0;
              const profitMargin = summary.totalRevenue !== 0
                ? (summary.profitLoss / summary.totalRevenue) * 100
                : 0;
              const isExpanded = expandedRowId === contractor?.id;
              return (
                <Fragment key={contractor?.id}>
                  <tr
                    className={`hover:bg-gray-50 ${!contractor?.name ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      {summary.vehicles && summary.vehicles.length > 0 && contractor?.id !== undefined && (
                        <button 
                          onClick={() => handleToggleRow(contractor.id!)} 
                          className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff832f]"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contractor?.name || '- No Contractor -'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {summary.totalTrips}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(summary.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {formatCurrency(summary.totalExpenses)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary.profitLoss)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isProfitable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isProfitable ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                        {Math.abs(profitMargin).toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <div className="bg-slate-50 px-6 py-5">
                          <div className="flex items-center gap-x-3 mb-4 px-2">
                            <Truck className="h-5 w-5 text-slate-500" />
                            <h4 className="text-md font-semibold text-slate-800">
                              Vehicle Details ({summary.vehicles.length})
                            </h4>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto pr-2">
                            {summary.vehicles.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {summary.vehicles.map(vehicle => (
                                  <div key={vehicle.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center gap-x-3">
                                      <CarFront className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                      <p className="font-mono text-sm font-medium text-slate-900 truncate">
                                        {vehicle.licensePlatNumber}
                                      </p>
                                    </div>
                                    <div className="mt-2 pl-8">
                                      <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800">
                                        {vehicle.vehicleType}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-sm text-slate-500">No vehicle data found.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}