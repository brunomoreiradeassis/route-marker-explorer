import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Route, Marco, Present, Credenciado, MapTileType } from '../types/map';
import MapContextMenu from './MapContextMenu';
import ElementContextMenu from './ElementContextMenu';
import RouteInfoCard from './RouteInfoCard';
import StartRaceModal from './StartRaceModal';
import PresentAlert from './PresentAlert';
import MapTypeSelector from './MapTypeSelector';
import EditElementModal from './EditElementModal';
import { useToast } from '@/hooks/use-toast';
import { useRouting } from '../hooks/useRouting';
import L from 'leaflet';
import ProximityAlert from './ProximityAlert';

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
  credenciados: Credenciado[];
  onAddPresent: (present: Omit<Present, 'id'>) => void;
  onAddCredenciado: (credenciado: Omit<Credenciado, 'id'>) => void;
  onCollectPresent: (presentId: string) => void;
  onUpdateMarco?: (marco: Marco) => void;
  onUpdatePresent?: (present: Present) => void;
  onUpdateCredenciado?: (credenciado: Credenciado) => void;
  onDeleteMarco?: (marcoId: string) => void;
  onDeletePresent?: (presentId: string) => void;
  onDeleteCredenciado?: (credenciadoId: string) => void;
  onCloneMarco?: (marco: Marco) => void;
  onClonePresent?: (present: Present) => void;
  onCloneCredenciado?: (credenciado: Credenciado) => void;
}

const MapView: React.FC<MapViewProps> = ({
  currentRoute,
  onAddMarco,
  presents,
  credenciados,
  onAddPresent,
  onAddCredenciado,
  onCollectPresent,
  onUpdateMarco,
  onUpdatePresent,
  onUpdateCredenciado,
  onDeleteMarco,
  onDeletePresent,
  onDeleteCredenciado,
  onCloneMarco,
  onClonePresent,
  onCloneCredenciado,
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
  const [elementContextMenu, setElementContextMenu] = useState<{
    x: number;
    y: number;
    element: {
      type: 'marco' | 'present' | 'route' | 'credenciado';
      id: string;
      data: Marco | Present | Route | Credenciado;
    };
  } | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<L.Marker | null>(null);
  const [routeMarkers, setRouteMarkers] = useState<L.Marker[]>([]);
  const [presentMarkers, setPresentMarkers] = useState<L.Marker[]>([]);
  const [credenciadoMarkers, setCredenciadoMarkers] = useState<L.Marker[]>([]);
  const [routePath, setRoutePath] = useState<L.Polyline | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showStartRaceModal, setShowStartRaceModal] = useState(false);
  const [raceStarted, setRaceStarted] = useState(false);
  const [nearbyPresent, setNearbyPresent] = useState<Present | null>(null);
  const [mapTileType, setMapTileType] = useState<MapTileType>('openstreetmap');
  const [tileLayer, setTileLayer] = useState<L.TileLayer | null>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    element: { type: 'marco' | 'present' | 'credenciado'; data: Marco | Present | Credenciado } | null;
    editType: 'location' | 'info';
  }>({
    isOpen: false,
    element: null,
    editType: 'info'
  });
  
  // New state for proximity alerts
  const [proximityAlerts, setProximityAlerts] = useState<{
    type: 'marco' | 'present' | 'credenciado';
    name: string;
    distance: number;
    id: string;
    subtype?: string;
    lat?: number;
    lng?: number;
  }[]>([]);
  
  const { toast } = useToast();
  const { routeInfo, isLoading, calculateRoute } = useRouting();

  // Função para focar em um elemento - movida para o início
  const focusOnElement = useCallback((lat: number, lng: number, zoom: number = 18) => {
    if (map.current) {
      map.current.setView([lat, lng], zoom, { animate: true });
    }
  }, []);

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

  // Handler functions
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
      type: 'bonus',
      lat: contextMenu.lat,
      lng: contextMenu.lng,
    });

    setContextMenu(null);
  }, [contextMenu, onAddPresent]);

  const handleAddCredenciado = useCallback(() => {
    if (!contextMenu) return;

    const credenciadoName = `Estabelecimento ${Date.now()}`;
    
    onAddCredenciado({
      name: credenciadoName,
      description: 'Um estabelecimento credenciado!',
      type: 'restaurante',
      lat: contextMenu.lat,
      lng: contextMenu.lng,
      discount: '10% de desconto',
    });

    setContextMenu(null);
  }, [contextMenu, onAddCredenciado]);

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

  const handleStartRace = useCallback(() => {
    setRaceStarted(true);
    setShowStartRaceModal(false);
    
    toast({
      title: "Corrida iniciada!",
      description: "Boa sorte na sua jornada!",
      variant: "default"
    });
  }, [toast]);

  // Função para obter URL do tile layer
  const getTileLayerUrl = (type: MapTileType): { url: string; attribution: string; maxZoom: number } => {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          maxZoom: 17
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19
        };
      case 'watercolor':
        return {
          url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 16
        };
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        };
    }
  };

  // Atualiza o tile layer quando o tipo muda
  useEffect(() => {
    if (!map.current) return;

    if (tileLayer) {
      map.current.removeLayer(tileLayer);
    }

    const { url, attribution, maxZoom } = getTileLayerUrl(mapTileType);
    const newTileLayer = L.tileLayer(url, {
      attribution,
      maxZoom
    }).addTo(map.current);

    setTileLayer(newTileLayer);
  }, [mapTileType]);

  // Verifica proximidade com todos os elementos
  useEffect(() => {
    if (!currentLocation) return;
    
    const newProximityAlerts: {
      type: 'marco' | 'present' | 'credenciado';
      name: string;
      distance: number;
      id: string;
      subtype?: string;
      lat?: number;
      lng?: number;
    }[] = [];

    // Check proximity to marcos
    if (currentRoute) {
      currentRoute.marcos.forEach(marco => {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          marco.lat,
          marco.lng
        );

        // Add alerts for different distances: 5km, 2km, 1km, 200m
        if (distance <= 5000) {
          newProximityAlerts.push({
            type: 'marco',
            name: marco.name,
            distance: distance,
            id: marco.id,
            subtype: marco.type,
            lat: marco.lat,
            lng: marco.lng
          });
        }
      });
    }

    // Check proximity to presents
    presents.forEach(present => {
      if (present.collected) return;
      
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        present.lat,
        present.lng
      );
      
      if (distance <= 5000) {
        newProximityAlerts.push({
          type: 'present',
          name: present.name,
          distance: distance,
          id: present.id,
          subtype: present.type,
          lat: present.lat,
          lng: present.lng
        });
      }
    });

    // Check proximity to credenciados
    credenciados.forEach(credenciado => {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        credenciado.lat,
        credenciado.lng
      );
      
      if (distance <= 5000) {
        newProximityAlerts.push({
          type: 'credenciado',
          name: credenciado.name,
          distance: distance,
          id: credenciado.id,
          subtype: credenciado.type,
          lat: credenciado.lat,
          lng: credenciado.lng
        });
      }
    });
    
    // Sort by distance
    newProximityAlerts.sort((a, b) => a.distance - b.distance);
    
    // Update state
    setProximityAlerts(newProximityAlerts);
    
  }, [currentLocation, currentRoute, presents, credenciados, calculateDistance]);

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

      // Adiciona tile layer inicial
      const { url, attribution, maxZoom } = getTileLayerUrl(mapTileType);
      const initialTileLayer = L.tileLayer(url, {
        attribution,
        maxZoom
      }).addTo(map.current);
      setTileLayer(initialTileLayer);

      // Event listener para clique direito
      map.current.on('contextmenu', (e: L.LeafletMouseEvent) => {
        const containerPoint = map.current!.latLngToContainerPoint(e.latlng);
        setContextMenu({
          x: containerPoint.x,
          y: containerPoint.y,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
        setElementContextMenu(null);
      });

      // Fecha o menu de contexto ao clicar no mapa
      map.current.on('click', () => {
        setContextMenu(null);
        setElementContextMenu(null);
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

  // Atualiza marcadores de presentes - ALWAYS show them with better popups
  useEffect(() => {
    if (!map.current) return;

    // Remove marcadores existentes de presentes
    presentMarkers.forEach(marker => {
      map.current?.removeLayer(marker);
    });

    // Adiciona novos marcadores de presentes
    const newPresentMarkers: L.Marker[] = [];
    presents.forEach((present) => {
      console.log('Adicionando presente:', present.name, present.lat, present.lng);
      
      const markerColor = present.collected ? '#94a3b8' : '#eab308';
      const marker = L.marker([present.lat, present.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;">🎁</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map.current!);

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${present.name}</h3>
          <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">${present.description}</p>
          <div style="margin: 4px 0;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; ${present.collected ? 'background-color: #f3f4f6; color: #6b7280;' : 'background-color: #fef3c7; color: #92400e;'}">${present.collected ? 'Coletado' : 'Disponível'}</span>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            Tipo: ${present.type === 'bonus' ? 'Bônus' : present.type === 'checkpoint' ? 'Checkpoint' : 'Especial'}
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        focusOnElement(present.lat, present.lng);
      });

      marker.on('contextmenu', (e) => {
        const containerPoint = map.current!.latLngToContainerPoint(e.latlng);
        setElementContextMenu({
          x: containerPoint.x,
          y: containerPoint.y,
          element: {
            type: 'present',
            id: present.id,
            data: present
          }
        });
        setContextMenu(null);
        L.DomEvent.stopPropagation(e);
      });

      newPresentMarkers.push(marker);
    });

    setPresentMarkers(newPresentMarkers);
  }, [presents, focusOnElement]);

  // Atualiza marcadores de credenciados - ALWAYS show them with better popups
  useEffect(() => {
    if (!map.current) return;

    // Remove marcadores existentes de credenciados
    credenciadoMarkers.forEach(marker => {
      map.current?.removeLayer(marker);
    });

    // Adiciona novos marcadores de credenciados
    const newCredenciadoMarkers: L.Marker[] = [];
    credenciados.forEach((credenciado) => {
      const markerColor = getCredenciadoColor(credenciado.type);
      const markerIcon = getCredenciadoIcon(credenciado.type);
      
      const marker = L.marker([credenciado.lat, credenciado.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer;">${markerIcon}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(map.current!);

      const popupContent = `
        <div style="min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${credenciado.name}</h3>
          <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">${credenciado.description}</p>
          ${credenciado.discount ? `<div style="margin: 4px 0; padding: 4px 8px; background-color: #d1fae5; border-radius: 6px; border: 1px solid #10b981;"><span style="color: #065f46; font-weight: bold; font-size: 13px;">💰 ${credenciado.discount}</span></div>` : ''}
          ${credenciado.phone ? `<div style="margin: 4px 0; color: #374151; font-size: 13px;"><span style="font-weight: 500;">📞</span> ${credenciado.phone}</div>` : ''}
          ${credenciado.address ? `<div style="margin: 4px 0; color: #374151; font-size: 13px;"><span style="font-weight: 500;">📍</span> ${credenciado.address}</div>` : ''}
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            Categoria: ${getCredenciadoTypeName(credenciado.type)}
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        focusOnElement(credenciado.lat, credenciado.lng);
      });

      marker.on('contextmenu', (e) => {
        const containerPoint = map.current!.latLngToContainerPoint(e.latlng);
        setElementContextMenu({
          x: containerPoint.x,
          y: containerPoint.y,
          element: {
            type: 'credenciado',
            id: credenciado.id,
            data: credenciado
          }
        });
        setContextMenu(null);
        L.DomEvent.stopPropagation(e);
      });

      newCredenciadoMarkers.push(marker);
    });

    setCredenciadoMarkers(newCredenciadoMarkers);
  }, [credenciados, focusOnElement]);

  // Atualiza marcadores e rota quando a rota atual muda - com popups melhorados
  useEffect(() => {
    if (!map.current) return;

    // Remove marcadores existentes da rota
    routeMarkers.forEach(marker => marker.remove());
    if (routePath) {
      routePath.remove();
    }

    // Se não há rota selecionada, não adiciona marcadores
    if (!currentRoute || currentRoute.marcos.length === 0) {
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
          html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map.current!);

      const popupContent = `
        <div style="min-width: 180px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${marco.name}</h3>
          <div style="margin: 4px 0;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background-color: ${markerColor}20; color: ${markerColor};">${getMarcoTypeName(marco.type)}</span>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            Rota: ${currentRoute.name}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        focusOnElement(marco.lat, marco.lng);
      });

      marker.on('contextmenu', (e) => {
        const containerPoint = map.current!.latLngToContainerPoint(e.latlng);
        setElementContextMenu({
          x: containerPoint.x,
          y: containerPoint.y,
          element: {
            type: 'marco',
            id: marco.id,
            data: marco
          }
        });
        setContextMenu(null);
        L.DomEvent.stopPropagation(e);
      });

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

          // Adiciona event listener para foco na rota
          polyline.on('click', () => {
            const bounds = polyline.getBounds();
            map.current!.fitBounds(bounds, { padding: [20, 20] });
          });

          polyline.on('contextmenu', (e) => {
            const containerPoint = map.current!.latLngToContainerPoint(e.latlng);
            setElementContextMenu({
              x: containerPoint.x,
              y: containerPoint.y,
              element: {
                type: 'route',
                id: currentRoute.id,
                data: currentRoute
              }
            });
            setContextMenu(null);
            L.DomEvent.stopPropagation(e);
          });

          setRoutePath(polyline);

          const group = new L.FeatureGroup([...newMarkers, polyline]);
          map.current!.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      });
    } else if (currentRoute.marcos.length === 1) {
      focusOnElement(currentRoute.marcos[0].lat, currentRoute.marcos[0].lng, 16);
    }
  }, [currentRoute, calculateRoute, focusOnElement]);

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

  const getCredenciadoColor = (type: string) => {
    switch (type) {
      case 'restaurante':
        return '#f97316';
      case 'posto':
        return '#eab308';
      case 'farmacia':
        return '#22c55e';
      case 'supermercado':
        return '#3b82f6';
      case 'hotel':
        return '#8b5cf6';
      case 'pousada':
        return '#ec4899';
      case 'academia':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCredenciadoIcon = (type: string) => {
    switch (type) {
      case 'restaurante':
        return '🍽️';
      case 'posto':
        return '⛽';
      case 'farmacia':
        return '💊';
      case 'supermercado':
        return '🛒';
      case 'hotel':
        return '🏨';
      case 'pousada':
        return '🏠';
      case 'academia':
        return '💪';
      default:
        return '🏪';
    }
  };

  const getCredenciadoTypeName = (type: string) => {
    switch (type) {
      case 'restaurante':
        return 'Restaurante';
      case 'posto':
        return 'Posto de Combustível';
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
      // Check if the search value looks like a CEP (Brazilian postal code)
      const isCEP = /^[0-9]{5}-?[0-9]{3}$/.test(searchValue);
      
      let queryString = searchValue;
      
      // If it's a CEP, add "Brazil" to make the search more precise
      if (isCEP) {
        // Format CEP if needed
        const formattedCEP = searchValue.replace(/[^0-9]/g, '');
        queryString = `${formattedCEP}, Brazil`;
      }
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryString)}&limit=1`
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

  // Handlers para elementos
  const handleElementEdit = useCallback((type: 'location' | 'info') => {
    if (elementContextMenu) {
      setEditModal({
        isOpen: true,
        element: {
          type: elementContextMenu.element.type as 'marco' | 'present' | 'credenciado',
          data: elementContextMenu.element.data as Marco | Present | Credenciado
        },
        editType: type
      });
      setElementContextMenu(null);
    }
  }, [elementContextMenu]);

  const handleElementDelete = useCallback(() => {
    if (!elementContextMenu) return;

    const { element } = elementContextMenu;
    
    if (element.type === 'marco' && onDeleteMarco) {
      onDeleteMarco(element.id);
    } else if (element.type === 'present' && onDeletePresent) {
      onDeletePresent(element.id);
    } else if (element.type === 'credenciado' && onDeleteCredenciado) {
      onDeleteCredenciado(element.id);
    }
    
    setElementContextMenu(null);
    
    toast({
      title: `${element.type === 'marco' ? 'Marco' : element.type === 'present' ? 'Presente' : 'Credenciado'} removido`,
      description: "Item removido com sucesso!"
    });
  }, [elementContextMenu, onDeleteMarco, onDeletePresent, onDeleteCredenciado, toast]);

  const handleElementClone = useCallback(() => {
    if (!elementContextMenu) return;

    const { element } = elementContextMenu;
    
    if (element.type === 'marco' && onCloneMarco) {
      onCloneMarco(element.data as Marco);
    } else if (element.type === 'present' && onClonePresent) {
      onClonePresent(element.data as Present);
    } else if (element.type === 'credenciado' && onCloneCredenciado) {
      onCloneCredenciado(element.data as Credenciado);
    }
    
    setElementContextMenu(null);
    
    toast({
      title: `${element.type === 'marco' ? 'Marco' : element.type === 'present' ? 'Presente' : 'Credenciado'} clonado`,
      description: "Item clonado com sucesso!"
    });
  }, [elementContextMenu, onCloneMarco, onClonePresent, onCloneCredenciado, toast]);

  const handleSaveElement = useCallback((updatedElement: Marco | Present | Credenciado) => {
    if (editModal.element?.type === 'marco' && onUpdateMarco) {
      onUpdateMarco(updatedElement as Marco);
    } else if (editModal.element?.type === 'present' && onUpdatePresent) {
      onUpdatePresent(updatedElement as Present);
    } else if (editModal.element?.type === 'credenciado' && onUpdateCredenciado) {
      onUpdateCredenciado(updatedElement as Credenciado);
    }
    
    toast({
      title: "Elemento atualizado",
      description: "Alterações salvas com sucesso!"
    });
  }, [editModal.element, onUpdateMarco, onUpdatePresent, onUpdateCredenciado, toast]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Barra de busca */}
      <div className="p-2 sm:p-4 border-b bg-background shrink-0">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Input
            placeholder="Digite um endereço ou CEP para buscar..."
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
        
        {/* Top controls container - positioned side by side */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex gap-2">
          {/* Proximity Alerts - on the left */}
          {proximityAlerts.length > 0 && (
            <div className="w-48 sm:w-64">
              <ProximityAlert 
                alerts={proximityAlerts} 
                onFocus={(lat, lng) => focusOnElement(lat, lng)} 
              />
            </div>
          )}
          
          {/* Map Type Selector - on the right */}
          <div className="w-48 sm:w-64">
            <MapTypeSelector
              currentType={mapTileType}
              onTypeChange={setMapTileType}
            />
          </div>
        </div>
        
        {/* Menu de contexto do mapa */}
        {contextMenu && (
          <MapContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            lat={contextMenu.lat}
            lng={contextMenu.lng}
            onAddMarco={handleAddMarco}
            onAddPresent={handleAddPresent}
            onAddCredenciado={handleAddCredenciado}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Menu de contexto de elementos */}
        {elementContextMenu && (
          <ElementContextMenu
            x={elementContextMenu.x}
            y={elementContextMenu.y}
            element={elementContextMenu.element}
            onEdit={handleElementEdit}
            onDelete={handleElementDelete}
            onClone={handleElementClone}
            onClose={() => setElementContextMenu(null)}
          />
        )}

        {/* Modal de edição */}
        <EditElementModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, element: null, editType: 'info' })}
          element={editModal.element}
          editType={editModal.editType}
          onSave={handleSaveElement}
        />

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
