
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import MapSidebar from './MapSidebar';
import MapView from './MapView';
import { Route, Marco } from '../types/map';
import { useToast } from '@/hooks/use-toast';

const MapContainer = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const { toast } = useToast();

  // Carrega dados do localStorage
  useEffect(() => {
    const savedRoutes = localStorage.getItem('map-routes');
    
    if (savedRoutes) {
      try {
        const parsedRoutes = JSON.parse(savedRoutes);
        setRoutes(parsedRoutes);
        if (parsedRoutes.length > 0) {
          setCurrentRoute(parsedRoutes[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar rotas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar rotas salvas",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Salva dados no localStorage
  const saveData = (newRoutes: Route[]) => {
    try {
      localStorage.setItem('map-routes', JSON.stringify(newRoutes));
      setRoutes(newRoutes);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados",
        variant: "destructive"
      });
    }
  };

  const createNewRoute = (name: string) => {
    const newRoute: Route = {
      id: Date.now().toString(),
      name,
      marcos: [],
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
    };
    
    const newRoutes = [...routes, newRoute];
    saveData(newRoutes);
    setCurrentRoute(newRoute);
    
    toast({
      title: "Sucesso",
      description: `Rota "${name}" criada com sucesso!`
    });
  };

  const selectRoute = (route: Route) => {
    setCurrentRoute(route);
  };

  const addMarco = (marco: Omit<Marco, 'id'>) => {
    if (!currentRoute) {
      toast({
        title: "Aviso",
        description: "Selecione uma rota primeiro!",
        variant: "destructive"
      });
      return;
    }

    const newMarco: Marco = {
      ...marco,
      id: Date.now().toString()
    };

    const updatedRoute = {
      ...currentRoute,
      marcos: [...currentRoute.marcos, newMarco]
    };

    const updatedRoutes = routes.map(r => 
      r.id === currentRoute.id ? updatedRoute : r
    );

    saveData(updatedRoutes);
    setCurrentRoute(updatedRoute);

    toast({
      title: "Marco adicionado",
      description: `Marco "${marco.name}" adicionado à rota!`
    });
  };

  const removeMarco = (marcoId: string) => {
    if (!currentRoute) return;

    const updatedRoute = {
      ...currentRoute,
      marcos: currentRoute.marcos.filter(m => m.id !== marcoId)
    };

    const updatedRoutes = routes.map(r => 
      r.id === currentRoute.id ? updatedRoute : r
    );

    saveData(updatedRoutes);
    setCurrentRoute(updatedRoute);

    toast({
      title: "Marco removido",
      description: "Marco removido com sucesso!"
    });
  };

  const removeRoute = (routeId: string) => {
    const updatedRoutes = routes.filter(r => r.id !== routeId);
    saveData(updatedRoutes);
    
    if (currentRoute?.id === routeId) {
      setCurrentRoute(updatedRoutes.length > 0 ? updatedRoutes[0] : null);
    }

    toast({
      title: "Rota removida",
      description: "Rota removida com sucesso!"
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MapSidebar
          routes={routes}
          currentRoute={currentRoute}
          onCreateRoute={createNewRoute}
          onSelectRoute={selectRoute}
          onRemoveRoute={removeRoute}
          onRemoveMarco={removeMarco}
        />
        <SidebarInset className="flex-1">
          <MapView
            currentRoute={currentRoute}
            onAddMarco={addMarco}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MapContainer;
