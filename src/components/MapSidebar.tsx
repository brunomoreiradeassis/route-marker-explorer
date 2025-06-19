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
import { Textarea } from '@/components/ui/textarea';
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
  Eye,
  EyeOff
} from 'lucide-react';
import { Route, Marco, Present, Credenciado } from '../types/map';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [showNewRouteForm, setShowNewRouteForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [routesOpen, setRoutesOpen] = useState(true);
  const [presentsOpen, setPresentsOpen] = useState(true);
  const [credenciadosOpen, setCredenciadosOpen] = useState(true);
  const isMobile = useIsMobile();

  const handleCreateRoute = () => {
    if (newRouteName.trim()) {
      onCreateRoute(newRouteName.trim());
      setNewRouteName('');
      setShowNewRouteForm(false);
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

  const getCredenciadoTypeName = (type: string) => {
    switch (type) {
      case 'restaurante':
        return 'Restaurante';
      case 'posto':
        return 'Posto de Gasolina';
      case 'farmacia':
        return 'Farmácia';
      case 'supermercado':
        return 'Supermercado';
      case 'hotel':
        return 'Hotel';
      case 'pousada':
        return 'Pousada';
      case 'academia':
        return 'Academia';
      default:
        return 'Estabelecimento';
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className={`${isMobile ? 'w-full sm:w-80' : 'w-80'} border-r`}
    >
      <SidebarHeader className="p-2 sm:p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-lg font-semibold truncate">Mapa Interativo</h2>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-0">
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
                        currentRoute?.id === route.id ? 'border-primary' : ''
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
                            <span className="text-xs sm:text-sm font-medium truncate">{route.name}</span>
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
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Presentes Section */}
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
                    <Card key={present.id} className="hover:bg-muted/50 mb-1 sm:mb-2">
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs sm:text-sm flex-shrink-0">{present.collected ? '✅' : '🎁'}</span>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate">{present.name}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{present.description}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                            onClick={() => onRemovePresent(present.id)}
                          >
                            <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Credenciados Section */}
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
                    <Card key={credenciado.id} className="hover:bg-muted/50 mb-1 sm:mb-2">
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs sm:text-sm flex-shrink-0">🏪</span>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate">{credenciado.name}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                {getCredenciadoTypeName(credenciado.type)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                            onClick={() => onRemoveCredenciado(credenciado.id)}
                          >
                            <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="manage" className="mt-0 h-full">
            {/* Manage content will be implemented here */}
            <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
              <p className="text-xs sm:text-sm text-muted-foreground">Funcionalidades de gerenciamento em desenvolvimento...</p>
            </div>
          </TabsContent>
        </Tabs>
      </SidebarContent>
    </Sidebar>
  );
};

export default MapSidebar;
