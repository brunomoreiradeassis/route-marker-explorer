
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Trash2,
  Store,
  Fuel,
  Cross,
  ShoppingCart,
  Building,
  Home,
  Dumbbell
} from 'lucide-react';
import { Credenciado, CredenciadoType } from '../types/map';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CredenciadoManagerProps {
  credenciados: Credenciado[];
  onAddCredenciado: (credenciado: Omit<Credenciado, 'id'>) => void;
  onRemoveCredenciado: (credenciadoId: string) => void;
}

const CredenciadoManager: React.FC<CredenciadoManagerProps> = ({
  credenciados,
  onAddCredenciado,
  onRemoveCredenciado,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCredenciado, setNewCredenciado] = useState({
    name: '',
    description: '',
    type: 'restaurante' as CredenciadoType,
    discount: '',
    phone: '',
    address: '',
    lat: -16.6805776,
    lng: -49.4375273,
  });

  const credenciadoTypes = [
    { type: 'restaurante' as CredenciadoType, name: 'Restaurante', icon: Store },
    { type: 'posto' as CredenciadoType, name: 'Posto de Gasolina', icon: Fuel },
    { type: 'farmacia' as CredenciadoType, name: 'Farmácia', icon: Cross },
    { type: 'supermercado' as CredenciadoType, name: 'Supermercado', icon: ShoppingCart },
    { type: 'hotel' as CredenciadoType, name: 'Hotel', icon: Building },
    { type: 'pousada' as CredenciadoType, name: 'Pousada', icon: Home },
    { type: 'academia' as CredenciadoType, name: 'Academia', icon: Dumbbell },
  ];

  const getCredenciadoIcon = (type: CredenciadoType) => {
    const typeInfo = credenciadoTypes.find(t => t.type === type);
    return typeInfo?.icon || Store;
  };

  const getCredenciadoTypeName = (type: CredenciadoType) => {
    const typeInfo = credenciadoTypes.find(t => t.type === type);
    return typeInfo?.name || 'Estabelecimento';
  };

  const getCredenciadoColor = (type: CredenciadoType) => {
    switch (type) {
      case 'restaurante':
        return '#f97316'; // orange
      case 'posto':
        return '#eab308'; // yellow
      case 'farmacia':
        return '#22c55e'; // green
      case 'supermercado':
        return '#3b82f6'; // blue
      case 'hotel':
        return '#8b5cf6'; // violet
      case 'pousada':
        return '#ec4899'; // pink
      case 'academia':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const handleAddCredenciado = () => {
    if (newCredenciado.name.trim()) {
      onAddCredenciado({
        ...newCredenciado,
        name: newCredenciado.name.trim(),
      });
      
      setNewCredenciado({
        name: '',
        description: '',
        type: 'restaurante',
        discount: '',
        phone: '',
        address: '',
        lat: -16.6805776,
        lng: -49.4375273,
      });
      
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Credenciados</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-3 h-3" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Estabelecimento Credenciado</DialogTitle>
              <DialogDescription>
                Adicione um novo estabelecimento credenciado
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Estabelecimento</Label>
                <Input
                  id="name"
                  value={newCredenciado.name}
                  onChange={(e) => setNewCredenciado({ ...newCredenciado, name: e.target.value })}
                  placeholder="Ex: Restaurante do João"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newCredenciado.type}
                  onValueChange={(value: CredenciadoType) => 
                    setNewCredenciado({ ...newCredenciado, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {credenciadoTypes.map((type) => (
                      <SelectItem key={type.type} value={type.type}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newCredenciado.description}
                  onChange={(e) => setNewCredenciado({ ...newCredenciado, description: e.target.value })}
                  placeholder="Descreva o estabelecimento..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Desconto Oferecido</Label>
                <Input
                  id="discount"
                  value={newCredenciado.discount}
                  onChange={(e) => setNewCredenciado({ ...newCredenciado, discount: e.target.value })}
                  placeholder="Ex: 10% de desconto"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newCredenciado.phone}
                  onChange={(e) => setNewCredenciado({ ...newCredenciado, phone: e.target.value })}
                  placeholder="Ex: (62) 99999-9999"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={newCredenciado.address}
                  onChange={(e) => setNewCredenciado({ ...newCredenciado, address: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCredenciado}>Adicionar Credenciado</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-64">
        {credenciados.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">
            Nenhum estabelecimento credenciado. Clique em "Adicionar" para criar um.
          </p>
        ) : (
          <div className="space-y-2">
            {credenciados.map((credenciado) => {
              const Icon = getCredenciadoIcon(credenciado.type);
              return (
                <Card key={credenciado.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <Icon 
                        className="w-5 h-5 mt-0.5 flex-shrink-0" 
                        style={{ color: getCredenciadoColor(credenciado.type) }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{credenciado.name}</p>
                        <Badge variant="secondary" className="text-xs mb-1">
                          {getCredenciadoTypeName(credenciado.type)}
                        </Badge>
                        {credenciado.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {credenciado.description}
                          </p>
                        )}
                        {credenciado.discount && (
                          <p className="text-xs text-green-600 font-medium">
                            {credenciado.discount}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveCredenciado(credenciado.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default CredenciadoManager;
