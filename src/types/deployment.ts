export type EmploymentType = 'PKWT' | 'PKWTT' | 'FREELANCE';

export interface DeployEmployeeRequest {
  employeeId: string;
  clientId: string;
  clientSiteId?: string | null; // Optional
  jobPositionId: string;
  jobTitle: string;
  employeeIdAtClient?: string;
  employmentType: EmploymentType;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  basicSalary: number;
  username: string;
  password: string;
  roleId: string;
}

export interface RoleDTO {
  id: string;
  name: string;
}