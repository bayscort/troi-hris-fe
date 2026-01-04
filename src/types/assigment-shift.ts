export interface EmployeeRow {
  employeeId: string;
  name: string;
  nik: string;
  jobPositionName: string; 
  currentPatternName?: string; 
}

export interface BulkAssignRequest {
  employeeIds: string[];
  shiftPatternId: string;
  effectiveDate: string; 
}