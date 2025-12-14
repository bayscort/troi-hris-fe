export interface Block {
  id?: number;
  name: string;
}

export interface Afdeling {
  id?: number;
  name: string;
  blockList: Block[];
  estateName:string  
}

export interface Estate {
  id?: number;
  name: string;
  afdelingList: Afdeling[];
}

export interface Mill {
  id?: number;
  name: string;
}

export interface RateVersioning {
  id: number;
  effectiveDate: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  active: boolean;
}

export interface RateConfiguration {
  id: number;
  afdeling: Afdeling;
  mill: Mill;
  ptpnRate: number;
  contractorRate: number;
  label: string;
  rateVersioning: RateVersioning;
}

export interface RateConfigurationCreateDto {
  afdelingId: number;
  millId: number;
  ptpnRate: number;
  contractorRate: number;
}

export interface MillSummary {
  mill: Mill;
  totalTrips: number;
  totalRevenue: number;
  totalContractorExpenses: number;
  totalFeeOperational: number;
  totalExpenses: number;
  profitLoss: number;
  totalLoad: number;

}

export interface AfdelingSummary {
  afdeling: Afdeling;
  totalTrips: number;
  totalRevenue: number;
  totalContractorExpenses: number;
  totalFeeOperational: number;
  totalExpenses: number;
  profitLoss: number;
  totalLoad: number;

}
