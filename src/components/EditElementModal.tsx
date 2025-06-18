
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
import { Marco, Present, Credenciado, PresentType, CredenciadoType } from '../types/map';

interface EditElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: {
    type: 'marco' | 'present' | 'credenciado';
    data: Marco | Present | Credenciado;
  } | null;
  editType: 'location' | 'info';
  onSave: (updatedElement: Marco | Present | Credenciado) => void;
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

  const credenciadoTypes: { value: CredenciadoType; label: string }[] = [
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'posto', label: 'Posto de Gasolina' },
    { value: 'farmacia', label: 'Farmácia' },
    { value: 'supermercado', label: 'Supermercado' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'pousada', label: 'Pousada' },
    { value: 'academia', label: 'Academia' },
  ];

  const getElementTypeName = () => {
    switch (element.type) {
      case 'marco':
        return 'Marco';
      case 'present':
        return 'Presente';
      case 'credenciado':
        return 'Credenciado';
      default:
        return 'Elemento';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editType === 'location' ? 'Editar Localização' : 'Editar Informações'} - {getElementTypeName()}
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

              {element.type === 'credenciado' && (
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
                      value={formData.type || 'restaurante'}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {credenciadoTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount">Desconto</Label>
                    <Input
                      id="discount"
                      value={formData.discount || ''}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="Ex: 10% de desconto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ex: Rua das Flores, 123"
                    />
                  </div>
                </>
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
