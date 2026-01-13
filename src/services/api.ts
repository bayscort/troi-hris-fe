import api from './axios';
import { Role } from '../types/role';
import { User, UserCreate } from '../types/user';
import { Employee, EmployeeFormDto, EmployeeSearchParams, OnboardEmployeeRequest } from '../types/employee';
import { JobReference } from '../types/job-reference';
import { CreateShiftMasterRequest, ShiftMasterDTO } from '../types/shift-master';
import { BulkPatternItemsRequest, CreatePatternRequest, ShiftPattern } from '../types/shift-pattern';
import { ClientSite } from '../types/client-site';
import { JobPosition } from '../types/job-position';
import { BulkAssignRequest } from '../types/assigment-shift';
import { RosterResponse } from '../types/roster';
import { DeployEmployeeRequest } from '../types/deployment';
import { Client } from '../types/client';
import { AttendanceResponse } from '../types/attendance';

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
    const response = await api.get(`/client-sites/client/${clientId}`);
    return response.data;
  },

  createClientSite: async (
    payload: Omit<ClientSite, 'id'>
  ): Promise<ClientSite> => {
    const response = await api.post('/client-sites', payload);
    return response.data;
  },

  updateClientSite: async (
    id: string,
    payload: Omit<ClientSite, 'id'>
  ): Promise<ClientSite> => {
    const response = await api.put(`/client-sites/${id}`, payload);
    return response.data;
  },

  deleteClientSite: async (id: string): Promise<void> => {
    await api.delete(`/client-sites/${id}`);
  }
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

export const attendanceService = {
  getAttendanceListAll: async (start: string, end: string): Promise<AttendanceResponse[]> => {
    try {
      const response = await api.get('/attendance/list/all', {
        params: { start, end }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance list:', error);
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

  uploadManualSchedule: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/shifts/upload-manual', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading manual schedule:', error);
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


export const deploymentService = {
  deploy: async (request: DeployEmployeeRequest) => {
    // POST /api/v1/deploy
    const response = await api.post('/placements/deploy', request);
    return response.data;
  }
};


