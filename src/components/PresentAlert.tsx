
import React from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Gift, MapPin } from 'lucide-react';
import { Present } from '../types/map';

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
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert className="bg-background/95 backdrop-blur-sm border-2 border-yellow-400 shadow-lg">
        <Gift className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="flex items-center gap-2 text-yellow-800">
          <span>Presente Encontrado!</span>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <div>
            <p className="font-medium text-foreground">{present.name}</p>
            <p className="text-sm text-muted-foreground">{present.description}</p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => onCollect(present.id)}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              size="sm"
            >
              <Gift className="w-4 h-4 mr-2" />
              Coletar Presente
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              size="sm"
            >
              Ignorar
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PresentAlert;
