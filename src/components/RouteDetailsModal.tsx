
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Route } from '../types/map';

interface RouteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
  onSave: (routeId: string, details: Partial<Route>) => void;
}

const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({
  isOpen,
  onClose,
  route,
  onSave
}) => {
  const [details, setDetails] = useState({
    valorProposto: route?.valorProposto || 0,
    descricao: route?.descricao || '',
    prazoEntrega: route?.prazoEntrega || '',
    observacoes: route?.observacoes || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({
      ...prev,
      [name]: name === 'valorProposto' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = () => {
    if (route) {
      onSave(route.id, details);
      onClose();
    }
  };

  if (!route) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Rota: {route.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valorProposto" className="text-right">
              Valor (R$)
            </Label>
            <Input
              id="valorProposto"
              name="valorProposto"
              type="number"
              step="0.01"
              value={details.valorProposto}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prazoEntrega" className="text-right">
              Prazo
            </Label>
            <Input
              id="prazoEntrega"
              name="prazoEntrega"
              placeholder="Ex: 2 horas"
              value={details.prazoEntrega}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="descricao" className="text-right mt-2">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Descrição da entrega..."
              value={details.descricao}
              onChange={handleChange}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="observacoes" className="text-right mt-2">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              placeholder="Observações adicionais..."
              value={details.observacoes}
              onChange={handleChange}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Detalhes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RouteDetailsModal;
