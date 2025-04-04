import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/leaflet.css';
//import polyline from '@mapbox/polyline';

type RecyclableType = 'plastik' | 'metal' | 'glass' | 'papier' | 'unknown';

interface LocationPin {
  id: string;
  location: [number, number];
  type: RecyclableType;
}

const krakowLocations: LocationPin[] = [
  { id: '1', location: [50.06143, 19.93658], type: 'plastik' },
  { id: '2', location: [50.06465, 19.94498], type: 'metal' },
  { id: '3', location: [50.05457, 19.92645], type: 'glass' },
  { id: '4', location: [50.06647, 19.91368], type: 'papier' }
];

function decodePolyline(encoded: string): [number, number][] {
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
}

const createDotIcon = (color: string) => {
  return new L.DivIcon({
    className: '', 
    html: `<div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
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
  const [locations] = useState<LocationPin[]>(krakowLocations);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [addresses, setAddresses] = useState<Record<string, string>>({});
    const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
    const [nearestBin, setNearestBin] = useState<LocationPin | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [loadingRoute, setLoadingRoute] = useState<boolean>(false);
  
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
  
    const findNearestBin = async (userLoc: [number, number]) => {
      setLoadingRoute(true);
      try {
        let minDistance = Infinity;
        let closestBin: LocationPin | null = null;
        
        // Pobierz odległości dla wszystkich śmietników
        const distances = await Promise.all(
          locations.map(async (bin) => ({
            bin,
            distance: await getRouteDistance(userLoc, bin.location)
          }))
        );
  
        // Znajdź najbliższy śmietnik
        distances.forEach(({ bin, distance }) => {
          if (distance < minDistance) {
            minDistance = distance;
            closestBin = bin;
          }
        });
  
        if (closestBin) {
          const coords = await getRouteCoordinates(userLoc, closestBin.location);
          setRouteCoordinates(coords);
          setNearestBin(closestBin);
        }
      } finally {
        setLoadingRoute(false);
      }
    };
  
    useEffect(() => {
      if (userLocation) {
        findNearestBin(userLocation);
      }
    }, [userLocation]);


  const krakowCenter: [number, number] = [50.06143, 19.93658];

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const newAddresses: Record<string, string> = {};
        for (const loc of krakowLocations) {
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
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
      (error) => console.error("Błąd lokalizacji: ", error.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const getPinColor = (type: RecyclableType): string => {
    const colors = {
      plastik: '#FFD700', // Gold
      metal: '#FF4500',   // OrangeRed
      glass: '#32CD32',   // LimeGreen
      papier: '#1E90FF',  // DodgerBlue
      unknown: '#A9A9A9'  // DarkGray
    };
    return colors[type] || colors.unknown;
  };
    
  return (
    <div className="relative h-screen w-screen">
      <MapContainer center={krakowCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Renderowanie śmietników */}
        {locations.map((pin) => (
          <Marker
            key={pin.id}
            position={pin.location}
            icon={createDotIcon(getPinColor(pin.type))}
          >
            <Popup>
              <h3 className="font-bold text-lg capitalize">{pin.type}</h3>
              {loadingAddresses ? <p>Ładowanie adresu...</p> : <p>{addresses[pin.id]}</p>}
            </Popup>
          </Marker>
        ))}

        {/* Lokalizacja użytkownika */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationIcon()}>
            <Popup>Twoja aktualna lokalizacja</Popup>
          </Marker>
        )}

        {/* Renderowanie trasy */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#3B82F6"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Informacja o ładowaniu */}
        {loadingRoute && (
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
            Wyszukiwanie najbliższego śmietnika...
          </div>
        )}

        {/* Informacja o najbliższym śmietniku */}
        {nearestBin && !loadingRoute && (
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
            Najbliższy śmietnik ({nearestBin.type}): {addresses[nearestBin.id]}
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default RecyclablesMap;