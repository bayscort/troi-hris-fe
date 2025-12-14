import React, { useState, useEffect } from 'react';
import { locationApi } from '../services/api';
import { Afdeling, Mill, RateConfiguration } from '../types/location';
import { Plus, X, Loader, AlertTriangle } from 'lucide-react';
import RateConfigurationForm from '../components/rate/RateConfigurationForm';
import RateConfigurationList from '../components/rate/RateConfigurationList';
import { useAuth } from '../context/AuthContext';


enum ViewMode {
  LIST,
  CREATE
}

const RateConfigurationPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [rateConfigurations, setRateConfigurations] = useState<RateConfiguration[]>([]);
  const [afdelings, setAfdelings] = useState<Afdeling[]>([]);
  const [mills, setMills] = useState<Mill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authState } = useAuth();

  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  useEffect(() => {
    fetchRateConfigurations();
    fetchLocationData();
  }, []);

  const fetchRateConfigurations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await locationApi.getActiveRateConfigurations();
      setRateConfigurations(data);
    } catch (error) {
      console.error('Failed to fetch rate configurations:', error);
      setError('Failed to load rate configurations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocationData = async () => {
    setIsLoading(true);
    try {
      const estates = await locationApi.getAllEstates();
      const allAfdelings: Afdeling[] = [];
      estates.forEach(estate => {
        estate.afdelingList.forEach(afdeling => {
          allAfdelings.push({
            id: afdeling.id,
            estateName: afdeling.estateName,
            name: afdeling.name,
            blockList: afdeling.blockList
          });
        });
      });
      setAfdelings(allAfdelings);

      const millsData = await locationApi.getAllMills();
      setMills(millsData);
    } catch (error) {
      console.error('Failed to fetch location data:', error);
      setError('Failed to load location data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRateConfiguration = async (rateConfig: Partial<RateConfiguration>) => {
    setIsLoading(true);
    setError(null);
    try {
      await locationApi.createRateConfiguration({
        afdelingId: rateConfig.afdeling?.id as number,
        millId: rateConfig.mill?.id as number,
        ptpnRate: rateConfig.ptpnRate as number,
        contractorRate: rateConfig.contractorRate as number
      });
      await fetchRateConfigurations();
      setViewMode(ViewMode.LIST);
    } catch (error) {
      console.error('Failed to create rate configuration:', error);
      setError('Failed to create rate configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.CREATE:
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold">Create New Rate Configuration</h1>
              <button onClick={() => setViewMode(ViewMode.LIST)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <RateConfigurationForm
              afdelings={afdelings}
              mills={mills}
              onSubmit={handleCreateRateConfiguration}
              isLoading={isLoading}
            />
          </div>
        );
      case ViewMode.LIST:
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Rate Configuration Management</h1>

              {hasPermission('rate-configuration', 'CREATE') && (
                <button
                  onClick={() => setViewMode(ViewMode.CREATE)}
                  className="flex items-center gap-2 bg-[#ff6908] text-white px-4 py-2 rounded-md hover:bg-[#e55e07]"
                >
                  <Plus size={18} /> Add New Configuration
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-md flex gap-2 text-sm border bg-red-50 text-red-700 border-red-200">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader size={20} className="animate-spin text-gray-600" />
              </div>
            ) : (
              <RateConfigurationList
                configurations={rateConfigurations}
                isLoading={isLoading}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="p-8 flex-1 overflow-auto bg-white text-gray-800 font-sans">
      {renderContent()}
    </div>
  );
};

export default RateConfigurationPage;
