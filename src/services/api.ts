import api from './axios';
import qs from 'qs';
import { Estate, Mill, MillSummary, AfdelingSummary, RateConfigurationCreateDto, RateConfiguration } from '../types/location';
import { Contractor, ContractorSummary, ContractorCreate } from '../types/contractor';
import { Driver, DriverSummary } from '../types/driver';
import { Role } from '../types/role';
import { Vehicle, VehicleCreate, VehicleSummary } from '../types/vehicle';
import { User, UserCreate } from '../types/user';
import { Trip, TripCreateDto } from '../types/trip';
import { FinanceItem } from '../types/finance-item';
import { FundRequest, FundRequestCreate, ApprovalLogPayload } from '../types/fund-request';
import { Account, AccountResp } from '../types/account';
import { format } from 'date-fns';
import { ReceiptReqDTO } from '../types/receipt';
import { ExpenditureReqDTO } from '../types/expenditure';
import { ManualReconciliationPayload } from '../types/reconciliation';
import { TripType, TripTypeSummary } from '../types/trip-type';
import { Client } from '../types/client';
import { Employee, EmployeeFormDto, EmployeeSearchParams, OnboardEmployeeRequest } from '../types/employee';
import { JobReference } from '../types/job-reference';
import { CreateShiftMasterRequest, ShiftMasterDTO } from '../types/shift-master';
import { BulkPatternItemsRequest, CreatePatternRequest, ShiftPattern } from '../types/shift-pattern';
import { ClientSite } from '../types/client-site';
import { JobPosition } from '../types/job-position';
import { BulkAssignRequest } from '../types/assigment-shift';
import { RosterResponse } from '../types/roster';

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface ApiResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  number: number;
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

interface TripFilterParams {
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

export const locationApi = {
  getAllEstates: async (): Promise<Estate[]> => {
    try {
      const response = await api.get('/estates');
      return response.data;
    } catch (error) {
      console.error('Error fetching estates:', error);
      throw error;
    }
  },

  getEstateById: async (id: number): Promise<Estate> => {
    try {
      const response = await api.get(`/estates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching estate with id ${id}:`, error);
      throw error;
    }
  },

  createEstate: async (estate: Estate): Promise<Estate> => {
    try {
      const response = await api.post('/estates', estate);
      return response.data;
    } catch (error) {
      console.error('Error creating estate:', error);
      throw error;
    }
  },

  updateEstate: async (id: number, estate: Estate): Promise<Estate> => {
    try {
      const response = await api.put(`/estates/${id}`, estate);
      return response.data;
    } catch (error) {
      console.error(`Error updating estate with id ${id}:`, error);
      throw error;
    }
  },

  deleteEstate: async (id: number): Promise<void> => {
    try {
      await api.delete(`/estates/${id}`);
    } catch (error) {
      console.error(`Error deleting estate with id ${id}:`, error);
      throw error;
    }
  },

  getAllMills: async (): Promise<Mill[]> => {
    try {
      const response = await api.get('/mills');
      return response.data;
    } catch (error) {
      console.error('Error fetching mills:', error);
      throw error;
    }
  },

  getMillById: async (id: number): Promise<Mill> => {
    try {
      const response = await api.get(`/mills/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching mill with id ${id}:`, error);
      throw error;
    }
  },

  createMill: async (mill: Mill): Promise<Mill> => {
    try {
      const response = await api.post('/mills', mill);
      return response.data;
    } catch (error) {
      console.error('Error creating mill:', error);
      throw error;
    }
  },

  updateMill: async (id: number, mill: Mill): Promise<Mill> => {
    try {
      const response = await api.put(`/mills/${id}`, mill);
      return response.data;
    } catch (error) {
      console.error(`Error updating mill with id ${id}:`, error);
      throw error;
    }
  },

  deleteMill: async (id: number): Promise<void> => {
    try {
      await api.delete(`/mills/${id}`);
    } catch (error) {
      console.error(`Error deleting mill with id ${id}:`, error);
      throw error;
    }
  },

  getActiveRateConfigurations: async (): Promise<RateConfiguration[]> => {
    try {
      const response = await api.get('/rate-configurations/actives');
      return response.data;
    } catch (error) {
      console.error('Error fetching active rate configurations:', error);
      throw error;
    }
  },

  createRateConfiguration: async (rateConfig: RateConfigurationCreateDto): Promise<RateConfiguration> => {
    try {
      const response = await api.post('/rate-configurations', rateConfig);
      return response.data;
    } catch (error) {
      console.error('Error creating rate configuration:', error);
      throw error;
    }
  }
};

export const driverService = {
  getAllDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await api.get('/drivers');
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },

  getDriverById: async (id: number): Promise<Driver> => {
    try {
      const response = await api.get(`/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching driver with id ${id}:`, error);
      throw error;
    }
  },

  createDriver: async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
    try {
      const response = await api.post('/drivers', driver);
      return response.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  },

  updateDriver: async (id: number, driver: Driver): Promise<Driver> => {
    try {
      const response = await api.put(`/drivers/${id}`, driver);
      return response.data;
    } catch (error) {
      console.error(`Error updating driver with id ${id}:`, error);
      throw error;
    }
  },

  deleteDriver: async (id: number): Promise<void> => {
    try {
      await api.delete(`/drivers/${id}`);
    } catch (error) {
      console.error(`Error deleting driver with id ${id}:`, error);
      throw error;
    }
  }
};

export const clientService = {
  getAllClients: async (): Promise<Client[]> => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  getClientById: async (id: string): Promise<Client> => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching clients with id ${id}:`, error);
      throw error;
    }
  },

  createClient: async (driver: Omit<Client, 'id'>): Promise<Client> => {
    try {
      const response = await api.post('/clients', driver);
      return response.data;
    } catch (error) {
      console.error('Error creating clients:', error);
      throw error;
    }
  },

  updateClient: async (id: string, client: Client): Promise<Client> => {
    try {
      const response = await api.put(`/clients/${id}`, client);
      return response.data;
    } catch (error) {
      console.error(`Error updating client with id ${id}:`, error);
      throw error;
    }
  },

  deleteClient: async (id: string): Promise<void> => {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      console.error(`Error deleting clients with id ${id}:`, error);
      throw error;
    }
  }
};

export const clientSiteService = {
  getClientSiteByClientId: async (clientId: string): Promise<ClientSite[]> => {
    try {
      const response = await api.get(`/client-sites/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client sites with clientId ${clientId}:`, error);
      throw error;
    }
  },
};

export const jobPositionService = {
  getJobPositionByClientId: async (clientId: string): Promise<JobPosition[]> => {
    try {
      const response = await api.get(`/job-positions/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job positions with clientId ${clientId}:`, error);
      throw error;
    }
  },
};

export const assignmentShiftService = {
  bulkAssign: async (req: Omit<BulkAssignRequest, 'id'>): Promise<string> => {
    try {
      const response = await api.post('/shifts/bulk-assign-pattern', req);
      return response.data;
    } catch (error) {
      console.error('Error assigning shift pattern:', error);
      throw error;
    }
  },
};

export const shiftMasterService = {
  getAllShiftMasters: async (): Promise<ShiftMasterDTO[]> => {
    try {
      const response = await api.get('/shift-masters');
      return response.data;
    } catch (error) {
      console.error('Error fetching shift masters:', error);
      throw error;
    }
  },

  getShiftMasterById: async (id: string): Promise<ShiftMasterDTO> => {
    try {
      const response = await api.get(`/shift-masters/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shift masters with id ${id}:`, error);
      throw error;
    }
  },

  getByClient: async (clientId: string): Promise<ShiftMasterDTO[]> => {
    const response = await api.get<ShiftMasterDTO[]>('/shift-masters', {
      params: { clientId },
    });
    return response.data;
  },

  createShiftMaster: async (shiftMaster: Omit<CreateShiftMasterRequest, 'id'>): Promise<string> => {
    try {
      const response = await api.post('/shift-masters', shiftMaster);
      return response.data;
    } catch (error) {
      console.error('Error creating shift masters:', error);
      throw error;
    }
  },

  updateShiftMaster: async (id: string, shiftMaster: CreateShiftMasterRequest): Promise<string> => {
    try {
      const response = await api.put(`/shift-masters/${id}`, shiftMaster);
      return response.data;
    } catch (error) {
      console.error(`Error updating shift master with id ${id}:`, error);
      throw error;
    }
  },

  deleteShiftMaster: async (id: string): Promise<void> => {
    try {
      await api.delete(`/shift-masters/${id}`);
    } catch (error) {
      console.error(`Error deleting shift masters with id ${id}:`, error);
      throw error;
    }
  }
};

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  getRoleById: async (id: number): Promise<Role> => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role with id ${id}:`, error);
      throw error;
    }
  },

  createRole: async (role: Omit<Role, 'id'>): Promise<Role> => {
    try {
      const response = await api.post('/roles', role);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  updateRole: async (id: number, role: Role): Promise<Role> => {
    try {
      const response = await api.put(`/roles/${id}`, role);
      return response.data;
    } catch (error) {
      console.error(`Error updating role with id ${id}:`, error);
      throw error;
    }
  },

  deleteRole: async (id: number): Promise<void> => {
    try {
      await api.delete(`/roles/${id}`);
    } catch (error) {
      console.error(`Error deleting role with id ${id}:`, error);
      throw error;
    }
  }
};

export const contractorService = {
  getAllContractors: async (): Promise<Contractor[]> => {
    try {
      const response = await api.get('/contractors');
      return response.data;
    } catch (error) {
      console.error('Error fetching contractors:', error);
      throw error;
    }
  },

  getContractorById: async (id: number): Promise<Contractor> => {
    try {
      const response = await api.get(`/contractors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contractor with id ${id}:`, error);
      throw error;
    }
  },

  createContractor: async (contractor: Omit<ContractorCreate, 'id'>): Promise<ContractorCreate> => {
    try {
      const response = await api.post('/contractors', contractor);
      return response.data;
    } catch (error) {
      console.error('Error creating contractor:', error);
      throw error;
    }
  },

  updateContractor: async (id: number, contractor: ContractorCreate): Promise<Contractor> => {
    try {
      const response = await api.put(`/contractors/${id}`, contractor);
      return response.data;
    } catch (error) {
      console.error(`Error updating contractor with id ${id}:`, error);
      throw error;
    }
  },

  deleteContractor: async (id: number): Promise<void> => {
    try {
      await api.delete(`/contractors/${id}`);
    } catch (error) {
      console.error(`Error deleting contractor with id ${id}:`, error);
      throw error;
    }
  }
};

export const vehicleService = {
  getAllVehicles: async (): Promise<Vehicle[]> => {
    try {
      const response = await api.get('/vehicles');
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  getVehicleById: async (id: number): Promise<Vehicle> => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vehicle with id ${id}:`, error);
      throw error;
    }
  },

  createVehicle: async (vehicle: Omit<VehicleCreate, 'id'>): Promise<Vehicle> => {
    try {
      const response = await api.post('/vehicles', vehicle);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  updateVehicle: async (id: number, vehicle: VehicleCreate): Promise<Vehicle> => {
    try {
      const response = await api.put(`/vehicles/${id}`, vehicle);
      return response.data;
    } catch (error) {
      console.error(`Error updating vehicle with id ${id}:`, error);
      throw error;
    }
  },

  deleteVehicle: async (id: number): Promise<void> => {
    try {
      await api.delete(`/vehicles/${id}`);
    } catch (error) {
      console.error(`Error deleting vehicle with id ${id}:`, error);
      throw error;
    }
  }
};

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },

  createUser: async (user: Omit<UserCreate, 'id'>): Promise<User> => {
    try {
      const response = await api.post('/users', user);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id: number, user: UserCreate): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, user);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  }
};

export const tripService = {
  getAllTrips: async (
    pagination: PaginationParams = { page: 0, size: 10, sort: 'date,desc' },
    filters: TripFilterParams = {} 
  ): Promise<ApiResponse<Trip>> => {
    try {
      const params: any = {
        ...pagination,
      };

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.millIds?.length) params.millIds = filters.millIds;
      if (filters.afdelingIds?.length) params.afdelingIds = filters.afdelingIds;
      if (filters.driverIds?.length) params.driverIds = filters.driverIds;
      if (filters.vehicleIds?.length) params.vehicleIds = filters.vehicleIds;
      if (filters.contractorIds?.length) params.contractorIds = filters.contractorIds;
      if (filters.tripTypeIds?.length) params.tripTypeIds = filters.tripTypeIds;
      if (filters.loadWeightMin != null) params.loadWeightMin = filters.loadWeightMin;
      if (filters.loadWeightMax != null) params.loadWeightMax = filters.loadWeightMax;

      if (filters.millNull) params.millNull = true;
      if (filters.afdelingNull) params.afdelingNull = true;
      if (filters.driverNull) params.driverNull = true;
      if (filters.vehicleNull) params.vehicleNull = true;
      if (filters.contractorNull) params.contractorNull = true;
      if (filters.tripTypeNull) params.tripTypeNull = true;

      const response = await api.get('/trips/find-all', {
        params,
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: 'repeat' });
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },

  exportTrips: async (filters: any = {}): Promise<Blob> => {
    try {
      const params = { ...filters };
      const response = await api.get('/trips/export', {
        params,
        responseType: 'blob',
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: 'repeat' });
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error exporting trips:', error);
      throw error;
    }
  },

  getTripById: async (id: number): Promise<Trip> => {
    try {
      const response = await api.get(`/trips/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching trip with id ${id}:`, error);
      throw error;
    }
  },

  createTrip: async (tripData: TripCreateDto): Promise<Trip> => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  },

  updateTrip: async (id: number, tripData: TripCreateDto): Promise<Trip> => {
    try {
      const response = await api.put(`/trips/${id}`, tripData);
      return response.data;
    } catch (error) {
      console.error(`Error updating trip with id ${id}:`, error);
      throw error;
    }
  },

  deleteTrip: async (id: number): Promise<void> => {
    try {
      await api.delete(`/trips/${id}`);
    } catch (error) {
      console.error(`Error deleting trip with id ${id}:`, error);
      throw error;
    }
  }
};


export const locationService = {
  getAllEstates: async (): Promise<Estate[]> => {
    try {
      const response = await api.get('/estates');
      return response.data;
    } catch (error) {
      console.error('Error fetching estates:', error);
      throw error;
    }
  },

  getEstateById: async (id: number): Promise<Estate> => {
    try {
      const response = await api.get(`/estates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching estate with id ${id}:`, error);
      throw error;
    }
  },

  createEstate: async (estate: Omit<Estate, 'id'>): Promise<Estate> => {
    try {
      const response = await api.post('/estates', estate);
      return response.data;
    } catch (error) {
      console.error('Error creating estate:', error);
      throw error;
    }
  },

  updateEstate: async (id: number, estate: Partial<Estate>): Promise<Estate> => {
    try {
      const response = await api.put(`/estates/${id}`, estate);
      return response.data;
    } catch (error) {
      console.error(`Error updating estate with id ${id}:`, error);
      throw error;
    }
  },

  deleteEstate: async (id: number): Promise<void> => {
    try {
      await api.delete(`/estates/${id}`);
    } catch (error) {
      console.error(`Error deleting estate with id ${id}:`, error);
      throw error;
    }
  },

  getAllMills: async (): Promise<Mill[]> => {
    try {
      const response = await api.get('/mills');
      return response.data;
    } catch (error) {
      console.error('Error fetching mills:', error);
      throw error;
    }
  },

  getMillById: async (id: number): Promise<Mill> => {
    try {
      const response = await api.get(`/mills/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching mill with id ${id}:`, error);
      throw error;
    }
  },

  createMill: async (mill: Omit<Mill, 'id'>): Promise<Mill> => {
    try {
      const response = await api.post('/mills', mill);
      return response.data;
    } catch (error) {
      console.error('Error creating mill:', error);
      throw error;
    }
  },

  updateMill: async (id: number, mill: Partial<Mill>): Promise<Mill> => {
    try {
      const response = await api.put(`/mills/${id}`, mill);
      return response.data;
    } catch (error) {
      console.error(`Error updating mill with id ${id}:`, error);
      throw error;
    }
  },

  deleteMill: async (id: number): Promise<void> => {
    try {
      await api.delete(`/mills/${id}`);
    } catch (error) {
      console.error(`Error deleting mill with id ${id}:`, error);
      throw error;
    }
  },
};

export const rateConfigurationService = {
  getActiveRateConfigurations: async (): Promise<RateConfiguration[]> => {
    try {
      const response = await api.get('/rate-configurations/actives');
      return response.data;
    } catch (error) {
      console.error('Error fetching active rate configurations:', error);
      throw error;
    }
  },

  getActiveRateConfiguration: async (millId: number, afdelingId: number): Promise<RateConfiguration> => {
    try {
      const response = await api.get('/rate-configurations/active', {
        params: { afdelingId, millId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active rate configuration:', error);
      throw error;
    }
  },

  createRateConfiguration: async (rateConfig: RateConfigurationCreateDto): Promise<RateConfiguration> => {
    try {
      const response = await api.post('/rate-configurations', rateConfig);
      return response.data;
    } catch (error) {
      console.error('Error creating rate configuration:', error);
      throw error;
    }
  },

  getRateConfigurationById: async (id: number): Promise<RateConfiguration> => {
    try {
      const response = await api.get(`/rate-configurations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rate configuration with id ${id}:`, error);
      throw error;
    }
  },

  updateRateConfiguration: async (id: number, rateConfig: Partial<RateConfigurationCreateDto>): Promise<RateConfiguration> => {
    try {
      const response = await api.put(`/rate-configurations/${id}`, rateConfig);
      return response.data;
    } catch (error) {
      console.error(`Error updating rate configuration with id ${id}:`, error);
      throw error;
    }
  }
};

export const referenceService = {
  getActiveRateConfiguration: async (millId: number, afdelingId: number): Promise<any> => {
    try {
      const response = await api.get('/rate-configurations/active', {
        params: { afdelingId, millId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active rate configuration:', error);
      throw error;
    }
  },

  getAllEstates: async (): Promise<Estate[]> => {
    return locationService.getAllEstates();
  },

  getEstateById: async (id: number): Promise<Estate> => {
    try {
      const response = await api.get(`/estates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching estate with id ${id}:`, error);
      throw error;
    }
  },

  getAllMills: async (): Promise<Mill[]> => {
    return locationService.getAllMills();
  },

  getAllDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await api.get('/drivers');
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },

  getAllVehicles: async (): Promise<Vehicle[]> => {
    try {
      const response = await api.get('/vehicles');
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  getAllContractors: async (): Promise<Contractor[]> => {
    try {
      const response = await api.get('/contractors');
      return response.data;
    } catch (error) {
      console.error('Error fetching contractors:', error);
      throw error;
    }
  },

  getAllTripTypes: async (): Promise<TripType[]> => {
    try {
      const response = await api.get('/tripTypes');
      return response.data;
    } catch (error) {
      console.error('Error fetching trip types:', error);
      throw error;
    }
  }
};

export const fetchDashboardData = async (startDate: String | undefined, endDate: String | undefined) => {
  try {
    const response = await api.get('/dashboard/get-summary', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};

export const fetchFinanceDashboardData = async (accountId: number | null, startDate: String | undefined, endDate: String | undefined) => {
  try {
    const response = await api.get('/dashboard/get-summary-finance', {
      params: { accountId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};

export interface ProfitLossPerDay {
  date: string;
  totalProfitLoss: number;
}

export const fetchProfitLossPerDay = async (
  startDate: string | undefined,
  endDate: string | undefined
): Promise<ProfitLossPerDay[]> => {
  try {
    const response = await api.get<ProfitLossPerDay[]>('/dashboard/total-profit-loss-per-day', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profit loss per day:', error);
    throw error;
  }
};

export const fetchFinanceProfitLossPerDay = async (
  accountId: number | null,
  startDate: string | undefined,
  endDate: string | undefined
): Promise<ProfitLossPerDay[]> => {
  try {
    const response = await api.get<ProfitLossPerDay[]>('/dashboard/total-finance-profit-loss-per-day', {
      params: { accountId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profit loss per day:', error);
    throw error;
  }
};

export const fetchHeatmapData = async (year: number) => {
  try {
    const response = await api.get('/dashboard/heat-map-per-year', {
      params: { year }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    throw error;
  }
};

export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await api.get('/vehicles');
    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getVehicleSummaries = async (
  startDate?: string,
  endDate?: string,
  vehicleIds?: number[]
): Promise<VehicleSummary[]> => {
  try {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (vehicleIds && vehicleIds.length > 0) {
      vehicleIds.forEach(id => params.append('vehicleIds', id.toString()));
    }

    const url = `/reports/summary-vehicle?${params.toString()}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getContractors = async (): Promise<Contractor[]> => {
  try {
    const response = await api.get('/contractors');
    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getContractorSummaries = async (
  startDate?: string,
  endDate?: string,
  contractorIds?: number[]
): Promise<ContractorSummary[]> => {
  try {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (contractorIds && contractorIds.length > 0) {
      contractorIds.forEach(id => params.append('contractorIds', id.toString()));
    }

    const url = `/reports/summary-contractor?${params.toString()}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getDrivers = async (): Promise<Driver[]> => {
  try {
    const response = await api.get('/drivers');
    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getDriverSummaries = async (
  startDate?: string,
  endDate?: string,
  driverIds?: number[]
): Promise<DriverSummary[]> => {
  try {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (driverIds && driverIds.length > 0) {
      driverIds.forEach(id => params.append('driverIds', id.toString()));
    }

    const url = `/reports/summary-driver?${params.toString()}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getMills = async (): Promise<Mill[]> => {
  try {
    const response = await api.get('/mills');
    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getMillSummaries = async (
  startDate?: string,
  endDate?: string,
  millIds?: number[]
): Promise<MillSummary[]> => {
  try {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (millIds && millIds.length > 0) {
      millIds.forEach(id => params.append('millIds', id.toString()));
    }

    const url = `/reports/summary-mill?${params.toString()}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getEstates = async (): Promise<Estate[]> => {
  try {
    const response = await api.get('/estates');
    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getAfdelingSummaries = async (
  startDate?: string,
  endDate?: string,
  afdelingIds?: number[]
): Promise<AfdelingSummary[]> => {
  try {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (afdelingIds && afdelingIds.length > 0) {
      afdelingIds.forEach(id => params.append('afdelingIds', id.toString()));
    }

    const url = `/reports/summary-afdeling?${params.toString()}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const fetchRolePermissions = async () => {
  const response = await api.get('/roles/menu-permission');
  return response.data;
};

export const fetchAllMenus = async () => {
  const response = await api.get('/menus');
  return response.data;
};

export const fetchAllPermissions = async () => {
  const response = await api.get('/permissions');
  return response.data;
};

export const updateRolePermissions = async (roleId: string, menuPermissions: any) => {
  const payload = {
    roleId,
    menuPermissions,
  };
  console.log('Updating role permissions:', payload);
  const response = await api.put(`/role-menu-permissions/${roleId}`, payload);
  return response.data;
};

export const financeItemService = {
  getAllFinanceItems: async (): Promise<FinanceItem[]> => {
    try {
      const response = await api.get('/finance-items');
      return response.data;
    } catch (error) {
      console.error('Error fetching finance items:', error);
      throw error;
    }
  },

  getFinanceItemById: async (id: number): Promise<FinanceItem> => {
    try {
      const response = await api.get(`/finance-items/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching finance items with id ${id}:`, error);
      throw error;
    }
  },

  createFinanceItem: async (fi: Omit<FinanceItem, 'id'>): Promise<FinanceItem> => {
    try {
      const response = await api.post('/finance-items', fi);
      return response.data;
    } catch (error) {
      console.error('Error creating finance items:', error);
      throw error;
    }
  },

  updateFinanceItem: async (id: number, fi: FinanceItem): Promise<FinanceItem> => {
    try {
      const response = await api.put(`/finance-items/${id}`, fi);
      return response.data;
    } catch (error) {
      console.error(`Error updating finance items with id ${id}:`, error);
      throw error;
    }
  },

  deleteFinanceItem: async (id: number): Promise<void> => {
    try {
      await api.delete(`/finance-items/${id}`);
    } catch (error) {
      console.error(`Error deleting finance items with id ${id}:`, error);
      throw error;
    }
  }
};

export const fundRequestService = {
  getAllFundRequests: async (): Promise<FundRequest[]> => {
    try {
      const response = await api.get('/fund-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching fund requests:', error);
      throw error;
    }
  },

  getFundRequestById: async (id: number): Promise<FundRequest> => {
    try {
      const response = await api.get(`/fund-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching fund requests with id ${id}:`, error);
      throw error;
    }
  },

  createFundRequest: async (fi: Omit<FundRequestCreate, 'id'>): Promise<FundRequest> => {
    try {
      const response = await api.post('/fund-requests', fi);
      return response.data;
    } catch (error) {
      console.error('Error creating fund requests:', error);
      throw error;
    }
  },

  updateFundRequest: async (id: number, fi: FundRequestCreate): Promise<FundRequest> => {
    try {
      const response = await api.put(`/fund-requests/${id}`, fi);
      return response.data;
    } catch (error) {
      console.error(`Error updating fund requests with id ${id}:`, error);
      throw error;
    }
  },

  getFundRequestsByRole: async (roleName: string): Promise<FundRequest[]> => {
    try {
      const response = await api.get('/fund-requests/get-by-approval-role', {
        params: { roleName },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching fund requests by role ${roleName}:`, error);
      throw error;
    }
  },

  createApprovalLog: async (payload: ApprovalLogPayload): Promise<void> => {
    try {
      await api.post('/fund-requests/approval-log', payload);
    } catch (error) {
      console.error('Error approving fund request:', error);
      throw error;
    }
  },


};

export const accountService = {
  getAllAccounts: async (): Promise<AccountResp[]> => {
    try {
      const response = await api.get('/accounts');
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },

  getAccountById: async (id: number): Promise<AccountResp> => {
    try {
      const response = await api.get(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching account with id ${id}:`, error);
      throw error;
    }
  },

  createAccount: async (driver: Omit<Account, 'id'>): Promise<AccountResp> => {
    try {
      const response = await api.post('/accounts', driver);
      return response.data;
    } catch (error) {
      console.error('Error account driver:', error);
      throw error;
    }
  },

  updateAccount: async (id: number, driver: Account): Promise<AccountResp> => {
    try {
      const response = await api.put(`/accounts/${id}`, driver);
      return response.data;
    } catch (error) {
      console.error(`Error updating account with id ${id}:`, error);
      throw error;
    }
  },

  deleteAccount: async (id: number): Promise<void> => {
    try {
      await api.delete(`/accounts/${id}`);
    } catch (error) {
      console.error(`Error deleting account with id ${id}:`, error);
      throw error;
    }
  },

  getLedger: async (accountId: number, startDate?: Date, endDate?: Date) => {
    try {
      const params: any = { accountId };
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.get('/accounts/ledger', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching ledger:', error);
      throw error;
    }
  },
};

export const receiptService = {

  createReceipts: async (receipts: Omit<ReceiptReqDTO, 'id'>[]): Promise<string> => {
    try {
      const response = await api.post('/receipts/bulk', receipts);
      return response.data;
    } catch (error) {
      console.error('Error create receipt:', error);
      throw error;
    }
  },

  updateReceipt: async (id: number, r: ReceiptReqDTO): Promise<number> => {
    try {
      const response = await api.put(`/receipts/${id}`, r);
      return response.data;
    } catch (error) {
      console.error(`Error updating receipt with id ${id}:`, error);
      throw error;
    }
  },

  deleteReceipt: async (id: number): Promise<void> => {
    try {
      await api.delete(`/receipts/${id}`);
    } catch (error) {
      console.error(`Error deleting receipts with id ${id}:`, error);
      throw error;
    }
  },


  getAllReceipts: async (accountId?: number, startDate?: Date, endDate?: Date) => {
    try {
      const params: any = { accountId };
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.get('/receipts/get-all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  },

  getAllGrouped: async (accountId?: number, startDate?: Date, endDate?: Date) => {
    try {
      const params: any = { accountId };
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.get('/receipts/get-all-grouped', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching receipts grouped:', error);
      throw error;
    }
  },
}

export const expenditureService = {

  createExpenditures: async (expenditures: Omit<ExpenditureReqDTO, 'id'>[]): Promise<string> => {
    try {
      const response = await api.post('/expenditures/bulk', expenditures);
      return response.data;
    } catch (error) {
      console.error('Error create expenditures:', error);
      throw error;
    }
  },

  updateExpenditure: async (id: number, r: ExpenditureReqDTO): Promise<number> => {
    try {
      const response = await api.put(`/expenditures/${id}`, r);
      return response.data;
    } catch (error) {
      console.error(`Error updating expenditure with id ${id}:`, error);
      throw error;
    }
  },

  deleteExpenditure: async (id: number): Promise<void> => {
    try {
      await api.delete(`/expenditures/${id}`);
    } catch (error) {
      console.error(`Error deleting expenditures with id ${id}:`, error);
      throw error;
    }
  },


  getAllExpenditures: async (accountId?: number, startDate?: Date, endDate?: Date) => {
    try {
      const params: any = { accountId };
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.get('/expenditures/get-all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenditures:', error);
      throw error;
    }
  },

  getAllGrouped: async (accountId?: number, startDate?: Date, endDate?: Date) => {
    try {
      const params: any = { accountId };
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.get('/expenditures/get-all-grouped', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenditures grouped:', error);
      throw error;
    }
  },
}

export const bankStatementService = {

  getAll: async (accountId: number, startDate?: Date, endDate?: Date) => {
    try {
      const params: any = { accountId };
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.get('/bank-statements', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching bank statements:', error);
      throw error;
    }
  },

  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/bank-statements/upload-csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }

};

export const reconciliationService = {

  getAll: async (accountId: number, startDate?: Date, endDate?: Date) => {
    try {
      const params: any = { accountId };
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.get('/reconciliations', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      throw error;
    }
  },

  manualReconcile: async (payload: ManualReconciliationPayload): Promise<any> => {
    try {
      const response = await api.post('/reconciliations/manual', payload);
      return response.data;
    } catch (error) {
      console.error('Error performing manual reconciliation:', error);
      throw error;
    }
  },

  autoReconcile: async (accountId: number, startDate?: Date, endDate?: Date) => {
    try {
      const params: any = { accountId };
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.get('/reconciliations/auto', { params });
      return response.data;
    } catch (error) {
      console.error('Error auto reconciliations:', error);
      throw error;
    }
  },

  unreconcile: async (id: number): Promise<void> => {
    try {
      await api.delete(`/reconciliations/${id}`);
    } catch (error) {
      console.error(`Error unreconcile with id ${id}:`, error);
      throw error;
    }
  },

};

export const fetchFinanceReport = async (type: String, accountId: number | null, startDate: String | undefined, endDate: String | undefined) => {
  try {
    const response = await api.get('/reports/summary-finance', {
      params: { type, accountId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch finance report data:', error);
    throw error;
  }
};

export const getTripTypes = async (): Promise<TripType[]> => {
  try {
    const response = await api.get('/tripTypes');
    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

export const getTripTypeSummaries = async (
  startDate?: string,
  endDate?: string,
  tripTypeIds?: number[]
): Promise<TripTypeSummary[]> => {
  try {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (tripTypeIds && tripTypeIds.length > 0) {
      tripTypeIds.forEach(id => params.append('tripTypeIds', id.toString()));
    }

    const url = `/reports/summary-trip-types?${params.toString()}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error(`API error: ${error}`);
    throw error;
  }
};

// Struktur JSON standar dari Spring Data "Page"
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page (0-indexed)
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const employeeService = {

  getEmployees: async (status: string) => {
    const response = await api.get(`/employees/list?status=${status}`);
    return response.data;
  },
  deleteEmployee: async (id: string) => {
    return await api.delete(`/employees/${id}`);
  },

  offboardEmployee: async (id: string, data: any) => {
    return await api.post(`/employees/${id}/offboard`, data);
  },
  onboardEmployee: async (data: OnboardEmployeeRequest) => {
    return await api.post('/employees/onboard', data);
  },
  create(payload: EmployeeFormDto): Promise<string> {
    const { id, ...request } = payload;

    return api
      .post<string>('/employees', request)
      .then(res => res.data);
  },

  update(id: string, payload: EmployeeFormDto): Promise<void> {
    return api
      .put<void>(`/employees/${id}`, payload)
      .then(res => res.data);
  },

  search(params: EmployeeSearchParams) {
    return api
      .get<PageResponse<Employee>>('/employees/search', { params })
      .then(res => res.data);
  },

  getById(id: string) {
    return api
      .get<Employee>(`/employees/${id}`)
      .then(res => res.data);
  },

  delete(id: string) {
    return api.delete(`/api/employees/${id}`);
  },

  getActiveBySite: async (siteId: string, jobPositionId?: string) => {
        const params = { siteId, jobPositionId };
        const response = await api.get('/placements/active-employees', { params });
        return response.data;
    }
};

export const jobReferenceService = {
  getAll(): Promise<JobReference[]> {
    return api
      .get<JobReference[]>('/job-references')
      .then(res => res.data);
  },
};

export const shiftPatternService = {
  getByClient: async (clientId: string): Promise<ShiftPattern[]> => {
    const response = await api.get<ShiftPattern[]>('/shift-pattern', {
      params: { clientId },
    });
    return response.data;
  },

  create: async (req: CreatePatternRequest): Promise<string> => {
    const response = await api.post<string>('/shift-pattern', req);
    return response.data;
  },

  addItems: async (req: BulkPatternItemsRequest): Promise<void> => {
    await api.post('/shift-pattern/items', req);
  },
};

export const rosterService = {
  getMatrix: async (
    siteId: string, 
    startDate: string, 
    endDate: string,
    jobPositionId?: string
  ): Promise<RosterResponse> => {
    const params = { siteId, startDate, endDate, jobPositionId };
    const response = await api.get<RosterResponse>('/roster/matrix', { params });
    return response.data;
  }
};


