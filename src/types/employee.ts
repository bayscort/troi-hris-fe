export interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  identityNumber?: string;
  
  currentClient?: string;
  jobTitle?: string;
  status: 'BENCH' | 'DEPLOYED' | 'INTERNAL' | 'INACTIVE';
  joinDate?: string;
}

export interface EmployeeResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface OnboardEmployeeRequest {
  fullName: string;
  employeeNumber: string; // NIP
  identityNumber: string; // KTP
  email: string;
  phoneNumber: string;
  address?: string;  
  username: string;
  password: string;
  roleId: string;
}