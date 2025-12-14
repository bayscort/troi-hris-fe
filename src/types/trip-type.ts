export interface TripType {
  id?: number;
  name: string;
}

export interface TripTypeCreate {
  id?: number;
  name: string;
}

export interface TripTypeSummary {
  tripType: TripType;
  totalTrips: number;
  totalRevenue: number;
  totalContractorExpenses: number;
  totalFeeOperational: number;
  totalExpenses: number;
  profitLoss: number;
  totalLoad: number;
}