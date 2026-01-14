export interface Employee {
id?: string;
  fullName: string;
  employeeNumber: string;
  identityNumber?: string;
  email?: string;
  phoneNumber?: string;

  placeOfBirth?: string;
  dateOfBirth?: string;

  province?: string;
  city?: string;
  district?: string;
  fullAddress?: string;

  gender?: 'MALE' | 'FEMALE';
  religion?: string;
  bloodType?: string;

  heightCm?: number;
  weightKg?: number;
  familyMemberCount?: number;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  active: boolean;

  jobReferences: JobReferenceForm[];
  educations: EducationForm[];
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

export interface EmployeeFormDto {
  id?: string;
  fullName: string;
  employeeNumber: string;
  identityNumber?: string;
  email?: string;
  phoneNumber?: string;

  placeOfBirth?: string;
  dateOfBirth?: string;

  province?: string;
  city?: string;
  district?: string;
  fullAddress?: string;

  gender?: 'MALE' | 'FEMALE';
  religion?: string;
  bloodType?: string;

  heightCm?: number;
  weightKg?: number;
  familyMemberCount?: number;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  active: boolean;

  jobReferences: JobReferenceForm[];
  educations: EducationForm[];
}

export interface JobReferenceForm {
  id?: string;
  jobReferenceId: string;
  name: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  experienceYears: number;
  certificationName?: string;
  certificationNumber?: string;
  certificationIssuedDate?: string;
  certificationExpiryDate?: string;
  certified: boolean;
  primaryReference: boolean;
}

export interface EducationForm {
  id?: string;
  schoolName: string;
  level: 'SD' | 'SMP' | 'SMA' | 'D3' | 'S1' | 'S2';
  major?: string;
  startYear: number;
  endYear?: number;
}

export type EmployeeCategory = 'ALL' | 'ACTIVE' | 'TALENT_POOL';

export interface EmployeeSearchParams {
  jobReferenceIds?: string[];
  educationMin?: string;
  educationMax?: string;
  category?: EmployeeCategory;
  page?: number;
  size?: number;
}
