
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map, Satellite, Mountain, Moon, Palette } from 'lucide-react';
import { MapTileType } from '../types/map';

interface MapTypeSelectorProps {
  currentType: MapTileType;
  onTypeChange: (type: MapTileType) => void;
}

const MapTypeSelector: React.FC<MapTypeSelectorProps> = ({
  currentType,
  onTypeChange,
}) => {
  const mapTypes = [
    {
      type: 'openstreetmap' as MapTileType,
      name: 'Padrão',
      icon: Map,
      description: 'Mapa padrão do OpenStreetMap'
    },
    {
      type: 'satellite' as MapTileType,
      name: 'Satélite',
      icon: Satellite,
      description: 'Imagens de satélite do Esri'
    },
    {
      type: 'terrain' as MapTileType,
      name: 'Terreno',
      icon: Mountain,
      description: 'Mapa com relevo e topografia'
    },
    {
      type: 'dark' as MapTileType,
      name: 'Escuro',
      icon: Moon,
      description: 'Tema escuro para melhor visualização'
    },
    {
      type: 'watercolor' as MapTileType,
      name: 'Aquarela',
      icon: Palette,
      description: 'Estilo artístico aquarela'
    }
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <h3 className="text-sm font-medium mb-3">Tipo de Mapa</h3>
        <div className="space-y-1">
          {mapTypes.map((mapType) => {
            const Icon = mapType.icon;
            return (
              <Button
                key={mapType.type}
                variant={currentType === mapType.type ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start h-auto p-2"
                onClick={() => onTypeChange(mapType.type)}
              >
                <Icon className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{mapType.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {mapType.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapTypeSelector;
