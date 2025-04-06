import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [selectedBin, setSelectedBin] = useState<LocationPin | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  
  const mapRef = useRef<L.Map | null>(null);
  const isNavigatingRef = useRef(isNavigating);
  const selectedBinRef = useRef(selectedBin);

  const krakowCenter: [number, number] = [50.06143, 19.93658];

  useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  useEffect(() => {
    selectedBinRef.current = selectedBin;
  }, [selectedBin]);

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
      const distance = data.routes?.[0]?.distance || 0;
      const coords = decodePolyline(data.routes?.[0]?.geometry);
      return { coords, distance };
    } catch (error) {
      console.error('Błąd pobierania geometrii trasy:', error);
      return { coords: [], distance: 0 };
    }
  };

  const decodePolyline = (encoded: string): [number, number][] => {
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

  const findNearestBin = async (userLoc: [number, number]) => {
    setLoadingRoute(true);
    try {
      let minDistance = Infinity;
      let closestBin: LocationPin | null = null;
      
      const distances = await Promise.all(
        locations.map(async (bin) => ({
          bin,
          distance: await getRouteDistance(userLoc, bin.location)
        }))
      );

      distances.forEach(({ bin, distance }) => {
        if (distance < minDistance) {
          minDistance = distance;
          closestBin = bin;
        }
      });

      if (closestBin) {
        const { coords, distance } = await getRouteCoordinates(userLoc, closestBin.location);
        setRouteCoordinates(coords);
        setCurrentDistance(distance);
        setSelectedBin(closestBin);
      }
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleBinClick = async (bin: LocationPin) => {
    if (!userLocation) return;
    
    setLoadingRoute(true);
    try {
      const { coords, distance } = await getRouteCoordinates(userLocation, bin.location);
      setRouteCoordinates(coords);
      setCurrentDistance(distance);
      setSelectedBin(bin);
    } finally {
      setLoadingRoute(false);
    }
  };

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
      (position) => {
        const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(newLocation);
        
        if (isNavigatingRef.current && selectedBinRef.current) {
          getRouteCoordinates(newLocation, selectedBinRef.current.location)
            .then(({ coords, distance }) => {
              setRouteCoordinates(coords);
              setCurrentDistance(distance);
              if (mapRef.current) {
                mapRef.current.flyTo(newLocation, mapRef.current.getZoom(), {
                  animate: true,
                  duration: 1
                });
              }
            });
        } else {
          if (!selectedBinRef.current) {
            findNearestBin(newLocation);
          }
        }
      },
      (error) => console.error("Błąd lokalizacji: ", error.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const getPinColor = (type: RecyclableType): string => {
    const colors = {
      plastik: '#FFD700',
      metal: '#FF4500',
      glass: '#32CD32',
      papier: '#1E90FF',
      unknown: '#A9A9A9'
    };
    return colors[type] || colors.unknown;
  };

  return (
    <div className="relative h-screen w-screen">
      <MapContainer 
        center={krakowCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        
        {locations.map((pin) => (
          <Marker 
            key={pin.id}
            position={pin.location} 
            icon={createDotIcon(getPinColor(pin.type))}
            eventHandlers={{
              click: () => handleBinClick(pin),
            }}
          >
            <Popup>
              <h3 className="font-bold text-lg capitalize">{pin.type}</h3>
              {loadingAddresses ? <p>Ładowanie adresu...</p> : <p>{addresses[pin.id]}</p>}
              {selectedBin?.id === pin.id && (
                <p className="text-blue-600 font-semibold">Wyznaczona trasa</p>
              )}
            </Popup>
          </Marker>
        ))}
        
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationIcon()}>
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

        {loadingRoute && (
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
            Wyszukiwanie trasy...
          </div>
        )}

        {selectedBin && !loadingRoute && (
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
            {!isNavigating ? (
              <>
                <h3 className="font-bold">Wybrany śmietnik:</h3>
                <p className="capitalize">{selectedBin.type}</p>
                <p>{addresses[selectedBin.id]}</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => findNearestBin(userLocation!)}
                  >
                    Pokaż najbliższy
                  </button>
                  <button 
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => setIsNavigating(true)}
                  >
                    Start nawigacji
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold">Nawigacja do:</h3>
                <p className="capitalize">{selectedBin.type}</p>
                <p>{addresses[selectedBin.id]}</p>
                <p className="mt-2">Pozostało do przejścia: {(currentDistance / 1000).toFixed(1)} km</p>
                <button 
                  className="mt-2 bg-red-500 text-white px-3 py-1 rounded w-full"
                  onClick={() => setIsNavigating(false)}
                >
                  Zatrzymaj nawigację
                </button>
              </>
            )}
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default RecyclablesMap;