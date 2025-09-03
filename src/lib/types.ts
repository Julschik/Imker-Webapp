// Kern-Entitäten für die Imker-App
export interface Volk {
  id: string;
  stocknr: string;
  standortId: string;
  beute: string;
  status: {
    brut: 'grün' | 'gelb' | 'rot';
    futter: 'grün' | 'gelb' | 'rot';
    varroa: 'grün' | 'gelb' | 'rot';
    platz: 'grün' | 'gelb' | 'rot';
  };
  qrKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Durchsicht {
  id: string;
  volkId: string;
  datum: Date;
  checks: {
    königin: boolean;
    stifte: boolean;
    larven: boolean;
    verdeckelte: boolean;
  };
  volksstaerke: number; // 1-10 Skala
  notizen: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Standort {
  id: string;
  name: string;
  adresse: string;
  geo?: {
    lat: number;
    lng: number;
  };
  qrKey?: string;
  createdAt: Date;
  updatedAt: Date;
}