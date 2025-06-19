import React, { useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Gift, MapPin } from 'lucide-react';
import { Present } from '../types/map';
import PresentOptionsModal from './PresentOptionsModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface PresentAlertProps {
  present: Present;
  onCollect: (presentId: string) => void;
  onClose: () => void;
}

const PresentAlert: React.FC<PresentAlertProps> = ({
  present,
  onCollect,
  onClose
}) => {
  const [showModal, setShowModal] = useState(false);
  const isMobile = useIsMobile();

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleIgnore = () => {
    onClose();
  };

  return (
    <>
      <div className={`fixed ${isMobile ? 'top-2 left-2 right-2' : 'top-4 left-1/2 transform -translate-x-1/2'} z-50 ${isMobile ? '' : 'w-full max-w-md px-4'}`}>
        <Alert className="bg-background/95 backdrop-blur-sm border-2 border-yellow-400 shadow-lg">
          <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
          <AlertTitle className="flex items-center gap-1 sm:gap-2 text-yellow-800 text-xs sm:text-sm">
            <span>Presente Encontrado!</span>
          </AlertTitle>
          <AlertDescription className="mt-1 sm:mt-2 space-y-2 sm:space-y-3">
            <div>
              <p className="font-medium text-foreground text-xs sm:text-sm">{present.name}</p>
              <p className="text-xs text-muted-foreground">{present.description}</p>
            </div>
            
            <div className={`flex gap-2 pt-1 sm:pt-2 ${isMobile ? 'flex-col' : ''}`}>
              <Button 
                onClick={handleOpenModal}
                className={`${isMobile ? 'w-full' : 'flex-1'} bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm`}
                size="sm"
              >
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Ver Opções
              </Button>
              <Button 
                variant="outline" 
                onClick={handleIgnore}
                size="sm"
                className={`${isMobile ? 'w-full' : ''} text-xs sm:text-sm`}
              >
                Ignorar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      <PresentOptionsModal
        isOpen={showModal}
        present={present}
        onClose={handleCloseModal}
        onCollect={onCollect}
        onIgnore={handleIgnore}
      />
    </>
  );
};

export default PresentAlert;
