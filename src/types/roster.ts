export interface RosterCell {
  scheduleId: string;
  shiftName: string;
  shiftCode: string;
  color: string;
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  isOff: boolean;
  isCrossDay: boolean;
  status: 'PRESENT' | 'LATE' | 'FUTURE' | 'PAST'; 
}

export interface EmployeeRosterRow {
  employeeId: string;
  name: string;
  nik: string;
  jobPosition: string;
  schedules: Record<string, RosterCell>; 
}

export interface RosterResponse {
  clientSiteId: string;
  startDate: string;
  endDate: string;
  rows: EmployeeRosterRow[];
}