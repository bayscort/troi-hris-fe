import { Client } from "./client";

export interface ShiftMasterDTO {
  id: string;
  client: Client;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  isCrossDay: boolean;
  isDayOff: boolean;
  lateToleranceMinutes: number;
  clockInWindowMinutes: number;
  color?: string;
}

export interface CreateShiftMasterRequest {
  clientId: string | undefined;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  isCrossDay: boolean;
  isDayOff: boolean;
  lateToleranceMinutes: number;
  clockInWindowMinutes: number;
  color?: string;
}