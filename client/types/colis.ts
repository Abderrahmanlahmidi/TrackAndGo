export type ColisStatus = 'pending' | 'in_transit' | 'delivered' | 'incident';

export interface ColisLocation {
  lat: number;
  lng: number;
}

export interface ColisValidation {
  timestamp: string;
  gpsLocation: ColisLocation;
  photoUri?: string;
}

export interface ColisIncident {
  type: 'absent' | 'damaged' | 'other';
  comment: string;
  photoUri?: string;
  timestamp: string;
}

export interface Colis {
  id: string;
  driverId: string;
  barcode: string;
  clientName: string;
  phoneNumber: string;
  address: string;
  status: ColisStatus;
  location: ColisLocation;
  validation: ColisValidation | null;
  incident: ColisIncident | null;
  createdAt: string;
}