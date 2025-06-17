
import { useState, useCallback } from 'react';
import { Marco } from '../types/map';
import { useToast } from '@/hooks/use-toast';

interface RouteInfo {
  distance: number;
  duration: number;
  geometry: [number, number][];
}

export const useRouting = () => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const calculateRoute = useCallback(async (marcos: Marco[]) => {
    if (marcos.length < 2) {
      setRouteInfo(null);
      return null;
    }

    setIsLoading(true);
    
    try {
      // Ordena os marcos por tipo (início -> meio -> fim)
      const sortedMarcos = [...marcos].sort((a, b) => {
        const order = { inicio: 0, meio: 1, fim: 2 };
        return order[a.type] - order[b.type];
      });

      // Prepara as coordenadas para a API
      const coordinates = sortedMarcos.map(marco => [marco.lng, marco.lat]);
      
      // Chama a API do OpenRouteService
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Authorization': '5b3ce3597851110001cf624841f2508d17d64215b3fbcd436a1283f9',
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          coordinates: coordinates,
          format: 'geojson'
        })
      });

      if (!response.ok) {
        // Fallback para linha reta se a API falhar
        console.log('API de roteamento não disponível, usando linha reta');
        const straightLineDistance = calculateStraightLineDistance(sortedMarcos);
        const estimatedDuration = straightLineDistance * 2; // Estimativa: 2 segundos por metro
        
        const fallbackInfo: RouteInfo = {
          distance: straightLineDistance,
          duration: estimatedDuration,
          geometry: sortedMarcos.map(marco => [marco.lat, marco.lng])
        };
        
        setRouteInfo(fallbackInfo);
        return fallbackInfo;
      }

      const data = await response.json();
      const route = data.features[0];
      
      const routeData: RouteInfo = {
        distance: route.properties.segments[0].distance,
        duration: route.properties.segments[0].duration,
        geometry: route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) // Inverte lng,lat para lat,lng
      };
      
      setRouteInfo(routeData);
      return routeData;
      
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      
      // Fallback para linha reta
      const sortedMarcos = [...marcos].sort((a, b) => {
        const order = { inicio: 0, meio: 1, fim: 2 };
        return order[a.type] - order[b.type];
      });
      
      const straightLineDistance = calculateStraightLineDistance(sortedMarcos);
      const estimatedDuration = straightLineDistance * 2;
      
      const fallbackInfo: RouteInfo = {
        distance: straightLineDistance,
        duration: estimatedDuration,
        geometry: sortedMarcos.map(marco => [marco.lat, marco.lng])
      };
      
      setRouteInfo(fallbackInfo);
      
      toast({
        title: "Aviso",
        description: "Usando rota em linha reta. Verifique sua conexão com a internet.",
        variant: "default"
      });
      
      return fallbackInfo;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const calculateStraightLineDistance = (marcos: Marco[]): number => {
    let totalDistance = 0;
    
    for (let i = 0; i < marcos.length - 1; i++) {
      const from = marcos[i];
      const to = marcos[i + 1];
      
      // Fórmula de Haversine para calcular distância entre dois pontos
      const R = 6371000; // Raio da Terra em metros
      const φ1 = from.lat * Math.PI / 180;
      const φ2 = to.lat * Math.PI / 180;
      const Δφ = (to.lat - from.lat) * Math.PI / 180;
      const Δλ = (to.lng - from.lng) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      totalDistance += R * c;
    }
    
    return totalDistance;
  };

  return {
    routeInfo,
    isLoading,
    calculateRoute
  };
};
