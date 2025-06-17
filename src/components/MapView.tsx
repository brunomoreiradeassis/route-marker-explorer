import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Route, Marco, Present } from '../types/map';
import MapContextMenu from './MapContextMenu';
import RouteInfoCard from './RouteInfoCard';
import StartRaceModal from './StartRaceModal';
import PresentAlert from './PresentAlert';
import { useToast } from '@/hooks/use-toast';
import { useRouting } from '../hooks/useRouting';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  currentRoute: Route | null;
  onAddMarco: (marco: Omit<Marco, 'id'>) => void;
  presents: Present[];
  onAddPresent: (present: Omit<Present, 'id'>) => void;
  onCollectPresent: (presentId: string) => void;
}

const MapView: React.FC<MapViewProps> = ({
  currentRoute,
  onAddMarco,
  presents,
  onAddPresent,
  onCollectPresent,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    lat: number;
    lng: number;
  } | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<L.Marker | null>(null);
  const [routeMarkers, setRouteMarkers] = useState<L.Marker[]>([]);
  const [presentMarkers, setPresentMarkers] = useState<L.Marker[]>([]);
  const [routePath, setRoutePath] = useState<L.Polyline | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showStartRaceModal, setShowStartRaceModal] = useState(false);
  const [raceStarted, setRaceStarted] = useState(false);
  const [nearbyPresent, setNearbyPresent] = useState<Present | null>(null);
  const { toast } = useToast();
  const { routeInfo, isLoading, calculateRoute } = useRouting();

  // Função para calcular distância entre dois pontos
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }, []);

  // Verifica proximidade com presentes
  useEffect(() => {
    if (!currentLocation || !presents.length) return;

    const nearPresent = presents.find(present => {
      if (present.collected) return false;
      
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        present.lat,
        present.lng
      );
      
      return distance <= 15; // 15 metros de proximidade
    });

    if (nearPresent && nearPresent.id !== nearbyPresent?.id) {
      setNearbyPresent(nearPresent);
    } else if (!nearPresent) {
      setNearbyPresent(null);
    }
  }, [currentLocation, presents, nearbyPresent, calculateDistance]);

  // Verifica proximidade com o marco de início
  useEffect(() => {
    if (!currentLocation || !currentRoute || raceStarted || !routeInfo) return;

    const startMarco = currentRoute.marcos.find(marco => marco.type === 'inicio');
    if (!startMarco) return;

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      startMarco.lat,
      startMarco.lng
    );

    // Se estiver dentro de 20 metros do marco de início
    if (distance <= 20 && !showStartRaceModal) {
      setShowStartRaceModal(true);
    }
  }, [currentLocation, currentRoute, raceStarted, routeInfo, showStartRaceModal, calculateDistance]);

  // Inicializa o mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Aguarda um pequeno delay para garantir que o container esteja renderizado
    setTimeout(() => {
      if (!mapContainer.current) return;
      
      map.current = L.map(mapContainer.current, {
        center: [-16.6805776, -49.4375273],
        zoom: 16,
        zoomControl: true,
        attributionControl: true
      });

      // Adiciona tile layer do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map.current);

      // Event listener para clique direito
      map.current.on('contextmenu', (e: L.LeafletMouseEvent) => {
        const containerPoint = map.current!.latLngToContainerPoint(e.latlng);
        setContextMenu({
          x: containerPoint.x,
          y: containerPoint.y,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      });

      // Fecha o menu de contexto ao clicar no mapa
      map.current.on('click', () => {
        setContextMenu(null);
      });

      // Força o redimensionamento do mapa
      setTimeout(() => {
        map.current?.invalidateSize();
      }, 100);

      // Tenta obter localização atual
      getCurrentLocation();
    }, 100);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Atualiza marcadores de presentes
  useEffect(() => {
    if (!map.current) return;

    // Remove marcadores existentes de presentes
    presentMarkers.forEach(marker => marker.remove());

    // Adiciona novos marcadores de presentes
    const newPresentMarkers: L.Marker[] = [];
    presents.forEach((present) => {
      const markerColor = present.collected ? '#94a3b8' : '#eab308'; // cinza se coletado, amarelo se não
      const marker = L.marker([present.lat, present.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px;">🎁</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map.current!);

      marker.bindPopup(`<b>${present.name}</b><br>${present.description}<br>${present.collected ? '<i>Coletado</i>' : '<i>Disponível</i>'}`);
      newPresentMarkers.push(marker);
    });

    setPresentMarkers(newPresentMarkers);
  }, [presents]);

  // Atualiza marcadores e rota quando a rota atual muda
  useEffect(() => {
    if (!map.current || !currentRoute) {
      // Remove marcadores e rotas se não há rota selecionada
      routeMarkers.forEach(marker => marker.remove());
      if (routePath) {
        routePath.remove();
      }
      setRouteMarkers([]);
      setRoutePath(null);
      return;
    }

    // Remove marcadores existentes da rota
    routeMarkers.forEach(marker => marker.remove());
    if (routePath) {
      routePath.remove();
    }

    if (currentRoute.marcos.length === 0) {
      setRouteMarkers([]);
      setRoutePath(null);
      return;
    }

    // Adiciona marcadores
    const newMarkers: L.Marker[] = [];
    currentRoute.marcos.forEach((marco) => {
      const markerColor = getMarcoColor(marco.type);
      const marker = L.marker([marco.lat, marco.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map.current!);

      marker.bindPopup(`<b>${marco.name}</b><br>Tipo: ${getMarcoTypeName(marco.type)}`);
      newMarkers.push(marker);
    });

    setRouteMarkers(newMarkers);

    // Calcula e desenha a rota se houver pelo menos 2 marcos
    if (currentRoute.marcos.length >= 2) {
      calculateRoute(currentRoute.marcos).then((routeData) => {
        if (routeData && map.current) {
          // Remove rota anterior se existir
          if (routePath) {
            routePath.remove();
          }
          
          // Desenha a nova rota usando as coordenadas da API ou linha reta
          const polyline = L.polyline(routeData.geometry, { 
            color: currentRoute.color, 
            weight: 4,
            opacity: 0.8
          }).addTo(map.current!);

          setRoutePath(polyline);

          // Ajusta o zoom para mostrar todos os marcos
          const group = new L.FeatureGroup([...newMarkers, polyline]);
          map.current!.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      });
    } else if (currentRoute.marcos.length === 1) {
      map.current!.setView([currentRoute.marcos[0].lat, currentRoute.marcos[0].lng], 16);
    }
  }, [currentRoute, calculateRoute]);

  const getMarcoColor = (type: Marco['type']) => {
    switch (type) {
      case 'inicio':
        return '#22c55e'; // green-500
      case 'meio':
        return '#f97316'; // orange-500
      case 'fim':
        return '#ef4444'; // red-500
      default:
        return '#3b82f6'; // blue-500
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Localização não suportada",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Atualiza o estado da localização atual
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        if (map.current) {
          map.current.setView([latitude, longitude], 16);

          // Remove marcador anterior se existir
          if (currentLocationMarker) {
            currentLocationMarker.remove();
          }

          // Adiciona novo marcador
          const marker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'current-location-marker',
              html: '<div style="background-color: #22d3ee; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          }).addTo(map.current);

          marker.bindPopup('Minha Localização');
          setCurrentLocationMarker(marker);

          toast({
            title: "Localização encontrada",
            description: `Localização: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
        }
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        toast({
          title: "Erro de localização",
          description: "Não foi possível obter sua localização",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const searchAddress = async () => {
    if (!searchValue.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}&limit=1`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        map.current?.setView([parseFloat(lat), parseFloat(lon)], 16);

        toast({
          title: "Endereço encontrado",
          description: data[0].display_name
        });
      } else {
        toast({
          title: "Endereço não encontrado",
          description: "Tente uma busca mais específica",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Erro ao buscar endereço",
        variant: "destructive"
      });
    }
  };

  const handleAddMarco = useCallback((type: Marco['type']) => {
    if (!contextMenu) return;

    const marcoName = `${getMarcoTypeName(type)} ${Date.now()}`;
    
    onAddMarco({
      name: marcoName,
      type,
      lat: contextMenu.lat,
      lng: contextMenu.lng,
    });

    setContextMenu(null);
  }, [contextMenu, onAddMarco]);

  const handleAddPresent = useCallback(() => {
    if (!contextMenu) return;

    const presentName = `Presente ${Date.now()}`;
    
    onAddPresent({
      name: presentName,
      description: 'Um presente especial te espera aqui!',
      lat: contextMenu.lat,
      lng: contextMenu.lng,
    });

    setContextMenu(null);
  }, [contextMenu, onAddPresent]);

  const handleCollectPresent = useCallback((presentId: string) => {
    onCollectPresent(presentId);
    setNearbyPresent(null);
    
    toast({
      title: "Presente coletado!",
      description: "Você coletou um presente! Continue explorando!",
      variant: "default"
    });
  }, [onCollectPresent, toast]);

  const handleClosePresentAlert = useCallback(() => {
    setNearbyPresent(null);
  }, []);

  const handleCloseStartModal = useCallback(() => {
    setShowStartRaceModal(false);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Barra de busca */}
      <div className="p-2 sm:p-4 border-b bg-background shrink-0">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Input
            placeholder="Digite um endereço para buscar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button onClick={searchAddress} className="flex-1 sm:flex-none">
              Buscar
            </Button>
            <Button variant="outline" onClick={getCurrentLocation} className="flex-1 sm:flex-none whitespace-nowrap">
              Minha Localização
            </Button>
          </div>
        </div>
      </div>

      {/* Container do mapa */}
      <div className="flex-1 relative min-h-0">
        <div 
          ref={mapContainer} 
          className="absolute inset-0 w-full h-full z-0"
          style={{ minHeight: '400px' }}
        />
        
        {/* Menu de contexto */}
        {contextMenu && (
          <MapContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            lat={contextMenu.lat}
            lng={contextMenu.lng}
            onAddMarco={handleAddMarco}
            onAddPresent={handleAddPresent}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Alerta de presente próximo */}
        {nearbyPresent && (
          <PresentAlert
            present={nearbyPresent}
            onCollect={handleCollectPresent}
            onClose={handleClosePresentAlert}
          />
        )}

        {/* Card de informações da rota */}
        {currentRoute && routeInfo && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <RouteInfoCard
              routeName={currentRoute.name}
              distance={routeInfo.distance}
              duration={routeInfo.duration}
              color={currentRoute.color}
            />
          </div>
        )}

        {/* Indicador de carregamento */}
        {isLoading && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 text-center">
              <span className="text-sm text-muted-foreground">Calculando rota...</span>
            </div>
          </div>
        )}

        {/* Modal de início da corrida */}
        {currentRoute && routeInfo && (
          <StartRaceModal
            isOpen={showStartRaceModal}
            onClose={handleCloseStartModal}
            onStartRace={handleStartRace}
            routeName={currentRoute.name}
            distance={routeInfo.distance}
            duration={routeInfo.duration}
            color={currentRoute.color}
          />
        )}
      </div>
    </div>
  );
};

export default MapView;
