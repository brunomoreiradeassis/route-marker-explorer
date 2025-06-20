import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import MapSidebar from './MapSidebar';
import MapView from './MapView';
import { Route, Marco, Present, Credenciado } from '../types/map';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const MapContainer = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [presents, setPresents] = useState<Present[]>([]);
  const [credenciados, setCredenciados] = useState<Credenciado[]>([]);
  const [selectedElement, setSelectedElement] = useState<{
    type: 'route' | 'present' | 'credenciado';
    data: Route | Present | Credenciado;
  } | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { currentUser, logout } = useAuth();
  const [firestoreService, setFirestoreService] = useState<FirestoreService | null>(null);

  useEffect(() => {
    if (currentUser) {
      const service = new FirestoreService(currentUser.uid);
      setFirestoreService(service);
      
      // Load initial data
      loadData(service);
      
      // Set up real-time listeners
      const unsubscribeRoutes = service.subscribeToRoutes(setRoutes);
      const unsubscribePresents = service.subscribeToPresents(setPresents);
      const unsubscribeCredenciados = service.subscribeToCredenciados(setCredenciados);
      
      return () => {
        unsubscribeRoutes();
        unsubscribePresents();
        unsubscribeCredenciados();
      };
    }
  }, [currentUser]);

  const loadData = async (service: FirestoreService) => {
    try {
      const [routesData, presentsData, credenciadosData] = await Promise.all([
        service.getRoutes(),
        service.getPresents(),
        service.getCredenciados()
      ]);
      
      setRoutes(routesData);
      setPresents(presentsData);
      setCredenciados(credenciadosData);
      
      if (routesData.length > 0) {
        setCurrentRoute(routesData[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do servidor",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  const createNewRoute = async (name: string) => {
    if (!firestoreService) return;
    
    try {
      const newRoute: Omit<Route, 'id'> = {
        name,
        marcos: [],
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
      };
      
      await firestoreService.addRoute(newRoute);
      
      toast({
        title: "Sucesso",
        description: `Rota "${name}" criada com sucesso!`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar rota",
        variant: "destructive"
      });
    }
  };

  const selectRoute = (route: Route) => {
    setCurrentRoute(route);
    setSelectedElement({ type: 'route', data: route });
  };

  const selectPresent = (present: Present) => {
    setSelectedElement({ type: 'present', data: present });
  };

  const selectCredenciado = (credenciado: Credenciado) => {
    setSelectedElement({ type: 'credenciado', data: credenciado });
  };

  const addMarco = async (marco: Omit<Marco, 'id'>) => {
    if (!currentRoute || !firestoreService) {
      toast({
        title: "Aviso",
        description: "Selecione uma rota primeiro!",
        variant: "destructive"
      });
      return;
    }

    try {
      const newMarco: Marco = {
        ...marco,
        id: Date.now().toString()
      };

      const updatedRoute = {
        ...currentRoute,
        marcos: [...currentRoute.marcos, newMarco]
      };

      await firestoreService.updateRoute(currentRoute.id, updatedRoute);
      setCurrentRoute(updatedRoute);

      toast({
        title: "Marco adicionado",
        description: `Marco "${marco.name}" adicionado à rota!`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar marco",
        variant: "destructive"
      });
    }
  };

  const addPresent = async (present: Omit<Present, 'id'>) => {
    if (!firestoreService) return;
    
    try {
      const newPresent: Omit<Present, 'id'> = {
        ...present,
        collected: false
      };

      await firestoreService.addPresent(newPresent);

      toast({
        title: "Presente adicionado",
        description: `Presente "${present.name}" adicionado ao mapa!`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar presente",
        variant: "destructive"
      });
    }
  };

  const removePresent = async (presentId: string) => {
    if (!firestoreService) return;
    
    try {
      await firestoreService.deletePresent(presentId);
      toast({
        title: "Presente removido",
        description: "Presente removido com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover presente",
        variant: "destructive"
      });
    }
  };

  const addCredenciado = async (credenciado: Omit<Credenciado, 'id'>) => {
    if (!firestoreService) return;
    
    try {
      await firestoreService.addCredenciado(credenciado);

      toast({
        title: "Credenciado adicionado",
        description: `Estabelecimento "${credenciado.name}" adicionado ao mapa!`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar credenciado",
        variant: "destructive"
      });
    }
  };

  const removeCredenciado = async (credenciadoId: string) => {
    if (!firestoreService) return;
    
    try {
      await firestoreService.deleteCredenciado(credenciadoId);
      toast({
        title: "Credenciado removido",
        description: "Estabelecimento removido com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover credenciado",
        variant: "destructive"
      });
    }
  };

  const collectPresent = async (presentId: string) => {
    if (!firestoreService) return;
    
    try {
      await firestoreService.updatePresent(presentId, { collected: true });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao coletar presente",
        variant: "destructive"
      });
    }
  };

  const removeMarco = async (marcoId: string) => {
    if (!currentRoute || !firestoreService) return;

    try {
      const updatedRoute = {
        ...currentRoute,
        marcos: currentRoute.marcos.filter(m => m.id !== marcoId)
      };

      await firestoreService.updateRoute(currentRoute.id, updatedRoute);
      setCurrentRoute(updatedRoute);

      toast({
        title: "Marco removido",
        description: "Marco removido com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover marco",
        variant: "destructive"
      });
    }
  };

  const removeRoute = async (routeId: string) => {
    if (!firestoreService) return;
    
    try {
      await firestoreService.deleteRoute(routeId);
      
      if (currentRoute?.id === routeId) {
        const remainingRoutes = routes.filter(r => r.id !== routeId);
        setCurrentRoute(remainingRoutes.length > 0 ? remainingRoutes[0] : null);
      }

      toast({
        title: "Rota removida",
        description: "Rota removida com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover rota",
        variant: "destructive"
      });
    }
  };

  const updateMarco = async (updatedMarco: Marco) => {
    if (!currentRoute || !firestoreService) return;

    try {
      const updatedRoute = {
        ...currentRoute,
        marcos: currentRoute.marcos.map(m =>
          m.id === updatedMarco.id ? updatedMarco : m
        )
      };

      await firestoreService.updateRoute(currentRoute.id, updatedRoute);
      setCurrentRoute(updatedRoute);

      toast({
        title: "Marco atualizado",
        description: "Marco atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar marco",
        variant: "destructive"
      });
    }
  };

  const updatePresent = async (updatedPresent: Present) => {
    if (!firestoreService) return;

    try {
      await firestoreService.updatePresent(updatedPresent.id, updatedPresent);

      toast({
        title: "Presente atualizado",
        description: "Presente atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar presente",
        variant: "destructive"
      });
    }
  };

  const updateCredenciado = async (updatedCredenciado: Credenciado) => {
    if (!firestoreService) return;

    try {
      await firestoreService.updateCredenciado(updatedCredenciado.id, updatedCredenciado);

      toast({
        title: "Credenciado atualizado",
        description: "Credenciado atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar credenciado",
        variant: "destructive"
      });
    }
  };

  const cloneMarco = async (marco: Marco) => {
    if (!currentRoute || !firestoreService) return;

    try {
      const newMarco: Marco = {
        ...marco,
        id: Date.now().toString(),
        name: `${marco.name} (Cópia)`,
        lat: marco.lat + 0.0001, // Pequeno offset para não sobrepor
        lng: marco.lng + 0.0001
      };

      const updatedRoute = {
        ...currentRoute,
        marcos: [...currentRoute.marcos, newMarco]
      };

      await firestoreService.updateRoute(currentRoute.id, updatedRoute);
      setCurrentRoute(updatedRoute);

      toast({
        title: "Marco clonado",
        description: `Marco "${newMarco.name}" criado com sucesso!`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao clonar marco",
        variant: "destructive"
      });
    }
  };

  const clonePresent = async (present: Present) => {
    if (!firestoreService) return;

    try {
      const newPresent: Omit<Present, 'id'> = {
        ...present,
        name: `${present.name} (Cópia)`,
        description: present.description,
        type: present.type,
        lat: present.lat + 0.0001, // Pequeno offset para não sobrepor
        lng: present.lng + 0.0001,
        collected: false,
        value: present.value
      };

      await firestoreService.addPresent(newPresent);

      toast({
        title: "Presente clonado",
        description: `Presente "${newPresent.name}" criado com sucesso!`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao clonar presente",
        variant: "destructive"
      });
    }
  };

  const cloneCredenciado = async (credenciado: Credenciado) => {
    if (!firestoreService) return;

    try {
      const newCredenciado: Omit<Credenciado, 'id'> = {
        ...credenciado,
        name: `${credenciado.name} (Cópia)`,
        description: credenciado.description,
        type: credenciado.type,
        lat: credenciado.lat + 0.0001, // Pequeno offset para não sobrepor
        lng: credenciado.lng + 0.0001,
        discount: credenciado.discount,
        phone: credenciado.phone,
        address: credenciado.address
      };

      await firestoreService.addCredenciado(newCredenciado);

      toast({
        title: "Credenciado clonado",
        description: `Credenciado "${newCredenciado.name}" criado com sucesso!`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao clonar credenciado",
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full relative">
        <MapSidebar
          routes={routes}
          currentRoute={currentRoute}
          presents={presents}
          credenciados={credenciados}
          onCreateRoute={createNewRoute}
          onSelectRoute={selectRoute}
          onSelectPresent={selectPresent}
          onSelectCredenciado={selectCredenciado}
          onRemoveRoute={removeRoute}
          onRemoveMarco={removeMarco}
          onAddPresent={addPresent}
          onRemovePresent={removePresent}
          onAddCredenciado={addCredenciado}
          onRemoveCredenciado={removeCredenciado}
        />
        <SidebarInset className="flex-1 w-full">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
          <MapView
            currentRoute={currentRoute}
            selectedElement={selectedElement}
            onAddMarco={addMarco}
            presents={presents}
            credenciados={credenciados}
            onAddPresent={addPresent}
            onAddCredenciado={addCredenciado}
            onCollectPresent={collectPresent}
            onUpdateMarco={updateMarco}
            onUpdatePresent={updatePresent}
            onUpdateCredenciado={updateCredenciado}
            onDeleteMarco={removeMarco}
            onDeletePresent={removePresent}
            onDeleteCredenciado={removeCredenciado}
            onCloneMarco={cloneMarco}
            onClonePresent={clonePresent}
            onCloneCredenciado={cloneCredenciado}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MapContainer;
