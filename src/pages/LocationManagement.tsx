import React, { useState, useEffect } from 'react';
import { locationApi } from '../services/api';
import { Estate, Mill } from '../types/location';
import TabNavigation from '../components/location/TabNavigation';

import EstateForm from '../components/location/EstateForm';
import EstateList from '../components/location/EstateList';
import EstateDetail from '../components/location/EstateDetail';

import MillForm from '../components/location/MillForm';
import MillList from '../components/location/MillList';
import MillDetail from '../components/location/MillDetail';

import { ListPlus, X } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';


enum ViewMode {
  LIST,
  CREATE,
  EDIT,
  DETAIL
}

const LocationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'estate' | 'mill'>('estate');

  const [estates, setEstates] = useState<Estate[]>([]);
  const [selectedEstate, setSelectedEstate] = useState<Estate | null>(null);
  const [estateViewMode, setEstateViewMode] = useState<ViewMode>(ViewMode.LIST);

  const [mills, setMills] = useState<Mill[]>([]);
  const [selectedMill, setSelectedMill] = useState<Mill | null>(null);
  const [millViewMode, setMillViewMode] = useState<ViewMode>(ViewMode.LIST);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: 'estate' | 'mill' } | null>(null);


  const { authState } = useAuth();

  const hasPermission = (menuName: string, permission: string): boolean => {
    const menu = authState?.menus.find(m => m.name === menuName);
    return menu ? menu.permissions.includes(permission) : false;
  };

  const hasEstatePermission = (perm: string) => hasPermission('location', perm);
  const hasMillPermission = (perm: string) => hasPermission('location', perm);

  useEffect(() => {
    if (activeTab === 'estate') {
      fetchEstates();
    } else {
      fetchMills();
    }
  }, [activeTab]);

  const fetchEstates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await locationApi.getAllEstates();
      setEstates(data);
    } catch (error) {
      console.error('Failed to fetch estates:', error);
      setError('Failed to load estates. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEstate = async (estate: Estate) => {
    setIsLoading(true);
    setError(null);

    try {
      await locationApi.createEstate(estate);
      await fetchEstates();
      setEstateViewMode(ViewMode.LIST);
    } catch (error) {
      console.error('Failed to create estate:', error);
      setError('Failed to create estate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEstate = async (estate: Estate) => {
    if (!estate.id) {
      setError('Cannot update estate without ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await locationApi.updateEstate(estate.id, estate);
      await fetchEstates();
      setEstateViewMode(ViewMode.LIST);
    } catch (error) {
      console.error('Failed to update estate:', error);
      setError('Failed to update estate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEstate = async (id: number) => {
    try {
      await locationApi.deleteEstate(id);
      await fetchEstates();
    } catch (error) {
      console.error('Failed to delete estate:', error);
      setError('Failed to delete estate. Please try again.');
    }
  };

  const handleRequestEstateDelete = (id: number) => {
    const estateToDelete = estates.find(e => e.id === id);
    if (estateToDelete) {
      setItemToDelete({ id, name: estateToDelete.name, type: 'estate' });
      setIsDeleteModalOpen(true);
    }
  };

  const handleViewEstate = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const estate = await locationApi.getEstateById(id);
      setSelectedEstate(estate);
      setEstateViewMode(ViewMode.DETAIL);
    } catch (error) {
      console.error('Failed to fetch estate details:', error);
      setError('Failed to load estate details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEstate = (estate: Estate) => {
    setSelectedEstate(estate);
    setEstateViewMode(ViewMode.EDIT);
  };

  const fetchMills = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await locationApi.getAllMills();
      setMills(data);
    } catch (error) {
      console.error('Failed to fetch mills:', error);
      setError('Failed to load mills. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMill = async (mill: Mill) => {
    setIsLoading(true);
    setError(null);

    try {
      await locationApi.createMill(mill);
      await fetchMills();
      setMillViewMode(ViewMode.LIST);
    } catch (error) {
      console.error('Failed to create mill:', error);
      setError('Failed to create mill. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMill = async (mill: Mill) => {
    if (!mill.id) {
      setError('Cannot update mill without ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await locationApi.updateMill(mill.id, mill);
      await fetchMills();
      setMillViewMode(ViewMode.LIST);
    } catch (error) {
      console.error('Failed to update mill:', error);
      setError('Failed to update mill. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMill = async (id: number) => {
    try {
      await locationApi.deleteMill(id);
      await fetchMills();
    } catch (error) {
      console.error('Failed to delete mill:', error);
      setError('Failed to delete mill. Please try again.');
    }
  };

  const handleRequestMillDelete = (id: number) => {
    const millToDelete = mills.find(m => m.id === id);
    if (millToDelete) {
      setItemToDelete({ id, name: millToDelete.name, type: 'mill' });
      setIsDeleteModalOpen(true);
    }
  };

  const handleViewMill = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const mill = await locationApi.getMillById(id);
      setSelectedMill(mill);
      setMillViewMode(ViewMode.DETAIL);
    } catch (error) {
      console.error('Failed to fetch mill details:', error);
      setError('Failed to load mill details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMill = (mill: Mill) => {
    setSelectedMill(mill);
    setMillViewMode(ViewMode.EDIT);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);
    setError(null);

    if (itemToDelete.type === 'estate') {
      await handleDeleteEstate(itemToDelete.id);
    } else {
      await handleDeleteMill(itemToDelete.id);
    }

    setIsLoading(false);
    handleCloseDeleteModal();
  };

  const renderEstateContent = () => {
    switch (estateViewMode) {
      case ViewMode.CREATE:
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create New Estate</h2>
              <button
                onClick={() => setEstateViewMode(ViewMode.LIST)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <EstateForm
              onSubmit={handleCreateEstate}
              isLoading={isLoading}
            />
          </div>
        );

      case ViewMode.EDIT:
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Estate</h2>
              <button
                onClick={() => setEstateViewMode(ViewMode.LIST)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            {selectedEstate && (
              <EstateForm
                initialData={selectedEstate}
                onSubmit={handleUpdateEstate}
                isLoading={isLoading}
              />
            )}
          </div>
        );

      case ViewMode.DETAIL:
        return (
          <div className="mb-6">
            {selectedEstate && (
              <EstateDetail
                estate={selectedEstate}
                onBack={() => setEstateViewMode(ViewMode.LIST)}
                onEdit={handleEditEstate}
                isLoading={isLoading}
              />
            )}
          </div>
        );

      case ViewMode.LIST:
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Origin Management</h2>
              {hasEstatePermission('CREATE') && (
                <button
                  onClick={() => setEstateViewMode(ViewMode.CREATE)}
                  className="flex items-center px-4 py-2 bg-[#ff6908] text-white rounded-md hover:bg-[#e55e07]"
                >
                  <ListPlus size={18} className="mr-2" />
                  Add New Origin
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <EstateList
              estates={estates}
              onEdit={handleEditEstate}
              onDelete={handleRequestEstateDelete}
              onView={handleViewEstate}
              isLoading={isLoading}
              hasPermission={hasEstatePermission}

            />
          </>
        );
    }
  };

  const renderMillContent = () => {
    switch (millViewMode) {
      case ViewMode.CREATE:
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create New Destination</h2>
              <button
                onClick={() => setMillViewMode(ViewMode.LIST)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <MillForm
              onSubmit={handleCreateMill}
              isLoading={isLoading}
            />
          </div>
        );

      case ViewMode.EDIT:
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Destination</h2>
              <button
                onClick={() => setMillViewMode(ViewMode.LIST)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            {selectedMill && (
              <MillForm
                initialData={selectedMill}
                onSubmit={handleUpdateMill}
                isLoading={isLoading}
              />
            )}
          </div>
        );

      case ViewMode.DETAIL:
        return (
          <div className="mb-6">
            {selectedMill && (
              <MillDetail
                mill={selectedMill}
                onBack={() => setMillViewMode(ViewMode.LIST)}
                onEdit={handleEditMill}
                isLoading={isLoading}
              />
            )}
          </div>
        );

      case ViewMode.LIST:
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Destination Management</h2>
              {hasMillPermission('CREATE') && (

                <button
                  onClick={() => setMillViewMode(ViewMode.CREATE)}
                  className="flex items-center px-4 py-2 bg-[#ff6908] text-white rounded-md hover:bg-[#e55e07]"
                >
                  <ListPlus size={18} className="mr-2" />
                  Add New Destination
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <MillList
              mills={mills}
              onEdit={handleEditMill}
              onDelete={handleRequestMillDelete}
              onView={handleViewMill}
              isLoading={isLoading}
              hasPermission={hasMillPermission}

            />
          </>
        );
    }
  };

  return (
    <div className="w-full bg-gray-50 p-8">
      <TabNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setError(null);
          if (tab === 'estate') {
            setEstateViewMode(ViewMode.LIST);
          } else {
            setMillViewMode(ViewMode.LIST);
          }
        }}
      />

      {activeTab === 'estate' ? renderEstateContent() : renderMillContent()}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ''}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LocationManagement;
