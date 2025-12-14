import { useState, useEffect } from 'react';
import TripTypeFilter from '../components/report/tripType/TripTypeFilter';
import ComparisonFilter from '../components/report/tripType/ComparisonFilter';
import TripTypeComparisonChart from '../components/report/tripType/TripTypeComparisonChart';
import SectionHeader from '../components/report/SectionHeader';
import TripTypeSummaryTable from '../components/report/tripType/TripTypeSummaryTable';
import { TripType, TripTypeSummary } from '../types/trip-type';
import {
  getTripTypes,
  getTripTypeSummaries,
} from '../services/api';
import { format } from 'date-fns';

export default function TripTypeReport() {
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<TripTypeSummary[]>([]);
  const [comparisonSummaries, setComparisonSummaries] = useState<TripTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tripTypeData = await getTripTypes();
        const summaryData = await getTripTypeSummaries();

        setTripTypes(tripTypeData);
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
      const filteredData = await getTripTypeSummaries(startDateStr, endDateStr);
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
    tripTypeIds?: number[]
  ): Promise<void> => {
    try {
      setComparisonLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;

      if (!tripTypeIds || tripTypeIds.length === 0) {
        setComparisonSummaries([]);
      } else {
        const comparisonData = await getTripTypeSummaries(startDateStr, endDateStr, tripTypeIds);
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
            <TripTypeFilter tripTypes={tripTypes} onFilterChange={handleFilterChange} />

            <SectionHeader
              title="Trip Type Summary"
              description="Overview of all trip types"
            />

            <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <TripTypeSummaryTable summaries={filteredSummaries} loading={loading} />
            </div>
          </section>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-sm text-gray-400 uppercase font-medium tracking-wider">
              Trip Type Comparison
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <section className="space-y-6">
            <SectionHeader
              title="Compare Trip Type Performance"
              description="Select trip types to compare their financial and operational metrics"
            />

            <ComparisonFilter tripTypes={tripTypes} onFilterChange={handleComparisonFilterChange} />

            {comparisonLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ffa257] border-t-transparent" />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6">
                <TripTypeComparisonChart summaries={comparisonSummaries} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
