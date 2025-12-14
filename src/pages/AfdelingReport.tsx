import { useState, useEffect } from 'react';
import AfdelingFilter from '../components/report/afdeling/AfdelingFilter';
import ComparisonFilter from '../components/report/afdeling/ComparisonFilter';
import AfdelingComparisonChart from '../components/report/afdeling/AfdelingComparisonChart';
import SectionHeader from '../components/report/SectionHeader';
import AfdelingSummaryTable from '../components/report/afdeling/AfdelingSummaryTable';
import { Afdeling, AfdelingSummary, Estate } from '../types/location';
import { getEstates, getAfdelingSummaries } from '../services/api';
import { format } from 'date-fns';

export default function AfdelingReport() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [afdelings, setAfdelings] = useState<Afdeling[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<AfdelingSummary[]>([]);
  const [comparisonSummaries, setComparisonSummaries] = useState<AfdelingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const estateData = await getEstates();
        setEstates(estateData);

        const allAfdelings: Afdeling[] = [];
        estateData.forEach((estate) => {
          if (estate.afdelingList && estate.afdelingList.length > 0) {
            allAfdelings.push(...estate.afdelingList);
          }
        });
        setAfdelings(allAfdelings);

        const summaryData = await getAfdelingSummaries();
        setFilteredSummaries(summaryData);
      } catch (error) {
        console.error('Error fetching afdeling report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchFilteredSummaries = async (start: Date | null, end: Date | null): Promise<void> => {
    try {
      setLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;

      const filteredData = await getAfdelingSummaries(startDateStr, endDateStr);
      setFilteredSummaries(filteredData);
    } catch (error) {
      console.error('Error applying afdeling filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (start: Date | null, end: Date | null): void => {
    void fetchFilteredSummaries(start, end);
  };

  const handleComparisonFilterChange = async (
    start: Date | null,
    end: Date | null,
    afdelingIds?: number[]
  ): Promise<void> => {
    try {
      setComparisonLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;

      if (!afdelingIds || afdelingIds.length === 0) {
        setComparisonSummaries([]);
        return;
      }

      const comparisonData = await getAfdelingSummaries(startDateStr, endDateStr, afdelingIds);
      setComparisonSummaries(comparisonData);
    } catch (error) {
      console.error('Error applying afdeling comparison filters:', error);
    } finally {
      setComparisonLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 overflow-y-auto">
        <main className="space-y-12">

          <section className="space-y-6">
            <AfdelingFilter afdelings={afdelings} onFilterChange={handleFilterChange} />

            <SectionHeader
              title="Origin Summary"
              description="Overview of all origins"
            />

            <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <AfdelingSummaryTable summaries={filteredSummaries} loading={loading} />
            </div>
          </section>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-sm text-gray-400 uppercase font-medium tracking-wider">
              Origin Comparison
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <section className="space-y-6">
            <SectionHeader
              title="Compare Origin Performance"
              description="Select origins to compare their financial and operational metrics"
            />

            <ComparisonFilter
              afdelings={afdelings}
              estates={estates}
              onFilterChange={handleComparisonFilterChange}
            />

            {comparisonLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ffa257] border-t-transparent" />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6">
                <AfdelingComparisonChart summaries={comparisonSummaries} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
