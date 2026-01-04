export interface ClientSite {
  id?: string | undefined;
  clientId: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
  active: boolean;
}