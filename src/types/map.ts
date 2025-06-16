
export interface Marco {
  id: string;
  name: string;
  type: 'inicio' | 'meio' | 'fim';
  lat: number;
  lng: number;
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
  onClose: () => void;
}
