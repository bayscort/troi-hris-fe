import { useState, useEffect } from 'react';
import MillFilter from '../components/report/mill/MillFilter';
import ComparisonFilter from '../components/report/mill/ComparisonFilter';
import MillComparisonChart from '../components/report/mill/MillComparisonChart';
import SectionHeader from '../components/report/SectionHeader';
import MillSummaryTable from '../components/report/mill/MillSummaryTable';
import { Mill, MillSummary } from '../types/location';
import {
  getMills,
  getMillSummaries,
} from '../services/api';
import { format } from 'date-fns';

export default function MillReport() {
  const [mills, setMills] = useState<Mill[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<MillSummary[]>([]);
  const [comparisonSummaries, setComparisonSummaries] = useState<MillSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const millData = await getMills();
        const summaryData = await getMillSummaries();

        setMills(millData);
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
    endDate: Date | null): void => {
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
      const filteredData = await getMillSummaries(startDateStr, endDateStr);
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
    millIds?: number[]
  ): Promise<void> => {
    try {
      setComparisonLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;

      if (!millIds || millIds.length === 0) {
        setComparisonSummaries([]);
      } else {
        const comparisonData = await getMillSummaries(startDateStr, endDateStr, millIds);
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
            <MillFilter mills={mills} onFilterChange={handleFilterChange} />

            <SectionHeader
              title="Destination Summary"
              description="Overview of all destinations"
            />

            <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <MillSummaryTable summaries={filteredSummaries} loading={loading} />
            </div>
          </section>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-sm text-gray-400 uppercase font-medium tracking-wider">
              Destination Comparison
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <section className="space-y-6">
            <SectionHeader
              title="Compare Destination Performance"
              description="Select destinations to compare their financial and operational metrics"
            />

            <ComparisonFilter mills={mills} onFilterChange={handleComparisonFilterChange} />

            {comparisonLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ffa257] border-t-transparent" />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6">
                <MillComparisonChart summaries={comparisonSummaries} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
