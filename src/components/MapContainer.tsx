
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import MapSidebar from './MapSidebar';
import MapView from './MapView';
import { Route, Marco, Present, Credenciado } from '../types/map';
import { useToast } from '@/hooks/use-toast';

const MapContainer = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [presents, setPresents] = useState<Present[]>([]);
  const [credenciados, setCredenciados] = useState<Credenciado[]>([]);
  const { toast } = useToast();

  // Carrega dados do localStorage
  useEffect(() => {
    const savedRoutes = localStorage.getItem('map-routes');
    const savedPresents = localStorage.getItem('map-presents');
    const savedCredenciados = localStorage.getItem('map-credenciados');
    
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

    if (savedPresents) {
      try {
        const parsedPresents = JSON.parse(savedPresents);
        setPresents(parsedPresents);
      } catch (error) {
        console.error('Erro ao carregar presentes:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar presentes salvos",
          variant: "destructive"
        });
      }
    }

    if (savedCredenciados) {
      try {
        const parsedCredenciados = JSON.parse(savedCredenciados);
        setCredenciados(parsedCredenciados);
      } catch (error) {
        console.error('Erro ao carregar credenciados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar credenciados salvos",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Salva dados no localStorage
  const saveData = (newRoutes: Route[], newPresents?: Present[], newCredenciados?: Credenciado[]) => {
    try {
      localStorage.setItem('map-routes', JSON.stringify(newRoutes));
      setRoutes(newRoutes);
      
      if (newPresents) {
        localStorage.setItem('map-presents', JSON.stringify(newPresents));
        setPresents(newPresents);
      }
      
      if (newCredenciados) {
        localStorage.setItem('map-credenciados', JSON.stringify(newCredenciados));
        setCredenciados(newCredenciados);
      }
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

  const addPresent = (present: Omit<Present, 'id'>) => {
    const newPresent: Present = {
      ...present,
      id: Date.now().toString(),
      collected: false
    };

    const newPresents = [...presents, newPresent];
    saveData(routes, newPresents);

    toast({
      title: "Presente adicionado",
      description: `Presente "${present.name}" adicionado ao mapa!`
    });
  };

  const removePresent = (presentId: string) => {
    const updatedPresents = presents.filter(p => p.id !== presentId);
    saveData(routes, updatedPresents);

    toast({
      title: "Presente removido",
      description: "Presente removido com sucesso!"
    });
  };

  const addCredenciado = (credenciado: Omit<Credenciado, 'id'>) => {
    const newCredenciado: Credenciado = {
      ...credenciado,
      id: Date.now().toString(),
    };

    const newCredenciados = [...credenciados, newCredenciado];
    saveData(routes, presents, newCredenciados);

    toast({
      title: "Credenciado adicionado",
      description: `Estabelecimento "${credenciado.name}" adicionado ao mapa!`
    });
  };

  const removeCredenciado = (credenciadoId: string) => {
    const updatedCredenciados = credenciados.filter(c => c.id !== credenciadoId);
    saveData(routes, presents, updatedCredenciados);

    toast({
      title: "Credenciado removido",
      description: "Estabelecimento removido com sucesso!"
    });
  };

  const collectPresent = (presentId: string) => {
    const updatedPresents = presents.map(p => 
      p.id === presentId ? { ...p, collected: true } : p
    );
    
    saveData(routes, updatedPresents);
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

  const updateMarco = (updatedMarco: Marco) => {
    if (!currentRoute) return;

    const updatedRoute = {
      ...currentRoute,
      marcos: currentRoute.marcos.map(m => 
        m.id === updatedMarco.id ? updatedMarco : m
      )
    };

    const updatedRoutes = routes.map(r => 
      r.id === currentRoute.id ? updatedRoute : r
    );

    saveData(updatedRoutes);
    setCurrentRoute(updatedRoute);
  };

  const updatePresent = (updatedPresent: Present) => {
    const updatedPresents = presents.map(p => 
      p.id === updatedPresent.id ? updatedPresent : p
    );
    
    saveData(routes, updatedPresents);
  };

  const updateCredenciado = (updatedCredenciado: Credenciado) => {
    const updatedCredenciados = credenciados.map(c => 
      c.id === updatedCredenciado.id ? updatedCredenciado : c
    );
    
    saveData(routes, presents, updatedCredenciados);
  };

  const cloneMarco = (marco: Marco) => {
    if (!currentRoute) return;

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

    const updatedRoutes = routes.map(r => 
      r.id === currentRoute.id ? updatedRoute : r
    );

    saveData(updatedRoutes);
    setCurrentRoute(updatedRoute);

    toast({
      title: "Marco clonado",
      description: `Marco "${newMarco.name}" criado com sucesso!`
    });
  };

  const clonePresent = (present: Present) => {
    const newPresent: Present = {
      ...present,
      id: Date.now().toString(),
      name: `${present.name} (Cópia)`,
      lat: present.lat + 0.0001, // Pequeno offset para não sobrepor
      lng: present.lng + 0.0001,
      collected: false
    };

    const newPresents = [...presents, newPresent];
    saveData(routes, newPresents);

    toast({
      title: "Presente clonado",
      description: `Presente "${newPresent.name}" criado com sucesso!`
    });
  };

  const cloneCredenciado = (credenciado: Credenciado) => {
    const newCredenciado: Credenciado = {
      ...credenciado,
      id: Date.now().toString(),
      name: `${credenciado.name} (Cópia)`,
      lat: credenciado.lat + 0.0001, // Pequeno offset para não sobrepor
      lng: credenciado.lng + 0.0001
    };

    const newCredenciados = [...credenciados, newCredenciado];
    saveData(routes, presents, newCredenciados);

    toast({
      title: "Credenciado clonado",
      description: `Credenciado "${newCredenciado.name}" criado com sucesso!`
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MapSidebar
          routes={routes}
          currentRoute={currentRoute}
          presents={presents}
          credenciados={credenciados}
          onCreateRoute={createNewRoute}
          onSelectRoute={selectRoute}
          onRemoveRoute={removeRoute}
          onRemoveMarco={removeMarco}
          onAddPresent={addPresent}
          onRemovePresent={removePresent}
          onAddCredenciado={addCredenciado}
          onRemoveCredenciado={removeCredenciado}
        />
        <SidebarInset className="flex-1">
          <MapView
            currentRoute={currentRoute}
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
