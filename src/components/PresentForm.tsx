
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Present, PresentType } from '../types/map';

interface PresentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (present: Omit<Present, 'id'>) => void;
  present?: Present | null;
}

const PresentForm: React.FC<PresentFormProps> = ({
  isOpen,
  onClose,
  onSave,
  present
}) => {
  const [formData, setFormData] = useState({
    name: present?.name || '',
    description: present?.description || '',
    type: present?.type || 'bonus' as PresentType,
    value: present?.value || 10,
    radius: present?.radius || 15,
    lat: present?.lat || -16.6805776,
    lng: present?.lng || -49.4375273
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      name: '',
      description: '',
      type: 'bonus',
      value: 10,
      radius: 15,
      lat: -16.6805776,
      lng: -49.4375273
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>{present ? 'Editar' : 'Novo'} Presente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="border dark:border-gray-700"
            />
          </div>
          
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: PresentType) => setFormData({...formData, type: value})}>
              <SelectTrigger className="border dark:border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moeda">Moeda</SelectItem>
                <SelectItem value="gema">Gema</SelectItem>
                <SelectItem value="pocao">Poção</SelectItem>
                <SelectItem value="equipamento">Equipamento</SelectItem>
                <SelectItem value="chave">Chave</SelectItem>
                <SelectItem value="bonus">Bônus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="border dark:border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="value">Valor (pontos)</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: parseInt(e.target.value)})}
              className="border dark:border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="radius">Raio de Coleta (metros)</Label>
            <Input
              id="radius"
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({...formData, radius: parseInt(e.target.value)})}
              min="1"
              max="100"
              className="border dark:border-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})}
                className="border dark:border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})}
                className="border dark:border-gray-700"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {present ? 'Atualizar' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border dark:border-gray-700">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PresentForm;
