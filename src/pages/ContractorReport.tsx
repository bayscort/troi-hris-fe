import { useState, useEffect } from 'react';
import ContractorFilter from '../components/report/contractor/ContractorFilter';
import ComparisonFilter from '../components/report/contractor/ComparisonFilter';
import ContractorComparisonChart from '../components/report/contractor/ContractorComparisonChart';
import SectionHeader from '../components/report/SectionHeader';
import ContractorSummaryTable from '../components/report/contractor/ContractorSummaryTable';
import { Contractor, ContractorSummary } from '../types/contractor';
import {
  getContractors,
  getContractorSummaries,
} from '../services/api';
import { format } from 'date-fns';

export default function ContractorReport() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [, setSummaries] = useState<ContractorSummary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<ContractorSummary[]>([]);
  const [comparisonSummaries, setComparisonSummaries] = useState<ContractorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const contractorData = await getContractors();
        const summaryData = await getContractorSummaries();

        setContractors(contractorData);
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
    end: Date | null
  ): void => {
    void fetchFilteredSummaries(start, end);
  };

  const fetchFilteredSummaries = async (
    start: Date | null,
    end: Date | null
  ): Promise<void> => {
    try {
      setLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;
      const filteredData = await getContractorSummaries(startDateStr, endDateStr);
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
    contractorIds?: number[]
  ): Promise<void> => {
    try {
      setComparisonLoading(true);
      const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
      const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;

      if (!contractorIds || contractorIds.length === 0) {
        setComparisonSummaries([]);
      } else {
        const comparisonData = await getContractorSummaries(startDateStr, endDateStr, contractorIds);
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
            <ContractorFilter contractors={contractors} onFilterChange={handleFilterChange} />

            <SectionHeader
              title="Contractor Summary"
              description="Overview of all contractors"
            />

            <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <ContractorSummaryTable summaries={filteredSummaries} loading={loading} />
            </div>
          </section>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-sm text-gray-400 uppercase font-medium tracking-wider">
              Contractor Comparison
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <section className="space-y-6">
            <SectionHeader
              title="Compare Contractor Performance"
              description="Select contractors to compare their financial and operational metrics"
            />

            <ComparisonFilter contractors={contractors} onFilterChange={handleComparisonFilterChange} />

            {comparisonLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ffa257] border-t-transparent" />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6">
                <ContractorComparisonChart summaries={comparisonSummaries} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
