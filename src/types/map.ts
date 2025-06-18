
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
  onClose: () => void;
}
