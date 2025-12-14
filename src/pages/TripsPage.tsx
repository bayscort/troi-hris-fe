import React, { useState, useEffect } from 'react';
import { MultiValue } from 'react-select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  FileText,
  Loader,
  Pencil,
  Plus,
  Trash,
  ArrowDown
} from 'lucide-react';
import { format, addHours } from 'date-fns';
import {
  tripService,
  PaginationParams,
  ApiResponse,
  referenceService
} from '../services/api';

import { Trip } from '../types/trip';
import TripForm from '../components/trips/TripForm';
import TripDetails from '../components/trips/TripDetails';
import TripFilter from '../components/trips/TripFilter';
import { useAuth } from '../context/AuthContext';
import { Afdeling, Mill } from '../types/location';
import { Driver } from '../types/driver';
import { Vehicle } from '../types/vehicle';
import { Contractor } from '../types/contractor';
import { TripType } from '../types/trip-type';


export type SelectOption = {
  value: string | number;
  label: string;
};

interface FilterParams {
  startDate?: string;
  endDate?: string;
  millIds?: (string | number)[];
  afdelingIds?: (string | number)[];
  driverIds?: (string | number)[];
  vehicleIds?: (string | number)[];
  contractorIds?: (string | number)[];
  tripTypeIds?: (string | number)[];
  loadWeightMin?: number;
  loadWeightMax?: number;
  millNull?: boolean;
  afdelingNull?: boolean;
  driverNull?: boolean;
  vehicleNull?: boolean;
  contractorNull?: boolean;
  tripTypeNull?: boolean;
}


const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 0,
    size: 10,
    sort: 'date,desc'
  });
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalElements: 0,
    currentPage: 0
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [mills, setMills] = useState<Mill[]>([]);
  const [afdelings, setAfdelings] = useState<Afdeling[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedMills, setSelectedMills] = useState<MultiValue<SelectOption>>([]);
  const [selectedAfdelings, setSelectedAfdelings] = useState<MultiValue<SelectOption>>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<MultiValue<SelectOption>>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<MultiValue<SelectOption>>([]);
  const [selectedContractors, setSelectedContractors] = useState<MultiValue<SelectOption>>([]);
  const [selectedTripTypes, setSelectedTripTypes] = useState<MultiValue<SelectOption>>([]);
  const [loadWeightMin, setLoadWeightMin] = useState<number | null>(null);
  const [loadWeightMax, setLoadWeightMax] = useState<number | null>(null);


  const [appliedFilters, setAppliedFilters] = useState<FilterParams>({});


  const { authState } = useAuth();

  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  const [showExtraColumns, setShowExtraColumns] = useState(false);

  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleExport = async () => {
    console.log("Mengekspor data dengan filter:", appliedFilters);

    try {
      const blob = await tripService.exportTrips(appliedFilters);

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      const date = new Date().toISOString().slice(0, 10);
      a.download = `trips-export-${date}.xlsx`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Gagal mengekspor data:", error);
    }
  };

  const handleSortChange = (field: string) => {
    let newDirection: 'asc' | 'desc' = 'desc';
    if (field === sortField) {
      newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    }
    setSortField(field);
    setSortDirection(newDirection);
    setPagination({ ...pagination, sort: `${field},${newDirection}` });
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp size={14} className="inline ml-1" />
      : <ChevronDown size={14} className="inline ml-1" />;
  };

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [
          millsData,
          driversData,
          vehiclesData,
          contractorsData,
          tripTypesData,
          estateData
        ] = await Promise.all([
          referenceService.getAllMills(),
          referenceService.getAllDrivers(),
          referenceService.getAllVehicles(),
          referenceService.getAllContractors(),
          referenceService.getAllTripTypes(),
          authState?.estateId
            ? referenceService.getEstateById(authState.estateId)
            : referenceService.getAllEstates()
        ]);

        setMills(millsData);
        setDrivers(driversData);
        setVehicles(vehiclesData);
        setContractors(contractorsData);
        setTripTypes(tripTypesData);

        if (authState?.estateId) {
          if (estateData && !Array.isArray(estateData)) {
            setAfdelings(estateData.afdelingList || []);
          } else {
            setAfdelings([]);
          }
        } else {
          const allAfdelings = Array.isArray(estateData)
            ? estateData.flatMap((estate: any) => estate.afdelingList || [])
            : [];
          setAfdelings(allAfdelings);
        }
      } catch (err) {
        console.error('Error loading filter data', err);
      }
    };

    fetchFiltersData();
  }, [authState?.estateId]);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const response: ApiResponse<Trip> = await tripService.getAllTrips(pagination, appliedFilters);

        setTrips(response.content);
        setPaginationInfo({
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          currentPage: response.number
        });
        setError(null);
      } catch (err) {
        setError('Failed to fetch trips. Please try again later.');
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [pagination, refreshTrigger, appliedFilters]);
  const handleApplyFilters = () => {
    const NULL_FILTER_VALUE = 'IS_NULL';

    const filters: FilterParams = {
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      loadWeightMin: loadWeightMin ?? undefined,
      loadWeightMax: loadWeightMax ?? undefined,
    };

    if (selectedMills.some(m => m.value === NULL_FILTER_VALUE)) {
      filters.millNull = true;
    } else if (selectedMills.length > 0) {
      filters.millIds = selectedMills.map(m => m.value);
    }

    if (selectedAfdelings.some(a => a.value === NULL_FILTER_VALUE)) {
      filters.afdelingNull = true;
    } else if (selectedAfdelings.length > 0) {
      filters.afdelingIds = selectedAfdelings.map(a => a.value);
    }

    if (selectedDrivers.some(d => d.value === NULL_FILTER_VALUE)) {
      filters.driverNull = true;
    } else if (selectedDrivers.length > 0) {
      filters.driverIds = selectedDrivers.map(d => d.value);
    }

    if (selectedVehicles.some(v => v.value === NULL_FILTER_VALUE)) {
      filters.vehicleNull = true;
    } else if (selectedVehicles.length > 0) {
      filters.vehicleIds = selectedVehicles.map(v => v.value);
    }

    if (selectedContractors.some(c => c.value === NULL_FILTER_VALUE)) {
      filters.contractorNull = true;
    } else if (selectedContractors.length > 0) {
      filters.contractorIds = selectedContractors.map(c => c.value);
    }

    if (selectedTripTypes.some(c => c.value === NULL_FILTER_VALUE)) {
      filters.tripTypeNull = true;
    } else if (selectedTripTypes.length > 0) {
      filters.tripTypeIds = selectedTripTypes.map(c => c.value);
    }

    setAppliedFilters(filters);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedMills([]);
    setSelectedAfdelings([]);
    setSelectedDrivers([]);
    setSelectedVehicles([]);
    setSelectedContractors([]);
    setSelectedTripTypes([]);
    setLoadWeightMin(null);
    setLoadWeightMax(null);

    setAppliedFilters({});
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleViewDetails = async (tripId: number) => {
    try {
      setLoading(true);
      const trip = await tripService.getTripById(tripId);
      setSelectedTrip(trip);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError('Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTrip = async (tripId: number) => {
    try {
      setLoading(true);
      const trip = await tripService.getTripById(tripId);
      setSelectedTrip(trip);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error('Error fetching trip for edit:', err);
      setError('Failed to load trip for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        setLoading(true);
        await tripService.deleteTrip(tripId);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting trip:', err);
        setError('Failed to delete trip.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTripSaved = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedTrip(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Trip Management
        </h1>

        <div className="flex items-center gap-3">
          {hasPermission('trip', 'CREATE') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-[#ff6908] text-white px-5 py-2.5 rounded-xl 
                   hover:bg-[#e55e07] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={18} />
              <span className="font-medium">Add Trip</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-[#ff6908] text-[#ff6908] px-5 py-2.5 rounded-xl 
                 hover:bg-[#ff6908] hover:text-white active:scale-95 transition-all shadow-sm"
          >
            <ArrowDown size={18} />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>



      <TripFilter
        mills={mills}
        afdelings={afdelings}
        drivers={drivers}
        vehicles={vehicles}
        contractors={contractors}
        tripTypes={tripTypes}
        selectedMills={selectedMills}
        setSelectedMills={setSelectedMills}
        selectedAfdelings={selectedAfdelings}
        setSelectedAfdelings={setSelectedAfdelings}
        selectedDrivers={selectedDrivers}
        setSelectedDrivers={setSelectedDrivers}
        selectedVehicles={selectedVehicles}
        setSelectedVehicles={setSelectedVehicles}
        selectedContractors={selectedContractors}
        setSelectedContractors={setSelectedContractors}
        selectedTripTypes={selectedTripTypes}
        setSelectedTripTypes={setSelectedTripTypes}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        loadWeightMin={loadWeightMin}
        setLoadWeightMin={setLoadWeightMin}
        loadWeightMax={loadWeightMax}
        setLoadWeightMax={setLoadWeightMax}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2">
                  <button
                    onClick={() => setShowExtraColumns(prev => !prev)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    {showExtraColumns ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                  </button>
                </th>
                {showExtraColumns && (
                  <>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      onClick={() => handleSortChange('createdAt')}
                    >
                      Created At {renderSortIcon('createdAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Created By
                    </th>
                  </>
                )}
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => handleSortChange('date')}
                >
                  Date {renderSortIcon('date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Origin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Contractor
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => handleSortChange('loadWeightKg')}
                >
                  Load (kg) {renderSortIcon('loadWeightKg')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && trips.length === 0 ? (
                <tr>
                  <td colSpan={showExtraColumns ? 11 : 9} className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="flex justify-center items-center">
                      <Loader size={20} className="animate-spin mr-2" />
                      Loading trips...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={showExtraColumns ? 11 : 9} className="px-6 py-4 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={showExtraColumns ? 11 : 9} className="px-6 py-4 text-center text-sm text-gray-500">
                    No trips found.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr
                    key={trip.id}
                    className={`${trip.tripType.name === 'SAWIT' && trip.loadWeightKg < 6000
                      ? 'bg-red-50 hover:bg-red-100'
                      : 'hover:bg-gray-50'
                      } transition-colors duration-150`}
                  >
                    <td className="px-2 text-center">
                    </td>
                    {showExtraColumns && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trip.createdAt
                            ? format(addHours(new Date(trip.createdAt), 7), 'dd MMM yyyy HH:mm')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trip.createdBy || '-'}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(trip.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.tripType?.name || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.afdeling?.name || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.mill?.name || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.driver?.name || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.vehicle?.licensePlatNumber || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.contractor?.name || ''}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${([1, 2].includes(trip.tripType?.id ?? -1) &&
                          typeof trip.loadWeightKg === 'number' &&
                          trip.loadWeightKg < 6000)
                          ? 'font-bold text-red-800'
                          : 'text-gray-900'
                        }`}
                    >
                      {([1, 2].includes(trip.tripType?.id ?? -1) &&
                        typeof trip.loadWeightKg === 'number')
                        ? trip.loadWeightKg.toLocaleString('id-ID')
                        : '-'}
                    </td>


                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {hasPermission('trip', 'READ') && (
                          <button
                            onClick={() => trip.id && handleViewDetails(trip.id)}
                            className="text-[#ff6908] hover:text-[#b94d06]"
                            title="View Details"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        {hasPermission('trip', 'UPDATE') && (
                          <button
                            onClick={() => trip.id && handleEditTrip(trip.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        {hasPermission('trip', 'DELETE') && (
                          <button
                            onClick={() => trip.id && handleDeleteTrip(trip.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {trips.length} of {paginationInfo.totalElements} trips
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(Math.max(0, paginationInfo.currentPage - 1))}
            disabled={paginationInfo.currentPage === 0}
            className={`p-2 rounded-lg border ${paginationInfo.currentPage === 0
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {paginationInfo.currentPage + 1} of {paginationInfo.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(paginationInfo.totalPages - 1, paginationInfo.currentPage + 1))}
            disabled={paginationInfo.currentPage === paginationInfo.totalPages - 1}
            className={`p-2 rounded-lg border ${paginationInfo.currentPage === paginationInfo.totalPages - 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <TripForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleTripSaved}
        />
      )}

      {isEditModalOpen && selectedTrip && (
        <TripForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleTripSaved}
          trip={selectedTrip}
        />
      )}

      {isDetailsModalOpen && selectedTrip && (
        <TripDetails
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          trip={selectedTrip}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setIsEditModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default TripsPage;