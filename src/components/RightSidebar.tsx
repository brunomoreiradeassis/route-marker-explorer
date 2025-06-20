
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
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
  Settings as SettingsIcon,
  Info,
  Navigation,
  Edit
} from 'lucide-react';
import { Route, Present, Credenciado } from '../types/map';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';
import RouteDetailsModal from './RouteDetailsModal';

interface RightSidebarProps {
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

const RightSidebar: React.FC<RightSidebarProps> = ({
  routes,
  currentRoute,
  presents,
  credenciados,
  onCreateRoute,
  onSelectRoute,
  onSelectPresent,
  onSelectCredenciado,
  onRemoveRoute,
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
    const googleMapsWeb = `https://www.google.com/maps?q=${lat},${lng}&zoom=16`;
    
    if (isMobile) {
      const choice = confirm(`Abrir "${name}" em:\n\nOK = Google Maps\nCancelar = Waze`);
      if (choice) {
        const googleMapsApp = `comgooglemaps://?q=${lat},${lng}&zoom=16`;
        window.open(googleMapsApp);
        setTimeout(() => window.open(googleMapsWeb), 500);
      } else {
        const wazeApp = `waze://?ll=${lat},${lng}&navigate=yes`;
        window.open(wazeApp);
        setTimeout(() => window.open(googleMapsWeb), 500);
      }
    } else {
      window.open(googleMapsWeb, '_blank');
    }
  };

  const isCollapsed = state === 'collapsed';

  return (
    <>
      <Sidebar side="right" collapsible="icon" className={`${isMobile ? 'w-full sm:w-80' : 'w-80'} border-l`}>
        <SidebarHeader className="p-2 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <SidebarTrigger className="mr-auto" />
            {!isCollapsed && <h2 className="text-sm sm:text-lg font-semibold truncate">Painel</h2>}
          </div>
        </SidebarHeader>
        
        <SidebarContent className="p-0">
          {!isCollapsed ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'm-2 mb-1' : 'm-4 mb-2'}`}>
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
                <TabsTrigger value="manage" className="text-xs sm:text-sm">Gerenciar</TabsTrigger>
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
                              <div className="flex items-center gap-1">
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

                {/* Presentes e Credenciados - só mostrar contadores na visão geral */}
                <div className="grid grid-cols-2 gap-2">
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Presentes</p>
                        <p className="text-xs text-muted-foreground">{presents.length} itens</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Credenciados</p>
                        <p className="text-xs text-muted-foreground">{credenciados.length} itens</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="manage" className="mt-0 h-full">
                <div className={`${isMobile ? 'p-2' : 'p-4'} space-y-4`}>
                  {/* Gerenciamento de Rotas */}
                  <Collapsible open={routesOpen} onOpenChange={setRoutesOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium text-sm">Gerenciar Rotas</span>
                      </div>
                      {routesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {!showNewRouteForm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewRouteForm(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Rota
                        </Button>
                      ) : (
                        <div className="space-y-2 p-2 border rounded-lg">
                          <Input
                            placeholder="Nome da rota"
                            value={newRouteName}
                            onChange={(e) => setNewRouteName(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleCreateRoute} className="flex-1">
                              Criar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setShowNewRouteForm(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <ScrollArea className="max-h-48">
                        {routes.map((route) => (
                          <div key={route.id} className="flex items-center justify-between p-2 border rounded mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: route.color }}
                              />
                              <span className="text-sm truncate">{route.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => setSelectedRouteForDetails(route)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => onRemoveRoute(route.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />

                  {/* Gerenciamento de Presentes */}
                  <Collapsible open={presentsOpen} onOpenChange={setPresentsOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover: rounded-lg">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        <span className="font-medium text-sm">Gerenciar Presentes</span>
                      </div>
                      {presentsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      <ScrollArea className="max-h-48">
                        {presents.map((present) => (
                          <div key={present.id} className="flex items-center justify-between p-2 border rounded mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm">{present.collected ? '✅' : '🎁'}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{present.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{present.description}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => openInMaps(present.lat, present.lng, present.name)}
                              >
                                <Navigation className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />

                  {/* Gerenciamento de Credenciados */}
                  <Collapsible open={credenciadosOpen} onOpenChange={setCredenciadosOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span className="font-medium text-sm">Gerenciar Credenciados</span>
                      </div>
                      {credenciadosOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      <ScrollArea className="max-h-48">
                        {credenciados.map((credenciado) => (
                          <div key={credenciado.id} className="flex items-center justify-between p-2 border rounded mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm">🏪</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{credenciado.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{credenciado.type}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => openInMaps(credenciado.lat, credenciado.lng, credenciado.name)}
                              >
                                <Navigation className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>
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
                variant={activeTab === 'manage' ? "default" : "ghost"}
                size="sm"
                className="w-full p-2"
                onClick={() => setActiveTab('manage')}
                title="Gerenciar"
              >
                <SettingsIcon className="h-4 w-4" />
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

export default RightSidebar;
