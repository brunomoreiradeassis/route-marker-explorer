
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Route, Marco } from '../types/map';
import MapContextMenu from './MapContextMenu';
import { useToast } from '@/hooks/use-toast';
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
}

const MapView: React.FC<MapViewProps> = ({
  currentRoute,
  onAddMarco,
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
  const [routePath, setRoutePath] = useState<L.Polyline | null>(null);
  const { toast } = useToast();

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

  // Atualiza marcadores quando a rota atual muda
  useEffect(() => {
    if (!map.current || !currentRoute) return;

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

    // Desenha linha da rota se houver pelo menos 2 marcos
    if (currentRoute.marcos.length >= 2) {
      const sortedMarcos = [...currentRoute.marcos].sort((a, b) => {
        const order = { inicio: 0, meio: 1, fim: 2 };
        return order[a.type] - order[b.type];
      });

      const coordinates: [number, number][] = sortedMarcos.map((marco) => [marco.lat, marco.lng]);

      const polyline = L.polyline(coordinates, { 
        color: currentRoute.color, 
        weight: 4 
      }).addTo(map.current!);

      setRoutePath(polyline);

      // Ajusta o zoom para mostrar todos os marcos
      const group = new L.FeatureGroup(newMarkers);
      map.current!.fitBounds(group.getBounds(), { padding: [20, 20] });
    } else if (currentRoute.marcos.length === 1) {
      map.current!.setView([currentRoute.marcos[0].lat, currentRoute.marcos[0].lng], 16);
    }
  }, [currentRoute]);

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

  // Atualiza marcadores quando a rota atual muda
  useEffect(() => {
    if (!map.current || !currentRoute) return;

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

    // Desenha linha da rota se houver pelo menos 2 marcos
    if (currentRoute.marcos.length >= 2) {
      const sortedMarcos = [...currentRoute.marcos].sort((a, b) => {
        const order = { inicio: 0, meio: 1, fim: 2 };
        return order[a.type] - order[b.type];
      });

      const coordinates: [number, number][] = sortedMarcos.map((marco) => [marco.lat, marco.lng]);

      const polyline = L.polyline(coordinates, { 
        color: currentRoute.color, 
        weight: 4 
      }).addTo(map.current!);

      setRoutePath(polyline);

      // Ajusta o zoom para mostrar todos os marcos
      const group = new L.FeatureGroup(newMarkers);
      map.current!.fitBounds(group.getBounds(), { padding: [20, 20] });
    } else if (currentRoute.marcos.length === 1) {
      map.current!.setView([currentRoute.marcos[0].lat, currentRoute.marcos[0].lng], 16);
    }
  }, [currentRoute]);

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
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MapView;
