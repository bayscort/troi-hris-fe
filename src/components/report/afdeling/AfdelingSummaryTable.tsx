import { AfdelingSummary } from '../../../types/location';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface AfdelingSummaryTableProps {
  summaries: AfdelingSummary[];
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

export default function AfdelingSummaryTable({ summaries, loading }: AfdelingSummaryTableProps) {
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
        <p className="text-gray-500">No afdeling data available for the selected period</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Afdeling
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trips
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Expenses
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit/Loss
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaries.map((summary, index) => {
              const afdeling = summary.afdeling;

              const isProfitable = summary.profitLoss >= 0;
              const profitMargin = summary.totalRevenue !== 0
                ? (summary.profitLoss / summary.totalRevenue) * 100
                : 0;

              return (
                <tr
                  key={afdeling?.id || `afdeling-${index}`}
                  className={`hover:bg-gray-50 ${!afdeling?.name ? 'bg-yellow-50' : ''
                    }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {afdeling?.name || '- No Origin -'}
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
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {formatCurrency(summary.profitLoss)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isProfitable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {isProfitable ? (
                        <ArrowUp size={12} className="mr-1" />
                      ) : (
                        <ArrowDown size={12} className="mr-1" />
                      )}
                      {Math.abs(profitMargin).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              );

            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
