import { useState, useEffect } from 'react';
import DriverFilter from '../components/report/driver/DriverFilter';
import ComparisonFilter from '../components/report/driver/ComparisonFilter';
import DriverComparisonChart from '../components/report/driver/DriverComparisonChart';
import SectionHeader from '../components/report/SectionHeader';
import DriverSummaryTable from '../components/report/driver/DriverSummaryTable';
import { Driver, DriverSummary } from '../types/driver';
import {
  getDrivers,
  getDriverSummaries,
} from '../services/api';
import { format } from 'date-fns';

export default function DriverReport() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [, setSummaries] = useState<DriverSummary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<DriverSummary[]>([]);
  const [comparisonSummaries, setComparisonSummaries] = useState<DriverSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const driverData = await getDrivers();
        const summaryData = await getDriverSummaries();

        setDrivers(driverData);
        setSummaries(summaryData);
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
    start: Date | null,
    end: Date | null,
  ): void => {
    void fetchFilteredSummaries(start, end);
  };

  const fetchFilteredSummaries = async (
    start: Date | null,
    end: Date | null  ): Promise<void> => {
    try {
      setLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;
      const filteredData = await getDriverSummaries(startDateStr, endDateStr);
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
    driverIds?: number[]
  ): Promise<void> => {
    try {
      setComparisonLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;

      if (!driverIds || driverIds.length === 0) {
        setComparisonSummaries([]);
      } else {
        const comparisonData = await getDriverSummaries(startDateStr, endDateStr, driverIds);
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
            <DriverFilter drivers={drivers} onFilterChange={handleFilterChange} />

            <SectionHeader
              title="Driver Summary"
              description="Overview of all drivers"
            />

            <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <DriverSummaryTable summaries={filteredSummaries} loading={loading} />
            </div>
          </section>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-sm text-gray-400 uppercase font-medium tracking-wider">
              Driver Comparison
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <section className="space-y-6">
            <SectionHeader
              title="Compare Driver Performance"
              description="Select drivers to compare their financial and operational metrics"
            />

            <ComparisonFilter drivers={drivers} onFilterChange={handleComparisonFilterChange} />

            {comparisonLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ffa257] border-t-transparent" />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6">
                <DriverComparisonChart summaries={comparisonSummaries} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
