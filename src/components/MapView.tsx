
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Route, Marco } from '../types/map';
import MapContextMenu from './MapContextMenu';
import { useToast } from '@/hooks/use-toast';

interface MapViewProps {
  currentRoute: Route | null;
  onAddMarco: (marco: Omit<Marco, 'id'>) => void;
  mapboxToken: string;
}

const MapView: React.FC<MapViewProps> = ({
  currentRoute,
  onAddMarco,
  mapboxToken,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    lat: number;
    lng: number;
  } | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<any>(null);
  const { toast } = useToast();

  // Inicializa o mapa
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = mapboxToken;

      map.current = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-49.4375273, -16.6805776], // Coordenadas do código Python
        zoom: 16,
      });

      // Adiciona controles de navegação
      map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      // Event listener para clique direito
      map.current.on('contextmenu', (e: any) => {
        e.preventDefault();
        const { point, lngLat } = e;
        setContextMenu({
          x: point.x,
          y: point.y,
          lat: lngLat.lat,
          lng: lngLat.lng,
        });
      });

      // Fecha o menu de contexto ao clicar no mapa
      map.current.on('click', () => {
        setContextMenu(null);
      });

      // Tenta obter localização atual
      getCurrentLocation();
    }).catch((error) => {
      console.error('Erro ao carregar Mapbox:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar o mapa. Verifique o token do Mapbox.",
        variant: "destructive"
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Atualiza marcadores quando a rota atual muda
  useEffect(() => {
    if (!map.current || !currentRoute) return;

    // Remove marcadores existentes da rota
    if (map.current.getSource('route-markers')) {
      map.current.removeLayer('route-markers');
      map.current.removeSource('route-markers');
    }
    if (map.current.getSource('route-line')) {
      map.current.removeLayer('route-line');
      map.current.removeSource('route-line');
    }

    if (currentRoute.marcos.length === 0) return;

    // Adiciona marcadores
    const features = currentRoute.marcos.map((marco) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [marco.lng, marco.lat],
      },
      properties: {
        title: marco.name,
        type: marco.type,
        color: getMarcoColor(marco.type),
      },
    }));

    map.current.addSource('route-markers', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    });

    map.current.addLayer({
      id: 'route-markers',
      type: 'circle',
      source: 'route-markers',
      paint: {
        'circle-radius': 8,
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Adiciona labels
    map.current.addLayer({
      id: 'route-markers-labels',
      type: 'symbol',
      source: 'route-markers',
      layout: {
        'text-field': ['get', 'title'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-size': 12,
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1,
      },
    });

    // Desenha linha da rota se houver pelo menos 2 marcos
    if (currentRoute.marcos.length >= 2) {
      const sortedMarcos = [...currentRoute.marcos].sort((a, b) => {
        const order = { inicio: 0, meio: 1, fim: 2 };
        return order[a.type] - order[b.type];
      });

      const coordinates = sortedMarcos.map((marco) => [marco.lng, marco.lat]);

      map.current.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': currentRoute.color,
          'line-width': 4,
        },
      });
    }

    // Ajusta o zoom para mostrar todos os marcos
    const bounds = new (window as any).mapboxgl.LngLatBounds();
    currentRoute.marcos.forEach((marco) => {
      bounds.extend([marco.lng, marco.lat]);
    });

    if (currentRoute.marcos.length > 1) {
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (currentRoute.marcos.length === 1) {
      map.current.setCenter([currentRoute.marcos[0].lng, currentRoute.marcos[0].lat]);
      map.current.setZoom(16);
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
          map.current.setCenter([longitude, latitude]);
          map.current.setZoom(16);

          // Remove marcador anterior se existir
          if (currentLocationMarker) {
            currentLocationMarker.remove();
          }

          // Adiciona novo marcador
          import('mapbox-gl').then((mapboxgl) => {
            const marker = new mapboxgl.default.Marker({
              color: '#22d3ee', // cyan-400
            })
              .setLngLat([longitude, latitude])
              .setPopup(
                new mapboxgl.default.Popup().setHTML('<h3>Minha Localização</h3>')
              )
              .addTo(map.current);

            setCurrentLocationMarker(marker);
          });

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
    if (!searchValue.trim() || !mapboxToken) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchValue
        )}.json?access_token=${mapboxToken}&limit=1`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        map.current?.setCenter([lng, lat]);
        map.current?.setZoom(16);

        toast({
          title: "Endereço encontrado",
          description: data.features[0].place_name
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

  if (!mapboxToken) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Configure o Mapbox</h2>
          <p className="text-muted-foreground">
            Configure seu token do Mapbox na sidebar para começar a usar o mapa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Barra de busca */}
      <div className="p-4 border-b bg-background">
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Digite um endereço para buscar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
          />
          <Button onClick={searchAddress}>Buscar</Button>
          <Button variant="outline" onClick={getCurrentLocation}>
            Minha Localização
          </Button>
        </div>
      </div>

      {/* Container do mapa */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
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
