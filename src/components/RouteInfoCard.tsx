
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Navigation, Minimize2, Maximize2 } from 'lucide-react';

interface RouteInfoCardProps {
  routeName: string;
  distance: number; // em metros
  duration: number; // em segundos
  color: string;
}

const RouteInfoCard: React.FC<RouteInfoCardProps> = ({
  routeName,
  distance,
  duration,
  color
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  if (isMinimized) {
    return (
      <Card className="w-auto bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4" style={{ color }} />
            <span className="text-sm font-medium">{formatDistance(distance)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background/95 backdrop-blur-sm border shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4" style={{ color }} />
            {routeName}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDistance(distance)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDuration(duration)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteInfoCard;
