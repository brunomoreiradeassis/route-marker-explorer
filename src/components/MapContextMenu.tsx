
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Gift, Store } from 'lucide-react';
import { Marco } from '../types/map';

interface MapContextMenuProps {
  x: number;
  y: number;
  lat: number;
  lng: number;
  onAddMarco: (type: Marco['type']) => void;
  onAddPresent: () => void;
  onAddCredenciado: () => void;
  onClose: () => void;
}

const MapContextMenu: React.FC<MapContextMenuProps> = ({
  x,
  y,
  lat,
  lng,
  onAddMarco,
  onAddPresent,
  onAddCredenciado,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-48"
      style={{
        left: x,
        top: y,
      }}
    >
      <Card className="shadow-lg border">
        <CardContent className="p-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1">
              Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
            <div className="border-t pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                onClick={onAddPresent}
              >
                <Gift className="w-4 h-4 mr-2" />
                Adicionar Presente
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={onAddCredenciado}
              >
                <Store className="w-4 h-4 mr-2" />
                Adicionar Credenciado
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onAddMarco('inicio')}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Adicionar Marco Início
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                onClick={() => onAddMarco('meio')}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Adicionar Marco Meio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onAddMarco('fim')}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Adicionar Marco Fim
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapContextMenu;
