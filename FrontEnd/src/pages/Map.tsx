import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router';

// Define types
type RecyclableType = 'plastik' | 'metal' | 'glass' | 'papier' | 'unknown';

interface LocationPin {
  id: string;
  location: [number, number]; // [latitude, longitude]
  type: RecyclableType;
  description?: string;
}

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
  const [locations, setLocations] = useState<LocationPin[]>([]);
  const [searchParams] = useSearchParams();
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);

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
      // Mock API call
      fetch(`http://localhost:8000/bins?lat=${lat}&long=${long}&category=${category}`)
        .then(response => {
          console.log(response)
          return response.json()
        })
        .then(data => {
          console.log(data)
          setLocations(data)})
        .catch(error => console.error('Error fetching locations:', error));
    }
  }, [lat, long, category]);

  const getPinColor = (type: RecyclableType): string => {
    switch (type) {
      case 'plastik': return 'yellow';
      case 'metal': return 'red';
      case 'glass': return 'green';
      case 'papier': return 'blue';
      case 'unknown':
      default: return 'gray';
    }
  };

  const createPinIcon = (type: RecyclableType) => {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${getPinColor(type)}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    });
  };

  return (
    <div className="relative h-screen w-screen">
      <Button 
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 z-[10000] bg-white"
        aria-label="Go back"
      >
        Back
      </Button>
      
      {lat !== null && long !== null && (
        <MapContainer 
          center={[lat, long]} 
          zoom={100} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {locations.map((i, pin) => (
            <Marker 
              key={i}
              position={[pin[0], pin[1]]} 
              icon={createDotIcon(pin[2])}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg capitalize">{pin.type}</h3>
                  {pin.description && <p className="mt-1">{pin.description}</p>}
                  <p className="mt-1">Latitude: {pin.location[0]}</p>
                  <p>Longitude: {pin.location[1]}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {lat  && long && (
          <Marker position={[lat, long]} icon={createUserLocationIcon()}>
            <Popup>Twoja aktualna lokalizacja</Popup>
          </Marker>
        )}
        </MapContainer>
      )}
      
      {/* <div className="absolute bottom-4 right-4 z-10 p-4 bg-white rounded-md shadow-lg border border-black transform translate-x-2 translate-y-2">
        <h3 className="font-bold mb-2">Legend</h3>
        <ul className="space-y-1">
          {(['plastik', 'metal', 'glass', 'papier', 'unknown'] as RecyclableType[]).map(type => (
            <li key={type} className="flex items-center">
              <span 
                className="inline-block w-4 h-4 mr-2 rounded-full"
                style={{ backgroundColor: getPinColor(type) }}
              />
              <span className="capitalize">{type}</span>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default RecyclablesMap;
