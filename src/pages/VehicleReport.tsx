import { useState, useEffect } from 'react';
import VehicleFilter from '../components/report/vehicle/VehicleFilter';
import ComparisonFilter from '../components/report/vehicle/ComparisonFilter';
import VehicleComparisonChart from '../components/report/vehicle/VehicleComparisonChart';
import SectionHeader from '../components/report/SectionHeader';
import VehicleSummaryTable from '../components/report/vehicle/VehicleSummaryTable';
import { Vehicle, VehicleSummary } from '../types/vehicle';
import {
  getVehicles,
  getVehicleSummaries,
} from '../services/api';
import { format } from 'date-fns';

export default function VehicleReport() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<VehicleSummary[]>([]);
  const [comparisonSummaries, setComparisonSummaries] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const vehicleData = await getVehicles();
        const summaryData = await getVehicleSummaries();

        setVehicles(vehicleData);
        setFilteredSummaries(summaryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (
    startDate: Date | null,
    endDate: Date | null  ): void => {
    void fetchFilteredSummaries(startDate, endDate);
  };

  const fetchFilteredSummaries = async (
    start: Date | null,
    end: Date | null
  ): Promise<void> => {
    try {
      setLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;
      const filteredData = await getVehicleSummaries(startDateStr, endDateStr);
      setFilteredSummaries(filteredData);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComparisonFilterChange = async (
    start: Date | null,
    end: Date | null,
    vehicleIds?: number[]
  ): Promise<void> => {
    try {
      setComparisonLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;

      if (!vehicleIds || vehicleIds.length === 0) {
        setComparisonSummaries([]);
      } else {
        const comparisonData = await getVehicleSummaries(startDateStr, endDateStr, vehicleIds);
        setComparisonSummaries(comparisonData);
      }
    } catch (error) {
      console.error('Error applying comparison filters:', error);
    } finally {
      setComparisonLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 overflow-y-auto">
        <main className="space-y-12">

          <section className="space-y-6">
            <VehicleFilter vehicles={vehicles} onFilterChange={handleFilterChange} />

            <SectionHeader
              title="Vehicle Summary"
              description="Overview of all vehicles"
            />

            <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <VehicleSummaryTable summaries={filteredSummaries} loading={loading} />
            </div>
          </section>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-sm text-gray-400 uppercase font-medium tracking-wider">
              Vehicle Comparison
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <section className="space-y-6">
            <SectionHeader
              title="Compare Vehicle Performance"
              description="Select vehicles to compare their financial and operational metrics"
            />

            <ComparisonFilter vehicles={vehicles} onFilterChange={handleComparisonFilterChange} />

            {comparisonLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ffa257] border-t-transparent" />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6">
                <VehicleComparisonChart summaries={comparisonSummaries} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
