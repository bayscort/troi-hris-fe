import { Client } from "./client";

export interface JobPosition {
  id?: string | undefined;
  client: Client;
  title: string;
  code: string;
  level: string;
  internalGradeCode: string;
  billingRateMin: number;
  billingRateMax: number;
  description: string;
  active: boolean;
}