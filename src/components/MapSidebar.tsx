
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
  SidebarFooter,
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
  Store,
  Settings,
  Map,
  List
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
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('routes');

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
    <Sidebar collapsible="icon" className="border-r" defaultWidth="w-80" collapsedWidth="w-14">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden">Sistema de Rotas</h1>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <div className="group-data-[collapsible=icon]:hidden px-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="gap-2">
                <Map className="w-4 h-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="manage" className="gap-2">
                <Settings className="w-4 h-4" />
                Gerenciar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-2 space-y-4">
              {/* Rotas visíveis */}
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center justify-between">
                  <span>Rotas Ativas</span>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <ScrollArea className="h-32">
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
                    <ScrollArea className="h-32">
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
                            
              {/* Resumo de presentes */}
              <SidebarGroup>
                <SidebarGroupLabel>
                  Presentes
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Total:</p>
                      <Badge>{presents.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm">Coletados:</p>
                      <Badge variant="outline" className="bg-green-100">{presents.filter(p => p.collected).length}</Badge>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
              
              {/* Resumo de credenciados */}
              <SidebarGroup>
                <SidebarGroupLabel>
                  Credenciados
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Total:</p>
                      <Badge>{credenciados.length}</Badge>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>
            
            <TabsContent value="manage" className="mt-2">
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="routes" className="gap-1 text-xs">
                    <RouteIcon className="w-3.5 h-3.5" />
                    Rotas
                  </TabsTrigger>
                  <TabsTrigger value="presents" className="gap-1 text-xs">
                    <Gift className="w-3.5 h-3.5" />
                    Presentes
                  </TabsTrigger>
                  <TabsTrigger value="credenciados" className="gap-1 text-xs">
                    <Store className="w-3.5 h-3.5" />
                    Credenciados
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="routes" className="pt-4 space-y-4">
                  {/* Gerenciar Rotas */}
                  <div className="flex justify-end">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="text-xs">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Nova Rota
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
                  </div>
                  
                  <div className="space-y-2">
                    <ScrollArea className="h-96">
                      {routes.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">
                          Nenhuma rota criada. Clique em "Nova Rota" para criar.
                        </p>
                      ) : (
                        routes.map((route) => (
                          <Card key={route.id} className="mb-2">
                            <CardHeader className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }}></div>
                                  <CardTitle className="text-sm">{route.name}</CardTitle>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    onClick={() => onSelectRoute(route)}
                                  >
                                    Selecionar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 w-7 p-0"
                                    onClick={() => onRemoveRoute(route.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <p className="text-xs text-muted-foreground">
                                {route.marcos.length} marcos | 
                                {route.marcos.filter(m => m.type === 'inicio').length} início | 
                                {route.marcos.filter(m => m.type === 'meio').length} meio | 
                                {route.marcos.filter(m => m.type === 'fim').length} fim
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="presents" className="pt-4">
                  <PresentManager
                    presents={presents}
                    onAddPresent={onAddPresent}
                    onRemovePresent={onRemovePresent}
                  />
                </TabsContent>

                <TabsContent value="credenciados" className="pt-4">
                  <CredenciadoManager
                    credenciados={credenciados}
                    onAddCredenciado={onAddCredenciado}
                    onRemoveCredenciado={onRemoveCredenciado}
                  />
                </TabsContent>
              </Tabs>
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
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Gerenciar">
                    <Settings className="w-4 h-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Como usar</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 p-3 pt-0">
            <p>• Crie rotas, presentes e credenciados usando o menu Gerenciar</p>
            <p>• Clique com o botão direito no mapa para adicionar elementos</p>
            <p>• Use marcos de Início, Meio e Fim para organizar sua rota</p>
            <p>• Configure presentes e estabelecimentos credenciados</p>
          </CardContent>
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
};

export default MapSidebar;
