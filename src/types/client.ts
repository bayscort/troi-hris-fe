export interface Client {
  id?: number;
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  isInternal: boolean;
  active: boolean;
}
