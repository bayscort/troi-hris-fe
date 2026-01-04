export interface ShiftPatternItem {
  daySequence: number;
  shiftMasterId: string;
  shiftName: string;
  shiftCode: string;
  shiftColor?: string;
  startTime: string;
  endTime: string;
}

export interface ShiftPattern {
  id: string;
  name: string;
  cycleDays: number;
  clientId: string;
  items: ShiftPatternItem[];
}

export interface CreatePatternRequest {
  clientId: string;
  name: string;
  cycleDays: number;
}

export interface BulkPatternItemsRequest {
  patternId: string;
  items: { daySequence: number; shiftMasterId: string }[];
}