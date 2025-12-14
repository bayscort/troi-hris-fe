export type VehicleType = 'TRUCK' | 'CAR' | 'MOTORCYCLE';


export interface Vehicle {
  id?: number;
  licensePlatNumber: string;
  vehicleType: VehicleType;
}

export interface Contractor {
  id?: number;
  name: string;
  phoneNumber: string;
}

export interface ContractorCreate {
  id?: number;
  name: string;
  phoneNumber: string;
}

export interface ContractorSummary {
  contractor: Contractor | null;
  totalTrips: number;
  totalRevenue: number;
  totalContractorExpenses: number;
  totalFeeOperational: number;
  totalExpenses: number;
  profitLoss: number;
  totalLoad: number;
  vehicles: Vehicle[];

}