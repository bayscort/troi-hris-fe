export interface Client {
  id?: string | undefined;
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  isInternal: boolean;
  active: boolean;
}