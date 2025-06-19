
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

  const currentMapType = mapTypes.find(mt => mt.type === currentType);

  if (isMinimized) {
    return (
      <Card className="w-auto">
        <CardContent className="p-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {currentMapType && <currentMapType.icon className="w-3 h-3" />}
              <span className="text-xs font-medium">{currentMapType?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-4 w-4 p-0"
            >
              <Maximize2 className="w-2 h-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium">Tipo de Mapa</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-4 w-4 p-0"
          >
            <Minimize2 className="w-2 h-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="space-y-1">
          {mapTypes.map((mapType) => {
            const Icon = mapType.icon;
            return (
              <Button
                key={mapType.type}
                variant={currentType === mapType.type ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start h-auto p-1.5 text-xs"
                onClick={() => onTypeChange(mapType.type)}
              >
                <Icon className="w-3 h-3 mr-1.5 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{mapType.name}</div>
                  <div className="text-[10px] text-muted-foreground">
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
