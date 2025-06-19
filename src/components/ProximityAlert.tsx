
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Gift, Store, ChevronDown, ChevronUp, Minimize2, Maximize2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProximityAlertProps {
  alerts: {
    type: 'marco' | 'present' | 'credenciado';
    name: string;
    distance: number;
    id: string;
    subtype?: string;
    lat?: number;
    lng?: number;
  }[];
  onFocus: (lat: number, lng: number) => void;
}

const ProximityAlert: React.FC<ProximityAlertProps> = ({ alerts, onFocus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isMobile = useIsMobile();

  // Function to get appropriate icon
  const getAlertIcon = (type: string, subtype?: string) => {
    if (type === 'marco') {
      return <MapPin className="w-3 h-3" />;
    } else if (type === 'present') {
      return <Gift className="w-3 h-3" />;
    } else if (type === 'credenciado') {
      return <Store className="w-3 h-3" />;
    }
    return null;
  };

  // Function to format distance
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(2)} km`;
    }
  };

  // Function to get color based on distance
  const getDistanceColor = (distance: number) => {
    if (distance <= 200) {
      return 'bg-red-500 text-white';
    } else if (distance <= 1000) {
      return 'bg-orange-500 text-white';
    } else if (distance <= 2000) {
      return 'bg-yellow-500 text-black';
    } else {
      return 'bg-blue-500 text-white';
    }
  };

  // Function to get type name
  const getTypeName = (type: string, subtype?: string) => {
    if (type === 'marco') {
      if (subtype === 'inicio') return 'Marco de Início';
      if (subtype === 'meio') return 'Marco de Meio';
      if (subtype === 'fim') return 'Marco de Fim';
      return 'Marco';
    } else if (type === 'present') {
      return 'Presente';
    } else if (type === 'credenciado') {
      switch (subtype) {
        case 'restaurante': return 'Restaurante';
        case 'posto': return 'Posto de Gasolina';
        case 'farmacia': return 'Farmácia';
        case 'supermercado': return 'Supermercado';
        case 'hotel': return 'Hotel';
        case 'pousada': return 'Pousada';
        case 'academia': return 'Academia';
        default: return 'Estabelecimento';
      }
    }
    return 'Ponto';
  };

  if (alerts.length === 0) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <Card className="border-2 border-blue-500 bg-white/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-500" />
              <span className="font-bold text-xs">{alerts.length}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className="h-2 w-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-500 bg-white/95 backdrop-blur-sm shadow-lg">
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            Pontos próximos ({alerts.length})
          </h3>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 
                <ChevronUp className="h-2 w-2" /> : 
                <ChevronDown className="h-2 w-2" />
              }
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-2 w-2" />
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {alerts.slice(0, 10).map((alert, index) => (
              <div 
                key={`${alert.type}-${alert.id}-${index}`} 
                className="bg-background border rounded-md p-1 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-1 flex-1 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${getDistanceColor(alert.distance)}`}>
                    {getAlertIcon(alert.type, alert.subtype)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium truncate max-w-[60px]" title={alert.name}>
                      {alert.name}
                    </p>
                    <div className="flex items-center space-x-0.5">
                      <Badge variant="outline" className="text-[8px] h-3 px-1">
                        {getTypeName(alert.type, alert.subtype)}
                      </Badge>
                      <Badge className={`text-[8px] h-3 px-1 ${getDistanceColor(alert.distance)}`}>
                        {formatDistance(alert.distance)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-4 w-4 p-0 hover:bg-primary/10 flex-shrink-0" 
                  onClick={() => {
                    if (alert.lat && alert.lng) {
                      onFocus(alert.lat, alert.lng);
                    }
                  }}
                  title="Focar no elemento"
                >
                  <MapPin className="h-2 w-2" />
                </Button>
              </div>
            ))}
            {alerts.length > 10 && (
              <p className="text-[10px] text-muted-foreground text-center py-1">
                E mais {alerts.length - 10} pontos próximos...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProximityAlert;
