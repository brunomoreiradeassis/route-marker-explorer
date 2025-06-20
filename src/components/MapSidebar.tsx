import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Plus, 
  MapPin, 
  Gift, 
  Store, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  BarChart3,
  Settings,
  Info,
  Navigation
} from 'lucide-react';
import { Route, Present, Credenciado } from '../types/map';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';
import UserSettings from './UserSettings';
import RouteDetailsModal from './RouteDetailsModal';

interface MapSidebarProps {
  routes: Route[];
  currentRoute: Route | null;
  presents: Present[];
  credenciados: Credenciado[];
  onCreateRoute: (name: string) => void;
  onSelectRoute: (route: Route) => void;
  onSelectPresent: (present: Present) => void;
  onSelectCredenciado: (credenciado: Credenciado) => void;
  onRemoveRoute: (routeId: string) => void;
  onRemoveMarco: (marcoId: string) => void;
  onAddPresent: (present: Omit<Present, 'id'>) => void;
  onRemovePresent: (presentId: string) => void;
  onAddCredenciado: (credenciado: Omit<Credenciado, 'id'>) => void;
  onRemoveCredenciado: (credenciadoId: string) => void;
  onUpdateRoute: (routeId: string, route: Partial<Route>) => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  routes,
  currentRoute,
  presents,
  credenciados,
  onCreateRoute,
  onSelectRoute,
  onSelectPresent,
  onSelectCredenciado,
  onRemoveRoute,
  onRemoveMarco,
  onAddPresent,
  onRemovePresent,
  onAddCredenciado,
  onRemoveCredenciado,
  onUpdateRoute,
}) => {
  const [newRouteName, setNewRouteName] = useState('');
  const [showNewRouteForm, setShowNewRouteForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [routesOpen, setRoutesOpen] = useState(true);
  const [presentsOpen, setPresentsOpen] = useState(true);
  const [credenciadosOpen, setCredenciadosOpen] = useState(true);
  const [selectedRouteForDetails, setSelectedRouteForDetails] = useState<Route | null>(null);
  const isMobile = useIsMobile();
  const { state } = useSidebar();

  const handleCreateRoute = () => {
    if (newRouteName.trim()) {
      onCreateRoute(newRouteName.trim());
      setNewRouteName('');
      setShowNewRouteForm(false);
    }
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      const choice = confirm(`Abrir "${name}" em:\n\nOK = Google Maps\nCancelar = Waze`);
      if (choice) {
        const googleMapsApp = `comgooglemaps://?q=${lat},${lng}&zoom=16`;
        const googleMapsWeb = `https://www.google.com/maps?q=${lat},${lng}&zoom=16`;
        window.open(googleMapsApp);
        setTimeout(() => window.open(googleMapsWeb), 500);
      } else {
        const wazeApp = `waze://?ll=${lat},${lng}&navigate=yes`;
        window.open(wazeApp);
        setTimeout(() => window.open(googleMapsWeb), 500);
      }
    } else {
      window.open(`https://www.google.com/maps?q=${lat},${lng}&zoom=16`, '_blank');
    }
  };

  const isCollapsed = state === 'collapsed';

  if (activeTab === 'settings') {
    return (
      <Sidebar collapsible="icon" className={`${isMobile ? 'w-full sm:w-80' : 'w-80'} border-r`}>
        <SidebarHeader className="p-2 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            {!isCollapsed && <h2 className="text-sm sm:text-lg font-semibold truncate">Configurações</h2>}
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          {!isCollapsed && <UserSettings />}
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <>
      <Sidebar collapsible="icon" className={`${isMobile ? 'w-full sm:w-80' : 'w-80'} border-r`}>
        <SidebarHeader className="p-2 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            {!isCollapsed && <h2 className="text-sm sm:text-lg font-semibold truncate">Mapa Interativo</h2>}
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        
        <SidebarContent className="p-0">
          {!isCollapsed ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'm-2 mb-1' : 'm-4 mb-2'}`}>
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
                <TabsTrigger value="manage" className="text-xs sm:text-sm">Gerenciar</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm">Config</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className={`mt-0 ${isMobile ? 'p-2' : 'p-4'} space-y-2 sm:space-y-4`}>
                {/* Rotas Section */}
                <Collapsible open={routesOpen} onOpenChange={setRoutesOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium text-xs sm:text-sm">Rotas ({routes.length})</span>
                    </div>
                    {routesOpen ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 sm:space-y-2 mt-1 sm:mt-2">
                    {!showNewRouteForm ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewRouteForm(true)}
                        className="w-full mb-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Nova Rota
                      </Button>
                    ) : (
                      <div className="space-y-2 mb-2 p-2 border rounded-lg">
                        <Input
                          placeholder="Nome da rota"
                          value={newRouteName}
                          onChange={(e) => setNewRouteName(e.target.value)}
                          className="text-xs"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleCreateRoute} className="flex-1 text-xs">
                            Criar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setShowNewRouteForm(false)}
                            className="flex-1 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                    <ScrollArea className={`${isMobile ? 'max-h-32' : 'max-h-48'}`}>
                      {routes.map((route) => (
                        <Card 
                          key={route.id} 
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            currentRoute?.id === route.id ? 'border-primary bg-primary/5' : ''
                          } mb-1 sm:mb-2`}
                          onClick={() => onSelectRoute(route)}
                        >
                          <CardContent className="p-2 sm:p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div 
                                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0" 
                                  style={{ backgroundColor: route.color }}
                                />
                                <div className="min-w-0">
                                  <span className="text-xs sm:text-sm font-medium truncate block">{route.name}</span>
                                  {route.valorProposto && route.valorProposto > 0 && (
                                    <span className="text-[10px] sm:text-xs text-green-600 block">
                                      R$ {route.valorProposto.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-auto">
                                  {route.marcos.length} marcos
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRouteForDetails(route);
                                  }}
                                  title="Detalhes"
                                >
                                  <Info className="h-2 w-2 sm:h-3 sm:w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveRoute(route.id);
                                  }}
                                >
                                  <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {routes.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-xs">
                          Nenhuma rota criada ainda
                        </div>
                      )}
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible open={presentsOpen} onOpenChange={setPresentsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium text-xs sm:text-sm">Presentes ({presents.length})</span>
                    </div>
                    {presentsOpen ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 sm:space-y-2 mt-1 sm:mt-2">
                    <ScrollArea className={`${isMobile ? 'max-h-32' : 'max-h-48'}`}>
                      {presents.map((present) => (
                        <Card 
                          key={present.id} 
                          className="hover:bg-muted/50 mb-1 sm:mb-2 cursor-pointer"
                          onClick={() => onSelectPresent(present)}
                        >
                          <CardContent className="p-2 sm:p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs sm:text-sm flex-shrink-0">{present.collected ? '✅' : '🎁'}</span>
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-medium truncate">{present.name}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{present.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openInMaps(present.lat, present.lng, present.name);
                                  }}
                                  title="Abrir no mapa"
                                >
                                  <Navigation className="h-2 w-2 sm:h-3 sm:w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemovePresent(present.id);
                                  }}
                                >
                                  <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {presents.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-xs">
                          Nenhum presente criado ainda
                        </div>
                      )}
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible open={credenciadosOpen} onOpenChange={setCredenciadosOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Store className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium text-xs sm:text-sm">Credenciados ({credenciados.length})</span>
                    </div>
                    {credenciadosOpen ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 sm:space-y-2 mt-1 sm:mt-2">
                    <ScrollArea className={`${isMobile ? 'max-h-32' : 'max-h-48'}`}>
                      {credenciados.map((credenciado) => (
                        <Card 
                          key={credenciado.id} 
                          className="hover:bg-muted/50 mb-1 sm:mb-2 cursor-pointer"
                          onClick={() => onSelectCredenciado(credenciado)}
                        >
                          <CardContent className="p-2 sm:p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs sm:text-sm flex-shrink-0">🏪</span>
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-medium truncate">{credenciado.name}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                    {credenciado.type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openInMaps(credenciado.lat, credenciado.lng, credenciado.name);
                                  }}
                                  title="Abrir no mapa"
                                >
                                  <Navigation className="h-2 w-2 sm:h-3 sm:w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveCredenciado(credenciado.id);
                                  }}
                                >
                                  <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {credenciados.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-xs">
                          Nenhum credenciado criado ainda
                        </div>
                      )}
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>

              <TabsContent value="manage" className="mt-0 h-full">
                <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
                  <p className="text-xs sm:text-sm text-muted-foreground">Funcionalidades de gerenciamento em desenvolvimento...</p>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-2 space-y-4">
              <Button
                variant={activeTab === 'overview' ? "default" : "ghost"}
                size="sm"
                className="w-full p-2"
                onClick={() => setActiveTab('overview')}
                title="Visão Geral"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTab === 'settings' ? "default" : "ghost"}
                size="sm"
                className="w-full p-2"
                onClick={() => setActiveTab('settings')}
                title="Configurações"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Separator />
              <div className="space-y-2">
                <div className="flex flex-col items-center gap-1" title={`Rotas (${routes.length})`}>
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">{routes.length}</span>
                </div>
                <div className="flex flex-col items-center gap-1" title={`Presentes (${presents.length})`}>
                  <Gift className="h-4 w-4" />
                  <span className="text-xs">{presents.length}</span>
                </div>
                <div className="flex flex-col items-center gap-1" title={`Credenciados (${credenciados.length})`}>
                  <Store className="h-4 w-4" />
                  <span className="text-xs">{credenciados.length}</span>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>
      </Sidebar>

      <RouteDetailsModal
        isOpen={selectedRouteForDetails !== null}
        onClose={() => setSelectedRouteForDetails(null)}
        route={selectedRouteForDetails}
        onSave={onUpdateRoute}
      />
    </>
  );
};

export default MapSidebar;
