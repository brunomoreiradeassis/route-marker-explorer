
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Navigation, Play } from 'lucide-react';

interface StartRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRace: () => void;
  routeName: string;
  distance: number; // em metros
  duration: number; // em segundos
  color: string;
}

const StartRaceModal: React.FC<StartRaceModalProps> = ({
  isOpen,
  onClose,
  onStartRace,
  routeName,
  distance,
  duration,
  color
}) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" style={{ color }} />
            Iniciar Corrida
          </DialogTitle>
          <DialogDescription>
            Você está próximo ao ponto de início da rota "{routeName}". Deseja iniciar a corrida?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Informações da Rota</h4>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Distância</span>
              </div>
              <span className="text-sm font-medium">{formatDistance(distance)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Tempo Estimado</span>
              </div>
              <span className="text-sm font-medium">{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onStartRace} className="gap-2">
            <Play className="w-4 h-4" />
            Iniciar Corrida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartRaceModal;
