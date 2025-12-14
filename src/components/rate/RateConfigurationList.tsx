import React from 'react';
import { RateConfiguration } from '../../types/location';
import { format } from 'date-fns';

interface RateConfigurationListProps {
  configurations: RateConfiguration[];
  isLoading: boolean;
}

const RateConfigurationList: React.FC<RateConfigurationListProps> = ({
  configurations,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <svg className="animate-spin h-8 w-8 text-[#ff6908]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (configurations.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-sm">No active rate configurations found.</p>
        <p className="text-sm">Start by creating a new rate configuration.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border rounded-md overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Origin</th>
              <th className="px-4 py-3 font-medium">Sub-Origin</th>
              <th className="px-4 py-3 font-medium">Destination</th>
              <th className="px-4 py-3 font-medium">Rate (Rp)</th>
              <th className="px-4 py-3 font-medium">Contractor Rate (Rp)</th>
              <th className="px-4 py-3 font-medium">Effective Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {configurations.map((config) => (
              <tr key={config.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{config.afdeling.estateName}</td>
                <td className="px-4 py-3">
                  <div className="text-gray-900">{config.afdeling.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-900">{config.mill.name}</div>
                </td>
                <td className="px-4 py-3">{formatCurrency(config.ptpnRate)}</td>
                <td className="px-4 py-3">{formatCurrency(config.contractorRate)}</td>
                <td className="px-4 py-3">{formatDate(config.rateVersioning.effectiveDate)}</td>
                <td className="px-4 py-3">
                  {config.rateVersioning.active ? (
                    <span className="px-2 py-1 inline-flex text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RateConfigurationList;
