
export interface Marco {
  id: string;
  name: string;
  type: 'inicio' | 'meio' | 'fim';
  lat: number;
  lng: number;
}

export type PresentType = 'moeda' | 'gema' | 'pocao' | 'equipamento' | 'chave' | 'bonus';

export interface Present {
  id: string;
  name: string;
  description: string;
  type: PresentType;
  lat: number;
  lng: number;
  collected?: boolean;
  value?: number;
}

export type CredenciadoType = 'restaurante' | 'posto' | 'farmacia' | 'supermercado' | 'hotel' | 'pousada' | 'academia';

export interface Credenciado {
  id: string;
  name: string;
  description: string;
  type: CredenciadoType;
  lat: number;
  lng: number;
  discount?: string;
  phone?: string;
  address?: string;
}

export interface Route {
  id: string;
  name: string;
  marcos: Marco[];
  color: string;
}

export interface MapContextMenuProps {
  x: number;
  y: number;
  lat: number;
  lng: number;
  onAddMarco: (type: Marco['type']) => void;
  onAddPresent: () => void;
  onAddCredenciado: () => void;
  onClose: () => void;
}

export type MapTileType = 'openstreetmap' | 'satellite' | 'terrain' | 'dark' | 'watercolor';

export interface ElementContextMenuProps {
  x: number;
  y: number;
  element: {
    type: 'marco' | 'present' | 'route' | 'credenciado';
    id: string;
    data: Marco | Present | Route | Credenciado;
  };
  onEdit: (type: 'location' | 'info') => void;
  onDelete: () => void;
  onClone: () => void;
  onClose: () => void;
}
