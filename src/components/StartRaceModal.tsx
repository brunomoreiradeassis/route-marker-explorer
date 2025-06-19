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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
            Iniciar Corrida
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Você está próximo ao ponto de início da rota "{routeName}". Deseja iniciar a corrida?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 sm:py-4 space-y-2 sm:space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">Informações da Rota</h4>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 sm:gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm">Distância</span>
              </div>
              <span className="text-xs sm:text-sm font-medium">{formatDistance(distance)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm">Tempo Estimado</span>
              </div>
              <span className="text-xs sm:text-sm font-medium">{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className={`gap-2 ${isMobile ? 'flex-col' : ''}`}>
          <Button variant="outline" onClick={onClose} className={`${isMobile ? 'w-full' : ''} text-xs sm:text-sm`}>
            Cancelar
          </Button>
          <Button onClick={onStartRace} className={`gap-1 sm:gap-2 ${isMobile ? 'w-full' : ''} text-xs sm:text-sm`}>
            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            Iniciar Corrida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartRaceModal;
