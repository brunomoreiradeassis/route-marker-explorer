
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Marco, Present, PresentType } from '../types/map';

interface EditElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: {
    type: 'marco' | 'present';
    data: Marco | Present;
  } | null;
  editType: 'location' | 'info';
  onSave: (updatedElement: Marco | Present) => void;
}

const EditElementModal: React.FC<EditElementModalProps> = ({
  isOpen,
  onClose,
  element,
  editType,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (element) {
      setFormData({ ...element.data });
    }
  }, [element]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!element) return null;

  const presentTypes: { value: PresentType; label: string }[] = [
    { value: 'moeda', label: 'Moeda' },
    { value: 'gema', label: 'Gema' },
    { value: 'pocao', label: 'Poção' },
    { value: 'equipamento', label: 'Equipamento' },
    { value: 'chave', label: 'Chave' },
    { value: 'bonus', label: 'Bônus' },
  ];

  const marcoTypes: { value: Marco['type']; label: string }[] = [
    { value: 'inicio', label: 'Início' },
    { value: 'meio', label: 'Meio' },
    { value: 'fim', label: 'Fim' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editType === 'location' ? 'Editar Localização' : 'Editar Informações'} - {element.type === 'marco' ? 'Marco' : 'Presente'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {editType === 'location' ? (
            <>
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat || ''}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng || ''}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              {element.type === 'present' && (
                <>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type || 'bonus'}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {presentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                    />
                  </div>
                </>
              )}
              
              {element.type === 'marco' && (
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type || 'meio'}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {marcoTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditElementModal;
