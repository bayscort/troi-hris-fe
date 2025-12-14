
export type VehicleType = 'CAR' | 'TRUCK' | 'MOTORCYCLE';

export interface Contractor {
  id?: number;
  name: string;
  phoneNumber: string;
}

export interface Vehicle {
  id?: number;
  licensePlatNumber: string;
  vehicleType: VehicleType;
  contractor: Contractor
}

export interface VehicleCreate {
  id?: number;
  licensePlatNumber: string;
  vehicleType: VehicleType;
  contractorId: number
}

export interface VehicleSummary {
  vehicle: Vehicle;
  totalTrips: number;
  totalRevenue: number;
  totalContractorExpenses: number;
  totalFeeOperational: number;
  totalExpenses: number;
  profitLoss: number;
  totalLoad: number;
}