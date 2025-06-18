
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Route as RouteIcon, 
  Plus, 
  Trash2,
  Gift,
  Store
} from 'lucide-react';
import { Route, Marco, Present, Credenciado } from '../types/map';
import PresentManager from './PresentManager';
import CredenciadoManager from './CredenciadoManager';
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
  presents: Present[];
  credenciados: Credenciado[];
  onCreateRoute: (name: string) => void;
  onSelectRoute: (route: Route) => void;
  onRemoveRoute: (routeId: string) => void;
  onRemoveMarco: (marcoId: string) => void;
  onAddPresent: (present: Omit<Present, 'id'>) => void;
  onRemovePresent: (presentId: string) => void;
  onAddCredenciado: (credenciado: Omit<Credenciado, 'id'>) => void;
  onRemoveCredenciado: (credenciadoId: string) => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  routes,
  currentRoute,
  presents,
  credenciados,
  onCreateRoute,
  onSelectRoute,
  onRemoveRoute,
  onRemoveMarco,
  onAddPresent,
  onRemovePresent,
  onAddCredenciado,
  onRemoveCredenciado,
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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold group-data-[collapsible=icon]:hidden">Sistema de Rotas</h1>
          <SidebarTrigger />
        </div>
        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-md group-data-[collapsible=icon]:hidden">
          <p className="text-sm text-green-800">
            Usando OpenStreetMap - mapa gratuito e aberto
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="group-data-[collapsible=icon]:hidden">
          <Tabs defaultValue="routes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="routes" className="gap-2">
                <RouteIcon className="w-4 h-4" />
                Rotas
              </TabsTrigger>
              <TabsTrigger value="presents" className="gap-2">
                <Gift className="w-4 h-4" />
                Presentes
              </TabsTrigger>
              <TabsTrigger value="credenciados" className="gap-2">
                <Store className="w-4 h-4" />
                Credenciados
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="routes" className="space-y-4 mt-4">
              {/* Rotas */}
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center justify-between">
                  <span>Rotas</span>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-6 w-6 p-0">
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
                          <div className="flex items-center justify-between w-full">
                            <SidebarMenuButton
                              onClick={() => onSelectRoute(route)}
                              className={`flex-1 justify-start ${
                                currentRoute?.id === route.id ? 'bg-accent' : ''
                              }`}
                              tooltip={route.name}
                            >
                              <RouteIcon className="w-4 h-4" style={{ color: route.color }} />
                              <span className="truncate">{route.name}</span>
                            </SidebarMenuButton>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onRemoveRoute(route.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
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
                                  <div className="flex items-center space-x-2 min-w-0">
                                    <MapPin 
                                      className={`w-4 h-4 text-white p-0.5 rounded flex-shrink-0 ${getMarcoTypeColor(marco.type)}`}
                                    />
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">{marco.name}</p>
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
            </TabsContent>
            
            <TabsContent value="presents" className="mt-4">
              <PresentManager
                presents={presents}
                onAddPresent={onAddPresent}
                onRemovePresent={onRemovePresent}
              />
            </TabsContent>

            <TabsContent value="credenciados" className="mt-4">
              <CredenciadoManager
                credenciados={credenciados}
                onAddCredenciado={onAddCredenciado}
                onRemoveCredenciado={onRemoveCredenciado}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Versão colapsada - mostra apenas ícones */}
        <div className="group-data-[collapsible=icon]:block hidden">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Rotas">
                    <RouteIcon className="w-4 h-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Presentes">
                    <Gift className="w-4 h-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Credenciados">
                    <Store className="w-4 h-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Instruções */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Como usar</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Crie rotas, presentes e credenciados usando as abas acima</p>
              <p>• Clique com o botão direito no mapa para adicionar elementos</p>
              <p>• Use marcos de Início, Meio e Fim para organizar sua rota</p>
              <p>• Configure presentes e estabelecimentos credenciados</p>
              <p>• Mapa powered by OpenStreetMap</p>
            </CardContent>
          </Card>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default MapSidebar;
