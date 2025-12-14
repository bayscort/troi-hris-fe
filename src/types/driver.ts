export interface Driver {
  id?: number;
  name: string;
  licenseNumber: string;
}

export interface DriverSummary {
  driver: Driver;
  totalTrips: number;
  totalRevenue: number;
  totalContractorExpenses: number;
  totalFeeOperational: number;
  totalExpenses: number;
  profitLoss: number;
  totalLoad: number;
}