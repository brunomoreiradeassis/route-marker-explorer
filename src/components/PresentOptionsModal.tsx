
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
import { Badge } from '@/components/ui/badge';
import { Gift, MapPin, Star, Coins } from 'lucide-react';
import { Present, PresentType } from '../types/map';

interface PresentOptionsModalProps {
  isOpen: boolean;
  present: Present | null;
  onClose: () => void;
  onCollect: (presentId: string) => void;
  onIgnore: () => void;
}

const PRESENT_TYPE_INFO: Record<PresentType, { emoji: string; color: string; label: string }> = {
  moeda: { emoji: '🪙', color: 'bg-yellow-500', label: 'Moeda' },
  gema: { emoji: '💎', color: 'bg-blue-500', label: 'Gema' },
  pocao: { emoji: '🧪', color: 'bg-purple-500', label: 'Poção' },
  equipamento: { emoji: '⚔️', color: 'bg-gray-500', label: 'Equipamento' },
  chave: { emoji: '🔑', color: 'bg-orange-500', label: 'Chave' },
  bonus: { emoji: '⭐', color: 'bg-green-500', label: 'Bônus' },
};

const PresentOptionsModal: React.FC<PresentOptionsModalProps> = ({
  isOpen,
  present,
  onClose,
  onCollect,
  onIgnore,
}) => {
  if (!present) return null;

  const typeInfo = PRESENT_TYPE_INFO[present.type];

  const handleCollect = () => {
    onCollect(present.id);
    onClose();
  };

  const handleIgnore = () => {
    onIgnore();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">{typeInfo.emoji}</div>
            <div>
              <DialogTitle className="text-left">Presente Encontrado!</DialogTitle>
              <Badge 
                variant="outline" 
                className={`text-white ${typeInfo.color} mt-1`}
              >
                {typeInfo.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{present.name}</h3>
            <p className="text-muted-foreground">{present.description}</p>
          </div>

          {present.value && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Valor: {present.value} pontos</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Localização: {present.lat.toFixed(4)}, {present.lng.toFixed(4)}</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleIgnore} className="flex-1">
            Ignorar
          </Button>
          <Button 
            onClick={handleCollect} 
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Gift className="w-4 h-4 mr-2" />
            Coletar Presente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PresentOptionsModal;
