import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type RecyclableType = 'plastik' | 'metal' | 'glass' | 'papier' | 'unknown';

interface LocationPin {
  id: string;
  location: [number, number];
  type: RecyclableType;
}

const krakowLocations: LocationPin[] = [
  { id: '1', location: [50.06143, 19.93658], type: 'plastik' }, // Rynek Główny
  { id: '2', location: [50.06465, 19.94498], type: 'metal' },   // Wawel
  { id: '3', location: [50.05457, 19.92645], type: 'glass' },  // Kazimierz
  { id: '4', location: [50.06647, 19.91368], type: 'papier' }  // Nowa Huta
];

const createDotIcon = (color: string) => {
  return new L.DivIcon({
    className: '', // Upewniamy się, że Leaflet nie dodaje domyślnych styli
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
      <MapContainer 
        center={krakowCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        
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
        
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationIcon()}>
            <Popup>Twoja aktualna lokalizacja</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default RecyclablesMap;