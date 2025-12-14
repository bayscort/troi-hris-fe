import {
  Afdeling, Mill
} from '../types/location';

import {
  Driver
} from '../types/driver';

import {
  Vehicle
} from '../types/vehicle';

import {
  Contractor
} from '../types/contractor';
import { TripType } from './trip-type';



export interface Trip {
  id?: number;
  date: string;
  tripType: TripType;
  mill: Mill;
  afdeling: Afdeling;
  driver: Driver;
  vehicle: Vehicle;
  contractor: Contractor;
  loadWeightKg: number;
  ptpnRate: number;
  contractorRate: number;
  travelAllowance: number;
  loadingFee: number;
  consumptionFee: number;
  additionalFee1: number;
  additionalFee2: number;
  additionalFee3: number;
  createdAt?: string;
  createdBy?: string;
}

export interface TripCreateDto {
  date: string;
  tripTypeId: number;
  millId: number;
  estateId?: number;
  afdelingId: number;
  blockId?: number;
  driverId: number;
  vehicleId: number;
  contractorId: number;
  loadWeightKg: number;
  ptpnRate: number;
  contractorRate: number;
  travelAllowance: number;
  loadingFee: number;
  consumptionFee: number;
  additionalFee1: number;
  additionalFee2: number;
  additionalFee3: number;
}