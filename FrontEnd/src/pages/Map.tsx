import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { useSearchParams, useNavigate } from 'react-router';

// Define types
type RecyclableType = 'plastik' | 'metal' | 'glass' | 'papier' | 'unknown';

interface LocationPin {
  id?: string;
  location?: [number, number]; // [latitude, longitude]
  type?: RecyclableType;
  description?: string;
  // Support for array format from API
  0?: number; // latitude
  1?: number; // longitude
  2?: string; // type
}

const COLORS_MAP = {
  glass: "#4CAF50",       // Green
  paper: "#2196F3",      // Blue
  plastic: "#febe34",    // Amber
  metal: "#d33f3d",      // Grey
  organic: "#6b605c",    // Brown
  glass_bottles: "#51b150",  // Light Green
  plastic_bottles: "#febe34", // Orange
  waste_basket: "#000000",   // Red
  container: "#000000",      // Blue Grey
  plastik: '#FFD700',        // Yellow
  papier: '#1E90FF',         // Blue
  unknown: '#A9A9A9'         // Gray
};

const createDotIcon = (color: string) => {
  color = COLORS_MAP[color] || color;
  return new L.DivIcon({
    className: '', // Ensure Leaflet doesn't add default styles
    html: `<div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
      z-index: 10000;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const createUserLocationIcon = () => {
  return new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const RecyclablesMap: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationPin[]>([]);
  const [searchParams] = useSearchParams();
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
  const [selectedBin, setSelectedBin] = useState<LocationPin | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  useEffect(() => {
    const latParam = searchParams.get('lat');
    const longParam = searchParams.get('long');
    const categoryParam = searchParams.get('category');

    if (latParam && longParam) {
      setLat(parseFloat(latParam));
      setLong(parseFloat(longParam));
    }
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (lat !== null && long !== null) {
      // API call to fetch locations
      fetch(`http://localhost:8000/bins?lat=${lat}&long=${long}&category=${category}`)
        .then(response => response.json())
        .then(data => {
          // Transform API data to LocationPin format if needed
          const formattedData = data.map((item: any, index: number) => ({
            id: `api-${index}`,
            location: [item[0], item[1]] as [number, number],
            type: item[2] as RecyclableType,
            0: item[0],
            1: item[1],
            2: item[2]
          }));
          setLocations(formattedData);
          fetchAddresses(formattedData);
        })
        .catch(error => console.error('Error fetching locations:', error));
    }
  }, [lat, long, category]);

  const fetchAddresses = async (locs: LocationPin[]) => {
    try {
      const newAddresses: Record<string, string> = {};
      for (const loc of locs) {
        if (!loc.id || !loc.location) continue;
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.location[0]}&lon=${loc.location[1]}&zoom=18&addressdetails=1&accept-language=pl`
        );
        const data = await response.json();
        newAddresses[loc.id] = data.display_name || 'Nie można pobrać adresu';
      }
      setAddresses(newAddresses);
    } catch (error) {
      console.error('Błąd pobierania adresów:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Polyline decoder for route visualization
  const decodePolyline = (encoded: string): [number, number][] => {
    if (!encoded) return [];
    
    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    
    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte;
      
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      
      const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += deltaLat;

      shift = 0;
      result = 0;
      
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      
      const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += deltaLng;

      points.push([lat * 1e-5, lng * 1e-5] as [number, number]);
    }
    
    return points;
  };

  // Getting route distance between two points
  const getRouteDistance = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=false`
      );
      const data = await response.json();
      return data.routes?.[0]?.distance || Infinity;
    } catch (error) {
      console.error('Błąd pobierania trasy:', error);
      return Infinity;
    }
  };

  // Getting route coordinates for visualization
  const getRouteCoordinates = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full`
      );
      const data = await response.json();
      return decodePolyline(data.routes?.[0]?.geometry);
    } catch (error) {
      console.error('Błąd pobierania geometrii trasy:', error);
      return [];
    }
  };

  // Find nearest bin from user location
  const findNearestBin = async (userLoc: [number, number]) => {
    if (locations.length === 0) return;
    
    setLoadingRoute(true);
    try {
      let minDistance = Infinity;
      let closestBin: LocationPin | null = null;
      
      const distances = await Promise.all(
        locations.map(async (bin) => {
          const binLocation: [number, number] = bin.location || [bin[0], bin[1]];
          return {
            bin,
            distance: await getRouteDistance(userLoc, binLocation)
          };
        })
      );

      distances.forEach(({ bin, distance }) => {
        if (distance < minDistance) {
          minDistance = distance;
          closestBin = bin;
        }
      });

      if (closestBin) {
        const binLocation: [number, number] = closestBin.location || [closestBin[0], closestBin[1]];
        const coords = await getRouteCoordinates(userLoc, binLocation);
        setRouteCoordinates(coords);
        setSelectedBin(closestBin);
      }
    } finally {
      setLoadingRoute(false);
    }
  };

  // Handle bin click to show route
  const handleBinClick = async (bin: LocationPin) => {
    if (!lat || !long) return;
    const userLoc: [number, number] = [lat, long];
    
    setLoadingRoute(true);
    try {
      const binLocation: [number, number] = bin.location || [bin[0], bin[1]];
      const coords = await getRouteCoordinates(userLoc, binLocation);
      setRouteCoordinates(coords);
      setSelectedBin(bin);
    } finally {
      setLoadingRoute(false);
    }
  };

  const getPinColor = (type: string): string => {
    return COLORS_MAP[type] || COLORS_MAP.unknown;
  };

  return (
    <div className="relative h-screen w-screen">
      <Button 
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-[10000] bg-white"
        aria-label="Go back"
      >
        <b>Powrót</b>
      </Button>
      
      {lat !== null && long !== null && (
        <MapContainer 
          zoomControl={false} 
          center={[lat, long]} 
          zoom={16} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />
          
          {locations.map((pin, i) => {
            // Get location in consistent format
            const pinLoc: [number, number] = pin.location || [pin[0], pin[1]];
            const pinType = pin.type || pin[2];
            const pinId = pin.id || `pin-${i}`;
            
            return (
              <Marker 
                key={pinId}
                position={pinLoc} 
                icon={createDotIcon(pinType)}
                eventHandlers={{
                  click: () => handleBinClick(pin),
                }}
              >
                <Popup>
                  <h3 className="font-bold text-lg capitalize">{pinType}</h3>
                  {loadingAddresses ? 
                    <p>Ładowanie adresu...</p> : 
                    <p>{addresses[pinId] || 'Adres niedostępny'}</p>
                  }
                  {selectedBin && 
                   (selectedBin.id === pinId || 
                    (selectedBin[0] === pin[0] && selectedBin[1] === pin[1])) && (
                    <p className="text-blue-600 font-semibold">Wyznaczona trasa</p>
                  )}
                </Popup>
              </Marker>
            );
          })}

          {lat && long && (
            <Marker position={[lat, long]} icon={createUserLocationIcon()}>
              <Popup>Twoja aktualna lokalizacja</Popup>
            </Marker>
          )}
          
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              color="#3B82F6"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      )}
      
      {loadingRoute && (
        <div className="absolute bottom-4 left-4 z-[10000] bg-white p-4 rounded-lg shadow-lg">
          Wyszukiwanie trasy...
        </div>
      )}

      {selectedBin && !loadingRoute && (
        <div className="absolute bottom-4 left-4 z-[10000] bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-bold">Wybrany śmietnik:</h3>
          <p className="capitalize">{selectedBin.type || selectedBin[2]}</p>
          {selectedBin.id && addresses[selectedBin.id] && (
            <p>{addresses[selectedBin.id]}</p>
          )}
          <button 
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => lat && long && findNearestBin([lat, long])}
          >
            Pokaż najbliższy
          </button>
        </div>
      )}
      
      {lat && long && !selectedBin && !loadingRoute && (
        <button 
          className="absolute bottom-4 left-4 z-[10000] bg-white p-4 rounded-lg shadow-lg mt-2 bg-blue-500 text-white px-3 py-1"
          onClick={() => findNearestBin([lat, long])}
        >
          Znajdź najbliższy śmietnik
        </button>
      )}
    </div>
  );
};

export default RecyclablesMap;