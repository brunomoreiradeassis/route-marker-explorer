
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Credenciado, CredenciadoType } from '../types/map';

interface CredenciadoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credenciado: Omit<Credenciado, 'id'>) => void;
  credenciado?: Credenciado | null;
}

const CredenciadoForm: React.FC<CredenciadoFormProps> = ({
  isOpen,
  onClose,
  onSave,
  credenciado
}) => {
  const [formData, setFormData] = useState({
    name: credenciado?.name || '',
    description: credenciado?.description || '',
    type: credenciado?.type || 'restaurante' as CredenciadoType,
    discount: credenciado?.discount || '',
    phone: credenciado?.phone || '',
    address: credenciado?.address || '',
    lat: credenciado?.lat || -16.6805776,
    lng: credenciado?.lng || -49.4375273
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      name: '',
      description: '',
      type: 'restaurante',
      discount: '',
      phone: '',
      address: '',
      lat: -16.6805776,
      lng: -49.4375273
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>{credenciado ? 'Editar' : 'Novo'} Credenciado</DialogTitle>
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
            <Select value={formData.type} onValueChange={(value: CredenciadoType) => setFormData({...formData, type: value})}>
              <SelectTrigger className="border dark:border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurante">Restaurante</SelectItem>
                <SelectItem value="posto">Posto</SelectItem>
                <SelectItem value="farmacia">Farmácia</SelectItem>
                <SelectItem value="supermercado">Supermercado</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="pousada">Pousada</SelectItem>
                <SelectItem value="academia">Academia</SelectItem>
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
            <Label htmlFor="discount">Desconto</Label>
            <Input
              id="discount"
              value={formData.discount}
              onChange={(e) => setFormData({...formData, discount: e.target.value})}
              placeholder="ex: 10% de desconto"
              className="border dark:border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(62) 99999-9999"
              className="border dark:border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
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
              {credenciado ? 'Atualizar' : 'Criar'}
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

export default CredenciadoForm;
