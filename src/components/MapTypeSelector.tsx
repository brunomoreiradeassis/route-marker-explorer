
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Map, Satellite, Mountain, Moon, Palette, Minimize2, Maximize2 } from 'lucide-react';
import { MapTileType } from '../types/map';

interface MapTypeSelectorProps {
  currentType: MapTileType;
  onTypeChange: (type: MapTileType) => void;
}

const MapTypeSelector: React.FC<MapTypeSelectorProps> = ({
  currentType,
  onTypeChange,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

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

  if (isMinimized) {
    return (
      <Card className="w-auto">
        <CardHeader className="p-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Mapa</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Tipo de Mapa</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
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
