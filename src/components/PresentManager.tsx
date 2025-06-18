
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Gift, Plus, Trash2, MapPin } from 'lucide-react';
import { Present, PresentType } from '../types/map';

interface PresentManagerProps {
  presents: Present[];
  onAddPresent: (present: Omit<Present, 'id'>) => void;
  onRemovePresent: (presentId: string) => void;
}

const PRESENT_TYPES: { value: PresentType; label: string; emoji: string; color: string }[] = [
  { value: 'moeda', label: 'Moeda', emoji: '🪙', color: 'bg-yellow-500' },
  { value: 'gema', label: 'Gema', emoji: '💎', color: 'bg-blue-500' },
  { value: 'pocao', label: 'Poção', emoji: '🧪', color: 'bg-purple-500' },
  { value: 'equipamento', label: 'Equipamento', emoji: '⚔️', color: 'bg-gray-500' },
  { value: 'chave', label: 'Chave', emoji: '🔑', color: 'bg-orange-500' },
  { value: 'bonus', label: 'Bônus', emoji: '⭐', color: 'bg-green-500' },
];

const PresentManager: React.FC<PresentManagerProps> = ({
  presents,
  onAddPresent,
  onRemovePresent,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPresent, setNewPresent] = useState({
    name: '',
    description: '',
    type: 'moeda' as PresentType,
    lat: 0,
    lng: 0,
    value: 10,
  });

  const handleCreatePresent = () => {
    if (newPresent.name.trim() && newPresent.description.trim()) {
      onAddPresent(newPresent);
      setNewPresent({
        name: '',
        description: '',
        type: 'moeda' as PresentType,
        lat: 0,
        lng: 0,
        value: 10,
      });
      setIsCreateDialogOpen(false);
    }
  };

  const getPresentTypeInfo = (type: PresentType) => {
    return PRESENT_TYPES.find(t => t.value === type) || PRESENT_TYPES[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gerenciar Presentes</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Presente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Presente</DialogTitle>
              <DialogDescription>
                Configure as informações do presente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="presentName">Nome</Label>
                <Input
                  id="presentName"
                  value={newPresent.name}
                  onChange={(e) => setNewPresent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Moeda de Ouro"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="presentType">Tipo</Label>
                <Select
                  value={newPresent.type}
                  onValueChange={(value: PresentType) => setNewPresent(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.emoji}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="presentDescription">Descrição</Label>
                <Textarea
                  id="presentDescription"
                  value={newPresent.description}
                  onChange={(e) => setNewPresent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o presente..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="presentLat">Latitude</Label>
                  <Input
                    id="presentLat"
                    type="number"
                    step="any"
                    value={newPresent.lat}
                    onChange={(e) => setNewPresent(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="presentLng">Longitude</Label>
                  <Input
                    id="presentLng"
                    type="number"
                    step="any"
                    value={newPresent.lng}
                    onChange={(e) => setNewPresent(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="presentValue">Valor/Pontos</Label>
                <Input
                  id="presentValue"
                  type="number"
                  value={newPresent.value}
                  onChange={(e) => setNewPresent(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePresent}>Criar Presente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-96">
        {presents.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum presente criado ainda. Crie o primeiro!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {presents.map((present) => {
              const typeInfo = getPresentTypeInfo(present.type);
              return (
                <Card key={present.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{typeInfo.emoji}</span>
                        <h4 className="font-medium truncate">{present.name}</h4>
                        {present.collected && (
                          <Badge variant="secondary" className="text-xs">
                            Coletado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {present.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{present.lat.toFixed(4)}, {present.lng.toFixed(4)}</span>
                        </div>
                        {present.value && (
                          <Badge variant="outline" className="text-xs">
                            {present.value} pts
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs text-white ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemovePresent(present.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
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

export default PresentManager;
