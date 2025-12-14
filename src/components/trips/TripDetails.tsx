import React from 'react';
import { Building2, Calendar, CreditCard, MapPin, Package, Pen, Truck, User, X } from 'lucide-react';
import { format } from 'date-fns';
import { Trip } from '../../types/trip';

interface TripDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onEdit: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ isOpen, onClose, trip, onEdit }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const ptpnTotal = trip.loadWeightKg * trip.ptpnRate;
  const contractorTotal = trip.loadWeightKg * trip.contractorRate;
  const grossProfit = ptpnTotal - contractorTotal;
  const totalExpenses = trip.travelAllowance + trip.loadingFee + trip.consumptionFee
    + trip.additionalFee1 + trip.additionalFee2 + trip.additionalFee3;
  const netProfit = grossProfit - totalExpenses;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Trip Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-8 py-6 space-y-8 flex-grow">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Calendar size={20} className="text-[#ff6908]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Trip Date</p>
              <p className="text-base font-medium text-gray-800">
                {format(new Date(trip.date), 'EEEE, d MMMM yyyy')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#ff6908]" />
                <h3 className="text-sm font-semibold text-gray-700">Location</h3>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="text-sm text-gray-800">{trip.mill?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Origin</p>
                <p className="text-sm text-gray-800">{trip.afdeling?.name || '—'}</p>
              </div>
              {trip.afdeling?.blockList?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Blocks</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {trip.afdeling.blockList.map((block) => (
                      <span key={block.id} className="text-xs bg-orange-100 text-[#e55e07] px-2 py-1 rounded">
                        {block.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#ff6908]" />
                <h3 className="text-sm font-semibold text-gray-700">Driver & Vehicle</h3>
              </div>

              <p className="text-sm text-gray-800">{trip.driver?.name || 'No driver assigned'}</p>
              <p className="text-sm text-gray-500">License: {trip.driver?.licenseNumber || '—'}</p>

              {trip.vehicle ? (
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <Truck size={16} className="mr-2 text-gray-500" />
                  {trip.vehicle.licensePlatNumber} ({trip.vehicle.vehicleType})
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-400 mt-2">
                  <Truck size={16} className="mr-2 text-gray-400" />
                  No vehicle assigned
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-[#ff6908]" />
                <h3 className="text-sm font-semibold text-gray-700">Contractor</h3>
              </div>
              <p className="text-sm text-gray-800">{trip.contractor?.name || 'No contractor assigned'}</p>
              <p className="text-sm text-gray-500">Phone: {trip.contractor?.phoneNumber || '—'}</p>
            </div>


            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#ff6908]" />
                <h3 className="text-sm font-semibold text-gray-700">Load Information</h3>
              </div>

              {[1, 2].includes(trip.tripType?.id ?? -1) && (
                <p className="text-sm text-gray-800">{trip.loadWeightKg.toLocaleString()} kg</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {[1, 2].includes(trip.tripType?.id ?? -1) ? 'PTPN Rate' : 'Rate'}
                  </p>
                  <p className="text-sm text-gray-800">
                    {trip.ptpnRate}
                    {[1, 2].includes(trip.tripType?.id ?? -1) ? ' per kg' : ' per trip'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Contractor Rate
                  </p>
                  <p className="text-sm text-gray-800">
                    {trip.contractorRate}
                    {[1, 2].includes(trip.tripType?.id ?? -1) ? ' per kg' : ' per trip'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={18} className="text-[#ff6908]" />
              <h3 className="text-sm font-semibold text-gray-700">Financial Summary</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-sm text-gray-800 font-medium">{formatCurrency(ptpnTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contractor Payment</p>
                <p className="text-sm text-gray-800 font-medium">{formatCurrency(contractorTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gross Profit</p>
                <p className="text-sm text-green-600 font-medium">{formatCurrency(grossProfit)}</p>
              </div>
            </div>

            <hr className="border-orange-200 my-2" />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Travel Allowance</p>
                <p className="text-sm text-gray-800">{formatCurrency(trip.travelAllowance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loading Fee</p>
                <p className="text-sm text-gray-800">{formatCurrency(trip.loadingFee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Consumption Fee</p>
                <p className="text-sm text-gray-800">{formatCurrency(trip.consumptionFee)}</p>
              </div>
              {(trip.additionalFee1 || 0) > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Additional Fee 1</p>
                  <p className="text-sm text-gray-800">{formatCurrency(trip.additionalFee1!)}</p>
                </div>
              )}
              {(trip.additionalFee2 || 0) > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Additional Fee 2</p>
                  <p className="text-sm text-gray-800">{formatCurrency(trip.additionalFee2!)}</p>
                </div>
              )}
              {(trip.additionalFee3 || 0) > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Additional Fee 3</p>
                  <p className="text-sm text-gray-800">{formatCurrency(trip.additionalFee3!)}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t pt-3 border-orange-200 mt-4">
              <p className="text-sm font-medium text-gray-700">Total Expenses</p>
              <p className="text-sm font-medium text-gray-800">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-medium text-gray-700">Net Profit</p>
              <p className={`font-semibold text-base ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-[#ff6908] text-white rounded-lg hover:bg-[#e55e07] flex items-center gap-2"
          >
            <Pen size={16} />
            Edit Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
