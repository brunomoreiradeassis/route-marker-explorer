
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Route as RouteIcon, 
  Plus, 
  Trash2
} from 'lucide-react';
import { Route, Marco } from '../types/map';
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

interface MapSidebarProps {
  routes: Route[];
  currentRoute: Route | null;
  onCreateRoute: (name: string) => void;
  onSelectRoute: (route: Route) => void;
  onRemoveRoute: (routeId: string) => void;
  onRemoveMarco: (marcoId: string) => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  routes,
  currentRoute,
  onCreateRoute,
  onSelectRoute,
  onRemoveRoute,
  onRemoveMarco,
}) => {
  const [newRouteName, setNewRouteName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateRoute = () => {
    if (newRouteName.trim()) {
      onCreateRoute(newRouteName.trim());
      setNewRouteName('');
      setIsCreateDialogOpen(false);
    }
  };

  const getMarcoTypeColor = (type: Marco['type']) => {
    switch (type) {
      case 'inicio':
        return 'bg-green-500';
      case 'meio':
        return 'bg-orange-500';
      case 'fim':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getMarcoTypeName = (type: Marco['type']) => {
    switch (type) {
      case 'inicio':
        return 'Início';
      case 'meio':
        return 'Meio';
      case 'fim':
        return 'Fim';
      default:
        return 'Marco';
    }
  };

  return (
    <Sidebar className="w-80">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Sistema de Rotas</h1>
          <SidebarTrigger />
        </div>
        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-md">
          <p className="text-sm text-green-800">
            Usando OpenStreetMap - mapa gratuito e aberto
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {/* Rotas */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Rotas
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Rota</DialogTitle>
                  <DialogDescription>
                    Digite o nome da nova rota
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="routeName">Nome da Rota</Label>
                    <Input
                      id="routeName"
                      value={newRouteName}
                      onChange={(e) => setNewRouteName(e.target.value)}
                      placeholder="Ex: Rota para o trabalho"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateRoute()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateRoute}>Criar Rota</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-48">
              <SidebarMenu>
                {routes.map((route) => (
                  <SidebarMenuItem key={route.id}>
                    <div className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent">
                      <SidebarMenuButton
                        onClick={() => onSelectRoute(route)}
                        className={`flex-1 justify-start ${
                          currentRoute?.id === route.id ? 'bg-accent' : ''
                        }`}
                      >
                        <RouteIcon className="w-4 h-4 mr-2" style={{ color: route.color }} />
                        <span className="truncate">{route.name}</span>
                      </SidebarMenuButton>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveRoute(route.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Marcos da Rota Atual */}
        {currentRoute && (
          <SidebarGroup>
            <SidebarGroupLabel>
              Marcos - {currentRoute.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-64">
                {currentRoute.marcos.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    Nenhum marco nesta rota. Clique com o botão direito no mapa para adicionar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentRoute.marcos
                      .sort((a, b) => {
                        const order = { inicio: 0, meio: 1, fim: 2 };
                        return order[a.type] - order[b.type];
                      })
                      .map((marco) => (
                        <Card key={marco.id} className="p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MapPin 
                                className={`w-4 h-4 text-white p-0.5 rounded ${getMarcoTypeColor(marco.type)}`}
                              />
                              <div>
                                <p className="font-medium text-sm">{marco.name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {getMarcoTypeName(marco.type)}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onRemoveMarco(marco.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Como usar</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p>• Crie uma rota clicando no botão + ao lado de "Rotas"</p>
            <p>• Clique com o botão direito no mapa para adicionar marcos</p>
            <p>• Use marcos de Início, Meio e Fim para organizar sua rota</p>
            <p>• A rota será desenhada automaticamente conectando os marcos</p>
            <p>• Mapa powered by OpenStreetMap</p>
          </CardContent>
        </Card>
      </SidebarContent>
    </Sidebar>
  );
};

export default MapSidebar;
