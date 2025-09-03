export interface ModuleDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  enabled: boolean;
}

export const moduleRegistry: ModuleDef[] = [
  {
    id: 'scan',
    name: 'QR-Scanner',
    description: 'Völker per QR-Code scannen',
    icon: 'QrCode',
    path: '/mod/scan',
    enabled: true
  },
  {
    id: 'voelker',
    name: 'Völker',
    description: 'Stockkarten verwalten',
    icon: 'Hexagon',
    path: '/mod/voelker',
    enabled: true
  },
  {
    id: 'durchsicht',
    name: 'Durchsichten',
    description: 'Kontrollen erfassen',
    icon: 'Eye',
    path: '/mod/durchsicht',
    enabled: true
  }
];

export function getEnabledModules(): ModuleDef[] {
  return moduleRegistry.filter(mod => mod.enabled);
}