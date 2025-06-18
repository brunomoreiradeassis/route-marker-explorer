
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Gift, Store } from 'lucide-react';

interface ProximityAlertProps {
  alerts: {
    type: 'marco' | 'present' | 'credenciado';
    name: string;
    distance: number;
    id: string;
    subtype?: string;
  }[];
  onFocus: (lat: number, lng: number) => void;
}

const ProximityAlert: React.FC<ProximityAlertProps> = ({ alerts, onFocus }) => {
  // Function to get appropriate icon
  const getAlertIcon = (type: string, subtype?: string) => {
    if (type === 'marco') {
      return <MapPin className="w-4 h-4" />;
    } else if (type === 'present') {
      return <Gift className="w-4 h-4" />;
    } else if (type === 'credenciado') {
      return <Store className="w-4 h-4" />;
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

  return (
    <div className="space-y-2">
      <Card className="border-2 border-blue-500">
        <CardContent className="p-3">
          <h3 className="font-bold text-sm mb-2">Pontos próximos</h3>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {alerts.map((alert) => (
              <div 
                key={`${alert.type}-${alert.id}`} 
                className="bg-background border rounded-md p-2 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getDistanceColor(alert.distance)}`}>
                    {getAlertIcon(alert.type, alert.subtype)}
                  </div>
                  <div>
                    <p className="text-xs font-medium truncate max-w-[120px]">{alert.name}</p>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-[10px] h-4">
                        {getTypeName(alert.type, alert.subtype)}
                      </Badge>
                      <Badge className={`text-[10px] h-4 ${getDistanceColor(alert.distance)}`}>
                        {formatDistance(alert.distance)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0" 
                  onClick={() => onFocus(0, 0)} // This will be properly implemented in the MapView
                >
                  <MapPin className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProximityAlert;
